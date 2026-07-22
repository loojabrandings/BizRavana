import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronDown, type LucideIcon } from "lucide-react";
import React from "react";

interface StatusListCardProps {
  title: string;
  icon: LucideIcon;
  count: number;
  footerLink: string;
  footerLabel: string;
  overflowLabel: string;
  activeColorClass?: string;
  activeBgClass?: string;
  emptyMessage: string;
  emptyHelperText?: string;
  children: React.ReactNode;
  /** Override the outer container's className (e.g. for min-height) */
  containerClassName?: string;
}

const MAX_VISIBLE_ITEMS = 3;

export function StatusListCard({
  title,
  icon: Icon,
  count,
  footerLink,
  footerLabel,
  overflowLabel,
  activeColorClass = "text-primary",
  activeBgClass = "bg-status-info-bg",
  emptyMessage,
  emptyHelperText,
  containerClassName,
  children,
}: StatusListCardProps) {
  const hasItems = count > 0;
  const hasOverflow = count > MAX_VISIBLE_ITEMS;
  const itemsArray = React.Children.toArray(children).slice(0, MAX_VISIBLE_ITEMS);

  return (
    <div className={cn("flex flex-col rounded-3xl glass-card overflow-hidden", containerClassName)}>
      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("size-4", hasItems ? activeColorClass : "text-muted-foreground/50")} />
          <h3 className={cn("text-sm font-semibold", hasItems ? "text-foreground" : "text-muted-foreground/60")}>
            {title}
          </h3>
          {hasItems && (
            <span className={cn("rounded-full px-2 py-0.5 text-sm font-semibold", activeBgClass, activeColorClass)}>
              {count}
            </span>
          )}
        </div>
      </div>

      {/* ─── List area — flex-1 fills space, footer stays pinned ── */}
      <div className="flex flex-1 flex-col px-5 overflow-hidden">
        {hasItems ? (
          <>
            {/* Data rows — up to 3 */}
            <div className="space-y-2">
              {itemsArray}
            </div>

            {/* Overflow indicator — only when count > 3 */}
            {hasOverflow && (
              <Link
                href={footerLink}
                className="relative mt-2 flex h-[52px] items-center justify-center gap-1.5 rounded-2xl text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/30"
              >
                {/* Subtle top fade mask */}
                <div className="pointer-events-none absolute inset-x-0 bottom-full h-6 bg-gradient-to-b from-transparent to-[var(--glass-bg)]" />
                <ChevronDown className="size-3.5" />
                {overflowLabel}
              </Link>
            )}

            {/* Flexible spacer — fills remaining space */}
            <div className="flex-1" />
          </>
        ) : (
          <>
            {/* Centered empty state */}
            <div className="flex flex-1 flex-col items-center justify-center text-center px-4">
              <p className="text-sm font-medium text-muted-foreground/70">{emptyMessage}</p>
              {emptyHelperText && (
                <p className="mt-1 text-sm text-muted-foreground/40">{emptyHelperText}</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-border/50">
        <Link
          href={footerLink}
          className="flex h-11 items-center justify-center gap-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5 active:bg-primary/10"
        >
          {footerLabel}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
