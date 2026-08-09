import "server-only";

import { createClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

type AuthorizedBusinessUser = {
  ok: true;
  supabase: ServerSupabaseClient;
  userId: string;
  businessId: string;
};

type BusinessAuthorizationError = {
  ok: false;
  status: 401 | 403 | 500;
  error: string;
};

export async function requireBusinessUser(): Promise<
  AuthorizedBusinessUser | BusinessAuthorizationError
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, status: 401, error: "Authentication required." };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, status: 500, error: "Could not verify business access." };
  }

  if (!profile?.business_id) {
    return { ok: false, status: 403, error: "Business access required." };
  }

  return {
    ok: true,
    supabase,
    userId: user.id,
    businessId: profile.business_id,
  };
}
