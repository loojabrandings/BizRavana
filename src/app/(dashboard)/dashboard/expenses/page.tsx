"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Eye,
  FileDown,
  Pencil,
  Plus,
  ReceiptText,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useReadOnlyMode } from "@/providers/readonly-mode-provider";
import { useDashboardSession } from "@/providers/dashboard-session-provider";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { EditableStatusBadge } from "@/components/shared/editable-status-badge";
import type { Category } from "@/components/products/category-manager";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { dateFilterOptions, getDateRange } from "@/lib/date-utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const CategoryManager = dynamic(
  () => import("@/components/products/category-manager").then((m) => m.CategoryManager),
  { ssr: false },
);
const ConfirmDialog = dynamic(
  () => import("@/components/shared/confirm-dialog").then((m) => m.ConfirmDialog),
  { ssr: false },
);
const DateRangePickerModal = dynamic(
  () => import("@/components/shared/lazy-date-range-picker-modal").then((m) => m.DateRangePickerModal),
  { ssr: false },
);

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

interface Expense {
  id: string;
  expense_number: string | null;
  expense_date: string;
  category: string;
  supplier: string | null;
  item_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  payment_method: string | null;
  payment_status: string;
  add_to_inventory: boolean;
  inventory_item_id: string | null;
  remarks: string | null;
  created_at: string;
}

// ─── Constants ─────────────────────────────────────────────────────

const paymentStatusValues = ["pending", "advanced", "paid"] as const;

const paymentStatusTabs: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  ...paymentStatusValues.map((v) => ({ value: v, label: v })),
];

const paymentStatusOptions: { value: string; label: string }[] = paymentStatusValues.map((v) => ({
  value: v,
  label: v,
}));

import { useExpenseSettings } from "@/stores/expense-settings-store";
import { useOrdersSettings } from "@/stores/orders-settings-store";

// ─── Color Maps ────────────────────────────────────────────────────

const paymentColorMap: Record<string, string> = {
  pending: "text-warning",
  advanced: "text-info",
  paid: "text-success",
};



// ─── Utilities ─────────────────────────────────────────────────────

import { formatCurrency } from "@/lib/formatters";

import { formatDate } from "@/lib/formatters";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Main Page ─────────────────────────────────────────────────────

