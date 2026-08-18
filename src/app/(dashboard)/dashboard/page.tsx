"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrdersSettings } from "@/stores/orders-settings-store";
import {
  AlertTriangle,
  Boxes,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  Layers3,
  LineChart,
  Minus,
  PackageCheck,
  ReceiptText,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Truck,
  Undo2,
  WalletCards,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useDashboardSession } from "@/providers/dashboard-session-provider";
import { cn } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getGreeting, formatCurrency } from "@/lib/formatters";
import { createRevenueFlow, summarizeBy, type RevenueWindow } from "@/lib/chart-utils";
import { dateFilterOptions, getDateRange } from "@/lib/date-utils";
import { HeroStatCard, type HeroStatTrendBadge } from "@/components/dashboard/hero-stat-card";
import { StatusListCard } from "@/components/dashboard/status-list-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MiniBarChart } from "@/components/charts/mini-bar-chart";
import { RankedBarList } from "@/components/charts/ranked-bar-list";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DateRangePickerModal } from "@/components/shared/lazy-date-range-picker-modal";
import { DashboardAdBanner } from "@/components/dashboard/dashboard-ad-banner";
import { useCourierStore } from "@/stores/courier-store";

interface PeriodTrend {
  ordersCurrent: number;
  ordersPrevious: number;
  newOrdersCurrent: number;
  newOrdersPrevious: number;
  profitCurrent: number;
  profitPrevious: number;
  pendingCurrent: number;
  pendingPrevious: number;
}

interface DashboardData {
  userName: string;
  stats: {
    newOrders: number;
    newOrdersValue: number;
    itemsToDispatch: number;
    totalOrders: number;
    netProfit: number;
    pendingPayments: number;
    openInvoices: number;
    scheduledDeliveries: number;
    lowStockAlerts: number;
    totalRevenue: number;
    totalExpenses: number;
    toDispatch: number;
    toBeDelivered: number;
    rescheduled: number;
    toBeReturned: number;
  };
  revenueFlow: Array<{ label: string; revenue: number; expenses: number }>;
  salesByCategory: Array<{ label: string; value: number }>;
  salesByItem: Array<{ label: string; value: number }>;
  lowStockItems: Array<{ name: string; current: number; minimum: number }>;
  ordersTrendBadge: HeroStatTrendBadge;
  newOrdersTrendBadge: HeroStatTrendBadge;
  profitTrendBadge: HeroStatTrendBadge;
  pendingTrendBadge: HeroStatTrendBadge;
  deliveryTotalCount: number;
  deliveryItems: Array<{
    id: string;
    orderNumber: string | null;
    customerName: string | null;
    status: string;
    source: 'delivery' | 'order';
  }>;
}

const revenueWindows: Array<{ label: string; value: RevenueWindow }> = [
  { label: "Last 7 days", value: "7d" },
  { label: "This month", value: "this_month" },
  { label: "Last month", value: "last_month" },
];

// ─── Animations ─────────────────────────────────────────────────────
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

