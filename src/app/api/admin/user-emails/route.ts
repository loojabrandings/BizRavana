import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/user-emails
 *
 * Fetches email addresses for the given user IDs from auth.users.
 * Only callable by super admins. Returns a map of user_id → email.
 *
 * Body: { userIds: string[] }
 * Response: { emails: Record<string, string> }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated and is a super admin
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSuperAdmin = session.user.app_metadata?.is_super_admin === true;
    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { userIds } = body as { userIds: string[] };

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ emails: {} });
    }

    if (userIds.length > 200) {
      return NextResponse.json(
        { error: "Too many user IDs (max 200)" },
        { status: 400 },
      );
    }

    // Call the RPC function to get emails from auth.users
    const { data, error } = await supabase.rpc("get_user_emails", {
      user_ids: userIds,
    });

    if (error) {
      console.error("Failed to fetch user emails:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Convert array to a map: user_id → email
    const emails: Record<string, string> = {};
    if (data) {
      for (const row of data as { user_id: string; email: string }[]) {
        emails[row.user_id] = row.email;
      }
    }

    return NextResponse.json({ emails });
  } catch (err) {
    console.error("Unexpected error fetching user emails:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
