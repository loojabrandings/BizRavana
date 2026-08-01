"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarClock,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Package,
  PackageCheck,
  RefreshCw,
  Settings2,
  Truck,
  Undo2,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  loadCourierConfig,
  syncDeliveryStatuses,
} from "@/lib/delivery/courier-utils";
import { getProvider } from "@/lib/delivery/provider-registry";
import type { StatusCategory, StatusDisplayEntry } from "@/lib/delivery/provider-registry";
import {
  buildLoadingSteps,
  markLoadingStep,
  type LoadingStep,
} from "@/lib/delivery/loading-steps";
import type { CourierDashboardData, CourierStatusBreakdown, CourierRecentActivity } from "@/lib/delivery/types";
import { useCourierStore } from "@/stores/courier-store";
import { CourierFinanceTab } from "@/components/delivery/courier-finance-tab";
import { LoadingStepList } from "@/components/delivery/loading-step-list";

// ─── Status Display Helpers ─────────────────────────────────────────
// Category-based mapping replaces the fragile keyword guessing.
// Each StatusCategory maps to a known colour scheme and icon.
// Fallback functions are kept for providers without statusDisplayConfig.

interface StatusStyle {
  bg: string;
  text: string;
  dot: string;
  icon: string;
  badge: string;
}

/** Maps a StatusCategory to its visual style. */
function categoryStyle(category: StatusCategory): StatusStyle {
  switch (category) {
    case "completed":
      return {
        bg: "bg-emerald-500/8",
        text: "text-emerald-500",
        dot: "bg-emerald-500",
        icon: "bg-emerald-500/10 text-emerald-500",
        badge: "bg-emerald-500/10 text-emerald-500",
      };
    case "returned":
      return {
        bg: "bg-orange-500/8",
        text: "text-orange-500",
        dot: "bg-orange-500",
        icon: "bg-orange-500/10 text-orange-500",
        badge: "bg-orange-500/10 text-orange-500",
      };
    case "transit":
      return {
        bg: "bg-blue-500/8",
        text: "text-blue-500",
        dot: "bg-blue-500",
        icon: "bg-blue-500/10 text-blue-500",
        badge: "bg-blue-500/10 text-blue-500",
      };
    case "confirmed":
      return {
        bg: "bg-sky-500/8",
        text: "text-sky-500",
        dot: "bg-sky-500",
        icon: "bg-sky-500/10 text-sky-500",
        badge: "bg-sky-500/10 text-sky-500",
      };
    case "picked":
      return {
        bg: "bg-teal-500/8",
        text: "text-teal-500",
        dot: "bg-teal-500",
        icon: "bg-teal-500/10 text-teal-500",
        badge: "bg-teal-500/10 text-teal-500",
      };
    case "rider":
      return {
        bg: "bg-indigo-500/8",
        text: "text-indigo-500",
        dot: "bg-indigo-500",
        icon: "bg-indigo-500/10 text-indigo-500",
        badge: "bg-indigo-500/10 text-indigo-500",
      };
    case "rescheduled":
      return {
        bg: "bg-amber-500/8",
        text: "text-amber-500",
        dot: "bg-amber-500",
        icon: "bg-amber-500/10 text-amber-500",
        badge: "bg-amber-500/10 text-amber-500",
      };
    case "failed":
      return {
        bg: "bg-red-500/8",
        text: "text-red-500",
        dot: "bg-red-500",
        icon: "bg-red-500/10 text-red-500",
        badge: "bg-red-500/10 text-red-500",
      };
    case "pending":
      return {
        bg: "bg-amber-500/8",
        text: "text-amber-500",
        dot: "bg-amber-500",
        icon: "bg-amber-500/10 text-amber-500",
        badge: "bg-amber-500/10 text-amber-500",
      };
    default:
      return {
        bg: "bg-slate-500/8",
        text: "text-slate-500",
        dot: "bg-slate-500",
        icon: "bg-slate-500/10 text-slate-500",
        badge: "bg-slate-500/10 text-slate-500",
      };
  }
}

/** Maps a StatusCategory to its icon component. */
function categoryIcon(category: StatusCategory): React.ComponentType<{ className?: string }> {
  switch (category) {
    case "completed":
      return PackageCheck;
    case "returned":
      return Undo2;
    case "transit":
      return Truck;
    case "confirmed":
      return PackageCheck;
    case "picked":
      return Package;
    case "rider":
      return MapPin;
    case "rescheduled":
      return CalendarClock;
    case "failed":
      return X;
    case "pending":
      return Undo2;
    default:
      return Clock;
  }
}

