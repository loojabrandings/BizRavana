"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderFormData } from "./types";
import { fetchManualWaybills, getWaybillMethod, type ManualWaybill } from "@/lib/delivery/waybill-utils";

interface OrderManagementSectionProps {
  form: Pick<OrderFormData, "status" | "payment_status" | "order_source" | "waybill_id">;
  errors: Record<string, string>;
  updateForm: <K extends keyof OrderFormData>(
    key: K,
    value: OrderFormData[K],
  ) => void;
  businessId?: string | null;
}

const STATUS_OPTIONS = [
  "new_order",
  "ready",
  "packed",
  "dispatched",
  "delivered",
  "cancelled",
  "returned",
] as const;

const PAYMENT_STATUS_OPTIONS = [
  "pending",
  "advanced",
  "paid",
] as const;

const SOURCE_OPTIONS = [
  "ad",
  "organic",
] as const;

export function OrderManagementSection({
  form,
  errors,
  updateForm,
  businessId,
}: OrderManagementSectionProps) {
  const [waybillSuggestions, setWaybillSuggestions] = useState<ManualWaybill[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fetchedWaybills, setFetchedWaybills] = useState<ManualWaybill[]>([]);
  const [waybillMethod, setWaybillMethod] = useState<"manual" | "auto" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch available waybills and method once when the businessId is available
  useEffect(() => {
    if (businessId) {
      getWaybillMethod(businessId).then(setWaybillMethod).catch(() => {});
      fetchManualWaybills(businessId, { status: "available", limit: 50 })
        .then(({ waybills }) => setFetchedWaybills(waybills))
        .catch(() => {});
    }
  }, [businessId]);

  const isAuto = waybillMethod === "auto";

  // Filter suggestions based on current input
  const filteredSuggestions = useMemo(() => {
    const term = form.waybill_id.trim().toLowerCase();
    if (!term) return fetchedWaybills.slice(0, 20);
    return fetchedWaybills
      .filter((wb) => wb.waybill_id.toLowerCase().includes(term))
      .slice(0, 20);
  }, [fetchedWaybills, form.waybill_id]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionSelect = useCallback(
    (wb: ManualWaybill) => {
      updateForm("waybill_id", wb.waybill_id);
      setShowSuggestions(false);
    },
    [updateForm],
  );

  const hasSuggestions = fetchedWaybills.length > 0;

  return (
    <>
      {/* ─── Section Title ──────────────────────────────────────── */}
      <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
        Order Management
      </h2>

      {/* ─── Waybill ID with suggestions ──────────────────────── */}
      <div className="space-y-1.5 relative">
        <span className="text-sm text-muted-foreground">Waybill ID</span>
        <Input
          ref={inputRef}
          type="text"
          placeholder={!isAuto && hasSuggestions ? "Search or type waybill ID..." : "Enter waybill ID"}
          value={form.waybill_id}
          disabled={isAuto}
          onChange={(e) => {
            if (isAuto) return;
            updateForm("waybill_id", e.target.value);
            if (e.target.value) setShowSuggestions(true);
          }}
          onFocus={() => {
            if (!isAuto && fetchedWaybills.length > 0) setShowSuggestions(true);
          }}
          className="h-9"
        />

        {/* Auto mode note */}
        {isAuto && (
          <div className="rounded-lg bg-info/5 border border-info/20 px-3 py-2.5">
            <p className="text-xxs text-info/70 leading-relaxed">
              Waybill IDs are assigned automatically by the connected courier integration.
            </p>
          </div>
        )}

        {/* Waybill suggestions dropdown */}
        {showSuggestions && !isAuto && hasSuggestions && filteredSuggestions.length > 0 && (
          <div
            ref={panelRef}
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[200px] overflow-y-auto rounded-lg border border-border/30 bg-popover shadow-lg"
          >
            {filteredSuggestions.map((wb) => (
              <button
                key={wb.id}
                type="button"
                onClick={() => handleSuggestionSelect(wb)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-left text-sm transition-colors",
                  form.waybill_id === wb.waybill_id
                    ? "bg-primary/5 text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <span className="font-mono text-xs font-medium">{wb.waybill_id}</span>
              </button>
            ))}
          </div>
        )}

        {/* Show count hint when available */}
        {!isAuto && hasSuggestions && !showSuggestions && !form.waybill_id && (
          <p className="text-nano text-muted-foreground/40">
            {fetchedWaybills.length} available waybill{fetchedWaybills.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* ─── Row 1: Status + Payment Status ─────────────────────── */}
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">
            Status <span className="text-destructive">*</span>
          </span>
          <Select
            value={form.status}
            onValueChange={(v) => v && updateForm("status", v)}
          >
            <SelectTrigger
              className={cn(
                "w-full h-9!",
                errors.status && "border-destructive",
              )}
            >
              <SelectValue>
                {form.status}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-destructive">{errors.status}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">
            Payment Status <span className="text-destructive">*</span>
          </span>
          <Select
            value={form.payment_status}
            onValueChange={(v) => v && updateForm("payment_status", v)}
          >
            <SelectTrigger
              className={cn(
                "w-full h-9!",
                errors.payment_status && "border-destructive",
              )}
            >
              <SelectValue>
                {form.payment_status}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.payment_status && (
            <p className="text-sm text-destructive">
              {errors.payment_status}
            </p>
          )}
        </div>
      </div>

      {/* ─── Row 2: Order Source ────────────────────────────────── */}
      <div className="space-y-1.5">
        <span className="text-sm text-muted-foreground">
          Order Source <span className="text-destructive">*</span>
        </span>
        <Select
          value={form.order_source}
          onValueChange={(v) => v && updateForm("order_source", v)}
        >            <SelectTrigger
              className={cn(
                "w-full h-9!",
                errors.order_source && "border-destructive",
              )}
            >
              <SelectValue>
                {form.order_source}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {errors.order_source && (
          <p className="text-sm text-destructive">{errors.order_source}</p>
        )}
      </div>
    </>
  );
}


