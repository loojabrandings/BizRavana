"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  Bell,
  Bug,
  Boxes,
  Building2,
  ChevronDown,
  CreditCard,
  Crown,
  HardDrive,
  LayoutDashboard,
  LogOut,
  Menu,
  Megaphone,
  Settings,
  Shield,
  Trash2,
  UserRound,
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
  { label: "Payments", href: "/admin/payments", icon: Wallet },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { label: "Plans", href: "/admin/plans", icon: Crown },
  { label: "Trials", href: "/admin/trials", icon: Boxes },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Ads", href: "/admin/ads", icon: Megaphone },
  { label: "Bug Reports", href: "/admin/bug-reports", icon: Bug },
  { divider: true },
  { label: "Cleanup Queue", href: "/admin/cleanup", icon: Trash2 },
  { label: "Storage", href: "/admin/storage", icon: HardDrive },
  { label: "Activity Log", href: "/admin/activity-log", icon: Activity },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

// Mobile bottom nav items (subset of main nav)
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
  const [adminIdentity, setAdminIdentity] = useState({
    name: "Super Admin",
    email: "",
    avatarUrl: null as string | null,
  });

  // ── Auth check ────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login?redirect=/admin");
          return;
        }

        const isSa = user.app_metadata?.is_super_admin === true;
        setIsSuperAdmin(isSa);
        setAdminIdentity({
          name:
            typeof user.user_metadata?.full_name === "string" &&
            user.user_metadata.full_name.trim()
              ? user.user_metadata.full_name.trim()
              : "Super Admin",
          email: user.email ?? "",
          avatarUrl:
            typeof user.user_metadata?.avatar_url === "string"
              ? user.user_metadata.avatar_url
              : null,
        });

        if (!isSa) {
          router.replace("/dashboard");
        }
      } catch {
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    };

    void checkAuth();
    window.addEventListener("admin-profile-updated", checkAuth);

    return () => {
      window.removeEventListener("admin-profile-updated", checkAuth);
    };
  }, [router]);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }, []);

  // ── Close mobile drawer on route change ──────────────────
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
    pathname === "/admin/profile"
      ? "Admin Profile"
      : (adminNav.filter(
            (n): n is AdminNavItem => !("divider" in n),
          ) as AdminNavItem[]
        ).find((n) =>
          n.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(n.href),
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
                className="h-auto border-0 bg-transparent p-0 shadow-none hover:border-transparent focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 dark:bg-transparent"
                render={
                  <button className="group/admin-avatar flex items-center gap-1.5 transition-all duration-200 hover:opacity-90 active:scale-95" />
                }
              >
                <div className="relative">
                  <Avatar className="size-8 shadow-xs [&::after]:!border-transparent">
                    <AvatarImage src={adminIdentity.avatarUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 via-primary/15 to-primary/30 text-xs font-bold text-primary shadow-inner">
                      {adminIdentity.name
                        .split(/\s+/)
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-success shadow-sm" />
                </div>
                <ChevronDown className="size-3 text-muted-foreground/50 transition-transform duration-200 group-hover/admin-avatar:text-foreground/70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="max-h-[calc(100vh-5rem)] w-72 overflow-y-auto rounded-2xl border-border/40 bg-popover/95 p-0 shadow-xl"
              >
                <div className="relative border-b border-border/30 bg-gradient-to-br from-primary/[0.06] via-transparent to-primary/[0.03] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <Avatar className="size-11 [&::after]:!border-transparent">
                        <AvatarImage
                          src={adminIdentity.avatarUrl || undefined}
                          alt={adminIdentity.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary/30 via-primary/20 to-primary/40 text-sm font-bold text-primary shadow-inner">
                          {adminIdentity.name
                            .split(/\s+/)
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-[2.5px] border-background bg-success shadow-sm" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-base font-semibold leading-5 text-foreground">
                          {adminIdentity.name}
                        </p>
                        <span className="inline-flex shrink-0 items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          Super Admin
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground/70">
                        {adminIdentity.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <DropdownMenuItem
                    onClick={() => router.push("/admin/profile")}
                    className="gap-3 rounded-xl px-2.5 py-2.5"
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                      <UserRound className="size-4" />
                    </span>
                    <span className="text-sm font-medium">Admin Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/admin/settings")}
                    className="gap-3 rounded-xl px-2.5 py-2.5"
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                      <Settings className="size-4" />
                    </span>
                    <span className="text-sm font-medium">Admin Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="mx-1 my-1.5" />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleLogout}
                    className="gap-3 rounded-xl px-2.5 py-2.5"
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-destructive/5 text-destructive">
                      <LogOut className="size-4" />
                    </span>
                    <span className="text-sm font-medium">Logout</span>
                  </DropdownMenuItem>
                </div>
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
