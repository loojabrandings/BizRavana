import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const ORIGIN_EXEMPT_PATHS = new Set(["/api/payments/payhere/notify"]);

function allowedOrigins(request: NextRequest) {
  const values = [
    request.nextUrl.origin,
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ];
  return new Set(
    values.flatMap((value) => {
      if (!value) return [];
      try {
        return [new URL(value).origin];
      } catch {
        return [];
      }
    }),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/api/") &&
    MUTATION_METHODS.has(request.method) &&
    !ORIGIN_EXEMPT_PATHS.has(pathname)
  ) {
    const origin = request.headers.get("origin");
    if (!origin || !allowedOrigins(request).has(origin)) {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
