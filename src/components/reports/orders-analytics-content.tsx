"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Ban,
  BarChart3,
  CircleDollarSign,
  Clock,
  Crown,
  Globe,
  Layers3,
  MapPin,
  Package,
  PartyPopper,
  ReceiptText,
  Repeat2,
  RotateCcw,
  TrendingUp,
  Undo2,
  Users,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { cn, formatEnumLabel } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { getDateRange, dateFilterOptions } from "@/lib/date-utils";
import { HeroStatCard, type HeroStatTrendBadge } from "@/components/dashboard/hero-stat-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RankedBarList } from "@/components/charts/ranked-bar-list";
import { DonutChart } from "@/components/charts/donut-chart";
import { SectionCard } from "@/components/reports/section-card";
import { Dropdown } from "@/components/ui/dropdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { summarizeBy } from "@/lib/chart-utils";

// ─── Animations ────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

// ─── Types ─────────────────────────────────────────────────────────

interface OrderItem {
  product_name: string;
  category: string | null;
  total_price: number;
  quantity: number;
}

interface RawOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_district: string | null;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
  dispatched_date: string | null;
}

interface RawCustomer {
  id: string;
  name: string;
  phone: string | null;
  lifetime_spend: number;
  total_orders: number;
}

interface LogEntry {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  date: string;
}

// ─── Helpers ───────────────────────────────────────────────────────

import { formatDate } from "@/lib/formatters";

const statusBadgeColors: Record<string, string> = {
  cancelled: "bg-status-danger-bg text-destructive",
  returned: "bg-pink-500/10 text-pink-500",
};

