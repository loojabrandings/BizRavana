"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  DollarSign,
  Layers3,
  Package,
  ReceiptText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { getDateRange, dateFilterOptions } from "@/lib/date-utils";
import { HeroStatCard, type HeroStatTrendBadge } from "@/components/dashboard/hero-stat-card";
import { RankedBarList } from "@/components/charts/ranked-bar-list";
import { DonutChart } from "@/components/charts/donut-chart";
import { SectionCard } from "@/components/reports/section-card";
import { Dropdown } from "@/components/ui/dropdown";
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

interface RawExpense {
  id: string;
  expense_number: string | null;
  expense_date: string;
  category: string;
  item_name: string;
  supplier: string | null;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  payment_method: string | null;
  payment_status: string;
  created_at: string;
}

// ─── Monthly Expense Trend Chart ───────────────────────────────────
function MonthlyExpenseBarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const maxValue = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
          <BarChart3 className="size-5 text-muted-foreground/60" />
        </div>
        <p className="text-sm text-muted-foreground">No expense data available for this period.</p>
      </div>
    );
  }

  return (
    <div className="flex h-44 items-end gap-3 px-2">
      {data.map((row, index) => (
        <motion.div
          key={`month-bar-${index}`}
          className="flex flex-1 flex-col items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.04 }}
        >
          <div className="flex h-36 w-full items-end justify-center">
            <motion.div
              className="w-full max-w-[36px] rounded-lg bg-gradient-to-t from-destructive/70 to-destructive/50 transition-all duration-300 hover:from-destructive hover:to-destructive/70"
              style={{ height: `${Math.max(6, (row.value / maxValue) * 100)}%` }}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(6, (row.value / maxValue) * 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.04 }}
              title={`${row.label}: ${formatCurrency(row.value)}`}
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

// ══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════

export function ExpensesAnalyticsContent() {
  const prefersReducedMotion = useReducedMotion();
  const safeContainerVariants = prefersReducedMotion ? undefined : containerVariants;
  const safeItemVariants = prefersReducedMotion ? undefined : itemVariants;

  // ─── State ─────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>("this_month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [customMode, setCustomMode] = useState(false);

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

        let expensesQuery = supabase
          .from("expenses")
          .select("id, expense_number, expense_date, category, item_name, supplier, quantity, unit_cost, total_cost, payment_method, payment_status, created_at")
          .eq("business_id", businessId)
          .order("expense_date", { ascending: false })
          .limit(500);

        if (dateRange) {
          expensesQuery = expensesQuery
            .gte("expense_date", dateRange.start.toISOString().slice(0, 10))
            .lte("expense_date", dateRange.end.toISOString().slice(0, 10));
        }

        const { data: expensesData, error } = await expensesQuery;

        if (error) throw new Error(error.message);

        setExpenses(
          (expensesData || []).map((e) => ({
            id: String(e.id),
            expense_number: e.expense_number ? String(e.expense_number) : null,
            expense_date: String(e.expense_date),
            category: String(e.category || "other"),
            item_name: String(e.item_name || ""),
            supplier: e.supplier ? String(e.supplier) : null,
            quantity: Number(e.quantity || 0),
            unit_cost: Number(e.unit_cost || 0),
            total_cost: Number(e.total_cost || 0),
            payment_method: e.payment_method ? String(e.payment_method) : null,
            payment_status: String(e.payment_status || "pending"),
            created_at: String(e.created_at),
          })),
        );
      } catch (error) {
        console.error("Expenses analytics fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateFilter, dateFrom, dateTo]);

  // ─── Derived Metrics ───────────────────────────────────────────
  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + e.total_cost, 0),
    [expenses],
  );

  const totalExpensesCount = expenses.length;

  const trends = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const inRange = (dateStr: string, start: Date, end: Date) => {
      const d = new Date(dateStr + "T00:00:00");
      return d >= start && d <= end;
    };

    const currentExpenses = expenses.filter((e) => inRange(e.expense_date, thisMonthStart, now));
    const previousExpenses = expenses.filter((e) => inRange(e.expense_date, lastMonthStart, lastMonthEnd));

    const currentTotal = currentExpenses.reduce((s, e) => s + e.total_cost, 0);
    const previousTotal = previousExpenses.reduce((s, e) => s + e.total_cost, 0);

    const buildBadge = (
      current: number,
      previous: number,
      lowerIsBetter: boolean,
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
      const direction: "up" | "down" | "neutral" = pct > 0 ? "up" : pct < 0 ? "down" : "neutral";

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

    return {
      totalBadge: buildBadge(currentTotal, previousTotal, true),
      countBadge: buildBadge(currentExpenses.length, previousExpenses.length, true),
    };
  }, [expenses]);

  const expensesByCategory = useMemo(
    () => summarizeBy(expenses, (e) => e.category, (e) => e.total_cost),
    [expenses],
  );

  const topCategory = useMemo(() => {
    if (expensesByCategory.length === 0) return null;
    return expensesByCategory[0];
  }, [expensesByCategory]);

  const monthlyTrend = useMemo(() => {
    const monthBuckets = new Map<string, number>();

    expenses.forEach((e) => {
      const d = new Date(e.expense_date + "T00:00:00");
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthBuckets.set(key, (monthBuckets.get(key) || 0) + e.total_cost);
    });

    return Array.from(monthBuckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, value]) => {
        const [year, month] = key.split("-");
        const date = new Date(Number(year), Number(month) - 1);
        const label = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        return { label, value };
      });
  }, [expenses]);

  const topExpenses = useMemo(
    () =>
      [...expenses]
        .sort((a, b) => b.total_cost - a.total_cost)
        .slice(0, 10)
        .map((e) => ({
          label: e.item_name,
          value: e.total_cost,
        })),
    [expenses],
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

  const avgExpense = totalExpensesCount > 0
    ? Math.round(totalExpenses / totalExpensesCount)
    : 0;

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-6 w-48 animate-pulse rounded-lg bg-muted/60" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted/60" />
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-muted/40" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-3xl bg-muted/40" />
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl bg-muted/40" />
          ))}
        </div>
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

      {/* ─── Section 1: Total Expenses + Top Category Spend ────── */}
      <motion.div
        variants={safeItemVariants}
        className="relative overflow-hidden rounded-2xl sm:rounded-[32px] bg-gradient-to-br from-status-danger-bg/40 via-status-danger-bg/10 to-transparent p-4 sm:p-6 md:p-7 ring-1 ring-destructive/10"
      >
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(oklch(1_0_0_/_0.12)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0_/_0.12)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="relative z-10">
          <div className="mb-3 sm:mb-4 flex items-center gap-2.5">
            <div className="flex size-7 sm:size-8 items-center justify-center rounded-lg sm:rounded-xl bg-status-danger-bg">
              <BarChart3 className="size-3.5 sm:size-4 text-destructive" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-foreground">Expense Overview</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Key cost metrics for the selected period</p>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            <HeroStatCard
              label="Total Expenses"
              value={formatCurrency(totalExpenses)}
              icon={TrendingDown}
              trendBadge={trends.totalBadge}
              variant="flat"
              secondary={
                <span className="text-sm text-muted-foreground/80">
                  <span className="font-semibold text-foreground">{totalExpensesCount}</span> expense
                  {totalExpensesCount !== 1 ? "s" : ""} recorded
                </span>
              }
            />
            <HeroStatCard
              label="Top Category Spend"
              value={topCategory ? formatCurrency(topCategory.value) : formatCurrency(0)}
              icon={ArrowUpRight}
              trendBadge={trends.countBadge}
              variant="flat"
              secondary={
                <span className="text-sm text-muted-foreground/80">
                  {topCategory ? (
                    <>
                      Highest spend in{" "}
                      <span className="font-semibold text-foreground">{topCategory.label}</span>
                    </>
                  ) : (
                    "No categories with expenses"
                  )}
                </span>
              }
            />
          </div>
        </div>
      </motion.div>

      {/* ─── Section 2: Monthly Expense Trend ──────────────────── */}
      <motion.div variants={safeItemVariants}>
        <SectionCard
          icon={TrendingUp}
          title="Monthly Expense Trend"
          description="How your expenses have changed month over month"
        >
          <MonthlyExpenseBarChart data={monthlyTrend} />

          {monthlyTrend.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border/40 pt-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-gradient-to-b from-destructive/70 to-destructive/50" />
                Monthly Total
                <span className="font-semibold text-foreground">{formatCurrency(totalExpenses)}</span>
              </span>
              <span>
                Avg:{" "}
                <span className="font-semibold text-foreground">{formatCurrency(avgExpense)}</span>
                /month
              </span>
            </div>
          )}
        </SectionCard>
      </motion.div>

      {/* ─── Sections 3 & 4: Expenses by Category + Top Expenses ── */}
      <motion.div
        variants={safeItemVariants}
        className="grid gap-4 sm:gap-5 md:grid-cols-2"
      >
        <SectionCard
          icon={Layers3}
          title="Expenses by Category"
          description="Spending distribution across expense categories"
        >
          <DonutChart data={expensesByCategory} />
        </SectionCard>

        <SectionCard
          icon={Package}
          title="Top Expenses"
          description="Highest cost items in this period"
        >
          {topExpenses.length > 0 ? (
            <RankedBarList data={topExpenses} />
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                <ReceiptText className="size-5 text-muted-foreground/60" />
              </div>
              <p className="text-sm text-muted-foreground">No top expenses available.</p>
            </div>
          )}
        </SectionCard>
      </motion.div>

      {/* ─── Summary Row ──────────────────────────────────────── */}
      <motion.div
        variants={safeItemVariants}
        className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-4"
      >
        <div className="rounded-2xl glass-card p-3 sm:p-4 text-center">
          <div className="mx-auto mb-1.5 sm:mb-2 flex size-8 sm:size-9 items-center justify-center rounded-lg sm:rounded-xl bg-status-info-bg">
            <ReceiptText className="size-3.5 sm:size-4 text-primary" />
          </div>
          <p className="text-lg sm:text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalExpensesCount}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Total Expenses</p>
        </div>

        <div className="rounded-2xl glass-card p-3 sm:p-4 text-center">
          <div className="mx-auto mb-1.5 sm:mb-2 flex size-8 sm:size-9 items-center justify-center rounded-lg sm:rounded-xl bg-status-warning-bg">
            <DollarSign className="size-3.5 sm:size-4 text-warning" />
          </div>
          <p className="text-lg sm:text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatCurrency(avgExpense)}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Avg Cost Per Expense</p>
        </div>

        <div className="rounded-2xl glass-card p-3 sm:p-4 text-center">
          <div className="mx-auto mb-1.5 sm:mb-2 flex size-8 sm:size-9 items-center justify-center rounded-lg sm:rounded-xl bg-status-success-bg">
            <Layers3 className="size-3.5 sm:size-4 text-success" />
          </div>
          <p className="text-lg sm:text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {expensesByCategory.length}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Categories Used</p>
        </div>

        <div className="rounded-2xl glass-card p-3 sm:p-4 text-center">
          <div className="mx-auto mb-1.5 sm:mb-2 flex size-8 sm:size-9 items-center justify-center rounded-lg sm:rounded-xl bg-status-danger-bg">
            <ArrowUpRight className="size-3.5 sm:size-4 text-destructive" />
          </div>
          <p className="text-sm sm:text-2xl font-bold tracking-tight text-foreground tabular-nums truncate">
            {topCategory ? topCategory.label : "—"}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Top Category</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
