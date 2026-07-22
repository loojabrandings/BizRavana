"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, X, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-media-query";
import type { InventoryItem, InventoryTransaction } from "./types";
import {
  getStockStatus,
  getStockStatusLabel,
  getStockValue,
  formatCurrency,
  formatDate,
  formatDateTime,
} from "./utils";

// ─── Props ─────────────────────────────────────────────────────────

interface StockPreviewProps {
  item: InventoryItem;
  onBack: () => void;
  onEdit?: () => void;
}

// ─── Main Component ───────────────────────────────────────────────

export function StockPreview({ item, onBack, onEdit }: StockPreviewProps) {
  const isMobile = useIsMobile();
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [txnLoading, setTxnLoading] = useState(true);
  const status = getStockStatus(item);

  // ─── Fetch transaction history ─────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    setTxnLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("inventory_transactions")
        .select("*")
        .eq("inventory_item_id", item.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setTransactions((data || []).map((t) => ({
        id: String(t.id),
        inventory_item_id: String(t.inventory_item_id),
        type: t.type as InventoryTransaction["type"],
        quantity: Number(t.quantity),
        unit_cost: t.unit_cost ? Number(t.unit_cost) : null,
        reference_type: t.reference_type ? String(t.reference_type) : null,
        reference_id: t.reference_id ? String(t.reference_id) : null,
        notes: t.notes ? String(t.notes) : null,
        created_by: t.created_by ? String(t.created_by) : null,
        created_at: String(t.created_at),
      })));
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setTxnLoading(false);
    }
  }, [item.id]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // ─── Escape key ──────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onBack();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onBack]);

  const stockValue = getStockValue(item);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col rounded-2xl glass-card"
    >
      {/* ═══════ Header ════════════════════════════════════════════ */}
      <div className={isMobile ? "px-4 pt-4 pb-3" : "flex items-start justify-between px-8 pt-7 pb-5"}>
        {isMobile ? (
          <div>
            {/* Top row: item name + close */}
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold tracking-tight text-foreground leading-tight">
                    {item.name}
                  </h1>
                  <span
                    className={cn(
                      "shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      status === "in_stock" && "bg-success/10 text-success",
                      status === "low_stock" && "bg-warning/10 text-warning",
                      status === "out_of_stock" && "bg-destructive/10 text-destructive",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block size-1.5 rounded-full",
                        status === "in_stock" && "bg-success",
                        status === "low_stock" && "bg-warning",
                        status === "out_of_stock" && "bg-destructive",
                      )}
                    />
                    {getStockStatusLabel(status)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground/70">
                  {item.category}{item.size_variant ? ` — ${item.size_variant}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={onBack}
                className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                title="Close"
              >
                <X className="size-4.5" />
              </button>
            </div>

            {/* Action buttons row */}
            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="flex-1 gap-1.5 text-sm font-medium h-9"
              >
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
              {onEdit && (
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={onEdit}
                  className="flex-1 gap-1.5 text-sm font-medium h-9"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight">{item.name}</h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    status === "in_stock" && "bg-success/10 text-success",
                    status === "low_stock" && "bg-warning/10 text-warning",
                    status === "out_of_stock" && "bg-destructive/10 text-destructive",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block size-1.5 rounded-full",
                      status === "in_stock" && "bg-success",
                      status === "low_stock" && "bg-warning",
                      status === "out_of_stock" && "bg-destructive",
                    )}
                  />
                  {getStockStatusLabel(status)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.category}{item.size_variant ? ` — ${item.size_variant}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5 text-sm">
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
              )}
              <button
                type="button"
                onClick={onBack}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          </>
        )}
      </div>

      <Separator />

      {/* ═══════ Scrollable Content ═══════════════════════════════ */}
      <div
        className={isMobile ? "flex-1 overflow-y-auto px-4" : "flex-1 overflow-y-auto px-8"}
        style={isMobile ? { maxHeight: "calc(100dvh - 380px)" } : { maxHeight: "calc(100vh - 320px)" }}
      >
        <div className={isMobile ? "py-4 pb-[calc(88px+env(safe-area-inset-bottom))] space-y-6" : "py-8 space-y-8"}>
          {/* ─── Stock Summary Cards ────────────────────────────── */}
          <div className={isMobile ? "grid grid-cols-2 gap-3" : "grid grid-cols-4 gap-5"}>
            <div className="rounded-2xl border border-border/50 bg-muted/30 p-5">
              <p className="text-sm text-muted-foreground mb-1">Current Stock</p>
              <p className={cn(
                "text-2xl font-bold",
                status === "low_stock" && "text-warning",
                status === "out_of_stock" && "text-destructive",
                status === "in_stock" && "text-foreground",
              )}>
                {item.current_stock}
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-muted/30 p-5">
              <p className="text-sm text-muted-foreground mb-1">Unit Cost</p>
              <p className="text-2xl font-bold text-foreground">
                {item.unit_cost ? formatCurrency(item.unit_cost) : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-muted/30 p-5">
              <p className="text-sm text-muted-foreground mb-1">Stock Value</p>
              <p className="text-2xl font-bold text-foreground">
                {stockValue ? formatCurrency(stockValue) : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-muted/30 p-5">
              <p className="text-sm text-muted-foreground mb-1">Reorder Level</p>
              <p className="text-2xl font-bold text-foreground">
                {item.reorder_level}
              </p>
            </div>
          </div>

          {/* ─── Details Card ────────────────────────────────────── */}
          <div className={isMobile ? "rounded-xl border border-border/50 bg-card p-4 space-y-3" : "rounded-2xl border border-border/50 bg-card p-6 space-y-4"}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Item Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="text-sm font-semibold text-foreground">{item.category || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Size / Variant</p>
                <p className="text-sm font-semibold text-foreground">{item.size_variant || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="text-sm font-semibold text-foreground">{item.supplier || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Restocked</p>
                <p className="text-sm font-semibold text-foreground">
                  {item.last_restocked_at ? formatDate(item.last_restocked_at) : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm font-semibold text-foreground">{formatDate(item.created_at)}</p>
              </div>
            </div>
          </div>

          {/* ─── Transaction History ─────────────────────────────── */}
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-border/50">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Transaction History
              </h3>
            </div>

            {txnLoading ? (
              <div className="flex items-center justify-center py-10">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Package className="size-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30 bg-muted/20">
                      <th className="px-3 py-2.5 sm:px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                      <th className="px-3 py-2.5 sm:px-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                      <th className="px-3 py-2.5 sm:px-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Qty</th>
                      <th className="px-3 py-2.5 sm:px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn) => (
                      <tr key={txn.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                        <td className="px-3 py-2.5 sm:px-4 text-muted-foreground whitespace-nowrap text-xs sm:text-sm">
                          {formatDateTime(txn.created_at)}
                        </td>
                        <td className="px-3 py-2.5 sm:px-4 text-center">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                              txn.type === "stock_in" && "bg-success/10 text-success",
                              txn.type === "stock_out" && "bg-destructive/10 text-destructive",
                              txn.type === "adjustment" && "bg-warning/10 text-warning",
                            )}
                          >
                            {txn.type === "stock_in" ? "In" : txn.type === "stock_out" ? "Out" : "Adj"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 sm:px-4 text-right tabular-nums font-semibold text-foreground text-xs sm:text-sm">
                          {txn.quantity}
                        </td>
                        <td className="px-3 py-2.5 sm:px-4 text-muted-foreground max-w-[200px] truncate hidden sm:table-cell text-xs sm:text-sm">
                          {txn.notes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════ Footer ════════════════════════════════════════════ */}
      <div className={isMobile ? "border-t border-border/40 px-4 py-3" : "border-t border-border/40 px-8 py-4"}>
        <div className={isMobile ? "flex items-center justify-center" : "flex items-center justify-between"}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1.5 text-sm font-medium"
          >
            <ArrowLeft className="size-3.5" />
            Back to Inventory
          </Button>
          {!isMobile && (
            <p className="text-sm text-muted-foreground/50">
              {item.name} &middot; {getStockStatusLabel(status)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
