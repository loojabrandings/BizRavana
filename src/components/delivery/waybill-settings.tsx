"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  Hash,
  ListOrdered,
  Loader2,
  PenLine,
  Plus,
  Search,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useRef } from "react";
import { cn, formatEnumLabel } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-media-query";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "sonner";
import {
  type ManualWaybill,
  type WaybillStatus,
  type WaybillSummary,
  fetchManualWaybills,
  getWaybillSummary,
  addManualWaybill,
  addMultipleWaybills,
  deleteManualWaybill,
  updateWaybillStatus,
  bulkUpdateWaybillStatus,
  bulkDeleteWaybills,
  generateWaybillRange,
  getWaybillMethod,
  setWaybillMethod,
} from "@/lib/delivery/waybill-utils";

// ─── Types ──────────────────────────────────────────────────────────

interface WaybillSettingsProps {
  businessId: string | null;
  userId?: string | null;
}

// ─── Constants ──────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: WaybillStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "assigned", label: "Assigned" },
  { value: "used", label: "Used" },
  { value: "invalid", label: "Invalid" },
];

const STATUS_COLORS: Record<WaybillStatus, string> = {
  available: "text-success bg-success/10 border-success/20",
  assigned: "text-info bg-info/10 border-info/20",
  used: "text-muted-foreground bg-muted/30 border-border/20",
  invalid: "text-destructive bg-destructive/10 border-destructive/20",
};

// ─── Sub-components ─────────────────────────────────────────────────

