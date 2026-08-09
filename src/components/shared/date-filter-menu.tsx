"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Types ────────────────────────────────────────────────────────

interface DateFilterOption {
  value: string;
  label: string;
}

interface DateFilterMenuProps {
  /** Currently active filter value */
  value: string;
  /** Preset options (e.g. dateFilterOptions from lib/date-utils) */
  options: readonly DateFilterOption[] | DateFilterOption[];
  /** Called when a preset is selected. Pass "custom" through to open the date range picker. */
  onSelect: (value: string) => void;
  /** Label shown when `value` doesn't match any option */
  fallbackLabel?: string;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────
// A single calendar-icon control that opens the preset dropdown,
// matching the dashboard's date filter. "Custom" is passed to
// `onSelect` so callers can open the DateRangePickerModal.

export function DateFilterMenu({
  value,
  options,
  onSelect,
  fallbackLabel = "Filter by date",
  className,
}: DateFilterMenuProps) {
  const currentLabel =
    options.find((option) => option.value === value)?.label ?? fallbackLabel;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-9 items-center justify-between gap-2 rounded-xl border px-3 text-sm font-medium transition-all select-none outline-none",
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-95",
          "data-popup-open:bg-accent data-popup-open:text-accent-foreground",
          value === "custom"
            ? "border-primary/30 bg-primary/5 text-primary data-popup-open:border-primary/40"
            : "border-input bg-transparent",
          className,
        )}
        aria-label={`Filter by date: ${currentLabel}`}
        title="Filter by date"
      >
        <CalendarDays className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">{currentLabel}</span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground/60 transition-transform duration-200 group-data-[popup-open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[180px] p-1.5">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className={cn(
              "rounded-lg text-sm",
              value === option.value && "bg-primary/10 font-semibold text-primary",
            )}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
