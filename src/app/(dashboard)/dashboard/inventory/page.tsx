"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Boxes,
  ChevronDown,
  Eye,
  FileDown,
  Layers3,
  Pencil,
  Plus,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useReadOnlyMode } from "@/providers/readonly-mode-provider";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dropdown } from "@/components/ui/dropdown";
import { FilterBar } from "@/components/shared/filter-bar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { StockForm } from "@/components/inventory/stock-form";
import { StockPreview } from "@/components/inventory/stock-preview";
import { CategoryManager, type Category } from "@/components/products/category-manager";
import type { InventoryItem, StockFormData } from "@/components/inventory/types";
import {
  stockStatusTabs,
  stockStatusOptions,
  statusColorMap,
  statusBgMap,
} from "@/components/inventory/types";
import {
  getStockStatus,
  getStockStatusLabel,
  getStockValue,
  formatCurrency,
  formatDate,
  computeStockValues,
} from "@/components/inventory/utils";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { dateFilterOptions, getDateRange } from "@/lib/date-utils";

// ─── Animations ────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

// ─── Main Page ─────────────────────────────────────────────────────

function InventoryPageInner() {
  const { guard } = useReadOnlyMode();

  // ─── Read query params for pre-applied filters ───────────────
  const searchParams = useSearchParams();

  // Data
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI
  const [dateFilter, setDateFilter] = useState<string>("this_month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeSort, setActiveSort] = useState<{ key: string; direction: "asc" | "desc" } | null>({
    key: "name",
    direction: "asc",
  });
  const [activeStatusTab, setActiveStatusTab] = useState("all");

  // ─── Apply query params as initial filters ──────────────────
  useEffect(() => {
    const status = searchParams.get("status");
    if (status && stockStatusTabs.some((t) => t.value === status)) {
      setActiveStatusTab(status);
    }
  }, [searchParams]);
  const [activeCategoryTab, setActiveCategoryTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ─── Business ID & Categories ───────────────────────────────────
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catRefreshTrigger, setCatRefreshTrigger] = useState(0);

  // ─── Refetch trigger ──────────────────────────────────────────
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // ─── Data Fetching ─────────────────────────────────────────────
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) { window.location.replace("/login?redirect=/dashboard/inventory"); return; }

        const { data: profile } = await supabase.from("profiles").select("business_id").eq("user_id", session.user.id).single();
        const bizId = (profile as { business_id: string | null } | null)?.business_id;
        if (!bizId) throw new Error("No business found for your account.");
        setBusinessId(bizId);

        const dateRange = getDateRange(dateFilter, dateFrom, dateTo);
        let q = supabase
          .from("inventory_items")
          .select("id, name, category, size_variant, current_stock, unit_cost, supplier, reorder_level, last_restocked_at, created_at")
          .eq("business_id", bizId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(500);
        if (dateRange) q = q.gte("created_at", dateRange.start.toISOString()).lte("created_at", dateRange.end.toISOString());

        const { data, error: fetchError } = await q;
        if (fetchError) throw new Error(fetchError.message);

        const raw: InventoryItem[] = (data || []).map((p) => ({
          id: String(p.id),
          name: String(p.name || ""),
          category: p.category ? String(p.category) : null,
          size_variant: p.size_variant ? String(p.size_variant) : null,
          current_stock: Number(p.current_stock || 0),
          unit_cost: p.unit_cost ? Number(p.unit_cost) : null,
          stock_value: null,
          supplier: p.supplier ? String(p.supplier) : null,
          reorder_level: Number(p.reorder_level || 0),
          last_restocked_at: p.last_restocked_at ? String(p.last_restocked_at) : null,
          created_at: String(p.created_at),
        }));
        setItems(computeStockValues(raw));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
        console.error("Inventory fetch error", err);
        setError(msg);
      } finally { setLoading(false); }
    };
    fetchItems();
  }, [dateFilter, dateFrom, dateTo, fetchTrigger]);

  // ─── Fetch Categories ──────────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      if (!businessId) return;
      const supabase = createClient();
      const { data } = await supabase
        .from("inventory_categories")
        .select("id, name")
        .eq("business_id", businessId)
        .order("name", { ascending: true });

      setCategories((data || []).map((c) => ({ id: String(c.id), name: String(c.name) })));
    };
    fetchCategories();
  }, [businessId, catRefreshTrigger]);

  // ─── Category tabs for FilterBar ───────────────────────────────
  const categoryTabs = useMemo(() => {
    const tabs: { value: string; label: string }[] = [
      { value: "all", label: "All" },
      ...categories.map((c) => ({ value: c.name, label: c.name })),
    ];
    return tabs;
  }, [categories]);

  const handleCategoriesChange = useCallback(() => {
    setCatRefreshTrigger((n) => n + 1);
  }, []);

  // ─── In-Page Form State ─────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // ─── Preview State ─────────────────────────────────────────
  const [previewItem, setPreviewItem] = useState<InventoryItem | null>(null);

  // ─── Stock form key for reset ───────────────────────────────
  const [formKey, setFormKey] = useState(0);

  // ─── Category Manager ──────────────────────────────────────
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // ─── Selection ───────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // ─── In-Flight Delete Tracking ─────────────────────────────────
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const addDeletingIds = useCallback((ids: string[]) => {
    setDeletingIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const removeDeletingIds = useCallback((ids: string[]) => {
    setDeletingIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  // ─── Delete ──────────────────────────────────────────────────
  const deleteItemsFromDb = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    const supabase = createClient();

    const { data, error } = await supabase.rpc("soft_delete_inventory_items", {
      p_ids: ids,
    });

    if (error) throw error;

    const result = data as { ok: boolean; error?: string; deleted?: number } | null;
    if (!result?.ok) {
      throw new Error(result?.error || "Failed to delete inventory items");
    }
  }, []);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  // ─── Keyboard: Delete selected rows ───────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Del") return;
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return;
      if (selectedIds.size > 0) {
        e.preventDefault();
        setShowBulkDelete(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds, setShowBulkDelete]);

  const confirmSingleDelete = useCallback(() => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    addDeletingIds([id]);
    deleteItemsFromDb([id])
      .then(() => {
        setItems((prev) => prev.filter((p) => p.id !== id));
        removeDeletingIds([id]);
        toast.success("Item deleted", { description: "Inventory item has been permanently deleted." });
      })
      .catch((err) => {
        console.error("Delete error:", err);
        removeDeletingIds([id]);
        toast.error("Failed to delete item", { description: err instanceof Error ? err.message : "An unexpected error occurred." });
      });
  }, [deleteTargetId, deleteItemsFromDb, addDeletingIds, removeDeletingIds]);

  const confirmBulkDelete = useCallback(() => {
    const ids = [...selectedIds].filter((id): id is string => typeof id === "string");
    setShowBulkDelete(false);
    if (ids.length === 0) return;
    addDeletingIds(ids);
    setSelectedIds(new Set());
    deleteItemsFromDb(ids)
      .then(() => {
        setItems((prev) => prev.filter((p) => !ids.includes(p.id)));
        removeDeletingIds(ids);
        toast.success("Items deleted", { description: `${ids.length} item${ids.length > 1 ? "s" : ""} deleted.` });
      })
      .catch((err) => {
        console.error("Bulk delete error:", err);
        removeDeletingIds(ids);
        toast.error("Failed to delete items", { description: err instanceof Error ? err.message : "An unexpected error occurred." });
      });
  }, [selectedIds, deleteItemsFromDb, addDeletingIds, removeDeletingIds]);

  // ─── Stock Form Submit ────────────────────────────────────────
  const handleStockSubmit = useCallback(
    async (data: StockFormData) => {
      if (!businessId) throw new Error("No business found");

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const sign = data.type === "stock_in" ? 1 : -1;

      if (editingItem) {
        // ── UPDATE existing item ─────────────────────────────────
        const newStock = editingItem.current_stock + sign * data.quantity;
        if (newStock < 0) throw new Error("Insufficient stock");

        const { error: updateError } = await supabase
          .from("inventory_items")
          .update({
            name: data.item_name,
            category: data.category || null,
            size_variant: data.size_variant || null,
            current_stock: newStock,
            unit_cost: data.unit_cost > 0 ? data.unit_cost : null,
            supplier: data.supplier || null,
            reorder_level: data.reorder_level,
            last_restocked_at: data.type === "stock_in" ? new Date().toISOString() : undefined,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingItem.id);

        if (updateError) throw new Error(updateError.message);

        // Log transaction
        const { error: txnError } = await supabase
          .from("inventory_transactions")
          .insert({
            business_id: businessId,
            inventory_item_id: editingItem.id,
            type: data.type,
            quantity: data.quantity,
            unit_cost: data.unit_cost > 0 ? data.unit_cost : null,
            notes: data.notes || null,
            created_by: session.user.id,
          });

        if (txnError) console.error("Transaction log error:", txnError);

        // Update local state
        setItems((prev) =>
          prev.map((i) =>
            i.id === editingItem.id
              ? {
                  ...i,
                  name: data.item_name,
                  category: data.category || null,
                  size_variant: data.size_variant || null,
                  current_stock: newStock,
                  unit_cost: data.unit_cost > 0 ? data.unit_cost : null,
                  supplier: data.supplier || null,
                  reorder_level: data.reorder_level,
                  last_restocked_at: data.type === "stock_in" ? new Date().toISOString() : i.last_restocked_at,
                }
              : i,
          ),
        );

        setItems((prev) => computeStockValues(prev));
        toast.success("Stock updated", { description: `${data.item_name} — ${data.type === "stock_in" ? "added" : "removed"} ${data.quantity} units.` });
      } else {
        // ── INSERT new inventory item ────────────────────────────
        const { data: item, error: insertError } = await supabase
          .from("inventory_items")
          .insert({
            business_id: businessId,
            name: data.item_name,
            category: data.category || null,
            size_variant: data.size_variant || null,
            current_stock: data.type === "stock_in" ? data.quantity : 0,
            unit_cost: data.unit_cost > 0 ? data.unit_cost : null,
            supplier: data.supplier || null,
            reorder_level: data.reorder_level,
            created_by: session.user.id,
          })
          .select("id, created_at")
          .single();

        if (insertError) throw new Error(insertError.message);

        const newId = String(item!.id);
        const initialStock = data.type === "stock_in" ? data.quantity : 0;

        // Log initial transaction
        if (initialStock > 0) {
          await supabase.from("inventory_transactions").insert({
            business_id: businessId,
            inventory_item_id: newId,
            type: "stock_in",
            quantity: initialStock,
            unit_cost: data.unit_cost > 0 ? data.unit_cost : null,
            notes: "Initial stock entry",
            created_by: session.user.id,
          });
        }

        // Update local state
        const newItem: InventoryItem = {
          id: newId,
          name: data.item_name,
          category: data.category || null,
          size_variant: data.size_variant || null,
          current_stock: initialStock,
          unit_cost: data.unit_cost > 0 ? data.unit_cost : null,
          stock_value: data.unit_cost > 0 ? initialStock * data.unit_cost : null,
          supplier: data.supplier || null,
          reorder_level: data.reorder_level,
          last_restocked_at: data.type === "stock_in" ? new Date().toISOString() : null,
          created_at: String(item!.created_at),
        };

        setItems((prev) => [newItem, ...prev]);
        toast.success("Item created", { description: `${data.item_name} has been added to inventory.` });
      }

      setShowForm(false);
      setEditingItem(null);
      setPreviewItem(null);
    },
    [businessId, editingItem],
  );

  // ─── Start editing ─────────────────────────────────────────
  const handleEditItem = useCallback((item: InventoryItem) => {
    setEditingItem(item);
    setFormKey((k) => k + 1);
    setShowForm(true);
    setPreviewItem(null);
  }, []);

  // ─── Sorting ───────────────────────────────────────────────────
  const handleSortToggle = (key: string) => setActiveSort((prev) =>
    prev?.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" }
  );

  // ─── Filtered & Sorted ─────────────────────────────────────────
  const filteredItems = useMemo(() => {
    let r = [...items];
    if (activeCategoryTab !== "all") {
      r = r.filter((i) => i.category === activeCategoryTab);
    }
    if (activeStatusTab !== "all") {
      r = r.filter((i) => getStockStatus(i) === activeStatusTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.supplier && p.supplier.toLowerCase().includes(q)),
      );
    }
    if (activeSort) {
      r.sort((a, b) => {
        let cmp = 0;
        if (activeSort.key === "name") cmp = a.name.localeCompare(b.name);
        else if (activeSort.key === "category") cmp = (a.category || "").localeCompare(b.category || "");
        else if (activeSort.key === "current_stock") cmp = a.current_stock - b.current_stock;
        else if (activeSort.key === "unit_cost") cmp = (a.unit_cost || 0) - (b.unit_cost || 0);
        else if (activeSort.key === "stock_value") cmp = (a.stock_value || 0) - (b.stock_value || 0);
        else if (activeSort.key === "supplier") cmp = (a.supplier || "").localeCompare(b.supplier || "");
        return activeSort.direction === "asc" ? cmp : -cmp;
      });
    }
    return r;
  }, [items, activeCategoryTab, activeStatusTab, searchQuery, activeSort]);

  // ─── Low stock alert ──────────────────────────────────────────
  const lowStockCount = useMemo(
    () => items.filter((i) => getStockStatus(i) === "low_stock" || getStockStatus(i) === "out_of_stock").length,
    [items],
  );

  // ─── Export to XLSX ──────────────────────────────────────────────
  const handleExportXlsx = useCallback(() => {
    if (filteredItems.length === 0) return;
    const rows = filteredItems.map((item) => {
      const status = getStockStatus(item);
      return {
        "Item Name": item.name,
        "Category": item.category || "—",
        "Current Stock": item.current_stock,
        "Unit Cost (Rs.)": item.unit_cost ? formatCurrency(item.unit_cost) : "—",
        "Stock Value (Rs.)": item.stock_value ? formatCurrency(item.stock_value) : "—",
        "Supplier": item.supplier || "—",
        "Status": getStockStatusLabel(status),
        "Reorder Level": item.reorder_level,
        "Last Restocked": item.last_restocked_at ? formatDate(item.last_restocked_at) : "—",
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");

    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String((r as Record<string, unknown>)[key] ?? "").length)),
    }));
    ws["!cols"] = colWidths;
    XLSX.writeFile(wb, `inventory_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [filteredItems]);

  // ─── Bulk Actions ──────────────────────────────────────────────
  const bulkActions = useMemo(
    () => (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Layers3 className="size-3" />
            Select
            <ChevronDown className="size-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[160px] p-1.5">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-1.5 pb-1 text-sm font-semibold uppercase tracking-widest-alt text-muted-foreground">
                Select by status
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            {stockStatusOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className="rounded-lg text-sm gap-2 py-1.5"
                onClick={() => {
                  const ids = filteredItems
                    .filter((i) => getStockStatus(i) === option.value)
                    .map((i) => i.id);
                  setSelectedIds((prev) => {
                    const next = new Set(prev);
                    ids.forEach((id) => next.add(id));
                    return next;
                  });
                }}
              >
                <span className={cn("inline-flex rounded-full px-2 py-0.5 text-sm font-semibold whitespace-nowrap", statusColorMap[option.value] ?? "text-muted-foreground")}>
                  {option.label}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="destructive" size="sm" onClick={() => setShowBulkDelete(true)}>
          <Trash2 className="size-3.5" />
          Delete
        </Button>

        <Button variant="default" onClick={handleExportXlsx}>
          <FileDown className="size-3.5" />
          XLSX
        </Button>
      </>
    ),
    [filteredItems, handleExportXlsx],
  );

  const activeFilterCount =
    (activeCategoryTab !== "all" ? 1 : 0) +
    (activeStatusTab !== "all" ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0) +
    (dateFilter !== "this_month" ? 1 : 0);

  const handleClearFilters = useCallback(() => {
    setActiveCategoryTab("all");
    setActiveStatusTab("all");
    setSearchQuery("");
    setDateFilter("this_month");
    setDateFrom("");
    setDateTo("");
  }, []);

  // ─── Pagination ───────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const paginatedItems = useMemo(
    () => filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredItems, currentPage, pageSize],
  );

  // ─── Row Numbers Map ──────────────────────────────────────────
  const rowNumbers = useMemo(() => {
    const map = new Map<string, number>();
    paginatedItems.forEach((item, index) => {
      map.set(item.id, (currentPage - 1) * pageSize + index + 1);
    });
    return map;
  }, [paginatedItems, currentPage, pageSize]);

  useEffect(() => { setCurrentPage(1); }, [filteredItems]);

  // ─── Stock Status Dot ──────────────────────────────────────────
  const StatusDot = ({ status }: { status: string }) => (
    <span
      className={cn(
        "inline-block size-2 rounded-full mr-1.5 shrink-0",
        status === "in_stock" && "bg-success",
        status === "low_stock" && "bg-warning",
        status === "out_of_stock" && "bg-destructive",
      )}
    />
  );

  // ─── Columns ────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      {
        id: "row_number",
        label: "#",
        className: "w-10 text-center",
        renderCell: (item) => (
          <span className="text-sm text-muted-foreground tabular-nums">{rowNumbers.get(item.id)}</span>
        ),
      },
      {
        id: "name",
        label: "Item Name",
        sortable: true,
        sortKey: "name",
        className: "min-w-[160px]",
        renderCell: (item) => (
          <span className="text-sm font-semibold text-foreground truncate">{item.name}</span>
        ),
      },
      {
        id: "category",
        label: "Category",
        sortable: true,
        sortKey: "category",
        hideOnMobile: true,
        renderCell: (item) => (
          <span className="text-sm text-foreground">{item.category || "—"}</span>
        ),
      },
      {
        id: "current_stock",
        label: "Current Stock",
        sortable: true,
        sortKey: "current_stock",
        renderCell: (item) => {
          const status = getStockStatus(item);
          return (
            <span
              className={cn(
                "text-sm font-semibold tabular-nums",
                status === "low_stock" && "text-warning",
                status === "out_of_stock" && "text-destructive",
                status === "in_stock" && "text-foreground",
              )}
            >
              {item.current_stock}
            </span>
          );
        },
      },
      {
        id: "unit_cost",
        label: "Unit Cost",
        sortable: true,
        sortKey: "unit_cost",
        hideOnMobile: true,
        renderCell: (item) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {item.unit_cost ? formatCurrency(item.unit_cost) : "—"}
          </span>
        ),
      },
      {
        id: "stock_value",
        label: "Stock Value",
        sortable: true,
        sortKey: "stock_value",
        hideOnMobile: true,
        renderCell: (item) => (
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {item.stock_value ? formatCurrency(item.stock_value) : "—"}
          </span>
        ),
      },
      {
        id: "supplier",
        label: "Supplier",
        sortable: true,
        sortKey: "supplier",
        hideOnMobile: true,
        renderCell: (item) => (
          <span className="text-sm text-foreground">{item.supplier || "—"}</span>
        ),
      },
      {
        id: "status",
        label: "Status",
        renderCell: (item) => {
          const status = getStockStatus(item);
          return (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
                status === "in_stock" && "bg-success/10 text-success",
                status === "low_stock" && "bg-warning/10 text-warning",
                status === "out_of_stock" && "bg-destructive/10 text-destructive",
              )}
            >
              <StatusDot status={status} />
              {getStockStatusLabel(status)}
            </span>
          );
        },
      },
      {
        id: "last_restocked_at",
        label: "Last Restocked",
        hideOnMobile: true,
        renderCell: (item) => (
          <span className="text-sm text-muted-foreground">
            {item.last_restocked_at ? formatDate(item.last_restocked_at) : "—"}
          </span>
        ),
      },
      {
        id: "actions",
        label: "",
        className: "w-24",
        renderCell: (item) => (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewItem(item);
              }}
            >
              <Eye className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleEditItem(item);
              }}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                if (guard("deleting inventory items")) return;
                setDeleteTargetId(item.id);
              }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [rowNumbers],
  );

  // ─── Mobile Card Render ────────────────────────────────────────
  const renderMobileCard = useCallback(
    (item: InventoryItem) => {
      const status = getStockStatus(item);
      return (
        <motion.div
          variants={itemVariants}
          className={cn(
            "rounded-2xl border border-border/80 bg-muted/50 p-4 shadow-sm",
            statusBgMap[status],
          )}
        >
          {/* ── Header: Product name + Status badge ───────────── */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-foreground leading-snug">
                {item.name}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground/70">
                {item.category || "—"}{item.size_variant ? ` / ${item.size_variant}` : ""}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
                status === "in_stock" && "bg-success/10 text-success",
                status === "low_stock" && "bg-warning/10 text-warning",
                status === "out_of_stock" && "bg-destructive/10 text-destructive",
              )}
            >
              <StatusDot status={status} />
              {getStockStatusLabel(status)}
            </span>
          </div>

          {/* ── Inventory Summary: Current Stock + Reorder Level ── */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Stock</span>
              <span className={cn(
                "text-base font-bold tabular-nums",
                status === "low_stock" && "text-warning",
                status === "out_of_stock" && "text-destructive",
                status === "in_stock" && "text-foreground",
              )}>
                {item.current_stock} pcs
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Reorder Level</span>
              <span className="text-sm font-medium tabular-nums text-foreground">
                {item.reorder_level} pcs
              </span>
            </div>
          </div>

          {/* ── Inventory Values: Unit Cost + Stock Value ──────── */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Unit Cost</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {item.unit_cost ? formatCurrency(item.unit_cost) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Stock Value</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {item.stock_value ? formatCurrency(item.stock_value) : "—"}
              </span>
            </div>
          </div>

          {/* ── Quick Actions ──────────────────────────────────── */}
          <div className="mt-4 h-px bg-border/50" />
          <div className="mt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-xl text-accent-foreground/70 hover:bg-accent hover:text-accent-foreground transition-colors"
              title="View"
              onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}
            >
              <Eye className="size-4" />
            </button>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-xl text-accent-foreground/70 hover:bg-accent hover:text-accent-foreground transition-colors"
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                if (guard("editing inventory items")) return;
                handleEditItem(item);
              }}
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-xl text-destructive/70 hover:bg-status-danger-bg hover:text-destructive transition-colors"
              title="Delete"
              onClick={(e) => { e.stopPropagation(); setDeleteTargetId(item.id); }}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </motion.div>
      );
    },
    [handleEditItem],
  );

  // ─── Empty State ────────────────────────────────────────────────
  const emptyState = useMemo(() => {
    const isFiltered = items.length > 0 && activeStatusTab !== "all";
    const tabLabel = stockStatusTabs.find((t) => t.value === activeStatusTab)?.label ?? "";
    return {
      icon: Boxes,
      title: isFiltered ? `No ${tabLabel.toLowerCase()} items` : "No inventory items yet",
      description: isFiltered
        ? "There are no items with this status yet."
        : "Add your first inventory item to start tracking stock.",
      action: isFiltered ? undefined : (
        <Button variant="gradient" size="sm" onClick={() => {
                if (guard("creating inventory items")) return;
                setShowForm(true);
                setEditingItem(null);
                setFormKey((k) => k + 1);
              }}>
          <Plus className="size-3.5" />
          New Inventory Item
        </Button>
      ),
    };
  }, [items.length, activeStatusTab]);

  // ─── Render ────────────────────────────────────────────────────
  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="show">
      {!showForm && !previewItem && (
        /* ─── Header ──────────────────────────────────────────── */
        <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight">Inventory</h1>
              {lowStockCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/5 px-3 py-0.5 text-xs font-semibold text-warning">
                  <AlertTriangle className="size-3" />
                  {lowStockCount} low
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Track and manage your stock levels.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Button variant="outline" onClick={() => setShowCategoryManager(true)}>
              <Plus className="size-3.5" />
              Add Category
            </Button>
            <Button
              variant="gradient"
              onClick={() => {
                if (guard("creating inventory items")) return;
                setShowForm(true);
                setEditingItem(null);
                setFormKey((k) => k + 1);
              }}
            >
              <Plus className="size-4" />
              Stock In / Out
            </Button>
          </div>
        </motion.div>
      )}

      {!showForm && !previewItem && (
        /* ─── Filter Bar ────────────────────────────────────────── */
        <motion.div variants={itemVariants} className="space-y-3">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by item name, category, supplier..."
            status={{
              value: activeCategoryTab,
              onChange: (v) => v && setActiveCategoryTab(v),
              options: categoryTabs,
              label: "Category",
            }}
            payment={{
              value: activeStatusTab,
              onChange: (v) => v && setActiveStatusTab(v),
              options: stockStatusTabs,
              label: "Status",
            }}
            date={{
              value: dateFilter,
              onChange: (v) => v && setDateFilter(v),
              options: dateFilterOptions,
              isCustomMode: dateFilter === "custom",
              onCalendarClick: () => setDateFilter(dateFilter === "custom" ? "this_month" : "custom"),
            }}
            activeFilterCount={activeFilterCount}
            onClearFilters={handleClearFilters}
          />

          {dateFilter === "custom" && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">From</span>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 w-[140px] rounded-xl border border-input bg-background px-3 text-sm font-medium text-foreground shadow-xs outline-none transition-colors focus:border-ring focus:ring-[3px] focus:ring-ring/50 [color-scheme:light] dark:[color-scheme:dark]"
                  aria-label="From date" />
              </div>
              <span className="text-sm text-muted-foreground">—</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">To</span>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 w-[140px] rounded-xl border border-input bg-background px-3 text-sm font-medium text-foreground shadow-xs outline-none transition-colors focus:border-ring focus:ring-[3px] focus:ring-ring/50 [color-scheme:light] dark:[color-scheme:dark]"
                  aria-label="To date" />
              </div>
              <Dropdown value={dateFilter} onChange={(v) => v && setDateFilter(v)}
                options={dateFilterOptions.map((o) => ({ value: o.value, label: o.label }))}
                size="sm" className="min-w-[36px]" />
            </div>
          )}
        </motion.div>
      )}

      {/* ─── Preview / Form / Data Table ──────────────────────── */}
      <motion.div variants={itemVariants}>
        {previewItem ? (
          <StockPreview
            item={previewItem}
            onBack={() => setPreviewItem(null)}
            onEdit={() => {
              if (guard("editing inventory items")) return;
              handleEditItem(previewItem);
            }}
          />
        ) : showForm ? (
          <StockForm
            key={formKey}
            initialData={editingItem ? {
              item_name: editingItem.name,
              category: editingItem.category || "",
              size_variant: editingItem.size_variant || "",
              quantity: 0,
              unit_cost: editingItem.unit_cost || 0,
              supplier: editingItem.supplier || "",
              reorder_level: editingItem.reorder_level,
              type: "stock_in" as const,
              notes: "",
            } : undefined}
            isEditing={!!editingItem}
            currentStock={editingItem?.current_stock ?? 0}
            onSubmit={handleStockSubmit}
            onCancel={() => { setShowForm(false); setEditingItem(null); setPreviewItem(null); }}
            categories={categories}
            onCategoriesChange={handleCategoriesChange}
            businessId={businessId}
          />
        ) : (
          <DataTable<InventoryItem>
            columns={columns}
            data={paginatedItems}
            keyExtractor={(item) => item.id}
            loading={loading}
            error={error}
            empty={emptyState}
            sort={{ active: activeSort, onToggle: handleSortToggle }}
            pagination={{
              currentPage,
              totalPages,
              totalItems: filteredItems.length,
              pageSize,
              onPageChange: setCurrentPage,
              onPageSizeChange: setPageSize,
            }}
            renderMobileCard={renderMobileCard}
            selection={{
              selectedIds,
              onSelectionChange: setSelectedIds,
              bulkActions,
            }}
            deletingKeys={deletingIds}
          />
        )}
      </motion.div>

      {/* ─── Confirm Dialogs ───────────────────────────────────── */}
      <ConfirmDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}
        title="Delete this item?"
        description="This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmSingleDelete}
      />

      <ConfirmDialog
        open={showBulkDelete}
        onOpenChange={setShowBulkDelete}
        title={selectedIds.size === 1 ? "Delete this item?" : `Delete ${selectedIds.size} items?`}
        description="This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmBulkDelete}
      />

      {/* ─── Category Manager ────────────────────────────────── */}
      <CategoryManager
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
        onCategoriesChange={handleCategoriesChange}
        businessId={businessId}
        tableName="inventory_categories"
      />
    </motion.div>
  );
}

// ─── Exported Page (wrapped in Suspense for useSearchParams) ───────
export default function InventoryPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Boxes className="size-6 animate-pulse" />
          <p className="text-sm font-medium">Loading inventory…</p>
        </div>
      </div>
    }>
      <InventoryPageInner />
    </Suspense>
  );
}
