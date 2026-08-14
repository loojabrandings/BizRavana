"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Button from "@/components/button";
import ThemeToggle from "./theme-toggle";

// Home, About, Features, Pricing and Contact have real routes; the rest are
// placeholders until their pages ship (rendered as non-links, same as before).
const LINKS: { label: string; href?: string }[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

/** "Login" — routes to the app's /login page. */
const LOGIN_LABEL = "Login";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes (e.g. a menu link click).
  // Adjusting state during render (the docs' "store previous value" pattern)
  // keeps this out of an effect — no cascading re-render on route change.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  // Close the mobile menu on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="navbar">
      <nav className="navbar__inner" aria-label="Primary">
        <Link className="navbar__brand" href="/" aria-label="BizRavana — Home">
          <span className="navbar__logo" aria-hidden="true">
            B
          </span>
          <span>BizRavana</span>
        </Link>

        {/* Desktop links — one frosted pill group between brand and actions. */}
        <ul className="navbar__links">
          {LINKS.map(({ label, href }) => {
            const isActive = href === pathname;
            return (
              <li key={label}>
                {href ? (
                  <Link
                    className="navbar__link"
                    data-label={label}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {label}
                  </Link>
                ) : (
                  <span className="navbar__link" data-label={label}>
                    {label}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        <div className="navbar__actions">
          <div className="navbar__login">
            <Button variant="primary" size="sm" href="/login">
              {LOGIN_LABEL}
            </Button>
          </div>
          <ThemeToggle />
          <button
            type="button"
            className="navbar__toggle"
            aria-expanded={menuOpen}
            aria-controls="navbar-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="navbar__toggle-bar" />
            <span className="navbar__toggle-bar" />
            <span className="navbar__toggle-bar" />
          </button>
        </div>
      </nav>

      {/* Mobile menu panel — slides in under the bar on phones. */}
      <div id="navbar-menu" className={`navbar__menu${menuOpen ? " is-open" : ""}`}>
        <div className="navbar__menu-actions">
          <Button variant="primary" size="sm" href="/login">
            {LOGIN_LABEL}
          </Button>
        </div>
        <ul className="navbar__menu-links">
          {LINKS.map(({ label, href }) => {
            const isActive = href === pathname;
            return (
              <li key={label}>
                {href ? (
                  <Link
                    className="navbar__menu-link"
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ) : (
                  <span className="navbar__menu-link">{label}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
