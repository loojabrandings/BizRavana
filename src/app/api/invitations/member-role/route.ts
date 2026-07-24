import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

/**
 * PATCH /api/invitations/member-role
 * Update a team member's role (promote/demote). Owner/admin only.
 * Body: { profile_id, business_id, new_role }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id, business_id, new_role } = body;

    if (!profile_id || !business_id || !new_role) {
      return NextResponse.json(
        { error: "profile_id, business_id, and new_role are required" },
        { status: 400 },
      );
    }

    if (!["admin", "member"].includes(new_role)) {
      return NextResponse.json(
        { error: "new_role must be 'admin' or 'member'" },
        { status: 400 },
      );
    }

    const adminClient = getAdminClient();

    // Fetch the target profile to ensure it belongs to the business
    const { data: targetProfile } = await adminClient
      .from("profiles")
      .select("id, role, user_id, business_id")
      .eq("id", profile_id)
      .eq("business_id", business_id)
      .single();

    if (!targetProfile) {
      return NextResponse.json(
        { error: "Profile not found in this business" },
        { status: 404 },
      );
    }

    // Cannot change owner's role
    if (targetProfile.role === "owner") {
      return NextResponse.json(
        { error: "Cannot change the owner's role" },
        { status: 403 },
      );
    }

    const { data, error } = await adminClient
      .from("profiles")
      .update({ role: new_role, updated_at: new Date().toISOString() })
      .eq("id", profile_id)
      .select("id, user_id, full_name, role")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const action = new_role === "admin" ? "promoted to Admin" : "demoted to Member";
    return NextResponse.json({
      data,
      message: `Team member ${action} successfully.`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/invitations/member-role
 * Remove a team member from the business (owner/admin only).
 * Query params: profile_id, business_id
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profile_id");
    const businessId = searchParams.get("business_id");

    if (!profileId || !businessId) {
      return NextResponse.json(
        { error: "profile_id and business_id are required" },
        { status: 400 },
      );
    }

    const adminClient = getAdminClient();

    // Fetch the target profile
    const { data: targetProfile } = await adminClient
      .from("profiles")
      .select("id, role, business_id")
      .eq("id", profileId)
      .eq("business_id", businessId)
      .single();

    if (!targetProfile) {
      return NextResponse.json(
        { error: "Profile not found in this business" },
        { status: 404 },
      );
    }

    if (targetProfile.role === "owner") {
      return NextResponse.json(
        { error: "Cannot remove the business owner" },
        { status: 403 },
      );
    }

    // Remove the profile's business association
    const { error } = await adminClient
      .from("profiles")
      .update({
        business_id: null,
        role: "member", // Reset role since they no longer belong to any business
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Team member removed successfully.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
