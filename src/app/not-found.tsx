import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Poiret_One, Quicksand } from "next/font/google";
import "./not-found.css";

// The landing site's own type system (same next/font options and variable
// names as the (site) layout) — self-hosted, no external requests. Poiret
// One heads the display (the giant 404, the title); Quicksand carries body
// and UI, exactly as on the marketing pages.
const poiret = Poiret_One({
  variable: "--font-poiret",
  subsets: ["latin"],
  weight: "400",
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "The page you're looking for doesn't exist or has moved.",
};

/** Suggested destinations — Home leads, the rest are supporting exits. */
const LINKS = [
  { label: "Home", href: "/", primary: true },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

/**
 * Global 404 — rendered by the root layout for any unmatched URL, so this
 * page carries its own styling (the landing site's ink/accent palette and
 * the root layout's loaded fonts) instead of depending on either layout's
 * scoped stylesheet. Small and dependency-free on purpose: this is the page
 * visitors land on when they hit a dead link.
 */
export default function NotFound() {
  return (
    <main className={`nf ${poiret.variable} ${quicksand.variable}`}>
      <div className="nf__blobs" aria-hidden="true" />

      <div className="nf__inner">
        <Link className="nf__brand" href="/" aria-label="BizRavana — Home">
          {/* The real emblem — this page is always on the ink theme, so the
              white (dark-mode) mark is the one shown. */}
          <span className="nf__logo" aria-hidden="true">
            <Image
              src="/brand-logo-dark.png"
              alt=""
              width={560}
              height={786}
              priority
              className="brand-logo"
            />
          </span>
          <span className="nf__brand-name">BizRavana</span>
        </Link>

        <p className="nf__eyebrow">404 · Page not found</p>
        <div className="nf__code" aria-hidden="true">
          404
        </div>
        <h1 className="nf__title">Looks like you&rsquo;ve taken a wrong turn.</h1>
        <p className="nf__desc">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
          Don&rsquo;t worry — it happens to the best of us.
        </p>

        <nav className="nf__links" aria-label="Suggested pages">
          {LINKS.map(({ label, href, primary }) => (
            <Link
              key={label}
              href={href}
              className={`nf__btn${primary ? " nf__btn--primary" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <p className="nf__hint">
          Looking for something specific? Try the{" "}
          <Link className="nf__hint-link" href="/help-center">
            Help Center
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
