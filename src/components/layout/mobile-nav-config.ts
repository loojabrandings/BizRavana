import {
  Home,
  type LucideIcon,
  MoreHorizontal,
  Package,
  ShoppingCart,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────

export interface MobileNavLinkItem {
  type: "link";
  label: string;
  href: string;
  icon: LucideIcon;
  /** Path patterns to match for active state. Falls back to `href` if omitted. */
  match?: string[];
}

export interface MobileNavQuickActionItem {
  type: "quick-action";
}

export interface MobileNavDrawerItem {
  type: "drawer";
  label: string;
  icon: LucideIcon;
}

export type MobileNavItem =
  | MobileNavLinkItem
  | MobileNavQuickActionItem
  | MobileNavDrawerItem;

// ─── Navigation Configuration (single source of truth) ───────

/**
 * Shared mobile bottom navigation items.
 * - 5-column layout: Home | Orders | Quick Action | Expenses | More
 * - Quick Action is the center floating button
 * - More opens a right-side drawer with the full sidebar
 */
export const mobileNavItems: MobileNavItem[] = [
  {
    type: "link",
    label: "Home",
    href: "/dashboard",
    icon: Home,
    match: ["/dashboard"],
  },
  {
    type: "link",
    label: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
    match: ["/dashboard/orders"],
  },
  { type: "quick-action" },
  {
    type: "link",
    label: "Expenses",
    href: "/dashboard/expenses",
    icon: Package,
    match: ["/dashboard/expenses"],
  },
  {
    type: "drawer",
    label: "More",
    icon: MoreHorizontal,
  },
];

// ─── Active Route Helpers ─────────────────────────────────────

/**
 * Checks if the current pathname matches any of the given patterns.
 * Supports exact match and sub-route match for patterns with 2+ segments.
 */
export function isActiveRoute(
  pathname: string,
  matchPatterns?: string[],
): boolean {
  if (!matchPatterns || matchPatterns.length === 0) return false;

  return matchPatterns.some((pattern) => {
    if (pathname === pattern) return true;
    // Match sub-routes (e.g. /dashboard/orders/123 → Orders active)
    const segments = pattern.split("/").filter(Boolean);
    if (segments.length > 1 && pathname.startsWith(pattern + "/")) return true;
    return false;
  });
}
