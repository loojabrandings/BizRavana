import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side login handler — acts as the native form action for the
 * login page (`<form action="/api/login" method="POST">`).
 *
 * When JavaScript fails to hydrate on the client (e.g. mobile testing
 * over a local network IP), the browser falls back to a native HTML
 * form submission. This route authenticates with Supabase and sets
 * the auth cookies on the redirect response.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (!email || !password) {
    return NextResponse.redirect(
      new URL("/login?error=missing_fields", request.url),
    );
  }

  // Prepare a redirect response — we'll attach auth cookies to it
  let response = NextResponse.redirect(new URL("/dashboard", request.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const params = new URLSearchParams({ error: error.message });
    response = NextResponse.redirect(
      new URL(`/login?${params.toString()}`, request.url),
    );
  }

  return response;
}
