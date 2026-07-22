import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        // Must be false when accessing via HTTP (non-HTTPS), e.g. mobile
        // testing on http://192.168.x.x:3000. Browsers silently discard
        // cookies with secure:true on HTTP connections.
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    },
  );
}
