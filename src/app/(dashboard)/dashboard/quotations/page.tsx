"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Eye,
  FileDown,
  FileText,
  Layers3,
  Pencil,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
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
import { EditableStatusBadge } from "@/components/shared/editable-status-badge";
import { QuotationForm, type QuotationFormData } from "@/components/quotations/quotation-form";
import { QuotationPreview } from "@/components/quotations/quotation-preview";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { dateFilterOptions, getDateRange } from "@/lib/date-utils";
import { HoverPopover } from "@/components/shared/hover-popover";
import { generateOrderNumber, initializeOrderSequence } from "@/components/orders/utils";

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

interface QuotationItem {
  product_name: string;
  category: string | null;
  quantity: number;
  unit_price: number;
}

interface Quotation {
  id: string;
  quotation_number: string;
  customer_name: string;
  customer_phone: string | null;
  customer_address: string | null;
  customer_whatsapp: string | null;
  customer_email: string | null;
  expiry_date: string | null;
  expected_delivery_date: string | null;
  subtotal: number;
  discount: number;
  discount_type: string | null;
  delivery_charge: number;
  grand_total: number;
  status: string;
  remarks: string | null;
  converted_order_id: string | null;
  created_at: string;
  items: QuotationItem[];
}

// ─── Constants ─────────────────────────────────────────────────────

const quotationStatusValues = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "converted",
  "expired",
] as const;

const quotationStatusTabs: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  ...quotationStatusValues.map((v) => ({ value: v, label: v })),
];

const quotationStatusOptions: { value: string; label: string }[] = quotationStatusValues.map((v) => ({
  value: v,
  label: v,
}));

// ─── Color Maps ────────────────────────────────────────────────────

const statusColorMap: Record<string, string> = {
  draft: "text-muted-foreground",
  sent: "text-primary",
  accepted: "text-success",
  rejected: "text-destructive",
  converted: "text-info",
  expired: "text-warning",
};

// ─── Utilities ─────────────────────────────────────────────────────

import { formatCurrency } from "@/lib/formatters";

import { formatDate } from "@/lib/formatters";

// ─── Main Page ─────────────────────────────────────────────────────

