import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireTeamManager } from "@/lib/team-authorization";

const inviteSchema = z.object({
  business_id: z.string().uuid().optional(),
  email: z.string().trim().email().max(254),
  role: z.enum(["admin", "member"]),
});

function authorizationResponse(
  result: Extract<Awaited<ReturnType<typeof requireTeamManager>>, { ok: false }>,
) {
  return NextResponse.json({ error: result.error }, { status: result.status });
}

/** List invitations for the authenticated owner/business-manager's business. */
export async function GET(request: NextRequest) {
  try {
    const authorization = await requireTeamManager();
    if (!authorization.ok) return authorizationResponse(authorization);

    const requestedBusinessId = request.nextUrl.searchParams.get("business_id");
    if (
      requestedBusinessId &&
      requestedBusinessId !== authorization.actor.businessId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = getAdminClient();
    const { data, error } = await admin
      .from("team_invitations")
      .select("id, email, role, status, expires_at, created_at")
      .eq("business_id", authorization.actor.businessId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Invitations could not be loaded" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Invitation list failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/** Create an invitation for the authenticated owner/business-manager's business. */
export async function POST(request: NextRequest) {
  try {
    const authorization = await requireTeamManager();
    if (!authorization.ok) return authorizationResponse(authorization);

    const parsed = inviteSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "A valid email and role are required" },
        { status: 400 },
      );
    }

    if (
      parsed.data.business_id &&
      parsed.data.business_id !== authorization.actor.businessId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = getAdminClient();
    const email = parsed.data.email.toLowerCase();
    const businessId = authorization.actor.businessId;

    const { data: existingInvite } = await admin
      .from("team_invitations")
      .select("id")
      .eq("business_id", businessId)
      .eq("email", email)
      .eq("status", "pending")
      .maybeSingle();

    if (existingInvite) {
      return NextResponse.json(
        { error: "A pending invitation already exists for this email" },
        { status: 409 },
      );
    }

    const [currentMembersResult, pendingInvitesResult] = await Promise.all([
      admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId),
      admin
        .from("team_invitations")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("status", "pending"),
    ]);

    const { data: business } = await admin
      .from("businesses")
      .select("plan_id")
      .eq("id", businessId)
      .single();

    if (business?.plan_id) {
      const { data: plan } = await admin
        .from("subscription_plans")
        .select("team_members")
        .eq("id", business.plan_id)
        .single();

      const currentCount = currentMembersResult.count ?? 0;
      const pendingCount = pendingInvitesResult.count ?? 0;
      if (plan && currentCount + pendingCount >= plan.team_members) {
        return NextResponse.json(
          { error: "Team member limit reached" },
          { status: 403 },
        );
      }
    }

    const { data, error } = await admin
      .from("team_invitations")
      .insert({
        business_id: businessId,
        email,
        role: parsed.data.role,
        invited_by: authorization.actor.userId,
      })
      .select("id, email, role, status, expires_at, created_at")
      .single();

    if (error) {
      console.error("Invitation creation failed:", error);
      return NextResponse.json(
        { error: "Invitation could not be created" },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Invitation creation failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/** Cancel an invitation owned by the authenticated actor's business. */
export async function DELETE(request: NextRequest) {
  try {
    const authorization = await requireTeamManager();
    if (!authorization.ok) return authorizationResponse(authorization);

    const id = request.nextUrl.searchParams.get("id");
    if (!id || !z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: "A valid invitation id is required" },
        { status: 400 },
      );
    }

    const admin = getAdminClient();
    const { data, error } = await admin
      .from("team_invitations")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("business_id", authorization.actor.businessId)
      .eq("status", "pending")
      .select("id, email, role, status, expires_at, created_at")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "Invitation could not be cancelled" },
        { status: 500 },
      );
    }
    if (!data) {
      return NextResponse.json(
        { error: "Pending invitation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Invitation cancellation failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
