"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  mobileNavItems,
  isActiveRoute,
  type MobileNavItem,
} from "@/components/layout/mobile-nav-config";

// ─── Types ─────────────────────────────────────────────────────

interface MobileBottomNavProps {
  /** Called when the center quick action button is tapped */
  onQuickAction: () => void;
  /** Called when the More drawer button is tapped */
  onMoreDrawer: () => void;
  /** Whether the right-side drawer is currently open (controls visibility) */
  drawerOpen?: boolean;
  /** Whether the quick action sheet is currently open (controls toggle) */
  quickActionOpen?: boolean;
}

// ─── Styles ────────────────────────────────────────────────────

/** Height of the bottom nav bar (excludes safe-area) */
export const BOTTOM_NAV_HEIGHT = 68;

// ─── MobileNavItemLink ────────────────────────────────────────

function MobileNavItemLink({ item }: { item: MobileNavItem }) {
  const pathname = usePathname();

  if (item.type !== "link") return null;

  const active = isActiveRoute(pathname, item.match ?? [item.href!]);

  return (
    <Link
      href={item.href!}
      className={cn(
        "group relative flex min-w-0 min-h-[44px] w-full flex-col items-center justify-center gap-0.5 px-1",
        "transition-all duration-150",
        active
          ? "text-primary"
          : "text-muted-foreground/60 hover:text-muted-foreground/85",
      )}
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
    >
      {/* Active indicator dot */}
      {active && (
        <span className="absolute -top-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary" />
      )}

      <item.icon
        className={cn(
          "size-[21px] shrink-0 transition-colors duration-150",
          active
            ? "text-primary"
            : "text-muted-foreground/55 group-hover:text-muted-foreground/75",
        )}
        aria-hidden
      />
      <span
        className={cn(
          "max-w-full truncate text-[10px] font-medium leading-tight transition-colors duration-150",
          active
            ? "text-primary font-semibold"
            : "text-muted-foreground/60",
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}

// ─── MobileNavQuickAction ─────────────────────────────────────

function MobileNavQuickAction({ onTap, isOpen }: { onTap: () => void; isOpen?: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Spacer to maintain column alignment */}
      <div className="flex min-w-0 flex-col items-center justify-center gap-0.5">
        {/* Invisible text for alignment */}
        <span className="size-[21px]" aria-hidden />
        {/* Translucent hidden label to keep column balanced */}
        <span className="invisible text-[10px] font-medium leading-tight">
          Action
        </span>
      </div>

      {/* Floating plus button — overlaps upward from the nav bar */}
      <button
        type="button"
        onClick={onTap}
        className={cn(
          "absolute bottom-1 flex size-[54px] items-center justify-center",
          "rounded-2xl border-2 border-background",
          "bg-primary text-primary-foreground",
          "shadow-lg shadow-primary/25",
          "transition-all duration-200 ease-out",
          "hover:scale-105 hover:shadow-xl hover:shadow-primary/30",
          "active:scale-95 active:shadow-md",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isOpen && "rotate-45",
        )}
        aria-label="Quick actions"
        aria-expanded={isOpen ?? false}
        aria-controls="quick-action-sheet"
      >
        <Plus className="size-6 shrink-0" aria-hidden />
      </button>
    </div>
  );
}

// ─── MobileNavDrawerButton ────────────────────────────────────

function MobileNavDrawerButton({ item, onTap, isOpen }: { item: MobileNavItem; onTap: () => void; isOpen?: boolean }) {
  if (item.type !== "drawer") return null;

  return (
    <button
      type="button"
      onClick={onTap}
      className={cn(
        "group relative flex min-w-0 min-h-[44px] w-full flex-col items-center justify-center gap-0.5 px-1",
        "transition-all duration-150",
        "text-muted-foreground/60 hover:text-muted-foreground/85",
      )}
      aria-label={item.label}
      aria-expanded={isOpen ?? false}
      aria-controls="mobile-right-drawer"
      aria-haspopup="dialog"
    >
      <item.icon
        className="size-[21px] shrink-0 text-muted-foreground/55 group-hover:text-muted-foreground/75 transition-colors duration-150"
        aria-hidden
      />
      <span className="max-w-full truncate text-[10px] font-medium leading-tight text-muted-foreground/60">
        {item.label}
      </span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function MobileBottomNav({
  onQuickAction,
  onMoreDrawer,
  drawerOpen = false,
  quickActionOpen = false,
}: MobileBottomNavProps) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "block lg:hidden", // visible only below lg breakpoint
        drawerOpen && "hidden", // hide when drawer is open (spec requirement)
      )}
      aria-label="Mobile navigation"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div
        className={cn(
          "flex h-[var(--bottom-nav-height)] items-center",
          "bg-[var(--bottom-nav-bg)]",
          "border-t border-border/50",
          // shadow-sm is too subtle; use a compact shadow
          "shadow-[0_-1px_4px_rgba(0,0,0,0.08)]",
        )}
        style={{
          height: BOTTOM_NAV_HEIGHT,
        }}
      >
        {/* 5-column grid layout */}
        <div className="grid h-full w-full grid-cols-5 items-center px-2">
          {mobileNavItems.map((item) => {
            if (item.type === "link") {
              return <MobileNavItemLink key={item.href!} item={item} />;
            }
            if (item.type === "quick-action") {
              return (
                <MobileNavQuickAction
                  key="quick-action"
                  onTap={onQuickAction}
                  isOpen={quickActionOpen}
                />
              );
            }
            if (item.type === "drawer") {
              return (
                <MobileNavDrawerButton
                  key="drawer"
                  item={item}
                  onTap={onMoreDrawer}
                  isOpen={drawerOpen}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
    </nav>
  );
}
