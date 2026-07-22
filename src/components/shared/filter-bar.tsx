"use client";

import { Calendar, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/ui/dropdown";

// ─── Types ────────────────────────────────────────────────────────

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  /** Current search query value */
  searchQuery: string;
  /** Called when the search input changes */
  onSearchChange: (value: string) => void;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Status / category filter props */
  status?: {
    value: string;
    onChange: (value: string | null) => void;
    options: readonly FilterOption[] | FilterOption[];
    /** Custom label for the dropdown — defaults to "Status" */
    label?: string;
  };
  /** Payment / secondary status filter props */
  payment?: {
    value: string;
    onChange: (value: string | null) => void;
    options: readonly FilterOption[] | FilterOption[];
    /** Custom label for the dropdown — defaults to "Payment" */
    label?: string;
  };
  /** Date filter props */
  date?: {
    value: string;
    onChange: (value: string | null) => void;
    options: readonly FilterOption[] | FilterOption[];
    /** Called when the calendar icon is clicked to toggle custom date inputs */
    onCalendarClick?: () => void;
    /** Whether custom date mode is active */
    isCustomMode?: boolean;
  };
  /** Active filter count for the clear button */
  activeFilterCount?: number;
  /** Called when the clear button is clicked */
  onClearFilters?: () => void;
  /** Additional className for the container */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────

export function FilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search by order no, name, item, phone, or tracking...",
  status,
  payment,
  date,
  activeFilterCount = 0,
  onClearFilters,
  className,
}: FilterBarProps) {
  const hasAnyDropdown = status || payment || date;

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}>
      {/* ─── Search ──────────────────────────────────────────── */}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
        <Input
          placeholder={searchPlaceholder}
          className="h-9 pl-9 text-sm rounded-xl"
          aria-label="Search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* ─── Controls ───────────────────────────────────────── */}
      {hasAnyDropdown && (
        <div className="flex items-center justify-center gap-3 w-full sm:w-auto sm:gap-2.5 sm:justify-start flex-nowrap">
          {/* Status dropdown */}
          {status && (
            <Dropdown
              value={status.value}
              onChange={status.onChange}
              options={status.options.map((o) => ({ value: o.value, label: o.label }))}
              label={status.label ?? "Status"}
              size="default"
              className="min-w-0 flex-1 sm:min-w-[110px] sm:flex-none h-9 text-sm"
            />
          )}

          {/* Payment dropdown */}
          {payment && (
            <Dropdown
              value={payment.value}
              onChange={payment.onChange}
              options={payment.options.map((o) => ({ value: o.value, label: o.label }))}
              label={payment.label ?? "Payment"}
              size="default"
              className="min-w-0 flex-1 sm:min-w-[110px] sm:flex-none h-9 text-sm"
            />
          )}

          {/* Date calendar button */}
          {date && (
            <button
              type="button"
              onClick={date.onCalendarClick}
              className={cn(
                "inline-flex shrink-0 h-9 w-9 items-center justify-center rounded-xl border transition-all",
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-95",
                date.isCustomMode
                  ? "border-primary/30 bg-primary/5 text-primary"
                  : "border-input bg-transparent",
              )}
              aria-label="Filter by date"
              title="Filter by date"
            >
              <Calendar className="size-4" />
            </button>
          )}

          {/* Clear filters */}
          {activeFilterCount > 0 && onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex shrink-0 h-7 items-center gap-1 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground active:scale-95"
            >
              <X className="size-3" />
              Clear
              <span className="inline-flex items-center justify-center rounded-full bg-primary/15 px-1.5 text-sm font-semibold text-primary leading-none">
                {activeFilterCount}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
