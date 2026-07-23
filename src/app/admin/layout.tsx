"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  Bell,
  Boxes,
  Building2,
  CreditCard,
  Crown,
  HardDrive,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";

// ══════════════════════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════════════════════

interface AdminNavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

const adminNav: (AdminNavItem | { divider: true })[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Businesses", href: "/admin/businesses", icon: Building2 },
  { label: "Pending Payments", href: "/admin/payments", icon: Wallet },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { label: "Plans", href: "/admin/plans", icon: Crown },
  { label: "Trials", href: "/admin/trials", icon: Boxes },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { divider: true },
  { label: "Cleanup Queue", href: "/admin/cleanup", icon: Trash2 },
  { label: "Storage", href: "/admin/storage", icon: HardDrive },
  { label: "Activity Log", href: "/admin/activity-log", icon: Activity },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

// Mobile bottom nav items (subset of main nav)
const mobileAdminNav = adminNav.filter(
  (item): item is AdminNavItem => !("divider" in item),
);

// ══════════════════════════════════════════════════════════════════
// MOBILE BOTTOM NAV
// ══════════════════════════════════════════════════════════════════

function MobileBottomNav({
  pathname,
  onNav,
}: {
  pathname: string;
  onNav: () => void;
}) {
  // Show up to 5 primary items on the bottom nav
  const primaryItems: AdminNavItem[] = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Businesses", href: "/admin/businesses", icon: Building2 },
    { label: "Payments", href: "/admin/payments", icon: Wallet },
    { label: "Subs", href: "/admin/subscriptions", icon: CreditCard },
    { label: "More", href: "#menu", icon: Menu },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden"
      aria-label="Mobile admin navigation"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex h-16 items-center border-t border-border/50 bg-background/95 backdrop-blur-xl shadow-[0_-1px_4px_rgba(0,0,0,0.08)]">
        <div className="grid h-full w-full grid-cols-5 items-center px-2">
          {primaryItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            if (item.href === "#menu") {
              return (
                <button
                  key="menu-btn"
                  type="button"
                  onClick={onNav}
                  className="group relative flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 px-1 transition-all duration-150 text-muted-foreground/60 hover:text-muted-foreground/85"
                  aria-label="Open navigation menu"
                >
                  <Icon className="size-[21px] shrink-0 text-muted-foreground/55 group-hover:text-muted-foreground/75" />
                  <span className="max-w-full truncate text-[10px] font-medium leading-tight text-muted-foreground/60">
                    More
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNav}
                className={cn(
                  "group relative flex min-h-[44px] w-full flex-col items-center justify-center gap-0.5 px-1 transition-all duration-150",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground/60 hover:text-muted-foreground/85",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary" />
                )}
                <Icon
                  className={cn(
                    "size-[21px] shrink-0 transition-colors duration-150",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground/55 group-hover:text-muted-foreground/75",
                  )}
                />
                <span
                  className={cn(
                    "max-w-full truncate text-[10px] font-medium leading-tight",
                    isActive ? "text-primary font-semibold" : "text-muted-foreground/60",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// ══════════════════════════════════════════════════════════════════
// MOBILE NAV DRAWER (Sheet)
// ══════════════════════════════════════════════════════════════════

function MobileNavDrawer({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const router = useRouter();

  const handleNav = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
    },
    [router, onClose],
  );

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="left" showCloseButton={false} className="w-[85vw] max-w-[320px] p-0 !bg-card !backdrop-blur-2xl">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border/20 px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">Admin Panel</p>
              <p className="text-xs text-muted-foreground/70">Super Admin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-all"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {adminNav.map((item, idx) => {
            if ("divider" in item) {
              return (
                <div key={`divider-${idx}`} className="my-2 h-px bg-border/20" />
              );
            }
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNav(item.href)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Icon className="size-4.5 shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border/20 p-3">
          <button
            type="button"
            onClick={() => handleNav("/dashboard")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground transition-all"
          >
            <LayoutDashboard className="size-4.5 shrink-0" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ══════════════════════════════════════════════════════════════════
// DESKTOP SIDEBAR
// ══════════════════════════════════════════════════════════════════

function DesktopSidebar({
  collapsed,
  pathname,
  onToggle,
}: {
  collapsed: boolean;
  pathname: string;
  onToggle: () => void;
}) {
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 hidden lg:flex h-screen flex-col border-r border-border/40 bg-card transition-all duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center gap-3 border-b border-border/20 px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Shield className="size-5 text-primary" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Admin Panel</p>
            <p className="text-xs text-muted-foreground/70">Super Admin</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {adminNav.map((item, idx) => {
          if ("divider" in item) {
            return (
              <div key={`divider-${idx}`} className="my-2 h-px bg-border/20" />
            );
          }
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Icon className="size-4.5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/20 p-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="flex-1 justify-center text-muted-foreground/60 hover:text-foreground"
          >
            <span className="text-xs">{collapsed ? "→" : "←"}</span>
            {!collapsed && <span className="text-xs">Collapse</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="text-muted-foreground/60 hover:text-foreground"
            title="Back to Dashboard"
          >
            <LayoutDashboard className="size-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

// ══════════════════════════════════════════════════════════════════
// LAYOUT
// ══════════════════════════════════════════════════════════════════

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // ── Auth check ────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace("/login?redirect=/admin");
          return;
        }

        const isSa = session.user.app_metadata?.is_super_admin === true;
        setIsSuperAdmin(isSa);

        if (!isSa) {
          router.replace("/dashboard");
        }
      } catch {
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }, []);

  // ── Close mobile drawer on route change ──────────────────
  useEffect(() => {
    if (mobileDrawerOpen) {
      setMobileDrawerOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ── Loading ───────────────────────────────────────────────
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 animate-pulse rounded-xl bg-primary/20" />
          <div className="h-4 w-40 animate-pulse rounded-lg bg-muted/30" />
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return null; // Will redirect
  }

  const currentPageLabel =
    (adminNav.filter((n): n is AdminNavItem => !("divider" in n)) as AdminNavItem[])
      .find(
        (n) =>
          n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href),
      )?.label || "Admin";

  return (
    <div className="flex min-h-screen bg-background">
      {/* ═══ DESKTOP SIDEBAR (hidden on mobile) ═════════════ */ }
      <DesktopSidebar
        collapsed={sidebarCollapsed}
        pathname={pathname}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* ═══ MOBILE NAV DRAWER (Sheet) ══════════════════════ */ }
      <MobileNavDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        pathname={pathname}
      />

      {/* ═══ MAIN CONTENT ════════════════════════════════════ */ }
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-200",
          "min-w-0 max-w-full",
          "lg:ml-64",
          sidebarCollapsed && "lg:!ml-16",
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 px-4 lg:px-6 backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="flex lg:hidden size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground/70 hover:text-foreground hover:bg-muted/50 transition-all"
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </button>

            <h1 className="text-sm font-semibold text-foreground truncate">
              {currentPageLabel}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="flex items-center gap-2 rounded-xl p-1 hover:bg-muted/50 transition-colors" />
                }
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                    SA
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <LayoutDashboard className="size-3.5 mr-2" />
                  User Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="size-3.5 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main
          className={cn(
            "flex-1",
            "min-w-0 max-w-full",
            "p-4 lg:p-6",
            "overflow-x-hidden",
            "pb-20 lg:pb-6", // Extra bottom padding on mobile for bottom nav
          )}
        >
          {children}
        </main>
      </div>

      {/* ═══ MOBILE BOTTOM NAV (hidden on desktop) ══════════ */ }
      <MobileBottomNav
        pathname={pathname}
        onNav={() => setMobileDrawerOpen(true)}
      />
    </div>
  );
}