export default function QuotationsPage() {
  // Data
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI
  const [dateFilter, setDateFilter] = useState<string>("this_month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeSort, setActiveSort] = useState<{ key: string; direction: "asc" | "desc" } | null>({ key: "quotation_number", direction: "asc" });
  const [activeStatusTab, setActiveStatusTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ─── Refetch trigger ──────────────────────────────────────────
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // ─── Data Fetching ─────────────────────────────────────────────
  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        setError(null);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) { window.location.replace("/login?redirect=/dashboard/quotations"); return; }

        const { data: profile } = await supabase.from("profiles").select("business_id").eq("user_id", session.user.id).single();
        const businessId = (profile as { business_id: string | null } | null)?.business_id;
        if (!businessId) throw new Error("No business found for your account.");

        const dateRange = getDateRange(dateFilter, dateFrom, dateTo);
        let q = supabase.from("quotations").select("id, quotation_number, customer_name, customer_phone, customer_address, customer_whatsapp, customer_email, expiry_date, expected_delivery_date, subtotal, discount, discount_type, delivery_charge, grand_total, status, remarks, converted_order_id, created_at").eq("business_id", businessId).order("created_at", { ascending: false }).limit(500);
        if (dateRange) q = q.gte("created_at", dateRange.start.toISOString()).lte("created_at", dateRange.end.toISOString());

        const [quotationsRes, itemsRes] = await Promise.all([
          q,
          supabase.from("quotation_items").select("quotation_id, product_name, category, quantity, unit_price").eq("business_id", businessId).limit(500),
        ]);
        if (quotationsRes.error) throw new Error(quotationsRes.error.message);

        const itemsByQuotation: Record<string, QuotationItem[]> = {};
        for (const item of itemsRes.data || []) {
          const qid = String(item.quotation_id);
          if (!itemsByQuotation[qid]) itemsByQuotation[qid] = [];
          itemsByQuotation[qid].push({ product_name: String(item.product_name), category: item.category ? String(item.category) : null, quantity: Number(item.quantity || 0), unit_price: Number(item.unit_price || 0) });
        }

        setQuotations((quotationsRes.data || []).map((q) => ({
          id: String(q.id), quotation_number: String(q.quotation_number), customer_name: String(q.customer_name || "Walk-in customer"),
          customer_phone: q.customer_phone ? String(q.customer_phone) : null,
          customer_address: q.customer_address ? String(q.customer_address) : null,
          customer_whatsapp: q.customer_whatsapp ? String(q.customer_whatsapp) : null,
          customer_email: q.customer_email ? String(q.customer_email) : null,
          expiry_date: q.expiry_date ? String(q.expiry_date) : null,
          expected_delivery_date: q.expected_delivery_date ? String(q.expected_delivery_date) : null,
          subtotal: Number(q.subtotal || 0), discount: Number(q.discount || 0),
          discount_type: q.discount_type ? String(q.discount_type) : null,
          delivery_charge: Number(q.delivery_charge || 0), grand_total: Number(q.grand_total || 0),
          status: String(q.status || "draft"), remarks: q.remarks ? String(q.remarks) : null,
          converted_order_id: q.converted_order_id ? String(q.converted_order_id) : null,
          created_at: String(q.created_at), items: itemsByQuotation[String(q.id)] || [],
        })));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
        console.error("Quotations fetch error", err);
        setError(msg);
      } finally { setLoading(false); }
    };
    fetchQuotations();
  }, [dateFilter, dateFrom, dateTo, fetchTrigger]);

  // ─── Mutations ─────────────────────────────────────────────────
  const handleStatusChange = useCallback(async (quotationId: string, newStatus: string) => {
    setQuotations((prev) => prev.map((q) => (q.id === quotationId ? { ...q, status: newStatus } : q)));
    try {
      const { error: e } = await createClient().from("quotations").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", quotationId);
      if (e) {
        const { data: r } = await createClient().from("quotations").select("status").eq("id", quotationId).single();
        if (r) setQuotations((prev) => prev.map((q) => (q.id === quotationId ? { ...q, status: String(r.status) } : q)));
      }
    } catch (err) { console.error("Status update error:", err); }
  }, []);

  // ─── Convert to Order ─────────────────────────────────────────
  const handleConvertToOrder = useCallback(async (quotationId: string) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const { data: profile } = await supabase.from("profiles").select("business_id").eq("user_id", session.user.id).single();
      const businessId = (profile as { business_id: string | null } | null)?.business_id;
      if (!businessId) throw new Error("No business found");

      const { data: quotation, error: qError } = await supabase
        .from("quotations")
        .select("*")
        .eq("id", quotationId)
        .single();
      if (qError || !quotation) throw new Error("Quotation not found");

      const { data: items } = await supabase
        .from("quotation_items")
        .select("product_name, category, quantity, unit_price, notes")
        .eq("quotation_id", quotationId);

      await initializeOrderSequence(businessId);
      const orderNumber = generateOrderNumber();

      const { data: newOrder, error: orderError } = await supabase
        .from("orders")
        .insert({
          business_id: businessId,
          order_number: orderNumber,
          customer_name: quotation.customer_name,
          customer_phone: quotation.customer_phone,
          customer_address: quotation.customer_address,
          customer_whatsapp: quotation.customer_whatsapp,
          customer_email: quotation.customer_email,
          subtotal: quotation.subtotal,
          discount: quotation.discount,
          discount_type: quotation.discount_type,
          delivery_charge: quotation.delivery_charge,
          payment_status: "pending",
          status: "new_order",
          created_by: session.user.id,
        })
        .select("id")
        .single();

      if (orderError || !newOrder) throw new Error(orderError?.message || "Failed to create order");
      const orderId = String(newOrder.id);

      if (items && items.length > 0) {
        const { error: itemsError } = await supabase.from("order_items").insert(
          items.map((item: Record<string, any>) => ({
            order_id: orderId,
            business_id: businessId,
            product_name: String(item.product_name || ""),
            category: item.category ? String(item.category) : null,
            unit_price: Number(item.unit_price || 0),
            quantity: Number(item.quantity || 1),
            notes: item.notes ? String(item.notes) : null,
          })),
        );
        if (itemsError) throw new Error(itemsError.message);
      }

      const { error: updateError } = await supabase
        .from("quotations")
        .update({ status: "converted", converted_order_id: orderId, updated_at: new Date().toISOString() })
        .eq("id", quotationId);
      if (updateError) throw new Error(updateError.message);

      setQuotations((prev) =>
        prev.map((q) =>
          q.id === quotationId ? { ...q, status: "converted", converted_order_id: orderId } : q,
        ),
      );

      toast.success("Converted to order", {
        description: `Quotation has been converted to order ${orderNumber}.`,
      });
    } catch (err) {
      console.error("Convert to order error:", err);
      toast.error("Failed to convert", {
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    }
  }, []);

  // ─── In-Page Form State ─────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [previewData, setPreviewData] = useState<QuotationFormData | null>(null);
  const [editData, setEditData] = useState<QuotationFormData | null>(null);
  const [editKey, setEditKey] = useState(0);
  const [editQuotationId, setEditQuotationId] = useState<string | null>(null);
  const [savedQuotationId, setSavedQuotationId] = useState<string | null>(null);

  // ─── Fetch full quotation from DB for editing ─────────────
  const fetchQuotationForForm = useCallback(async (quotationId: string): Promise<QuotationFormData | null> => {
    try {
      const supabase = createClient();
      const { data: quotation, error } = await supabase
        .from("quotations")
        .select("*, quotation_items(*)")
        .eq("id", quotationId)
        .single();

      if (error || !quotation) {
        console.error("Failed to fetch quotation for edit:", error);
        return null;
      }

      const { data: items } = await supabase
        .from("quotation_items")
        .select("product_name, category, quantity, unit_price, notes")
        .eq("quotation_id", quotationId);

      const formData: QuotationFormData = {
        quotation_number: String(quotation.quotation_number),
        created_date: quotation.created_at?.slice(0, 10) || "",
        customer_name: String(quotation.customer_name || ""),
        address: String(quotation.customer_address || ""),
        district: "",
        nearest_city: "",
        whatsapp: String(quotation.customer_whatsapp || ""),
        phone: String(quotation.customer_phone || ""),
        email: String(quotation.customer_email || ""),
        remarks: String(quotation.remarks || ""),
        items: (items || []).map((item: Record<string, any>, i: number) => ({
          id: `preview_item_${i}`,
          product_name: String(item.product_name || ""),
          category: String(item.category || ""),
          quantity: Number(item.quantity || 1),
          unit_price: Number(item.unit_price || 0),
          notes: String(item.notes || ""),
        })),
        expiry_date: quotation.expiry_date?.slice(0, 10) || "",
        subtotal: Number(quotation.subtotal || 0),
        discount: Number(quotation.discount || 0),
        discount_type: String(quotation.discount_type || "fixed") as QuotationFormData["discount_type"],
        delivery_charge: Number(quotation.delivery_charge || 0),
        grand_total: Number(quotation.grand_total || 0),
        status: String(quotation.status || "draft"),
      };

      return formData;
    } catch (err) {
      console.error("fetchQuotationForForm error:", err);
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
  const deleteQuotationsFromDb = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    const supabase = createClient();
    const { error } = await supabase.from("quotations").delete().in("id", ids);
    if (error) throw error;
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
    deleteQuotationsFromDb([id])
      .then(() => {
        setQuotations((prev) => prev.filter((q) => q.id !== id));
        removeDeletingIds([id]);
        toast.success("Quotation deleted", {
          description: "Quotation has been permanently deleted.",
        });
      })
      .catch((err) => {
        console.error("Delete quotation error:", err);
        removeDeletingIds([id]);
        toast.error("Failed to delete quotation", {
          description: err instanceof Error ? err.message : "An unexpected error occurred.",
        });
      });
  }, [deleteTargetId, deleteQuotationsFromDb, addDeletingIds, removeDeletingIds]);

  // ─── Bulk Delete Confirm ───────────────────────────────────────
  const confirmBulkDelete = useCallback(() => {
    const ids = [...selectedIds].filter((id): id is string => typeof id === "string");
    setShowBulkDelete(false);
    if (ids.length === 0) return;
    addDeletingIds(ids);
    setSelectedIds(new Set());
    deleteQuotationsFromDb(ids)
      .then(() => {
        setQuotations((prev) => prev.filter((q) => !ids.includes(q.id)));
        removeDeletingIds(ids);
        toast.success("Quotations deleted", {
          description: `${ids.length} quotation${ids.length > 1 ? "s" : ""} have been permanently deleted.`,
        });
      })
      .catch((err) => {
        console.error("Bulk delete error:", err);
        removeDeletingIds(ids);
        toast.error("Failed to delete quotations", {
          description: err instanceof Error ? err.message : "An unexpected error occurred.",
        });
      });
  }, [selectedIds, deleteQuotationsFromDb, addDeletingIds, removeDeletingIds]);

  // ─── In-Page Form Submit ─────────────────────────────────────
  const handleQuotationSubmit = useCallback(
    async (data: QuotationFormData, preview: boolean) => {
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
        customer_name: data.customer_name,
        customer_phone: data.phone || null,
        customer_address: data.address || null,
        customer_whatsapp: data.whatsapp || null,
        customer_email: data.email || null,
        expiry_date: data.expiry_date || null,
        subtotal: data.subtotal,
        discount: data.discount,
        discount_type: data.discount_type,
        delivery_charge: data.delivery_charge,
        status: data.status || "draft",
        remarks: data.remarks || null,
        updated_at: new Date().toISOString(),
      };

      let quotationId: string;

      if (editQuotationId) {
        // ── UPDATE existing quotation ─────────────────────────
        const { error: updateError } = await supabase
          .from("quotations")
          .update(commonFields)
          .eq("id", editQuotationId);

        if (updateError) {
          throw new Error(`Database error: ${updateError.message || JSON.stringify(updateError)}`);
        }
        quotationId = editQuotationId;

        // Delete old quotation items and re-insert
        await supabase.from("quotation_items").delete().eq("quotation_id", quotationId);
      } else {
        // ── INSERT new quotation ──────────────────────────────
        const { data: quotation, error: quotationError } = await supabase
          .from("quotations")
          .insert({
            ...commonFields,
            business_id: businessId,
            quotation_number: data.quotation_number,
            created_by: session.user.id,
          })
          .select("id")
          .single();

        if (quotationError) {
          const msg = quotationError.message || JSON.stringify(quotationError);
          throw new Error(`Database error: ${msg}`);
        }
        quotationId = String(quotation!.id);
      }

      // Insert / re-insert quotation items
      if (data.items.length > 0) {
        const { error: itemsError } = await supabase.from("quotation_items").insert(
          data.items.map((item) => ({
            quotation_id: quotationId,
            business_id: businessId,
            product_name: item.product_name,
            category: item.category || null,
            unit_price: item.unit_price,
            quantity: item.quantity,
            notes: item.notes || null,
          })),
        );
        if (itemsError) {
          throw new Error(`Items error: ${itemsError.message || JSON.stringify(itemsError)}`);
        }
      }

      // Build item objects for local state
      const quotationItemObjs: QuotationItem[] = data.items.map((item) => ({
        product_name: item.product_name,
        category: item.category || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      if (editQuotationId) {
        // Update existing quotation in local state
        setQuotations((prev) =>
          prev.map((q) =>
            q.id === editQuotationId
              ? {
                  ...q,
                  customer_name: data.customer_name,
                  customer_phone: data.phone || null,
                  customer_address: data.address || null,
                  customer_whatsapp: data.whatsapp || null,
                  customer_email: data.email || null,
                  expiry_date: data.expiry_date || null,
                  subtotal: data.subtotal,
                  discount: data.discount,
                  discount_type: data.discount_type,
                  delivery_charge: data.delivery_charge,
                  grand_total: data.grand_total,
                  status: data.status,
                  remarks: data.remarks || null,
                  items: quotationItemObjs,
                }
              : q,
          ),
        );
      } else {
        // Prepend new quotation to local state
        setQuotations((prev) => [
          {
            id: quotationId,
            quotation_number: data.quotation_number,
            customer_name: data.customer_name,
            customer_phone: data.phone || null,
            customer_address: data.address || null,
            customer_whatsapp: data.whatsapp || null,
            customer_email: data.email || null,
            expiry_date: data.expiry_date || null,
            expected_delivery_date: null,
            subtotal: data.subtotal,
            discount: data.discount,
            discount_type: data.discount_type,
            delivery_charge: data.delivery_charge,
            grand_total: data.grand_total,
            status: data.status,
            remarks: data.remarks || null,
            converted_order_id: null,
            created_at: new Date().toISOString(),
            items: quotationItemObjs,
          },
          ...prev,
        ]);
      }

      if (preview) {
        setSavedQuotationId(quotationId);
        setEditQuotationId(quotationId);
        setPreviewData(data);
        toast.success(editQuotationId ? "Quotation updated!" : "Quotation saved!");
      } else {
        setShowForm(false);
        setPreviewData(null);
        setEditData(null);
        setEditQuotationId(null);
        const verb = editQuotationId ? "updated" : "created";
        toast.success(`Quotation ${verb}`, {
          description: `Quotation ${data.quotation_number} has been ${verb}.`,
        });
        setFetchTrigger((n) => n + 1);
      }
    },
    [editQuotationId],
  );

  // ─── Edit quotation ──────────────────────────────────────────────
  // ─── View quotation (preview) ────────────────────────────────
  const handleViewQuotation = useCallback(async (quotation: Quotation) => {
    fetchQuotationForForm(quotation.id).then((fd) => {
      if (fd) {
        setPreviewData(fd);
        setSavedQuotationId(quotation.id);
      }
    });
  }, [fetchQuotationForForm]);

  // ─── Edit quotation ──────────────────────────────────────────────
  const handleEditQuotation = useCallback(async (quotation: Quotation) => {
    fetchQuotationForForm(quotation.id).then((fd) => {
      if (fd) {
        setEditData(fd);
        setEditKey((k) => k + 1);
        setShowForm(true);
        setEditQuotationId(quotation.id);
      }
    });
  }, [fetchQuotationForForm]);

  // ─── Bulk Handlers ─────────────────────────────────────────────
  const handleBulkStatusChange = useCallback(async (newStatus: string) => {
    const ids = [...selectedIds].filter((id): id is string => typeof id === "string");
    if (ids.length === 0) return;

    setQuotations((prev) => prev.map((q) => (ids.includes(q.id) ? { ...q, status: newStatus } : q)));

    try {
      const { error: e } = await createClient()
        .from("quotations")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .in("id", ids);

      if (e) {
        const { data: reverted } = await createClient().from("quotations").select("id, status").in("id", ids);
        if (reverted) {
          const statusMap = Object.fromEntries(reverted.map((r) => [String(r.id), String(r.status)]));
          setQuotations((prev) => prev.map((q) => (ids.includes(q.id) ? { ...q, status: statusMap[q.id] ?? q.status } : q)));
        }
      }
    } catch (err) { console.error("Bulk status update error:", err); }
  }, [selectedIds]);

  // ─── Sorting ───────────────────────────────────────────────────
  const handleSortToggle = (key: string) => setActiveSort((prev) =>
    prev?.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" }
  );

  // ─── Filtered & Sorted ─────────────────────────────────────────
  const filteredQuotations = useMemo(() => {
    let r = [...quotations];
    if (activeStatusTab !== "all") r = r.filter((q) => q.status === activeStatusTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter((qt) =>
        qt.quotation_number.toLowerCase().includes(q) ||
        qt.customer_name.toLowerCase().includes(q) ||
        qt.items.some((i) => i.product_name.toLowerCase().includes(q))
      );
    }
    if (activeSort) {
      r.sort((a, b) => {
        let cmp = 0;
        if (activeSort.key === "quotation_number") cmp = a.quotation_number.localeCompare(b.quotation_number);
        else if (activeSort.key === "status") cmp = a.status.localeCompare(b.status);
        else if (activeSort.key === "customer_name") cmp = a.customer_name.localeCompare(b.customer_name);
        return activeSort.direction === "asc" ? cmp : -cmp;
      });
    }
    return r;
  }, [quotations, activeStatusTab, searchQuery, activeSort]);

  // ─── Export to XLSX ──────────────────────────────────────────────
  const handleExportXlsx = useCallback(() => {
    if (filteredQuotations.length === 0) return;
    const rows = filteredQuotations.map((q) => ({
      "Quotation No": q.quotation_number,
      Customer: q.customer_name,
      Items: q.items.map((i) => i.product_name).join(", "),
      "Total (Rs.)": q.grand_total,
      Status: q.status,
      Date: formatDate(q.created_at),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Quotations");

    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...rows.map((r) => String((r as Record<string, unknown>)[key] ?? "").length)),
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, `quotations_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [filteredQuotations]);

  // ─── Bulk Select by Status ────────────────────────────────────
  const handleSelectByStatus = useCallback((status: string) => {
    const ids = filteredQuotations
      .filter((q) => q.status === status)
      .map((q) => q.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, [filteredQuotations]);

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
            {quotationStatusOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className="rounded-lg text-sm gap-2 py-1.5"
                onClick={() => handleSelectByStatus(option.value)}
              >
                <span className={cn("inline-flex rounded-full px-2 py-0.5 text-sm font-semibold whitespace-nowrap", statusColorMap[option.value] ?? "text-muted-foreground")}>
                  {option.label}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
            {quotationStatusOptions
              .filter((o) => o.value !== "converted")
              .map((option) => (
              <DropdownMenuItem
                key={option.value}
                className="rounded-lg text-sm gap-2 py-1.5"
                onClick={() => handleBulkStatusChange(option.value)}
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
    [handleSelectByStatus, handleBulkStatusChange, handleExportXlsx],
  );

  const activeFilterCount =
    (activeStatusTab !== "all" ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0) +
    (dateFilter !== "this_month" ? 1 : 0);

  const handleClearFilters = useCallback(() => {
    setActiveStatusTab("all");
    setSearchQuery("");
    setDateFilter("this_month");
    setDateFrom("");
    setDateTo("");
  }, []);

  // ─── Quick action hover colors ──────────────────────────────
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  // ─── Pagination ───────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const totalPages = Math.max(1, Math.ceil(filteredQuotations.length / pageSize));

  const paginatedQuotations = useMemo(
    () => filteredQuotations.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredQuotations, currentPage, pageSize],
  );

  // ─── Row Numbers Map ──────────────────────────────────────────
  const rowNumbers = useMemo(() => {
    const map = new Map<string, number>();
    paginatedQuotations.forEach((quotation, index) => {
      map.set(quotation.id, (currentPage - 1) * pageSize + index + 1);
    });
    return map;
  }, [paginatedQuotations, currentPage, pageSize]);

  useEffect(() => { setCurrentPage(1); }, [filteredQuotations]);

  // ─── Columns ────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<Quotation>[]>(
    () => [
      {
        id: "row_number",
        label: "#",
        className: "w-10 text-center",
        renderCell: (quotation) => (
          <span className="text-sm text-muted-foreground tabular-nums">{rowNumbers.get(quotation.id)}</span>
        ),
      },
      {
        id: "quotation_number",
        label: "Quotation No.",
        sortable: true,
        sortKey: "quotation_number",
        renderCell: (quotation) => (
          <div>
            <p className="text-sm font-semibold text-foreground">{quotation.quotation_number}</p>
            <p className="mt-0.5 text-sm text-muted-foreground/70">{formatDate(quotation.created_at)}</p>
          </div>
        ),
      },
      {
        id: "customer_name",
        label: "Customer",
        sortable: true,
        sortKey: "customer_name",
        hideOnMobile: true,
        className: "min-w-[140px]",
        renderCell: (quotation) => (
          <span className="truncate block text-sm text-foreground">{quotation.customer_name}</span>
        ),
      },
      {
        id: "category",
        label: "Category",
        hideOnMobile: true,
        renderCell: (quotation) => {
          const allCategories = [
            ...new Set(
              quotation.items
                .map((i) => i.category)
                .filter((c): c is string => Boolean(c)),
            ),
          ];
          const first = allCategories[0];
          const extra = allCategories.length - 1;

          if (!first) {
            return (
              <span className="text-sm text-muted-foreground/40">—</span>
            );
          }

          if (extra === 0) {
            return (
              <span className="text-sm font-medium text-foreground/80">
                {first}
              </span>
            );
          }

          return (
            <HoverPopover
              title="All Categories"
              items={allCategories}
            >
              <span className="text-sm font-medium text-foreground/80">
                {first}
              </span>
              <span className="mt-0.5 text-xs text-muted-foreground">
                +{extra} Categor{extra > 1 ? "ies" : "y"}
              </span>
            </HoverPopover>
          );
        },
      },
      {
        id: "items",
        label: "Item",
        className: "min-w-[160px]",
        renderCell: (quotation) => {
          const totalItems = quotation.items.length;
          const firstItem = quotation.items[0];
          const extra = totalItems - 1;

          if (totalItems === 0) {
            return (
              <p className="truncate text-sm text-foreground">—</p>
            );
          }

          if (extra === 0) {
            return (
              <p className="truncate text-sm text-foreground">
                {firstItem!.product_name}
              </p>
            );
          }

          const itemLabels = quotation.items.map(
            (i) => `${i.product_name} (×${i.quantity})`,
          );

          return (
            <HoverPopover
              title="All Items"
              items={itemLabels}
            >
              <p className="truncate text-sm text-foreground">
                {firstItem!.product_name}
              </p>
              <span className="text-xs text-muted-foreground">
                +{extra} More Item{extra > 1 ? "s" : ""}
              </span>
            </HoverPopover>
          );
        },
      },
      {
        id: "quantity",
        label: "Qty",
        hideOnMobile: true,
        renderCell: (quotation) => {
          const totalQty = quotation.items.reduce((sum, i) => sum + i.quantity, 0);
          return (
            <span className="text-sm text-muted-foreground tabular-nums">{totalQty}</span>
          );
        },
      },
      {
        id: "grand_total",
        label: "Total",
        renderCell: (quotation) => (
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {formatCurrency(quotation.grand_total)}
          </span>
        ),
      },
      {
        id: "status",
        label: "Status",
        sortable: true,
        sortKey: "status",
        renderCell: (quotation) => (
          <EditableStatusBadge
            value={quotation.status}
            options={quotationStatusOptions}
            colorMap={statusColorMap}
            onUpdate={(v) => handleStatusChange(quotation.id, v)}
          />
        ),
      },
      {
        id: "actions",
        label: "",
        className: "w-32",
        renderCell: (quotation) => (
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon-xs"
              className="text-muted-foreground/50"
              onMouseEnter={() => setHoveredAction(`${quotation.id}-eye`)}
              onMouseLeave={() => setHoveredAction(null)}
              onClick={(e) => {
                e.stopPropagation();
                handleViewQuotation(quotation);
              }}
            >
              <Eye className="size-3.5" style={{ color: hoveredAction === `${quotation.id}-eye` ? "#0ea5e9" : undefined }} />
            </Button>
            <Button variant="ghost" size="icon-xs"
              className="text-muted-foreground/50"
              onMouseEnter={() => setHoveredAction(`${quotation.id}-pencil`)}
              onMouseLeave={() => setHoveredAction(null)}
              onClick={(e) => {
                e.stopPropagation();
                handleEditQuotation(quotation);
              }}
            >
              <Pencil className="size-3.5" style={{ color: hoveredAction === `${quotation.id}-pencil` ? "#f59e0b" : undefined }} />
            </Button>
            {quotation.status !== "converted" && (
              <Button variant="ghost" size="icon-xs"
                className="text-muted-foreground/50"
                onMouseEnter={() => setHoveredAction(`${quotation.id}-convert`)}
                onMouseLeave={() => setHoveredAction(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleConvertToOrder(quotation.id);
                }}
                title="Convert to order"
              >
                <ShoppingCart className="size-3.5" style={{ color: hoveredAction === `${quotation.id}-convert` ? "#22c55e" : undefined }} />
              </Button>
            )}
            <Button variant="ghost" size="icon-xs"
              className="text-muted-foreground/50"
              onMouseEnter={() => setHoveredAction(`${quotation.id}-trash`)}
              onMouseLeave={() => setHoveredAction(null)}
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTargetId(quotation.id);
              }}
            >
              <Trash2 className="size-3.5" style={{ color: hoveredAction === `${quotation.id}-trash` ? "#ef4444" : undefined }} />
            </Button>
          </div>
        ),
      },
    ],
    [handleStatusChange, handleEditQuotation, handleConvertToOrder, rowNumbers, hoveredAction],
  );

  // ─── Mobile Card Render ────────────────────────────────────────
  const renderMobileCard = useCallback(
    (quotation: Quotation) => {
      const firstItem = quotation.items[0];
      const totalQty = quotation.items.reduce((sum, i) => sum + i.quantity, 0);
      const totalItems = quotation.items.length;
      const extra = totalItems - 1;

      return (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-border/80 bg-muted/50 p-4 shadow-sm"
        >
          {/* ── Section 1: Header ──────────────────────────────── */}
          <div className="flex items-start justify-between gap-4">
            {/* Left: Quotation number + date */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold tracking-tight text-foreground leading-tight">
                  {quotation.quotation_number}
                </p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground/60">{formatDate(quotation.created_at)}</p>
            </div>
            {/* Right: Status badge */}
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <EditableStatusBadge
                value={quotation.status}
                options={quotationStatusOptions}
                colorMap={statusColorMap}
                onUpdate={(v) => handleStatusChange(quotation.id, v)}
              />
            </div>
          </div>

          {/* ── Divider ──────────────────────────────────────── */}
          <div className="mt-4 h-px bg-border/50" />

          {/* ── Section 2: Customer + Items ──────────────────── */}
          <div className="mt-4 space-y-3">
            {/* Customer name - standalone (matching order card style) */}
            <div>
              <p className="text-base font-medium text-foreground leading-snug">{quotation.customer_name}</p>
            </div>

            {/* Items card */}
            {firstItem && (
              <div className="rounded-lg border border-border/40 bg-muted/10 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {firstItem.product_name}
                      {extra > 0 && (
                        <span className="text-muted-foreground/60 font-normal"> +{extra} more</span>
                      )}
                    </p>
                  </div>
                  <span className="text-base font-bold tabular-nums text-primary shrink-0">
                    {formatCurrency(quotation.grand_total)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Qty: <strong>{totalQty}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* ── Section 3: Quick Actions ──────────────────────── */}
          <div className="mt-4 h-px bg-border/50" />
          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-xl text-accent-foreground/70 hover:bg-accent hover:text-accent-foreground transition-colors"
              title="View"
              onClick={(e) => {
                e.stopPropagation();
                handleViewQuotation(quotation);
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
                handleEditQuotation(quotation);
              }}
            >
              <Pencil className="size-4" />
            </button>
            {quotation.status !== "converted" && (
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-xl text-accent-foreground/70 hover:bg-accent hover:text-accent-foreground transition-colors"
                title="Convert to order"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConvertToOrder(quotation.id);
                }}
              >
                <ShoppingCart className="size-4" />
              </button>
            )}
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-xl text-destructive/70 hover:bg-status-danger-bg hover:text-destructive transition-colors"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTargetId(quotation.id);
              }}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </motion.div>
      );
    },
    [
      handleStatusChange,
      handleViewQuotation,
      handleEditQuotation,
      handleConvertToOrder,
      setDeleteTargetId,
    ],
  );

  // ─── Empty State ────────────────────────────────────────────────
  const emptyState = useMemo(() => {
    const isFiltered = quotations.length > 0 && activeStatusTab !== "all";
    const tabLabel = quotationStatusTabs.find((t) => t.value === activeStatusTab)?.label ?? "";
    return {
      icon: FileText,
      title: isFiltered ? `No ${tabLabel.toLowerCase()} quotations` : "No quotations yet",
      description: isFiltered
        ? "There are no quotations with this status yet."
        : "Create your first quotation to send to your customers.",
      action: isFiltered ? undefined : (
        <Button variant="gradient" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="size-3.5" />
          New Quotation
        </Button>
      ),
    };
  }, [quotations.length, activeStatusTab]);

  // ─── Render ────────────────────────────────────────────────────
  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="show">
      {!showForm && !previewData && (
        <>
          {/* ─── Header ────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Quotations</h1>
              <p className="mt-1 text-sm text-muted-foreground">Create and manage quotations for your customers.</p>
            </div>
            <div className="flex items-center justify-center gap-3 w-full sm:w-auto sm:gap-2 sm:justify-start">
              <Button variant="gradient" onClick={() => setShowForm(true)}>
                <Plus className="size-4" />
                Add New Quotation
              </Button>
            </div>
          </motion.div>

          {/* ─── Filter Bar ──────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="space-y-3">
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search by quotation no, name, item..."
              status={{
                value: activeStatusTab,
                onChange: (v) => v && setActiveStatusTab(v),
                options: quotationStatusTabs,
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
        </>
      )}

      {/* ─── Quotation Form / Data Table ────────────────────────── */}
      <motion.div variants={itemVariants}>
        {previewData ? (
          <QuotationPreview
            data={previewData}
            onBack={() => {
              setPreviewData(null);
              setShowForm(false);
              setSavedQuotationId(null);
              setEditQuotationId(null);
            }}
            onEdit={() => {
              setEditData(previewData);
              setEditKey((k) => k + 1);
              setPreviewData(null);
              setShowForm(true);
              if (savedQuotationId) setEditQuotationId(savedQuotationId);
            }}
            onStatusChange={async (newStatus) => {
              setPreviewData((prev) => prev ? { ...prev, status: newStatus } : null);
              if (savedQuotationId) {
                setQuotations((prev) =>
                  prev.map((q) =>
                    q.id === savedQuotationId ? { ...q, status: newStatus } : q,
                  ),
                );
                try {
                  await createClient()
                    .from("quotations")
                    .update({ status: newStatus, updated_at: new Date().toISOString() })
                    .eq("id", savedQuotationId);
                } catch (err) {
                  console.error("Preview status update error:", err);
                }
              }
            }}
            onConvertToOrder={() => {
              if (savedQuotationId) {
                handleConvertToOrder(savedQuotationId).then(() => {
                  setPreviewData((prev) => prev ? { ...prev, status: "converted" } : null);
                });
              }
            }}
            convertedOrderId={
              savedQuotationId
                ? quotations.find((q) => q.id === savedQuotationId)?.converted_order_id
                : null
            }
          />
        ) : showForm ? (
          <QuotationForm
            key={editData ? `edit_${editKey}` : "new"}
            initialData={editData || undefined}
            isEditing={!!editQuotationId}
            onSubmit={handleQuotationSubmit}
            onCancel={() => {
              setShowForm(false);
              setPreviewData(null);
              setEditData(null);
              setEditQuotationId(null);
              setSavedQuotationId(null);
            }}
          />
        ) : (
          <DataTable<Quotation>
            columns={columns}
            data={paginatedQuotations}
            keyExtractor={(quotation) => quotation.id}
            loading={loading}
            error={error}
            empty={emptyState}
            sort={{ active: activeSort, onToggle: handleSortToggle }}
            pagination={{
              currentPage,
              totalPages,
              totalItems: filteredQuotations.length,
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
        title="Delete this quotation?"
        description="This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmSingleDelete}
      />

      <ConfirmDialog
        open={showBulkDelete}
        onOpenChange={setShowBulkDelete}
        title={selectedIds.size === 1 ? "Delete this quotation?" : `Delete ${selectedIds.size} quotations?`}
        description="This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmBulkDelete}
      />
    </motion.div>
  );
}
