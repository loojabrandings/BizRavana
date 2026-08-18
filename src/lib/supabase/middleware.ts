import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getAuthenticatedHome,
  isSuperAdmin,
} from "@/lib/auth-routing";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── Early Return for Public Marketing Pages ────────────────────────
  // Public pages (/ , /pricing, /about, /features, /terms, etc.) do not require
  // server-side session checks. Bypassing `getUser()` eliminates a blocking
  // 300ms-2000ms HTTP round-trip to Supabase on every public request.
  const protectedPaths = ["/admin", "/dashboard"];
  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path),
  );
  const isLogin = pathname === "/login";

  if (!isProtected && !isLogin) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname.startsWith("/admin") && !isSuperAdmin(user)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && pathname.startsWith("/dashboard") && isSuperAdmin(user)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users from login page to their own workspace
  if (user && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = getAuthenticatedHome(user);
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
