"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Features", href: "/#features", section: "features" },
  { label: "Pricing", href: "/#pricing", section: "pricing" },
  { label: "Contact", href: "/contact" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleSectionClick = useCallback(
    (e: React.MouseEvent, sectionId: string) => {
      if (isHome) {
        // Already on the landing page — scroll directly
        e.preventDefault();
        document
          .getElementById(sectionId)
          ?.scrollIntoView({ behavior: "smooth" });
      } else {
        // Navigate to landing page — hash scroll picked up by HomePage
        e.preventDefault();
        router.push(`/?scrollTo=${sectionId}`);
      }
    },
    [isHome, router],
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <img
            src="/darkmode-logo.png"
            alt="BizRavana"
            className="h-7 w-auto object-contain"
          />
          <span className="max-sm:hidden">BizRavana</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {NAV_LINKS.map((link) =>
            "section" in link ? (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleSectionClick(e, link.section)}
                className="cursor-pointer transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {authLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-[10px] bg-muted" />
          ) : isLoggedIn ? (
            <Link href="/dashboard">
              <Button variant="default" size="sm" className="group relative overflow-hidden text-white">
                <span className="relative z-10">Open Dashboard</span>
                <span
                  aria-hidden
                  className="animate-shimmer absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.35)_50%,transparent_70%)] bg-[length:250%_100%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button variant="default" size="sm" className="group relative overflow-hidden text-white">
                <span className="relative z-10">Start Free Trial</span>
                <span
                  aria-hidden
                  className="animate-shimmer absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.35)_50%,transparent_70%)] bg-[length:250%_100%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
