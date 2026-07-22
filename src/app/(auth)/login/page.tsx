"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const highlights = [
  {
    icon: PackageCheck,
    title: "Orders, beautifully organized",
    description: "Follow every order from confirmation through delivery.",
  },
  {
    icon: Boxes,
    title: "Inventory that stays in sync",
    description: "Know what is available before it slows your business down.",
  },
  {
    icon: BarChart3,
    title: "Decisions backed by clarity",
    description: "See the numbers that matter without wrestling spreadsheets.",
  },
];

function getSafeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

function getLoginErrorMessage(error: { code?: string; message: string }) {
  const message = error.message.toLowerCase();

  if (
    error.code === "email_not_confirmed" ||
    message.includes("email not confirmed")
  ) {
    return "This account still needs email confirmation. If you disabled Confirm email after creating this user, delete the old user in Supabase Authentication > Users, then sign up again.";
  }

  if (
    error.code === "invalid_credentials" ||
    message.includes("invalid login credentials")
  ) {
    return "The email or password is not correct. If this is a new test account, make sure signup completed successfully first.";
  }

  if (
    message.includes("too many requests") ||
    error.code === "over_request_rate_limit"
  ) {
    return "Too many sign-in attempts. Please wait a moment and try again.";
  }

  if (message.includes("fetch failed")) {
    return "The app could not reach Supabase. Please check your internet connection and Supabase project URL/key, then try again.";
  }

  return error.message;
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex shrink-0 items-center justify-center rounded-2xl bg-card text-card-foreground shadow-lg shadow-foreground/10 ${
          compact ? "size-10" : "size-11"
        }`}
      >
        <Store className={compact ? "size-5" : "size-[22px]"} strokeWidth={2.2} />
      </div>
      <div>
        <p className="text-lg font-semibold tracking-tighter text-hero-foreground">
          BizRavana
        </p>
        <p className="text-sm font-medium tracking-wider text-hero-muted">
          BUSINESS, SIMPLIFIED
        </p>
      </div>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[500px]">
      <div className="absolute -inset-10 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-[24px] border border-hero-foreground/10 bg-hero-foreground/[0.07] p-2 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="rounded-[18px] border border-hero-foreground/10 bg-hero/90 p-4">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="h-2 w-16 rounded-full bg-hero-foreground/20" />
              <div className="mt-2 h-3 w-28 rounded-full bg-hero-foreground/80" />
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15">
              <TrendingUp className="size-4 text-primary-foreground/80" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              ["Today", "24"],
              ["Revenue", "Rs. 86K"],
              ["Pending", "07"],
            ].map(([label, value], index) => (
              <div
                key={label}
                className={`rounded-xl border p-3 ${
                  index === 1
                    ? "border-primary/20 bg-primary/10"
                    : "border-hero-foreground/[0.07] bg-hero-foreground/[0.035]"
                }`}
              >
                <p className="text-sm text-hero-muted">{label}</p>
                <p className="mt-1.5 text-sm font-semibold text-hero-foreground">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-hero-foreground/[0.07] bg-hero-foreground/[0.025] p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="h-2.5 w-20 rounded-full bg-hero-foreground/70" />
              <div className="h-2 w-10 rounded-full bg-primary/50" />
            </div>
            <div className="flex h-20 items-end gap-2">
              {[42, 62, 48, 78, 58, 92, 72, 100, 82, 112].map(
                (height, index) => (
                  <div
                    key={`${height}-${index}`}
                    className="flex-1 rounded-t bg-gradient-to-t from-revenue/35 to-net-profit/80"
                    style={{ height: `${height / 1.4}%` }}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -right-3 flex items-center gap-2 rounded-xl border border-hero-foreground/10 bg-hero/95 px-3 py-2.5 shadow-xl backdrop-blur-xl">
        <div className="flex size-7 items-center justify-center rounded-lg bg-success/15">
          <Check className="size-3.5 text-success" />
        </div>
        <div>
          <p className="text-sm text-hero-muted">Latest order</p>
          <p className="text-sm font-medium text-hero-foreground">Ready to dispatch</p>
        </div>
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <section className="relative hidden min-h-screen w-[52%] max-w-[760px] overflow-hidden bg-hero lg:flex lg:flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,oklch(0.623_0.214_259.815_/_0.22),transparent_34%),radial-gradient(circle_at_90%_70%,oklch(0.715_0.143_311.379_/_0.12),transparent_30%)]" />
      <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(oklch(1_0_0_/_0.12)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0_/_0.12)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />

      <div className="relative z-10 flex min-h-screen flex-col px-10 py-9 xl:px-14 xl:py-11">
        <BrandMark />

        <div className="my-auto py-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary-foreground/80">
            <Sparkles className="size-3.5" />
            Built for ambitious Sri Lankan businesses
          </div>

          <h1 className="max-w-xl text-4xl font-semibold leading-tighter tracking-tightest text-hero-foreground xl:text-hero-lg">
            Run your business with less noise and more clarity.
          </h1>
          <p className="mt-5 max-w-lg text-body-lg leading-7 text-hero-muted">
            One calm workspace for orders, customers, stock, expenses, and the
            numbers shaping your next move.
          </p>

          <div className="mt-9 grid max-w-lg gap-4 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, title, description }) => (
              <div key={title}>
                <div className="mb-3 flex size-9 items-center justify-center rounded-xl border border-hero-foreground/10 bg-hero-foreground/[0.06]">
                  <Icon className="size-4 text-hero-foreground/80" />
                </div>
                <p className="text-sm font-medium leading-5 text-hero-foreground/90">
                  {title}
                </p>
                <p className="mt-1 text-sm text-hero-muted/80">
                  {description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <DashboardPreview />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-hero-muted/80">
          <ShieldCheck className="size-3.5" />
          Secure, private, and designed for everyday work.
        </div>
      </div>
    </section>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get("redirect"));
  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visibleError =
    error ||
    (callbackError === "account_setup"
      ? "We could not finish setting up your account. Please try again."
      : callbackError
        ? "Your sign-in session could not be completed. Please sign in again."
        : null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        setError(getLoginErrorMessage(authError));
        setLoading(false);
        return;
      }

      if (!authData.session) {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setError(
            sessionError
              ? getLoginErrorMessage(sessionError)
              : "Sign-in succeeded, but the session was not saved. Please try again.",
          );
          setLoading(false);
          return;
        }
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(
          userError
            ? getLoginErrorMessage(userError)
            : "Sign-in succeeded, but the user session could not be verified. Please try again.",
        );
        setLoading(false);
        return;
      }

      window.location.replace(redirectTo);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? getLoginErrorMessage(caughtError)
          : "Something went wrong. Please try again.";
      setError(message);
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

        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest-alt text-primary">
            Welcome back
          </p>
          <h2 className="text-3xl font-semibold tracking-tightest text-foreground">
            Sign in to your workspace
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Your business overview is waiting exactly where you left it.
          </p>
        </div>

        {visibleError && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-destructive" />
            {visibleError}
          </div>
        )}

        <form
          action="/api/login"
          method="POST"
          onSubmit={handleLogin}
          className="space-y-5"
        >
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
                name="email"
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-secondary-foreground"
              >
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="h-12 rounded-xl border-border bg-card pl-11 pr-12 text-sm shadow-sm shadow-border/30 transition-all placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
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
                Signing you in...
              </>
            ) : (
              <>
                Continue to dashboard
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </form>

        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            New here?
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Link
          href="/register"
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground"
        >
          Create a free account
          <ArrowRight className="size-4" />
        </Link>

        <div className="mt-7 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          Protected by secure authentication
        </div>
      </div>
    </main>
  );
}

function LoginSkeleton() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="hidden w-[52%] max-w-[760px] bg-hero lg:block" />
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-[420px] space-y-5">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-10 w-72 animate-pulse rounded-lg bg-muted" />
          <div className="h-12 animate-pulse rounded-xl bg-muted" />
          <div className="h-12 animate-pulse rounded-xl bg-muted" />
          <div className="h-12 animate-pulse rounded-xl bg-muted/70" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full">
      <Suspense fallback={<LoginSkeleton />}>
        <BrandPanel />
        <LoginForm />
      </Suspense>
    </div>
  );
}
