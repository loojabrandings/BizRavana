"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageHeaderAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  disabled?: boolean;
}

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  /** Primary actions rendered on the right (desktop) or stacked below (mobile) */
  actions?: PageHeaderAction[];
  /** Custom action element for complex scenarios (e.g., Add Plan button with icon) */
  customAction?: ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  subtitle,
  actions,
  customAction,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between min-w-0", className)}>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-foreground break-words">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-muted-foreground/70 break-words">{subtitle}</p>
        )}
      </div>

      {customAction ? (
        <div className="shrink-0">{customAction}</div>
      ) : actions && actions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all active:scale-95 min-h-[36px]",
                action.variant === "primary" || !action.variant
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  : action.variant === "secondary"
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : action.variant === "outline"
                      ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                action.disabled && "opacity-50 pointer-events-none",
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
