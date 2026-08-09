import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireTeamManager } from "@/lib/team-authorization";

const changeRoleSchema = z.object({
  profile_id: z.string().uuid(),
  business_id: z.string().uuid().optional(),
  new_role: z.enum(["admin", "member"]),
});

function authorizationResponse(
  result: Extract<Awaited<ReturnType<typeof requireTeamManager>>, { ok: false }>,
) {
  return NextResponse.json({ error: result.error }, { status: result.status });
}

/** Promote or demote a member in the authenticated actor's business. */
export async function PATCH(request: NextRequest) {
  try {
    const authorization = await requireTeamManager();
    if (!authorization.ok) return authorizationResponse(authorization);

    const parsed = changeRoleSchema.safeParse(
      await request.json().catch(() => null),
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Valid profile and role values are required" },
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
    const { data: targetProfile } = await admin
      .from("profiles")
      .select("id, role, user_id, business_id")
      .eq("id", parsed.data.profile_id)
      .eq("business_id", authorization.actor.businessId)
      .maybeSingle();

    if (!targetProfile) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 },
      );
    }
    if (targetProfile.role === "owner") {
      return NextResponse.json(
        { error: "The business owner's role cannot be changed" },
        { status: 403 },
      );
    }
    if (targetProfile.user_id === authorization.actor.userId) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 403 },
      );
    }

    const { data, error } = await admin
      .from("profiles")
      .update({
        role: parsed.data.new_role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetProfile.id)
      .eq("business_id", authorization.actor.businessId)
      .select("id, user_id, full_name, role")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Team member role could not be updated" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data,
      message:
        parsed.data.new_role === "admin"
          ? "Team member promoted to Business Manager successfully."
          : "Team member demoted to Member successfully.",
    });
  } catch (error) {
    console.error("Team role update failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/** Remove a member from the authenticated actor's business. */
export async function DELETE(request: NextRequest) {
  try {
    const authorization = await requireTeamManager();
    if (!authorization.ok) return authorizationResponse(authorization);

    const profileId = request.nextUrl.searchParams.get("profile_id");
    const requestedBusinessId = request.nextUrl.searchParams.get("business_id");
    if (!profileId || !z.string().uuid().safeParse(profileId).success) {
      return NextResponse.json(
        { error: "A valid profile id is required" },
        { status: 400 },
      );
    }
    if (
      requestedBusinessId &&
      requestedBusinessId !== authorization.actor.businessId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = getAdminClient();
    const { data: targetProfile } = await admin
      .from("profiles")
      .select("id, role, user_id, business_id")
      .eq("id", profileId)
      .eq("business_id", authorization.actor.businessId)
      .maybeSingle();

    if (!targetProfile) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 },
      );
    }
    if (targetProfile.role === "owner") {
      return NextResponse.json(
        { error: "The business owner cannot be removed" },
        { status: 403 },
      );
    }
    if (targetProfile.user_id === authorization.actor.userId) {
      return NextResponse.json(
        { error: "You cannot remove yourself from the team" },
        { status: 403 },
      );
    }

    const { error } = await admin
      .from("profiles")
      .update({
        business_id: null,
        role: "member",
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetProfile.id)
      .eq("business_id", authorization.actor.businessId);

    if (error) {
      return NextResponse.json(
        { error: "Team member could not be removed" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Team member removed successfully.",
    });
  } catch (error) {
    console.error("Team member removal failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
