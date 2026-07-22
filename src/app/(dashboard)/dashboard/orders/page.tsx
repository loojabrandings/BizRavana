"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Eye,
  FileDown,
  Layers3,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  ShoppingCart,
  FileImage,
  Paperclip,
  Star,
  Trash2,
  Truck,
  Upload,
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
import { OrderForm, type OrderFormData } from "@/components/orders/order-form";
import { OrderPreview } from "@/components/orders/order-preview";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { dateFilterOptions, getDateRange } from "@/lib/date-utils";
import { EditableStatusBadge } from "@/components/shared/editable-status-badge";
import { BulkOrderImportForm } from "@/components/orders/bulk-order-import-form";
import { DispatchDialog, type DispatchMode } from "@/components/orders/dispatch-dialog";
import { TrackShipmentDialog } from "@/components/orders/track-shipment-dialog";
import { EnterWaybillDialog } from "@/components/orders/enter-waybill-dialog";
import { useOrdersSettings } from "@/stores/orders-settings-store";
import { loadCourierConfig, shipWithCourier, type CourierConfig } from "@/lib/delivery/courier-utils";
import { ShippingLabelDialog } from "@/components/orders/shipping-label-dialog";
import { fetchLabelData } from "@/lib/shipping-label/fetch-data";
import {
  generateShippingLabelPdf,
  generateCombinedShippingLabelsPdf,
} from "@/lib/shipping-label/generate-pdf";
import { validateLabelData } from "@/lib/shipping-label/validate";
import type { ShippingLabelData } from "@/lib/shipping-label/types";
import { HoverPopover } from "@/components/shared/hover-popover";
import { useIsMobile } from "@/hooks/use-media-query";
import { useWhatsAppAction } from "@/components/whatsapp/use-whatsapp-action";
import { orderRowToTemplateData } from "@/components/whatsapp/whatsapp-actions";
import { fetchManualWaybills, getWaybillMethod, assignWaybillToOrder, markWaybillAsUsed, type ManualWaybill } from "@/lib/delivery/waybill-utils";

// ─── Storage helpers ──────────────────────────────────────────────

/** Extract file path from a Supabase Storage public URL.
 *  URL format: .../object/public/<bucket>/<filePath>
 *  Returns the <filePath> portion or null if it can't be parsed. */
function imageUrlToPath(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    // parts: [ '', 'storage', 'v1', 'object', 'public', '<bucket>', ...filePath ]
    const bucketIdx = parts.indexOf("order-images");
    if (bucketIdx === -1 || bucketIdx + 1 >= parts.length) return null;
    return parts.slice(bucketIdx + 1).join("/");
  } catch {
    return null;
  }
}

/** Parse the `images` field from the database into a flat array of URLs.
 *  Supports both old format (JSON array of URLs) and new format
 *  (JSON object mapping itemId → URL[]). For the object format,
 *  it extracts all URLs from all items into a single flat array. */
function parseImagesField(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string" && raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
      // New format: {"itemId": ["url1", ...]}
      if (parsed && typeof parsed === "object") {
        return (Object.values(parsed).flat() as string[]).filter(Boolean);
      }
    } catch {
      return [raw];
    }
  }
  return [];
}

/** Parse the `images` field into a per-item image mapping.
 *  New format: {"itemId": ["url1", ...]} → returned as-is
 *  Old format: ["url1", "url2"] → returns empty {} (no per-item mapping) */
function parseImageMap(raw: unknown): Record<string, string[]> {
  if (typeof raw === "string" && raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const map: Record<string, string[]> = {};
        for (const [key, value] of Object.entries(parsed)) {
          if (Array.isArray(value)) map[key] = value.filter(Boolean);
        }
        return map;
      }
    } catch {}
  }
  if (Array.isArray(raw)) return {}; // Old format — no per-item mapping
  return {};
}

/** Delete a list of image URLs from Supabase Storage.
 *  Silently ignores URLs that fail to parse or don't exist. */
async function deleteStorageImages(imageUrls: string[]): Promise<void> {
  const paths = imageUrls.map(imageUrlToPath).filter(Boolean) as string[];
  if (paths.length === 0) return;
  const supabase = createClient();
  await supabase.storage.from("order-images").remove(paths);
}


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

interface OrderItem {
  product_name: string;
  category: string | null;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string | null;
  customer_address: string | null;
  customer_district: string | null;
  customer_city: string | null;
  customer_whatsapp: string | null;
  customer_email: string | null;
  advance_paid: number;
  total: number;
  delivery_charge: number;
  subtotal: number;
  discount: number;
  waybill_id: string | null;
  status: string;
  payment_status: string;
  payment_method: string | null;
  expected_delivery_date: string | null;
  dispatched_date: string | null;
  created_at: string;
  items: OrderItem[];
  /** Image URLs attached to this order */
  images: string[];
}

// ─── Constants ─────────────────────────────────────────────────────



const orderStatusValues = [
  "new_order",
  "ready",
  "packed",
  "dispatched",
  "delivered",
  "cancelled",
  "returned",
] as const;

const orderStatusTabs: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  ...orderStatusValues.map((v) => ({ value: v, label: v })),
];

const paymentStatusValues = [
  "pending",
  "advanced",
  "paid",
] as const;

const paymentStatusTabs: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  ...paymentStatusValues.map((v) => ({ value: v, label: v })),
];

const orderStatusOptions: { value: string; label: string }[] = orderStatusValues.map((v) => ({
  value: v,
  label: v,
}));

const paymentStatusOptions: { value: string; label: string }[] = paymentStatusValues.map((v) => ({
  value: v,
  label: v,
}));

const deliveryStatusValues = ["scheduled"] as const;

const deliveryStatusTabs: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
];

const ACTION_COLORS = ["#0ea5e9", "#f59e0b", "#ef4444"] as const;

// ─── Color Maps ────────────────────────────────────────────────────

const statusColorMap: Record<string, string> = {
  new_order: "text-primary",
  ready: "text-warning",
  packed: "text-orange-500",
  dispatched: "text-success",
  delivered: "text-muted-foreground",
  cancelled: "text-destructive",
  returned: "text-pink-500",
};

const paymentColorMap: Record<string, string> = {
  pending: "text-warning",
  advanced: "text-primary",
  paid: "text-success",
};



// ─── Utilities ─────────────────────────────────────────────────────

import { formatCurrency } from "@/lib/formatters";

import { formatDate } from "@/lib/formatters";





// ─── Sub-Components ────────────────────────────────────────────────

/** Badge shown next to a customer name when they have 2+ orders (by WhatsApp).
 *  Gold star icon + order count using semantic tokens for theme support. */
