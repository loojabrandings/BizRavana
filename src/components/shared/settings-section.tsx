"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  children?: ReactNode;
  disabled?: boolean;
  badge?: string;
  className?: string;
}

export function SettingsSection({
  title,
  children,
  disabled = false,
  badge,
  className,
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        disabled && "opacity-50 pointer-events-none select-none",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2 px-0.5">
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            disabled ? "bg-muted-foreground/40" : "bg-primary",
          )}
        />
        <span className="truncate">{title}</span>
        {badge && (
          <span className="ml-auto text-xs text-muted-foreground/40 font-normal shrink-0">
            {badge}
          </span>
        )}
      </h3>
      <div className="rounded-xl bg-card/50 p-4 ring-1 ring-border/30">
        {children}
      </div>
    </section>
  );
}
