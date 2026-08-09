import "server-only";

import { createClient } from "@/lib/supabase/server";

type AuthorizedSuperAdmin = {
  ok: true;
  user: {
    id: string;
    email: string | null;
  };
};

type SuperAdminAuthorizationError = {
  ok: false;
  status: 401 | 403;
  error: string;
};

export async function requireSuperAdmin(): Promise<
  AuthorizedSuperAdmin | SuperAdminAuthorizationError
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, status: 401, error: "Authentication required." };
  }

  if (user.app_metadata?.is_super_admin !== true) {
    return { ok: false, status: 403, error: "Super admin access required." };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email ?? null,
    },
  };
}