// ─── Main Page ─────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const session = useDashboardSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // ─── Redirect to orders if set as default landing page ───
  useEffect(() => {
    const settings = useOrdersSettings.getState();
    if (settings.isDefaultLandingPage) {
      router.replace("/dashboard/orders");
    }
  }, [router]);
  const [dateFilter, setDateFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [revenueWindow, setRevenueWindow] = useState<RevenueWindow>("this_month");
  const prefersReducedMotion = useReducedMotion();
  const safeContainerVariants = prefersReducedMotion ? undefined : containerVariants;
  const safeItemVariants = prefersReducedMotion ? undefined : itemVariants;

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      try {
        const businessId = session.businessId;
        if (!businessId) {
          if (!cancelled) setLoading(false);
          return;
        }

        const supabase = createClient();
        const dateRange = getDateRange(dateFilter, dateFrom, dateTo);

        const [ordersRes, allOrdersRes, expensesRes, allExpensesRes, inventoryRes, deliveriesRes, orderItemsRes] =
          await Promise.all([
            (() => {
              let q = supabase
                .from("orders")
                .select("id, order_number, customer_name, total, balance_remaining, status, payment_status, expected_delivery_date, created_at",
                  { count: "exact" },
                )
                .eq("business_id", businessId)
                .order("created_at", { ascending: false })
                .limit(500);
              if (dateRange) q = q.gte("created_at", dateRange.start.toISOString()).lte("created_at", dateRange.end.toISOString());
              return q;
            })(),
            // All-time orders (ignores the date filter) — powers the hero cards
            // "New Orders" and "Pending Payments", plus the Delivery Status cards
            // and Scheduled Deliveries, which must always reflect totals.
            (() => {
              const q = supabase
                .from("orders")
                .select("id, order_number, customer_name, total, balance_remaining, status, payment_status, expected_delivery_date, created_at")
                .eq("business_id", businessId)
                .order("created_at", { ascending: false });
              return q;
            })(),
            (() => {
              let q = supabase
                .from("expenses")
                .select("total_cost, expense_date, category")
                .eq("business_id", businessId)
                .order("expense_date", { ascending: false })
                .limit(500);
              if (dateRange) q = q.gte("expense_date", dateRange.start.toISOString().slice(0, 10)).lte("expense_date", dateRange.end.toISOString().slice(0, 10));
              return q;
            })(),
            // All-time expenses (no date filter) — keeps the Net Profit
            // "vs last month" trend badge consistent with the all-time orders trends.
            supabase
              .from("expenses")
              .select("total_cost, expense_date, category")
              .eq("business_id", businessId)
              .order("expense_date", { ascending: false }),
            supabase
              .from("inventory_items")
              .select("name, current_stock, reorder_level")
              .eq("business_id", businessId)
              .limit(500),
            supabase
              .from("deliveries")
              .select("id, status")
              .eq("business_id", businessId)
              .limit(500),
            supabase
              .from("order_items")
              .select("product_name, category, total_price")
              .eq("business_id", businessId)
              .limit(500),
          ]);

        const orders = (ordersRes.data || []).map((order) => ({
          id: String(order.id),
          order_number: String(order.order_number),
          customer_name: String(order.customer_name || "Walk-in customer"),
          total: Number(order.total || 0),
          balance: Number(order.balance_remaining || 0),
          status: String(order.status || "new_order"),
          payment_status: String(order.payment_status || "pending"),
          expected_delivery_date: order.expected_delivery_date as string | null,
          created_at: String(order.created_at),
        }));

        // All-time order metrics (no date filter) — used by the "New Orders" and
        // "Pending Payments" hero cards, the Delivery Status cards, and Scheduled
        // Deliveries so they all show totals, not just the filter window.
        const allOrders = (allOrdersRes.data || []).map((order) => ({
          id: String(order.id),
          order_number: String(order.order_number),
          customer_name: String(order.customer_name || "Walk-in customer"),
          total: Number(order.total || 0),
          balance: Number(order.balance_remaining || 0),
          status: String(order.status || "new_order"),
          payment_status: String(order.payment_status || "pending"),
          expected_delivery_date: order.expected_delivery_date as string | null,
          created_at: String(order.created_at),
        }));

        const expenses = (expensesRes.data || []).map((expense) => ({
          amount: Number(expense.total_cost || 0),
          expense_date: String(expense.expense_date),
          category: String(expense.category || "other"),
        }));

        // All-time expenses (no date filter) — used for the month-over-month
        // trend comparison so "vs last month" is correct regardless of the filter.
        const allExpenses = (allExpensesRes.data || []).map((expense) => ({
          amount: Number(expense.total_cost || 0),
          expense_date: String(expense.expense_date),
        }));

        const inventory = (inventoryRes.data || []).map((item) => ({
          name: String(item.name),
          current: Number(item.current_stock || 0),
          minimum: Number(item.reorder_level || 0),
        }));

        const deliveries = deliveriesRes.data || [];
        const activeDeliveries = deliveries.filter(
          (d) => !["delivered", "cancelled", "returned"].includes(String(d.status)),
        );
        const orderItems = (orderItemsRes.data || []).map((item) => ({
          product_name: String(item.product_name || "Unnamed item"),
          category: String(item.category || "Uncategorized"),
          total: Number(item.total_price || 0),
        }));

        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const newOrdersValue = allOrders.filter((o) => o.status === "new_order").reduce((sum, o) => sum + o.total, 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const lowStockItems = inventory
          .filter((item) => item.current <= item.minimum);

        const toDispatch = allOrders.filter((o) => ["new_order", "ready", "packed"].includes(o.status)).length;

        // ── Courier counts: prefer cached MERGED breakdown from courier page ──
        // The courier page writes the merged/standardised breakdown (same data
        // the courier cards display) to the shared store. The dashboard reads
        // from there so counts match the courier page's cards exactly.
        // Fall back to direct DB query when the store has no data yet.
        const courierCached = useCourierStore.getState();
        const hasCourierData = courierCached.lastUpdated !== null;

        const toBeDelivered = hasCourierData
          ? courierCached.toBeDelivered
          : deliveries.filter(
              (d) => !["delivered", "cancelled", "returned"].includes(String(d.status)),
            ).length;

        const rescheduled = hasCourierData
          ? (courierCached.statusBreakdown.find((b) => b.id === "rescheduled")?.count ?? 0)
          : deliveries.filter((d) => String(d.status) === "confirmed").length;

        const toBeReturned = hasCourierData
          ? (courierCached.statusBreakdown.find((b) => b.id === "to_be_returned")?.count ?? 0)
          : deliveries.filter((d) => String(d.status) === "returned").length;

        // ─── Compute month-over-month trends (from ALL orders, so the
        //     "vs last month" badges on the hero cards are correct regardless
        //     of the page's date filter) ────────────────────────────
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        const inRange = (dateStr: string, start: Date, end: Date) => {
          const d = new Date(dateStr);
          return d >= start && d <= end;
        };

        const currentOrders = allOrders.filter((o) => inRange(o.created_at, thisMonthStart, new Date()));
        const previousOrders = allOrders.filter((o) => inRange(o.created_at, lastMonthStart, lastMonthEnd));
        const currentExpenses = allExpenses.filter((e) => inRange(e.expense_date + "T00:00:00", thisMonthStart, new Date()));
        const previousExpenses = allExpenses.filter((e) => inRange(e.expense_date + "T00:00:00", lastMonthStart, lastMonthEnd));

        const periodTrend: PeriodTrend = {
          ordersCurrent: currentOrders.length,
          ordersPrevious: previousOrders.length,
          newOrdersCurrent: currentOrders.filter((o) => o.status === "new_order").length,
          newOrdersPrevious: previousOrders.filter((o) => o.status === "new_order").length,
          profitCurrent:
            currentOrders.reduce((s, o) => s + o.total, 0) -
            currentExpenses.reduce((s, e) => s + e.amount, 0),
          profitPrevious:
            previousOrders.reduce((s, o) => s + o.total, 0) -
            previousExpenses.reduce((s, e) => s + e.amount, 0),
          pendingCurrent: currentOrders.filter((o) => o.payment_status !== "paid").length,
          pendingPrevious: previousOrders.filter((o) => o.payment_status !== "paid").length,
        };

        // ─── Build trend badge ────────────────────────────────────
        const buildTrendBadge = (
          current: number,
          previous: number,
          /** True for "lower is better" metrics (pending payments, low stock) */
          lowerIsBetter: boolean = false,
        ): HeroStatTrendBadge => {
          if (previous === 0 && current === 0) {
            return { percentage: "—", direction: "neutral", color: "neutral", label: "vs last month" };
          }
          if (previous === 0) {
            return {
              percentage: "+100%",
              direction: "up",
              color: lowerIsBetter ? "bad" : "good",
              label: "vs last month",
            };
          }

          const pct = ((current - previous) / Math.abs(previous)) * 100;
          const sign = pct > 0 ? "+" : "";
          const formatted = `${sign}${pct.toFixed(1)}%`;

          // Actual direction of change based on the percentage sign
          const direction: "up" | "down" | "neutral" = pct > 0 ? "up" : pct < 0 ? "down" : "neutral";

          // Color: is this change good or bad for the business?
          // For "higher is better": increase = good, decrease = bad
          // For "lower is better": increase = bad, decrease = good
          let color: "good" | "bad" | "neutral";
          if (pct === 0) {
            color = "neutral";
          } else if (lowerIsBetter) {
            color = pct < 0 ? "good" : "bad";
          } else {
            color = pct > 0 ? "good" : "bad";
          }

          return { percentage: formatted, direction, color, label: "vs last month" };
        };

        const openInvoicesCount = allOrders.filter(
          (order) => order.payment_status !== "paid",
        ).length;

        setData({
          userName: session.fullName || "there",
          stats: {
            newOrders: allOrders.filter((order) => order.status === "new_order").length,
            itemsToDispatch: orders.filter((order) => order.status === "packed").length,
            totalOrders: ordersRes.count || orders.length,
            netProfit: totalRevenue - totalExpenses,
            pendingPayments: allOrders
              .filter((order) => order.payment_status !== "paid")
              .reduce((sum, order) => sum + order.balance, 0),
            openInvoices: openInvoicesCount,
            scheduledDeliveries: activeDeliveries.length,
            lowStockAlerts: lowStockItems.length,
          newOrdersValue,
          totalRevenue,
          totalExpenses,
            toDispatch,
            toBeDelivered,
            rescheduled,
            toBeReturned,
          },
          ordersTrendBadge: buildTrendBadge(periodTrend.ordersCurrent, periodTrend.ordersPrevious),
          newOrdersTrendBadge: buildTrendBadge(periodTrend.newOrdersCurrent, periodTrend.newOrdersPrevious),
          profitTrendBadge: buildTrendBadge(periodTrend.profitCurrent, periodTrend.profitPrevious),
          pendingTrendBadge: buildTrendBadge(periodTrend.pendingCurrent, periodTrend.pendingPrevious, true),
          revenueFlow: createRevenueFlow(orders, expenses, revenueWindow),
          salesByCategory: summarizeBy(orderItems, (item) => item.category, (item) => item.total),
          salesByItem: summarizeBy(orderItems, (item) => item.product_name, (item) => item.total),
          lowStockItems,
          deliveryTotalCount: (() => {
            const today = new Date().toISOString().slice(0, 10);
            return allOrders              .filter((o) => o.expected_delivery_date && o.expected_delivery_date >= today && ['new_order', 'ready', 'packed'].includes(o.status))
              .length;
          })(),
          deliveryItems: (() => {
            const today = new Date().toISOString().slice(0, 10);
            return allOrders
              .filter((o) => o.expected_delivery_date && o.expected_delivery_date >= today && ['new_order', 'ready', 'packed'].includes(o.status))
              .map((o) => ({
                id: o.id,
                orderNumber: o.order_number,
                customerName: o.customer_name,
                status: 'scheduled' as const,
                source: 'order' as const,
              }))
              .slice(0, 3);
          })(),
        });
      } catch (error) {
        console.error("Dashboard fetch error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [dateFilter, dateFrom, dateTo, revenueWindow]);

  const heroMetrics = useMemo(() => {
    if (!data) return [];

    return [
      {
        label: "Total Orders",
        value: data.stats.totalOrders,
        icon: ReceiptText,
        trendBadge: data.ordersTrendBadge,
        href: "/dashboard/orders",
        secondary: (
          <span>
            Rev:{" "}
            <span className="font-medium text-hero-foreground/90 tabular-nums">
              {formatCurrency(data.stats.totalRevenue)}
            </span>
          </span>
        ),
      },
      {
        label: "New Orders",
        value: data.stats.newOrders,
        icon: ShoppingCart,
        href: "/dashboard/orders?status=new_order",
        secondary: (
          <span>
            Val:{" "}
            <span className="font-medium text-hero-foreground/90 tabular-nums">
              {formatCurrency(data.stats.newOrdersValue)}
            </span>
          </span>
        ),
      },
      {
        label: "Net Profit",
        value: formatCurrency(data.stats.netProfit),
        icon: LineChart,
        trendBadge: data.profitTrendBadge,
        secondary: (
          <div className="flex flex-col sm:flex-row sm:items-center gap-x-1.5 gap-y-0.5">
            <span>
              Sales:{" "}
              <span className="font-medium text-hero-foreground/90 tabular-nums">
                {formatCurrency(data.stats.totalRevenue)}
              </span>
            </span>
            <span className="hidden sm:inline text-hero-foreground/40">-</span>
            <span>
              Exp:{" "}
              <span className="font-medium text-hero-foreground/90 tabular-nums">
                {formatCurrency(data.stats.totalExpenses)}
              </span>
            </span>
          </div>
        ),
      },
      {
        label: "Pending Payments",
        value: formatCurrency(data.stats.pendingPayments),
        icon: WalletCards,
        href: "/dashboard/orders?payment_status=pending%2Cadvanced",
        secondary: `${data.stats.openInvoices} open invoices`,
      },
    ];
  }, [data]);

  const compactStats = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "To Dispatch",
        value: data.stats.toDispatch,
        icon: Truck,
        color: "bg-status-info-bg text-primary",
      },
      {
        label: "To Be Delivered",
        value: data.stats.toBeDelivered,
        icon: PackageCheck,
        color: "bg-status-success-bg text-success",
      },
      {
        label: "Rescheduled",
        value: data.stats.rescheduled,
        icon: CalendarClock,
        color: "bg-status-warning-bg text-warning",
      },
      {
        label: "To Be Returned",
        value: data.stats.toBeReturned,
        icon: Undo2,
        color: "bg-status-danger-bg text-destructive",
      },
    ];
  }, [data]);

  // ─── Compute card min-heights based on content ───────────────
  // Both empty → compact (50% lower). Grid stretch matches heights when one has items.
  const cardHeightClass =
    !data
      ? "min-h-[340px]"
      : data.deliveryTotalCount === 0 && data.lowStockItems.length === 0
        ? "min-h-[170px]"
        : "min-h-[340px]";

  if (loading) return <DashboardSkeleton />;

  if (!data) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="max-w-md rounded-3xl glass-card p-8 text-center">
          <AlertTriangle className="mx-auto size-10 text-warning" />
          <h1 className="mt-4 text-xl font-semibold">Unable to load dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Refresh the page or sign in again. If the problem continues, contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-4 lg:space-y-6"
      variants={safeContainerVariants}
      initial="hidden"
      animate="show"
    >
      <DashboardAdBanner />

      {/* ========================================================= */}
      {/* MOBILE HERO — compact greeting + metrics with hero bg     */}
      {/* ========================================================= */}
      <motion.section
        variants={safeItemVariants}
        className="lg:hidden relative overflow-hidden rounded-[20px] bg-hero p-4 text-hero-foreground shadow-lg shadow-hero/15"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,var(--hero-accent),transparent_32%),radial-gradient(circle_at_90%_20%,color-mix(in_srgb,var(--brand-accent)_22%,transparent),transparent_28%)]" />
        <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(oklch(1_0_0_/_0.16)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0_/_0.16)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="relative z-10">
          {/* Compact greeting row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold tracking-tight text-hero-foreground">
                {getGreeting()}, {data.userName.split(" ")[0]}
              </h1>
              <p className="mt-1 text-sm text-hero-foreground/70">
                Here&apos;s your business overview for today.
              </p>
            </div>

            {/* Date filter */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-hero-foreground/10 bg-hero-foreground/10 px-2.5 py-2 text-sm font-medium text-hero-foreground/80 transition-all hover:bg-hero-foreground/20 active:scale-95"
              >
                <CalendarDays className="size-4" />
                <span className="hidden sm:inline">
                  {dateFilterOptions.find((o) => o.value === dateFilter)?.label ?? "This month"}
                </span>
                <ChevronDown className="size-3.5 text-hero-foreground/50 transition-transform duration-200 group-data-[popup-open]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px] p-1.5">
                {dateFilterOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    className={cn(
                      "rounded-lg text-sm",
                      dateFilter === option.value && "bg-primary/10 font-semibold text-primary",
                    )}
                    onClick={() => {
                      if (option.value !== "custom") {
                        setDateFilter(option.value);
                        setDateFrom("");
                        setDateTo("");
                      } else {
                        setDatePickerOpen(true);
                      }
                    }}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>


          {/* 2×2 metric grid on phone & tablet */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
            {heroMetrics.map((metric) => {
              const Icon = metric.icon;
              const href = metric.href;
              const badge = metric.trendBadge;

              // Trend badge icon
              const trendIcon = badge
                ? badge.direction === "up"
                  ? <TrendingUp className="size-2.5 sm:size-[10px]" strokeWidth={2.5} />
                  : badge.direction === "down"
                    ? <TrendingDown className="size-2.5 sm:size-[10px]" strokeWidth={2.5} />
                    : <Minus className="size-2.5 sm:size-[10px]" strokeWidth={2.5} />
                : null;

              // Trend badge color
              const trendColor = badge
                ? badge.color === "good"
                  ? "text-success"
                  : badge.color === "bad"
                    ? "text-destructive"
                    : "text-muted-foreground/50"
                : "";

              return (
                <div
                  key={metric.label}
                  className={cn(
                    "flex flex-col justify-between rounded-2xl backdrop-blur-sm border border-hero-foreground/10 bg-hero-foreground/[0.08] p-2.5 sm:p-3.5 transition-all active:scale-[0.97]",
                    href && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  )}
                  onClick={() => href && router.push(href)}
                  role={href ? "button" : undefined}
                  tabIndex={href ? 0 : undefined}
                  aria-label={href ? metric.label : undefined}
                  onKeyDown={href ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(href); }} : undefined}
                >
                  <div>
                    {/* Top row: icon + label (left) + trend badge (right) */}
                    <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="flex size-6 sm:size-7 items-center justify-center rounded-lg bg-hero-foreground/10 shrink-0">
                          <Icon className="size-3 sm:size-3.5 text-hero-foreground/80" />
                        </div>
                        <span className="text-[11px] sm:text-xs font-medium text-hero-foreground/70 truncate">{metric.label}</span>
                      </div>
                      {badge && (
                        <div className="flex flex-col items-end gap-0 shrink-0 -mt-0.5">
                          <span className={cn("inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold", trendColor)}>
                            {trendIcon}
                            {badge.percentage}
                          </span>
                          <span className="text-[9px] sm:text-xs leading-none text-hero-foreground/70">{badge.label}</span>
                        </div>
                      )}
                    </div>

                    {/* Value row */}
                    <p className="text-base sm:text-xl font-bold tracking-tight text-hero-foreground tabular-nums leading-tight">
                      {metric.value}
                    </p>
                  </div>

                  {/* Secondary text */}
                  {metric.secondary && (
                    <div className="mt-1 text-[10px] sm:text-xs text-hero-foreground/60 leading-snug">
                      {metric.secondary}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ========================================================= */}
      {/* DESKTOP HERO — keep existing large hero card              */}
      {/* ========================================================= */}
      <motion.section
        variants={safeItemVariants}
        className="hidden lg:block relative overflow-hidden rounded-[32px] bg-hero p-6 text-hero-foreground shadow-2xl shadow-hero/15 lg:p-7"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,var(--hero-accent),transparent_32%),radial-gradient(circle_at_90%_20%,color-mix(in_srgb,var(--brand-accent)_22%,transparent),transparent_28%)]" />
        <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(oklch(1_0_0_/_0.16)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0_/_0.16)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="max-w-2xl text-2xl font-semibold tracking-tightest md:text-3xl">
                {getGreeting()}, {data.userName.split(" ")[0]}
              </h1>
              <p className="mt-2 text-sm text-hero-foreground/70">
                Here&apos;s your business overview for today.
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex shrink-0 items-center gap-2 rounded-xl border border-hero-foreground/10 bg-hero-foreground/5 px-3 py-2 text-sm font-medium text-hero-foreground/80 backdrop-blur-xs transition-all hover:bg-hero-foreground/10"
              >
                <CalendarDays className="size-4" />
                {dateFilterOptions.find((o) => o.value === dateFilter)?.label ?? "This month"}
                <ChevronDown className="size-3.5 text-hero-foreground/50 transition-transform duration-200 group-data-[popup-open]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px] p-1.5">
                {dateFilterOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    className={cn(
                      "rounded-lg text-sm",
                      dateFilter === option.value && "bg-primary/10 font-semibold text-primary",
                    )}
                    onClick={() => {
                      if (option.value !== "custom") {
                        setDateFilter(option.value);
                        setDateFrom("");
                        setDateTo("");
                      } else {
                        setDatePickerOpen(true);
                      }
                    }}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>


          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {heroMetrics.map((metric) => (
              <HeroStatCard key={metric.label} {...metric} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ========================================================= */}
      {/* DELIVERY STATUS OVERVIEW                                   */}
      {/* ========================================================= */}
      <motion.section variants={safeItemVariants}>
        <div className="mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Truck className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Delivery Status
              </h2>
              <p className="text-sm text-muted-foreground">
                Overview of your order fulfilment and courier deliveries
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {compactStats.map((stat) => (
            <StatsCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              iconColor={stat.color}
              compact
            />
          ))}
        </div>
      </motion.section>

      {/* ========================================================= */}
      {/* SCHEDULED DELIVERIES + LOW STOCK ALERTS                   */}
      {/* ========================================================= */}

      {/* Mobile: content-driven height */}
      <motion.section
        variants={safeItemVariants}
        className="lg:hidden space-y-4"
      >
        <StatusListCard
          title="Scheduled Deliveries"
          icon={Truck}
          count={data.deliveryTotalCount}
          footerLink="/dashboard/orders?delivery_status=scheduled"
          footerLabel={`View all ${data.deliveryTotalCount} scheduled deliver${data.deliveryTotalCount === 1 ? "y" : "ies"}`}
          overflowLabel={`${data.deliveryTotalCount - 3} more scheduled ${data.deliveryTotalCount - 3 === 1 ? "delivery" : "deliveries"}`}
          activeColorClass="text-primary"
          activeBgClass="bg-status-info-bg"
          emptyMessage="No scheduled deliveries"
          emptyHelperText="Upcoming deliveries will appear here."
        >
          {data.deliveryItems.map((delivery) => (
            <div
              key={`${delivery.source}-${delivery.id}`}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (delivery.source === 'order' && delivery.orderNumber) {
                  router.push(`/dashboard/orders?search=${encodeURIComponent(delivery.orderNumber)}`);
                } else {
                  router.push(`/dashboard/orders?delivery_status=scheduled`);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (delivery.source === 'order' && delivery.orderNumber) {
                    router.push(`/dashboard/orders?search=${encodeURIComponent(delivery.orderNumber)}`);
                  } else {
                    router.push(`/dashboard/orders?delivery_status=scheduled`);
                  }
                }
              }}
              className="flex h-[52px] cursor-pointer items-center justify-between gap-2 rounded-xl glass-card px-3 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              <div className="min-w-0 flex-1">
                {delivery.source === 'order' ? (
                  <>
                    <p className="truncate text-sm font-medium text-foreground">
                      Order #{delivery.orderNumber}
                    </p>
                    <p className="text-sm text-muted-foreground/70 truncate">
                      {delivery.customerName}
                    </p>
                  </>
                ) : (
                  <p className="truncate text-sm font-medium text-foreground">
                    Delivery #{delivery.id.slice(0, 8)}
                  </p>
                )}
              </div>
              <span className={cn(
                "rounded-full px-2 py-0.5 text-sm font-semibold whitespace-nowrap shrink-0",
                delivery.status === "scheduled" && "bg-status-info-bg text-primary",
                delivery.status === "confirmed" && "bg-status-info-bg text-primary",
                delivery.status === "to_dispatch" && "bg-status-warning-bg text-warning",
                delivery.status === "in_branch" && "bg-status-info-bg text-primary",
                delivery.status === "assigned_to_rider" && "bg-status-info-bg text-primary",
                !["scheduled", "confirmed", "to_dispatch", "in_branch", "assigned_to_rider"].includes(delivery.status) && "bg-status-neutral-bg text-muted-foreground",
              )}>
                {delivery.source === 'order' ? 'Scheduled' : delivery.status.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </StatusListCard>

        <StatusListCard
          title="Low Stock Alerts"
          icon={AlertTriangle}
          count={data.lowStockItems.length}
          footerLink="/dashboard/inventory?status=low_stock"
          footerLabel={`View all ${data.lowStockItems.length} alert${data.lowStockItems.length === 1 ? "" : "s"}`}
          overflowLabel={`${data.lowStockItems.length - 3} more alert${data.lowStockItems.length - 3 === 1 ? "" : "s"}`}
          activeColorClass="text-destructive"
          activeBgClass="bg-status-danger-bg"
          emptyMessage="All stock levels are healthy"
          emptyHelperText="All items are in stock."
        >
          {data.lowStockItems.slice(0, 3).map((item, idx) => (
            <div
              key={`low-stock-${idx}`}
              className="flex h-[52px] items-center justify-between gap-2 rounded-xl glass-card px-3 transition-colors hover:bg-muted/30"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.current} / {item.minimum} min
                </p>
              </div>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-status-danger-bg">
                <AlertTriangle className="size-3.5 text-destructive" />
              </div>
            </div>
          ))}
        </StatusListCard>
      </motion.section>

      {/* Desktop: side-by-side with min-height */}
      <motion.section
        variants={safeItemVariants}
        className="hidden lg:grid gap-5 md:grid-cols-2"
      >
        <motion.div variants={safeItemVariants}>
          <StatusListCard
            title="Scheduled Deliveries"
            icon={Truck}
            count={data.deliveryTotalCount}
            footerLink="/dashboard/orders?delivery_status=scheduled"
            footerLabel={`View all ${data.deliveryTotalCount} scheduled deliver${data.deliveryTotalCount === 1 ? "y" : "ies"}`}
            overflowLabel={`${data.deliveryTotalCount - 3} more scheduled ${data.deliveryTotalCount - 3 === 1 ? "delivery" : "deliveries"}`}
            activeColorClass="text-primary"
            activeBgClass="bg-status-info-bg"
            emptyMessage="No scheduled deliveries"
            emptyHelperText="Upcoming deliveries will appear here."
            containerClassName={cardHeightClass}
          >
            {data.deliveryItems.map((delivery) => (
              <div
                key={`${delivery.source}-${delivery.id}`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (delivery.source === 'order' && delivery.orderNumber) {
                    router.push(`/dashboard/orders?search=${encodeURIComponent(delivery.orderNumber)}`);
                  } else {
                    router.push(`/dashboard/orders?delivery_status=scheduled`);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (delivery.source === 'order' && delivery.orderNumber) {
                      router.push(`/dashboard/orders?search=${encodeURIComponent(delivery.orderNumber)}`);
                    } else {
                      router.push(`/dashboard/orders?delivery_status=scheduled`);
                    }
                  }
                }}
                className="flex h-[52px] cursor-pointer items-center justify-between gap-2 rounded-xl glass-card px-3 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
              >
                <div className="min-w-0 flex-1">
                  {delivery.source === 'order' ? (
                    <>
                      <p className="truncate text-sm font-medium text-foreground">
                        Order #{delivery.orderNumber}
                      </p>
                      <p className="text-sm text-muted-foreground/70 truncate">
                        {delivery.customerName}
                      </p>
                    </>
                  ) : (
                    <p className="truncate text-sm font-medium text-foreground">
                      Delivery #{delivery.id.slice(0, 8)}
                    </p>
                  )}
                </div>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-sm font-semibold whitespace-nowrap shrink-0",
                  delivery.status === "scheduled" && "bg-status-info-bg text-primary",
                  delivery.status === "confirmed" && "bg-status-info-bg text-primary",
                  delivery.status === "to_dispatch" && "bg-status-warning-bg text-warning",
                  delivery.status === "in_branch" && "bg-status-info-bg text-primary",
                  delivery.status === "assigned_to_rider" && "bg-status-info-bg text-primary",
                  !["scheduled", "confirmed", "to_dispatch", "in_branch", "assigned_to_rider"].includes(delivery.status) && "bg-status-neutral-bg text-muted-foreground",
                )}>
                  {delivery.source === 'order' ? 'Scheduled' : delivery.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </StatusListCard>
        </motion.div>

        <motion.div variants={safeItemVariants}>
          <StatusListCard
            title="Low Stock Alerts"
            icon={AlertTriangle}
            count={data.lowStockItems.length}
            footerLink="/dashboard/inventory?status=low_stock"
            footerLabel={`View all ${data.lowStockItems.length} alert${data.lowStockItems.length === 1 ? "" : "s"}`}
            overflowLabel={`${data.lowStockItems.length - 3} more alert${data.lowStockItems.length - 3 === 1 ? "" : "s"}`}
            activeColorClass="text-destructive"
            activeBgClass="bg-status-danger-bg"
            emptyMessage="All stock levels are healthy"
            emptyHelperText="All items are in stock."
            containerClassName={cardHeightClass}
          >
            {data.lowStockItems.slice(0, 3).map((item, idx) => (
              <div
                key={`low-stock-${idx}`}
                className="flex h-[52px] items-center justify-between gap-2 rounded-xl glass-card px-3 transition-colors hover:bg-muted/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.current} / {item.minimum} min
                  </p>
                </div>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-status-danger-bg">
                  <AlertTriangle className="size-3.5 text-destructive" />
                </div>
              </div>
            ))}
          </StatusListCard>
        </motion.div>
      </motion.section>

      {/* ========================================================= */}
      {/* BUSINESS INSIGHTS                                           */}
      {/* ========================================================= */}

      {/* Mobile: tabs for Revenue / Top Sales */}
      <motion.section variants={safeItemVariants} className="lg:hidden">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">
            Business Insights
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Revenue trends and sales performance
          </p>
        </div>

        <Tabs defaultValue="revenue" className="w-full">
          <TabsList variant="line" className="mb-4 w-full justify-start gap-4">
            <TabsTrigger value="revenue" className="flex-1 text-sm">
              <LineChart className="mr-1.5 size-3.5" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex-1 text-sm">
              <Boxes className="mr-1.5 size-3.5" />
              Top Sales
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="mt-0">
            <div className="rounded-3xl glass-card overflow-hidden">
              <div className="border-b border-border/50 px-5 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
                      <LineChart className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Revenue Overview
                      </p>
                      <p className="text-xl font-bold tracking-tight text-foreground">
                        {formatCurrency(data.stats.totalRevenue)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-1.5">
                  {revenueWindows.map((window) => (
                    <button
                      key={window.value}
                      type="button"
                      onClick={() => setRevenueWindow(window.value)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
                        revenueWindow === window.value
                          ? "bg-foreground text-background shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                      )}
                    >
                      {window.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-4">
                <MiniBarChart data={data.revenueFlow} />

                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/40 pt-3.5 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2.5 rounded-sm bg-revenue" />
                    Revenue
                    <span className="font-semibold text-foreground">{formatCurrency(data.stats.totalRevenue)}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2.5 rounded-sm bg-expense" />
                    Expenses
                    <span className="font-semibold text-foreground">{formatCurrency(data.stats.totalExpenses)}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2.5 rounded-sm bg-net-profit" />
                    Net Profit
                    <span className="font-semibold text-foreground">{formatCurrency(data.stats.netProfit)}</span>
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="mt-0">
            <div className="rounded-3xl glass-card overflow-hidden">
              <div className="border-b border-border/50 px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-status-success-bg">
                    <Boxes className="size-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Top Sales
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Best performing categories and products
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-4">
                <Tabs defaultValue="category">
                  <TabsList variant="line" className="mb-4 w-full justify-start gap-3">
                    <TabsTrigger value="category" className="flex-1 text-sm">
                      <Layers3 className="mr-1.5 size-3.5" />
                      Category
                    </TabsTrigger>
                    <TabsTrigger value="item" className="flex-1 text-sm">
                      <Boxes className="mr-1.5 size-3.5" />
                      Item
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="category">
                    <RankedBarList data={data.salesByCategory} />
                  </TabsContent>
                  <TabsContent value="item">
                    <RankedBarList data={data.salesByItem} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.section>

      {/* Desktop: side-by-side revenue + top sales */}
      <motion.section variants={safeItemVariants} className="hidden lg:block">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Business Insights
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Revenue trends and sales performance
            </p>
          </div>
        </div>

        <section className="grid gap-5 md:grid-cols-2">
          <motion.div
            variants={safeItemVariants}
            className="rounded-3xl glass-card overflow-hidden"
          >
            <div className="border-b border-border/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                    <LineChart className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Revenue Overview
                    </p>
                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      {formatCurrency(data.stats.totalRevenue)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex gap-1.5">
                {revenueWindows.map((window) => (
                  <button
                    key={window.value}
                    type="button"
                    onClick={() => setRevenueWindow(window.value)}
                    className={cn(
                      "rounded-full px-3 py-1 text-sm font-semibold transition-all",
                      revenueWindow === window.value
                        ? "bg-foreground text-background shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                    )}
                  >
                    {window.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-5">
              <MiniBarChart data={data.revenueFlow} />

              <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border/40 pt-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-revenue" />
                  Revenue
                  <span className="font-semibold text-foreground">{formatCurrency(data.stats.totalRevenue)}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-expense" />
                  Expenses
                  <span className="font-semibold text-foreground">{formatCurrency(data.stats.totalExpenses)}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-net-profit" />
                  Net Profit
                  <span className="font-semibold text-foreground">{formatCurrency(data.stats.netProfit)}</span>
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={safeItemVariants}
            className="rounded-3xl glass-card overflow-hidden"
          >
            <div className="border-b border-border/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-status-success-bg">
                  <Boxes className="size-4 text-success" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Top Sales
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Best performing categories and products
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              <Tabs defaultValue="category">
                <TabsList variant="line" className="mb-4 w-full justify-start gap-3">
                  <TabsTrigger value="category" className="flex-1 text-sm">
                    <Layers3 className="mr-1.5 size-3.5" />
                    Category
                  </TabsTrigger>
                  <TabsTrigger value="item" className="flex-1 text-sm">
                    <Boxes className="mr-1.5 size-3.5" />
                    Item
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="category">
                  <RankedBarList data={data.salesByCategory} />
                </TabsContent>
                <TabsContent value="item">
                  <RankedBarList data={data.salesByItem} />
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </section>
      </motion.section>

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
  );
}
