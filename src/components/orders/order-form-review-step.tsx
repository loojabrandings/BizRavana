"use client";

import { MessageCircle, Phone, Mail, Truck } from "lucide-react";
import { cn, formatEnumLabel } from "@/lib/utils";
import { formatPhoneNumber } from "@/lib/formatters";
import { Separator } from "@/components/ui/separator";
import type { OrderFormData, OrderFormCalculations } from "./types";
import { formatCurrency } from "./utils";

// ─── Props & Constants ────────────────────────────────────────────

interface OrderFormReviewStepProps {
  form: OrderFormData;
  calculations: OrderFormCalculations;
  onEditStep?: (step: number) => void;
}

// ─── Section Card ─────────────────────────────────────────────────

function SectionCard({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl glass-card">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          {title}
        </h3>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-xs font-medium text-primary transition-colors hover:text-primary/80 active:text-primary/60"
          >
            Edit
          </button>
        )}
      </div>
      <div className="px-4 pb-4">
        {children}
      </div>
    </div>
  );
}

// ─── Detail Row ───────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  highlight,
  className,
}: {
  label: string;
  value: string | number | React.ReactNode;
  highlight?: "primary" | "success" | "warning" | "destructive";
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-2 py-1.5", className)}>
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span
        className={cn(
          "text-sm font-medium text-right",
          highlight === "primary" && "text-primary",
          highlight === "success" && "text-success",
          highlight === "warning" && "text-warning",
          highlight === "destructive" && "text-destructive",
          !highlight && "text-foreground",
        )}
      >
        {value || "—"}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export function OrderFormReviewStep({
  form,
  calculations,
  onEditStep,
}: OrderFormReviewStepProps) {
  const itemCount = form.items.length;
  const totalQuantity = form.items.reduce((sum, item) => sum + item.quantity, 0);
  const isCod = form.payment_method === "cod";
  const isPaid = form.payment_status === "paid";
  const isPartial = form.payment_status === "advanced";

  return (
    <div className="space-y-4">
      {/* ─── System Information ──────────────────────────────── */}
      <SectionCard title="System Information" onEdit={() => onEditStep?.(1)}>
        <div className="space-y-0">
          <DetailRow label="Order Number" value={form.order_number} />
          <DetailRow label="Created Date" value={form.created_date} />
          <DetailRow label="Dispatched Date" value={form.dispatched_date || "—"} />
        </div>
      </SectionCard>

      {/* ─── Customer Details ────────────────────────────────── */}
      <SectionCard title="Customer Details" onEdit={() => onEditStep?.(1)}>
        <div className="space-y-2">
          {/* Name */}
          <div>
            <span className="block text-sm text-muted-foreground mb-0.5">Name</span>
            <span className="text-sm text-foreground">
              {form.customer_name || "—"}
            </span>
          </div>

          {/* Address */}
          <div>
            <span className="block text-sm text-muted-foreground mb-0.5">Address</span>
            <span className="text-sm text-foreground">
              {form.address || "—"}
            </span>
          </div>

          {/* WhatsApp & Phone inline */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-1.5">
              {form.whatsapp ? (
                <>
                  <MessageCircle className="size-3.5 shrink-0 text-emerald-500" />
                  <span className="text-sm text-foreground truncate">{formatPhoneNumber(form.whatsapp)}</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground/50">WhatsApp —</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {form.phone ? (
                <>
                  <Phone className="size-3.5 shrink-0 text-red-500" />
                  <span className="text-sm text-foreground truncate">{formatPhoneNumber(form.phone)}</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground/50">Phone —</span>
              )}
            </div>
          </div>

          {/* Email */}
          {form.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="size-3.5 shrink-0 text-blue-500" />
              <span className="text-sm text-foreground">{form.email}</span>
            </div>
          )}

          {/* District & City inline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-sm text-muted-foreground mb-0.5">District</span>
              <span className="text-sm text-foreground">{form.district || "—"}</span>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground mb-0.5">Nearest City</span>
              <span className="text-sm text-foreground">{form.nearest_city || "—"}</span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ─── Order Items ──────────────────────────────────────── */}
      <SectionCard title="Order Items" onEdit={() => onEditStep?.(2)}>
        {/* Item count badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </span>
          <span className="text-xs text-muted-foreground">
            {totalQuantity} unit{totalQuantity !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Items list */}
        <div className="space-y-2">
          {form.items.length === 0 ? (
            <p className="text-sm text-muted-foreground/50 py-2">No items added</p>
          ) : (
            form.items.map((item, i) => (
              <div
                key={item.id}
                className="rounded-lg border border-border/40 bg-muted/10 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.product_name || `Item #${i + 1}`}
                    </p>
                    {item.category && (
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {item.category}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-foreground shrink-0">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Qty: <strong>{item.quantity}</strong></span>
                  <span>×</span>
                  <span>{formatCurrency(item.unit_price)} ea.</span>
                </div>
                {item.notes && (
                  <p className="mt-1 text-xs italic text-muted-foreground/50">
                    {item.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Expected delivery */}
        {form.expected_delivery_date && (
          <DetailRow
            label="Expected Delivery"
            value={form.expected_delivery_date}
            className="mt-2 pt-2 border-t border-border/30"
          />
        )}
      </SectionCard>

      {/* ─── Payment Summary ──────────────────────────────────── */}
      <SectionCard title="Payment Summary" onEdit={() => onEditStep?.(3)}>
        <div className="space-y-0">
          <DetailRow label="Subtotal" value={formatCurrency(calculations.subtotal)} />
          {form.discount > 0 && (
            <DetailRow
              label={`Discount${form.discount_type === "percentage" ? ` (${form.discount}%)` : ""}`}
              value={formatCurrency(calculations.discountVal)}
              highlight="destructive"
            />
          )}
          <DetailRow label="Delivery Charge" value={formatCurrency(form.delivery_charge)} />
          <div className="my-1 border-t border-border/40" />
          <DetailRow
            label="Grand Total"
            value={formatCurrency(calculations.total)}
            highlight="primary"
            className="font-bold text-base"
          />
          {form.advance_paid > 0 && (
            <DetailRow
              label="Advance Paid"
              value={formatCurrency(form.advance_paid)}
              highlight="success"
            />
          )}
          {isPartial && (
            <DetailRow
              label="Remaining Balance"
              value={formatCurrency(calculations.balanceRemaining)}
              highlight="warning"
            />
          )}
          {isPaid && (
            <div className="mt-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
              Paid — no balance remaining
            </div>
          )}
          {isCod && (
            <div className="mt-2 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
              COD — collect {formatCurrency(calculations.total)} at delivery
            </div>
          )}
        </div>
      </SectionCard>

      {/* ─── Logistics & Notes ────────────────────────────────── */}
      <SectionCard title="Logistics &amp; Notes" onEdit={() => onEditStep?.(3)}>
        {form.remarks ? (
          <p className="text-sm text-foreground whitespace-pre-wrap">{form.remarks}</p>
        ) : (
          <p className="text-sm text-muted-foreground/50">No remarks</p>
        )}
      </SectionCard>

      {/* ─── Order Management ─────────────────────────────────── */}
      <SectionCard title="Order Management" onEdit={() => onEditStep?.(3)}>
        <div className="space-y-0">
          <DetailRow
            label="Order Status"
            value={formatEnumLabel(form.status)}
            highlight={form.status === "delivered" ? "success" : form.status === "cancelled" ? "destructive" : "primary"}
          />
          <DetailRow
            label="Payment Status"
            value={formatEnumLabel(form.payment_status)}
            highlight={form.payment_status === "paid" ? "success" : form.payment_status === "pending" ? "warning" : "primary"}
          />
          <DetailRow label="Order Source" value={formatEnumLabel(form.order_source)} />
          <DetailRow label="Payment Method" value={formatEnumLabel(form.payment_method)} />
          {form.waybill_id && (
            <div className="flex items-center gap-2 py-1.5">
              <Truck className="size-3.5 shrink-0 text-primary/60" />
              <span className="text-sm font-medium text-foreground">{form.waybill_id}</span>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ═══════ Bottom spacing for sticky nav ═══════════════════ */}
      <div className="h-4" />
    </div>
  );
}
