"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  BarChart3,
  CircleDollarSign,
  Landmark,
  ReceiptText,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-media-query";
import { motion, useReducedMotion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { getDateRange, dateFilterOptions } from "@/lib/date-utils";
import { HeroStatCard, type HeroStatTrendBadge } from "@/components/dashboard/hero-stat-card";
import { RankedBarList } from "@/components/charts/ranked-bar-list";
import { MiniBarChart } from "@/components/charts/mini-bar-chart";
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

interface RawOrder {
  id: string;
  total: number;
  status: string;
  order_source: string | null;
  created_at: string;
}

interface RawExpense {
  id: string;
  total_cost: number;
  expense_date: string;
}

// ─── Money Flow Bar (dual bar for a single time period) ────────────
function MoneyFlowChart({ data }: { data: Array<{ label: string; revenue: number; expenses: number }> }) {
  const maxValue = Math.max(1, ...data.flatMap((d) => [d.revenue, d.expenses]));

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
          <Landmark className="size-5 text-muted-foreground/60" />
        </div>
        <p className="text-sm text-muted-foreground">No financial data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {data.map((row, index) => {
        const revPct = Math.max(6, (row.revenue / maxValue) * 100);
        const expPct = Math.max(6, (row.expenses / maxValue) * 100);
        return (
          <motion.div
            key={`money-${index}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{row.label}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                <span className="text-success font-semibold">{formatCurrency(row.revenue)}</span>
                <span className="mx-1.5 text-muted-foreground/40">vs</span>
                <span className="text-destructive font-semibold">{formatCurrency(row.expenses)}</span>
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-success to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${revPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.06 }}
              />
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-destructive to-rose-400"
                initial={{ width: 0 }}
                animate={{ width: `${expPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.06 + 0.15 }}
              />
            </div>
          </motion.div>
        );
      })}

      <div className="flex flex-wrap items-center gap-4 border-t border-border/40 pt-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-success" /> Revenue
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-destructive" /> Expenses
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-primary" /> Net Profit
        </span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════

export function FinancialPerformanceContent() {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const safeContainerVariants = prefersReducedMotion ? undefined : containerVariants;
  const safeItemVariants = prefersReducedMotion ? undefined : itemVariants;

  // ─── State ─────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>("this_month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [customMode, setCustomMode] = useState(false);

  const [orders, setOrders] = useState<RawOrder[]>([]);
  const [expenses, setExpenses] = useState<RawExpense[]>([]);

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
          .select("id, total, status, order_source, created_at")
          .eq("business_id", businessId)
          .order("created_at", { ascending: false })
          .limit(500);

        if (dateRange) {
          ordersQuery = ordersQuery
            .gte("created_at", dateRange.start.toISOString())
            .lte("created_at", dateRange.end.toISOString());
        }

        let expensesQuery = supabase
          .from("expenses")
          .select("id, total_cost, expense_date")
          .eq("business_id", businessId)
          .order("expense_date", { ascending: false })
          .limit(500);

        if (dateRange) {
          expensesQuery = expensesQuery
            .gte("expense_date", dateRange.start.toISOString().slice(0, 10))
            .lte("expense_date", dateRange.end.toISOString().slice(0, 10));
        }

        const [ordersRes, expensesRes] = await Promise.all([ordersQuery, expensesQuery]);

        if (ordersRes.error) throw new Error(ordersRes.error.message);

        setOrders(
          (ordersRes.data || []).map((o) => ({
            id: String(o.id),
            total: Number(o.total || 0),
            status: String(o.status || "new_order"),
            order_source: o.order_source ? String(o.order_source) : null,
            created_at: String(o.created_at),
          })),
        );

        setExpenses(
          (expensesRes.data || []).map((e) => ({
            id: String(e.id),
            total_cost: Number(e.total_cost || 0),
            expense_date: String(e.expense_date),
          })),
        );
      } catch (error) {
        console.error("Financial performance fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateFilter, dateFrom, dateTo]);

  // ─── Derived Metrics ───────────────────────────────────────────
  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + o.total, 0),
    [orders],
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + e.total_cost, 0),
    [expenses],
  );

  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const orderCount = orders.length;
  const expenseCount = expenses.length;

  const trends = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const inRangeOrders = (dateStr: string, start: Date, end: Date) => {
      const d = new Date(dateStr);
      return d >= start && d <= end;
    };

    const inRangeExpenses = (dateStr: string, start: Date, end: Date) => {
      const d = new Date(dateStr + "T00:00:00");
      return d >= start && d <= end;
    };

    const currOrders = orders.filter((o) => inRangeOrders(o.created_at, thisMonthStart, now));
    const prevOrders = orders.filter((o) => inRangeOrders(o.created_at, lastMonthStart, lastMonthEnd));
    const currExpenses = expenses.filter((e) => inRangeExpenses(e.expense_date, thisMonthStart, now));
    const prevExpenses = expenses.filter((e) => inRangeExpenses(e.expense_date, lastMonthStart, lastMonthEnd));

    const currRevenue = currOrders.reduce((s, o) => s + o.total, 0);
    const prevRevenue = prevOrders.reduce((s, o) => s + o.total, 0);
    const currCost = currExpenses.reduce((s, e) => s + e.total_cost, 0);
    const prevCost = prevExpenses.reduce((s, e) => s + e.total_cost, 0);
    const currProfit = currRevenue - currCost;
    const prevProfit = prevRevenue - prevCost;

    const buildBadge = (
      current: number,
      previous: number,
      lowerIsBetter = false,
    ): HeroStatTrendBadge => {
      if (previous === 0 && current === 0) {
        return { percentage: "—", direction: "neutral", color: "neutral", label: "vs last month" };
      }
      if (previous === 0) {
        return { percentage: "+100%", direction: "up", color: lowerIsBetter ? "bad" : "good", label: "vs last month" };
      }
      const pct = ((current - previous) / Math.abs(previous)) * 100;
      const sign = pct > 0 ? "+" : "";
      let color: "good" | "bad" | "neutral";
      if (pct === 0) {
        color = "neutral";
      } else if (lowerIsBetter) {
        color = pct < 0 ? "good" : "bad";
      } else {
        color = pct > 0 ? "good" : "bad";
      }
      return {
        percentage: `${sign}${pct.toFixed(1)}%`,
        direction: pct > 0 ? "up" : pct < 0 ? "down" : "neutral",
        color,
        label: "vs last month",
      };
    };

    return {
      revenueBadge: buildBadge(currRevenue, prevRevenue),
      expensesBadge: buildBadge(currCost, prevCost, true),
      profitBadge: buildBadge(currProfit, prevProfit),
    };
  }, [orders, expenses]);

  const monthlyGrowthRate = useMemo(() => {
    const revenueByMonth = new Map<string, number>();
    const expensesByMonth = new Map<string, number>();

    orders.forEach((o) => {
      const key = o.created_at.slice(0, 7);
      revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + o.total);
    });

    expenses.forEach((e) => {
      const key = e.expense_date.slice(0, 7);
      expensesByMonth.set(key, (expensesByMonth.get(key) || 0) + e.total_cost);
    });

    const allMonths = new Set([...revenueByMonth.keys(), ...expensesByMonth.keys()]);
    const sortedMonths = [...allMonths].sort();

    if (sortedMonths.length < 2) return null;

    const latestMonth = sortedMonths[sortedMonths.length - 1];
    const previousMonth = sortedMonths[sortedMonths.length - 2];

    const latestRevenue = revenueByMonth.get(latestMonth) || 0;
    const latestExpenses = expensesByMonth.get(latestMonth) || 0;
    const prevRevenue = revenueByMonth.get(previousMonth) || 0;
    const prevExpenses = expensesByMonth.get(previousMonth) || 0;

    const latestProfit = latestRevenue - latestExpenses;
    const prevProfit = prevRevenue - prevExpenses;

    if (prevProfit === 0) return latestProfit > 0 ? 100 : 0;
    return ((latestProfit - prevProfit) / Math.abs(prevProfit)) * 100;
  }, [orders, expenses]);

  const profitTrend = useMemo(() => {
    const monthlyMap = new Map<string, { revenue: number; expenses: number }>();

    orders.forEach((o) => {
      const key = o.created_at.slice(0, 7);
      const prev = monthlyMap.get(key) || { revenue: 0, expenses: 0 };
      prev.revenue += o.total;
      monthlyMap.set(key, prev);
    });

    expenses.forEach((e) => {
      const key = e.expense_date.slice(0, 7);
      const prev = monthlyMap.get(key) || { revenue: 0, expenses: 0 };
      prev.expenses += e.total_cost;
      monthlyMap.set(key, prev);
    });

    return Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([key, val]) => {
        const [year, month] = key.split("-");
        const date = new Date(Number(year), Number(month) - 1);
        return {
          label: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
          revenue: val.revenue,
          expenses: val.expenses,
        };
      });
  }, [orders, expenses]);

  const moneyFlow = profitTrend;

  const profitBySource = useMemo(() => {
    const revenueBySource = new Map<string, number>();
    orders.forEach((o) => {
      const source = o.order_source || "ad";
      revenueBySource.set(source, (revenueBySource.get(source) || 0) + o.total);
    });

    const totalRev = totalRevenue || 1;

    return Array.from(revenueBySource.entries())
      .map(([source, rev]) => {
        const share = rev / totalRev;
        const allocatedExpenses = totalExpenses * share;
        const profit = rev - allocatedExpenses;
        return {
          label: source,
          value: Math.round(profit),
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [orders, totalRevenue, totalExpenses]);

  const monthlyBreakdown = useMemo(() => {
    const monthlyMap = new Map<string, { revenue: number; expenses: number; orders: number }>();

    orders.forEach((o) => {
      const key = o.created_at.slice(0, 7);
      const prev = monthlyMap.get(key) || { revenue: 0, expenses: 0, orders: 0 };
      prev.revenue += o.total;
      prev.orders += 1;
      monthlyMap.set(key, prev);
    });

    expenses.forEach((e) => {
      const key = e.expense_date.slice(0, 7);
      const prev = monthlyMap.get(key) || { revenue: 0, expenses: 0, orders: 0 };
      prev.expenses += e.total_cost;
      monthlyMap.set(key, prev);
    });

    return Array.from(monthlyMap.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 12)
      .map(([key, val]) => {
        const [year, month] = key.split("-");
        const date = new Date(Number(year), Number(month) - 1);
        const profit = val.revenue - val.expenses;
        const margin = val.revenue > 0 ? (profit / val.revenue) * 100 : 0;
        return {
          month: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          orders: val.orders,
          revenue: val.revenue,
          expenses: val.expenses,
          profit,
          margin,
        };
      });
  }, [orders, expenses]);

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
        <div className="h-6 w-56 animate-pulse rounded-lg bg-muted/60" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted/60" />
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-muted/40" />
          ))}
        </div>
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl bg-muted/40" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-3xl bg-muted/40" />
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

      {/* ─── Hero Section: Revenue vs Cost vs Expenses + Net Profit ── */}
      <motion.div
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
              <h2 className="text-sm sm:text-base font-semibold text-foreground">Financial Overview</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Key financial metrics for the selected period</p>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <HeroStatCard
              label="Revenue"
              value={formatCurrency(totalRevenue)}
              icon={TrendingUp}
              trendBadge={trends.revenueBadge}
              variant="flat"
              secondary={<span className="text-sm text-muted-foreground/80">{orderCount} order{orderCount !== 1 ? "s" : ""}</span>}
            />
            <HeroStatCard
              label="Total Expenses"
              value={formatCurrency(totalExpenses)}
              icon={TrendingDown}
              trendBadge={trends.expensesBadge}
              variant="flat"
              secondary={<span className="text-sm text-muted-foreground/80">{expenseCount} expense{expenseCount !== 1 ? "s" : ""}</span>}
            />
            <HeroStatCard
              label="Net Profit"
              value={formatCurrency(netProfit)}
              icon={CircleDollarSign}
              trendBadge={trends.profitBadge}
              variant="flat"
              secondary={
                <span className={cn("text-sm", netProfit >= 0 ? "text-success" : "text-destructive")}>
                  {profitMargin >= 0 ? "Profit" : "Loss"} margin: <span className="font-semibold">{profitMargin.toFixed(1)}%</span>
                </span>
              }
            />
            <HeroStatCard
              label="Monthly Growth Rate"
              value={monthlyGrowthRate !== null ? `${monthlyGrowthRate >= 0 ? "+" : ""}${monthlyGrowthRate.toFixed(1)}%` : "—"}
              icon={BadgePercent}
              variant="flat"
              trendBadge={{
                percentage: monthlyGrowthRate !== null && monthlyGrowthRate >= 0 ? "Growing" : "Declining",
                direction: monthlyGrowthRate !== null && monthlyGrowthRate >= 0 ? "up" : "down",
                color: monthlyGrowthRate !== null && monthlyGrowthRate >= 0 ? "good" : "bad",
                label: "month over month",
              }}
              secondary={<span className="text-sm text-muted-foreground/80">Profit growth rate</span>}
            />
          </div>
        </div>
      </motion.div>

      {/* ─── Profit Trend + Money Flow ──────────────────────────── */}
      <motion.div
        variants={safeItemVariants}
        className="grid gap-4 sm:gap-5 md:grid-cols-2"
      >
        <SectionCard
          icon={TrendingUp}
          title="Profit Trend"
          description="Revenue vs Expenses vs Net Profit over time"
        >
          {profitTrend.length > 0 ? (
            <MiniBarChart data={profitTrend} />
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                <TrendingUp className="size-5 text-muted-foreground/60" />
              </div>
              <p className="text-sm text-muted-foreground">No trend data available.</p>
            </div>
          )}

          {profitTrend.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border/40 pt-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-success" />
                Revenue: <span className="font-semibold text-foreground">{formatCurrency(totalRevenue)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-destructive" />
                Expenses: <span className="font-semibold text-foreground">{formatCurrency(totalExpenses)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-primary" />
                Net Profit: <span className="font-semibold text-foreground">{formatCurrency(netProfit)}</span>
              </span>
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={Landmark}
          title="Money Flow"
          description="Revenue vs Expenses comparison across months"
        >
          <MoneyFlowChart data={moneyFlow} />
        </SectionCard>
      </motion.div>

      {/* ─── Profit by Order Source ──────────────────────────────── */}
      <motion.div
        variants={safeItemVariants}
        className="grid gap-4 sm:gap-5 md:grid-cols-2"
      >
        <SectionCard
          icon={ShoppingCart}
          title="Profit by Order Source"
          description="Profit distribution across order channels"
        >
          {profitBySource.length > 0 ? (
            <RankedBarList data={profitBySource} />
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                <ShoppingCart className="size-5 text-muted-foreground/60" />
              </div>
              <p className="text-sm text-muted-foreground">No source data available.</p>
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={BadgePercent}
          title="Profitability Summary"
          description="Key financial ratios and metrics"
        >
          <div className="space-y-5">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-foreground font-medium">Profit Margin</span>
                <span className={cn("font-semibold tabular-nums", netProfit >= 0 ? "text-success" : "text-destructive")}>
                  {profitMargin.toFixed(1)}%
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    netProfit >= 0
                      ? "bg-gradient-to-r from-success to-emerald-400"
                      : "bg-gradient-to-r from-destructive to-rose-400",
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.abs(profitMargin))}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
              <span className="text-sm text-foreground">Revenue per Order</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {orderCount > 0 ? formatCurrency(Math.round(totalRevenue / orderCount)) : formatCurrency(0)}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-3">
              <span className="text-sm text-foreground">Expense Ratio</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {totalRevenue > 0 ? `${((totalExpenses / totalRevenue) * 100).toFixed(1)}%` : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-success/10 px-4 py-3">
              <span className="text-sm font-medium text-foreground">Return on Revenue</span>
              <span className={cn("text-sm font-bold tabular-nums", netProfit >= 0 ? "text-success" : "text-destructive")}>
                {netProfit >= 0 ? "+" : ""}{profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* ─── Monthly Breakdown Table / Cards ──────────────────── */}
      <motion.div variants={safeItemVariants}>
        <SectionCard
          icon={ReceiptText}
          title="Monthly Breakdown"
          description="Detailed month-by-month financial performance"
        >
          {monthlyBreakdown.length > 0 ? (
            isMobile ? (
              <div className="-mx-4 -mb-4 space-y-2">
                {monthlyBreakdown.map((row, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-muted/30 p-3"
                  >
                    {/* Header: Month + Orders */}
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {row.month}
                      </span>
                      <span className="inline-flex items-center justify-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground shrink-0">
                        {row.orders} order{row.orders !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Revenue</span>
                        <span className="text-xs font-semibold tabular-nums text-success">
                          {formatCurrency(row.revenue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Expenses</span>
                        <span className="text-xs font-semibold tabular-nums text-destructive">
                          {formatCurrency(row.expenses)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Profit</span>
                        <span className={cn(
                          "text-xs font-semibold tabular-nums",
                          row.profit >= 0 ? "text-success" : "text-destructive",
                        )}>
                          {row.profit >= 0 ? "+" : ""}{formatCurrency(row.profit)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Margin</span>
                        <span className={cn(
                          "text-xs font-semibold tabular-nums",
                          row.margin >= 0 ? "text-success" : "text-destructive",
                        )}>
                          {row.margin.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="-mx-4 sm:-mx-6 -mb-4 sm:-mb-5 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Month</TableHead>
                      <TableHead className="text-sm font-semibold uppercase tracking-wider text-muted-foreground text-right">Orders</TableHead>
                      <TableHead className="text-sm font-semibold uppercase tracking-wider text-muted-foreground text-right">Revenue</TableHead>
                      <TableHead className="text-sm font-semibold uppercase tracking-wider text-muted-foreground text-right">Expenses</TableHead>
                      <TableHead className="text-sm font-semibold uppercase tracking-wider text-muted-foreground text-right">Profit</TableHead>
                      <TableHead className="text-sm font-semibold uppercase tracking-wider text-muted-foreground text-right">Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyBreakdown.map((row, i) => (
                      <TableRow key={i} className="group transition-colors hover:bg-muted/20">
                        <TableCell className="py-3 text-sm font-medium text-foreground whitespace-nowrap">{row.month}</TableCell>
                        <TableCell className="py-3 text-sm text-muted-foreground tabular-nums text-right">{row.orders}</TableCell>
                        <TableCell className="py-3 text-sm font-semibold tabular-nums text-success text-right">{formatCurrency(row.revenue)}</TableCell>
                        <TableCell className="py-3 text-sm font-semibold tabular-nums text-destructive text-right">{formatCurrency(row.expenses)}</TableCell>
                        <TableCell className={cn("py-3 text-sm font-semibold tabular-nums text-right", row.profit >= 0 ? "text-success" : "text-destructive")}>
                          {row.profit >= 0 ? "+" : ""}{formatCurrency(row.profit)}
                        </TableCell>
                        <TableCell className={cn("py-3 text-sm font-semibold tabular-nums text-right", row.margin >= 0 ? "text-success" : "text-destructive")}>
                          {row.margin.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                <ReceiptText className="size-5 text-muted-foreground/60" />
              </div>
              <p className="text-sm text-muted-foreground">No monthly data available.</p>
            </div>
          )}
        </SectionCard>
      </motion.div>
    </motion.div>
  );
}
