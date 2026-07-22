"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Dedicated callback for password reset flows.
 *
 * Pure pass-through — no auth operations. Forwards all tokens to the
 * reset-password page which handles both PKCE code exchange and
 * implicit access_token session setup.
 *
 * PKCE:   /auth/callback/recovery?code=xxx          →  /reset-password?code=xxx
 * Implicit: /auth/callback/recovery?access_token=…  →  /reset-password?access_token=…&refresh_token=…
 */
function RecoveryCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    const params = new URLSearchParams();
    if (code) params.set("code", code);
    if (accessToken) params.set("access_token", accessToken);
    if (refreshToken) params.set("refresh_token", refreshToken);

    const qs = params.toString();
    router.replace(qs ? `/reset-password?${qs}` : "/reset-password");
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Verifying reset link...</p>
      </div>
    </div>
  );
}

export default function RecoveryCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <RecoveryCallbackHandler />
    </Suspense>
  );
}
