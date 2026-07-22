"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [exchangingCode, setExchangingCode] = useState(true);

  const MIN_LENGTH = 8;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < MIN_LENGTH) {
      setError(`Password must be at least ${MIN_LENGTH} characters.`);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);

      // Redirect to login after brief delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Exchange code / set session from recovery link, then verify session
  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const code = searchParams.get("code");
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");

      // If session already exists (from @supabase/ssr auto-detection),
      // skip the exchange entirely.
      const { data: { session: existing } } = await supabase.auth.getSession();
      if (existing) {
        setExchangingCode(false);
        return;
      }

      if (code) {
        // PKCE flow — the code verifier stored by resetPasswordForEmail
        // should be available in @supabase/ssr cookies.
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          // The code may have been consumed by a concurrent Strict Mode
          // effect instance. Check if the session was established anyway.
          const { data: { session: fallback } } = await supabase.auth.getSession();
          if (fallback) {
            setExchangingCode(false);
            return;
          }
          router.push("/login?error=reset_link_expired");
          return;
        }
      } else if (accessToken) {
        // Implicit flow — set the session from forwarded tokens.
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || "",
        });
        if (error) {
          router.push("/login?error=reset_link_expired");
          return;
        }
      }

      // Verify we now have a session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      setExchangingCode(false);
    };
    init();
  }, [router, searchParams]);

  if (exchangingCode) {
    return (
      <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-background px-5 py-10 sm:px-8">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Verifying reset link...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-background px-5 py-10 sm:px-8">
      <div className="absolute -right-32 -top-32 size-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 size-96 rounded-full bg-accent/30 blur-3xl" />

      <div className="relative w-full max-w-[420px]">
        <div className="mb-10 lg:hidden">
          <div className="inline-flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Store className="size-[22px]" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-foreground">
                BizRavana
              </p>
              <p className="text-sm font-medium tracking-widest-alt text-muted-foreground">
                BUSINESS, SIMPLIFIED
              </p>
            </div>
          </div>
        </div>

        {success ? (
          <>
            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest-alt text-success">
                Password updated
              </p>
              <h2 className="text-3xl font-semibold tracking-tightest text-foreground">
                All set!
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Your password has been successfully updated. You&apos;ll be
                redirected to sign in shortly.
              </p>
            </div>

            <Button
              variant="gradient"
              onClick={() => router.push("/login")}
              className="h-12 w-full rounded-xl text-sm font-semibold"
            >
              Go to sign in
              <ArrowRight className="size-4" />
            </Button>
          </>
        ) : (
          <>
            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest-alt text-primary">
                Set new password
              </p>
              <h2 className="text-3xl font-semibold tracking-tightest text-foreground">
                Choose a new password
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Your password must be at least {MIN_LENGTH} characters long.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-destructive" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-secondary-foreground"
                >
                  New password
                </Label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={MIN_LENGTH}
                    autoComplete="new-password"
                    className="h-12 rounded-xl border-border bg-card pl-11 pr-12 text-sm shadow-sm shadow-border/30 transition-all placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirm-password"
                  className="text-sm font-semibold text-secondary-foreground"
                >
                  Confirm new password
                </Label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={MIN_LENGTH}
                    autoComplete="new-password"
                    className="h-12 rounded-xl border-border bg-card pl-11 pr-12 text-sm shadow-sm shadow-border/30 transition-all placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="group btn-gradient btn-gradient-shadow h-12 w-full rounded-xl text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:btn-gradient-hover hover:shadow-xl disabled:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  <>
                    Update password
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-7 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <ShieldCheck className="size-3.5" />
              Protected by secure authentication
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function ResetPasswordSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-[420px] space-y-5">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-10 w-72 animate-pulse rounded-lg bg-muted" />
        <div className="h-12 animate-pulse rounded-xl bg-muted" />
        <div className="h-12 animate-pulse rounded-xl bg-muted" />
        <div className="h-12 animate-pulse rounded-xl bg-muted/70" />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen w-full">
      <Suspense fallback={<ResetPasswordSkeleton />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
