"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const ROUTER_TIMEOUT_MS = 3_000;

/**
 * Client-side auth callback handling for the public landing site.
 *
 * Ported verbatim from the previous src/app/page.tsx (the root page used to
 * own this before the landing site replaced the placeholder): Supabase
 * implicit-flow callbacks land on "/" with #access_token / #error in the
 * hash (or ?error= in the query). This forwards them to the real auth
 * routes. When no auth parameters are present it does nothing and renders
 * nothing.
 */
export default function AuthCallbackHandler() {
  const router = useRouter();
  const redirected = useRef(false);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigateTo = useCallback(
    (url: string) => {
      router.replace(url);
      fallbackTimer.current = setTimeout(() => {
        window.location.replace(url);
      }, ROUTER_TIMEOUT_MS);
    },
    [router],
  );

  const doRedirect = useCallback(
    (url: string) => {
      if (redirected.current) return;
      redirected.current = true;
      navigateTo(url);
    },
    [navigateTo],
  );

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);

    const accessToken = hashParams.get("access_token");
    const hashError = hashParams.get("error");

    if (accessToken) {
      const params = new URLSearchParams();
      params.set("access_token", accessToken);
      if (hashParams.get("refresh_token"))
        params.set("refresh_token", hashParams.get("refresh_token")!);
      if (hashParams.get("expires_in"))
        params.set("expires_in", hashParams.get("expires_in")!);
      if (hashParams.get("token_type"))
        params.set("token_type", hashParams.get("token_type")!);
      if (hashParams.get("type")) params.set("type", hashParams.get("type")!);

      const target =
        hashParams.get("type") === "recovery"
          ? "/auth/callback/recovery?"
          : "/auth/callback?";
      doRedirect(target + params.toString());
      return;
    }

    if (hashError) {
      doRedirect("/login?" + hash);
      return;
    }

    const queryParams = new URLSearchParams(window.location.search);
    const queryError = queryParams.get("error");

    if (queryError) {
      doRedirect("/login?" + window.location.search.substring(1));
      return;
    }

    return () => {
      if (fallbackTimer.current) {
        clearTimeout(fallbackTimer.current);
        fallbackTimer.current = null;
      }
    };
  }, [doRedirect]);

  return null;
}
