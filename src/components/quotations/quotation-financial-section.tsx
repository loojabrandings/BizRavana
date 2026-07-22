"use client";

import { Percent, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { QuotationFormData, QuotationFormCalculations } from "./types";
import { formatCurrency } from "./utils";

interface QuotationFinancialSectionProps {
  form: Pick<QuotationFormData, "discount" | "discount_type" | "delivery_charge" | "status">;
  calculations: QuotationFormCalculations;
  errors: Record<string, string>;
  updateForm: <K extends keyof QuotationFormData>(
    key: K,
    value: QuotationFormData[K],
  ) => void;
}

const STATUS_OPTIONS = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
] as const;

export function QuotationFinancialSection({
  form,
  calculations,
  errors,
  updateForm,
}: QuotationFinancialSectionProps) {
  return (
    <>
      {/* ─── Section Title ──────────────────────────────────────── */}
      <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
        Financial Details
      </h2>

      {/* ─── Subtotal + Discount ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <div className="flex h-9 items-center rounded-lg border border-input bg-muted/20 px-3 text-sm font-semibold tabular-nums text-foreground">
            {formatCurrency(calculations.subtotal)}
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Discount</span>
            <button
              type="button"
              onClick={() =>
                updateForm(
                  "discount_type",
                  form.discount_type === "percentage" ? "fixed" : "percentage",
                )
              }
              className="flex items-center gap-0.5 rounded px-1 text-sm"
            >
              {form.discount_type === "percentage" ? (
                <Percent className="size-3 text-muted-foreground/60" />
              ) : (
                <DollarSign className="size-3 text-muted-foreground/60" />
              )}
              <span className="text-xs font-medium text-muted-foreground">
                {form.discount_type === "percentage" ? "%" : "Rs."}
              </span>
            </button>
          </div>
          <Input
            type="number"
            min={0}
            placeholder="0"
            value={form.discount || ""}
            onChange={(e) =>
              updateForm(
                "discount",
                Math.max(0, Number(e.target.value) || 0),
              )
            }
            className="h-9"
          />
          {form.discount > 0 && calculations.discountVal > 0 && (
            <p className="text-sm text-muted-foreground">
              {formatCurrency(calculations.discountVal)}
            </p>
          )}
        </div>
      </div>

      {/* ─── Delivery Charge + Grand Total ───────────────────────── */}
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">
            Delivery Charge
          </span>
          <Input
            type="number"
            min={0}
            placeholder="0"
            value={form.delivery_charge || ""}
            onChange={(e) =>
              updateForm(
                "delivery_charge",
                Math.max(0, Number(e.target.value) || 0),
              )
            }
            className="h-9"
          />
        </div>
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">Grand Total</span>
          <div className="flex h-9 items-center rounded-lg border border-primary/30 bg-primary/5 px-3 text-sm font-bold tabular-nums text-primary">
            {formatCurrency(calculations.grandTotal)}
          </div>
        </div>
      </div>

      {/* ─── Status ──────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/70">
          Quotation Status
        </h2>
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
      </div>
    </>
  );
}
