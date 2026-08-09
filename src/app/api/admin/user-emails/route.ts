import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/admin-authorization";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z
  .object({
    userIds: z.array(z.string().uuid()).max(200),
  })
  .strict();

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
    const authorization = await requireSuperAdmin();
    if (!authorization.ok) {
      return NextResponse.json(
        { error: authorization.error },
        { status: authorization.status },
      );
    }

    const parsed = requestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid user IDs." }, { status: 400 });
    }

    const userIds = [...new Set(parsed.data.userIds)];

    if (userIds.length === 0) {
      return NextResponse.json({ emails: {} });
    }

    const supabase = await createClient();
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
