"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Building2,
  ChevronDown,
  LifeBuoy,
  LogOut,
  Search,
  UserCircle,
} from "lucide-react";
import { NotificationBell } from "@/components/notifications/notification-popover";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileRightDrawer } from "@/components/layout/mobile-right-drawer";
import { QuickActionSheet } from "@/components/layout/quick-action-sheet";
import { NetworkStatusIndicator } from "@/components/shared/network-status-indicator";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsDialog } from "@/components/shared/keyboard-shortcuts-dialog";
import { GlobalSearchDialog } from "@/components/shared/global-search-dialog";
import { GlobalSearchPopover } from "@/components/shared/global-search-popover";
import { useGlobalSearchStore } from "@/stores/global-search-store";
import { usePreferences } from "@/stores/preferences-store";
import { ReadOnlyModeProvider } from "@/providers/readonly-mode-provider";
import { NotificationProvider } from "@/providers/notification-provider";
import { ReadOnlyBanner } from "@/components/shared/readonly-banner";
import {
  hydrateStoresFromServer,
  setupAutoSync,
} from "@/lib/settings-sync";

// ─── Shared Avatar Dropdown (used on both mobile and desktop) ─────

function HeaderAvatarDropdown({
  userAvatar,
  userFullName,
  businessName,
  avatarInitials,
  onLogout,
  compact,
}: {
  userAvatar: string | null;
  userFullName: string;
  businessName: string;
  avatarInitials: string;
  onLogout: () => void;
  compact?: boolean;
}) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className={cn(
              "group/avatar-btn relative flex items-center justify-center rounded-xl transition-all duration-200",
              "hover:bg-accent/60 hover:text-accent-foreground",
              "active:scale-95",
              compact
                ? "size-10"
                : "ml-1 gap-2 p-1 pr-2.5",
            )}
          />
        }
      >
        <div className="relative">
          <Avatar className={cn(
            "shadow-xs transition-shadow duration-200 [&::after]:!border-transparent",
            "group-hover/avatar-btn:shadow-sm",
            compact ? "size-8" : "size-8",
          )}>
            <AvatarImage
              src={userAvatar || undefined}
              alt={userFullName}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 via-primary/15 to-primary/30 text-xs font-bold text-primary shadow-inner">
              {avatarInitials}
            </AvatarFallback>
          </Avatar>
          {/* Status indicator dot */}
          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-success shadow-sm" />
        </div>
        {!compact && (
          <ChevronDown className="size-3 text-muted-foreground/50 transition-transform duration-200 group-hover/avatar-btn:text-foreground/70 data-[state=open]:rotate-180" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 overflow-hidden rounded-xl border-border/40 p-0 shadow-lg"
      >
        {/* ─── Premium Header ───────────────────────────── */}
        <div className="relative bg-gradient-to-br from-primary/[0.04] via-transparent to-primary/[0.02] px-4 pb-3 pt-4">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <Avatar className="size-11 [&::after]:!border-transparent">
                <AvatarImage src={userAvatar || undefined} alt={userFullName} />
                <AvatarFallback className="bg-gradient-to-br from-primary/30 via-primary/20 to-primary/40 text-sm font-bold text-primary shadow-inner">
                  {avatarInitials}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-[2.5px] border-background bg-success shadow-sm" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {userFullName}
              </p>
              {businessName && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground/70">
                  {businessName}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-1.5">
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings/profile")} className="gap-2.5 rounded-lg py-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-muted/50 text-muted-foreground">
              <UserCircle className="size-3.5" />
            </span>
            <div>
              <span className="block text-xs font-medium">My Profile</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings/profile#business-profile")} className="gap-2.5 rounded-lg py-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-muted/50 text-muted-foreground">
              <Building2 className="size-3.5" />
            </span>
            <div>
              <span className="block text-xs font-medium">Business Profile</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings/preferences")} className="gap-2.5 rounded-lg py-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-muted/50 text-muted-foreground">
              <Bell className="size-3.5" />
            </span>
            <div>
              <span className="block text-xs font-medium">Preferences</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="mx-1 my-1" />

          <DropdownMenuItem onClick={() => router.push("/dashboard/help")} className="gap-2.5 rounded-lg py-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-muted/50 text-muted-foreground">
              <LifeBuoy className="size-3.5" />
            </span>
            <div>
              <span className="block text-xs font-medium">Help Center</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="mx-1 my-1" />

          <DropdownMenuItem variant="destructive" onClick={onLogout} className="gap-2.5 rounded-lg py-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-destructive/5 text-destructive">
              <LogOut className="size-3.5" />
            </span>
            <div>
              <span className="block text-xs font-medium">Logout</span>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN LAYOUT COMPONENT
// ═══════════════════════════════════════════════════════════════

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // ─── User / Business info for avatar dropdown ────────────────
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState("User");
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    let cleanupSync: (() => void) | null = null;
    let cancelled = false;

    const fetchUserInfo = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user || cancelled) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, business_id")
          .eq("user_id", session.user.id)
          .single();

        if (profile) {
          setUserFullName(profile.full_name || "User");
          setUserAvatar(profile.avatar_url);

          if (profile.business_id) {
            // ── Load settings from server into Zustand stores ──
            await hydrateStoresFromServer(supabase, profile.business_id);

            // ── Fetch business name ──
            const { data: business } = await supabase
              .from("businesses")
              .select("name")
              .eq("id", profile.business_id)
              .single();

            if (!cancelled) {
              if (business) {
                setBusinessName(business.name || "");
              }

              // ── Set up auto-sync for settings changes ──
              cleanupSync = setupAutoSync(supabase, profile.business_id);
            }
          }
        }
      } catch {
        // Fall back to defaults
      }
    };

    fetchUserInfo();

    return () => {
      cancelled = true;
      if (cleanupSync) {
        cleanupSync();
        cleanupSync = null;
      }
    };
  }, []);

  const avatarInitials = userFullName
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2) || "U";

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }, []);

  // ─── Global Search ─────────────────────────────────────────
  const { setIsOpen: setDialogOpen } = useGlobalSearchStore();
  const searchRef = useRef<{ focus: () => void }>(null);

  // ─── Background Style ─────────────────────────────────────
  const { backgroundStyle } = usePreferences();

  // ─── Mobile Navigation State ─────────────────────────────
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  const handleCloseDrawer = useCallback(() => setMobileDrawerOpen(false), []);
  const handleOpenDrawer = useCallback(() => setMobileDrawerOpen(true), []);
  const handleCloseQuickAction = useCallback(() => setQuickActionOpen(false), []);
  const handleOpenQuickAction = useCallback(() => setQuickActionOpen(true), []);

  // ─── Keyboard Shortcuts ────────────────────────────────────
  const { showHelp, setShowHelp } = useKeyboardShortcuts(router, {
    onOpenSearch: () => {
      if (window.innerWidth >= 768) {
        searchRef.current?.focus();
      } else {
        setDialogOpen(true);
      }
    },
  });

  // ─── Open search dialog (mobile) ────────────────────────────
  const openSearch = useCallback(() => setDialogOpen(true), [setDialogOpen]);

  return (
    <ReadOnlyModeProvider>
      <NotificationProvider>
      <KeyboardShortcutsDialog open={showHelp} onClose={() => setShowHelp(false)} />
      <GlobalSearchDialog />

      <div className={cn(backgroundStyle === "blobs" && "dashboard-bg", "flex min-h-screen text-foreground")}>
      <Sidebar />

      <div data-main-content className="flex min-w-0 flex-1 flex-col">
        <ReadOnlyBanner />
        <header className="glass-panel sticky top-0 z-30 backdrop-blur-xl bg-background/60 border-b border-border/40" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
          {/* ─── MOBILE / TABLET toolbar (< 1024px) ────────────────── */}
          <div className="flex h-16 items-center gap-2 px-4 lg:hidden">
            {/* Search icon button — always visible on mobile/tablet */}
            <button
              type="button"
              onClick={openSearch}
              className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-all hover:scale-105 hover:bg-accent hover:text-accent-foreground active:scale-95"
              aria-label="Open search"
              aria-expanded={false}
              aria-controls="global-search-dialog"
            >
              <Search className="size-[18px]" />
            </button>

            {/* Compact inline search field — visible on tablet (640px+) */}
            <div className="hidden sm:flex flex-1 max-w-[200px] h-9 items-center gap-1.5 rounded-xl border border-border/40 bg-muted/50 px-3 transition-all focus-within:border-primary/30 focus-within:bg-muted/80">
              <Search className="size-3.5 shrink-0 text-muted-foreground/50" />
              <input
                type="text"
                placeholder="Search..."
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                onFocus={openSearch}
                onClick={openSearch}
              />
            </div>

            {/* Spacer — fills remaining space on small mobile */}
            <div className="flex-1 sm:hidden" />

            {/* Right-side controls */}
            <div className="flex items-center gap-1">
              {/* Theme toggle */}
              <div className="flex transition-all hover:scale-105 active:scale-95">
                <ThemeToggle />
              </div>

              {/* Notification bell */}
              <div className="relative">
                <NotificationBell />
              </div>

              {/* User avatar dropdown */}
              <HeaderAvatarDropdown
                userAvatar={userAvatar}
                userFullName={userFullName}
                businessName={businessName}
                avatarInitials={avatarInitials}
                onLogout={handleLogout}
                compact
              />
            </div>
          </div>

          {/* ─── DESKTOP toolbar (≥ 1024px) — keep existing ──────── */}
          <div className="hidden h-16 items-center gap-4 px-4 lg:px-6 lg:flex">
            <GlobalSearchPopover ref={searchRef} />

            <div className="ml-auto flex items-center gap-1">
              <div className="transition-all hover:scale-105 active:scale-95">
                <ThemeToggle />
              </div>
              <div className="relative">
                <NotificationBell />
              </div>
              <NetworkStatusIndicator />
              <HeaderAvatarDropdown
                userAvatar={userAvatar}
                userFullName={userFullName}
                businessName={businessName}
                avatarInitials={avatarInitials}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 pb-[calc(var(--bottom-nav-height)_+_20px_+_env(safe-area-inset-bottom))] lg:pb-6">
          {children}
        </main>
      </div>
      </div>

      {/* ═══ Global Mobile Navigation Components ═══════════════ */}
      <MobileBottomNav
        onQuickAction={quickActionOpen ? handleCloseQuickAction : handleOpenQuickAction}
        onMoreDrawer={handleOpenDrawer}
        drawerOpen={mobileDrawerOpen}
        quickActionOpen={quickActionOpen}
      />
      <QuickActionSheet open={quickActionOpen} onClose={handleCloseQuickAction} />
      <MobileRightDrawer open={mobileDrawerOpen} onClose={handleCloseDrawer} />
    </NotificationProvider>
    </ReadOnlyModeProvider>
  );
}
