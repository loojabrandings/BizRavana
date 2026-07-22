"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  isLoading?: boolean;
  iconColor?: string;
  compact?: boolean;
}

export function StatsCard({ label, value, icon: Icon, trend, isLoading, iconColor, compact }: StatsCardProps) {
  if (isLoading) {
    return (
      <div className={cn(
        "group relative overflow-hidden rounded-2xl glass-card",
        compact ? "p-3" : "p-5",
      )}>
        <div className={compact ? "flex items-center gap-3" : "space-y-4"}>
          <div className={cn("animate-pulse rounded-xl bg-muted/60", compact ? "size-8" : "h-10 w-10")} />
          <div className="space-y-2">
            <div className={cn("animate-pulse rounded-md bg-muted/60", compact ? "h-3 w-16" : "h-3.5 w-24")} />
            <div className={cn("animate-pulse rounded-md bg-muted/60", compact ? "h-4 w-12" : "h-7 w-20")} />
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="group relative overflow-hidden rounded-2xl glass-card p-3.5 transition-all duration-200 hover:shadow-md hover:border-primary/15">
        <div className="relative flex items-center gap-3">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-all duration-200",
              iconColor
                ? iconColor
                : "bg-primary/10 text-primary ring-primary/15",
            )}
          >
            <Icon className="size-[16px]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold tracking-tight text-foreground tabular-nums">
              {value}
            </p>
            <p className="text-sm text-muted-foreground truncate">{label}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl glass-card p-5 transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5">
      {/* Subtle hover gradient overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-gradient-to-br from-primary/[0.02] to-transparent" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset transition-all duration-200 group-hover:scale-105 group-hover:shadow-sm",
              iconColor
                ? iconColor
                : "bg-primary/10 text-primary ring-primary/15",
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </div>
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium transition-all",
                trend.positive
                  ? "bg-success/15 text-success"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              <svg
                className={cn(
                  "h-2.5 w-2.5",
                  trend.positive ? "rotate-0" : "rotate-180",
                )}
                viewBox="0 0 10 6"
                fill="none"
              >
                <path
                  d="M0 6L5 0L10 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {trend.value}
            </span>
          )}
        </div>

        <div className="mt-4 space-y-1">
          <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}
