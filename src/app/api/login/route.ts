import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthorizedRedirect } from "@/lib/auth-routing";
import { consumeRateLimit, getClientAddress } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_LOGIN_BYTES = 16 * 1024;
const LOGIN_WINDOW_SECONDS = 15 * 60;
const LOGIN_IP_LIMIT = 30;
const LOGIN_ACCOUNT_LIMIT = 10;

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(1024),
  redirect: z.string().max(2048).optional(),
});

type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

function isJsonRequest(request: NextRequest) {
  return request.headers.get("content-type")?.includes("application/json") ?? false;
}

function withCookies(response: NextResponse, cookies: PendingCookie[]) {
  cookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options),
  );
  return response;
}

function errorResponse({
  request,
  json,
  code,
  message,
  status,
  retryAfterSeconds,
}: {
  request: NextRequest;
  json: boolean;
  code: string;
  message: string;
  status: number;
  retryAfterSeconds?: number;
}) {
  const response = json
    ? NextResponse.json(
        { error: message, code },
        { status, headers: { "Cache-Control": "no-store" } },
      )
    : NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(code)}`, request.url),
        303,
      );

  response.headers.set("Cache-Control", "no-store");
  if (retryAfterSeconds) {
    response.headers.set("Retry-After", String(retryAfterSeconds));
  }
  return response;
}

/**
 * Native-form login fallback used when the client has not hydrated. A POST
 * login must redirect with 303 so the browser follows with a GET request.
 */
export async function POST(request: NextRequest) {
  const json = isJsonRequest(request);
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_LOGIN_BYTES) {
    return errorResponse({
      request,
      json,
      code: "request_too_large",
      message: "The sign-in request is too large.",
      status: 413,
    });
  }

  let input: unknown;
  try {
    if (json) {
      input = await request.json();
    } else {
      const formData = await request.formData();
      input = {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: formData.get("redirect") || undefined,
      };
    }
  } catch {
    return errorResponse({
      request,
      json,
      code: "invalid_request",
      message: "The sign-in request is invalid.",
      status: 400,
    });
  }

  const credentials = loginSchema.safeParse(input);

  if (!credentials.success) {
    return errorResponse({
      request,
      json,
      code: "missing_fields",
      message: "Enter a valid email address and password.",
      status: 400,
    });
  }

  let rateLimits;
  try {
    rateLimits = await Promise.all([
      consumeRateLimit({
        scope: "login-ip",
        discriminator: getClientAddress(request),
        limit: LOGIN_IP_LIMIT,
        windowSeconds: LOGIN_WINDOW_SECONDS,
      }),
      consumeRateLimit({
        scope: "login-account",
        discriminator: credentials.data.email,
        limit: LOGIN_ACCOUNT_LIMIT,
        windowSeconds: LOGIN_WINDOW_SECONDS,
      }),
    ]);
  } catch {
    return errorResponse({
      request,
      json,
      code: "service_unavailable",
      message: "Sign-in is temporarily unavailable. Please try again shortly.",
      status: 503,
    });
  }

  const blockedLimit = rateLimits.find((result) => !result.allowed);
  if (blockedLimit) {
    return errorResponse({
      request,
      json,
      code: "rate_limited",
      message: "Too many sign-in attempts. Please wait and try again.",
      status: 429,
      retryAfterSeconds: blockedLimit.retryAfterSeconds,
    });
  }

  const pendingCookies: PendingCookie[] = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          pendingCookies.push(...cookiesToSet);
        },
      },
    },
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.data.email,
    password: credentials.data.password,
  });

  if (error || !data.user) {
    return errorResponse({
      request,
      json,
      code: "invalid_credentials",
      message: "The email or password is not correct.",
      status: 401,
    });
  }

  const redirectTo = getAuthorizedRedirect(credentials.data.redirect, data.user);
  const response = json
    ? NextResponse.json(
        { redirectTo },
        { status: 200, headers: { "Cache-Control": "no-store" } },
      )
    : NextResponse.redirect(new URL(redirectTo, request.url), 303);

  response.headers.set("Cache-Control", "no-store");
  return withCookies(response, pendingCookies);
}
