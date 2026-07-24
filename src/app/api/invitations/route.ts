import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/invitations?business_id=xxx
 * List all invitations for a business (owner/admin only).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("business_id");

    if (!businessId) {
      return NextResponse.json(
        { error: "business_id is required" },
        { status: 400 },
      );
    }

    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from("team_invitations")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/invitations
 * Create a new team invitation (owner/admin only).
 * Body: { business_id, email, role }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business_id, email, role, invited_by } = body;

    if (!business_id || !email || !invited_by) {
      return NextResponse.json(
        { error: "business_id, email, and invited_by are required" },
        { status: 400 },
      );
    }

    if (!role || !["admin", "member"].includes(role)) {
      return NextResponse.json(
        { error: "role must be 'admin' or 'member'" },
        { status: 400 },
      );
    }

    const adminClient = getAdminClient();

    // Check if user already has a profile for this business
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("business_id", business_id)
      .eq("user_id", invited_by)
      .single();

    if (!existingProfile) {
      return NextResponse.json(
        { error: "You are not a member of this business" },
        { status: 403 },
      );
    }

    // Check if there's already a pending invitation for this email in this business
    const { data: existingInvite } = await adminClient
      .from("team_invitations")
      .select("id")
      .eq("business_id", business_id)
      .eq("email", email.toLowerCase().trim())
      .eq("status", "pending")
      .maybeSingle();

    if (existingInvite) {
      return NextResponse.json(
        { error: "A pending invitation already exists for this email" },
        { status: 409 },
      );
    }

    const invitedEmailNormalized = email.toLowerCase().trim();

    // ── Check subscription plan's team_members limit ──
    // Count current members + pending invitations
    const [currentMembersResult, pendingInvitesResult] = await Promise.all([
      adminClient
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("business_id", business_id),
      adminClient
        .from("team_invitations")
        .select("id", { count: "exact", head: true })
        .eq("business_id", business_id)
        .eq("status", "pending"),
    ]);

    const currentCount = currentMembersResult.count || 0;
    const pendingCount = pendingInvitesResult.count || 0;

    // Fetch business plan to get team_members limit
    const { data: business } = await adminClient
      .from("businesses")
      .select("plan_id")
      .eq("id", business_id)
      .single();

    if (business?.plan_id) {
      const { data: plan } = await adminClient
        .from("subscription_plans")
        .select("team_members")
        .eq("id", business.plan_id)
        .single();

      if (plan) {
        const limit = plan.team_members;
        if (currentCount + pendingCount >= limit) {
          return NextResponse.json(
            {
              error: "Team member limit reached",
              detail: `Your plan allows ${limit} team member${limit !== 1 ? "s" : ""}. You currently have ${currentCount} member${currentCount !== 1 ? "s" : ""} and ${pendingCount} pending invitation${pendingCount !== 1 ? "s" : ""}. Please upgrade your plan or remove existing members to invite more.`,
            },
            { status: 403 },
          );
        }
      }
    }

    // Create the invitation
    const { data, error } = await adminClient
      .from("team_invitations")
      .insert({
        business_id,
        email: invitedEmailNormalized,
        role,
        invited_by,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/invitations?id=xxx
 * Cancel a pending invitation.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "invitation id is required" },
        { status: 400 },
      );
    }

    const adminClient = getAdminClient();

    const { data, error } = await adminClient
      .from("team_invitations")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
