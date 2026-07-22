"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { provisionUser } from "@/lib/supabase/provision-user";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      const code = searchParams.get("code");
      const type = searchParams.get("type");

      // ── Password reset (safety net) ───────────────────────────────────
      if (type === "recovery") {
        const params = new URLSearchParams();
        if (accessToken) params.set("access_token", accessToken);
        if (refreshToken) params.set("refresh_token", refreshToken);
        if (code) params.set("code", code);
        router.push(
          `/auth/callback/recovery?${params.toString()}`,
        );
        return;
      }

      // ── Normal sign-in (OAuth / magic link / email link) ──────────────
      if (accessToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || "",
        });

        if (error) {
          console.error("Session set error:", error.message);
          router.push("/login?error=session_error");
          return;
        }
      } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("Code exchange error:", error.message);
          router.push("/login?error=session_error");
          return;
        }
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        if (error) console.error("Auth callback error:", error.message);
        router.push("/login?error=session_error");
        return;
      }

      const provisionError = await provisionUser(supabase, user);
      if (provisionError) {
        console.error("Account provisioning error:", provisionError);
        router.push("/login?error=account_setup");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}

function CallbackSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Loading...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackSkeleton />}>
      <CallbackHandler />
    </Suspense>
  );
}
