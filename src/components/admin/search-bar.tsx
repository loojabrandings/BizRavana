"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { ReactNode } from "react";

interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Optional extra controls rendered next to search (filter buttons, date range, etc.) */
  extras?: ReactNode;
  /** Active filter count for visual indicator */
  filterCount?: number;
  /** Callback to clear all filters */
  onClearFilters?: () => void;
  className?: string;
}

export function AdminSearchBar({
  value,
  onChange,
  placeholder = "Search...",
  extras,
  filterCount = 0,
  onClearFilters,
  className,
}: AdminSearchBarProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0", className)}>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none sm:w-64">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-9 h-9 text-sm w-full"
          />
        </div>

        {extras && (
          <div className="flex items-center gap-2 shrink-0">
            {extras}
          </div>
        )}

        {filterCount > 0 && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex shrink-0 h-7 items-center gap-1 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground active:scale-95"
          >
            <span className="inline-flex items-center justify-center rounded-full bg-primary/15 px-1.5 text-sm font-semibold text-primary leading-none">
              {filterCount}
            </span>
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
