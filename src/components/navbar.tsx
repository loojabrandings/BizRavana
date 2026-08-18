"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Sparkles,
  CreditCard,
  Building2,
  MessageSquare,
  ChevronRight,
  LogIn,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Button from "@/components/button";
import ThemeToggle from "./theme-toggle";

/** The real BizRavana emblem — white on the ink theme, ink on the cream
 *  theme (CSS toggles the visible one via data-theme). */
function BrandMark() {
  return (
    <span className="navbar__logo" aria-hidden="true">
      <Image
        src="/brand-logo-dark.png"
        alt=""
        width={560}
        height={786}
        priority
        className="brand-logo brand-logo--dark"
      />
      <Image
        src="/brand-logo-light.png"
        alt=""
        width={560}
        height={809}
        className="brand-logo brand-logo--light"
      />
    </span>
  );
}

interface NavLinkItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: string;
}

const NAV_LINKS: NavLinkItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Features",
    href: "/features",
    icon: Sparkles,
  },
  {
    label: "Pricing",
    href: "/pricing",
    icon: CreditCard,
  },
  {
    label: "About",
    href: "/about",
    icon: Building2,
  },
  {
    label: "Contact",
    href: "/contact",
    icon: MessageSquare,
  },
];

/** "Login" — routes to the app's /login page. */
const LOGIN_LABEL = "Login";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [menuOpen]);

  // Close the mobile menu on Escape key
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
          <BrandMark />
          <span>BizRavana</span>
        </Link>

        {/* Desktop links — frosted pill group */}
        <ul className="navbar__links">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = href === pathname;
            return (
              <li key={label}>
                <Link
                  className="navbar__link"
                  data-label={label}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                >
                  {label}
                </Link>
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
            {menuOpen ? (
              <X className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Redesigned Mobile Flyout Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Soft Blurred Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="navbar__mobile-backdrop"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Elevated Floating Glass Card */}
            <motion.div
              id="navbar-menu"
              initial={{ opacity: 0, y: -14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="navbar__mobile-panel"
            >
              {/* Navigation Items */}
              <ul className="navbar__mobile-nav">
                {NAV_LINKS.map(({ label, href, icon: Icon, badge }, index) => {
                  const isActive = href === pathname;
                  return (
                    <motion.li
                      key={label}
                      className="navbar__mobile-item"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * (index + 1), duration: 0.2 }}
                    >
                      <Link
                        className={`navbar__mobile-link${isActive ? " is-active" : ""}`}
                        href={href}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => setMenuOpen(false)}
                      >
                        <div className="navbar__mobile-icon-box">
                          <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className="navbar__mobile-title">
                          <span>{label}</span>
                          {badge && <span className="navbar__mobile-badge">{badge}</span>}
                          {isActive && (
                            <span className="navbar__mobile-active-dot" aria-hidden="true" />
                          )}
                        </span>
                        <ChevronRight className="navbar__mobile-arrow w-4 h-4" />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              <div className="navbar__mobile-divider" />

              {/* Action Buttons */}
              <div className="navbar__mobile-cta-group">
                <Link
                  href="/register"
                  className="navbar__mobile-btn-primary"
                  onClick={() => setMenuOpen(false)}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Link>

                <Link
                  href="/login"
                  className="navbar__mobile-btn-secondary"
                  onClick={() => setMenuOpen(false)}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              </div>

              {/* Quick Status / Footer */}
              <div className="navbar__mobile-footer">
                <span className="flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>🇱🇰 Built for Sri Lankan Commerce</span>
                </span>
                <span className="text-[11px] opacity-75">v1.0</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