/**
 * Get the provider's status display config, or a sensible default.
 * This is the single source of truth for which cards to show.
 */
function getStatusDisplayConfig(providerId: string | null): StatusDisplayEntry[] {
  if (providerId) {
    const provider = getProvider(providerId);
    if (provider?.statusDisplayConfig) {
      return provider.statusDisplayConfig;
    }
  }
  // Fallback: hardcoded default matches the old STANDARD_EVENT_STATUSES
  return [
    { id: "confirmed", label: "Confirmed", matchPatterns: ["confirmed"], category: "confirmed" },
    { id: "dispatched", label: "Dispatched", matchPatterns: ["dispatched"], category: "transit" },
    { id: "in_transit", label: "In Transit", matchPatterns: ["in transit", "transit", "branch"], category: "transit" },
    { id: "to_be_delivered", label: "To Be Delivered", matchPatterns: ["to be delivered", "out for delivery", "rider assigned"], category: "rider" },
    { id: "rescheduled", label: "Rescheduled", matchPatterns: ["rescheduled"], category: "rescheduled" },
    { id: "to_be_returned", label: "To Be Returned", matchPatterns: ["to be returned", "returned", "rto"], category: "pending" },
    { id: "delivered", label: "Delivered", matchPatterns: ["delivered", "completed"], category: "completed" },
  ];
}

/**
 * Normalize a status label for matching: lowercase and treat underscores
 * as spaces. Local breakdown labels are built from internal statuses with
 * underscores → spaces ("to dispatch"), while display config matchPatterns
 * use the raw underscore form ("to_dispatch"). Normalizing both sides makes
 * them comparable so cards like "Rescheduled" actually match.
 */
function normalizeStatusKey(value: string): string {
  return value.toLowerCase().replace(/_/g, " ");
}

/**
 * Merge raw status breakdown data with the provider's display config.
 * Each config entry's matchPatterns are checked against the source labels
 * to find the matching count and delivery charge.
 */
function mergeWithStatusDisplayConfig(
  source: CourierStatusBreakdown[],
  displayConfig: StatusDisplayEntry[],
): (CourierStatusBreakdown & { category: StatusCategory })[] {
  const sourceMap = new Map<string, CourierStatusBreakdown>();
  for (const s of source) {
    sourceMap.set(normalizeStatusKey(s.label), s);
  }

  return displayConfig.map((entry) => {
    for (const pattern of entry.matchPatterns) {
      const normalizedPattern = normalizeStatusKey(pattern);
      for (const [sourceLabel, breakdown] of sourceMap) {
        if (sourceLabel.includes(normalizedPattern)) {
          return { ...breakdown, id: entry.id, label: entry.label, category: entry.category };
        }
      }
    }
    return { id: entry.id, label: entry.label, count: 0, deliveryCharge: 0, category: entry.category };
  });
}

// ─── Helpers ─────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const formatCurrency = (amount: number) =>
  "Rs. " + amount.toLocaleString("en-LK");

/**
 * Derive a StatusCategory from a status string by matching against
 * the provider's display config (or fallback patterns).
 */
function getCategoryForStatus(
  statusName: string,
  providerId: string | null,
): StatusCategory {
  const config = getStatusDisplayConfig(providerId);
  const n = normalizeStatusKey(statusName);
  for (const entry of config) {
    for (const pattern of entry.matchPatterns) {
      if (n.includes(normalizeStatusKey(pattern))) return entry.category;
    }
  }
  return "default";
}

/**
 * Get the friendly display label for a status by matching it against the
 * provider's display config (e.g. internal "to_dispatch" → "Rescheduled").
 * Falls back to a title-cased version of the raw status when no pattern
 * matches (e.g. "cancelled" → "Cancelled").
 */
function getDisplayStatusLabel(
  statusName: string,
  providerId: string | null,
): string {
  const config = getStatusDisplayConfig(providerId);
  const n = normalizeStatusKey(statusName);
  for (const entry of config) {
    for (const pattern of entry.matchPatterns) {
      if (n.includes(normalizeStatusKey(pattern))) return entry.label;
    }
  }
  return statusName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
}

/** How long (ms) a cached courier breakdown is considered fresh. */
const CACHE_TTL_MS = 30_000;

// ─── Loading step helpers ─────────────────────────────────────────
// Shared LoadingStep/markLoadingStep live in @/lib/delivery/loading-steps.

/**
 * Build the ordered checklist of loading steps for a courier-page fetch run.
 * API steps (connect, dashboard) are only included when allowApiSync
 * is true, so the checklist always reflects what will actually run.
 */
