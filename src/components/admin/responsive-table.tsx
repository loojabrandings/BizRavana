"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ReactNode } from "react";

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════

export interface Column<T> {
  /** Column header text */
  header: string;
  /** Render function for the cell content */
  accessor: (item: T) => ReactNode;
  /** Hide column below this breakpoint */
  hideBelow?: "sm" | "md" | "lg" | "xl";
  /** Additional className for the header and cell */
  className?: string;
  /** Header className override */
  headerClassName?: string;
  /** Cell className override */
  cellClassName?: string;
}

export interface MobileCardConfig<T> {
  /** Render a mobile card for the given item */
  render: (item: T) => ReactNode;
  /** Optional key to sort cards by (for display ordering on mobile) */
  sortKey?: string;
}

export interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  mobileCard: (item: T) => ReactNode;
  emptyState?: ReactNode;
  isLoading?: boolean;
  /** Breakpoint to switch between table and cards. Default: 'lg' (1024px) */
  breakpoint?: "sm" | "md" | "lg" | "xl";
  className?: string;
  containerClassName?: string;
}

// ══════════════════════════════════════════════════════════════════
// BREAKPOINT HELPERS
// ══════════════════════════════════════════════════════════════════

const hideClasses: Record<string, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
};

const showCardClasses: Record<string, string> = {
  sm: "block",
  md: "md:hidden",
  lg: "lg:hidden",
  xl: "xl:hidden",
  // Default (below lg) shows cards
  default: "block xl:hidden",
};

const showTableClasses: Record<string, string> = {
  sm: "hidden",
  md: "hidden md:block",
  lg: "hidden lg:block",
  xl: "hidden xl:block",
  default: "hidden xl:block",
};

function getHideClass(breakpoint?: string): string {
  return breakpoint ? hideClasses[breakpoint] || "" : "";
}

function getShowCardClass(breakpoint: string): string {
  return showCardClasses[breakpoint] || showCardClasses.default;
}

function getShowTableClass(breakpoint: string): string {
  return showTableClasses[breakpoint] || showTableClasses.default;
}

// ══════════════════════════════════════════════════════════════════
// RESPONSIVE TABLE COMPONENT
// ══════════════════════════════════════════════════════════════════

export function AdminResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  mobileCard,
  emptyState,
  isLoading,
  breakpoint = "lg",
  className,
  containerClassName,
}: ResponsiveTableProps<T>) {
  const showCardClass = getShowCardClass(breakpoint);
  const showTableClass = getShowTableClass(breakpoint);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <div className={cn("min-w-0", containerClassName)}>
      {/* ═══ DESKTOP TABLE ═══════════════════════════════════ */ }
      <div className={cn("rounded-2xl border border-border/40 bg-card overflow-hidden", showTableClass, className)}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead
                    key={col.header}
                    className={cn(
                      col.hideBelow ? getHideClass(col.hideBelow) : "",
                      col.className,
                      col.headerClassName,
                    )}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 && emptyState ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-16 text-center">
                    {emptyState}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={keyExtractor(item)} className="group">
                    {columns.map((col) => (
                      <TableCell
                        key={col.header}
                        className={cn(
                          col.hideBelow ? getHideClass(col.hideBelow) : "",
                          col.className,
                          col.cellClassName,
                        )}
                      >
                        {col.accessor(item)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ═══ MOBILE CARDS ════════════════════════════════════ */ }
      <div className={cn("space-y-3", showCardClass)}>
        {data.length === 0 && emptyState ? (
          <div className="py-16">{emptyState}</div>
        ) : (
          data.map((item) => (
            <div key={keyExtractor(item)}>
              {mobileCard(item)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MOBILE ACTION SHEET
// ══════════════════════════════════════════════════════════════════

export interface ActionSheetAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  variant?: "default" | "destructive" | "success" | "warning";
  disabled?: boolean;
}

interface AdminActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  actions: ActionSheetAction[];
}

export function AdminActionSheet({
  open,
  onOpenChange,
  title,
  description,
  actions,
}: AdminActionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl border-t shadow-2xl !max-w-full p-0"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}
      >
        <div className="px-4 pt-3 pb-2">
          <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted-foreground/20" />
        </div>

        <SheetHeader className="px-4 pb-2">
          <SheetTitle className="text-left text-base">{title}</SheetTitle>
          {description && (
            <SheetDescription className="text-left text-sm">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="space-y-1 px-2 pb-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  action.onClick();
                  onOpenChange(false);
                }}
                disabled={action.disabled}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all active:scale-[0.98] min-h-11",
                  action.variant === "destructive"
                    ? "text-destructive hover:bg-destructive/10"
                    : action.variant === "success"
                      ? "text-success hover:bg-success/10"
                      : action.variant === "warning"
                        ? "text-warning hover:bg-warning/10"
                        : "text-foreground hover:bg-accent",
                  action.disabled && "opacity-50 pointer-events-none",
                )}
              >
                {Icon && (
                  <span className="size-4 shrink-0">{Icon}</span>
                )}
                {action.label}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ══════════════════════════════════════════════════════════════════
// MOBILE RECORD CARD — Reusable base card for mobile table rows
// ══════════════════════════════════════════════════════════════════

interface MobileRecordCardSection {
  label?: string;
  value: ReactNode;
  icon?: ReactNode;
}

interface AdminMobileRecordCardProps {
  /** Primary identifier shown at top (usually business name) */
  primary: ReactNode;
  /** Status badge or indicator */
  status?: ReactNode;
  /** Key-value detail rows */
  details?: MobileRecordCardSection[];
  /** Action buttons at the bottom */
  actions?: ReactNode;
  /** Optional className */
  className?: string;
}

export function AdminMobileRecordCard({
  primary,
  status,
  details,
  actions,
  className,
}: AdminMobileRecordCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/30 bg-card p-4 shadow-sm",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground break-words leading-snug">
            {primary}
          </div>
        </div>
        {status && <div className="shrink-0">{status}</div>}
      </div>

      {/* Details */}
      {details && details.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {details.map((detail, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {detail.icon && (
                  <span className="size-3.5 shrink-0 text-muted-foreground/50">
                    {detail.icon}
                  </span>
                )}
                {detail.label && (
                  <span className="text-xs text-muted-foreground/60 truncate">
                    {detail.label}
                  </span>
                )}
              </div>
              <div className="text-xs font-medium text-foreground/80 text-right shrink-0">
                {detail.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/10">
          {actions}
        </div>
      )}
    </div>
  );
}