function RepeatBadge({
  order,
  counts,
}: {
  order: Order;
  counts: Map<string, number>;
}) {
  if (!order.customer_whatsapp) return null;
  const normalized = order.customer_whatsapp.replace(/[\s-]/g, "");
  const count = counts.get(normalized) || 0;
  if (count < 2) return null;
  return (
    <span
      className="inline-flex h-[22px] items-center gap-1 rounded-full bg-warning/10 px-2 text-xs font-medium leading-none text-warning whitespace-nowrap"
      title={`${count} orders`}
    >
      <Star className="size-3 shrink-0 fill-warning text-warning" />
      {count}
    </span>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────

function OrdersPageInner() {
  // ─── Read query params for pre-applied filters ───────────────
  const searchParams = useSearchParams();

  // Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // UI
  const [dateFilter, setDateFilter] = useState<string>("this_month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeSort, setActiveSort] = useState<{ key: string; direction: "asc" | "desc" } | null>({ key: "order_number", direction: "desc" });
  const [activeStatusTab, setActiveStatusTab] = useState("all");
  const [paymentStatusTab, setPaymentStatusTab] = useState("all");
  const [multiPaymentFilter, setMultiPaymentFilter] = useState<string[] | null>(null);
  const [activeDeliveryTab, setActiveDeliveryTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ─── Derived state: whether there are any scheduled deliveries ───
  const hasScheduledDeliveries = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return orders.some(
      (o) =>
        o.expected_delivery_date &&
        o.expected_delivery_date >= today &&
        ["new_order", "ready", "packed"].includes(o.status),
    );
  }, [orders]);

  // ─── Apply query params as initial filters ──────────────────
  useEffect(() => {
    const status = searchParams.get("status");
    const payment = searchParams.get("payment_status");
    const delivery = searchParams.get("delivery_status");
    const action = searchParams.get("action");
    const search = searchParams.get("search");

    if (action === "new") {
      setShowForm(true);
    }
    if (status && orderStatusValues.includes(status as any)) {
      setActiveStatusTab(status);
    }
    if (payment) {
      const values = payment.split(",").filter((v) =>
        paymentStatusValues.includes(v as any),
      );
      if (values.length > 0) {
        setMultiPaymentFilter(values);
        setPaymentStatusTab(values[0]);
      }
    }
    if (delivery && deliveryStatusValues.includes(delivery as any)) {
      setActiveDeliveryTab(delivery);
    }
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  // ─── Refetch trigger ──────────────────────────────────────────
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // ─── Data Fetching ─────────────────────────────────────────────
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) { window.location.replace("/login?redirect=/dashboard/orders"); return; }

        const { data: profile } = await supabase.from("profiles").select("business_id").eq("user_id", session.user.id).single();
        const businessId = (profile as { business_id: string | null } | null)?.business_id;
        setBusinessId(businessId ?? null);
        if (!businessId) throw new Error("No business found for your account.");

        const dateRange = getDateRange(dateFilter, dateFrom, dateTo);
        let q = supabase.from("orders").select("id, order_number, customer_name, customer_phone, customer_address, customer_district, customer_city, customer_whatsapp, customer_email, advance_paid, total, delivery_charge, subtotal, discount, waybill_id, status, payment_status, payment_method, expected_delivery_date, dispatched_date, created_at, images").eq("business_id", businessId).order("order_number", { ascending: false }).limit(500);
        if (dateRange) q = q.gte("created_at", dateRange.start.toISOString()).lte("created_at", dateRange.end.toISOString());

        const [ordersRes, itemsRes] = await Promise.all([
          q,
          supabase.from("order_items").select("order_id, product_name, category, quantity, unit_price").eq("business_id", businessId).limit(500),
        ]);
        if (ordersRes.error) throw new Error(ordersRes.error.message);

        const itemsByOrder: Record<string, OrderItem[]> = {};
        for (const item of itemsRes.data || []) {
          const oid = String(item.order_id);
          if (!itemsByOrder[oid]) itemsByOrder[oid] = [];
          itemsByOrder[oid].push({ product_name: String(item.product_name), category: item.category ? String(item.category) : null, quantity: Number(item.quantity || 0), unit_price: Number(item.unit_price || 0) });
        }

        setOrders((ordersRes.data || []).map((o) => {
          const parsedImages = parseImagesField((o as any).images);

          return {
            id: String(o.id), order_number: String(o.order_number), customer_name: String(o.customer_name || "Walk-in customer"),
            customer_phone: o.customer_phone ? String(o.customer_phone) : null,
            customer_address: o.customer_address ? String(o.customer_address) : null,
            customer_district: o.customer_district ? String(o.customer_district) : null,
            customer_city: o.customer_city ? String(o.customer_city) : null,
            customer_whatsapp: o.customer_whatsapp ? String(o.customer_whatsapp) : null,
            customer_email: o.customer_email ? String(o.customer_email) : null,
            advance_paid: Number(o.advance_paid || 0),
            total: Number(o.total || 0), delivery_charge: Number(o.delivery_charge || 0), subtotal: Number(o.subtotal || 0), discount: Number(o.discount || 0),
            waybill_id: o.waybill_id ? String(o.waybill_id) : null, status: String(o.status || "new_order"), payment_status: String(o.payment_status || "pending"),
            payment_method: o.payment_method ? String(o.payment_method) : null, expected_delivery_date: o.expected_delivery_date ? String(o.expected_delivery_date) : null,
            dispatched_date: o.dispatched_date ? String(o.dispatched_date) : null,
            created_at: String(o.created_at), items: itemsByOrder[String(o.id)] || [],
            images: parsedImages,
          };
        }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
        console.error("Orders fetch error", err);
        setError(msg);
      } finally { setLoading(false); }
    };
    fetchOrders();
  }, [dateFilter, dateFrom, dateTo, fetchTrigger]);

  // ─── Dispatch Dialog State ───────────────────────────────
  const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false);
  const [pendingDispatchOrderId, setPendingDispatchOrderId] = useState<string | null>(null);
  const [pendingDispatchNewStatus, setPendingDispatchNewStatus] = useState<string | null>(null);
  const [courierConfig, setCourierConfig] = useState<CourierConfig | null>(null);
  const [waybillDialogOpen, setWaybillDialogOpen] = useState(false);
  const [pendingWaybillOrderId, setPendingWaybillOrderId] = useState<string | null>(null);
  const [pendingWaybillNewStatus, setPendingWaybillNewStatus] = useState<string | null>(null);
  const ordersSettings = useOrdersSettings();
  const [trackingWaybill, setTrackingWaybill] = useState<string | null>(null);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);

  // ─── Shipping Label Dialog State ──────────────────────
  const [shippingLabelDialogOpen, setShippingLabelDialogOpen] = useState(false);
  const [shippingLabelData, setShippingLabelData] = useState<ShippingLabelData | null>(null);
  const [shippingLabelDataUrl, setShippingLabelDataUrl] = useState<string | null>(null);

  // ─── Mobile detection ────────────────────────────────────────
  const isMobile = useIsMobile();

  // ─── WhatsApp template action hook ──────────────────────
  const { handleAction: handleWhatsAppAction, renderDialogs: renderWhatsAppDialogs } = useWhatsAppAction();

  // ─── Handle WhatsApp click from table row ───────────────
  const handleWhatsAppClick = useCallback((order: Order) => {
    const phone = order.customer_whatsapp || order.customer_phone;
    if (!phone) return;
    const templateData = orderRowToTemplateData(order);
    handleWhatsAppAction("order_table_whatsapp", templateData, phone);
  }, [handleWhatsAppAction]);

  // ─── Handle Print Shipping Label from table row ─────────
  const handleRowPrintLabel = useCallback(async (orderId: string, waybillId: string) => {
    try {
      const { data: fetchedData, error } = await fetchLabelData(orderId);
      if (fetchedData && !error) {
        fetchedData.waybillId = waybillId;
        // Validate data before generating
        const { valid, missingFields } = validateLabelData(fetchedData);
        if (!valid) {
          toast.error("Cannot generate shipping label", {
            description: `Missing: ${missingFields.join(", ")}`,
          });
          return;
        }
        setShippingLabelData(fetchedData);
        const result = await generateShippingLabelPdf(fetchedData);
        setShippingLabelDataUrl(result.dataUrl);
        setShippingLabelDialogOpen(true);
      } else {
        toast.error("Failed to load label data", {
          description: error || "Unable to fetch order or business info.",
        });
      }
    } catch (err) {
      console.error("Print label error:", err);
      toast.error("Failed to generate shipping label");
    }
  }, []);

  // ─── Available Manual Waybills State ────────────────────
  const [availableWaybills, setAvailableWaybills] = useState<ManualWaybill[]>([]);
  const [waybillMethod, setWaybillMethodState] = useState<"manual" | "auto">("manual");

  // ─── Load waybill method on mount ────────────────────────
  useEffect(() => {
    if (businessId) {
      getWaybillMethod(businessId).then(setWaybillMethodState);
    }
  }, [businessId]);

  // ─── Fetch available manual waybills when dialog opens ───
  useEffect(() => {
    if (waybillDialogOpen && businessId && waybillMethod === "manual") {
      fetchManualWaybills(businessId, { status: "available", limit: 50 })
        .then(({ waybills }) => setAvailableWaybills(waybills))
        .catch(() => setAvailableWaybills([]));
    }
  }, [waybillDialogOpen, businessId, waybillMethod]);

  // ─── Load courier config on mount ────────────────────────
  useEffect(() => {
    loadCourierConfig().then((cfg) => setCourierConfig(cfg));
  }, []);



  // ─── Mutations ─────────────────────────────────────────────────
