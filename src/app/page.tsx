"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Fallback: if router.replace doesn't complete within this timeframe,
 * use window.location.replace as a hard fallback. This handles cases
 * where the App Router RSC fetch stalls (e.g. cross-origin dev access).
 */
const ROUTER_TIMEOUT_MS = 3_000;

export default function HomePage() {
  const router = useRouter();
  const redirected = useRef(false);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigateTo = useCallback((url: string) => {
    // Attempt SPA navigation first (preserves client state for hash flows)
    router.replace(url);

    // Hard fallback for cross-origin / stalled scenarios.
    // If SPA navigation succeeds, the component unmounts and we clear this.
    fallbackTimer.current = setTimeout(() => {
      window.location.replace(url);
    }, ROUTER_TIMEOUT_MS);
  }, [router]);

  const doRedirect = useCallback(
    (url: string) => {
      if (redirected.current) return;
      redirected.current = true;
      navigateTo(url);
    },
    [navigateTo],
  );

  useEffect(() => {
    // Parse URL hash for auth tokens (Supabase confirmation emails use hash fragments)
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);

    const accessToken = hashParams.get("access_token");
    const hashError = hashParams.get("error");

    if (accessToken) {
      // Auth callback detected from hash — forward tokens as query params
      const params = new URLSearchParams();
      params.set("access_token", accessToken);
      if (hashParams.get("refresh_token"))
        params.set("refresh_token", hashParams.get("refresh_token")!);
      if (hashParams.get("expires_in"))
        params.set("expires_in", hashParams.get("expires_in")!);
      if (hashParams.get("token_type"))
        params.set("token_type", hashParams.get("token_type")!);
      if (hashParams.get("type")) params.set("type", hashParams.get("type")!);

      // Recovery (password reset) flows go to the dedicated recovery callback
      const target =
        hashParams.get("type") === "recovery"
          ? "/auth/callback/recovery?"
          : "/auth/callback?";
      doRedirect(target + params.toString());
      return;
    }

    if (hashError) {
      // Error from hash — forward to login
      doRedirect("/login?" + hash);
      return;
    }

    // Also check query params (some flows or error redirects use query string)
    const queryParams = new URLSearchParams(window.location.search);
    const queryError = queryParams.get("error");

    if (queryError) {
      doRedirect("/login?" + window.location.search.substring(1));
      return;
    }

    // Normal navigation — go to login
    doRedirect("/login");

    return () => {
      // Clean up fallback timer if component unmounts before timeout fires
      if (fallbackTimer.current) {
        clearTimeout(fallbackTimer.current);
        fallbackTimer.current = null;
      }
    };
  }, [doRedirect]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm">Redirecting...</p>
      </div>
    </div>
  );
}
