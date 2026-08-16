import type { Metadata } from "next";
import { Poppins, Lora, Caveat, Mohave } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { PreferencesProvider } from "@/providers/preferences-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-caveat",
});

const mohave = Mohave({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mohave",
});

// Runs before first paint: resolve the accent from the persisted preferences
// (else the BizRavana default), then set `data-accent` on <html> so the
// correct palette applies with no flash of the base (Ocean) colors. Mirrors
// the landing site's theme init script in (site)/layout.tsx.
const accentInitScript = `(function () {
  try {
    var raw = localStorage.getItem("freebuff-preferences");
    var accent = "bizravana";
    if (raw) {
      var parsed = JSON.parse(raw);
      var stored = parsed && parsed.state && parsed.state.accent;
      var known = ["bizravana", "blue", "purple", "rose", "amber", "custom"];
      // Legacy "green" (Forest) accent was removed — map it to BizRavana.
      if (stored === "green" || known.indexOf(stored) !== -1) {
        accent = stored === "green" ? "bizravana" : stored;
      }
    }
    document.documentElement.setAttribute("data-accent", accent);
  } catch (e) {}
})();`;

export const metadata: Metadata = {
  title: {
    template: "%s | BizRavana",
    default: "BizRavana - Business Dashboard",
  },
  description: "Multi-tenant SaaS dashboard for small and medium businesses",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "BizRavana",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full antialiased ${poppins.variable} ${lora.variable} ${caveat.variable} ${mohave.variable}`}
    >
      <body className="min-h-full flex flex-col">
        {/* Sets data-accent before first paint; the type switch follows the
            landing site's theme script: text/javascript on the server so it
            runs during HTML parsing, text/plain on the client so React
            ignores it while hydrating. */}
        <script
          type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: accentInitScript }}
        />
        <ThemeProvider defaultTheme="system" accent="bizravana">
          <PreferencesProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </PreferencesProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
