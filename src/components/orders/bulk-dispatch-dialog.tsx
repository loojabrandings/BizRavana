"use client";

import { useCallback, useMemo, useState } from "react";
import { Loader2, Truck, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { CourierConfig } from "@/lib/delivery/courier-utils";

// ─── Types ────────────────────────────────────────────────────────

interface BulkOrder {
  id: string;
  order_number: string;
  customer_name: string;
  status: string;
}

interface BulkDispatchResult {
  orderNumber: string;
  success: boolean;
  waybill?: string;
  error?: string;
}

type DispatchState = "idle" | "dispatching" | "done";

interface BulkDispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: BulkOrder[];
  courierConfig: CourierConfig | null;
  courierName: string | null;
  /** Dispatch a single order via courier. Should return the waybill ID. */
  onDispatchOrder: (orderId: string) => Promise<{ waybill: string }>;
  /** Update order status after successful dispatch. */
  onUpdateOrder: (orderId: string, waybill: string) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────

export function BulkDispatchDialog({
  open,
  onOpenChange,
  orders,
  courierConfig,
  courierName,
  onDispatchOrder,
  onUpdateOrder,
}: BulkDispatchDialogProps) {
  const [state, setState] = useState<DispatchState>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<BulkDispatchResult[]>([]);

  // ─── Categorise orders ──────────────────────────────────────
  const { eligible, skipped } = useMemo(() => {
    const eligible: BulkOrder[] = [];
    const skipped: { order: BulkOrder; reason: string }[] = [];

    const dispatachableStatuses = ["new_order", "ready", "packed"];
    // We need the full order data from the parent page to check district/city,
    // but since this dialog only gets basic info, we'll pass all orders through
    // and let the parent handle validation.
    for (const order of orders) {
      if (!dispatachableStatuses.includes(order.status)) {
        skipped.push({
          order,
          reason: `Status is "${order.status}" — must be new_order, ready, or packed`,
        });
      } else {
        eligible.push(order);
      }
    }

    return { eligible, skipped };
  }, [orders]);

  const canDispatch = eligible.length > 0 && courierConfig?.provider;

  // ─── Start dispatch ────────────────────────────────────────
  const handleStartDispatch = useCallback(async () => {
    if (!canDispatch) return;
    setState("dispatching");
    setCurrentIndex(0);
    const newResults: BulkDispatchResult[] = [];

    for (let i = 0; i < eligible.length; i++) {
      const order = eligible[i];
      setCurrentIndex(i + 1);

      try {
        const { waybill } = await onDispatchOrder(order.id);
        await onUpdateOrder(order.id, waybill);

        newResults.push({
          orderNumber: order.order_number,
          success: true,
          waybill,
        });
      } catch (err) {
        newResults.push({
          orderNumber: order.order_number,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    setResults(newResults);
    setState("done");

    const successCount = newResults.filter((r) => r.success).length;
    const failCount = newResults.filter((r) => !r.success).length;

    if (failCount === 0) {
      toast.success(`All ${successCount} orders dispatched via ${courierName || "Courier"}!`);
    } else {
      toast.warning(`${successCount} dispatched, ${failCount} failed`, {
        description: "Check the results below for details.",
      });
    }
  }, [eligible, canDispatch, courierName, onDispatchOrder, onUpdateOrder]);

  // ─── Progress percentage ──────────────────────────────────
  const progress = eligible.length > 0
    ? Math.round((currentIndex / eligible.length) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="size-4.5 text-primary" />
            Bulk Dispatch to Courier
          </DialogTitle>
          <DialogDescription>
            {orders.length} order{orders.length > 1 ? "s" : ""} selected
            {courierName ? ` · Dispatch via ${courierName}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {/* ─── State: idle — show summary ───────────────────── */}
          {state === "idle" && (
            <>
              {/* Eligible count */}
              {eligible.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-success/20 bg-success/5 p-3.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-success/10">
                      <Truck className="size-4 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {eligible.length} eligible order{eligible.length > 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Ready to dispatch via {courierName || "Courier"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* No courier warning */}
              {!courierConfig?.provider && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-warning/20 bg-warning/5 p-3.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-warning/10">
                      <AlertTriangle className="size-4 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">No courier configured</p>
                      <p className="text-xs text-muted-foreground/70">
                        Please set up a courier in Settings &gt; Courier first.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Skipped orders */}
              {skipped.length > 0 && (
                <div className="rounded-xl border border-muted/30 bg-muted/10 p-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="size-3.5 text-muted-foreground/60" />
                    <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                      {skipped.length} skipped
                    </span>
                  </div>
                  <ScrollArea className="max-h-[120px]">
                    <div className="space-y-1">
                      {skipped.map((s) => (
                        <div
                          key={s.order.id}
                          className="flex items-center justify-between text-xs text-muted-foreground/60"
                        >
                          <span className="font-medium text-foreground/70">
                            #{s.order.order_number}
                          </span>
                          <span className="text-muted-foreground/50">{s.reason}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </>
          )}

          {/* ─── State: dispatching — show progress ──────────── */}
          {state === "dispatching" && (
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    Dispatching {currentIndex} of {eligible.length}
                  </span>
                  <span className="text-muted-foreground tabular-nums">{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Current order info */}
              {eligible[currentIndex - 1] && (
                <div className="flex items-center gap-3 rounded-xl border border-border/30 bg-card p-3">
                  <Loader2 className="size-4 animate-spin text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      #{eligible[currentIndex - 1].order_number}
                    </p>
                    <p className="text-xs text-muted-foreground/60 truncate">
                      {eligible[currentIndex - 1].customer_name}
                    </p>
                  </div>
                </div>
              )}

              {/* Live results feed */}
              {results.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                    Latest results
                  </span>
                  <ScrollArea className="max-h-[140px]">
                    <div className="space-y-1">
                      {results.map((r, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs",
                            r.success
                              ? "bg-success/5 text-success"
                              : "bg-destructive/5 text-destructive",
                          )}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            {r.success ? (
                              <CheckCircle2 className="size-3 shrink-0" />
                            ) : (
                              <XCircle className="size-3 shrink-0" />
                            )}
                            <span className="font-medium truncate">#{r.orderNumber}</span>
                          </div>
                          <span className="shrink-0 text-muted-foreground/70">
                            {r.success ? `Waybill: ${r.waybill}` : r.error}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* ─── State: done — show final summary ────────────── */}
          {state === "done" && (
            <div className="space-y-3">
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-success/20 bg-success/5 p-3 text-center">
                  <p className="text-2xl font-bold text-success tabular-nums">
                    {results.filter((r) => r.success).length}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">Success</p>
                </div>
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-center">
                  <p className="text-2xl font-bold text-destructive tabular-nums">
                    {results.filter((r) => !r.success).length}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">Failed</p>
                </div>
                <div className="rounded-xl border border-muted/30 bg-muted/10 p-3 text-center">
                  <p className="text-2xl font-bold text-foreground tabular-nums">{skipped.length}</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">Skipped</p>
                </div>
              </div>

              {/* Full results list */}
              {results.length > 0 && (
                <ScrollArea className="max-h-[200px]">
                  <div className="space-y-1">
                    {results.map((r, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs",
                          r.success
                            ? "bg-success/5 text-success"
                            : "bg-destructive/5 text-destructive",
                        )}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {r.success ? (
                            <CheckCircle2 className="size-3 shrink-0" />
                          ) : (
                            <XCircle className="size-3 shrink-0" />
                          )}
                          <span className="font-medium truncate">#{r.orderNumber}</span>
                        </div>
                        <span className="shrink-0 text-muted-foreground/70">
                          {r.success ? `Waybill: ${r.waybill}` : r.error}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {skipped.length > 0 && (
                <div className="rounded-lg border border-muted/30 bg-muted/10 p-2.5">
                  {skipped.map((s) => (
                    <div
                      key={s.order.id}
                      className="flex items-center justify-between text-xs text-muted-foreground/60 py-0.5"
                    >
                      <span className="font-medium text-foreground/70">
                        #{s.order.order_number}
                      </span>
                      <span className="text-muted-foreground/50">{s.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Actions ─────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-2">
          {state === "idle" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                size="sm"
                onClick={handleStartDispatch}
                disabled={!canDispatch}
                className="gap-1.5"
              >
                <Truck className="size-3.5" />
                Dispatch {eligible.length} to {courierName || "Courier"}
              </Button>
            </>
          )}

          {state === "dispatching" && (
            <Button variant="ghost" size="sm" disabled>
              <Loader2 className="size-3.5 animate-spin" />
              Dispatching...
            </Button>
          )}

          {state === "done" && (
            <Button variant="gradient" size="sm" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
