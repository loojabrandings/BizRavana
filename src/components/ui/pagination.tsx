"use client";

import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dropdown } from "@/components/ui/dropdown";

// ─── Props ────────────────────────────────────────────────────────

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

// ─── Helpers ──────────────────────────────────────────────────────

function getVisiblePages(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "ellipsis")[] = [];

  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("ellipsis");
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1);
    pages.push("ellipsis");
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push("ellipsis");
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push("ellipsis");
    pages.push(total);
  }

  return pages;
}

// ─── Component ────────────────────────────────────────────────────

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationProps) {
  if (totalPages <= 1 && totalItems <= pageSize) return null;

  const visiblePages = getVisiblePages(currentPage, totalPages);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Page indicator + Rows per page */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="text-sm font-medium tabular-nums">
          Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
          <span className="font-semibold text-foreground">{totalPages}</span>
        </span>

        <Dropdown
          label="Rows"
          value={String(pageSize)}
          onChange={(v) => v && onPageSizeChange(Number(v))}
          options={pageSizeOptions.map((size) => ({
            value: String(size),
            label: String(size),
          }))}
          size="sm"
          className="h-7 min-w-[60px] text-sm"
        />

        <span className="text-sm tabular-nums text-muted-foreground/60">
          {totalItems} total
        </span>
      </div>

      {/* Right: Navigation controls */}
      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* First page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={isFirstPage}
          aria-label="First page"
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-lg text-sm font-medium transition-all",
            isFirstPage
              ? "text-muted-foreground/30 cursor-not-allowed"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-95",
          )}
        >
          <ChevronFirst className="size-3.5" />
        </button>

        {/* Previous page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          aria-label="Previous page"
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-lg text-sm font-medium transition-all",
            isFirstPage
              ? "text-muted-foreground/30 cursor-not-allowed"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-95",
          )}
        >
          <ChevronLeft className="size-3.5" />
        </button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {visiblePages.map((page, idx) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${idx}`}
                className="inline-flex size-7 items-center justify-center text-sm text-muted-foreground/40 select-none"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                disabled={page === currentPage}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
                className={cn(
                  "inline-flex size-7 items-center justify-center rounded-lg text-sm font-medium transition-all active:scale-95",
                  page === currentPage
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {page}
              </button>
            ),
          )}
        </div>

        {/* Mobile: compact page indicator */}
        <span className="sm:hidden inline-flex items-center gap-1 px-2 text-sm tabular-nums text-muted-foreground">
          <span className="font-semibold text-foreground">{currentPage}</span>
          <span className="text-muted-foreground/40">/</span>
          <span>{totalPages}</span>
        </span>

        {/* Next page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          aria-label="Next page"
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-lg text-sm font-medium transition-all",
            isLastPage
              ? "text-muted-foreground/30 cursor-not-allowed"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-95",
          )}
        >
          <ChevronRight className="size-3.5" />
        </button>

        {/* Last page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={isLastPage}
          aria-label="Last page"
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-lg text-sm font-medium transition-all",
            isLastPage
              ? "text-muted-foreground/30 cursor-not-allowed"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-95",
          )}
        >
          <ChevronLast className="size-3.5" />
        </button>
      </nav>
    </div>
  );
}
