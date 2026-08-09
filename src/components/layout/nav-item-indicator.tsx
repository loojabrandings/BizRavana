import { cn } from "@/lib/utils";

/**
 * Generates consistent className strings for sidebar nav item active/inactive states.
 *
 * Active state: dark elevated bg, bright accent icon, high-contrast white label,
 * subtle glow, rounded right edge.
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
      ? "bg-sidebar-primary/12 font-semibold text-sidebar-foreground ring-1 ring-inset ring-sidebar-primary/20 shadow-sm"
      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
  );
}
