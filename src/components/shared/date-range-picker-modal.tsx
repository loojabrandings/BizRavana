"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Constants ────────────────────────────────────────────────────

/** Weekday headers, Monday-first, matching the reference design. */
const WEEKDAY_LABELS = ["Mn", "Ts", "Wd", "Th", "Fr", "St", "Sn"];

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Years offered in the year selector: 20 years back → next year. */
function yearOptions(): number[] {
  const current = new Date().getFullYear();
  return Array.from({ length: 22 }, (_, i) => current - 20 + i);
}

// ─── Helpers ──────────────────────────────────────────────────────

function parseDateKey(value: string): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toDateKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/** Display format used in the Start/End fields (matches the reference). */
function toDisplay(d: Date | null): string {
  return d ? format(d, "yyyy MM dd") : "";
}

/** Ordered (start ≤ end) parse of the applied range. */
function parseRange(from: string, to: string): { from: Date | null; to: Date | null } {
  let start = parseDateKey(from);
  let end = parseDateKey(to);
  if (start && end && start > end) {
    const tmp = start;
    start = end;
    end = tmp;
  }
  return { from: start, to: end };
}

// ─── Types ────────────────────────────────────────────────────────

export interface DateRangePickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Currently applied custom range start, "yyyy-MM-dd" or "". */
  from: string;
  /** Currently applied custom range end, "yyyy-MM-dd" or "". */
  to: string;
  /** Called with the applied "yyyy-MM-dd" range. */
  onApply: (from: string, to: string) => void;
}

// ─── Month Grid ───────────────────────────────────────────────────