function ExpensesPageInner() {
  const { guard } = useReadOnlyMode();
  const queryClient = useQueryClient();

  // ─── Dynamic payment methods from expense settings ────────────
  const expenseSettings = useExpenseSettings();
  const ordersSettings = useOrdersSettings();
  const localPaymentMethodOptions = useMemo(
    () =>
      expenseSettings.expensePaymentMethods.map((method) => ({
        value: method,
        label:
          method === "bank_transfer"
            ? "Bank Transfer"
            : method.charAt(0).toUpperCase() + method.slice(1).replace(/_/g, " "),
      })),
    [expenseSettings.expensePaymentMethods],
  );

  // UI
  const [dateFilter, setDateFilter] = useState<string>("this_month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [activeSort, setActiveSort] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState("all");
  const [paymentStatusTab, setPaymentStatusTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ─── Business ID & Categories ───────────────────────────────────
  const session = useDashboardSession();
  const businessId = session.businessId;
  const [catRefreshTrigger, setCatRefreshTrigger] = useState(0);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // ─── Fetch Categories ──────────────────────────────────────────
  const { data: categories = [] } = useQuery({
    queryKey: ["expense_categories", businessId, catRefreshTrigger],
    queryFn: async () => {
      if (!businessId) return [];
      const supabase = createClient();
      const { data } = await supabase
        .from("expense_categories")
        .select("id, name")
        .eq("business_id", businessId)
        .order("name", { ascending: true });

      return (data || []).map((c) => ({ id: String(c.id), name: String(c.name) }));
    },
    enabled: Boolean(businessId),
    staleTime: 60 * 1000,
  });

  // ─── Category Manager ──────────────────────────────────────────
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // ─── Fetch Inventory Items for auto-complete/link ─────────────
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["inventory_items_for_expenses", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const supabase = createClient();
      const { data } = await supabase
        .from("inventory_items")
        .select("id, name, category, current_stock, unit_cost, supplier")
        .eq("business_id", businessId)
        .is("deleted_at", null)
        .order("name", { ascending: true });

      return (data || []).map((item) => ({
        id: String(item.id),
        name: String(item.name),
        category: item.category ? String(item.category) : null,
        current_stock: Number(item.current_stock || 0),
        unit_cost: item.unit_cost ? Number(item.unit_cost) : null,
        supplier: item.supplier ? String(item.supplier) : null,
      }));
    },
    enabled: Boolean(businessId && ordersSettings.enableInventory),
    staleTime: 30 * 1000,
  });

  // In-Page Form State
  const [showForm, setShowForm] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    expense_date: todayStr(),
    category: "other",
    item_name: "",
    supplier: "",
    quantity: 1,
    unit_cost: 0,
    payment_method: useExpenseSettings.getState().defaultExpensePaymentMethod || "cash",
    payment_status: "pending" as "pending" | "advanced" | "paid",
    add_to_inventory: useExpenseSettings.getState().defaultAddToInventory ?? false,
    inventory_item_id: null as string | null,
    remarks: "",
  });

  const resetForm = useCallback(() => {
    setShowForm(false);
    setEditExpenseId(null);
    setFormData({
      expense_date: todayStr(),
      category: categories[0]?.name || "other",
      item_name: "",
      supplier: "",
      quantity: 1,
      unit_cost: 0,
      payment_method: useExpenseSettings.getState().defaultExpensePaymentMethod || "cash",
      payment_status: "pending",
      add_to_inventory: useExpenseSettings.getState().defaultAddToInventory ?? false,
      inventory_item_id: null,
      remarks: "",
    });
  }, [categories]);

  // ─── Category tabs from DB ─────────────────────────────────────
  const expenseCategoryTabs = useMemo(() => {
    const tabs: { value: string; label: string }[] = [
      { value: "all", label: "All" },
      ...categories.map((c) => ({ value: c.name, label: c.name })),
    ];
    if (!tabs.some((t) => t.value.toLowerCase() === "other")) {
      tabs.push({ value: "other", label: "Other" });
    }
    return tabs;
  }, [categories]);

  const categoryDropdownOptions = useMemo(() => {
    const list = categories.map((c) => ({ value: c.name, label: c.name }));
    if (!list.some((o) => o.value.toLowerCase() === "other")) {
      list.push({ value: "other", label: "Other" });
    }
    return list;
  }, [categories]);

  const handleCategoriesChange = useCallback(() => {
    setCatRefreshTrigger((n) => n + 1);
  }, []);

  // ─── Read query params ────────────────────────────────────────
  const searchParams = useSearchParams();

  // ─── Auto-open form when ?action=new, apply ?search filter ──
  useEffect(() => {
    const taskId = window.setTimeout(() => {
      if (searchParams.get("action") === "new") {
        setShowForm(true);
      }
      const search = searchParams.get("search");
      if (search) setSearchQuery(search);
    }, 0);
    return () => window.clearTimeout(taskId);
  }, [searchParams]);

  // ─── Data Fetching ─────────────────────────────────────────────
  const [expensesState, setRawExpenses] = useState<Expense[] | null>(null);

  useEffect(() => {
    setRawExpenses(null);
  }, [fetchTrigger, dateFilter, dateFrom, dateTo, activeCategoryTab, paymentStatusTab]);

  const {
    data: fetchedExpenses,
    isLoading: isQueryLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["expenses", businessId, dateFilter, dateFrom, dateTo, activeCategoryTab, paymentStatusTab, fetchTrigger],
    queryFn: async () => {
      if (!businessId) return [];
      const supabase = createClient();
      const dateRange = getDateRange(dateFilter, dateFrom, dateTo);
      let q = supabase
        .from("expenses")
        .select("id, expense_number, expense_date, category, supplier, item_name, quantity, unit_cost, total_cost, payment_method, payment_status, add_to_inventory, inventory_item_id, remarks, created_at")
        .eq("business_id", businessId)
        .order("expense_date", { ascending: false })
        .limit(300);
      if (dateRange) q = q.gte("expense_date", dateRange.start.toISOString().slice(0, 10)).lte("expense_date", dateRange.end.toISOString().slice(0, 10));
      if (activeCategoryTab !== "all") q = q.eq("category", activeCategoryTab);
      if (paymentStatusTab !== "all") q = q.eq("payment_status", paymentStatusTab);

      const { data, error: fetchError } = await q;
      if (fetchError) throw new Error(fetchError.message);

      return (data || []).map((e) => ({
        id: String(e.id),
        expense_number: e.expense_number ? String(e.expense_number) : null,
        expense_date: String(e.expense_date),
        category: String(e.category || "other"),
        supplier: e.supplier ? String(e.supplier) : null,
        item_name: String(e.item_name || ""),
        quantity: Number(e.quantity || 0),
        unit_cost: Number(e.unit_cost || 0),
        total_cost: Number(e.total_cost || 0),
        payment_method: e.payment_method ? String(e.payment_method) : null,
        payment_status: String(e.payment_status || "pending"),
        add_to_inventory: Boolean(e.add_to_inventory),
        inventory_item_id: e.inventory_item_id ? String(e.inventory_item_id) : null,
        remarks: e.remarks ? String(e.remarks) : null,
        created_at: String(e.created_at),
      }));
    },
    enabled: Boolean(businessId),
    staleTime: 30 * 1000,
  });

  const expenses = useMemo(
    () => expensesState ?? fetchedExpenses ?? [],
    [expensesState, fetchedExpenses],
  );

  const setExpenses = useCallback(
    (updater: Expense[] | ((prev: Expense[]) => Expense[])) => {
      setRawExpenses((current) => {
        const base = current ?? fetchedExpenses ?? [];
        return typeof updater === "function" ? updater(base) : updater;
      });
    },
    [fetchedExpenses],
  );

  const loading = isQueryLoading && !fetchedExpenses && (!expensesState || expensesState.length === 0);
  const error = queryError instanceof Error ? queryError.message : null;

  // ─── Mutations ─────────────────────────────────────────────────
  const handlePaymentChange = useCallback(async (expenseId: string, newPayment: string) => {
    setExpenses((prev) => prev.map((e) => (e.id === expenseId ? { ...e, payment_status: newPayment } : e)));
    try {
      const { error: e } = await createClient().from("expenses").update({ payment_status: newPayment, updated_at: new Date().toISOString() }).eq("id", expenseId);
      if (e) {
        const { data: r } = await createClient().from("expenses").select("payment_status").eq("id", expenseId).single();
        if (r) setExpenses((prev) => prev.map((ex) => (ex.id === expenseId ? { ...ex, payment_status: String(r.payment_status) } : ex)));
      }
    } catch (err) { console.error("Payment update error:", err); }
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
  const deleteExpensesFromDb = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    const supabase = createClient();

    // Check if any expenses being deleted had add_to_inventory
    const { data: toDelete } = await supabase
      .from("expenses")
      .select("id, add_to_inventory, inventory_item_id, quantity")
      .in("id", ids);

    if (toDelete && toDelete.length > 0) {
      for (const exp of toDelete) {
        if (exp.add_to_inventory && exp.inventory_item_id && Number(exp.quantity) > 0) {
          try {
            const { data: invItem } = await supabase
              .from("inventory_items")
              .select("id, current_stock")
              .eq("id", exp.inventory_item_id)
              .maybeSingle();

            if (invItem) {
              const revertedStock = Math.max(0, Number(invItem.current_stock || 0) - Number(exp.quantity));
              await supabase
                .from("inventory_items")
                .update({ current_stock: revertedStock, updated_at: new Date().toISOString() })
                .eq("id", invItem.id);
            }

            await supabase
              .from("inventory_transactions")
              .delete()
              .eq("reference_type", "expense")
              .eq("reference_id", exp.id);
          } catch (err) {
            console.error("Error reverting inventory on delete:", err);
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory_items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory_items_for_expenses"] });
    }

    const { error } = await supabase.from("expenses").delete().in("id", ids);
    if (error) throw error;
  }, [queryClient]);

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
    deleteExpensesFromDb([id])
      .then(() => {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        removeDeletingIds([id]);
        toast.success("Expense deleted", {
          description: "Expense has been permanently deleted.",
        });
      })
      .catch((err) => {
        console.error("Delete expense error:", err);
        removeDeletingIds([id]);
        toast.error("Failed to delete expense", {
          description: err instanceof Error ? err.message : "An unexpected error occurred.",
        });
      });
  }, [deleteTargetId, deleteExpensesFromDb, addDeletingIds, removeDeletingIds]);

  // ─── Bulk Delete Confirm ───────────────────────────────────────
  const confirmBulkDelete = useCallback(() => {
    const ids = [...selectedIds].filter((id): id is string => typeof id === "string");
    setShowBulkDelete(false);
    if (ids.length === 0) return;
    addDeletingIds(ids);
    setSelectedIds(new Set());
    deleteExpensesFromDb(ids)
      .then(() => {
        setExpenses((prev) => prev.filter((e) => !ids.includes(e.id)));
        removeDeletingIds(ids);
        toast.success("Expenses deleted", {
          description: `${ids.length} expense${ids.length > 1 ? "s" : ""} have been permanently deleted.`,
        });
      })
      .catch((err) => {
        console.error("Bulk delete error:", err);
        removeDeletingIds(ids);
        toast.error("Failed to delete expenses", {
          description: err instanceof Error ? err.message : "An unexpected error occurred.",
        });
      });
  }, [selectedIds, deleteExpensesFromDb, addDeletingIds, removeDeletingIds]);

  // ─── Form Submit ─────────────────────────────────────────────
  const handleSaveExpense = useCallback(async () => {
    const f = formData;
    if (!f.item_name.trim()) { toast.error("Item name is required"); return; }
    if (f.quantity < 1) { toast.error("Quantity must be at least 1"); return; }
    if (f.unit_cost <= 0) { toast.error("Unit cost must be greater than 0"); return; }

    const supabase = createClient();
    const businessId = session.businessId;
    if (!businessId) {
      toast.error("No business found for your account");
      return;
    }
    const bizId = businessId;
    const totalCost = f.quantity * f.unit_cost;

    try {
      let resolvedInventoryItemId = f.inventory_item_id || null;

      if (editExpenseId) {
        // ─── EDIT EXPENSE ──────────────────────────────────────────
        const { data: previousExpense } = await supabase
          .from("expenses")
          .select("id, add_to_inventory, inventory_item_id, quantity, expense_number")
          .eq("id", editExpenseId)
          .single();

        const wasInInventory = Boolean(previousExpense?.add_to_inventory && previousExpense?.inventory_item_id);
        const prevInvId = previousExpense?.inventory_item_id;
        const prevQty = Number(previousExpense?.quantity || 0);

        if (f.add_to_inventory) {
          if (wasInInventory && prevInvId) {
            // Find current inventory item
            const { data: currentInvItem } = await supabase
              .from("inventory_items")
              .select("id, name, current_stock, unit_cost")
              .eq("id", prevInvId)
              .maybeSingle();

            if (currentInvItem) {
              const qtyDiff = f.quantity - prevQty;
              const newStock = Math.max(0, Number(currentInvItem.current_stock || 0) + qtyDiff);
              await supabase
                .from("inventory_items")
                .update({
                  name: f.item_name.trim(),
                  current_stock: newStock,
                  unit_cost: f.unit_cost > 0 ? f.unit_cost : currentInvItem.unit_cost,
                  supplier: f.supplier.trim() || null,
                  last_restocked_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", currentInvItem.id);

              const { data: existingTxn } = await supabase
                .from("inventory_transactions")
                .select("id")
                .eq("reference_type", "expense")
                .eq("reference_id", editExpenseId)
                .maybeSingle();

              if (existingTxn) {
                await supabase
                  .from("inventory_transactions")
                  .update({
                    quantity: f.quantity,
                    unit_cost: f.unit_cost > 0 ? f.unit_cost : null,
                    notes: f.remarks ? f.remarks : `Expense: ${f.item_name.trim()}`,
                  })
                  .eq("id", existingTxn.id);
              } else {
                await supabase.from("inventory_transactions").insert({
                  business_id: bizId,
                  inventory_item_id: currentInvItem.id,
                  type: "stock_in",
                  quantity: f.quantity,
                  unit_cost: f.unit_cost > 0 ? f.unit_cost : null,
                  reference_type: "expense",
                  reference_id: editExpenseId,
                  notes: f.remarks ? f.remarks : `Expense: ${f.item_name.trim()}`,
                  created_by: session.userId || null,
                });
              }
              resolvedInventoryItemId = currentInvItem.id;
            }
          } else {
            // Was not in inventory, now adding
            const { data: matchedItem } = await supabase
              .from("inventory_items")
              .select("id, current_stock, unit_cost")
              .eq("business_id", bizId)
              .ilike("name", f.item_name.trim())
              .is("deleted_at", null)
              .maybeSingle();

            if (matchedItem) {
              resolvedInventoryItemId = matchedItem.id;
              const newStock = Number(matchedItem.current_stock || 0) + Number(f.quantity);
              await supabase
                .from("inventory_items")
                .update({
                  current_stock: newStock,
                  unit_cost: f.unit_cost > 0 ? f.unit_cost : matchedItem.unit_cost,
                  supplier: f.supplier.trim() || null,
                  last_restocked_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", matchedItem.id);
            } else {
              const { data: newInv, error: newInvErr } = await supabase
                .from("inventory_items")
                .insert({
                  business_id: bizId,
                  name: f.item_name.trim(),
                  category: f.category && f.category !== "other" ? f.category : null,
                  current_stock: Number(f.quantity),
                  unit_cost: f.unit_cost > 0 ? f.unit_cost : null,
                  supplier: f.supplier.trim() || null,
                  reorder_level: 0,
                  last_restocked_at: new Date().toISOString(),
                  created_by: session.userId || null,
                })
                .select("id")
                .single();

              if (!newInvErr && newInv) {
                resolvedInventoryItemId = newInv.id;
              }
            }

            if (resolvedInventoryItemId) {
              await supabase.from("inventory_transactions").insert({
                business_id: bizId,
                inventory_item_id: resolvedInventoryItemId,
                type: "stock_in",
                quantity: f.quantity,
                unit_cost: f.unit_cost > 0 ? f.unit_cost : null,
                reference_type: "expense",
                reference_id: editExpenseId,
                notes: f.remarks ? f.remarks : `Expense: ${f.item_name.trim()}`,
                created_by: session.userId || null,
              });
            }
          }
        } else if (wasInInventory && prevInvId) {
          // Unchecked add_to_inventory: revert stock and delete transaction
          const { data: prevInv } = await supabase
            .from("inventory_items")
            .select("id, current_stock")
            .eq("id", prevInvId)
            .maybeSingle();

          if (prevInv) {
            const revertedStock = Math.max(0, Number(prevInv.current_stock || 0) - prevQty);
            await supabase
              .from("inventory_items")
              .update({
                current_stock: revertedStock,
                updated_at: new Date().toISOString(),
              })
              .eq("id", prevInv.id);
          }

          await supabase
            .from("inventory_transactions")
            .delete()
            .eq("reference_type", "expense")
            .eq("reference_id", editExpenseId);

          resolvedInventoryItemId = null;
        }

        const { error: updateError } = await supabase
          .from("expenses")
          .update({
            expense_date: f.expense_date,
            category: f.category || "other",
            item_name: f.item_name.trim(),
            supplier: f.supplier.trim() || null,
            quantity: f.quantity,
            unit_cost: f.unit_cost,
            payment_method: f.payment_method || null,
            payment_status: f.payment_status,
            add_to_inventory: f.add_to_inventory,
            inventory_item_id: f.add_to_inventory ? resolvedInventoryItemId : null,
            remarks: f.remarks || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editExpenseId);

        if (updateError) throw updateError;

        setExpenses((prev) =>
          prev.map((e) =>
            e.id === editExpenseId
              ? {
                  ...e,
                  expense_date: f.expense_date,
                  category: f.category || "other",
                  item_name: f.item_name.trim(),
                  supplier: f.supplier.trim() || null,
                  quantity: f.quantity,
                  unit_cost: f.unit_cost,
                  total_cost: totalCost,
                  payment_method: f.payment_method,
                  payment_status: f.payment_status,
                  add_to_inventory: f.add_to_inventory,
                  inventory_item_id: f.add_to_inventory ? resolvedInventoryItemId : null,
                  remarks: f.remarks || null,
                }
              : e,
          ),
        );

        toast.success("Expense updated", {
          description: f.add_to_inventory
            ? `${f.item_name} updated and synced with Inventory.`
            : `${f.item_name} has been updated.`,
        });
      } else {
        // ─── INSERT NEW EXPENSE ────────────────────────────────────
        if (f.add_to_inventory) {
          // Check if an inventory item already exists with matching name
          const { data: matchedItem } = await supabase
            .from("inventory_items")
            .select("id, name, current_stock, unit_cost")
            .eq("business_id", bizId)
            .ilike("name", f.item_name.trim())
            .is("deleted_at", null)
            .maybeSingle();

          if (matchedItem) {
            resolvedInventoryItemId = matchedItem.id;
            const newStock = Number(matchedItem.current_stock || 0) + Number(f.quantity);
            await supabase
              .from("inventory_items")
              .update({
                current_stock: newStock,
                unit_cost: f.unit_cost > 0 ? f.unit_cost : matchedItem.unit_cost,
                supplier: f.supplier.trim() || null,
                last_restocked_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", matchedItem.id);
          } else {
            // Create brand new inventory item
            const { data: newInv, error: newInvErr } = await supabase
              .from("inventory_items")
              .insert({
                business_id: bizId,
                name: f.item_name.trim(),
                category: f.category && f.category !== "other" ? f.category : null,
                current_stock: Number(f.quantity),
                unit_cost: f.unit_cost > 0 ? f.unit_cost : null,
                supplier: f.supplier.trim() || null,
                reorder_level: 0,
                last_restocked_at: new Date().toISOString(),
                created_by: session.userId || null,
              })
              .select("id")
              .single();

            if (newInvErr) {
              console.error("Error creating inventory item:", newInvErr);
            } else if (newInv) {
              resolvedInventoryItemId = newInv.id;
            }
          }
        }

        const { data: newExpense, error: insertError } = await supabase
          .from("expenses")
          .insert({
            business_id: bizId,
            expense_date: f.expense_date,
            category: f.category || "other",
            item_name: f.item_name.trim(),
            supplier: f.supplier.trim() || null,
            quantity: f.quantity,
            unit_cost: f.unit_cost,
            payment_method: f.payment_method || null,
            payment_status: f.payment_status,
            add_to_inventory: f.add_to_inventory,
            inventory_item_id: f.add_to_inventory ? resolvedInventoryItemId : null,
            remarks: f.remarks || null,
            created_by: session.userId || null,
          })
          .select("id, total_cost, expense_number, created_at")
          .single();

        if (insertError) throw insertError;

        // Log transaction if added to inventory
        if (f.add_to_inventory && resolvedInventoryItemId && newExpense) {
          const { error: txnError } = await supabase
            .from("inventory_transactions")
            .insert({
              business_id: bizId,
              inventory_item_id: resolvedInventoryItemId,
              type: "stock_in",
              quantity: f.quantity,
              unit_cost: f.unit_cost > 0 ? f.unit_cost : null,
              reference_type: "expense",
              reference_id: newExpense.id,
              notes: f.remarks ? f.remarks : `Expense: ${f.item_name.trim()}`,
              created_by: session.userId || null,
            });
          if (txnError) {
            console.error("Failed to insert inventory transaction:", txnError);
          }
        }

        setExpenses((prev) => [
          {
            id: String(newExpense!.id),
            expense_number: newExpense!.expense_number ? String(newExpense!.expense_number) : null,
            expense_date: f.expense_date,
            category: f.category || "other",
            supplier: f.supplier.trim() || null,
            item_name: f.item_name.trim(),
            quantity: f.quantity,
            unit_cost: f.unit_cost,
            total_cost: Number(newExpense!.total_cost || totalCost),
            payment_method: f.payment_method,
            payment_status: f.payment_status,
            add_to_inventory: f.add_to_inventory,
            inventory_item_id: f.add_to_inventory ? resolvedInventoryItemId : null,
            remarks: f.remarks || null,
            created_at: String(newExpense!.created_at),
          },
          ...prev,
        ]);

        toast.success("Expense created", {
          description: f.add_to_inventory
            ? `${f.item_name} has been added and recorded in Inventory.`
            : `${f.item_name} has been added.`,
        });
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["inventory_items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory_items_for_expenses"] });

      setFetchTrigger((n) => n + 1);
      resetForm();
    } catch (err) {
      console.error("Save expense error:", err);
      toast.error("Failed to save expense", {
        description: err instanceof Error ? err.message : "An unexpected error occurred",
      });
    }
  }, [formData, editExpenseId, session, queryClient, resetForm]);

  // ─── Edit expense ──────────────────────────────────────────────
  const handleEditExpense = useCallback((expense: Expense) => {
    setFormData({
      expense_date: expense.expense_date,
      category: expense.category,
      item_name: expense.item_name,
      supplier: expense.supplier || "",
      quantity: expense.quantity,
      unit_cost: expense.unit_cost,
      payment_method: expense.payment_method || useExpenseSettings.getState().defaultExpensePaymentMethod || "cash",
      payment_status: expense.payment_status as "pending" | "advanced" | "paid",
      add_to_inventory: expense.add_to_inventory,
      inventory_item_id: expense.inventory_item_id || null,
      remarks: expense.remarks || "",
    });
    setEditExpenseId(expense.id);
    setShowForm(true);
  }, []);

  // ─── Sorting ───────────────────────────────────────────────────
  const handleSortToggle = (key: string) => setActiveSort((prev) =>
    prev?.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" }
  );

  // ─── Filtered & Sorted ─────────────────────────────────────────
  const filteredExpenses = useMemo(() => {
    let r = [...expenses];
    if (activeCategoryTab !== "all") r = r.filter((e) => e.category === activeCategoryTab);
    if (paymentStatusTab !== "all") r = r.filter((e) => e.payment_status === paymentStatusTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter((e) =>
        e.item_name.toLowerCase().includes(q) ||
        (e.supplier && e.supplier.toLowerCase().includes(q))
      );
    }
    if (activeSort) {
      r.sort((a, b) => {
        let cmp = 0;
        if (activeSort.key === "item_name") cmp = a.item_name.localeCompare(b.item_name);
        else if (activeSort.key === "category") cmp = a.category.localeCompare(b.category);
        else if (activeSort.key === "payment_status") cmp = a.payment_status.localeCompare(b.payment_status);
        else if (activeSort.key === "expense_date") cmp = a.expense_date.localeCompare(b.expense_date);
        return activeSort.direction === "asc" ? cmp : -cmp;
      });
    }
    return r;
  }, [expenses, activeCategoryTab, paymentStatusTab, searchQuery, activeSort]);

  // ─── Export to XLSX ──────────────────────────────────────────────
  const handleExportXlsx = useCallback(async () => {
    if (filteredExpenses.length === 0) return;
    const XLSX = await import("xlsx");
    const rows = filteredExpenses.map((expense) => ({
      "#": expense.expense_number ?? expense.id.slice(0, 8),
      Date: formatDate(expense.expense_date),
      Supplier: expense.supplier ?? "—",
      Item: expense.item_name,
      Category: expense.category,
      Qty: expense.quantity,
      "Unit Cost": expense.unit_cost,
      "Total (Rs.)": expense.total_cost,
      Payment: expense.payment_status,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");

    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String((r as Record<string, unknown>)[key] ?? "").length)),
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, `expenses_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [filteredExpenses]);

  // ─── Bulk Actions ──────────────────────────────────────────────
  const handleBulkPaymentChange = useCallback(async (newPayment: string) => {
    const ids = [...selectedIds].filter((id): id is string => typeof id === "string");
    if (ids.length === 0) return;

    setExpenses((prev) => prev.map((e) => (ids.includes(e.id) ? { ...e, payment_status: newPayment } : e)));

    try {
      const { error: e } = await createClient()
        .from("expenses")
        .update({ payment_status: newPayment, updated_at: new Date().toISOString() })
        .in("id", ids);

      if (e) {
        const { data: reverted } = await createClient().from("expenses").select("id, payment_status").in("id", ids);
        if (reverted) {
          const statusMap = Object.fromEntries(reverted.map((r) => [String(r.id), String(r.payment_status)]));
          setExpenses((prev) => prev.map((ex) => (ids.includes(ex.id) ? { ...ex, payment_status: statusMap[ex.id] ?? ex.payment_status } : ex)));
        }
      }
    } catch (err) { console.error("Bulk payment update error:", err); }
  }, [selectedIds]);

  const bulkActions = useMemo(
    () => (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger>
            Payment
            <ChevronDown className="size-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[140px] p-1.5">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-1.5 pb-1 text-sm font-semibold uppercase tracking-widest-alt text-muted-foreground">
                Change payment to
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            {paymentStatusOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className="rounded-lg text-sm gap-2 py-1.5"
                onClick={() => handleBulkPaymentChange(option.value)}
              >
                <span className={cn("inline-flex rounded-full px-2 py-0.5 text-sm font-semibold whitespace-nowrap", paymentColorMap[option.value] ?? "text-muted-foreground")}>
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
    [handleBulkPaymentChange, handleExportXlsx],
  );

  const activeFilterCount =
    (activeCategoryTab !== "all" ? 1 : 0) +
    (paymentStatusTab !== "all" ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0) +
    (dateFilter !== "this_month" ? 1 : 0);

  const handleClearFilters = useCallback(() => {
    setActiveCategoryTab("all");
    setPaymentStatusTab("all");
    setSearchQuery("");
    setDateFilter("this_month");
    setDateFrom("");
    setDateTo("");
  }, []);

  // ─── Pagination ───────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [previousFilteredExpenses, setPreviousFilteredExpenses] = useState(filteredExpenses);
  const [pageSize, setPageSize] = useState(25);
  if (filteredExpenses !== previousFilteredExpenses) {
    setPreviousFilteredExpenses(filteredExpenses);
    setCurrentPage(1);
  }
  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / pageSize));

  const paginatedExpenses = useMemo(
    () => filteredExpenses.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredExpenses, currentPage, pageSize],
  );

  // ─── Columns ────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<Expense>[]>(
    () => [
      {
        id: "expense_number",
        label: "#",
        sortable: true,
        sortKey: "expense_date",
        renderCell: (expense) => (
          <div>
            <p className="text-sm font-semibold text-foreground">
              {expense.expense_number ?? `#${expense.id.slice(0, 8)}`}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground/70">{formatDate(expense.expense_date)}</p>
          </div>
        ),
      },
      {
        id: "supplier",
        label: "Supplier",
        hideOnMobile: true,
        className: "min-w-[120px]",
        renderCell: (expense) => (
          <span className="truncate block text-sm text-foreground">{expense.supplier || "—"}</span>
        ),
      },
      {
        id: "category",
        label: "Category",
        sortable: true,
        sortKey: "category",
        hideOnMobile: true,
        renderCell: (expense) => (
          <span className="text-sm text-foreground">{expense.category}</span>
        ),
      },
      {
        id: "item_name",
        label: "Item",
        sortable: true,
        sortKey: "item_name",
        className: "min-w-[160px]",
        renderCell: (expense) => (
          <div>
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm text-foreground">{expense.item_name}</p>
              {expense.add_to_inventory && (
                <span
                  title="Recorded in Inventory"
                  className="inline-flex items-center rounded-full bg-info/10 px-1.5 py-0.5 text-[10px] font-medium text-info shrink-0"
                >
                  Inventory
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        id: "quantity",
        label: "Qty",
        hideOnMobile: true,
        renderCell: (expense) => (
          <span className="text-sm text-muted-foreground tabular-nums">{expense.quantity}</span>
        ),
      },
      {
        id: "total_cost",
        label: "Total Cost",
        renderCell: (expense) => (
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {formatCurrency(expense.total_cost)}
          </span>
        ),
      },
      {
        id: "payment_status",
        label: "Payment",
        sortable: true,
        sortKey: "payment_status",
        renderCell: (expense) => (
          <EditableStatusBadge
            value={expense.payment_status}
            options={paymentStatusOptions}
            colorMap={paymentColorMap}
            onUpdate={(v) => handlePaymentChange(expense.id, v)}
          />
        ),
      },
      {
        id: "actions",
        label: "",
        className: "w-24",
        renderCell: (expense) => (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); }}>
              <Eye className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon-xs"              onClick={(e) => {
                e.stopPropagation();
                if (guard("editing expenses")) return;
                handleEditExpense(expense);
              }}>
              <Pencil className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon-xs"              onClick={(e) => {
                e.stopPropagation();
                if (guard("deleting expenses")) return;
                setDeleteTargetId(expense.id);
              }}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [guard, handlePaymentChange, handleEditExpense],
  );

  // ─── Mobile Card Render ────────────────────────────────────────
  const renderMobileCard = useCallback(
    (expense: Expense) => (
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-semibold text-foreground">
                {expense.item_name}
              </p>
              {expense.add_to_inventory && (
                <span
                  title="Recorded in Inventory"
                  className="inline-flex items-center rounded-full bg-info/10 px-1.5 py-0.5 text-[10px] font-medium text-info shrink-0"
                >
                  Inventory
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{formatDate(expense.expense_date)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <EditableStatusBadge
              value={expense.payment_status}
              options={paymentStatusOptions}
              colorMap={paymentColorMap}
              onUpdate={(v) => handlePaymentChange(expense.id, v)}
            />
          </div>
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{expense.supplier || "—"}</span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-xs text-muted-foreground">{expense.category}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Qty: <span className="font-semibold text-foreground">{expense.quantity}</span></span>
            <span className="font-semibold text-foreground">{formatCurrency(expense.total_cost)}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); handleEditExpense(expense); }}>
              <Pencil className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={(e) => { e.stopPropagation(); setDeleteTargetId(expense.id); }}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>
    ),
    [handlePaymentChange, handleEditExpense],
  );

  // ─── Empty State ────────────────────────────────────────────────
  const emptyState = useMemo(() => {
    const isFiltered = expenses.length > 0 && activeCategoryTab !== "all";
    const tabLabel = expenseCategoryTabs.find((t) => t.value === activeCategoryTab)?.label ?? "";
    return {
      icon: ReceiptText,
      title: isFiltered ? `No ${tabLabel.toLowerCase()} expenses` : "No expenses yet",
      description: isFiltered
        ? "There are no expenses with this category yet."
        : "Record your first expense to start tracking your business costs.",
      action: isFiltered ? undefined : (
        <Button variant="gradient" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="size-3.5" />
          New Expense
        </Button>
      ),
    };
  }, [expenses.length, activeCategoryTab, expenseCategoryTabs]);

  // ─── Auto-calculated total ─────────────────────────────────────
  const calculatedTotal = formData.quantity * formData.unit_cost;

  // ─── Render ────────────────────────────────────────────────────
  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="show">
      {!showForm && (
        <>
          {/* ─── Header ────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Expenses</h1>
              <p className="mt-1 text-sm text-muted-foreground">Track and manage all your business expenses.</p>
            </div>
            <div className="flex items-center justify-center gap-3 w-full sm:w-auto sm:gap-2 sm:justify-start">
              <Button variant="outline" onClick={() => setShowCategoryManager(true)}>
                <Plus className="size-3.5" />
                Add Category
              </Button>
              <Button variant="gradient" onClick={() => {
                if (guard("creating expenses")) return;
                setShowForm(true);
              }}>
                <Plus className="size-4" />
                Add New Expense
              </Button>
            </div>
          </motion.div>

          {/* ─── Filter Bar ──────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="space-y-3">
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search by item name, supplier..."
              status={{
                value: activeCategoryTab,
                onChange: (v) => v && setActiveCategoryTab(v),
                options: expenseCategoryTabs,
                label: "Category",
              }}
              payment={{
                value: paymentStatusTab,
                onChange: (v) => v && setPaymentStatusTab(v),
                options: paymentStatusTabs,
              }}
              date={{
                value: dateFilter,
                onChange: (v) => {
                  if (v === "custom") setDatePickerOpen(true);
                  else if (v) setDateFilter(v);
                },
                options: dateFilterOptions,
                onCalendarClick: () => setDatePickerOpen(true),
              }}
              activeFilterCount={activeFilterCount}
              onClearFilters={handleClearFilters}
            />

            {/* Custom date range picker modal */}
            <DateRangePickerModal
              open={datePickerOpen}
              onOpenChange={setDatePickerOpen}
              from={dateFrom}
              to={dateTo}
              onApply={(f, t) => {
                setDateFrom(f);
                setDateTo(t);
                setDateFilter("custom");
                setDatePickerOpen(false);
              }}
            />
          </motion.div>
        </>
      )}

      {/* ─── Expense Form / Data Table ────────────────────────── */}
      <motion.div variants={itemVariants}>
        {showForm ? (
          <div className="flex flex-col rounded-xl glass-card">
            {/* Form Header */}
            <div className="flex items-start justify-between px-8 pt-7 pb-5">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  {editExpenseId ? "Edit Expense" : "New Expense"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {editExpenseId ? "Update this expense record." : "Record a new business expense."}
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>

            <Separator />

            {/* Form Content */}
            <div className="flex flex-1 overflow-hidden" style={{ maxHeight: "calc(100vh - 280px)" }}>
              <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="mx-auto max-w-2xl space-y-8">
                  {ordersSettings.enableInventory && (
                    <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/30 px-5 py-3.5">
                      <Checkbox
                        id="add_to_inventory"
                        checked={formData.add_to_inventory}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, add_to_inventory: checked === true }))}
                      />
                      <Label htmlFor="add_to_inventory" className="text-sm font-medium text-foreground cursor-pointer">
                        Add to Inventory
                      </Label>
                    </div>
                  )}

                  {/* ─── Row 1 ────────────────────────────────────── */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-foreground/85">
                        Expense Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={formData.expense_date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, expense_date: e.target.value }))}
                        className="h-9 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-foreground/85">
                        Category <span className="text-destructive">*</span>
                      </Label>
                      <Dropdown
                        value={formData.category}
                        onChange={(v) => v && setFormData((prev) => ({ ...prev, category: v }))}
                        options={categoryDropdownOptions}
                        size="default"
                        className="w-full h-9"
                      />
                    </div>
                  </div>

                  {/* ─── Row 2 ────────────────────────────────────── */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-foreground/85">
                          Item <span className="text-destructive">*</span>
                        </Label>
                        {formData.add_to_inventory && inventoryItems.length > 0 && (
                          <span className="text-[11px] text-muted-foreground">
                            Suggestions from Inventory
                          </span>
                        )}
                      </div>
                      <Input
                        list="inventory-item-suggestions"
                        value={formData.item_name}
                        onChange={(e) => {
                          const val = e.target.value;
                          const matched = inventoryItems.find(
                            (item) => item.name.toLowerCase() === val.trim().toLowerCase()
                          );
                          setFormData((prev) => ({
                            ...prev,
                            item_name: val,
                            inventory_item_id: matched ? matched.id : null,
                            supplier: matched?.supplier && !prev.supplier ? matched.supplier : prev.supplier,
                            unit_cost: matched?.unit_cost && prev.unit_cost === 0 ? matched.unit_cost : prev.unit_cost,
                            category:
                              matched?.category && prev.category === "other"
                                ? matched.category
                                : prev.category,
                          }));
                        }}
                        placeholder="Enter item name"
                        className="h-9 rounded-xl"
                      />
                      {ordersSettings.enableInventory && (
                        <datalist id="inventory-item-suggestions">
                          {inventoryItems.map((item) => (
                            <option key={item.id} value={item.name}>
                              {item.current_stock > 0 ? `Stock: ${item.current_stock}` : "Out of stock"}
                              {item.unit_cost ? ` • Rs. ${item.unit_cost}` : ""}
                            </option>
                          ))}
                        </datalist>
                      )}
                      {formData.add_to_inventory && formData.item_name.trim() && (
                        <div className="pt-1">
                          {(() => {
                            const matched = inventoryItems.find(
                              (i) => i.name.toLowerCase() === formData.item_name.trim().toLowerCase()
                            );
                            if (matched) {
                              return (
                                <p className="text-xs text-success font-medium flex items-center gap-1">
                                  <span>✓</span> Matches inventory item (Current stock: {matched.current_stock}) &mdash; will add {formData.quantity} to stock
                                </p>
                              );
                            }
                            return (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <span>📦</span> Will create new inventory item with {formData.quantity} stock
                              </p>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-foreground/85">Supplier</Label>
                      <Input
                        value={formData.supplier}
                        onChange={(e) => setFormData((prev) => ({ ...prev, supplier: e.target.value }))}
                        placeholder="Supplier name"
                        className="h-9 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* ─── Row 3 ────────────────────────────────────── */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-foreground/85">
                        Quantity <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={formData.quantity}
                        onChange={(e) => setFormData((prev) => ({ ...prev, quantity: Math.max(1, Number(e.target.value) || 1) }))}
                        className="h-9 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-foreground/85">
                        Unit Cost <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={formData.unit_cost || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, unit_cost: Number(e.target.value) || 0 }))}
                        placeholder="0.00"
                        className="h-9 rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-foreground/85">Total Cost</Label>
                      <div className="flex h-9 items-center rounded-xl border border-border/50 bg-muted/40 px-3 text-sm font-semibold text-foreground">
                        {formatCurrency(calculatedTotal)}
                      </div>
                    </div>
                  </div>

                  {/* ─── Row 4 ────────────────────────────────────── */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-foreground/85">Payment Method</Label>
                      <Dropdown
                        value={formData.payment_method}
                        onChange={(v) => v && setFormData((prev) => ({ ...prev, payment_method: v }))}
                        options={localPaymentMethodOptions}
                        size="default"
                        className="w-full h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-foreground/85">Payment Status</Label>
                      <Dropdown
                        value={formData.payment_status}
                        onChange={(v) => v && setFormData((prev) => ({ ...prev, payment_status: v as "pending" | "advanced" | "paid" }))}
                        options={paymentStatusOptions}
                        size="default"
                        className="w-full h-9"
                      />
                    </div>
                  </div>

                  {/* ─── Remarks ──────────────────────────────────── */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-foreground/85">Remarks</Label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
                      placeholder="Optional notes..."
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors focus:border-ring focus:ring-[3px] focus:ring-ring/50 min-h-[80px] resize-y"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Action Bar */}
            <div className="flex items-center justify-between px-8 py-4">
              <Button variant="ghost" onClick={resetForm} className="text-sm">
                Cancel
              </Button>
              <Button variant="gradient" onClick={handleSaveExpense} className="min-w-[130px] text-sm">
                {editExpenseId ? "Update Expense" : "Save Expense"}
              </Button>
            </div>
          </div>
        ) : (
          <DataTable<Expense>
            columns={columns}
            data={paginatedExpenses}
            keyExtractor={(expense) => expense.id}
            loading={loading}
            error={error}
            empty={emptyState}
            sort={{ active: activeSort, onToggle: handleSortToggle }}
            pagination={{
              currentPage,
              totalPages,
              totalItems: filteredExpenses.length,
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
        title="Delete this expense?"
        description="This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmSingleDelete}
      />

      <ConfirmDialog
        open={showBulkDelete}
        onOpenChange={setShowBulkDelete}
        title={selectedIds.size === 1 ? "Delete this expense?" : `Delete ${selectedIds.size} expenses?`}
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
        tableName="expense_categories"
      />
    </motion.div>
  );
}

// ─── Exported Page (wrapped in Suspense for useSearchParams) ───────
export default function ExpensesPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ReceiptText className="size-6 animate-pulse" />
          <p className="text-sm font-medium">Loading expenses…</p>
        </div>
      </div>
    }>
      <ExpensesPageInner />
    </Suspense>
  );
}
