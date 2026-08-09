"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
        <h1 className="text-xl font-semibold leading-[1.25] tracking-tight text-foreground break-words sm:text-2xl">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground break-words">{subtitle}</p>
        )}
      </div>

      {customAction ? (
        <div className="shrink-0">{customAction}</div>
      ) : actions && actions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {actions.map((action) => (
            <Button
              key={action.label}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              size="md"
              variant={
                action.variant === "primary" || !action.variant
                  ? "default"
                  : action.variant
              }
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
