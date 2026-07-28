"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarClock,
  Clock,
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
import type { CourierDashboardData, CourierStatusBreakdown, CourierRecentActivity } from "@/lib/delivery/types";

// ─── Status colour/icon mapper ───────────────────────────────────

interface StatusStyle {
  bg: string;
  text: string;
  dot: string;
  icon: string;
  badge: string;
}

function guessStatusStyle(statusName: string): StatusStyle {
  const n = statusName.toLowerCase();

  if (n.includes("deliver") || n.includes("complete")) {
    return {
      bg: "bg-emerald-500/8",
      text: "text-emerald-500",
      dot: "bg-emerald-500",
      icon: "bg-emerald-500/10 text-emerald-500",
      badge: "bg-emerald-500/10 text-emerald-500",
    };
  }
  if (n.includes("transit") || n.includes("dispatch") || n.includes("dispatched")) {
    return {
      bg: "bg-blue-500/8",
      text: "text-blue-500",
      dot: "bg-blue-500",
      icon: "bg-blue-500/10 text-blue-500",
      badge: "bg-blue-500/10 text-blue-500",
    };
  }
  if (n.includes("confirm")) {
    return {
      bg: "bg-sky-500/8",
      text: "text-sky-500",
      dot: "bg-sky-500",
      icon: "bg-sky-500/10 text-sky-500",
      badge: "bg-sky-500/10 text-sky-500",
    };
  }
  if (n.includes("pick") || n.includes("collected")) {
    return {
      bg: "bg-teal-500/8",
      text: "text-teal-500",
      dot: "bg-teal-500",
      icon: "bg-teal-500/10 text-teal-500",
      badge: "bg-teal-500/10 text-teal-500",
    };
  }
  if (n.includes("out") || n.includes("rider") || n.includes("assign")) {
    return {
      bg: "bg-indigo-500/8",
      text: "text-indigo-500",
      dot: "bg-indigo-500",
      icon: "bg-indigo-500/10 text-indigo-500",
      badge: "bg-indigo-500/10 text-indigo-500",
    };
  }
  if (n.includes("reschedule") || n.includes("hold")) {
    return {
      bg: "bg-amber-500/8",
      text: "text-amber-500",
      dot: "bg-amber-500",
      icon: "bg-amber-500/10 text-amber-500",
      badge: "bg-amber-500/10 text-amber-500",
    };
  }
  if (n.includes("return") || n.includes("rto")) {
    return {
      bg: "bg-orange-500/8",
      text: "text-orange-500",
      dot: "bg-orange-500",
      icon: "bg-orange-500/10 text-orange-500",
      badge: "bg-orange-500/10 text-orange-500",
    };
  }
  if (n.includes("cancel") || n.includes("fail")) {
    return {
      bg: "bg-red-500/8",
      text: "text-red-500",
      dot: "bg-red-500",
      icon: "bg-red-500/10 text-red-500",
      badge: "bg-red-500/10 text-red-500",
    };
  }

  // Default
  return {
    bg: "bg-slate-500/8",
    text: "text-slate-500",
    dot: "bg-slate-500",
    icon: "bg-slate-500/10 text-slate-500",
    badge: "bg-slate-500/10 text-slate-500",
  };
}

function guessStatusIcon(statusName: string): typeof Truck {
  const n = statusName.toLowerCase();

  if (n.includes("deliver") || n.includes("complete")) return PackageCheck;
  if (n.includes("transit") || n.includes("dispatch") || n.includes("dispatched")) return Truck;
  if (n.includes("confirm")) return PackageCheck;
  if (n.includes("pick") || n.includes("collected")) return Package;
  if (n.includes("out") || n.includes("rider") || n.includes("assign")) return MapPin;
  if (n.includes("reschedule") || n.includes("hold")) return CalendarClock;
  if (n.includes("return") || n.includes("rto")) return Undo2;
  if (n.includes("cancel") || n.includes("fail")) return X;

  return Clock;
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

const formatCurrency = (amount: number) =>
  "Rs. " + amount.toLocaleString("en-LK");

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
}

