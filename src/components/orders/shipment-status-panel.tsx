"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Truck,
  Package,
  Clock,
  User,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  trackShipment,
  fetchOrderFinance,
  loadCourierConfig,
  type TrackingEvent,
  type OrderFinanceInfo,
} from "@/lib/delivery/courier-utils";
import type { OrderFormData } from "@/components/orders/types";


// ─── Helpers ─────────────────────────────────────────────────────

import { formatDateTime as formatDateTimePref } from "@/lib/formatters";

function formatDateTime(dateStr: string) {
  if (!dateStr) return "";
  return formatDateTimePref(dateStr);
}

const FINANCE_VARIANTS: Record<string, { bg: string; dot: string; text: string }> = {
  Approved: {
    bg: "bg-emerald-500/8 border-emerald-500/20",
    dot: "bg-emerald-500",
    text: "text-emerald-500",
  },
  Deposited: {
    bg: "bg-blue-500/8 border-blue-500/20",
    dot: "bg-blue-500",
    text: "text-blue-500",
  },
};

function getFinanceVariant(status: string) {
  return FINANCE_VARIANTS[status] || {
    bg: "bg-amber-500/8 border-amber-500/20",
    dot: "bg-amber-500",
    text: "text-amber-500",
  };
}

// ─── Props ────────────────────────────────────────────────────────

interface ShipmentStatusPanelProps {
  data: OrderFormData;
}

// ─── Component ────────────────────────────────────────────────────

export function ShipmentStatusPanel({ data }: ShipmentStatusPanelProps) {
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const [financeInfo, setFinanceInfo] = useState<OrderFinanceInfo | null>(null);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeError, setFinanceError] = useState<string | null>(null);

  const historyRef = useRef<HTMLDivElement>(null);

  const hasWaybill = !!data.waybill_id;

  // ── Auto-fetch tracking & finance on mount ─────────────────
  const fetchData = useCallback(async () => {
    if (!data.waybill_id) return;
    setTrackingLoading(true);
    setFinanceLoading(true);
    setTrackingError(null);
    setFinanceError(null);
    try {
      const config = await loadCourierConfig();
      if (!config?.provider || !config.credentials.email) {
        setTrackingError("Courier not configured");
        setFinanceError("Courier not configured");
        return;
      }
      const [events, finance] = await Promise.all([
        trackShipment(data.waybill_id, config.credentials),
        fetchOrderFinance(data.waybill_id, config.credentials),
      ]);
      setTrackingEvents(events);
      setFinanceInfo(finance);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch data";
      setTrackingError(msg);
      setFinanceError(msg);
    } finally {
      setTrackingLoading(false);
      setFinanceLoading(false);
    }
  }, [data.waybill_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentStatus = trackingEvents[0]?.status;
  const currentFinanceStatus = financeInfo?.financeStatus;
  const fv = currentFinanceStatus ? getFinanceVariant(currentFinanceStatus) : null;

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="rounded-xl glass-card p-5">
      {/* ────── Section Header ──────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            hasWaybill
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-muted text-muted-foreground/50",
          )}
        >
          {hasWaybill ? <Truck className="size-5" /> : <Package className="size-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Shipment Status</p>
          <p className="mt-px text-xs text-muted-foreground/60">
            {hasWaybill ? `Waybill: ${data.waybill_id}` : "No waybill assigned"}
          </p>
        </div>

      </div>

      {/* ────── Current Status Card ─────────────────────────── */}
      {hasWaybill && (
        <div className="mt-5 rounded-xl border border-border/30 bg-muted/10 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Current Status
          </p>

          {trackingLoading && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground/70">
              <Loader2 className="size-3.5 animate-spin" />
              Loading tracking data&hellip;
            </div>
          )}

          {trackingError && !trackingLoading && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-destructive/80">
              <AlertCircle className="size-3.5 shrink-0" />
              {trackingError}
            </div>
          )}

          {!trackingLoading && !trackingError && currentStatus && (
            <p className="mt-1 text-xl font-bold tracking-tight text-foreground">
              {currentStatus}
            </p>
          )}

          {!trackingLoading && !trackingError && !currentStatus && trackingEvents.length === 0 && (
            <p className="mt-2 text-sm text-muted-foreground/70">
              Shipment created &mdash; awaiting status updates from courier.
            </p>
          )}
        </div>
      )}

      {/* ────── Shipment History (scrollable) ───────────────── */}
      {hasWaybill && trackingEvents.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Shipment History
          </p>
          <div
            ref={historyRef}
            className="relative mt-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin"
          >
            {/* Timeline line */}
            <div className="absolute left-[13px] top-1 bottom-1 w-0.5 bg-border/50" />

            <div className="space-y-0">
              {trackingEvents.map((event, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  className="relative flex gap-3 pb-4 last:pb-0"
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "relative z-10 mt-0.5 flex size-[26px] shrink-0 items-center justify-center rounded-full ring-2 ring-card",
                      i === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground/50",
                    )}
                  >
                    {i === 0 ? (
                      <Package className="size-3" />
                    ) : (
                      <div className="size-2 rounded-full bg-current" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        i === 0 ? "text-foreground" : "text-muted-foreground/80",
                      )}
                    >
                      {event.status}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground/60">
                      {event.dateTime && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatDateTime(event.dateTime)}
                        </span>
                      )}
                      {event.user && (
                        <span className="inline-flex items-center gap-1">
                          <User className="size-3" />
                          {event.user}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ────── Divider ────────────────────────────────────── */}
      <hr className="my-5 border-t border-border/30" />

      {/* ────── Finance Status ──────────────────────────────── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Finance Status
        </p>

        {financeLoading && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground/70">
            <Loader2 className="size-3.5 animate-spin" />
            Loading finance data&hellip;
          </div>
        )}

        {financeError && !financeLoading && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-destructive/80">
            <AlertCircle className="size-3.5 shrink-0" />
            {financeError}
          </div>
        )}

        {!financeLoading && !financeError && financeInfo && (
          <>
            {/* Large bold status */}
            <div
              className={cn(
                "mt-3 flex items-center gap-3 rounded-xl border px-4 py-3",
                fv?.bg,
              )}
            >
              <span className={cn("size-2.5 shrink-0 rounded-full", fv?.dot)} />
              <span className={cn("text-lg font-bold tracking-tight", fv?.text)}>
                {financeInfo.financeStatus}
              </span>
            </div>

            {/* Detail rows */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground/60">Invoice Ref</span>
                <span className="font-medium tabular-nums text-foreground/80">
                  {financeInfo.invoiceRefNo || "\u2014"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground/60">Invoice No</span>
                <span className="font-medium tabular-nums text-foreground/80">
                  {financeInfo.invoiceNo || "\u2014"}
                </span>
              </div>
            </div>
          </>
        )}

        {!financeLoading && !financeError && !financeInfo && (
          <p className="mt-2 text-sm text-muted-foreground/70">
            {hasWaybill
              ? "No finance data available from courier."
              : "Waybill required for financial status."}
          </p>
        )}
      </div>
    </div>
  );
}
