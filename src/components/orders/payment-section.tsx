"use client";

import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { OrderFormData, OrderFormCalculations } from "./types";
import { formatCurrency } from "./utils";

interface PaymentSectionProps {
  form: Pick<
    OrderFormData,
    | "discount"
    | "discount_type"
    | "delivery_charge"
    | "advance_paid"
    | "payment_method"
  >;
  calculations: OrderFormCalculations;
  updateForm: <K extends keyof OrderFormData>(
    key: K,
    value: OrderFormData[K],
  ) => void;
  paymentMethods?: { value: string; label: string }[];
}

const FALLBACK_PAYMENT_METHODS = [
  { value: "cash" as const, label: "Cash" },
  { value: "bank_transfer" as const, label: "Bank Transfer" },
  { value: "cod" as const, label: "COD" },
  { value: "other" as const, label: "Other" },
];

export function PaymentSection({
  form,
  calculations,
  updateForm,
  paymentMethods = FALLBACK_PAYMENT_METHODS,
}: PaymentSectionProps) {
  return (
    <>
      {/* ─── Section Title ──────────────────────────────────────── */}
      <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
        Payment Details
      </h2>

      {/* ─── Row 1: Subtotal + Discount ─────────────────────────── */}
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <div className="flex h-9 items-center rounded-lg border border-input bg-muted/20 px-3 text-sm font-semibold tabular-nums text-foreground">
            {formatCurrency(calculations.subtotal)}
          </div>
        </div>
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">Discount</span>
          <InputGroup className="h-9">
            <InputGroupAddon align="inline-start" className="flex min-w-10 cursor-pointer justify-center gap-0.5 rounded-md px-1.5 transition-colors hover:bg-muted active:bg-muted/80" onClick={() => updateForm("discount_type", form.discount_type === "percentage" ? "fixed" : "percentage")}>
              <span className="text-xs font-semibold text-muted-foreground">
                {form.discount_type === "percentage" ? "%" : "Rs."}
              </span>
              <ChevronDown className="size-2.5 text-muted-foreground/50" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={form.discount || ""}
              onChange={(e) =>
                updateForm(
                  "discount",
                  Math.max(0, Number(e.target.value.replace(/[^0-9.]/g, "")) || 0),
                )
              }
              className="h-9"
            />
            {form.discount_type === "percentage" && form.discount > 0 && calculations.discountVal > 0 && (
              <InputGroupAddon align="inline-end" className="text-xs text-muted-foreground">
                {formatCurrency(calculations.discountVal)}
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>
      </div>

      {/* ─── Row 2: Delivery Charge + Grand Total ───────────────── */}
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
            {formatCurrency(calculations.total)}
          </div>
        </div>
      </div>

      {/* ─── Row 3: Advance Payment + Remaining Balance ─────────── */}
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">
            Advance Payment
          </span>
          <Input
            type="number"
            min={0}
            placeholder="0"
            value={form.advance_paid || ""}
            onChange={(e) =>
              updateForm(
                "advance_paid",
                Math.max(0, Number(e.target.value) || 0),
              )
            }
            className="h-9"
          />
        </div>
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">
            Remaining Balance
          </span>
          <div
            className={cn(
              "flex h-9 items-center rounded-lg border px-3 text-sm font-semibold tabular-nums",
              calculations.balanceRemaining > 0
                ? "border-warning/30 bg-warning/5 text-warning"
                : "border-success/30 bg-success/5 text-success",
            )}
          >
            {formatCurrency(calculations.balanceRemaining)}
          </div>
        </div>
      </div>

      {/* ─── Row 4: Payment Method — Dropdown ─────────────────── */}
      <div className="space-y-1.5">
        <span className="text-sm text-muted-foreground">Payment Method</span>
        <Select
          value={form.payment_method}
          onValueChange={(v) => v && updateForm("payment_method", v)}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Select payment method">
              {paymentMethods.find((m) => m.value === form.payment_method)?.label || form.payment_method}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {paymentMethods.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ─── Conditional Payment Information ─────────────────────── */}
      {form.payment_method === "bank_transfer" && (
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">Reference No.</span>
          <Input type="text" placeholder="Bank transfer reference" className="h-9" />
        </div>
      )}
    </>
  );
}