const handleStatusChange = useCallback(async (orderId: string, newStatus: string) => {
  // Check waybill method from business_settings
  let effectiveMethod = waybillMethod;
  if (!businessId) {
    const { waybillMode } = useOrdersSettings.getState();
    effectiveMethod = waybillMode;
  }

  // Manual waybill mode + packing: prompt for waybill entry
  if (effectiveMethod === "manual" && newStatus === "packed") {
    const currentOrder = orders.find((o) => o.id === orderId);
    if (currentOrder?.waybill_id) {
      // Already has a waybill — skip dialog and just update status
      await applyStatusChange(orderId, newStatus);
      return;
    }
    setPendingWaybillOrderId(orderId);
    setPendingWaybillNewStatus(newStatus);
    setWaybillDialogOpen(true);
    return;
  }

  // Changing to dispatched: always show the dispatch dialog
  // (Dispatch dialog handles "dispatch locally" vs "dispatch to courier" internally)
  if (newStatus === "dispatched") {
    setPendingDispatchOrderId(orderId);
    setPendingDispatchNewStatus(newStatus);
    setDispatchDialogOpen(true);
    return;
  }

  await applyStatusChange(orderId, newStatus);
}, [orders, waybillMethod, businessId]);

  const applyStatusChange = useCallback(async (orderId: string, newStatus: string) => {
    // Optimistic update
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));

    try {
      const { error: e } = await createClient().from("orders").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", orderId);
      if (e) {
        // Revert on error
        const { data: r } = await createClient().from("orders").select("status").eq("id", orderId).single();
        if (r) setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: String(r.status) } : o)));
        return;
      }

      // When an order with a waybill reaches "dispatched", mark the manual waybill as used
      if (newStatus === "dispatched") {
        const updatedOrder = orders.find((o) => o.id === orderId);
        if (updatedOrder?.waybill_id) {
          markWaybillAsUsed(updatedOrder.waybill_id).catch((err) =>
            console.warn("Failed to mark waybill as used:", err),
          );
        }
      }
    } catch (err) { console.error("Status update error:", err); }
  }, [orders]);

  // ─── Dispatch Handler ────────────────────────────────────────
  const handleDispatch = useCallback(async (mode: DispatchMode): Promise<boolean> => {
    const orderId = pendingDispatchOrderId;
    const newStatus = pendingDispatchNewStatus || "dispatched";
    if (!orderId) return false;

    try {
      if (mode === "local") {
        // Just update the status (applyStatusChange handles marking waybill as used)
        await applyStatusChange(orderId, newStatus);
        toast.success("Order dispatched locally");
        return true;
      }

      // mode === "courier" — ship via courier
      if (!courierConfig?.provider) {
        toast.error("No courier configured");
        return false;
      }

      // Find the order in local state
      const order = orders.find((o) => o.id === orderId);
      if (!order) {
        toast.error("Order not found");
        return false;
      }

      // Validate district and city are set before sending to courier
      if (!order.customer_district?.trim() || !order.customer_city?.trim()) {
        toast.error("District and city required", {
          description: "Please set the customer's district and nearest city before dispatching via courier.",
        });
        return false;
      }

      // Send to courier
      const { waybill } = await shipWithCourier(
        {
          id: order.id,
          order_number: order.order_number,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_address: order.customer_address,
          customer_city: order.customer_city,
          customer_district: order.customer_district,
          total: order.total,
          advance_paid: order.advance_paid,
          items: order.items.map((i) => ({
            product_name: i.product_name,
            quantity: i.quantity,
            unit_price: i.unit_price,
          })),
        },
        courierConfig,
      );

      // Update order status and waybill in DB
      const supabase = createClient();
      await supabase
        .from("orders")
        .update({
          status: newStatus,
          waybill_id: waybill,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus, waybill_id: waybill } : o,
        ),
      );

      // Mark manual waybill as used if the courier-generated waybill exists in our manual list
      // (This gracefully does nothing if the waybill is not from our manual_waybills table)
      markWaybillAsUsed(waybill).catch((err) =>
        console.warn("Failed to mark waybill as used:", err),
      );

      // Generate shipping label for courier dispatch
      try {
        const { data: labelData, error: fetchError } =
          await fetchLabelData(orderId);
        if (labelData && !fetchError) {
          // Set label data first so dialog can auto-retry if PDF gen fails
          setShippingLabelData(labelData);
          const result = await generateShippingLabelPdf(labelData);
          setShippingLabelDataUrl(result.dataUrl);
        }
      } catch (labelErr) {
        // Don't block dispatch success — label generation is secondary
        console.error("Failed to generate shipping label:", labelErr);
      }

      // Open shipping label dialog
      setShippingLabelDialogOpen(true);

      toast.success(
        `Order dispatched via ${courierConfig.providerLabel || "Courier"}`,
        {
          description: `Waybill: ${waybill}`,
        },
      );
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Dispatch failed";
      toast.error("Dispatch failed", { description: msg });
      return false;
    }
  }, [pendingDispatchOrderId, pendingDispatchNewStatus, courierConfig, orders, applyStatusChange]);

  // ─── Waybill Entry Handler (manual mode) ──────────────────
  const handleWaybillConfirm = useCallback(async (waybillId: string): Promise<boolean> => {
    const orderId = pendingWaybillOrderId;
    const newStatus = pendingWaybillNewStatus;
    if (!orderId || !newStatus) return false;

    try {
      const supabase = createClient();
      await supabase
        .from("orders")
        .update({
          status: newStatus,
          waybill_id: waybillId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus, waybill_id: waybillId } : o,
        ),
      );

      // If manual waybill mode, mark the waybill as used in manual_waybills
      if (waybillMethod === "manual") {
        const assignResult = await assignWaybillToOrder(waybillId, orderId);
        if (!assignResult.success) {
          console.warn("Failed to assign waybill to order:", assignResult.error);
        }
      }

      toast.success(`Order marked as ${newStatus}`, {
        description: `Waybill: ${waybillId}`,
      });

      setPendingWaybillOrderId(null);
      setPendingWaybillNewStatus(null);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update order";
      toast.error("Failed to update order", { description: msg });
      return false;
    }
  }, [pendingWaybillOrderId, pendingWaybillNewStatus, waybillMethod]);

  const handlePaymentChange = useCallback(async (orderId: string, newPayment: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, payment_status: newPayment } : o)));
    try {
      const { error: e } = await createClient().from("orders").update({ payment_status: newPayment, updated_at: new Date().toISOString() }).eq("id", orderId);
      if (e) {
        const { data: r } = await createClient().from("orders").select("payment_status").eq("id", orderId).single();
        if (r) setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, payment_status: String(r.payment_status) } : o)));
      }
    } catch (err) { console.error("Payment update error:", err); }
  }, []);

  // ─── In-Page Form State ─────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [previewData, setPreviewData] = useState<OrderFormData | null>(null);
  const [editData, setEditData] = useState<OrderFormData | null>(null);
  const [editKey, setEditKey] = useState(0);
  const [editOrderId, setEditOrderId] = useState<string | null>(null);
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null);

  // ─── Fetch full order from DB for preview/edit ────────────
  const fetchOrderForPreview = useCallback(async (orderId: string): Promise<OrderFormData | null> => {
    try {
      const supabase = createClient();
      const { data: order, error } = await supabase
        .from("orders")
        .select("*, order_items(*) ")
        .eq("id", orderId)
        .single();

      if (error || !order) {
        console.error("Failed to fetch order for preview:", error);
        return null;
      }

      // Fetch order items separately since Supabase may return them nested
      const { data: items } = await supabase
        .from("order_items")
        .select("product_name, category, quantity, unit_price, notes")
        .eq("order_id", orderId)
        .order("sort_order");

      const rawImages = (order as any).images;
      const parsedImages = parseImagesField(rawImages);
      const parsedMap = parseImageMap(rawImages);

      // Build item list with stable IDs
      const orderItems = (items || []).map((item: Record<string, any>, i: number) => ({
        id: `preview_item_${i}`,
        product_name: String(item.product_name || ""),
        category: String(item.category || ""),
        quantity: Number(item.quantity || 1),
        unit_price: Number(item.unit_price || 0),
        notes: String(item.notes || ""),
      }));

      // Build itemImagesMap — stored map uses index-based keys ("item_0", "item_1"),
      // so remap to the preview item IDs
      let itemImagesMap: Record<string, string[]> = {};
      if (Object.keys(parsedMap).length > 0) {
        orderItems.forEach((item: { id: string }, i: number) => {
          const storedKey = `item_${i}`;
          if (parsedMap[storedKey]) {
            itemImagesMap[item.id] = parsedMap[storedKey];
          }
        });
      }
      // Fallback for old format (flat array): distribute one image per item (no round-robin)
      // Only assign images up to the number of available images — avoids duplicating
      // the same image onto every item when there's only one image attached.
      if (Object.keys(itemImagesMap).length === 0 && parsedImages.length > 0 && orderItems.length > 0) {
        orderItems.forEach((item: { id: string }, i: number) => {
          if (i < parsedImages.length && parsedImages[i]) {
            itemImagesMap[item.id] = [parsedImages[i]];
          }
        });
      }

      const formData: OrderFormData = {
        id: String(order.id),
        order_number: String(order.order_number),
        created_date: order.created_at?.slice(0, 10) || "",
        dispatched_date: order.dispatched_date?.slice(0, 10) || "",
        customer_name: String(order.customer_name || ""),
        address: String(order.customer_address || ""),
        district: String(order.customer_district || ""),
        nearest_city: String(order.customer_city || ""),
        whatsapp: String(order.customer_whatsapp || ""),
        phone: String(order.customer_phone || ""),
        email: String(order.customer_email || ""),
        remarks: String(order.remarks || ""),
        images: parsedImages,
        itemImagesMap,
        items: orderItems,
        expected_delivery_date: order.expected_delivery_date?.slice(0, 10) || "",
        status: String(order.status || "new_order"),
        payment_status: String(order.payment_status || "pending"),
        order_source: String(order.order_source || "ad"),
        subtotal: Number(order.subtotal || 0),
        discount: Number(order.discount || 0),
        discount_type: String(order.discount_type || "fixed") as OrderFormData["discount_type"],
        waybill_id: order.waybill_id ? String(order.waybill_id) : "",
        delivery_charge: Number(order.delivery_charge || 0),
        advance_paid: Number(order.advance_paid || 0),
        payment_method: (String(order.payment_method || "cash") as OrderFormData["payment_method"]),
        total: Number(order.total || 0),
        balance_remaining: Number(order.balance_remaining ?? Math.max(0, Number(order.total || 0) - Number(order.advance_paid || 0))),
      };

      return formData;
    } catch (err) {
      console.error("fetchOrderForPreview error:", err);
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
  const deleteOrdersFromDb = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return;
    const supabase = createClient();

    // First, fetch the orders' images so we can delete them from storage
    const { data: ordersToDelete } = await supabase
      .from("orders")
      .select("images")
      .in("id", ids);

    if (ordersToDelete) {
      const allImageUrls: string[] = [];
      for (const o of ordersToDelete) {
        const urls = parseImagesField((o as any).images);
        allImageUrls.push(...urls);
      }
      // Delete images from storage (fire-and-forget, best effort)
      deleteStorageImages(allImageUrls).catch(console.error);
    }

    // Delete from orders — order_items are auto-removed via ON DELETE CASCADE
    const { error } = await supabase.from("orders").delete().in("id", ids);
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

    // Show progress bar on the row
    addDeletingIds([id]);

    deleteOrdersFromDb([id])
      .then(() => {
        // Success: remove the row
        setOrders((prev) => prev.filter((o) => o.id !== id));
        removeDeletingIds([id]);
        toast.success("Order deleted", {
          description: `Order has been permanently deleted.`,
        });
      })
      .catch((err) => {
        // Error: restore the row
        console.error("Delete order error:", err);
        removeDeletingIds([id]);
        toast.error("Failed to delete order", {
          description: err instanceof Error ? err.message : "An unexpected error occurred.",
        });
      });
  }, [deleteTargetId, deleteOrdersFromDb, addDeletingIds, removeDeletingIds]);

  // ─── Bulk Delete Confirm ───────────────────────────────────────
  const confirmBulkDelete = useCallback(() => {
    const ids = [...selectedIds].filter((id): id is string => typeof id === "string");
    setShowBulkDelete(false);
    if (ids.length === 0) return;

    // Show progress bars on the rows
    addDeletingIds(ids);
    setSelectedIds(new Set());

    deleteOrdersFromDb(ids)
      .then(() => {
        // Success: remove the rows
        setOrders((prev) => prev.filter((o) => !ids.includes(o.id)));
        removeDeletingIds(ids);
        toast.success("Orders deleted", {
          description: `${ids.length} order${ids.length > 1 ? "s" : ""} have been permanently deleted.`,
        });
      })
      .catch((err) => {
        // Error: restore the rows
        console.error("Bulk delete error:", err);
        removeDeletingIds(ids);
        toast.error("Failed to delete orders", {
          description: err instanceof Error ? err.message : "An unexpected error occurred.",
        });
      });
  }, [selectedIds, deleteOrdersFromDb, addDeletingIds, removeDeletingIds]);

  // ─── In-Page Form Submit ─────────────────────────────────────
  const handleOrderSubmit = useCallback(
    async (data: OrderFormData, preview: boolean) => {
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
        order_number: data.order_number,
        customer_name: data.customer_name,
        customer_phone: data.phone || null,
        customer_address: data.address || null,
        customer_district: data.district || null,
        customer_city: data.nearest_city || null,
        customer_whatsapp: data.whatsapp || null,
        customer_email: data.email || null,
        expected_delivery_date: data.expected_delivery_date || null,
        subtotal: data.subtotal,
        discount: data.discount,
        discount_type: data.discount_type,
        delivery_charge: data.delivery_charge,
        advance_paid: data.advance_paid,
        payment_method: data.payment_method,
        payment_status: data.payment_status || (data.advance_paid > 0 ? "advanced" : "pending"),
        status: data.status || "new_order",
        order_source: data.order_source || "ad",
        remarks: data.remarks || null,
        // Store per-item image mapping as JSON object, fall back to flat array for backward compat
        images: data.itemImagesMap && Object.keys(data.itemImagesMap).length > 0
          ? JSON.stringify(data.itemImagesMap)
          : (data.images && data.images.length > 0 ? data.images : null),
        updated_at: new Date().toISOString(),
      };

      let orderId: string;

      if (editOrderId) {
        // ── UPDATE existing order ─────────────────────────────
        // Before updating, figure out which images were removed so we can delete them from storage
        const oldOrder = orders.find((o) => o.id === editOrderId);
        if (oldOrder?.images && oldOrder.images.length > 0) {
          const newImages = data.images || [];
          const removedImages = oldOrder.images.filter(
            (url) => !newImages.includes(url),
          );
          if (removedImages.length > 0) {
            deleteStorageImages(removedImages).catch(console.error);
          }
        }

        const { error: updateError } = await supabase
          .from("orders")
          .update(commonFields)
          .eq("id", editOrderId);

        if (updateError) {
          throw new Error(`Database error: ${updateError.message || JSON.stringify(updateError)}`);
        }
        orderId = editOrderId;

        // Delete old order items and re-insert
        await supabase.from("order_items").delete().eq("order_id", orderId);
      } else {
        // ── INSERT new order ──────────────────────────────────
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            ...commonFields,
            business_id: businessId,
            created_by: session.user.id,
          })
          .select("id")
          .single();

        if (orderError) {
          const msg = orderError.message || JSON.stringify(orderError);
          throw new Error(`Database error: ${msg}`);
        }
        orderId = String(order!.id);
      }

      // Insert / re-insert order items
      if (data.items.length > 0) {
        const { error: itemsError } = await supabase.from("order_items").insert(
          data.items.map((item, i) => ({
            order_id: orderId,
            business_id: businessId,
            product_name: item.product_name,
            category: item.category || null,
            unit_price: item.unit_price,
            quantity: item.quantity,
            notes: item.notes || null,
            sort_order: i,
          })),
        );
        if (itemsError) {
          throw new Error(`Items error: ${itemsError.message || JSON.stringify(itemsError)}`);
        }
      }

      // Handle images (would need Supabase Storage)
      // For now, images are stored locally as File[] - storage integration can be added later

      if (preview) {
        // ── Sync local orders array so table shows current data when preview closes ──
        const orderItemObjs: OrderItem[] = data.items.map((item) => ({
          product_name: item.product_name,
          category: item.category || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }));

        if (editOrderId) {
          // Update existing order in local state
          setOrders((prev) =>
            prev.map((o) =>
              o.id === editOrderId
                ? {
                    ...o,
                    customer_name: data.customer_name,
                    customer_phone: data.phone || null,
                    customer_address: data.address || null,
                    customer_district: data.district || null,
                    customer_city: data.nearest_city || null,
                    customer_whatsapp: data.whatsapp || null,
                    customer_email: data.email || null,
                    advance_paid: data.advance_paid,
                    total: data.total,
                    delivery_charge: data.delivery_charge,
                    subtotal: data.subtotal,
                    discount: data.discount,
                    status: data.status,
                    payment_status: data.payment_status,
                    payment_method: data.payment_method,
                    expected_delivery_date: data.expected_delivery_date || null,
                    images: data.images || [],
                    items: orderItemObjs,
                  }
                : o,
            ),
          );
        } else {
          // Prepend new order to local state
          setOrders((prev) => [
            {
              id: orderId,
              order_number: data.order_number,
              customer_name: data.customer_name,
              customer_phone: data.phone || null,
              customer_address: data.address || null,
              customer_district: data.district || null,
              customer_city: data.nearest_city || null,
              customer_whatsapp: data.whatsapp || null,
              customer_email: data.email || null,
              advance_paid: data.advance_paid,
              total: data.total,
              delivery_charge: data.delivery_charge,
              subtotal: data.subtotal,
              discount: data.discount,
              waybill_id: null,
              status: data.status,
              payment_status: data.payment_status,
              payment_method: data.payment_method,
              expected_delivery_date: data.expected_delivery_date || null,
              dispatched_date: null,
              created_at: new Date().toISOString(),
              images: data.images || [],
              items: orderItemObjs,
            },
            ...prev,
          ]);
        }

        // Ensure id is set for preview (important for reprint lookup)
        data.id = orderId;
        setSavedOrderId(orderId);
        setEditOrderId(orderId);
        setPreviewData(data);
        if (editOrderId) {
          toast.success("Order updated! Showing preview.");
        } else {
          toast.success("Order saved! Showing preview.");
        }
      } else {
        setShowForm(false);
        setPreviewData(null);
        setEditData(null);
        setEditOrderId(null);
        const verb = editOrderId ? "updated" : "created";
        toast.success(`Order ${verb}`, {
          description: `Order ${data.order_number} has been ${verb}.`,
        });
        setFetchTrigger((n) => n + 1);
      }
    },
    [editOrderId],
  );

  // ─── Bulk Handlers ─────────────────────────────────────────────
  const handleBulkStatusChange = useCallback(
    async (newStatus: string) => {
      const ids = [...selectedIds].filter((id): id is string => typeof id === "string");
      if (ids.length === 0) return;

      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (ids.includes(o.id) ? { ...o, status: newStatus } : o)),
      );

      try {
        const { error: e } = await createClient()
          .from("orders")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .in("id", ids);

        if (e) {
          // Revert on error - refetch the affected rows
          const { data: reverted } = await createClient()
            .from("orders")
            .select("id, status")
            .in("id", ids);
          if (reverted) {
            const statusMap = Object.fromEntries(
              reverted.map((r) => [String(r.id), String(r.status)]),
            );
            setOrders((prev) =>
              prev.map((o) =>
                ids.includes(o.id)
                  ? { ...o, status: statusMap[o.id] ?? o.status }
                  : o,
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

  const handleBulkPaymentChange = useCallback(
    async (newPayment: string) => {
      const ids = [...selectedIds].filter((id): id is string => typeof id === "string");
      if (ids.length === 0) return;

      // Optimistic update
      setOrders((prev) =>
        prev.map((o) =>
          ids.includes(o.id) ? { ...o, payment_status: newPayment } : o,
        ),
      );

      try {
        const { error: e } = await createClient()
          .from("orders")
          .update({ payment_status: newPayment, updated_at: new Date().toISOString() })
          .in("id", ids);

        if (e) {
          // Revert on error
          const { data: reverted } = await createClient()
            .from("orders")
            .select("id, payment_status")
            .in("id", ids);
          if (reverted) {
            const statusMap = Object.fromEntries(
              reverted.map((r) => [String(r.id), String(r.payment_status)]),
            );
            setOrders((prev) =>
              prev.map((o) =>
                ids.includes(o.id)
                  ? { ...o, payment_status: statusMap[o.id] ?? o.payment_status }
                  : o,
              ),
            );
          }
        }
      } catch (err) {
        console.error("Bulk payment update error:", err);
      }
    },
    [selectedIds],
  );

  // ─── Bulk Print Shipping Labels ──────────────────────────
  const handleBulkPrintLabels = useCallback(async () => {
    const ids = [...selectedIds].filter((id): id is string => typeof id === "string");
    if (ids.length === 0) return;

    // Find orders with waybills among selected
    const ordersToPrint = orders.filter(
      (o) => ids.includes(o.id) && o.waybill_id,
    );

    if (ordersToPrint.length === 0) {
      toast.error("No selected orders have a waybill assigned");
      return;
    }

    toast.info(`Preparing ${ordersToPrint.length} shipping label${ordersToPrint.length > 1 ? "s" : ""}...`);

    // Fetch and validate all label data first
    const validLabels: ShippingLabelData[] = [];
    let failCount = 0;

    for (const order of ordersToPrint) {
      try {
        const { data: fetchedData, error } = await fetchLabelData(order.id);
        if (fetchedData && !error) {
          fetchedData.waybillId = order.waybill_id!;
          const { valid, missingFields } = validateLabelData(fetchedData);
          if (!valid) {
            console.error(`Label validation failed for ${order.order_number}:`, missingFields);
            failCount++;
            continue;
          }
          validLabels.push(fetchedData);
        } else {
          failCount++;
        }
      } catch (err) {
        console.error(`Print label error for ${order.order_number}:`, err);
        failCount++;
      }
    }

    if (validLabels.length === 0) {
      toast.error("Failed to generate any shipping labels");
      return;
    }

    // Generate a single combined PDF with all labels
    try {
      toast.info(`Generating combined PDF with ${validLabels.length} label${validLabels.length > 1 ? "s" : ""}...`);
      const result = await generateCombinedShippingLabelsPdf(validLabels);

      toast.success(
        `${result.successCount} label${result.successCount > 1 ? "s" : ""} generated` +
          (result.failCount > 0 ? `, ${result.failCount} failed` : ""),
      );

      // Open dialog with combined PDF (null labelData shows generic title)
      setShippingLabelData(null);
      setShippingLabelDataUrl(result.dataUrl);
      setShippingLabelDialogOpen(true);
    } catch (err) {
      console.error("Combined PDF generation error:", err);
      toast.error("Failed to generate combined shipping labels PDF");
    }
  }, [orders, selectedIds]);

  // ─── Sorting ───────────────────────────────────────────────────
  const handleSortToggle = (key: string) => setActiveSort((prev) =>
    prev?.key === key ? { key, direction: prev.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" }
  );

  // ─── Repeat Customers (identified by WhatsApp) ────────────────
  const repeatCustomerCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of orders) {
      if (o.customer_whatsapp) {
        const normalized = o.customer_whatsapp.replace(/[\s-]/g, "");
        counts.set(normalized, (counts.get(normalized) || 0) + 1);
      }
    }
    return counts;
  }, [orders]);

  // ─── Filtered & Sorted ─────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    let r = [...orders];
    if (activeStatusTab !== "all") r = r.filter((o) => o.status === activeStatusTab);
    if (multiPaymentFilter) {
      r = r.filter((o) => multiPaymentFilter.includes(o.payment_status));
    } else if (paymentStatusTab !== "all") {
      r = r.filter((o) => o.payment_status === paymentStatusTab);
    }
    if (activeDeliveryTab === "scheduled") {
      const today = new Date().toISOString().slice(0, 10);
      r = r.filter((o) => o.expected_delivery_date && o.expected_delivery_date >= today && ["new_order", "ready", "packed"].includes(o.status));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter((o) => o.order_number.toLowerCase().includes(q) || o.customer_name.toLowerCase().includes(q) || o.items.some((i) => i.product_name.toLowerCase().includes(q)));
    }
    if (activeSort) {
      r.sort((a, b) => {
        let cmp = 0;
        if (activeSort.key === "order_number") cmp = a.order_number.localeCompare(b.order_number);
        else if (activeSort.key === "status") cmp = a.status.localeCompare(b.status);
        else if (activeSort.key === "payment_status") cmp = a.payment_status.localeCompare(b.payment_status);
        return activeSort.direction === "asc" ? cmp : -cmp;
      });
    }
    return r;
  }, [orders, activeStatusTab, paymentStatusTab, activeDeliveryTab, multiPaymentFilter, searchQuery, activeSort]);



  // ─── Mobile Card Render ────────────────────────────────────────
  const renderMobileCard = useCallback(
    (order: Order) => {
      const firstItem = order.items[0];
      const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
      const totalItems = order.items.length;
      const extra = totalItems - 1;

      return (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl glass-card p-4"
        >
          {/* ── Section 1: Header ──────────────────────────────── */}
          <div className="flex items-start justify-between gap-4">
            {/* Left: Order number + date */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold tracking-tight text-foreground leading-tight">
                  # {order.order_number}
                </p>
                {order.images && order.images.length > 0 && (
                  <span
                    className="inline-flex items-center gap-0.5 text-muted-foreground/40"
                    title={`${order.images.length} image${order.images.length > 1 ? "s" : ""}`}
                  >
                    <Paperclip className="size-3" />
                    <span className="text-[10px] font-medium">{order.images.length}</span>
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground/60">{formatDate(order.created_at)}</p>
              {order.dispatched_date && (
                <p className="mt-0.5 text-xs font-medium text-success">
                  Dispatched {formatDate(order.dispatched_date)}
                </p>
              )}
              {order.waybill_id && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTrackingWaybill(order.waybill_id!);
                    setTrackingDialogOpen(true);
                  }}
                  className="mt-0.5 inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground/70 hover:bg-accent hover:text-accent-foreground hover:border-border transition-colors"
                >
                  <Truck className="size-3" />
                  <span className="truncate max-w-[160px]">{order.waybill_id}</span>
                  <span className="text-primary/70" aria-hidden="true">→</span>
                </button>
              )}
            </div>
            {/* Right: Status badges stacked */}
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <EditableStatusBadge
                value={order.status}
                options={orderStatusOptions}
                colorMap={statusColorMap}
                onUpdate={(v) => handleStatusChange(order.id, v)}
              />
              <EditableStatusBadge
                value={order.payment_status}
                options={paymentStatusOptions}
                colorMap={paymentColorMap}
                onUpdate={(v) => handlePaymentChange(order.id, v)}
              />
            </div>
          </div>

          {/* ── Divider ──────────────────────────────────────── */}
          <div className="mt-4 h-px bg-border/50" />

          {/* ── Section 3: Order Details ──────────────────────── */}
          <div className="mt-4 space-y-3">
            {/* Customer */}
            <div>
              <p className="text-base font-medium text-foreground leading-snug">{order.customer_name}</p>

            </div>

            {/* Items */}
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
                    {firstItem.category && (
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {firstItem.category}
                      </p>
                    )}
                  </div>
                  <span className="text-base font-bold tabular-nums text-primary shrink-0">
                    {formatCurrency(order.total)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Qty: <strong>{totalQty}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* ── Section 4: Quick Actions ──────────────────────── */}
          <div className="mt-4 h-px bg-border/50" />
          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-xl text-accent-foreground/70 hover:bg-accent hover:text-accent-foreground transition-colors"
              title="View"
              onClick={(e) => {
                e.stopPropagation();
                fetchOrderForPreview(order.id).then((fd) => {
                  if (fd) {
                    setPreviewData(fd);
                    setSavedOrderId(order.id);
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
                fetchOrderForPreview(order.id).then((fd) => {
                  if (fd) {
                    setEditData(fd);
                    setEditKey((k) => k + 1);
                    setShowForm(true);
                    setEditOrderId(order.id);
                  }
                });
              }}
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-xl text-accent-foreground/70 hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-25 disabled:pointer-events-none"
              title="WhatsApp"
              disabled={!order.customer_whatsapp && !order.customer_phone}
              onClick={(e) => {
                e.stopPropagation();
                handleWhatsAppClick(order);
              }}
            >
              <MessageCircle className="size-4" />
            </button>
            {order.waybill_id && (
              <button
                type="button"
              className="flex size-9 items-center justify-center rounded-xl text-accent-foreground/70 hover:bg-accent hover:text-accent-foreground transition-colors"
              title="Print Label"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRowPrintLabel(order.id, order.waybill_id!);
                }}
              >
                <FileImage className="size-4" />
              </button>
            )}
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-xl text-destructive/70 hover:bg-status-danger-bg hover:text-destructive transition-colors"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTargetId(order.id);
              }}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </motion.div>
      );
    },
    [
      fetchOrderForPreview,
      setPreviewData,
      setSavedOrderId,
      setEditData,
      setEditKey,
      setShowForm,
      setEditOrderId,
      handleStatusChange,
      handlePaymentChange,
      handleWhatsAppClick,
      handleRowPrintLabel,
      setTrackingWaybill,
      setTrackingDialogOpen,
      setDeleteTargetId,
    ],
  );

  // ─── Export to XLSX ──────────────────────────────────────────────
  const handleExportXlsx = useCallback(() => {
    if (filteredOrders.length === 0) return;
    const rows = filteredOrders.map((order) => ({
      "Order No": order.order_number,
      Customer: order.customer_name,
      Items: order.items.map((i) => i.product_name).join(", "),
      "Total (Rs.)": order.total,
      Status: order.status,
      Payment: order.payment_status,
      Tracking: order.waybill_id ?? "",
      Date: formatDate(order.created_at),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Orders");

    // Auto-size columns
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(
        key.length,
        ...rows.map((r) => String((r as Record<string, unknown>)[key] ?? "").length),
      ),
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, `orders_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [filteredOrders]);

  // ─── Bulk Select by Status / Payment ──────────────────────────
  const handleSelectByStatus = useCallback((status: string) => {
    const ids = filteredOrders
      .filter((o) => o.status === status)
      .map((o) => o.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, [filteredOrders]);

  const handleSelectByPayment = useCallback((payment: string) => {
    const ids = filteredOrders
      .filter((o) => o.payment_status === payment)
      .map((o) => o.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, [filteredOrders]);

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
            {orderStatusOptions.map((option) => (
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
            <DropdownMenuGroup className="mt-1.5 pt-1.5 border-t border-border/50">
              <DropdownMenuLabel className="px-1.5 pb-1 text-sm font-semibold uppercase tracking-widest-alt text-muted-foreground">
                Select by payment
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            {paymentStatusOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className="rounded-lg text-sm gap-2 py-1.5"
                onClick={() => handleSelectByPayment(option.value)}
              >
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-sm font-semibold whitespace-nowrap",
                    paymentColorMap[option.value] ?? "text-muted-foreground",
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
            {orderStatusOptions.map((option) => (
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

        {/* Bulk Payment */}
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
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-sm font-semibold whitespace-nowrap",
                    paymentColorMap[option.value] ?? "text-muted-foreground",
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

        {/* Print Labels */}
        <Button
          variant="gradient"
          size="sm"
          onClick={handleBulkPrintLabels}
          className="gap-1.5"
        >
          <Truck className="size-3.5" />
          Labels
        </Button>
      </>
    ),
    [handleSelectByStatus, handleSelectByPayment, handleBulkStatusChange, handleBulkPaymentChange, handleExportXlsx, handleBulkPrintLabels],
  );

  const activeFilterCount =
    (activeStatusTab !== "all" ? 1 : 0) +
    (paymentStatusTab !== "all" ? 1 : 0) +
    (activeDeliveryTab !== "all" ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0) +
    (dateFilter !== "this_month" ? 1 : 0);

  const handleClearFilters = useCallback(() => {
    setActiveStatusTab("all");
    setPaymentStatusTab("all");
    setMultiPaymentFilter(null);
    setActiveDeliveryTab("all");
    setSearchQuery("");
    setDateFilter("this_month");
    setDateFrom("");
    setDateTo("");
  }, []);

  // ─── Pagination ───────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  const paginatedOrders = useMemo(
    () => filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredOrders, currentPage, pageSize],
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredOrders]);

  // ─── Quick action hover colors (compound key: "orderId-0", "orderId-wa", etc.) ─
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  // ─── Columns ────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        id: "order_number",
        label: "Order No",
        sortable: true,
        sortKey: "order_number",
        renderCell: (order) => (
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{order.order_number}</p>
              {order.images && order.images.length > 0 && (
                <span className="inline-flex items-center gap-0.5 text-muted-foreground/50" title={`${order.images.length} image${order.images.length > 1 ? "s" : ""}`}>
                  <Paperclip className="size-3" />
                  <span className="text-[10px] font-medium">{order.images.length}</span>
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground/70">{formatDate(order.created_at)}</p>
          </div>
        ),
      },
      {
        id: "customer_name",
        label: "Customer",
        hideOnMobile: true,
        className: "min-w-[140px]",
        renderCell: (order) => (
          <div className="flex items-center gap-2">
            <span className="truncate text-sm text-foreground">{order.customer_name}</span>
            <RepeatBadge order={order} counts={repeatCustomerCounts} />
          </div>
        ),
      },
      {
        id: "category",
        label: "Category",
        hideOnMobile: true,
        renderCell: (order) => {
          const allCategories = [
            ...new Set(
              order.items
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
        renderCell: (order) => {
          const totalItems = order.items.length;
          const firstItem = order.items[0];
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

          const itemLabels = order.items.map(
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
        renderCell: (order) => {
          const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
          return (
            <span className="text-sm text-muted-foreground tabular-nums">{totalQty}</span>
          );
        },
      },
      {
        id: "total",
        label: "Total",
        renderCell: (order) => (
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {formatCurrency(order.total)}
          </span>
        ),
      },
      {
        id: "tracking",
        label: "Tracking",
        className: "max-w-[160px]",
        renderCell: (order) =>
          order.waybill_id ? (
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => {
                  setTrackingWaybill(order.waybill_id!);
                  setTrackingDialogOpen(true);
                }}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-muted/40 pl-2 pr-1 py-1 hover:bg-accent hover:text-accent-foreground transition-colors text-left"
              >
                <Truck className="size-3 shrink-0 text-muted-foreground/60" />
                <span className="truncate text-sm font-medium">{order.waybill_id}</span>
                <span className="text-primary/70 text-xs font-medium" aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground/40">—</span>
          ),
      },
      {
        id: "status",
        label: "Status",
        sortable: true,
        sortKey: "status",
        className: "w-28",
        renderCell: (order) => (
          <EditableStatusBadge
            value={order.status}
            options={orderStatusOptions}
            colorMap={statusColorMap}
            onUpdate={(v) => handleStatusChange(order.id, v)}
          />
        ),
      },
      {
        id: "payment_status",
        label: "Payment",
        sortable: true,
        sortKey: "payment_status",
        className: "w-28",
        renderCell: (order) => (
          <EditableStatusBadge
            value={order.payment_status}
            options={paymentStatusOptions}
            colorMap={paymentColorMap}
            onUpdate={(v) => handlePaymentChange(order.id, v)}
          />
        ),
      },
      {
        id: "actions",
        label: "",
        className: "w-28",
        renderCell: (order) => (
          <div className="flex items-center gap-0.5">
            {/* Visible: View, Edit, Delete */}
            {([Eye, Pencil, Trash2] as const).map((Icon, i) => (
              <Button
                key={i}
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground/50"
                title={i === 0 ? "View" : i === 1 ? "Edit" : "Delete"}
                onMouseEnter={() => setHoveredAction(`${order.id}-${i}`)}
                onMouseLeave={() => setHoveredAction(null)}
                onClick={
                  i === 0
                    ? (e) => {
                        e.stopPropagation();
                        fetchOrderForPreview(order.id).then((fd) => {
                          if (fd) {
                            setPreviewData(fd);
                            setSavedOrderId(order.id);
                          }
                        });
                      }
                    :                i === 1
                      ? (e) => {
                          e.stopPropagation();
                          fetchOrderForPreview(order.id).then((fd) => {
                            if (fd) {
                              setEditData(fd);
                              setEditKey((k) => k + 1);
                              setShowForm(true);
                              setEditOrderId(order.id);
                            }
                          });
                        }
                      : (e) => {
                          e.stopPropagation();
                          setDeleteTargetId(order.id);
                        }
                }
              >
                <Icon
                  className="size-3.5"
                  style={{ color: hoveredAction === `${order.id}-${i}` ? ACTION_COLORS[i] : undefined }}
                />
              </Button>
            ))}

            {/* ─── 3-dot dropdown with more actions ──────────── */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex size-7 items-center justify-center rounded-md p-0 text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 border-0 bg-transparent h-auto dark:bg-transparent"
                title="More actions"
              >
                <MoreHorizontal className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px] p-1.5">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-1.5 pb-1 text-sm font-semibold uppercase tracking-widest-alt text-muted-foreground">
                    More Actions
                  </DropdownMenuLabel>
                </DropdownMenuGroup>

                {/* WhatsApp */}
                <DropdownMenuItem
                  className="rounded-lg text-sm gap-2 py-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWhatsAppClick(order);
                  }}
                >
                  <MessageCircle className="size-3.5 text-green-500" />
                  WhatsApp
                </DropdownMenuItem>

                {/* Print Shipping Label (only if waybill exists) */}
                {order.waybill_id && (
                  <DropdownMenuItem
                    className="rounded-lg text-sm gap-2 py-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowPrintLabel(order.id, order.waybill_id!);
                    }}
                  >
                    <Truck className="size-3.5 text-purple-500" />
                    Print Shipping Label
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [handleStatusChange, handlePaymentChange, repeatCustomerCounts, hoveredAction, handleWhatsAppClick],
  );



  // ─── Empty State ────────────────────────────────────────────────
  const emptyState = useMemo(() => {
    const isFiltered = orders.length > 0 && (activeStatusTab !== "all" || activeDeliveryTab !== "all");
    const tabLabel = activeDeliveryTab === "scheduled"
      ? "scheduled delivery"
      : (orderStatusTabs.find((t) => t.value === activeStatusTab)?.label ?? "").toLowerCase();
    return {
      icon: ShoppingCart,
      title: isFiltered ? `No ${tabLabel} orders` : "No orders yet",
      description: isFiltered
        ? "There are no orders matching this filter."
        : "Create your first order to start managing your sales in one place.",
      action: isFiltered ? undefined : (
        <Button
          variant="gradient"
          size="sm"
          onClick={() => setShowForm(true)}
        >
          <Plus className="size-3.5" />
          New Order
        </Button>
      ),
    };
  }, [orders.length, activeStatusTab, activeDeliveryTab]);

  // ─── Render ────────────────────────────────────────────────────
  return (
    <>
      {renderWhatsAppDialogs()}

      {/* ─── Mobile: full-screen overlay for form/preview ── */}
      {isMobile && (showForm || previewData) && (
        <div
          className="fixed inset-0 z-[70] overflow-y-auto"
          style={{
            height: "100dvh",
            paddingTop: "env(safe-area-inset-top, 0px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {previewData ? (
            <OrderPreview
              data={previewData}
              onBack={() => {
                setPreviewData(null);
                setShowForm(false);
                setSavedOrderId(null);
                setEditOrderId(null);
              }}
              onEdit={() => {
                setEditData(previewData);
                setEditKey((k) => k + 1);
                setPreviewData(null);
                setShowForm(true);
                if (savedOrderId) setEditOrderId(savedOrderId);
              }}
              onStatusChange={async (newStatus) => {
                if (savedOrderId) {
                  const supabase = createClient();
                  await supabase
                    .from("orders")
                    .update({ status: newStatus, updated_at: new Date().toISOString() })
                    .eq("id", savedOrderId);
                }
              }}
              onPaymentStatusChange={async (newPayment: string) => {
                if (savedOrderId) {
                  const supabase = createClient();
                  await supabase
                    .from("orders")
                    .update({ payment_status: newPayment, updated_at: new Date().toISOString() })
                    .eq("id", savedOrderId);
                }
              }}
            />
          ) : (
            <OrderForm
              key={editData ? `edit_${editKey}` : "new"}
              initialData={editData || undefined}
              isEditing={!!editOrderId}
              onSubmit={handleOrderSubmit}
              onCancel={() => {
                setShowForm(false);
                setPreviewData(null);
                setEditData(null);
                setEditOrderId(null);
                setSavedOrderId(null);
              }}
            />
          )}
        </div>
      )}

      <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="show">
      {!showForm && !previewData && (
        /* ─── Header ──────────────────────────────────────────── */
        <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Orders</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage and track all your orders in one place.</p>
          </div>
          <div className="flex items-center justify-center gap-3 w-full sm:w-auto sm:gap-2 sm:justify-start">
            <Button
              variant="outline"
              onClick={() => setShowBulkImport(true)}
              className="text-sm"
            >
              <Upload className="size-4" />
              Bulk Import
            </Button>
            <Button
              variant="gradient"
              onClick={() => setShowForm(true)}
            >
              <Plus className="size-4" />
              Add New Order
            </Button>
          </div>
        </motion.div>
      )}

      {!showForm && !previewData && (
        /* ─── Filter Bar ────────────────────────────────────────── */
        <motion.div variants={itemVariants} className="space-y-3">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by order no, name, item, phone, or tracking..."
            status={{
              value: activeStatusTab,
              onChange: (v) => v && setActiveStatusTab(v),
              options: orderStatusTabs,
            }}
            payment={{
              value: paymentStatusTab,
              onChange: (v) => v && setPaymentStatusTab(v),
              options: paymentStatusTabs,
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

          {/* Delivery status pills — only show when there are scheduled deliveries or the tab is active */}
          {(hasScheduledDeliveries || activeDeliveryTab !== "all") && (
          <div className="flex items-center justify-center gap-3 w-full sm:w-auto sm:gap-1.5 sm:justify-start">
            {deliveryStatusTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveDeliveryTab(tab.value)}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium transition-all",
                  activeDeliveryTab === tab.value
                    ? "bg-primary/10 text-primary shadow-xs"
                    : "text-muted-foreground/60 hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          )}

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

      {/* ─── Order Preview / Order Form / Bulk Import / Data Table ── */}
      <motion.div variants={itemVariants}>
        {showBulkImport ? (
          <BulkOrderImportForm
            businessId={businessId}
            onCancel={() => setShowBulkImport(false)}
            onComplete={() => {
              setShowBulkImport(false);
              setFetchTrigger((n) => n + 1);
            }}
          />
        ) : !isMobile && previewData ? (
          <OrderPreview
            data={previewData}
            onBack={() => {
              setPreviewData(null);
              setShowForm(false);
              setSavedOrderId(null);
              setEditOrderId(null);
            }}
            onEdit={() => {
              setEditData(previewData);
              setEditKey((k) => k + 1);
              setPreviewData(null);
              setShowForm(true);
              if (savedOrderId) setEditOrderId(savedOrderId);
            }}
            onStatusChange={async (newStatus) => {
              setPreviewData((prev) => prev ? { ...prev, status: newStatus } : null);
              if (savedOrderId) {
                setOrders((prev) =>
                  prev.map((o) =>
                    o.id === savedOrderId ? { ...o, status: newStatus } : o,
                  ),
                );
                try {
                  await createClient()
                    .from("orders")
                    .update({ status: newStatus, updated_at: new Date().toISOString() })
                    .eq("id", savedOrderId);
                } catch (err) {
                  console.error("Preview status update error:", err);
                }
              }
            }}
            onPaymentStatusChange={async (newPayment) => {
              setPreviewData((prev) => prev ? { ...prev, payment_status: newPayment } : null);
              if (savedOrderId) {
                setOrders((prev) =>
                  prev.map((o) =>
                    o.id === savedOrderId ? { ...o, payment_status: newPayment } : o,
                  ),
                );
                try {
                  await createClient()
                    .from("orders")
                    .update({ payment_status: newPayment, updated_at: new Date().toISOString() })
                    .eq("id", savedOrderId);
                } catch (err) {
                  console.error("Preview payment update error:", err);
                }
              }
            }}
          />
        ) : !isMobile && showForm ? (
          <OrderForm
            key={editData ? `edit_${editKey}` : "new"}
            initialData={editData || undefined}
            isEditing={!!editOrderId}
            onSubmit={handleOrderSubmit}
            onCancel={() => {
              setShowForm(false);
              setPreviewData(null);
              setEditData(null);
              setEditOrderId(null);
              setSavedOrderId(null);
            }}
          />
        ) : (
          <DataTable<Order>
            columns={columns}
            data={paginatedOrders}
            keyExtractor={(order) => order.id}
            loading={loading}
            error={error}
            empty={emptyState}
            sort={{ active: activeSort, onToggle: handleSortToggle }}
            pagination={{
              currentPage,
              totalPages,
              totalItems: filteredOrders.length,
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

      {/* ─── Dispatch Dialog ────────────────────────────────── */}
      <DispatchDialog
        open={dispatchDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDispatchDialogOpen(false);
            setPendingDispatchOrderId(null);
            setPendingDispatchNewStatus(null);
          }
        }}
        courierName={courierConfig?.providerLabel || null}
        onDispatch={handleDispatch}
      />

      {/* ─── Track Shipment Dialog ──────────────────────────────── */}
      <TrackShipmentDialog
        open={trackingDialogOpen}
        onOpenChange={setTrackingDialogOpen}
        waybillNumber={trackingWaybill || ""}
      />

      {/* ─── Shipping Label Dialog ──────────────────────────────── */}
      <ShippingLabelDialog
        open={shippingLabelDialogOpen}
        onOpenChange={setShippingLabelDialogOpen}
        labelData={shippingLabelData}
        initialDataUrl={shippingLabelDataUrl || undefined}
      />

      {/* ─── Enter Waybill Dialog ──────────────────────────────── */}
      <EnterWaybillDialog
        open={waybillDialogOpen}
        onOpenChange={(open) => {
          setWaybillDialogOpen(open);
          if (!open) {
            setPendingWaybillOrderId(null);
            setPendingWaybillNewStatus(null);
          }
        }}
        orderNumber={orders.find((o) => o.id === pendingWaybillOrderId)?.order_number || ""}
        targetStatus={(pendingWaybillNewStatus as "packed" | "dispatched") || "packed"}
        onConfirm={handleWaybillConfirm}
        availableWaybills={availableWaybills}
        isManualMode={waybillMethod === "manual"}
      />

      {/* ─── Confirm Dialogs ───────────────────────────────────── */}
      <ConfirmDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
        title="Delete this order?"
        description="This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmSingleDelete}
      />

      <ConfirmDialog
        open={showBulkDelete}
        onOpenChange={setShowBulkDelete}
        title={
          selectedIds.size === 1
            ? "Delete this order?"
            : `Delete ${selectedIds.size} orders?`
        }
        description="This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmBulkDelete}
      />      </motion.div>
    </>
  );
  }

// ─── Exported Page (wrapped in Suspense for useSearchParams) ───────
export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ShoppingCart className="size-6 animate-pulse" />
          <p className="text-sm font-medium">Loading orders…</p>
        </div>
      </div>
    }>
      <OrdersPageInner />
    </Suspense>
  );
}