function buildCourierLoadingSteps(allowApiSync: boolean): LoadingStep[] {
  return buildLoadingSteps([
    { id: "config", label: "Checking your courier settings" },
    ...(allowApiSync
      ? [
          { id: "connect", label: "Connecting to your courier" },
          { id: "dashboard", label: "Pulling the latest courier dashboard" },
        ]
      : []),
    { id: "orders", label: "Loading your order data" },
  ]);
}

// ─── Animations ──────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.04, duration: 0.3, ease: "easeOut" as const },
  }),
};

// ─── Local data query ────────────────────────────────────────────

interface LocalDeliveryStats {
  breakdown: CourierStatusBreakdown[];
  recentActivity: CourierRecentActivity[];
  totalOrders: number;
  totalDeliveryCharge: number;
  /** Orders dispatched via this courier that are not yet in a terminal state. */
  toBeDelivered: number;
}

async function fetchLocalDeliveryStats(
  businessId: string,
  providerId: string,
): Promise<LocalDeliveryStats> {
  const supabase = createClient();

  // ── 0. Get valid order IDs for this provider ──────────────────
  const { data: validOrders } = await supabase
    .from("orders")
    .select("id")
    .eq("business_id", businessId)
    .eq("courier_provider", providerId)
    .not("waybill_id", "is", null);

  const validOrderIds = new Set((validOrders || []).map((o) => String(o.id)));

  // ── 0.5. Direct "To Be Delivered" count from the orders table ──
  // Orders dispatched via this courier (have a waybill) that are not yet in a
  // terminal state (delivered / cancelled / returned).
  const { count: toBeDelivered, error: toBeDeliveredError } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .eq("courier_provider", providerId)
    .not("waybill_id", "is", null)
    .not("status", "in", "(delivered,cancelled,returned)");

  if (toBeDeliveredError) {
    console.error("Failed to count to-be-delivered orders:", toBeDeliveredError);
  }

  // ── 1. Fetch deliveries for this courier, filtered by valid orders ──
  const { data: deliveries } = await supabase
    .from("deliveries")
    .select("id, waybill_id, courier, courier_charge, status, created_at, order_id")
    .eq("business_id", businessId)
    .eq("courier", providerId)
    .order("created_at", { ascending: false });

  // Only include deliveries whose order_id matches a valid order for this provider.
  // This excludes legacy delivery records that were incorrectly created for
  // orders dispatched through a different courier.
  const filteredDeliveries = (deliveries || []).filter(
    (d) => !d.order_id || validOrderIds.has(String(d.order_id)),
  );

  const existingOrderIds = new Set(filteredDeliveries.map((d) => d.order_id).filter(Boolean));

  // ── 2. Also fetch orders that have waybill_id but no delivery record ──
  // Only fetch orders that were dispatched through THIS provider.
  const { data: ordersWithWaybills } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, waybill_id, created_at, status, delivery_charge")
    .eq("business_id", businessId)
    .eq("courier_provider", providerId)
    .not("waybill_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);

  // Merge: combine delivery records + orders-with-waybill that aren't already in deliveries
  const orderDataMap = new Map<string, {
    waybill_id: string;
    status: string;
    courier_charge: number;
    created_at: string;
    order_number: string;
    customer_name: string;
  }>();

  // Add deliveries first
  for (const d of filteredDeliveries) {
    if (d.waybill_id && !orderDataMap.has(d.waybill_id)) {
      orderDataMap.set(d.waybill_id, {
        waybill_id: d.waybill_id,
        status: d.status,
        courier_charge: d.courier_charge ?? 0,
        created_at: d.created_at,
        order_number: "", // filled below
        customer_name: "",
      });
    }
  }

  // Add orders with waybills that aren't already covered
  for (const o of ordersWithWaybills || []) {
    if (o.waybill_id && !orderDataMap.has(o.waybill_id)) {
      orderDataMap.set(o.waybill_id, {
        waybill_id: o.waybill_id,
        status: o.status === "dispatched" ? "confirmed" : "to_dispatch",
        courier_charge: o.delivery_charge ?? 0,
        created_at: o.created_at,
        order_number: o.order_number,
        customer_name: o.customer_name,
      });
    }
  }

  const allRecords = Array.from(orderDataMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  if (allRecords.length === 0) {
    return {
      breakdown: [],
      recentActivity: [],
      totalOrders: 0,
      totalDeliveryCharge: 0,
      toBeDelivered: toBeDelivered ?? 0,
    };
  }

  // ── 3. Group by status ───────────────────────────────────────
  const statusMap = new Map<string, { count: number; charge: number }>();
  for (const r of allRecords) {
    const current = statusMap.get(r.status) || { count: 0, charge: 0 };
    current.count++;
    current.charge += r.courier_charge;
    statusMap.set(r.status, current);
  }

  const breakdown: CourierStatusBreakdown[] = [];
  for (const [status, data] of statusMap) {
    breakdown.push({
      id: status,
      label: status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase()),
      count: data.count,
      deliveryCharge: data.charge,
    });
  }

  const totalOrders = allRecords.length;
  const totalDeliveryCharge = allRecords.reduce(
    (sum, r) => sum + r.courier_charge,
    0,
  );

  // ── 4. Recent activity: latest 10 ────────────────────────────
  // Fetch order names for delivery records that don't have them yet
  const recentRecords = allRecords.slice(0, 10);
  const deliveryOrderIds = filteredDeliveries
    .filter((d) => d.order_id)
    .map((d) => d.order_id!);

  let orderNameMap = new Map<string, { order_number: string; customer_name: string }>();
  if (deliveryOrderIds.length > 0) {
    const { data: orders } = await supabase
      .from("orders")
      .select("id, order_number, customer_name")
      .in("id", deliveryOrderIds);

    if (orders) {
      for (const o of orders) {
        orderNameMap.set(o.id, o);
      }
    }
  }

  // Build recent activity entries
  const recentActivity: CourierRecentActivity[] = [];
  for (const r of recentRecords) {
    // Try to get order info from the merged data first, then from delivery order map
    let orderNumber = r.order_number;
    let customerName = r.customer_name;

    // If we have a delivery that references this waybill, check the order_id
    const matchingDelivery = filteredDeliveries.find(
      (d) => d.waybill_id === r.waybill_id && d.order_id,
    );
    if (matchingDelivery) {
      const info = orderNameMap.get(matchingDelivery.order_id!);
      if (info) {
        orderNumber = info.order_number;
        customerName = info.customer_name;
      }
    }

    recentActivity.push({
      orderNumber: orderNumber || "—",
      customerName: customerName || "—",
      waybill: r.waybill_id,
      status: r.status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase()),
      date: formatDate(r.created_at),
    });
  }

  return {
    breakdown,
    recentActivity,
    totalOrders,
    totalDeliveryCharge,
    toBeDelivered: toBeDelivered ?? 0,
  };
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function CourierPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "finance">("orders");

  const [providerLabel, setProviderLabel] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [statusBreakdown, setStatusBreakdown] = useState<CourierStatusBreakdown[]>([]);
  const [recentActivity, setRecentActivity] = useState<CourierRecentActivity[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [apiStatuses, setApiStatuses] = useState<CourierStatusBreakdown[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>(() =>
    markLoadingStep(buildCourierLoadingSteps(true), "config", "Checking your courier settings…"),
  );

  /** Local type alias for the merged breakdown that includes a category. */
  type StatusWithCategory = CourierStatusBreakdown & { category: StatusCategory };

  // Refs to persist config across re-renders
  const configRef = useRef<{ providerId: string | null; credentials: Record<string, string> }>({
    providerId: null,
    credentials: {},
  });

  // ── Fetch all data ─────────────────────────────────────────────
  const fetchData = useCallback(async (options?: { isRefresh?: boolean; allowApiSync?: boolean }) => {
    const isRefresh = options?.isRefresh ?? false;
    const allowApiSync = options?.allowApiSync ?? true;

    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    console.log(
      `[CourierPage] fetchData: isRefresh=${isRefresh}, allowApiSync=${allowApiSync}`
    );

    try {
      setLoadingSteps(markLoadingStep(buildCourierLoadingSteps(allowApiSync), "config", "Checking your courier settings…"));
      const config = await loadCourierConfig();
      if (!config?.provider) {
        setProviderLabel(null);
        setConnected(false);
        setStatusBreakdown([]);
        setRecentActivity([]);
        setTotalOrders(0);
        setApiStatuses([]);
        configRef.current = { providerId: null, credentials: {} };
        console.log("[CourierPage] No courier configured — clearing store");
        // Clear shared store so the dashboard doesn't show stale counts
        useCourierStore.getState().clear();
        return;
      }

      configRef.current = {
        providerId: config.provider,
        credentials: config.credentials,
      };

      setProviderLabel(config.providerLabel);
      setConnected(true);

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("user_id", session.user.id)
        .single();

      if (!profile?.business_id) return;

      // 1. (Optional) Sync delivery statuses from the courier API.
      //    Skipped on auto-mount when the store cache is still fresh.
      if (allowApiSync) {
        setLoadingSteps((prev) => markLoadingStep(prev, "connect", `Connecting to ${config.providerLabel || "your courier"}…`));
        console.log("[CourierPage] allowApiSync=true → calling syncDeliveryStatuses & fetchDashboard");
        await syncDeliveryStatuses(
          profile.business_id,
          config.credentials,
          config.provider,
        );
      } else {
        console.log("[CourierPage] allowApiSync=false → skipping API calls, using cached data");
      }

      // 2. (Optional) Try fetching dashboard data from the provider API.
      const provider = getProvider(config.provider);
      let dashboardData: CourierDashboardData | null = null;

      if (allowApiSync && provider?.fetchDashboard) {
        setLoadingSteps((prev) => markLoadingStep(prev, "dashboard", "Pulling the latest courier dashboard…"));
        try {
          dashboardData = await provider.fetchDashboard(config.credentials);
          setApiStatuses(dashboardData.statusBreakdown || []);
        } catch (err) {
          console.error("Provider dashboard fetch failed:", err);
          setApiStatuses([]);
        }
      }

      // 3. Always fetch local delivery stats (lightweight DB query)
      setLoadingSteps((prev) => markLoadingStep(prev, "orders", "Loading your order data…"));
      const localStats = await fetchLocalDeliveryStats(profile.business_id, config.provider);

      setStatusBreakdown(localStats.breakdown);

      // ── "To Be Delivered" — direct count from the orders table ──
      // Orders dispatched via this courier that are not yet delivered/cancelled/returned.
      const rawBreakdown = localStats.breakdown;
      const toBeDeliveredCount = localStats.toBeDelivered;

      // ── Store the **merged** breakdown + toBeDelivered count ──
      // The dashboard reads both to match the courier page cards exactly.
      const displayConfig = getStatusDisplayConfig(config.provider);
      const merged = mergeWithStatusDisplayConfig(rawBreakdown, displayConfig);
      useCourierStore.getState().setBreakdown(merged, toBeDeliveredCount);

      setActiveOrders(toBeDeliveredCount);
      setRecentActivity(localStats.recentActivity);
      setTotalOrders(localStats.totalOrders);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to load courier data:", err);
      setError(err instanceof Error ? err.message : "Failed to load courier data");
      // Clear shared store so the dashboard doesn't show stale counts
      useCourierStore.getState().clear();
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  // ── Load on mount ──────────────────────────────────────────────
  useEffect(() => {
    const cached = useCourierStore.getState();
    const age = cached.lastUpdated
      ? Date.now() - new Date(cached.lastUpdated).getTime()
      : Infinity;
    const isStale = !cached.lastUpdated || age >= CACHE_TTL_MS;
    console.log(
      `[CourierPage] Mount: lastUpdated=${cached.lastUpdated}, ` +
      `age=${age}ms, TTL=${CACHE_TTL_MS}ms, isStale=${isStale}, ` +
      `allowApiSync=${isStale}`
    );
    // When the cache is fresh, skip the heavy API calls (syncDeliveryStatuses,
    // fetchDashboard) but still run the lightweight DB queries so component
    // state (connected, statusBreakdown, recentActivity, etc.) gets hydrated.
    fetchData({ isRefresh: false, allowApiSync: isStale });
  }, [fetchData]);

  // ── Handle refresh ─────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    // Manual refresh always does a full API sync.
    fetchData({ isRefresh: true, allowApiSync: true });
  }, [fetchData]);

  // ── Active statuses to display ─────────────────────────────────
  const activeStatuses = useMemo((): StatusWithCategory[] => {
    const source = statusBreakdown.length > 0 ? statusBreakdown : apiStatuses;
    const config = getStatusDisplayConfig(configRef.current.providerId);
    const merged = mergeWithStatusDisplayConfig(source, config);
    // The "To Be Delivered" card uses the direct orders-table count
    // (dispatched but not yet delivered) rather than the status-match count.
    // This keeps the courier page card in sync with the dashboard card,
    // which reads the same direct count from the shared store.
    return merged.map((s) =>
      s.id === "to_be_delivered" ? { ...s, count: activeOrders } : s,
    );
  }, [statusBreakdown, apiStatuses, activeOrders]);

  const formatRatio = useCallback(
    (count: number) => {
      if (totalOrders === 0) return "0%";
      return ((count / totalOrders) * 100).toFixed(1) + "%";
    },
    [totalOrders],
  );

  // ── Loading / refreshing state ────────────────────────────────
  // The step checklist shows during both the initial load and manual
  // refresh (it replaces the skeleton placeholders used previously).
  if (loading || refreshing) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-24"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <Loader2 className="size-10 animate-spin text-primary/60" />
        <div className="mt-6">
          <LoadingStepList steps={loadingSteps} />
        </div>
      </motion.div>
    );
  }

  // ── No courier configured ──────────────────────────────────────
  if (!connected) {
    return (
      <motion.div
        className="space-y-5 lg:space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Truck className="size-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Courier
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Track and manage your courier deliveries.
                </p>
              </div>
            </div>
          </div>
          <Link
            href="/dashboard/settings?tab=courier#courier-provider"
            className={cn(
              "group relative inline-flex h-9 shrink-0 select-none items-center justify-center overflow-hidden",
              "rounded-[10px] border border-border bg-background px-3 text-sm font-medium text-muted-foreground",
              "transition-all duration-200 ease-out active:scale-[0.97]",
              "hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted hover:text-foreground hover:shadow-sm",
              "outline-none focus-visible:ring-3 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
            aria-label="Courier settings"
          >
            <Settings2 className="size-3.5" />
          </Link>
        </motion.div>

        {/* Empty state */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 bg-muted/10 py-20 text-center"
        >
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
            <Truck className="size-8 text-muted-foreground/40" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-foreground">
            No Courier Connected
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
            Connect a courier service to start tracking shipments and managing deliveries.
          </p>
          <Link
            href="/dashboard/settings?tab=courier#courier-provider"
            className={cn(
              "mt-6 inline-flex h-10 items-center gap-2 rounded-[10px] bg-primary px-5 text-sm font-semibold text-primary-foreground",
              "transition-all duration-200 hover:opacity-90 active:scale-[0.97]",
            )}
          >
            <Settings2 className="size-4" />
            Configure Courier
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (error && activeStatuses.length === 0 && recentActivity.length === 0) {
    return (
      <motion.div
        className="space-y-5 lg:space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Truck className="size-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Courier
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Track and manage your courier deliveries.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className={cn(
                "group relative inline-flex h-9 shrink-0 select-none items-center justify-center gap-2 overflow-hidden",
                "rounded-[10px] border border-border bg-background px-3.5 text-sm font-medium text-muted-foreground",
                "transition-all duration-200 ease-out active:scale-[0.97]",
                "hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted hover:text-foreground hover:shadow-sm",
                "outline-none focus-visible:ring-3 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "disabled:pointer-events-none disabled:opacity-45",
              )}
              aria-label="Retry loading courier data"
            >
              <RefreshCw className="size-3.5" />
              <span className="relative z-10">Retry</span>
            </button>
          </div>
        </motion.div>

        {/* Error card */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 py-16 text-center"
        >
          <div className="flex size-16 items-center justify-center rounded-2xl bg-red-500/10">
            <AlertCircle className="size-8 text-red-500" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-foreground">
            Failed to Load Data
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-red-600/80">
            {error}
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(
              "mt-6 inline-flex h-10 items-center gap-2 rounded-[10px] bg-primary px-5 text-sm font-semibold text-primary-foreground",
              "transition-all duration-200 hover:opacity-90 active:scale-[0.97]",
            )}
          >
            {refreshing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Try Again
          </button>
        </motion.div>
      </motion.div>
    );
  }

  // ── Main dashboard content ─────────────────────────────────────
  return (
    <motion.div
      className="space-y-5 lg:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ══════════════════════════════════════════════════════════ */}
      {/* PAGE HEADER                                              */}
      {/* ══════════════════════════════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Truck className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Courier
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Track and manage your courier deliveries.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-xs text-muted-foreground">
              Last refreshed: {formatDateTime(lastRefreshed)}
            </span>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(
              "group relative inline-flex h-9 shrink-0 select-none items-center justify-center gap-2 overflow-hidden",
              "rounded-[10px] border border-border bg-background px-3.5 text-sm font-medium text-muted-foreground",
              "transition-all duration-200 ease-out active:scale-[0.97]",
              "hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted hover:text-foreground hover:shadow-sm",
              "outline-none focus-visible:ring-3 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:pointer-events-none disabled:opacity-45",
            )}
            aria-label="Refresh courier status"
          >
            {refreshing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            <span className="relative z-10">{refreshing ? "Refreshing" : "Refresh"}</span>
          </button>
          <Link
            href="/dashboard/settings?tab=courier#courier-provider"
            className={cn(
              "group relative inline-flex h-9 shrink-0 select-none items-center justify-center overflow-hidden",
              "rounded-[10px] border border-border bg-background px-3 text-sm font-medium text-muted-foreground",
              "transition-all duration-200 ease-out active:scale-[0.97]",
              "hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted hover:text-foreground hover:shadow-sm",
              "outline-none focus-visible:ring-3 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
            aria-label="Courier settings"
          >
            <Settings2 className="size-3.5" />
          </Link>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* HERO — CONNECTED COURIER + METRIC                        */}
      {/* ══════════════════════════════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-[20px] bg-hero p-5 text-hero-foreground shadow-lg shadow-hero/15 sm:p-6"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,var(--hero-accent),transparent_32%),radial-gradient(circle_at_90%_20%,color-mix(in_srgb,var(--brand-accent)_22%,transparent),transparent_28%)]" />
        <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(oklch(1_0_0_/_0.16)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0_/_0.16)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="relative z-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Courier identity */}
            <div className="flex items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-hero-foreground/10 backdrop-blur-sm">
                <Truck className="size-6 text-hero-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-success" />
                  <span className="text-sm font-medium text-hero-foreground/60">
                    Connected
                  </span>
                </div>
                <h2 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">
                  You&apos;re connected with{" "}
                  <span className="text-hero-foreground">{providerLabel || "Courier"}</span>
                </h2>
                <p className="mt-0.5 text-sm text-hero-foreground/60">
                  {apiStatuses.length > 0
                    ? `${apiStatuses.length} statuses available via API`
                    : "Orders tracked via local delivery records"}
                </p>
              </div>
            </div>

            {/* Right: Active Orders metric */}
            <div className="rounded-2xl border border-hero-foreground/10 bg-hero-foreground/[0.08] p-3.5 text-right backdrop-blur-sm sm:p-4">
              <p className="text-3xl font-bold tracking-tight text-hero-foreground tabular-nums">
                {activeOrders}
              </p>
              <p className="mt-1 text-xs font-medium text-hero-foreground/60">
                Active Orders
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TAB NAVIGATION — Underline style                          */}
      {/* ══════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <div role="tablist" className="flex w-full border-b border-border/40">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "orders"}
            onClick={() => setActiveTab("orders")}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200",
              "outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              activeTab === "orders"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/80",
            )}
          >
            <Truck className="size-4" />
            Orders
            {/* Active indicator */}
            <span
              className={cn(
                "absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary transition-all duration-200",
                activeTab === "orders" ? "opacity-100" : "opacity-0",
              )}
            />
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "finance"}
            onClick={() => setActiveTab("finance")}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200",
              "outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              activeTab === "finance"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground/80",
            )}
          >
            <FileText className="size-4" />
            Finance
            {/* Active indicator */}
            <span
              className={cn(
                "absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary transition-all duration-200",
                activeTab === "finance" ? "opacity-100" : "opacity-0",
              )}
            />
          </button>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* TAB CONTENT                                              */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "orders" && (
        <>
      {/* ══════════════════════════════════════════════════════════ */}
      {/* EVENT STATUS OVERVIEW                                     */}
      {/* ══════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Truck className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Courier Event Status
            </h2>
            <p className="text-sm text-muted-foreground">
              {statusBreakdown.length > 0
                ? "Current status distribution across all shipments"
                : "No shipments recorded yet. Dispatch an order via courier to see status updates."}
            </p>
          </div>
        </div>

        {activeStatuses.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {activeStatuses.map((status, index) => {
              const c = categoryStyle(status.category);
              const Icon = categoryIcon(status.category);
              const isHovered = hoveredCard === status.id;

              return (
                <motion.div
                  key={status.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="show"
                  onMouseEnter={() => setHoveredCard(status.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl glass-card p-3.5",
                    "transition-all duration-200 ease-out",
                    "hover:shadow-md hover:border-primary/15",
                    "active:scale-[0.97]",
                    "focus-visible:ring-3 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                >
                  {/* Hover glow */}
                  <span
                    className={cn(
                      "pointer-events-none absolute -right-16 -top-16 size-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500",
                      c.dot,
                      isHovered && "opacity-20",
                    )}
                  />

                  <div className="relative flex items-center gap-3">
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-all duration-200 group-hover:scale-105",
                        c.icon,
                      )}
                    >
                      <Icon className="size-[16px]" />
                    </div>

                    {/* Count + label */}
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-semibold tracking-tight text-foreground tabular-nums">
                        {status.count}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {status.label}
                      </p>
                    </div>
                  </div>

                  {/* Bottom accent bar on hover */}
                  <span
                    className={cn(
                      "pointer-events-none absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 transition-transform duration-300 ease-out",
                      c.dot,
                      isHovered && "scale-x-100",
                    )}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/30 bg-muted/5 py-12 text-center">
            <Package className="size-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground/70">
              No shipments yet
            </p>
          </div>
        )}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* RECENT ACTIVITY                                           */}
      {/* ══════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <div className="glass-card overflow-hidden rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <RefreshCw className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Recent Activity
                </h3>
                <p className="text-xs text-muted-foreground">
                  Latest courier status updates
                </p>
              </div>
            </div>


          </div>

          {recentActivity.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/20">
                      {["Order", "Customer", "Waybill", "Status", "Date"].map(
                        (heading) => (
                          <th
                            key={heading}
                            className={cn(
                              "px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                              heading === "Status" && "text-center",
                            )}
                          >
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {recentActivity.map((item, idx) => {
                      const cat = getCategoryForStatus(item.status, configRef.current.providerId);
                      const c = categoryStyle(cat);
                      return (
                        <tr
                          key={`${item.waybill}-${idx}`}
                          className="transition-colors hover:bg-muted/20"
                        >
                          <td className="px-5 py-3.5 font-semibold text-foreground">
                            #{item.orderNumber}
                          </td>
                          <td className="px-5 py-3.5 text-foreground">
                            {item.customerName}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                            {item.waybill}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                                c.badge,
                              )}
                            >
                              <span className={cn("size-1.5 rounded-full", c.dot)} />
                              {getDisplayStatusLabel(item.status, configRef.current.providerId)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {item.date}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y divide-border/30 sm:hidden">
                {recentActivity.map((item, idx) => {
                  const cat = getCategoryForStatus(item.status, configRef.current.providerId);
                  const Icon = categoryIcon(cat);
                  const c = categoryStyle(cat);
                  return (
                    <div
                      key={`${item.waybill}-${idx}`}
                      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/20"
                    >
                      <div
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-xl",
                          c.icon,
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            #{item.orderNumber}
                          </p>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              c.badge,
                            )}
                          >
                            {getDisplayStatusLabel(item.status, configRef.current.providerId)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[13px] text-muted-foreground">
                          {item.customerName} · {item.waybill} · {item.date}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>


            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="size-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground/70">
                No recent activity
              </p>
              <p className="text-xs text-muted-foreground/50">
                Dispatch an order to see activity here
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* STATUS STATISTICS TABLE                                   */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeStatuses.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="glass-card overflow-hidden rounded-2xl">
            {/* Header */}
            <div className="border-b border-border/50 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <PackageCheck className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Status Statistics
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Breakdown of orders by courier status
                  </p>
                </div>
              </div>
            </div>

            <>
            {/* Desktop Table */}
            <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/20">
                    {["Status", "Number of Orders", "Delivery Charge", "Ratio"].map((heading) => (
                      <th
                        key={heading}
                        className={cn(
                          "px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                          (heading === "Delivery Charge" || heading === "Ratio") && "text-right",
                        )}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {activeStatuses.map((status) => {
                    const c = categoryStyle(status.category);
                    const Icon = categoryIcon(status.category);
                    return (
                      <tr
                        key={status.id}
                        className="transition-colors hover:bg-muted/20"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={cn(
                                "flex size-8 items-center justify-center rounded-lg",
                                c.icon,
                              )}
                            >
                              <Icon className="size-4" />
                            </span>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {status.label}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                              c.badge,
                            )}
                          >
                            {status.count}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right font-medium tabular-nums text-foreground">
                          {status.deliveryCharge > 0
                            ? formatCurrency(status.deliveryCharge)
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                              <div
                                className={cn("h-full rounded-full", c.dot)}
                                style={{
                                  width: formatRatio(status.count),
                                }}
                              />
                            </div>
                            <span className="text-xs font-semibold tabular-nums text-foreground">
                              {formatRatio(status.count)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-border/30 sm:hidden">
              {activeStatuses.map((status) => {
                const c = categoryStyle(status.category);
                const Icon = categoryIcon(status.category);
                return (
                  <div
                    key={status.id}
                    className="flex items-center gap-3 px-4 py-3.5"
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl",
                        c.icon,
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">
                          {status.label}
                        </p>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-semibold",
                            c.badge,
                          )}
                        >
                          {status.count}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[13px] text-muted-foreground">
                        <span>
                          {status.deliveryCharge > 0
                            ? formatCurrency(status.deliveryCharge)
                            : "No charge"}
                        </span>
                        <span className="tabular-nums">
                          {formatRatio(status.count)}
                        </span>
                      </div>
                      {/* Mini progress bar */}
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", c.dot)}
                          style={{ width: formatRatio(status.count) }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            </>
          </div>
        </motion.div>
      )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* FINANCE TAB                                              */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "finance" && (
        <motion.div
          key="finance-tab"
          variants={itemVariants}
          initial="hidden"
          animate="show"
        >
          <CourierFinanceTab />
        </motion.div>
      )}
    </motion.div>
  );
}
