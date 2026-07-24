import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/client";

/**
 * POST /api/invitations/accept
 * Accept a pending invitation using the invitation token.
 * Body: { token }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "token is required" },
        { status: 400 },
      );
    }

    // Get the current user
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to accept an invitation" },
        { status: 401 },
      );
    }

    // Call the RPC function to accept the invitation
    const adminClient = getAdminClient();
    const { data: businessId, error } = await adminClient.rpc(
      "accept_invitation",
      {
        invitation_token: token,
        accepting_user_id: user.id,
      },
    );

    if (error) {
      // Map the RPC error messages to user-friendly responses
      const message = error.message;
      if (message.includes("Invalid or expired")) {
        return NextResponse.json(
          { error: "This invitation is invalid or has expired." },
          { status: 400 },
        );
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({
      data: { business_id: businessId },
      message: "Invitation accepted successfully!",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