function SummaryCard({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-border/20 bg-muted/10 px-3 py-2">
      <span className={cn("text-lg font-bold tabular-nums", color)}>
        {count}
      </span>
      <span className="text-nano font-medium text-muted-foreground/60 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export function WaybillSettings({ businessId, userId }: WaybillSettingsProps) {
  const isMobile = useIsMobile();

  // ── State ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<"manual" | "auto">("manual");
  const [savingMethod, setSavingMethod] = useState(false);

  // Waybill list
  const [waybills, setWaybills] = useState<ManualWaybill[]>([]);
  const [summary, setSummary] = useState<WaybillSummary>({
    total: 0, available: 0, assigned: 0, used: 0, invalid: 0,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<WaybillStatus | "all">("all");

  // The add/search input doubles as both the filter query and the ID to add
  const [addInput, setAddInput] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const filterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [addingSingle, setAddingSingle] = useState(false);

  // Add multiple dialog
  const [multipleDialogOpen, setMultipleDialogOpen] = useState(false);
  const [multipleInput, setMultipleInput] = useState("");
  const [addingMultiple, setAddingMultiple] = useState(false);

  // Add range dialog
  const [rangeDialogOpen, setRangeDialogOpen] = useState(false);
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [rangePrefix, setRangePrefix] = useState("");
  const [generatingRange, setGeneratingRange] = useState(false);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingConfirmed, setDeletingConfirmed] = useState(false);

  // Status update
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Status change confirmation
  const [statusChangeConfirm, setStatusChangeConfirm] = useState<{
    id: string;
    waybillId: string;
    newStatus: WaybillStatus;
    currentStatus: WaybillStatus;
  } | null>(null);
  const [statusChangeConfirming, setStatusChangeConfirming] = useState(false);

  // ── Bulk selection state (handlers defined after loadData) ──────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // ── Pagination ──────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedFilter]);

  // ── Search debounce — singleId doubles as the search query
  const handleSearchChange = useCallback((value: string) => {
    setAddInput(value);
    if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
    filterTimerRef.current = setTimeout(() => {
      setDebouncedFilter(value);
    }, 300);
  }, []);

  const handleClearSearch = useCallback(() => {
    setAddInput("");
    setDebouncedFilter("");
    if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
  }, []);

  // ── Load data ─────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    try {
      const [fetchedMethod, { waybills: wbs, total }, sum] = await Promise.all([
        getWaybillMethod(businessId),
        fetchManualWaybills(businessId, {
          status: statusFilter,
          search: debouncedFilter || undefined,
          limit: pageSize,
          offset: (currentPage - 1) * pageSize,
        }),
        getWaybillSummary(businessId),
      ]);

      setMethod(fetchedMethod);
      setWaybills(wbs);
      setTotalCount(total);
      setSummary(sum);
    } catch (err) {
      console.error("Failed to load waybill data:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, statusFilter, debouncedFilter, currentPage, pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cleanup filter timer on unmount
  useEffect(() => {
    return () => {
      if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
    };
  }, []);

  // ── Method change ─────────────────────────────────────────────
  const handleMethodChange = useCallback(
    async (newMethod: "manual" | "auto") => {
      if (!businessId) return;
      setSavingMethod(true);
      try {
        await setWaybillMethod(businessId, newMethod, userId);
        setMethod(newMethod);
        toast.success(`Waybill method set to ${newMethod}`);
      } catch (err) {
        toast.error("Failed to update waybill method");
      } finally {
        setSavingMethod(false);
      }
    },
    [businessId, userId],
  );

  // ── Add single (also clears the filter) ────────────────────────
  const handleAddSingle = useCallback(async () => {
    const value = addInput.trim();
    if (!businessId || !value) return;
    setAddingSingle(true);
    try {
      const result = await addManualWaybill(businessId, value, userId);
      if (result.success) {
        toast.success(`Waybill "${value}" added`);
        handleClearSearch(); // Clear input which also resets the list filter
        await loadData();
      } else {
        toast.error(result.error || "Failed to add waybill");
      }
    } catch (err) {
      toast.error("Failed to add waybill");
    } finally {
      setAddingSingle(false);
    }
  }, [businessId, addInput, userId, loadData, handleClearSearch]);

  // ── Add multiple ──────────────────────────────────────────────
  const parsedMultiplePreview = useMemo(() => {
    if (!multipleInput.trim()) return null;
    const ids = multipleInput
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const unique = new Set(ids.map((id) => id.toLowerCase()));
    return {
      total: ids.length,
      unique: unique.size,
      duplicates: ids.length - unique.size,
    };
  }, [multipleInput]);

  const handleAddMultiple = useCallback(async () => {
    if (!businessId || !multipleInput.trim()) return;
    setAddingMultiple(true);
    try {
      const result = await addMultipleWaybills(businessId, multipleInput, userId);
      if (result.inserted > 0) {
        toast.success(`${result.inserted} waybill(s) added`, {
          description:
            result.duplicates > 0
              ? `${result.duplicates} duplicate(s) skipped`
              : undefined,
        });
      } else if (result.duplicates > 0) {
        toast.error("All IDs are duplicates");
      }
      setMultipleInput("");
      setMultipleDialogOpen(false);
      await loadData();
    } catch (err) {
      toast.error("Failed to add waybills");
    } finally {
      setAddingMultiple(false);
    }
  }, [businessId, multipleInput, userId, loadData]);

  // ── Range preview ──────────────────────────────────────────────
  const rangePreview = useMemo(() => {
    const from = rangeFrom.trim();
    const to = rangeTo.trim();
    if (!from || !to) return null;

    const prefix = rangePrefix.trim();
    const fromNumeric = from.replace(/^[A-Za-z]*/, "");
    const toNumeric = to.replace(/^[A-Za-z]*/, "");
    const fromNum = parseInt(fromNumeric, 10);
    const toNum = parseInt(toNumeric, 10);

    if (isNaN(fromNum) || isNaN(toNum) || fromNum > toNum) {
      return { valid: false as const, error: "From must be less than or equal to To." };
    }

    // Check same digit length when leading zeros
    const hasLeadingZeros = /^0+/.test(fromNumeric);
    if (hasLeadingZeros && fromNumeric.length !== toNumeric.length) {
      return {
        valid: false as const,
        error: "From and To must have the same number of digits when using leading zeros.",
      };
    }

    const count = toNum - fromNum + 1;
    if (count > 5000) {
      return {
        valid: false as const,
        error: `Range exceeds maximum of 5,000 IDs. Requested ${count}.`,
      };
    }

    // Generate a few sample IDs
    const padLength = hasLeadingZeros ? fromNumeric.length : 0;
    const sampleIds: string[] = [];
    const samples = Math.min(count, 3);
    for (let i = 0; i < samples; i++) {
      let numStr = String(fromNum + i);
      if (padLength > 0) numStr = numStr.padStart(padLength, "0");
      sampleIds.push(prefix + numStr);
    }
    if (count > 3) {
      sampleIds.push("...");
      let lastNumStr = String(toNum);
      if (padLength > 0) lastNumStr = lastNumStr.padStart(padLength, "0");
      sampleIds.push(prefix + lastNumStr);
    }

    return {
      valid: true as const,
      count,
      fromDisplay: prefix + fromNumeric.padStart(padLength, "0"),
      toDisplay: prefix + toNumeric.padStart(padLength, "0"),
      sampleIds,
    };
  }, [rangeFrom, rangeTo, rangePrefix]);

  // ── Handle range generation ─────────────────────────────────
  const handleGenerateRange = useCallback(async () => {
    if (!businessId) return;
    setGeneratingRange(true);
    try {
      const result = await generateWaybillRange(
        businessId,
        rangeFrom,
        rangeTo,
        rangePrefix || undefined,
        userId,
      );

      if (result.inserted > 0) {
        toast.success(`${result.inserted} waybill(s) generated`, {
          description:
            result.duplicates > 0
              ? `${result.duplicates} duplicate(s) skipped`
              : undefined,
        });
      } else if (result.errors.length > 0) {
        toast.error(result.errors[0]);
      } else if (result.duplicates > 0) {
        toast.error("All IDs in this range already exist.");
      }

      setRangeFrom("");
      setRangeTo("");
      setRangePrefix("");
      setRangeDialogOpen(false);
      await loadData();
    } catch (err) {
      toast.error("Failed to generate waybill range");
    } finally {
      setGeneratingRange(false);
    }
  }, [businessId, rangeFrom, rangeTo, rangePrefix, userId, loadData]);

  // ── Manual status update ──────────────────────────────────────
  const handleStatusUpdate = useCallback(
    async (id: string, newStatus: WaybillStatus) => {
      setUpdatingStatusId(id);
      try {
        const result = await updateWaybillStatus(id, newStatus);
        if (result.success) {
          toast.success(`Waybill status changed to ${newStatus}`);
          await loadData();
        } else {
          toast.error(result.error || "Failed to update status");
        }
      } catch {
        toast.error("Failed to update status");
      } finally {
        setUpdatingStatusId(null);
      }
    },
    [loadData],
  );

  // ── Delete with confirmation ──────────────────────────────────
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleDeleteClick = useCallback((id: string) => {
    setPendingDeleteId(id);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!pendingDeleteId) return;
    setDeletingConfirmed(true);
    setDeletingId(pendingDeleteId);
    try {
      const result = await deleteManualWaybill(pendingDeleteId);
      if (result.success) {
        toast.success("Waybill deleted");
        await loadData();
      } else {
        toast.error(result.error || "Failed to delete waybill");
      }
    } catch {
      toast.error("Failed to delete waybill");
    } finally {
      setDeletingId(null);
      setDeletingConfirmed(false);
      setPendingDeleteId(null);
      setDeleteConfirmOpen(false);
    }
  }, [pendingDeleteId, loadData]);

  const handleDeleteCancel = useCallback(() => {
    setPendingDeleteId(null);
    setDeleteConfirmOpen(false);
  }, []);

  // ── Status change confirmation ─────────────────────────────────
  const handleStatusChangeConfirm = useCallback(async () => {
    if (!statusChangeConfirm) return;
    setStatusChangeConfirming(true);
    await handleStatusUpdate(statusChangeConfirm.id, statusChangeConfirm.newStatus);
    setStatusChangeConfirm(null);
    setStatusChangeConfirming(false);
  }, [statusChangeConfirm, handleStatusUpdate]);

  const handleStatusChangeCancel = useCallback(() => {
    setStatusChangeConfirm(null);
  }, []);

  // ── Bulk selection handlers ──────────────────────────────────────
  const allSelected = waybills.length > 0 && waybills.every((wb) => selectedIds.has(wb.id));
  const someSelected = selectedIds.size > 0;

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(waybills.map((wb) => wb.id)));
    }
  }, [allSelected, waybills]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleBulkStatusChange = useCallback(
    async (newStatus: WaybillStatus) => {
      const ids = Array.from(selectedIds);
      if (ids.length === 0) return;
      setBulkUpdating(true);
      try {
        const result = await bulkUpdateWaybillStatus(ids, newStatus);
        if (result.success) {
          toast.success(`${result.updated} waybill(s) updated to ${formatEnumLabel(newStatus)}`);
          setSelectedIds(new Set());
          await loadData();
        } else {
          toast.error(result.errors[0] || "Failed to update waybills");
        }
      } catch {
        toast.error("Failed to update waybills");
      } finally {
        setBulkUpdating(false);
        setBulkStatusOpen(false);
      }
    },
    [selectedIds, loadData],
  );

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkDeleting(true);
    try {
      const result = await bulkDeleteWaybills(ids);
      if (result.success) {
        toast.success(`${result.deleted} waybill(s) deleted`);
        setSelectedIds(new Set());
        await loadData();
      } else {
        toast.error(result.errors[0] || "Failed to delete waybills");
      }
    } catch {
      toast.error("Failed to delete waybills");
    } finally {
      setBulkDeleting(false);
      setBulkDeleteConfirmOpen(false);
    }
  }, [selectedIds, loadData]);

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-4 animate-spin text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Waybill Method ────────────────────────────────────── */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
          Waybill Method
        </Label>
        <p className="mt-0.5 text-xs text-muted-foreground/50">
          Choose how waybill IDs are assigned to orders.
        </p>
        <div className="relative mt-2 grid grid-cols-2 gap-2">
          {/* Active highlight */}
          <div
            className={cn(
              "absolute inset-0 rounded-xl border-2 transition-all duration-200 pointer-events-none",
              method === "manual"
                ? "border-primary/40 opacity-100"
                : "border-transparent opacity-0",
            )}
            style={{
              width: method === "manual" ? "calc(50% - 4px)" : "calc(50% - 4px)",
              transform: method === "auto" ? "translateX(calc(100% + 8px))" : "translateX(0)",
            }}
          />

          <button
            type="button"
            onClick={() => handleMethodChange("manual")}
            disabled={savingMethod}
            className={cn(
              "relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-4 py-3 text-center transition-all duration-150",
              method === "manual"
                ? "border-primary/30 bg-primary/[0.05] text-foreground shadow-sm"
                : "border-border/20 text-muted-foreground/60 hover:border-border/40 hover:bg-muted/5",
            )}
          >
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-lg transition-colors",
                method === "manual"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted/20 text-muted-foreground/40",
              )}
            >
              <PenLine className="size-4" />
            </span>
            <div>
              <span className="block text-sm font-semibold">Manual</span>
              <span className="block text-xxs text-muted-foreground/50 mt-0.5 leading-tight">
                You provide waybill IDs manually
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleMethodChange("auto")}
            disabled={savingMethod}
            className={cn(
              "relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-4 py-3 text-center transition-all duration-150",
              method === "auto"
                ? "border-primary/30 bg-primary/[0.05] text-foreground shadow-sm"
                : "border-border/20 text-muted-foreground/60 hover:border-border/40 hover:bg-muted/5",
            )}
          >
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-lg transition-colors",
                method === "auto"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted/20 text-muted-foreground/40",
              )}
            >
              <Zap className="size-4" />
            </span>
            <div>
              <span className="block text-sm font-semibold">Auto</span>
              <span className="block text-xxs text-muted-foreground/50 mt-0.5 leading-tight">
                Waybill IDs from courier API
              </span>
            </div>
          </button>

          {savingMethod && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/60 backdrop-blur-[1px]">
              <Loader2 className="size-5 animate-spin text-primary/60" />
            </div>
          )}
        </div>
      </div>

      {/* ── Auto Mode Helper ─────────────────────────────────── */}
      {method === "auto" && (
        <div className="rounded-lg bg-info/5 border border-info/20 px-3 py-2.5">
          <p className="text-xxs text-info/70 leading-relaxed">
            Waybill IDs will be provided automatically by the connected
            courier integration. No manual waybill management needed.
          </p>
        </div>
      )}

      {/* ── Manual Waybill Management ─────────────────────────── */}
      {method === "manual" && (
        <div className="space-y-4">
          {/* ── Add Section ────────────────────────────────────── */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
              Add Waybill IDs
            </Label>

            {/* Merged Add/Search input — typing here both filters the list and can add a new ID */}
            <div className="relative flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground/30" />
                <input
                  value={addInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search or add waybill ID..."
                  className="w-full h-9 rounded-lg border border-border/20 bg-muted/10 pl-7 pr-6 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 focus:bg-primary/[0.02] transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && addInput.trim()) handleAddSingle();
                  }}
                />
                {addInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-foreground transition-colors"
                  >
                    <X className="size-2.5" />
                  </button>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  <Plus className="size-3.5" />
                  Add IDs
                  <ChevronDown className="size-3 opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px] p-1.5">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => setMultipleDialogOpen(true)}
                      className="gap-2"
                    >
                      <Copy className="size-3.5 text-muted-foreground/60" />
                      <div>
                        <span className="block text-xs font-medium">Add IDs</span>
                        <span className="block text-nano text-muted-foreground/50">
                          Paste comma/newline separated IDs
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setRangeDialogOpen(true)}
                      className="gap-2"
                    >
                      <ListOrdered className="size-3.5 text-muted-foreground/60" />
                      <div>
                        <span className="block text-xs font-medium">Add Range</span>
                        <span className="block text-nano text-muted-foreground/50">
                          Generate sequential IDs
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* ── Summary Counts ─────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            <SummaryCard
              label="Total"
              count={summary.total}
              color="text-foreground"
            />
            <SummaryCard
              label="Available"
              count={summary.available}
              color="text-success"
            />
            <SummaryCard
              label="Assigned"
              count={summary.assigned}
              color="text-info"
            />
            <SummaryCard
              label="Used"
              count={summary.used}
              color="text-muted-foreground"
            />
          </div>

          {/* ── Status Filter Chips ────────────────────────────── */}
          <div className="space-y-2">
            {/* Adding helper text to show the list doubles as filtered results */}
            {addInput && (
              <p className="text-nano text-muted-foreground/40">
                Showing waybills matching &ldquo;{addInput}&rdquo;. Press Enter to add it as a new ID.
              </p>
            )}

            {/* Status filter chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(
                    "shrink-0 rounded-lg border px-2.5 py-1 text-xxs font-medium transition-all whitespace-nowrap",
                    statusFilter === opt.value
                      ? "border-primary/30 bg-primary/[0.04] text-foreground"
                      : "border-border/20 text-muted-foreground/60 hover:border-border/40",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Waybill List ────────────────────────────────────── */}
          {waybills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted/20 border border-border/10">
                <Hash className="size-4 text-muted-foreground/30" />
              </div>
              <p className="mt-3 text-xs font-medium text-muted-foreground/50">
                {addInput || statusFilter !== "all"
                  ? "No matching waybill IDs found"
                  : "No manual waybill IDs added yet"}
              </p>
              <p className="mt-0.5 text-xxs text-muted-foreground/30">
                {addInput || statusFilter !== "all"
                  ? "Try a different search or clear filters"
                  : "Add waybill IDs to use when dispatching orders."}
              </p>
              {(addInput || statusFilter !== "all") ? (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    handleClearSearch();
                    setStatusFilter("all");
                  }}
                  className="mt-2 h-6 text-xxs"
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.querySelector<HTMLInputElement>('[placeholder*="Search or add"]');
                    input?.focus();
                  }}
                  className="mt-3 gap-1.5 h-8 text-xs"
                >
                  <Plus className="size-3" />
                  Add Waybill IDs
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.max(1, Math.ceil(totalCount / pageSize))}
                totalItems={totalCount}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />

              {/* ── Selection Bar ──────────────────────────────── */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-xxs font-medium text-muted-foreground/60">
                    {someSelected
                      ? `${selectedIds.size} selected`
                      : `Select all (${waybills.length})`}
                  </span>
                </label>

                {someSelected && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <DropdownMenu open={bulkStatusOpen} onOpenChange={setBulkStatusOpen}>
                      <DropdownMenuTrigger
                        disabled={bulkUpdating}
                        className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-xxs font-medium text-muted-foreground/60 hover:text-foreground hover:bg-accent/30 transition-all whitespace-nowrap"
                      >
                        {bulkUpdating ? (
                          <Loader2 className="size-2.5 animate-spin" />
                        ) : (
                          <ChevronDown className="size-2.5" />
                        )}
                        Change Status
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[140px] p-1.5">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="px-1.5 pb-1">
                            Change to
                          </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        {(["available", "assigned", "used", "invalid"] as const).map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleBulkStatusChange(status)}
                          >
                            <span className={cn(STATUS_COLORS[status])}>
                              {formatEnumLabel(status)}
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant="ghost"
                      size="xs"
                      disabled={bulkDeleting}
                      onClick={() => setBulkDeleteConfirmOpen(true)}
                      className="gap-1 h-7 text-xxs text-muted-foreground/60 hover:text-destructive"
                    >
                      {bulkDeleting ? (
                        <Loader2 className="size-2.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-2.5" />
                      )}
                      Delete
                    </Button>

                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={handleClearSelection}
                      className="h-7 text-xxs text-muted-foreground/40 hover:text-foreground"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              {/* ── Waybill Grid ───────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {waybills.map((wb) => (
                  <div
                    key={wb.id}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-2.5 py-2 transition-colors",
                      selectedIds.has(wb.id)
                        ? "border-primary/30 bg-primary/[0.03]"
                        : "border-border/20 bg-muted/5 hover:bg-muted/10",
                    )}
                  >
                    {/* Selection checkbox */}
                    <Checkbox
                      checked={selectedIds.has(wb.id)}
                      onCheckedChange={() => handleToggleSelect(wb.id)}
                      className="shrink-0"
                    />

                    {/* Waybill ID + optional order number */}
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-mono font-medium text-foreground break-all">
                        {wb.waybill_id}
                      </span>
                      {wb.assigned_order_number && (
                        <span className="block text-nano text-muted-foreground/50 mt-0.5 truncate">
                          Order #{wb.assigned_order_number}
                        </span>
                      )}
                    </div>

                    {/* Status + Delete */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {/* Editable Status — uses global dropdown styling */}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          disabled={updatingStatusId === wb.id}
                          className={cn(
                            "inline-flex items-center justify-center gap-1 rounded-md px-2 py-0.5 text-sm font-semibold whitespace-nowrap transition-all cursor-pointer bg-transparent min-w-[80px]",
                            "hover:bg-accent/30",
                            "active:scale-[0.97]",
                            STATUS_COLORS[wb.status],
                            updatingStatusId === wb.id && "opacity-50 pointer-events-none",
                          )}
                        >
                          {updatingStatusId === wb.id ? (
                            <Loader2 className="size-2.5 animate-spin" />
                          ) : (
                            <>
                              {formatEnumLabel(wb.status)}
                              <ChevronDown className="size-2.5 opacity-50" />
                            </>
                          )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[140px] p-1.5">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="px-1.5 pb-1">
                              Change status
                            </DropdownMenuLabel>
                          </DropdownMenuGroup>
                          {(["available", "assigned", "used", "invalid"] as const).map((status) => {
                            const isSelected = status === wb.status;
                            return (
                              <DropdownMenuItem
                                key={status}
                                className={cn(
                                  "pr-10",
                                  isSelected && "bg-primary/10 font-semibold text-primary",
                                )}
                                onClick={() =>
                                  setStatusChangeConfirm({
                                    id: wb.id,
                                    waybillId: wb.waybill_id,
                                    newStatus: status,
                                    currentStatus: wb.status,
                                  })
                                }
                              >
                                <span className={cn(STATUS_COLORS[status])}>
                                  {formatEnumLabel(status)}
                                </span>
                                {isSelected && (
                                  <span className="pointer-events-none absolute right-3 flex size-4 items-center justify-center">
                                    <Check className="size-3.5 text-primary" />
                                  </span>
                                )}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Delete action */}
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(wb.id)}
                        disabled={deletingId === wb.id}
                        className="flex shrink-0 items-center justify-center rounded-md p-1 text-muted-foreground/30 transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Delete waybill"
                      >
                        {deletingId === wb.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Trash2 className="size-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Add Multiple Dialog ════════════════════════════════ */}
      <Dialog open={multipleDialogOpen} onOpenChange={setMultipleDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add Multiple Waybill IDs</DialogTitle>
            <DialogDescription>
              Paste waybill IDs separated by commas or new lines.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Textarea
              value={multipleInput}
              onChange={(e) => setMultipleInput(e.target.value)}
              placeholder={`RA04498487\nRA04498488\nRA04498489`}
              className="min-h-[140px] font-mono text-xs leading-relaxed resize-y"
              autoFocus
            />

            {/* Preview */}
            {parsedMultiplePreview && (
              <div className="flex items-center gap-3 rounded-lg bg-muted/20 px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xxs font-medium text-muted-foreground/60">
                    Valid:
                  </span>
                  <span className="text-xs font-semibold text-foreground tabular-nums">
                    {parsedMultiplePreview.unique}
                  </span>
                </div>
                {parsedMultiplePreview.duplicates > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xxs font-medium text-muted-foreground/60">
                      Duplicates:
                    </span>
                    <span className="text-xs font-semibold text-warning tabular-nums">
                      {parsedMultiplePreview.duplicates}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMultipleInput("");
                setMultipleDialogOpen(false);
              }}
              disabled={addingMultiple}
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleAddMultiple}
              disabled={addingMultiple || !multipleInput.trim()}
            >
              {addingMultiple ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Plus className="size-3" />
              )}
              {addingMultiple ? "Adding..." : "Add IDs"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Delete Confirmation Dialog ════════════════════════ */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open) handleDeleteCancel();
        }}
        title="Delete waybill?"
        description="This waybill will be permanently removed. This action cannot be undone."
        confirmLabel={deletingConfirmed ? "Deleting..." : "Delete"}
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={deletingConfirmed}
      />

      {/* ═══ Bulk Delete Confirmation ════════════════════════════ */}
      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open) setBulkDeleteConfirmOpen(false);
        }}
        title={`Delete ${selectedIds.size} waybills?`}
        description={`${selectedIds.size} waybill(s) will be permanently removed. This action cannot be undone.`}
        confirmLabel={bulkDeleting ? "Deleting..." : "Delete All"}
        variant="destructive"
        onConfirm={handleBulkDelete}
        loading={bulkDeleting}
      />

      {/* ═══ Status Change Confirmation ═══════════════════════════ */}
      <ConfirmDialog
        open={statusChangeConfirm !== null}
        onOpenChange={(open) => {
          if (!open) handleStatusChangeCancel();
        }}
        title={`Change waybill status?`}
        description={
          statusChangeConfirm
            ? `Change waybill "${statusChangeConfirm.waybillId}" from ${formatEnumLabel(statusChangeConfirm.currentStatus)} to ${formatEnumLabel(statusChangeConfirm.newStatus)}?`
            : ""
        }
        confirmLabel={statusChangeConfirming ? "Changing..." : "Change"}
        variant="default"
        onConfirm={handleStatusChangeConfirm}
        loading={statusChangeConfirming}
      />

      {/* ═══ Add Range Dialog ════════════════════════════════════ */}
      <Dialog open={rangeDialogOpen} onOpenChange={setRangeDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add Waybill ID Range</DialogTitle>
            <DialogDescription>
              Generate a sequential range of waybill IDs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* Optional Prefix */}
            <div>
              <Label className="text-xs font-medium text-foreground/70">
                Optional Prefix
              </Label>
              <Input
                value={rangePrefix}
                onChange={(e) => setRangePrefix(e.target.value)}
                placeholder="e.g. RA"
                className="h-9 text-sm font-mono mt-1"
              />
            </div>

            {/* From / To */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-foreground/70">
                  From Waybill ID
                </Label>
                <Input
                  value={rangeFrom}
                  onChange={(e) => setRangeFrom(e.target.value)}
                  placeholder="100050"
                  className="h-9 text-sm font-mono mt-1"
                  inputMode="numeric"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-foreground/70">
                  To Waybill ID
                </Label>
                <Input
                  value={rangeTo}
                  onChange={(e) => setRangeTo(e.target.value)}
                  placeholder="100150"
                  className="h-9 text-sm font-mono mt-1"
                  inputMode="numeric"
                />
              </div>
            </div>

            {/* Preview */}
            {rangePreview && (
              <div className="rounded-lg border border-border/20 bg-muted/10 px-3 py-2.5 space-y-1.5">
                {rangePreview.valid ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xxs font-medium text-muted-foreground/60">
                        Range:
                      </span>
                      <span className="text-xs font-mono font-medium text-foreground">
                        {rangePreview.fromDisplay} &ndash; {rangePreview.toDisplay}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xxs font-medium text-muted-foreground/60">
                        IDs to generate:
                      </span>
                      <span className="text-xs font-semibold tabular-nums text-foreground">
                        {rangePreview.count}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-0.5 text-nano text-muted-foreground/50">
                      <span>Preview:</span>
                      {rangePreview.sampleIds.map((id, i) => (
                        <span key={i} className="font-mono text-foreground/60">
                          {id}
                          {i < rangePreview.sampleIds.length - 1 && (
                            <span className="text-muted-foreground/30 mx-0.5">,</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xxs text-warning/80">{rangePreview.error}</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRangeFrom("");
                setRangeTo("");
                setRangePrefix("");
                setRangeDialogOpen(false);
              }}
              disabled={generatingRange}
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleGenerateRange}
              disabled={generatingRange || !rangePreview?.valid}
            >
              {generatingRange ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <ListOrdered className="size-3" />
              )}
              {generatingRange ? "Generating..." : "Generate & Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
