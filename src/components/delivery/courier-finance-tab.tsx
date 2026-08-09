"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  DollarSign,
  FileText,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { LoadingStepList } from "@/components/delivery/loading-step-list";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/formatters";
import { loadCourierConfig, fetchOrderFinance } from "@/lib/delivery/courier-utils";
import {
  buildLoadingSteps,
  markLoadingStep,
  type LoadingStep,
} from "@/lib/delivery/loading-steps";
import type { CourierConfig } from "@/lib/delivery/types";

// ─── Loading steps ────────────────────────────────────────────────
// Checklist shown while finance data is loading.

function buildFinanceLoadingSteps(): LoadingStep[] {
  return buildLoadingSteps([
    { id: "config", label: "Checking your courier settings" },
    { id: "orders", label: "Loading dispatched orders" },
    { id: "finance", label: "Checking invoice & payment status" },
  ]);
}

// ─── Payment method label lookup ────────────────────────────────

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "COD",
  bank_transfer: "Bank",
  cash: "Cash",
  card: "Card",
  online: "Online",
};

function formatPaymentMethod(method: string | null): string {
  if (!method) return "—";
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

// ─── LocalStorage helpers for manual invoice status ─────────────

const STORAGE_KEY = "courier_finance_invoice_status";

interface StoredStatus {
  invoiceStatus: "N/A" | "Deposited";
  updatedAt: string;
}

function loadStoredStatuses(): Record<string, StoredStatus> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredStatuses(map: Record<string, StoredStatus>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch { /* ignore quota errors */ }
}

// ─── Types ────────────────────────────────────────────────────────

interface FinanceRecord {
  id: string;
  orderNumber: string;
  waybillId: string;
  customerName: string;
  paymentMethod: string | null;
  total: number;
  collected: boolean | null;
  /** Invoice / finance fields (from courier API or manual entry) */
  invoiceNumber: string | null;
  invoiceStatus: "N/A" | "Deposited";
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

// ─── Component ────────────────────────────────────────────────────

export function CourierFinanceTab() {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setCourierConfig] = useState<CourierConfig | null>(null);
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>(() =>
    markLoadingStep(buildFinanceLoadingSteps(), "config", "Checking your courier settings…"),
  );

  // ─── Fetch data ───────────────────────────────────────────────
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      setLoadingSteps(markLoadingStep(buildFinanceLoadingSteps(), "config", "Checking your courier settings…"));
      const config = await loadCourierConfig();
      setCourierConfig(config);

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("user_id", session.user.id)
        .single();

      const bizId = profile?.business_id;
      if (!bizId) {
        setRecords([]);
        return;
      }

      // ── Query all orders with waybills (any status) ──────
      // Every order dispatched to a courier appears here for finance tracking.
      setLoadingSteps((prev) => markLoadingStep(prev, "orders", "Loading dispatched orders…"));
      const { data: orders } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, waybill_id, total, delivery_charge, payment_method, status, created_at")
        .eq("business_id", bizId)
        .not("waybill_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(200);

      if (!orders) {
        setRecords([]);
        return;
      }

      // ── Pre-load manually toggled statuses from localStorage ──
      const storedStatuses = loadStoredStatuses();

      // ── Build finance records ─────────────────────────────
      setLoadingSteps((prev) => markLoadingStep(prev, "finance", "Checking invoice & payment status…"));
      const fetchedRecords: FinanceRecord[] = await Promise.all(
        (orders || []).map(async (o) => {
          const isCOD = o.payment_method === "cod";

          // Try fetching finance info from the courier API
          let financeInfo: { invoiceNumber: string | null; invoiceStatus: "N/A" | "Deposited" } = {
            invoiceNumber: null,
            invoiceStatus: "N/A",
          };

          if (config?.provider && o.waybill_id) {
            try {
              const info = await fetchOrderFinance(o.waybill_id, config.credentials, config.provider);
              if (info?.invoiceNo) {
                financeInfo = {
                  invoiceNumber: info.invoiceNo,
                  invoiceStatus: "Deposited",
                };
              }
            } catch {
              // Finance info not available — keep N/A
            }
          }

          // ── Check localStorage for a manually toggled status ──
          const manual = storedStatuses[String(o.id)];
          const finalStatus = manual?.invoiceStatus ?? financeInfo.invoiceStatus;

          return {
            id: String(o.id),
            orderNumber: String(o.order_number),
            waybillId: String(o.waybill_id),
            customerName: String(o.customer_name || ""),
            paymentMethod: o.payment_method ? String(o.payment_method) : null,
            total: Number(o.total || 0),

            collected: isCOD && o.status === "delivered" ? true : isCOD ? null : null,
            invoiceNumber: financeInfo.invoiceNumber,
            invoiceStatus: finalStatus,
          };
        }),
      );

      setRecords(fetchedRecords);
    } catch (err) {
      console.error("Failed to load finance data:", err);
      setError(err instanceof Error ? err.message : "Failed to load finance data");
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const taskId = window.setTimeout(() => {
      void fetchData();
    }, 0);
    return () => window.clearTimeout(taskId);
  }, [fetchData]);

  // ─── Derived stats ────────────────────────────────────────────
  const { toBeInvoiced, paid, toBeInvoicedAmount, paidAmount } = useMemo(() => {
    let toBeInvoiced = 0;
    let paid = 0;
    let toBeInvoicedAmount = 0;
    let paidAmount = 0;

    for (const r of records) {
      // Only count COD orders in the summary cards
      if (r.paymentMethod !== "cod") continue;

      if (r.invoiceStatus === "Deposited") {
        paid++;
        paidAmount += r.total;
      } else {
        toBeInvoiced++;
        toBeInvoicedAmount += r.total;
      }
    }

    return { toBeInvoiced, paid, toBeInvoicedAmount, paidAmount };
  }, [records]);

  // ─── Update invoice status inline ─────────────────────────────
  const handleStatusChange = useCallback((id: string, newStatus: "N/A" | "Deposited") => {
    // Persist to localStorage
    const stored = loadStoredStatuses();
    stored[id] = { invoiceStatus: newStatus, updatedAt: new Date().toISOString() };
    saveStoredStatuses(stored);

    setRecords((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, invoiceStatus: newStatus } : r,
      ),
    );
  }, []);

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="size-10 animate-spin text-primary/60" />
        <div className="mt-6">
          <LoadingStepList steps={loadingSteps} />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-5 lg:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ── Refreshing status caption ──────────────────────────────── */}
      {refreshing && (
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2.5 rounded-2xl border border-border/40 bg-muted/10 px-4 py-2.5"
        >
          <Loader2 className="size-4 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {loadingSteps.find((s) => s.state === "active")?.label ?? "Refreshing…"}
          </p>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* SUMMARY CARDS                                            */}
      {/* ══════════════════════════════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="grid gap-3 sm:grid-cols-2"
      >
        {/* To Be Invoiced */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="show"
          className={cn(
            "group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5",
            "transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]",
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/10">
              <FileText className="size-5" />
            </div>
            <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-500">
              {toBeInvoiced} order{toBeInvoiced !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground">To Be Invoiced</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {formatCurrency(toBeInvoicedAmount || 0)}
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Awaiting courier invoice
            </p>
          </div>
          <span className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-amber-500/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
        </motion.div>

        {/* Paid */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="show"
          className={cn(
            "group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5",
            "transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]",
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/10">
              <DollarSign className="size-5" />
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500">
              {paid} order{paid !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground">Paid</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {formatCurrency(paidAmount || 0)}
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Invoiced and deposited
            </p>
          </div>
          <span className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full bg-emerald-500/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* FINANCE TABLE                                            */}
      {/* ══════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/30 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Courier Finance
                </h2>
                <p className="text-xs text-muted-foreground">
                  Track invoicing and payment status for courier deliveries
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className={cn(
                "group relative inline-flex h-8 shrink-0 select-none items-center justify-center gap-1.5 overflow-hidden",
                "rounded-[10px] border border-border bg-background px-3 text-xs font-medium text-muted-foreground",
                "transition-all duration-200 ease-out active:scale-[0.97]",
                "hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted hover:text-foreground hover:shadow-sm",
                "outline-none focus-visible:ring-3 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "disabled:pointer-events-none disabled:opacity-45",
              )}
            >
              <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
              Refresh
            </button>
          </div>

          {/* Error state */}
          {error && (
            <div className="flex items-center gap-2 border-b border-border/20 bg-red-500/5 px-5 py-3">
              <XCircle className="size-4 shrink-0 text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="size-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm font-medium text-foreground">No finance records yet</p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Delivered courier orders will appear here for invoicing.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30 bg-muted/20">
                      {[
                        "Order No",
                        "Waybill ID",
                        "Customer",
                        "Amount",
                        "Collected",
                        "Invoice No",
                        "Status",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className={cn(
                            "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                            (heading === "COD" || heading === "Delivery Charge") && "text-right",
                            heading === "Collected" && "text-center",
                          )}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {records.map((record) => (
                      <tr
                        key={record.id}
                        className="transition-colors hover:bg-muted/20"
                      >
                        <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">
                          #{record.orderNumber}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {record.waybillId}
                        </td>
                        <td className="px-4 py-3 text-foreground whitespace-nowrap">
                          {record.customerName}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-foreground whitespace-nowrap">
                          {formatCurrency(record.total)}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex flex-col items-center gap-0.5">
                            {record.paymentMethod === "cod" ? (
                              record.collected === true ? (
                                <CheckCircle2 className="size-4 text-success" />
                              ) : (
                                <XCircle className="size-4 text-destructive/60" />
                              )
                            ) : (
                              <CheckCircle2 className="size-4 text-success" />
                            )}
                            <span className="whitespace-nowrap text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              {formatPaymentMethod(record.paymentMethod)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {record.invoiceNumber || "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(
                                record.id,
                                record.invoiceStatus === "Deposited" ? "N/A" : "Deposited",
                              )
                            }
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
                              "hover:scale-105 active:scale-95",
                              record.invoiceStatus === "Deposited"
                                ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/15"
                                : "bg-muted text-muted-foreground hover:bg-muted/70",
                            )}
                          >
                            {record.invoiceStatus === "Deposited" ? (
                              <CheckCircle2 className="size-3" />
                            ) : null}
                            {record.invoiceStatus}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y divide-border/20 sm:hidden">
                {records.map((record) => (
                  <div key={record.id} className="px-4 py-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">
                        #{record.orderNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(
                            record.id,
                            record.invoiceStatus === "Deposited" ? "N/A" : "Deposited",
                          )
                        }
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition-all",
                          record.invoiceStatus === "Deposited"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {record.invoiceStatus === "Deposited" ? (
                          <CheckCircle2 className="size-3" />
                        ) : null}
                        {record.invoiceStatus}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[13px]">
                      <span className="text-muted-foreground">Customer</span>
                      <span className="text-foreground text-right">{record.customerName}</span>
                      <span className="text-muted-foreground">Waybill</span>
                      <span className="text-foreground text-right font-mono text-xs">{record.waybillId}</span>
                      <span className="text-muted-foreground">Amount</span>
                      <span className="text-foreground text-right">
                        {formatCurrency(record.total)}
                      </span>
                      <span className="text-muted-foreground">Collected</span>
                      <span className="text-right">
                        <span className="inline-flex flex-col items-end gap-0.5">
                            {record.paymentMethod === "cod" ? (
                              record.collected === true ? (
                                <CheckCircle2 className="size-3.5 text-success" />
                              ) : (
                                <XCircle className="size-3.5 text-destructive/60" />
                              )
                            ) : (
                              <CheckCircle2 className="size-3.5 text-success" />
                            )}
                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              {formatPaymentMethod(record.paymentMethod)}
                            </span>
                          </span>
                      </span>
                      <span className="text-muted-foreground">Invoice No</span>
                      <span className="text-foreground text-right">{record.invoiceNumber || "—"}</span>

                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
