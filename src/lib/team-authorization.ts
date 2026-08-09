import "server-only";

import { createClient } from "@/lib/supabase/server";

type TeamRole = "owner" | "admin" | "member";

export interface TeamActor {
  userId: string;
  businessId: string;
  role: TeamRole;
}

export type TeamAuthorizationResult =
  | { ok: true; actor: TeamActor }
  | { ok: false; status: 401 | 403; error: string };

/**
 * Resolves the authenticated business actor from the verified Supabase user.
 * Request-body identifiers are intentionally ignored so callers cannot claim
 * another user or business before a service-role query is executed.
 */
export async function requireTeamManager(): Promise<TeamAuthorizationResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, status: 401, error: "Authentication required" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("business_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    profileError ||
    !profile?.business_id ||
    !["owner", "admin"].includes(profile.role)
  ) {
    return {
      ok: false,
      status: 403,
      error: "Only a business owner or Business Manager can manage the team",
    };
  }

  return {
    ok: true,
    actor: {
      userId: user.id,
      businessId: profile.business_id,
      role: profile.role as TeamRole,
    },
  };
}