async function fetchLocalDeliveryStats(
  businessId: string,
  providerId: string,
): Promise<LocalDeliveryStats> {
  const supabase = createClient();

  // ── 1. Fetch deliveries for this courier ──────────────────────
  const { data: deliveries } = await supabase
    .from("deliveries")
    .select("id, waybill_id, courier, courier_charge, status, created_at, order_id")
    .eq("business_id", businessId)
    .eq("courier", providerId)
    .order("created_at", { ascending: false });

  const existingOrderIds = new Set((deliveries || []).map((d) => d.order_id).filter(Boolean));

  // ── 2. Also fetch orders that have waybill_id but no delivery record ──
  const { data: ordersWithWaybills } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, waybill_id, created_at, status, delivery_charge")
    .eq("business_id", businessId)
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
  for (const d of deliveries || []) {
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
    return { breakdown: [], recentActivity: [], totalOrders: 0, totalDeliveryCharge: 0 };
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
  const deliveryOrderIds = (deliveries || [])
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
    const matchingDelivery = (deliveries || []).find(
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

  return { breakdown, recentActivity, totalOrders, totalDeliveryCharge };
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function CourierPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const [providerLabel, setProviderLabel] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [statusBreakdown, setStatusBreakdown] = useState<CourierStatusBreakdown[]>([]);
  const [recentActivity, setRecentActivity] = useState<CourierRecentActivity[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalDeliveryCharge, setTotalDeliveryCharge] = useState(0);
  const [apiStatuses, setApiStatuses] = useState<CourierStatusBreakdown[]>([]);

  // Refs to persist config across re-renders
  const configRef = useRef<{ providerId: string | null; credentials: Record<string, string> }>({
    providerId: null,
    credentials: {},
  });

  // ── Fetch all data ─────────────────────────────────────────────
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const config = await loadCourierConfig();
      if (!config?.provider) {
        setProviderLabel(null);
        setConnected(false);
        setStatusBreakdown([]);
        setRecentActivity([]);
        setTotalOrders(0);
        setTotalDeliveryCharge(0);
        setApiStatuses([]);
        configRef.current = { providerId: null, credentials: {} };
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

      // 1. Sync delivery statuses from the courier API → local deliveries table
      //    This fetches the latest tracking status for each waybill from Curfox
      //    and updates our local records so the dashboard shows fresh data.
      await syncDeliveryStatuses(
        profile.business_id,
        config.credentials,
        config.provider,
      );

      // 2. Try fetching dashboard data from the provider API
      const provider = getProvider(config.provider);
      let dashboardData: CourierDashboardData | null = null;

      if (provider?.fetchDashboard) {
        try {
          dashboardData = await provider.fetchDashboard(config.credentials);
          setApiStatuses(dashboardData.statusBreakdown || []);
        } catch (err) {
          console.error("Provider dashboard fetch failed:", err);
          // Non-critical — we still have local data
          setApiStatuses([]);
        }
      }

      // 3. Fetch local delivery stats for real counts
      const localStats = await fetchLocalDeliveryStats(profile.business_id, config.provider);

      setStatusBreakdown(localStats.breakdown);
      setRecentActivity(localStats.recentActivity);
      setTotalOrders(localStats.totalOrders);
      setTotalDeliveryCharge(localStats.totalDeliveryCharge);
    } catch (err) {
      console.error("Failed to load courier data:", err);
      setError(err instanceof Error ? err.message : "Failed to load courier data");
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  // ── Load on mount ──────────────────────────────────────────────
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Handle refresh ─────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // ── Active statuses to display ─────────────────────────────────
  const activeStatuses = useMemo(() => {
    // If we have local breakdown, use it; otherwise fall back to API statuses
    if (statusBreakdown.length > 0) return statusBreakdown;
    return apiStatuses;
  }, [statusBreakdown, apiStatuses]);

  const formatRatio = useCallback(
    (count: number) => {
      if (totalOrders === 0) return "0%";
      return ((count / totalOrders) * 100).toFixed(1) + "%";
    },
    [totalOrders],
  );

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-24"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <Loader2 className="size-8 animate-spin text-muted-foreground/40" />
        <p className="mt-4 text-sm text-muted-foreground">
          Loading courier data...
        </p>
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
            aria-label="Refresh courier status"
          >
            {refreshing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            <span className="relative z-10">Refresh</span>
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

            {/* Right: Orders metric */}
            <div className="rounded-2xl border border-hero-foreground/10 bg-hero-foreground/[0.08] p-3.5 backdrop-blur-sm sm:p-4">
              <p className="text-xs font-medium text-hero-foreground/60">
                Total Orders
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-hero-foreground tabular-nums">
                {totalOrders}
              </p>
              <p className="mt-0.5 text-xs text-hero-foreground/50">
                {totalDeliveryCharge > 0
                  ? `${formatCurrency(totalDeliveryCharge)} total delivery charges`
                  : "No deliveries recorded yet"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

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
              const c = guessStatusStyle(status.label);
              const Icon = guessStatusIcon(status.label);
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
                    "group relative overflow-hidden rounded-xl border border-border/30 p-4",
                    "transition-all duration-200 ease-out",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    "active:scale-[0.98]",
                    "focus-visible:ring-3 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    c.bg,
                  )}
                >
                  {/* Hover glow */}
                  <span
                    className={cn(
                      "pointer-events-none absolute -right-12 -top-12 size-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500",
                      c.dot,
                      isHovered && "opacity-20",
                    )}
                  />

                  {/* Top: Icon + Count Badge */}
                  <div className="flex items-start justify-between">
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl ring-1 ring-inset transition-all duration-200 group-hover:scale-105",
                        c.icon,
                      )}
                    >
                      <Icon className="size-[18px]" />
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
                        c.badge,
                      )}
                    >
                      {status.count}{" "}
                      {status.count === 1 ? "order" : "orders"}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mt-4">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("size-2 rounded-full", c.dot)} />
                      <p className="text-base font-semibold text-foreground">
                        {status.label}
                      </p>
                    </div>
                    {status.deliveryCharge > 0 && (
                      <p className="mt-1.5 text-[13px] leading-[1.5] text-muted-foreground">
                        {formatCurrency(status.deliveryCharge)} delivery charge
                      </p>
                    )}
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

            {recentActivity.length > 0 && (
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="group flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-sm font-medium text-primary transition-all hover:bg-primary/5"
              >
                <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
                Refresh
              </button>
            )}
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
                      const c = guessStatusStyle(item.status);
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
                              {item.status}
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
                  const Icon = guessStatusIcon(item.status);
                  const c = guessStatusStyle(item.status);
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
                            {item.status}
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

              {/* Footer */}
              <div className="border-t border-border/50">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex h-11 w-full items-center justify-center gap-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/5 active:bg-primary/10 disabled:opacity-50"
                >
                  {refreshing ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="size-3.5" />
                  )}
                  {refreshing ? "Updating..." : "Refresh Status"}
                </button>
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
                    const c = guessStatusStyle(status.label);
                    const Icon = guessStatusIcon(status.label);
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
                const c = guessStatusStyle(status.label);
                const Icon = guessStatusIcon(status.label);
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
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
