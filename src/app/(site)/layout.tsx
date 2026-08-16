import type { Metadata } from "next";
import "../landing.css";
import { Poiret_One, Quicksand } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import SmoothScroll from "@/components/smooth-scroll";
import AuthCallbackHandler from "@/components/auth-callback-handler";
import JsonLd from "@/components/json-ld";
import { Analytics } from "@vercel/analytics/react";
import { CONTACT, SITE_URL } from "@/config/site";

// Global typography system (self-hosted via next/font — no layout shift, no
// external requests). Poiret One (single 400 weight, airy geometric display)
// heads the hero; Quicksand (rounded geometric sans) carries body and UI.
// Both are exposed as CSS variables that landing.css maps onto the
// `--font-display` / `--font-body` tokens.
const poiret = Poiret_One({
  variable: "--font-poiret",
  subsets: ["latin"],
  weight: "400",
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

// Landing-site metadata. `absolute` ignores the app root layout's
// "%s | BizRavana" template so landing titles stay clean (the sub-pages'
// own titles, e.g. "About — BizRavana", also render without the suffix).
// The openGraph/twitter block gives every public page shareable social
// metadata; the (site)/opengraph-image.tsx file supplies the image.
export const metadata: Metadata = {
  title: { absolute: "BizRavana" },
  description:
    "Manage orders, customers, inventory, expenses, quotations, deliveries and reports — all from one powerful platform.",
  openGraph: {
    type: "website",
    siteName: "BizRavana",
    locale: "en_LK",
    url: SITE_URL,
    title: "BizRavana — Your business. Under control.",
    description:
      "Manage orders, customers, inventory, expenses, quotations, deliveries and reports — all from one powerful platform.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BizRavana — Your business. Under control.",
    description:
      "Manage orders, customers, inventory, expenses, quotations, deliveries and reports — all from one powerful platform.",
  },
};

// Brand-level structured data, present on every public page. Contact info
// reads from the same config the contact page uses, so it never drifts.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BizRavana",
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512x512.png`,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: `+94${CONTACT.phone.slice(1)}`,
    contactType: "customer service",
    email: CONTACT.email,
    availableLanguage: ["en", "si", "ta"],
  },
};

// Runs before first paint: resolve the theme from localStorage (else the ink
// "dark" default — the site's primary design; the cream light variant is
// opt-in via the toggle), then set `data-theme` on <html> so the correct
// theme applies with no flash of the wrong one. landing.css scopes those
// theme overrides to `.landing-site` (via `html[data-theme="..."]`), so the
// rest of the app is unaffected.
const themeInitScript = `(function () {
  try {
    var stored = localStorage.getItem("theme");
    var theme = stored === "light" || stored === "dark" ? stored : "dark";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();`;

// The inline theme script sets `data-theme` on <html> before hydration, so
// React sees an attribute it didn't render on the server. suppressHydrationWarning
// opts the element out of that check (standard for theme scripts; the
// attribute is applied pre-paint and matches the client state anyway).
//
// The `type` switch follows this Next.js version's own docs
// (docs/01-app/02-guides/preventing-flash-before-hydration.md): rendered as
// `text/javascript` on the server the script executes during HTML parsing;
// as `text/plain` on the client React won't treat it as an executable script
// while hydrating.
//
// `.landing-site` scopes every landing style (variables, base element rules,
// BEM component classes) so the dashboard and auth pages keep their own
// Tailwind tokens untouched.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={`landing-site ${poiret.variable} ${quicksand.variable}`}>
      <JsonLd data={organizationJsonLd} />
      <script
        type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: themeInitScript }}
      />
      <ThemeProvider>
        <SmoothScroll />
        {/* Preserves the auth-callback hash/query handling that used to live
            in the old root page.tsx (Supabase implicit-flow callbacks land on
            "/"). Renders nothing otherwise. */}
        <AuthCallbackHandler />
        {children}
        {/* Vercel Analytics — kept in the site layout (not the root one) so
            it only tracks the public landing site, never the logged-in
            dashboard, auth, or admin routes. */}
        <Analytics />
      </ThemeProvider>
    </div>
  );
}