// ─── Order Volume Trend Bar Chart ──────────────────────────────────
function OrderVolumeBarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const maxValue = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
          <BarChart3 className="size-5 text-muted-foreground/60" />
        </div>
        <p className="text-sm text-muted-foreground">No order volume data available.</p>
      </div>
    );
  }

  return (
    <div className="flex h-44 items-end gap-3 px-2">
      {data.map((row, index) => (
        <motion.div
          key={`vol-bar-${index}`}
          className="flex flex-1 flex-col items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.04 }}
        >
          <div className="flex h-36 w-full items-end justify-center">
            <motion.div
              className="w-full max-w-[36px] rounded-lg bg-gradient-to-t from-primary/70 to-primary/40 transition-all duration-300 hover:from-primary hover:to-primary/70"
              style={{ height: `${Math.max(6, (row.value / maxValue) * 100)}%` }}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(6, (row.value / maxValue) * 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.04 }}
              title={`${row.label}: ${row.value} orders`}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {row.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Top Customer Row ──────────────────────────────────────────────
function TopCustomerRow({
  rank,
  customer,
}: {
  rank: number;
  customer: RawCustomer;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.05 }}
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/30"
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold tabular-nums",
          rank === 0
            ? "bg-warning/15 text-warning"
            : rank === 1
              ? "bg-muted text-muted-foreground"
              : rank === 2
                ? "bg-warning/15 text-warning"
                : "bg-muted text-muted-foreground",
        )}
      >
        {rank === 0 ? (
          <Crown className="size-3.5" />
        ) : (
          rank + 1
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {customer.name}
        </p>
        <p className="text-sm text-muted-foreground">
          {customer.total_orders} order{customer.total_orders !== 1 ? "s" : ""}
          {customer.phone && (
            <>
              <span className="mx-1.5 text-muted-foreground/30">·</span>
              {customer.phone}
            </>
          )}
        </p>
      </div>

      <span className="text-sm font-semibold tabular-nums text-foreground">
        {formatCurrency(customer.lifetime_spend)}
      </span>
    </motion.div>
  );
}

// ─── Log Row (for returned/cancelled) ──────────────────────────────
function LogTableRow({ entry }: { entry: LogEntry }) {
  return (
    <TableRow className="group transition-colors hover:bg-muted/20">
      <TableCell className="py-3">
        <div className="flex items-center gap-2">
          {entry.status === "cancelled" ? (
            <Ban className="size-3.5 text-destructive shrink-0" />
          ) : (
            <Undo2 className="size-3.5 text-pink-500 shrink-0" />
          )}
          <span className="text-sm font-semibold text-foreground">
            {entry.order_number}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-3">
        <span className="text-sm text-foreground/80">{entry.customer_name}</span>
      </TableCell>
      <TableCell className="py-3">
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {formatCurrency(entry.total)}
        </span>
      </TableCell>
      <TableCell className="py-3">
        <Badge
          className={cn(
            "rounded-full px-2.5 py-0.5 text-sm font-semibold whitespace-nowrap",
            statusBadgeColors[entry.status] ?? "text-muted-foreground",
          )}
          variant="ghost"
        >
          {formatEnumLabel(entry.status)}
        </Badge>
      </TableCell>
      <TableCell className="py-3 text-sm text-muted-foreground tabular-nums">
        {formatDate(entry.date)}
      </TableCell>
    </TableRow>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════

export function OrdersAnalyticsContent() {
  const prefersReducedMotion = useReducedMotion();
  const safeContainerVariants = prefersReducedMotion ? undefined : containerVariants;
  const safeItemVariants = prefersReducedMotion ? undefined : itemVariants;

  // ─── State ─────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>("this_month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [customMode, setCustomMode] = useState(false);

  const [orders, setOrders] = useState<RawOrder[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customers, setCustomers] = useState<RawCustomer[]>([]);

  // ─── Data Fetching ─────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          window.location.replace("/login?redirect=/dashboard/reports");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("business_id")
          .eq("user_id", session.user.id)
          .single();

        const businessId = (profile as { business_id: string | null } | null)?.business_id;
        if (!businessId) throw new Error("No business found for your account.");

        const dateRange = getDateRange(dateFilter, dateFrom, dateTo);

        let ordersQuery = supabase
          .from("orders")
          .select("id, order_number, customer_name, customer_district, total, status, payment_status, created_at, dispatched_date")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false })
          .limit(500);

        if (dateRange) {
          ordersQuery = ordersQuery
            .gte("created_at", dateRange.start.toISOString())
            .lte("created_at", dateRange.end.toISOString());
        }

        let itemsQuery;
        if (dateRange) {
          const { data: orderIdsInRange } = await supabase
            .from("orders")
            .select("id")
            .eq("business_id", businessId)
            .gte("created_at", dateRange.start.toISOString())
            .lte("created_at", dateRange.end.toISOString())
            .limit(500);

          const ids = (orderIdsInRange || []).map((o) => String(o.id));

          itemsQuery = ids.length > 0
            ? supabase
                .from("order_items")
                .select("product_name, category, total_price, quantity")
                .eq("business_id", businessId)
                .in("order_id", ids)
                .limit(500)
            : { data: [] };
        } else {
          itemsQuery = supabase
            .from("order_items")
            .select("product_name, category, total_price, quantity")
            .eq("business_id", businessId)
            .limit(500);
        }

        const customersQuery = supabase
          .from("customers")
          .select("id, name, phone, lifetime_spend, total_orders")
          .eq("business_id", businessId)
          .order("lifetime_spend", { ascending: false })
          .limit(20);

        const [ordersRes, itemsRes, customersRes] = await Promise.all([
          ordersQuery,
          itemsQuery,
          customersQuery,
        ]);

        if (ordersRes.error) throw new Error(ordersRes.error.message);

        setOrders(
          (ordersRes.data || []).map((o) => ({
            id: String(o.id),
            order_number: String(o.order_number),
            customer_name: String(o.customer_name || "Walk-in customer"),
            customer_district: o.customer_district ? String(o.customer_district) : null,
            total: Number(o.total || 0),
            status: String(o.status || "new_order"),
            payment_status: String(o.payment_status || "pending"),
            created_at: String(o.created_at),
            dispatched_date: o.dispatched_date ? String(o.dispatched_date) : null,
          })),
        );

        setOrderItems(
          (itemsRes.data || []).map((item) => ({
            product_name: String(item.product_name || "Unnamed item"),
            category: item.category ? String(item.category) : null,
            total_price: Number(item.total_price || 0),
            quantity: Number(item.quantity || 0),
          })),
        );

        setCustomers(
          (customersRes.data || []).map((c) => ({
            id: String(c.id),
            name: String(c.name),
            phone: c.phone ? String(c.phone) : null,
            lifetime_spend: Number(c.lifetime_spend || 0),
            total_orders: Number(c.total_orders || 0),
          })),
        );
      } catch (error) {
        console.error("Reports fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateFilter, dateFrom, dateTo]);

  // ─── Derived Metrics ───────────────────────────────────────────
  const totalOrders = orders.length;

  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + o.total, 0),
    [orders],
  );

  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const trends = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const currentOrders = orders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= thisMonthStart && d <= now;
    });

    const previousOrders = orders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= lastMonthStart && d <= lastMonthEnd;
    });

    const currentTotal = currentOrders.reduce((s, o) => s + o.total, 0);
    const previousTotal = previousOrders.reduce((s, o) => s + o.total, 0);

    const buildBadge = (
      current: number,
      previous: number,
    ): HeroStatTrendBadge => {
      if (previous === 0 && current === 0) {
        return { percentage: "—", direction: "neutral", color: "neutral", label: "vs last month" };
      }
      if (previous === 0) {
        return { percentage: "+100%", direction: "up", color: "good", label: "vs last month" };
      }
      const pct = ((current - previous) / Math.abs(previous)) * 100;
      const sign = pct > 0 ? "+" : "";
      const formatted = `${sign}${pct.toFixed(1)}%`;
      const direction = pct > 0 ? "up" : pct < 0 ? "down" : "neutral";
      const color = pct > 0 ? "good" : pct < 0 ? "bad" : "neutral";
      return { percentage: formatted, direction, color, label: "vs last month" };
    };

    return {
      ordersBadge: buildBadge(currentOrders.length, previousOrders.length),
      aovBadge: buildBadge(
        currentOrders.length > 0 ? currentTotal / currentOrders.length : 0,
        previousOrders.length > 0 ? previousTotal / previousOrders.length : 0,
      ),
    };
  }, [orders]);

  const topDistrict = useMemo(() => {
    const districtCounts = new Map<string, number>();
    orders.forEach((o) => {
      if (o.customer_district) {
        districtCounts.set(o.customer_district, (districtCounts.get(o.customer_district) || 0) + 1);
      }
    });
    const sorted = [...districtCounts.entries()].sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? { name: sorted[0][0], count: sorted[0][1] } : null;
  }, [orders]);

  const avgProcessingHours = useMemo(() => {
    const dispatchedOrders = orders.filter((o) => o.dispatched_date && o.status !== "cancelled" && o.status !== "returned");
    if (dispatchedOrders.length === 0) return null;

    const totalHours = dispatchedOrders.reduce((sum, o) => {
      const created = new Date(o.created_at).getTime();
      const dispatched = new Date(o.dispatched_date!).getTime();
      return sum + (dispatched - created) / (1000 * 60 * 60);
    }, 0);

    return Math.round(totalHours / dispatchedOrders.length);
  }, [orders]);

  const repeatCustomerRate = useMemo(() => {
    const customerOrderCount = new Map<string, number>();
    orders.forEach((o) => {
      customerOrderCount.set(o.customer_name, (customerOrderCount.get(o.customer_name) || 0) + 1);
    });

    const uniqueCustomers = customerOrderCount.size;
    if (uniqueCustomers === 0) return null;

    const repeatCustomers = [...customerOrderCount.values()].filter((c) => c > 1).length;
    return Math.round((repeatCustomers / uniqueCustomers) * 100);
  }, [orders]);

  const salesByCategory = useMemo(
    () => summarizeBy(orderItems, (item) => item.category || "Uncategorized", (item) => item.total_price),
    [orderItems],
  );

  const topProducts = useMemo(
    () => summarizeBy(orderItems, (item) => item.product_name, (item) => item.quantity),
    [orderItems],
  );

  const cancelledReturnedLog = useMemo(
    () =>
      orders
        .filter((o) => o.status === "cancelled" || o.status === "returned")
        .map((o) => ({
          id: o.id,
          order_number: o.order_number,
          customer_name: o.customer_name,
          total: o.total,
          status: o.status,
          date: o.created_at,
        }))
        .slice(0, 20),
    [orders],
  );

  const orderVolumeTrend = useMemo(() => {
    const monthlyCounts = new Map<string, number>();

    orders.forEach((o) => {
      const key = o.created_at.slice(0, 7);
      monthlyCounts.set(key, (monthlyCounts.get(key) || 0) + 1);
    });

    return Array.from(monthlyCounts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, value]) => {
        const [year, month] = key.split("-");
        const date = new Date(Number(year), Number(month) - 1);
        return {
          label: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
          value,
        };
      });
  }, [orders]);

  const topDistricts = useMemo(() => {
    const districtMap = new Map<string, number>();
    orders.forEach((o) => {
      if (o.customer_district) {
        districtMap.set(o.customer_district, (districtMap.get(o.customer_district) || 0) + 1);
      }
    });

    return Array.from(districtMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, value]) => ({ label, value }));
  }, [orders]);

  const orderStatusDistribution = useMemo(
    () => summarizeBy(orders, (o) => formatEnumLabel(o.status), () => 1),
    [orders],
  );

  const handleDateChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      if (value === "custom") {
        setCustomMode(true);
      } else {
        setCustomMode(false);
        setDateFilter(value);
      }
    },
    [],
  );

  const handleCalendarClick = useCallback(() => {
    if (customMode) {
      setCustomMode(false);
      setDateFilter("this_month");
      setDateFrom("");
      setDateTo("");
    } else {
      setCustomMode(true);
      setDateFilter("custom");
    }
  }, [customMode]);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-6 w-52 animate-pulse rounded-lg bg-muted/60" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted/60" />
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-muted/40" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/40" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-3xl bg-muted/40" />
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl bg-muted/40" />
          ))}
        </div>
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl bg-muted/40" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-3xl bg-muted/40" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-4 sm:space-y-6"
      variants={safeContainerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ─── Date Filters Row ─────────────────────────────────── */}
      <motion.div
        variants={safeItemVariants}
        className="flex items-center justify-end gap-2"
      >
        {!customMode ? (
          <Dropdown
            value={dateFilter}
            onChange={handleDateChange}
            options={dateFilterOptions.map((o) => ({ value: o.value, label: o.label }))}
            label="Period"
            size="default"
            className="min-w-[130px] h-9 text-sm"
          />
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">From</span>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 w-[140px] rounded-xl border border-input bg-background px-3 text-sm font-medium text-foreground shadow-xs outline-none transition-colors focus:border-ring focus:ring-[3px] focus:ring-ring/50 [color-scheme:light] dark:[color-scheme:dark]" aria-label="From date" />
            </div>
            <span className="text-sm text-muted-foreground">—</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">To</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="h-9 w-[140px] rounded-xl border border-input bg-background px-3 text-sm font-medium text-foreground shadow-xs outline-none transition-colors focus:border-ring focus:ring-[3px] focus:ring-ring/50 [color-scheme:light] dark:[color-scheme:dark]" aria-label="To date" />
            </div>
            <button type="button" onClick={handleCalendarClick}
              className="inline-flex h-9 items-center rounded-xl border border-input bg-background px-3 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground active:scale-95">Done</button>
          </div>
        )}
      </motion.div>

      {/* ─── Hero Cards: Total Orders + AOV ────────────────────── */}    <motion.div
      variants={safeItemVariants}
      className="relative overflow-hidden rounded-2xl sm:rounded-[32px] bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent p-4 sm:p-6 md:p-7 ring-1 ring-primary/10"
    >
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(oklch(1_0_0_/_0.12)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0_/_0.12)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="relative z-10">
          <div className="mb-3 sm:mb-4 flex items-center gap-2.5">
            <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg sm:rounded-xl bg-primary/15">
              <BarChart3 className="size-3.5 sm:size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-foreground">Order Performance</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Key metrics at a glance</p>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            <HeroStatCard
              label="Total Orders"
              value={totalOrders}
              icon={ReceiptText}
              trendBadge={trends.ordersBadge}
              variant="flat"
              secondary={
                <span className="text-sm text-muted-foreground/80">
                  Revenue: <span className="font-semibold text-foreground">{formatCurrency(totalRevenue)}</span>
                </span>
              }
            />
            <HeroStatCard
              label="Average Order Value (AOV)"
              value={formatCurrency(aov)}
              icon={CircleDollarSign}
              trendBadge={trends.aovBadge}
              variant="flat"
              secondary={
                <span className="text-sm text-muted-foreground/80">
                  Based on <span className="font-semibold text-foreground">{totalOrders}</span> order{totalOrders !== 1 ? "s" : ""}
                </span>
              }
            />
          </div>
        </div>
      </motion.div>

      {/* ─── Compact Stats: Top District + Avg Processing + Repeat Rate ── */}
      <motion.div
        variants={safeItemVariants}
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        <StatsCard
          label="Top District"
          value={topDistrict ? `${topDistrict.name} (${topDistrict.count})` : "—"}
          icon={MapPin}
          iconColor="bg-status-info-bg text-primary"
          compact
        />
        <StatsCard
          label="Avg Processing Time"
          value={avgProcessingHours !== null ? `${avgProcessingHours}h` : "—"}
          icon={Clock}
          iconColor="bg-status-warning-bg text-warning"
          compact
        />
        <StatsCard
          label="Repeat Customer Rate"
          value={repeatCustomerRate !== null ? `${repeatCustomerRate}%` : "—"}
          icon={Repeat2}
          iconColor="bg-status-success-bg text-success"
          compact
        />
      </motion.div>

      {/* ─── Order Volume Trend ────────────────────────────────── */}
      <motion.div variants={safeItemVariants}>
        <SectionCard
          icon={TrendingUp}
          title="Order Volume Trend"
          description="Monthly order count over time"
        >
          <OrderVolumeBarChart data={orderVolumeTrend} />

          {orderVolumeTrend.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border/40 pt-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-primary/60" />
                Orders
                <span className="font-semibold text-foreground">{totalOrders}</span>
              </span>
              <span>
                Avg:{" "}
                <span className="font-semibold text-foreground">
                  {orderVolumeTrend.length > 0
                    ? Math.round(totalOrders / orderVolumeTrend.length)
                    : 0}
                </span>
                /month
              </span>
            </div>
          )}
        </SectionCard>
      </motion.div>

      {/* ─── Category Breakdown + Top Products ─────────────────── */}
      <motion.div
        variants={safeItemVariants}
        className="grid gap-4 sm:gap-5 md:grid-cols-2"
      >
        <SectionCard
          icon={Layers3}
          title="Category Breakdown"
          description="Sales distribution across categories"
        >
          <DonutChart data={salesByCategory} />
        </SectionCard>
        <SectionCard
          icon={Package}
          title="Top Selling Products"
          description="Best performing items by quantity sold"
        >
          {topProducts.length > 0 ? (
            <RankedBarList data={topProducts} />
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                <Package className="size-5 text-muted-foreground/60" />
              </div>
              <p className="text-sm text-muted-foreground">No product data available.</p>
            </div>
          )}
        </SectionCard>
      </motion.div>

      {/* ─── Top 10 Districts + Order Status Distribution ──────── */}
      <motion.div
        variants={safeItemVariants}
        className="grid gap-4 sm:gap-5 md:grid-cols-2"
      >
        <SectionCard
          icon={Globe}
          title="Top 10 Districts"
          description="Highest order volume by district"
        >
          {topDistricts.length > 0 ? (
            <RankedBarList data={topDistricts} />
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                <MapPin className="size-5 text-muted-foreground/60" />
              </div>
              <p className="text-sm text-muted-foreground">No district data available.</p>
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={Layers3}
          title="Order Status Distribution"
          description="Breakdown of orders by current status"
        >
          <DonutChart data={orderStatusDistribution} size={140} strokeWidth={24} />
        </SectionCard>
      </motion.div>

      {/* ─── Returned / Cancelled Orders Log ───────────────────── */}
      <motion.div variants={safeItemVariants}>
        <div className="rounded-2xl sm:rounded-3xl glass-card overflow-hidden">
          <div className="border-b border-border/50 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="flex size-8 sm:size-9 items-center justify-center rounded-lg sm:rounded-xl bg-status-danger-bg shrink-0">
                  <RotateCcw className="size-3.5 sm:size-4 text-destructive" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    Returned / Cancelled Orders Log
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {cancelledReturnedLog.length > 0
                      ? `Showing the most recent ${cancelledReturnedLog.length} entries`
                      : "No cancelled or returned orders in this period"}
                  </p>
                </div>
              </div>
              {cancelledReturnedLog.length > 0 && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-status-danger-bg px-2 py-1 text-xs sm:text-sm font-semibold text-destructive">
                    <Ban className="size-2.5 sm:size-3" />
                    {orders.filter((o) => o.status === "cancelled").length}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-pink-500/10 px-2 py-1 text-xs sm:text-sm font-semibold text-pink-500">
                    <Undo2 className="size-2.5 sm:size-3" />
                    {orders.filter((o) => o.status === "returned").length}
                  </span>
                </div>
              )}
            </div>
          </div>

          {cancelledReturnedLog.length > 0 ? (
            <div className="px-4 sm:px-6 py-2 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Order No</TableHead>
                    <TableHead className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Customer</TableHead>
                    <TableHead className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                    <TableHead className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cancelledReturnedLog.map((entry) => (
                    <LogTableRow key={entry.id} entry={entry} />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-status-success-bg">
                <PartyPopper className="size-6 text-success" />
              </div>
              <p className="text-sm font-semibold text-foreground">No issues to report</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                There are no cancelled or returned orders in the selected period. Everything is running smoothly!
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ─── Top Customers List ────────────────────────────────── */}
      <motion.div variants={safeItemVariants}>
        <SectionCard
          icon={Users}
          title="Top Customers"
          description="Highest spending customers by total purchase value"
        >
          {customers.length > 0 ? (
            <div className="space-y-0.5">
              {customers.slice(0, 10).map((customer, i) => (
                <TopCustomerRow key={customer.id} rank={i} customer={customer} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                <Users className="size-5 text-muted-foreground/60" />
              </div>
              <p className="text-sm text-muted-foreground">No customer data available.</p>
            </div>
          )}

          {customers.length > 10 && (
            <div className="mt-3 border-t border-border/40 pt-3 text-center">
              <p className="text-sm text-muted-foreground">Showing top 10 of {customers.length} customers</p>
            </div>
          )}
        </SectionCard>
      </motion.div>
    </motion.div>
  );
}
