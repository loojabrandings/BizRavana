"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Eye,
  FileDown,
  Layers3,
  MoreHorizontal,
  Pencil,
  Plus,
  Package,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-media-query";
import { useReadOnlyMode } from "@/providers/readonly-mode-provider";
import { createClient } from "@/lib/supabase/client";
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
import { ProductForm, type ProductFormData } from "@/components/products/product-form";
import { BulkImportForm } from "@/components/products/bulk-import-form";
import { CategoryManager, type Category } from "@/components/products/category-manager";
import { EditableStatusBadge } from "@/components/shared/editable-status-badge";
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

// ─── Types ─────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  category: string | null;
  size_variant: string | null;
  selling_price: number;
  cost_price: number | null;
  profit_margin: number | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

// ─── Constants ─────────────────────────────────────────────────────

const statusTabs: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const statusOptions: { value: string; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

// ─── Color Maps ────────────────────────────────────────────────────

const statusColorMap: Record<string, string> = {
  active: "text-success",
  inactive: "text-muted-foreground",
};

// ─── Utilities ─────────────────────────────────────────────────────

import { formatCurrency } from "@/lib/formatters";

import { formatDate } from "@/lib/formatters";

function formatProfitMargin(margin: number | null): string {
  if (margin === null) return "—";
  const prefix = margin >= 0 ? "+" : "";
  return `${prefix}${margin.toFixed(2)}%`;
}

function getProfitAmount(sellingPrice: number, costPrice: number | null): number {
  if (costPrice === null) return 0;
  return sellingPrice - costPrice;
}

// ─── Main Page ─────────────────────────────────────────────────────

export default function ProductsPage() {
  const { guard } = useReadOnlyMode();

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI
  const [dateFilter, setDateFilter] = useState<string>("this_month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeSort, setActiveSort] = useState<{ key: string; direction: "asc" | "desc" } | null>({ key: "name", direction: "asc" });
  const [activeStatusTab, setActiveStatusTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ─── Business ID & Categories ───────────────────────────────────
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catRefreshTrigger, setCatRefreshTrigger] = useState(0);

  // ─── Refetch trigger ──────────────────────────────────────────
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // ─── Data Fetching ─────────────────────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) { window.location.replace("/login?redirect=/dashboard/products"); return; }

        const { data: profile } = await supabase.from("profiles").select("business_id").eq("user_id", session.user.id).single();
        const bizId = (profile as { business_id: string | null } | null)?.business_id;
        if (!bizId) throw new Error("No business found for your account.");
        setBusinessId(bizId);

        const dateRange = getDateRange(dateFilter, dateFrom, dateTo);
        let q = supabase
          .from("products")
          .select("id, name, category, size_variant, selling_price, cost_price, profit_margin, is_active, created_at")
          .eq("business_id", bizId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(500);
        if (dateRange) q = q.gte("created_at", dateRange.start.toISOString()).lte("created_at", dateRange.end.toISOString());

        const { data, error: fetchError } = await q;
        if (fetchError) throw new Error(fetchError.message);

        setProducts((data || []).map((p) => ({
          id: String(p.id),
          name: String(p.name || ""),
          category: p.category ? String(p.category) : null,
          size_variant: p.size_variant ? String(p.size_variant) : null,
          selling_price: Number(p.selling_price || 0),
          cost_price: p.cost_price ? Number(p.cost_price) : null,
          profit_margin: p.profit_margin ? Number(p.profit_margin) : null,
          is_active: Boolean(p.is_active),
          created_at: String(p.created_at),
          notes: null,
        })));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
        console.error("Products fetch error", err);
        setError(msg);
      } finally { setLoading(false); }
    };
    fetchProducts();
  }, [dateFilter, dateFrom, dateTo, fetchTrigger]);

  // ─── Fetch Categories ──────────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      if (!businessId) return;
      const supabase = createClient();
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .eq("business_id", businessId)
        .order("name", { ascending: true });

      setCategories((data || []).map((c) => ({ id: String(c.id), name: String(c.name) })));
    };
    fetchCategories();
  }, [businessId, catRefreshTrigger]);

  // ─── Mutations ─────────────────────────────────────────────────
  const handleStatusChange = useCallback(async (productId: string, newStatus: string) => {
    const isActive = newStatus === "active";
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, is_active: isActive } : p)));
    try {
      const { error: e } = await createClient()
        .from("products")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", productId);
      if (e) {
        const { data: r } = await createClient().from("products").select("is_active").eq("id", productId).single();
        if (r) setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, is_active: Boolean(r.is_active) } : p)));
      }
    } catch (err) { console.error("Status update error:", err); }
  }, []);

  const handleCategoriesChange = useCallback(() => {
    setCatRefreshTrigger((n) => n + 1);
  }, []);

  // ─── Category tabs for FilterBar ───────────────────────────────
  const categoryTabs = useMemo(() => {
    const tabs: { value: string; label: string }[] = [
      { value: "all", label: "All" },
      ...categories.map((c) => ({ value: c.name, label: c.name })),
    ];
    return tabs;
  }, [categories]);

  // ─── Category filter state ─────────────────────────────────────
  const [activeCategoryTab, setActiveCategoryTab] = useState("all");

  const isMobile = useIsMobile();

  // ─── Page-level Category Manager ───────────────────────────────
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // ─── Bulk Import State ────────────────────────────────────
  const [showBulkImport, setShowBulkImport] = useState(false);

  // ─── In-Page Form State ─────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [previewData, setPreviewData] = useState<ProductFormData | null>(null);
  const [editData, setEditData] = useState<ProductFormData | null>(null);
  const [editKey, setEditKey] = useState(0);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [savedProductId, setSavedProductId] = useState<string | null>(null);

  // ─── Fetch full product from DB for preview/edit ────────────
  const fetchProductForForm = useCallback(async (productId: string): Promise<ProductFormData | null> => {
    try {
      const supabase = createClient();
      const { data: product, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error || !product) {
        console.error("Failed to fetch product:", error);
        return null;
      }

      return {
        name: String(product.name || ""),
        category: String(product.category || ""),
        size_variant: String(product.size_variant || ""),
        selling_price: Number(product.selling_price || 0),
        cost_price: Number(product.cost_price || 0),
        add_to_inventory: !!product.inventory_item_id,
        is_active: Boolean(product.is_active),
      };
    } catch (err) {
      console.error("fetchProductForForm error:", err);
      return null;
    }
  }, []);

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

  // ─── Delete Helpers ────────────────────────────────────────────
  const deleteProductsFromDb = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    const supabase = createClient();

    // Call the SECURITY DEFINER RPC which bypasses RLS
    // while still enforcing business-scoped access.
    const { data, error } = await supabase.rpc("soft_delete_products", {
      p_ids: ids,
    });

    if (error) throw error;

    const result = data as { ok: boolean; error?: string; deleted?: number } | null;
    if (!result?.ok) {
      throw new Error(result?.error || "Failed to delete products");
    }
  }, []);

  // ─── Confirm Dialog State ────────────────────────────────────
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

  // ─── Single Delete Confirm ────────────────────────────────────
  const confirmSingleDelete = useCallback(() => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);

    addDeletingIds([id]);

    deleteProductsFromDb([id])
      .then(() => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        removeDeletingIds([id]);
        toast.success("Product deleted", {
          description: "Product has been permanently deleted.",
        });
      })
      .catch((err) => {
        console.error("Delete product error:", err);
        removeDeletingIds([id]);
        toast.error("Failed to delete product", {
          description: err instanceof Error ? err.message : "An unexpected error occurred.",
        });
      });
  }, [deleteTargetId, deleteProductsFromDb, addDeletingIds, removeDeletingIds]);

  // ─── Bulk Delete Confirm ───────────────────────────────────────
  const confirmBulkDelete = useCallback(() => {
    const ids = [...selectedIds].filter((id): id is string => typeof id === "string");
    setShowBulkDelete(false);
    if (ids.length === 0) return;

    addDeletingIds(ids);
    setSelectedIds(new Set());

    deleteProductsFromDb(ids)
      .then(() => {
        setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
        removeDeletingIds(ids);
        toast.success("Products deleted", {
          description: `${ids.length} product${ids.length > 1 ? "s" : ""} have been permanently deleted.`,
        });
      })
      .catch((err) => {
        console.error("Bulk delete error:", err);
        removeDeletingIds(ids);
        toast.error("Failed to delete products", {
          description: err instanceof Error ? err.message : "An unexpected error occurred.",
        });
      });
  }, [selectedIds, deleteProductsFromDb, addDeletingIds, removeDeletingIds]);

  // ─── In-Page Form Submit ─────────────────────────────────────
  const handleProductSubmit = useCallback(
    async (data: ProductFormData) => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("user_id", session.user.id)
        .single();
      const businessId = (profile as { business_id: string | null } | null)?.business_id;
      if (!businessId) throw new Error("No business found");

      const commonFields = {
        name: data.name,
        category: data.category || null,
        size_variant: data.size_variant || null,
        selling_price: data.selling_price,
        cost_price: data.cost_price > 0 ? data.cost_price : null,
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      };

      if (editProductId) {
        // ── UPDATE existing product ─────────────────────────────
        const { error: updateError } = await supabase
          .from("products")
          .update(commonFields)
          .eq("id", editProductId);

        if (updateError) {
          throw new Error(`Database error: ${updateError.message || JSON.stringify(updateError)}`);
        }

        // Handle inventory linking
        if (data.add_to_inventory) {
          // Check if already linked to an inventory item
          const { data: existingProduct } = await supabase
            .from("products")
            .select("inventory_item_id")
            .eq("id", editProductId)
            .single();

          if (!existingProduct?.inventory_item_id) {
            // Create inventory item and link
            const { data: invItem, error: invError } = await supabase
              .from("inventory_items")
              .insert({
                business_id: businessId,
                name: data.name,
                category: data.category || null,
                size_variant: data.size_variant || null,
                unit_cost: data.cost_price > 0 ? data.cost_price : null,
                current_stock: 0,
              })
              .select("id")
              .single();

            if (!invError && invItem) {
              await supabase
                .from("products")
                .update({ inventory_item_id: invItem.id })
                .eq("id", editProductId);
            }
          }
        } else {
          // Unlink inventory item
          await supabase
            .from("products")
            .update({ inventory_item_id: null })
            .eq("id", editProductId);
        }

        // Update local state
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editProductId
              ? {
                  ...p,
                  name: data.name,
                  category: data.category || null,
                  size_variant: data.size_variant || null,
                  selling_price: data.selling_price,
                  cost_price: data.cost_price > 0 ? data.cost_price : null,
                  is_active: data.is_active,
                }
              : p,
          ),
        );

        toast.success("Product updated", {
          description: `${data.name} has been updated.`,
        });
      } else {
        // ── INSERT new product ──────────────────────────────────
        let inventoryItemId: string | null = null;

        // Create inventory item if checked
        if (data.add_to_inventory) {
          const { data: invItem, error: invError } = await supabase
            .from("inventory_items")
            .insert({
              business_id: businessId,
              name: data.name,
              category: data.category || null,
              size_variant: data.size_variant || null,
              unit_cost: data.cost_price > 0 ? data.cost_price : null,
              current_stock: 0,
            })
            .select("id")
            .single();

          if (!invError && invItem) {
            inventoryItemId = invItem.id;
          }
        }

        const { data: product, error: productError } = await supabase
          .from("products")
          .insert({
            ...commonFields,
            business_id: businessId,
            created_by: session.user.id,
            inventory_item_id: inventoryItemId,
          })
          .select("id, profit_margin, created_at")
          .single();

        if (productError) {
          throw new Error(`Database error: ${productError.message || JSON.stringify(productError)}`);
        }

        const productId = String(product!.id);

        // Prepend new product to local state
        setProducts((prev) => [
          {
            id: productId,
            name: data.name,
            category: data.category || null,
            size_variant: data.size_variant || null,
            selling_price: data.selling_price,
            cost_price: data.cost_price > 0 ? data.cost_price : null,
            profit_margin: product!.profit_margin ? Number(product!.profit_margin) : null,
            is_active: data.is_active,
            notes: null,
            created_at: String(product!.created_at),
          },
          ...prev,
        ]);

        toast.success("Product created", {
          description: `${data.name} has been added to your catalog.`,
        });
      }

      setShowForm(false);
      setEditData(null);
      setEditProductId(null);
      setPreviewData(null);
      setSavedProductId(null);
    },
    [editProductId],
  );

  // ─── Bulk Handlers ─────────────────────────────────────────────
  const handleBulkStatusChange = useCallback(
    async (newStatus: string) => {
      const ids = [...selectedIds].filter((id): id is string => typeof id === "string");
      if (ids.length === 0) return;
      const isActive = newStatus === "active";

      setProducts((prev) =>
        prev.map((p) => (ids.includes(p.id) ? { ...p, is_active: isActive } : p)),
      );

      try {
        const { error: e } = await createClient()
          .from("products")
          .update({ is_active: isActive, updated_at: new Date().toISOString() })
          .in("id", ids);

        if (e) {
          const { data: reverted } = await createClient()
            .from("products")
            .select("id, is_active")
            .in("id", ids);
          if (reverted) {
            const statusMap = Object.fromEntries(
              reverted.map((r) => [String(r.id), Boolean(r.is_active)]),
            );
            setProducts((prev) =>
              prev.map((p) =>
                ids.includes(p.id)
                  ? { ...p, is_active: statusMap[p.id] ?? p.is_active }
                  : p,
              ),
            );
          }
        }
      } catch (err) {
        console.error("Bulk status update error:", err);
      }
    },
    [selectedIds],
  );

  // ─── Sorting ───────────────────────────────────────────────────
  const handleSortToggle = (key: string) => setActiveSort((prev) =>
    prev?.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" }
  );

  // ─── Filtered & Sorted ─────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let r = [...products];
    if (activeStatusTab !== "all") {
      const isActive = activeStatusTab === "active";
      r = r.filter((p) => p.is_active === isActive);
    }
    if (activeCategoryTab !== "all") {
      r = r.filter((p) => p.category === activeCategoryTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.size_variant && p.size_variant.toLowerCase().includes(q)),
      );
    }
    if (activeSort) {
      r.sort((a, b) => {
        let cmp = 0;
        if (activeSort.key === "name") cmp = a.name.localeCompare(b.name);
        else if (activeSort.key === "category") cmp = (a.category || "").localeCompare(b.category || "");
        else if (activeSort.key === "selling_price") cmp = a.selling_price - b.selling_price;
        else if (activeSort.key === "cost_price") cmp = (a.cost_price || 0) - (b.cost_price || 0);
        else if (activeSort.key === "profit_margin") cmp = (a.profit_margin || 0) - (b.profit_margin || 0);
        return activeSort.direction === "asc" ? cmp : -cmp;
      });
    }
    return r;
  }, [products, activeStatusTab, activeCategoryTab, searchQuery, activeSort]);

  // ─── Export to XLSX ──────────────────────────────────────────────
  const handleExportXlsx = useCallback(() => {
    if (filteredProducts.length === 0) return;
    const rows = filteredProducts.map((product) => ({
      "Product Name": product.name,
      "Category": product.category || "—",
      "Size/Variant": product.size_variant || "—",
      "Selling Price (Rs.)": product.selling_price,
      "Cost Price (Rs.)": product.cost_price || "—",
      "Profit Margin": formatProfitMargin(product.profit_margin),
      "Status": product.is_active ? "Active" : "Inactive",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Products");

    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(
        key.length,
        ...rows.map((r) => String((r as Record<string, unknown>)[key] ?? "").length),
      ),
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, `products_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [filteredProducts]);

  // ─── Bulk Select by Status ──────────────────────────────────────
  const handleSelectByStatus = useCallback((status: string) => {
    const isActive = status === "active";
    const ids = filteredProducts
      .filter((p) => p.is_active === isActive)
      .map((p) => p.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, [filteredProducts]);

  // ─── Bulk Actions ──────────────────────────────────────────────
  const bulkActions = useMemo(
    () => (
      <>
        {/* Select by Status */}
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
            {statusOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className="rounded-lg text-sm gap-2 py-1.5"
                onClick={() => handleSelectByStatus(option.value)}
              >
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-sm font-semibold whitespace-nowrap",
                    statusColorMap[option.value] ?? "text-muted-foreground",
                  )}
                >
                  {option.label}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Bulk Status */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            Status
            <ChevronDown className="size-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[140px] p-1.5">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-1.5 pb-1 text-sm font-semibold uppercase tracking-widest-alt text-muted-foreground">
                Change status to
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            {statusOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className="rounded-lg text-sm gap-2 py-1.5"
                onClick={() => handleBulkStatusChange(option.value)}
              >
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-sm font-semibold whitespace-nowrap",
                    statusColorMap[option.value] ?? "text-muted-foreground",
                  )}
                >
                  {option.label}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete */}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowBulkDelete(true)}
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>

        {/* Export XLSX */}
        <Button
          variant="default"
          onClick={handleExportXlsx}
        >
          <FileDown className="size-3.5" />
          XLSX
        </Button>
      </>
    ),
    [handleSelectByStatus, handleBulkStatusChange, handleExportXlsx],
  );

  const activeFilterCount =
    (activeStatusTab !== "all" ? 1 : 0) +
    (activeCategoryTab !== "all" ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0) +
    (dateFilter !== "this_month" ? 1 : 0);

  const handleClearFilters = useCallback(() => {
    setActiveStatusTab("all");
    setActiveCategoryTab("all");
    setSearchQuery("");
    setDateFilter("this_month");
    setDateFrom("");
    setDateTo("");
  }, []);

  // ─── Pagination ───────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  const paginatedProducts = useMemo(
    () => filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredProducts, currentPage, pageSize],
  );

  // ─── Row Numbers Map ──────────────────────────────────────────
  const rowNumbers = useMemo(() => {
    const map = new Map<string, number>();
    paginatedProducts.forEach((product, index) => {
      map.set(product.id, (currentPage - 1) * pageSize + index + 1);
    });
    return map;
  }, [paginatedProducts, currentPage, pageSize]);

  useEffect(() => { setCurrentPage(1); }, [filteredProducts]);

  // ─── Columns ────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: "row_number",
        label: "#",
        className: "w-10 text-center",
        renderCell: (product) => (
          <span className="text-sm text-muted-foreground tabular-nums">{rowNumbers.get(product.id)}</span>
        ),
      },
      {
        id: "name",
        label: "Product Name",
        sortable: true,
        sortKey: "name",
        renderCell: (product) => (
          <span className="text-sm font-semibold text-foreground">{product.name}</span>
        ),
      },
      {
        id: "category",
        label: "Category",
        sortable: true,
        sortKey: "category",
        hideOnMobile: true,
        className: "min-w-[120px]",
        renderCell: (product) => (
          <span className="text-sm text-foreground">{product.category || "—"}</span>
        ),
      },
      {
        id: "size_variant",
        label: "Size / Variant",
        hideOnMobile: true,
        renderCell: (product) => (
          <span className="text-sm text-foreground">{product.size_variant || "—"}</span>
        ),
      },
      {
        id: "selling_price",
        label: "Selling Price",
        sortable: true,
        sortKey: "selling_price",
        renderCell: (product) => (
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {formatCurrency(product.selling_price)}
          </span>
        ),
      },
      {
        id: "cost_price",
        label: "Cost Price",
        sortable: true,
        sortKey: "cost_price",
        hideOnMobile: true,
        renderCell: (product) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {product.cost_price ? formatCurrency(product.cost_price) : "—"}
          </span>
        ),
      },
      {
        id: "profit_margin",
        label: "Profit",
        sortable: true,
        sortKey: "profit_margin",
        renderCell: (product) => {
          const margin = product.profit_margin;
          if (margin === null) return <span className="text-sm text-muted-foreground/40">—</span>;
          const profit = getProfitAmount(product.selling_price, product.cost_price);
          return (
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {formatCurrency(profit)}{' '}
              <span className={cn(margin >= 0 ? "text-success" : "text-destructive")}>
                ({formatProfitMargin(margin)})
              </span>
            </span>
          );
        },
      },
      {
        id: "status",
        label: "Status",
        sortable: true,
        sortKey: "status",
        renderCell: (product) => (
          <EditableStatusBadge
            value={product.is_active ? "active" : "inactive"}
            options={statusOptions}
            colorMap={statusColorMap}
            onUpdate={(v) => handleStatusChange(product.id, v)}
          />
        ),
      },
      {
        id: "actions",
        label: "",
        className: "w-24",
        renderCell: (product) => (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                fetchProductForForm(product.id).then((fd) => {
                  if (fd) {
                    setPreviewData(fd);
                    setSavedProductId(product.id);
                  }
                });
              }}
            >
              <Eye className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                fetchProductForForm(product.id).then((fd) => {
                  if (fd) {
                    if (guard("editing products")) return;
                    setEditData(fd);
                    setEditKey((k) => k + 1);
                    setShowForm(true);
                    setEditProductId(product.id);
                  }
                });
              }}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                if (guard("deleting products")) return;
                setDeleteTargetId(product.id);
              }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [handleStatusChange, rowNumbers],
  );

  // ─── Mobile Card Render ────────────────────────────────────────
  const renderMobileCard = useCallback(
    (product: Product) => (
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-border/80 bg-muted/50 p-4 shadow-sm"
      >
        {/* ── Header: Product name + Status ───────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-foreground leading-snug">
              {product.name}
            </p>
            {product.category && (
              <p className="mt-0.5 text-sm text-muted-foreground/70">
                <span className="text-xs font-medium text-muted-foreground/70">Category </span>
                <span className="text-foreground">{product.category}</span>
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center">
            <EditableStatusBadge
              value={product.is_active ? "active" : "inactive"}
              options={statusOptions}
              colorMap={statusColorMap}
              onUpdate={(v) => handleStatusChange(product.id, v)}
            />
          </div>
        </div>

        {/* ── Product Info: Size ─────────────────────────── */}
        <div className="mt-3">
          <p className="text-sm text-foreground/80">
            <span className="text-xs font-medium text-muted-foreground/70">Size: </span>
            {product.size_variant || "—"}
          </p>
        </div>

        {/* ── Pricing Summary ─────────────────────────────────── */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Selling Price</span>
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {formatCurrency(product.selling_price)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Profit</span>
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {product.profit_margin !== null ? (
                <>
                  {formatCurrency(getProfitAmount(product.selling_price, product.cost_price))}
                  {' '}
                  <span className={product.profit_margin >= 0 ? "text-success" : "text-destructive"}>
                    ({formatProfitMargin(product.profit_margin)})
                  </span>
                </>
              ) : "—"}
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
            onClick={(e) => {
              e.stopPropagation();
              fetchProductForForm(product.id).then((fd) => {
                if (fd) {
                  setPreviewData(fd);
                  setSavedProductId(product.id);
                }
              });
            }}
          >
            <Eye className="size-4" />
          </button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-xl text-accent-foreground/70 hover:bg-accent hover:text-accent-foreground transition-colors"
            title="Edit"
            onClick={(e) => {
              e.stopPropagation();
              fetchProductForForm(product.id).then((fd) => {
                if (fd) {
                  setEditData(fd);
                  setEditKey((k) => k + 1);
                  setShowForm(true);
                  setEditProductId(product.id);
                }
              });
            }}
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-xl text-destructive/70 hover:bg-status-danger-bg hover:text-destructive transition-colors"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTargetId(product.id);
            }}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </motion.div>
    ),
    [handleStatusChange],
  );

  // ─── Product Preview (read-only view) ─────────────────────────
  const previewPanel = previewData && (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col rounded-2xl glass-card"
    >
      {/* ═══════ Header ════════════════════════════════════════════ */}
      <div className={isMobile ? "px-4 pt-4 pb-3" : "px-8 pt-7 pb-5"}>
        {isMobile ? (
          <div>
            {/* Top row: product info + close */}
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold tracking-tight text-foreground leading-tight">
                  {previewData.name}
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground/70">
                  {previewData.category}{previewData.size_variant ? ` — ${previewData.size_variant}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setPreviewData(null); setSavedProductId(null); }}
                className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                title="Close"
              >
                <X className="size-4.5" />
              </button>
            </div>

            {/* Action buttons row */}
            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setPreviewData(null); setSavedProductId(null); }}
                className="flex-1 gap-1.5 text-sm font-medium h-9"
              >
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => {
                  setEditData(previewData);
                  setEditKey((k) => k + 1);
                  setShowForm(true);
                  setPreviewData(null);
                  if (savedProductId) setEditProductId(savedProductId);
                }}
                className="flex-1 gap-1.5 text-sm font-medium h-9"
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">{previewData.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {previewData.category}{previewData.size_variant ? ` — ${previewData.size_variant}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setPreviewData(null); setSavedProductId(null); }}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Close"
            >
              <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-border/40" />

      {/* ═══════ Scrollable Content ═══════════════════════════════ */}
      <div
        className={isMobile ? "flex-1 overflow-y-auto px-4" : "flex-1 overflow-y-auto px-8"}
        style={isMobile ? { maxHeight: "calc(100dvh - 380px)" } : {}}
      >
        <div className={isMobile ? "py-4 pb-[calc(88px+env(safe-area-inset-bottom))]" : "py-6"}>
          <div className={isMobile ? "space-y-4" : "mx-auto max-w-2xl space-y-6"}>
            {/* Pricing Summary */}
            <div className={isMobile ? "space-y-3" : "grid grid-cols-3 gap-6"}>
              <div className="rounded-2xl border border-border/50 bg-muted/30 p-5">
                <p className="text-sm text-muted-foreground mb-1">Selling Price</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(previewData.selling_price)}</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-muted/30 p-5">
                <p className="text-sm text-muted-foreground mb-1">Cost Price</p>
                <p className="text-xl font-bold text-muted-foreground">
                  {previewData.cost_price > 0 ? formatCurrency(previewData.cost_price) : "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-muted/30 p-5">
                <p className="text-sm text-muted-foreground mb-1">Profit</p>
                <p className="text-xl font-bold text-foreground">
                  {previewData.cost_price > 0
                    ? formatCurrency(getProfitAmount(previewData.selling_price, previewData.cost_price))
                    : "—"}
                </p>
                <p className={cn(
                  "text-sm font-semibold mt-1",
                  previewData.cost_price > 0 && previewData.selling_price >= previewData.cost_price
                    ? "text-success" : "text-destructive",
                )}>
                  {previewData.cost_price > 0
                    ? `Margin: ${formatProfitMargin(((previewData.selling_price - previewData.cost_price) / previewData.cost_price) * 100)}`
                    : ""}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className={isMobile ? "rounded-xl border border-border/50 bg-card p-4 space-y-3" : "rounded-2xl border border-border/50 bg-card p-6 space-y-4"}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="text-sm font-semibold text-foreground">{previewData.category || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Size / Variant</p>
                  <p className="text-sm font-semibold text-foreground">{previewData.size_variant || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className={cn(
                    "text-sm font-semibold",
                    previewData.is_active ? "text-success" : "text-muted-foreground",
                  )}>
                    {previewData.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inventory Linked</p>
                  <p className="text-sm font-semibold text-foreground">
                    {previewData.add_to_inventory ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ Footer ════════════════════════════════════════════ */}
      <div className={isMobile ? "border-t border-border/40 px-4 py-3" : "border-t border-border/50 px-8 py-4"}>
        <div className={isMobile ? "flex items-center justify-center" : "flex items-center justify-between"}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setPreviewData(null); setSavedProductId(null); }}
            className="gap-1.5 text-sm font-medium"
          >
            <ArrowLeft className="size-3.5" />
            Back to Products
          </Button>
          {!isMobile && (
            <Button
              variant="gradient"
              size="sm"
              onClick={() => {
                setEditData(previewData);
                setEditKey((k) => k + 1);
                setShowForm(true);
                setPreviewData(null);
                if (savedProductId) setEditProductId(savedProductId);
              }}
              className="gap-1.5 text-sm font-medium"
            >
              <Pencil className="size-3.5" />
              Edit Product
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );

  // ─── Empty State ────────────────────────────────────────────────
  const emptyState = useMemo(() => {
    const isStatusFiltered = activeStatusTab !== "all";
    const isCategoryFiltered = activeCategoryTab !== "all";
    const isFiltered = products.length > 0 && (isStatusFiltered || isCategoryFiltered);
    const statusLabel = statusTabs.find((t) => t.value === activeStatusTab)?.label ?? "";
    const categoryLabel = categoryTabs.find((t) => t.value === activeCategoryTab)?.label ?? "";
    let title = "No products yet";
    let description = "Add your first product to start building your catalog.";
    if (isStatusFiltered) {
      title = `No ${statusLabel.toLowerCase()} products`;
      description = "There are no products with this status yet.";
    } else if (isCategoryFiltered) {
      title = `No products in "${categoryLabel}"`;
      description = "There are no products in this category yet.";
    }
    return {
      icon: Package,
      title,
      description,
      action: (!isStatusFiltered && !isCategoryFiltered) ? (
        <Button
          variant="gradient"
          size="sm"              onClick={() => {
                if (guard("creating products")) return;
                setShowForm(true);
              }}
            >
              <Plus className="size-3.5" />
          New Product
        </Button>
      ) : undefined,
    };
  }, [products.length, activeStatusTab, activeCategoryTab, categoryTabs]);

  // ─── Render ────────────────────────────────────────────────────
  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="show">
      {!showForm && !previewData && !showBulkImport && (
        /* ─── Header ──────────────────────────────────────────── */
        <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Products</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your product catalog and pricing.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Button
              variant="outline"
              onClick={() => setShowCategoryManager(true)}
            >
              <Plus className="size-3.5" />
              Add Category
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowBulkImport(true)}
              className="hidden sm:inline-flex"
            >
              <Upload className="size-3.5" />
              Bulk Import
            </Button>
            <Button
              variant="gradient"
              onClick={() => {
                if (guard("creating products")) return;
                setShowForm(true);
              }}
            >
              <Plus className="size-4" />
              Add New Product
            </Button>
            {/* Mobile: More actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" className="sm:hidden" size="sm">
                    <MoreHorizontal className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="min-w-[160px] p-1.5">
                <DropdownMenuItem
                  className="rounded-lg text-sm gap-2 py-2"
                  onClick={() => setShowBulkImport(true)}
                >
                  <Upload className="size-4" />
                  Bulk Import
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      )}

      {!showForm && !previewData && !showBulkImport && (
        /* ─── Filter Bar ────────────────────────────────────────── */
        <motion.div variants={itemVariants} className="space-y-3">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by product name, category, size..."
            status={{
              value: activeCategoryTab,
              onChange: (v) => v && setActiveCategoryTab(v),
              options: categoryTabs,
              label: "Category",
            }}
            payment={{
              value: activeStatusTab,
              onChange: (v) => v && setActiveStatusTab(v),
              options: statusTabs,
              label: "Status",
            }}
            date={{
              value: dateFilter,
              onChange: (v) => v && setDateFilter(v),
              options: dateFilterOptions,
              isCustomMode: dateFilter === "custom",
              onCalendarClick: () =>
                setDateFilter(dateFilter === "custom" ? "this_month" : "custom"),
            }}
            activeFilterCount={activeFilterCount}
            onClearFilters={handleClearFilters}
          />

          {/* Custom date inputs row */}
          {dateFilter === "custom" && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">From</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 w-[140px] rounded-xl border border-input bg-background px-3 text-sm font-medium text-foreground shadow-xs outline-none transition-colors focus:border-ring focus:ring-[3px] focus:ring-ring/50 [color-scheme:light] dark:[color-scheme:dark]"
                  aria-label="From date"
                />
              </div>
              <span className="text-sm text-muted-foreground">—</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">To</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 w-[140px] rounded-xl border border-input bg-background px-3 text-sm font-medium text-foreground shadow-xs outline-none transition-colors focus:border-ring focus:ring-[3px] focus:ring-ring/50 [color-scheme:light] dark:[color-scheme:dark]"
                  aria-label="To date"
                />
              </div>
              <Dropdown
                value={dateFilter}
                onChange={(v) => v && setDateFilter(v)}
                options={dateFilterOptions.map((o) => ({ value: o.value, label: o.label }))}
                size="sm"
                className="min-w-[36px]"
              />
            </div>
          )}
        </motion.div>
      )}

      {/* ─── Product Preview / Product Form / Bulk Import / Data Table ─ */}
      <motion.div variants={itemVariants}>
        {previewPanel}
        {!previewData && showForm && (
          <ProductForm
            key={editData ? `edit_${editKey}` : "new"}
            initialData={editData || undefined}
            isEditing={!!editProductId}
            onSubmit={handleProductSubmit}
            onCancel={() => {
              setShowForm(false);
              setPreviewData(null);
              setEditData(null);
              setEditProductId(null);
              setSavedProductId(null);
            }}
            categories={categories}
            onCategoriesChange={handleCategoriesChange}
            businessId={businessId}
          />
        )}
        {!previewData && !showForm && showBulkImport && (
          <BulkImportForm
            businessId={businessId}
            categories={categories}
            onCategoriesChange={handleCategoriesChange}
            onCancel={() => setShowBulkImport(false)}
            onComplete={() => {
              setShowBulkImport(false);
              setFetchTrigger((n) => n + 1);
            }}
          />
        )}
        {!showForm && !previewData && !showBulkImport && (
          <DataTable<Product>
            columns={columns}
            data={paginatedProducts}
            keyExtractor={(product) => product.id}
            loading={loading}
            error={error}
            empty={emptyState}
            sort={{ active: activeSort, onToggle: handleSortToggle }}
            pagination={{
              currentPage,
              totalPages,
              totalItems: filteredProducts.length,
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
        title="Delete this product?"
        description="This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmSingleDelete}
      />

      <ConfirmDialog
        open={showBulkDelete}
        onOpenChange={setShowBulkDelete}
        title={selectedIds.size === 1 ? "Delete this product?" : `Delete ${selectedIds.size} products?`}
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
      />
    </motion.div>
  );
}
