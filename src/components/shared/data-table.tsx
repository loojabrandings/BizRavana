"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ArrowDownAZ, ArrowUpAZ, Check, Layers3, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { useIsMobile } from "@/hooks/use-media-query";
import { Progress } from "@/components/ui/progress";
import { EmptyState, type EmptyStateProps } from "@/components/shared/empty-state";

// ─── Types ────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  id: string;
  label: string;
  sortable?: boolean;
  sortKey?: string;
  className?: string;
  hideOnMobile?: boolean;
  renderCell?: (row: T) => React.ReactNode;
}

export interface DataTableSelectionProps {
  selectedIds: Set<string | number>;
  onSelectionChange: (ids: Set<string | number>) => void;
  bulkActions?: React.ReactNode;
}

export interface DataTableProps<T> {
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Data rows */
  data: T[];
  /** Extract a stable key from each row */
  keyExtractor: (row: T) => string | number;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string | null;
  /** Empty state configuration (shown when data is empty and not loading) */
  empty?: EmptyStateProps;
  /** Sorting configuration */
  sort?: {
    active: { key: string; direction: "asc" | "desc" } | null;
    onToggle: (key: string) => void;
  };
  /** Pagination configuration */
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  /** Render a mobile-friendly card for each row (required for mobile support) */
  renderMobileCard?: (row: T) => React.ReactNode;
  /** Selection configuration for multi-select mode */
  selection?: DataTableSelectionProps;
  /** Set of row keys that are currently being deleted (show loading bar instead of content) */
  deletingKeys?: Set<string | number>;
  /** Additional className for the container */
  className?: string;
}

// ─── Sortable Header ──────────────────────────────────────────────

function SortIndicator({
  active,
  direction,
}: {
  active: boolean;
  direction?: "asc" | "desc";
}) {
  if (active && direction === "asc") return <ArrowUpAZ className="size-3 text-primary" />;
  if (active && direction === "desc") return <ArrowDownAZ className="size-3 text-primary" />;
  return <ArrowUpAZ className="size-3 text-muted-foreground/30" />;
}

