import { cn } from "@/lib/utils";

/**
 * A thin vertical accent bar that appears on the left edge of an active nav item.
 */
export function NavActiveBar({ active }: { active: boolean }) {
  if (!active) return null;
  return <span className="sidebar-active-bar" />;
}

/**
 * Generates consistent className strings for sidebar nav item active/inactive states.
 *
 * Active state: dark elevated bg, bright accent icon, high-contrast white label,
 * left accent bar, subtle glow, rounded right edge.
 *
 * Inactive state: muted foreground, transparent background, subtle hover.
 *
 * @example
 * ```tsx
 * <button className={cn(baseClasses, navItemVariants({ active: isActive }))}>
 * ```
 */
export function navItemVariants({ active }: { active: boolean }) {
  return cn(
    active
      ? "font-semibold"
      : "text-sidebar-foreground/55 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground/85",
  );
}
