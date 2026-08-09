"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import LandingPage from "@/app/landing/page";

const ROUTER_TIMEOUT_MS = 3_000;

export default function HomePage() {
  const router = useRouter();
  const redirected = useRef(false);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [handlingAuth, setHandlingAuth] = useState(true);

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
      setHandlingAuth(true);
      navigateTo(url);
    },
    [navigateTo],
  );

  // ── Handle auth callbacks from URL parameters ──
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

    // No auth params — show the landing page
    const taskId = window.setTimeout(() => {
      setHandlingAuth(false);
    }, 0);

    return () => {
      window.clearTimeout(taskId);
      if (fallbackTimer.current) {
        clearTimeout(fallbackTimer.current);
        fallbackTimer.current = null;
      }
    };
  }, [doRedirect]);

  // ── Scroll to section when navigating from another page ──
  useEffect(() => {
    if (handlingAuth) return;

    // Check for ?scrollTo=sectionName query param (set by SiteHeader)
    const params = new URLSearchParams(window.location.search);
    const scrollTo = params.get("scrollTo");
    if (scrollTo) {
      // Small delay ensures the section is rendered by React
      const timer = setTimeout(() => {
        document
          .getElementById(scrollTo)
          ?.scrollIntoView({ behavior: "smooth" });
        // Clean up the query param without reloading
        window.history.replaceState(null, "", "/");
      }, 150);
      return () => clearTimeout(timer);
    }

    // Also handle direct hash navigation (e.g. /#features)
    const hash = window.location.hash.substring(1);
    if (hash) {
      const timer = setTimeout(() => {
        document
          .getElementById(hash)
          ?.scrollIntoView({ behavior: "smooth" });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [handlingAuth]);

  if (handlingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <LandingPage />;
}