function SortableHead<T>({
  column,
  activeSort,
  onToggle,
}: {
  column: ColumnDef<T>;
  activeSort: { key: string; direction: "asc" | "desc" } | null;
  onToggle: (key: string) => void;
}) {
  const isActive = activeSort?.key === column.sortKey;
  return (
    <TableHead
      className={cn(
        "select-none text-sm font-semibold uppercase tracking-wider text-muted-foreground",
        column.sortable && "cursor-pointer transition-colors hover:text-foreground",
        column.className,
        column.hideOnMobile && "hidden md:table-cell",
      )}
      onClick={() => column.sortable && column.sortKey && onToggle(column.sortKey)}
      role={column.sortable ? "button" : undefined}
      tabIndex={column.sortable ? 0 : undefined}
      onKeyDown={(e) => {
        if (column.sortable && column.sortKey && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onToggle(column.sortKey);
        }
      }}
    >
      <span className="inline-flex items-center gap-1.5">
        {column.label}
        {column.sortable && (
          <SortIndicator active={isActive} direction={activeSort?.direction} />
        )}
      </span>
    </TableHead>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────

function DesktopSkeleton({
  columns,
  showCheckbox,
}: {
  columns: ColumnDef<Record<string, unknown>>[];
  showCheckbox?: boolean;
}) {
  return (
    <div className="rounded-2xl glass-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            {showCheckbox && (
              <TableHead className="w-10">
                <div className="size-4 rounded border border-muted-foreground/20" />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead
                key={col.id}
                className={cn(
                  "text-sm font-semibold uppercase tracking-wider text-muted-foreground",
                  col.className,
                  col.hideOnMobile && "hidden md:table-cell",
                )}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {showCheckbox && (
                <TableCell className="w-10">
                  <div className="size-4 rounded border border-muted-foreground/20" />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  className={cn(
                    "py-4",
                    col.hideOnMobile && "hidden md:table-cell",
                    col.className,
                  )}
                >
                  <div
                    className={cn(
                      "animate-pulse rounded-md bg-muted/60",
                      i % 2 === 0 ? "h-4 w-22" : "h-4 w-14",
                    )}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MobileSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-border/80 bg-card p-5"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="h-4 w-32 rounded bg-muted/60" />
            <div className="h-5 w-20 rounded-full bg-muted/60" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-48 rounded bg-muted/60" />
            <div className="h-3 w-24 rounded bg-muted/60" />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
            <div className="h-4 w-28 rounded bg-muted/60" />
            <div className="flex gap-1">
              <div className="size-7 rounded-lg bg-muted/60" />
              <div className="size-7 rounded-lg bg-muted/60" />
              <div className="size-7 rounded-lg bg-muted/60" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-status-danger-bg">
          <Layers3 className="size-6 text-destructive" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Unable to load data</h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// ─── Empty Table Shell ────────────────────────────────────────────

function EmptyTableShell({
  columns,
  showCheckbox,
  empty,
}: {
  columns: ColumnDef<Record<string, unknown>>[];
  showCheckbox?: boolean;
  empty: EmptyStateProps;
}) {
  return (
    <EmptyState
      columns={columns.map((col) => ({
        id: col.id,
        label: col.label,
        className: col.className,
        hideOnMobile: col.hideOnMobile,
      }))}
      showCheckbox={showCheckbox}
      {...empty}
    />
  );
}

// ─── Selection Checkbox ────────────────────────────────────────────

function SelectionCheckbox({ checked }: { checked: boolean }) {
  return (
    <div
      className={cn(
        "flex size-5 items-center justify-center rounded-md border-2 transition-all",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-muted-foreground/30 bg-transparent",
      )}
    >
      {checked && <Check className="size-3" strokeWidth={3} />}
    </div>
  );
}

// ─── Bulk Actions Toolbar ──────────────────────────────────────────

function BulkActionsToolbar({
  selectedCount,
  bulkActions,
  onCancel,
  isMobile,
}: {
  selectedCount: number;
  bulkActions?: React.ReactNode;
  onCancel: () => void;
  isMobile: boolean;
}) {
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-8px_30px_rgb(0_0_0/0.12)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {selectedCount}
            </span>
            selected
          </div>
          <div className="flex items-center gap-2">
            {bulkActions}
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground active:scale-95"
            >
              <X className="size-3.5" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {selectedCount}
        </span>
        <span>{selectedCount} selected</span>
      </div>
      <div className="flex items-center gap-2">
        {bulkActions}
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground active:scale-95"
        >
          <X className="size-3.5" />
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  loading,
  error,
  empty,
  sort,
  pagination,
  renderMobileCard,
  selection,
  deletingKeys,
  className,
}: DataTableProps<T>) {
  const isMobile = useIsMobile();
  const [selectionMode, setSelectionMode] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // ─── Selection handlers ─────────────────────────────────────────

  const enterSelectionMode = useCallback(
    (rowId: string | number) => {
      if (!selection) return;
      setSelectionMode(true);
      selection.onSelectionChange(new Set([rowId]));
    },
    [selection],
  );

  const toggleRowSelection = useCallback(
    (rowId: string | number) => {
      if (!selection) return;
      const next = new Set(selection.selectedIds);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      selection.onSelectionChange(next);
    },
    [selection],
  );

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    selection?.onSelectionChange(new Set());
  }, [selection]);

  // ─── Cleanup long-press timer on unmount ──────────────────────
  useEffect(() => {
    return () => {
      if (longPressTimer.current !== null) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  // ─── Keyboard: Esc to exit selection mode ──────────────────────
  useEffect(() => {
    if (!selectionMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        exitSelectionMode();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectionMode, exitSelectionMode]);

  // ─── Touch handlers for mobile long-press ──────────────────────
  const handleTouchStart = useCallback(
    (rowId: string | number) => {
      if (selectionMode || !selection) return;
      longPressTimer.current = setTimeout(() => {
        enterSelectionMode(rowId);
        longPressTimer.current = null;
      }, 500);
    },
    [selectionMode, selection, enterSelectionMode],
  );

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleRowInteraction = useCallback(
    (rowId: string | number) => {
      if (selectionMode) {
        toggleRowSelection(rowId);
      }
    },
    [selectionMode, toggleRowSelection],
  );

  const handleFirstColumnClick = useCallback(
    (rowId: string | number) => {
      if (!selection) return;
      if (selectionMode) {
        toggleRowSelection(rowId);
      } else {
        enterSelectionMode(rowId);
      }
    },
    [selection, selectionMode, toggleRowSelection, enterSelectionMode],
  );

  // ─── Derived state ─────────────────────────────────────────────
  const isSelected = useCallback(
    (rowId: string | number) => selection?.selectedIds.has(rowId) ?? false,
    [selection],
  );

  const showCheckbox = selectionMode && !isMobile;
  const showToolbar = selectionMode && selection && selection.selectedIds.size > 0;

  // Indeterminate progress bar for rows being deleted
  const DeletingRow = useCallback(() => (
    <div className="flex items-center justify-center px-6 py-3">
      <div className="w-full max-w-md">
        <Progress value={null} />
      </div>
    </div>
  ), []);

  // ─── Error ──────────────────────────────────────────────────
  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <ErrorState message={error} />
      </div>
    );
  }

  // ─── Mobile Cards ───────────────────────────────────────────
  if (isMobile) {
    if (loading) {
      return (
        <div className={cn("space-y-4", className)}>
          <MobileSkeleton />
        </div>
      );
    }

    if (data.length === 0 && empty) {
      return (
        <div className={cn("space-y-4", className)}>
          <EmptyState {...empty} />
        </div>
      );
    }

    return (
      <div className={cn("space-y-4", className)}>
        <div className="space-y-4">            {data.map((row) => {
            const rowId = keyExtractor(row);
            const isDeleting = deletingKeys?.has(rowId);
            const selected = isSelected(rowId);

            if (isDeleting) {
              return (
                <div
                  key={rowId}
                  className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm"
                >
                  <DeletingRow />
                </div>
              );
            }

            return (
              <div
                key={rowId}
                onClick={() => handleRowInteraction(rowId)}
                onTouchStart={() => handleTouchStart(rowId)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                className={cn(
                  "relative cursor-default transition-all",
                  selectionMode && "cursor-pointer rounded-2xl",
                  selectionMode && selected && "ring-2 ring-primary",
                )}
              >
                {/* Selection overlay */}
                {selectionMode && (
                  <div className="absolute right-3 top-3 z-10">
                    <SelectionCheckbox checked={selected} />
                  </div>
                )}
                {renderMobileCard?.(row)}
              </div>
            );
          })}
        </div>

        {/* Mobile bottom toolbar */}
        {showToolbar && (
          <BulkActionsToolbar
            selectedCount={selection!.selectedIds.size}
            bulkActions={selection!.bulkActions}
            onCancel={exitSelectionMode}
            isMobile
          />
        )}

        {pagination && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            onPageChange={pagination.onPageChange}
            onPageSizeChange={pagination.onPageSizeChange}
          />
        )}
      </div>
    );
  }

  // ─── Desktop Table ─────────────────────────────────────────
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <DesktopSkeleton
          columns={columns as ColumnDef<Record<string, unknown>>[]}
          showCheckbox={showCheckbox}
        />
      </div>
    );
  }

  if (data.length === 0 && empty) {
    return (
      <div className={cn("space-y-4", className)}>
        <EmptyTableShell
          columns={columns as ColumnDef<Record<string, unknown>>[]}
          showCheckbox={showCheckbox}
          empty={empty}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)} ref={tableRef}>
      {/* ─── Bulk Actions Toolbar ──────────────────────────────── */}
      {showToolbar && (
        <BulkActionsToolbar
          selectedCount={selection!.selectedIds.size}
          bulkActions={selection!.bulkActions}
          onCancel={exitSelectionMode}
          isMobile={false}
        />
      )}

      <div className="rounded-2xl glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              {/* Checkbox column header — Select All */}
              {showCheckbox && (
                <TableHead className="w-10">
                  <button
                    type="button"
                    onClick={() => {
                      if (!selection) return;
                      const allVisibleIds = new Set(data.map(keyExtractor));
                      const allSelected = data.every((row) =>
                        selection.selectedIds.has(keyExtractor(row)),
                      );
                      if (allSelected) {
                        // Deselect all visible
                        const next = new Set(selection.selectedIds);
                        allVisibleIds.forEach((id) => next.delete(id));
                        selection.onSelectionChange(next);
                      } else {
                        // Select all visible
                        const next = new Set(selection.selectedIds);
                        allVisibleIds.forEach((id) => next.add(id));
                        selection.onSelectionChange(next);
                      }
                    }}
                    className="flex size-full items-center justify-center"
                    title={
                      data.length > 0 && data.every((row) =>
                        selection!.selectedIds.has(keyExtractor(row)),
                      )
                        ? "Deselect all"
                        : "Select all"
                    }
                  >
                    <SelectionCheckbox
                      checked={
                        data.length > 0 &&
                        data.every((row) =>
                          selection!.selectedIds.has(keyExtractor(row)),
                        )
                      }
                    />
                  </button>
                </TableHead>
              )}
              {columns.map((col) =>
                col.sortable && sort ? (
                  <SortableHead
                    key={col.id}
                    column={col}
                    activeSort={sort.active}
                    onToggle={sort.onToggle}
                  />
                ) : (
                  <TableHead
                    key={col.id}
                    className={cn(
                      "text-sm font-semibold uppercase tracking-wider text-muted-foreground",
                      col.className,
                      col.hideOnMobile && "hidden md:table-cell",
                    )}
                  >
                    {col.label}
                  </TableHead>
                ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => {
              const rowId = keyExtractor(row);
              const isDeleting = deletingKeys?.has(rowId);
              const selected = isSelected(rowId);

              if (isDeleting) {
                const colCount = columns.length + (showCheckbox ? 1 : 0);
                return (
                  <TableRow key={rowId}>
                    <TableCell colSpan={colCount} className="py-[7px]">
                      <DeletingRow />
                    </TableCell>
                  </TableRow>
                );
              }

              return (
                <TableRow
                  key={rowId}
                  className={cn(
                    "group transition-colors",
                    selectionMode
                      ? "cursor-pointer hover:bg-muted/30"
                      : "hover:bg-muted/20",
                    selected && "bg-primary/10 hover:bg-primary/15",
                  )}
                  onClick={() => {
                    if (selectionMode) {
                      toggleRowSelection(rowId);
                    }
                  }}
                >
                  {/* Selection checkbox column */}
                  {showCheckbox && (
                    <TableCell className="w-10 align-middle">
                      <SelectionCheckbox checked={selected} />
                    </TableCell>
                  )}
                  {columns.map((col, colIndex) => (
                    <TableCell
                      key={col.id}
                      className={cn(
                        "py-4 align-middle text-sm",
                        col.hideOnMobile && "hidden md:table-cell",
                        col.className,
                      )}
                      onClick={
                        colIndex === 0 && selection && !selectionMode
                          ? (e) => {
                              e.stopPropagation();
                              handleFirstColumnClick(rowId);
                            }
                          : undefined
                      }
                    >
                      {col.renderCell
                        ? col.renderCell(row)
                        : <span>{String(row[col.id] ?? "—")}</span>}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  );
}