function MonthGrid({
  month,
  draftFrom,
  draftTo,
  onSelectDay,
  onNavigate,
  onMonthChange,
  onYearChange,
}: {
  month: Date;
  draftFrom: Date | null;
  draftTo: Date | null;
  onSelectDay: (day: Date) => void;
  onNavigate: (amount: number) => void;
  onMonthChange: (monthIndex: number) => void;
  onYearChange: (year: number) => void;
}) {
  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [month]);

  const years = useMemo(() => yearOptions(), []);

  return (
    <div className="select-none">
      {/* ─── Header: nav arrows + month/year dropdowns ─────── */}
      <div className="flex items-center justify-between gap-1 px-1 pb-2">
        <button
          type="button"
          onClick={() => onNavigate(-1)}
          aria-label="Previous month"
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground active:scale-95"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div className="flex min-w-0 items-center gap-1.5">
          <select
            value={month.getMonth()}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            aria-label="Select month"
            className="h-7 cursor-pointer rounded-lg border border-border bg-background px-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:border-primary/30 focus:border-ring"
          >
            {MONTH_LABELS.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={month.getFullYear()}
            onChange={(e) => onYearChange(Number(e.target.value))}
            aria-label="Select year"
            className="h-7 cursor-pointer rounded-lg border border-border bg-background px-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:border-primary/30 focus:border-ring"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => onNavigate(1)}
          aria-label="Next month"
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground active:scale-95"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* ─── Weekday header ───────────────────────────────── */}
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="flex h-8 items-center justify-center text-[11px] font-medium text-muted-foreground/60"
          >
            {label}
          </div>
        ))}

        {/* ─── Day cells ──────────────────────────────────── */}
        {days.map((day) => {
          const isOutside = !isSameMonth(day, month);
          const isStart = draftFrom !== null && isSameDay(day, draftFrom);
          const isEnd = draftTo !== null && isSameDay(day, draftTo);
          const isSelected = isStart || isEnd;
          const inRange =
            draftFrom !== null &&
            draftTo !== null &&
            day > draftFrom &&
            day < draftTo;
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={toDateKey(day)}
              type="button"
              onClick={() => onSelectDay(day)}
              disabled={isOutside}
              aria-label={format(day, "dd MMMM yyyy")}
              className={cn(
                "relative flex h-8 items-center justify-center rounded-full text-[13px] tabular-nums transition-colors outline-none",
                isOutside
                  ? "pointer-events-none text-muted-foreground/30"
                  : "cursor-pointer text-foreground",
                inRange && "bg-primary/15 text-foreground",
                isSelected &&
                  "bg-primary font-semibold text-primary-foreground shadow-sm",
                !isSelected && !isOutside && "hover:bg-primary/10",
                isToday && !isSelected && "ring-1 ring-inset ring-primary/40",
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Dialog Body (mounted fresh on every open, so draft state seeds) ──

function DateRangePickerContent({
  open,
  from,
  to,
  onApply,
  onOpenChange,
}: {
  open: boolean;
  from: string;
  to: string;
  onApply: (from: string, to: string) => void;
  onOpenChange: (open: boolean) => void;
}) {
  // Draft selection starts from the applied range whenever the dialog opens.
  const [draft, setDraft] = useState<{ from: Date | null; to: Date | null }>(
    () => parseRange(from, to),
  );
  const [firstMonth, setFirstMonth] = useState<Date>(
    () => parseDateKey(from) ?? new Date(),
  );

  // Reset the draft on every open using React's render-time adjustment
  // pattern (no effect), so the dialog keeps its exit animation while still
  // starting each session from the last applied range.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setDraft(parseRange(from, to));
      setFirstMonth(parseDateKey(from) ?? new Date());
    }
  }

  const draftFrom = draft.from;
  const draftTo = draft.to;
  const secondMonth = addMonths(firstMonth, 1);

  const handleSelectDay = (day: Date) => {
    if (!draftFrom || (draftFrom && draftTo)) {
      // No range yet (or a complete one) → start a new range.
      setDraft({ from: day, to: null });
    } else if (day < draftFrom) {
      // Second click earlier than the start → swap so the range is ordered.
      setDraft({ from: day, to: draftFrom });
    } else {
      setDraft({ from: draftFrom, to: day });
    }
  };

  const handleApply = () => {
    if (!draftFrom || !draftTo) return;
    onApply(toDateKey(draftFrom), toDateKey(draftTo));
  };

  const canApply = draftFrom !== null && draftTo !== null;

  return (
    <DialogContent className="sm:max-w-[700px]" size="md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarDays className="size-4" />
          </span>
          Select Date Range
        </DialogTitle>
      </DialogHeader>

      {/* ─── Start / End display fields ───────────────────── */}
      <div className="grid shrink-0 grid-cols-2 gap-3">
        <div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Start
          </span>
          <div
            className={cn(
              "mt-1 flex h-9 items-center rounded-xl border bg-background px-3 text-sm font-medium tabular-nums",
              draftFrom ? "border-primary/40 text-foreground" : "border-input text-muted-foreground/60",
            )}
          >
            {toDisplay(draftFrom) || "—"}
          </div>
        </div>
        <div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            End
          </span>
          <div
            className={cn(
              "mt-1 flex h-9 items-center rounded-xl border bg-background px-3 text-sm font-medium tabular-nums",
              draftTo ? "border-primary/40 text-foreground" : "border-input text-muted-foreground/60",
            )}
          >
            {toDisplay(draftTo) || "—"}
          </div>
        </div>
      </div>

      {/* ─── Calendars: two months on desktop, one on mobile ── */}
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <MonthGrid
          month={firstMonth}
          draftFrom={draftFrom}
          draftTo={draftTo}
          onSelectDay={handleSelectDay}
          onNavigate={(amount) => setFirstMonth((m) => addMonths(m, amount))}
          onMonthChange={(index) =>
            setFirstMonth(new Date(firstMonth.getFullYear(), index, 1))
          }
          onYearChange={(year) =>
            setFirstMonth(new Date(year, firstMonth.getMonth(), 1))
          }
        />

        <div className="hidden md:block">
          <MonthGrid
            month={secondMonth}
            draftFrom={draftFrom}
            draftTo={draftTo}
            onSelectDay={handleSelectDay}
            onNavigate={(amount) => setFirstMonth((m) => addMonths(m, amount))}
            onMonthChange={(index) =>
              setFirstMonth(new Date(secondMonth.getFullYear(), index - 1, 1))
            }
            onYearChange={(year) =>
              setFirstMonth(new Date(year, secondMonth.getMonth() - 1, 1))
            }
          />
        </div>
      </div>

      {/* ─── Hint ─────────────────────────────────────────── */}
      {draftFrom && !draftTo && (
        <p className="mt-3 text-center text-xs font-medium text-muted-foreground">
          Select an end date to complete the range
        </p>
      )}

      {/* ─── Footer ───────────────────────────────────────── */}
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleApply} disabled={!canApply}>
          Apply
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ─── Component ────────────────────────────────────────────────────

export function DateRangePickerModal({
  open,
  onOpenChange,
  from,
  to,
  onApply,
}: DateRangePickerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DateRangePickerContent
        open={open}
        from={from}
        to={to}
        onApply={onApply}
        onOpenChange={onOpenChange}
      />
    </Dialog>
  );
}
