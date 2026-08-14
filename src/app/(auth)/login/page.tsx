"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Button from "@/components/button";

function getLoginErrorMessage(error: { code?: string; message: string }) {
  const message = error.message.toLowerCase();

  if (
    error.code === "email_not_confirmed" ||
    message.includes("email not confirmed")
  ) {
    return "This account still needs email confirmation. Check your inbox for the confirmation message, or contact support if you can no longer access it.";
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
    return "The sign-in service is temporarily unavailable. Check your internet connection and try again.";
  }

  return error.message;
}

function LoginForm() {
  const searchParams = useSearchParams();
  const requestedRedirect = searchParams.get("redirect");
  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbackErrorMessages: Record<string, string> = {
    account_setup:
      "We could not finish setting up your account. Please try again.",
    invalid_credentials: "The email or password is not correct.",
    rate_limited: "Too many sign-in attempts. Please wait and try again.",
    service_unavailable:
      "Sign-in is temporarily unavailable. Please try again shortly.",
  };
  const visibleError =
    error ||
    (callbackError
      ? callbackErrorMessages[callbackError] ??
        "Your sign-in session could not be completed. Please sign in again."
      : null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Only include `redirect` when actually present — the API schema
      // treats it as an optional string, and a JSON `null` fails validation.
      const loginBody: Record<string, string> = { email, password };
      if (requestedRedirect) loginBody.redirect = requestedRedirect;

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginBody),
      });
      const result = (await response.json()) as {
        redirectTo?: string;
        error?: string;
      };

      if (!response.ok || !result.redirectTo) {
        setError(result.error || "Sign-in failed. Please try again.");
        setLoading(false);
        return;
      }

      window.location.replace(result.redirectTo);
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
    <div className="auth">
      {/* Brand — the landing site's own mark, linking back home. */}
      <Link
        href="/"
        className="navbar__brand auth__brand"
        aria-label="BizRavana — Home"
      >
        <span className="navbar__logo" aria-hidden="true">
          B
        </span>
        <span>BizRavana</span>
      </Link>

      {/* Centered statement — the Features/Contact hero rhythm. */}
      <div className="auth__hero">
        <p className="about-eyebrow">Welcome back</p>
        <h1 className="auth__title">
          Run your business with less noise and more clarity.
        </h1>
        <p className="auth__desc">
          Sign in to your workspace — your business overview is waiting
          exactly where you left it.
        </p>
      </div>

      {/* Glass form card. */}
      <div className="card auth__card">
        {visibleError && (
          <div role="alert" className="auth-alert">
            <span className="auth-alert__dot" aria-hidden="true" />
            {visibleError}
          </div>
        )}

        <form
          action="/api/login"
          method="POST"
          onSubmit={handleLogin}
          className="auth__fields"
        >
          <input type="hidden" name="redirect" value={requestedRedirect ?? ""} />

          <div className="field">
            <label className="field__label" htmlFor="email">
              Email address
            </label>
            <div className="auth-input">
              <Mail
                className="auth-input__icon"
                size={16}
                strokeWidth={1.9}
                aria-hidden="true"
              />
              <input
                id="email"
                name="email"
                type="email"
                className="field__control"
                placeholder="you@business.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="field">
            <div className="auth__row">
              <label className="field__label" htmlFor="password">
                Password
              </label>
              <Link href="/forgot-password" className="auth__link">
                Forgot password?
              </Link>
            </div>
            <div className="auth-input auth-input--password">
              <LockKeyhole
                className="auth-input__icon"
                size={16}
                strokeWidth={1.9}
                aria-hidden="true"
              />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="field__control"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="auth-input__toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={16} strokeWidth={1.9} aria-hidden="true" />
                ) : (
                  <Eye size={16} strokeWidth={1.9} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing you in...
              </>
            ) : (
              <>
                Continue to dashboard
                <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
              </>
            )}
          </Button>
        </form>

        <div className="auth-divider">New here?</div>

        <Button href="/register" variant="secondary" className="auth-register">
          Create a free account
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </Button>
      </div>

      <p className="auth__security">
        <ShieldCheck size={15} strokeWidth={1.9} aria-hidden="true" />
        Protected by secure authentication
      </p>
    </div>
  );
}

function LoginSkeleton() {
  const bar = {
    background: "color-mix(in srgb, var(--foreground) 10%, transparent)",
    borderRadius: 10,
  };
  return (
    <div className="auth">
      <div className="card auth__card" aria-hidden="true">
        <div
          className="animate-pulse"
          style={{ height: 34, width: "11rem", ...bar }}
        />
        <div
          className="animate-pulse"
          style={{ height: 48, ...bar }}
        />
        <div
          className="animate-pulse"
          style={{ height: 48, ...bar }}
        />
        <div
          className="animate-pulse"
          style={{
            height: 48,
            ...bar,
            background:
              "color-mix(in srgb, var(--foreground) 14%, transparent)",
          }}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="landing-site">
      {/* Ambient accent blobs — the landing pages' fixed background layer. */}
      <div className="scene-blobs" aria-hidden="true" />
      <Suspense fallback={<LoginSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
