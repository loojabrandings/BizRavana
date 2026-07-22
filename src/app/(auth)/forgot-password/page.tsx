"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Mail,
  ShieldCheck,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/callback/recovery`,
        });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setSent(true);
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

        {sent ? (
          <>
            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest-alt text-primary">
                Check your inbox
              </p>
              <h2 className="text-3xl font-semibold tracking-tightest text-foreground">
                Reset link sent
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                We&apos;ve sent a password reset link to{" "}
                <strong className="text-foreground">{email}</strong>. It may take
                a few minutes to arrive. Check your spam folder if you don&apos;t
                see it.
              </p>
            </div>

            <div className="rounded-xl border border-border/50 bg-muted/20 px-5 py-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 text-primary shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Didn&apos;t receive the email?</p>
                  <p className="mt-1 leading-relaxed">
                    Make sure <strong className="text-foreground">{email}</strong>{" "}
                    is the email you registered with, and check your spam or
                    promotions folder.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 space-y-4">
              <Button
                variant="outline"
                onClick={() => setSent(false)}
                className="h-12 w-full rounded-xl text-sm font-semibold"
              >
                Try a different email
              </Button>

              <Link
                href="/login"
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground"
              >
                <ArrowLeft className="size-4" />
                Back to sign in
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest-alt text-primary">
                Reset your password
              </p>
              <h2 className="text-3xl font-semibold tracking-tightest text-foreground">
                Forgot your password?
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Enter the email address associated with your account and we&apos;ll
                send you a link to reset your password.
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
                  htmlFor="email"
                  className="text-sm font-semibold text-secondary-foreground"
                >
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@business.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                    className="h-12 rounded-xl border-border bg-card pl-11 pr-4 text-sm shadow-sm shadow-border/30 transition-all placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !email.trim()}
                className="group btn-gradient btn-gradient-shadow h-12 w-full rounded-xl text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:btn-gradient-hover hover:shadow-xl disabled:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  <>
                    Send reset link
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-7 flex items-center justify-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                Back to sign in
              </Link>
            </div>

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

function ForgotPasswordSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-[420px] space-y-5">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-10 w-72 animate-pulse rounded-lg bg-muted" />
        <div className="h-12 animate-pulse rounded-xl bg-muted" />
        <div className="h-12 animate-pulse rounded-xl bg-muted/70" />
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen w-full">
      <Suspense fallback={<ForgotPasswordSkeleton />}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
