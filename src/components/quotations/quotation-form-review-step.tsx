"use client";

import { MessageCircle, Phone, Mail } from "lucide-react";
import { cn, formatEnumLabel } from "@/lib/utils";
import { formatPhoneNumber } from "@/lib/formatters";
import type { QuotationFormData, QuotationFormCalculations } from "./types";
import { formatCurrency } from "./utils";

// ─── Props & Constants ────────────────────────────────────────────

interface QuotationFormReviewStepProps {
  form: QuotationFormData;
  calculations: QuotationFormCalculations;
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

export function QuotationFormReviewStep({
  form,
  calculations,
  onEditStep,
}: QuotationFormReviewStepProps) {
  const itemCount = form.items.length;
  const totalQuantity = form.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-4">
      {/* ─── System Information ──────────────────────────────── */}
      <SectionCard title="System Information" onEdit={() => onEditStep?.(1)}>
        <div className="space-y-0">
          <DetailRow label="Quotation Number" value={form.quotation_number} />
          <DetailRow label="Created Date" value={form.created_date} />
          <DetailRow label="Expiry Date" value={form.expiry_date || "—"} />
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

      {/* ─── Quotation Items ──────────────────────────────────── */}
      <SectionCard title="Quotation Items" onEdit={() => onEditStep?.(2)}>
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
      </SectionCard>

      {/* ─── Financial Summary ──────────────────────────────────── */}
      <SectionCard title="Financial Summary" onEdit={() => onEditStep?.(3)}>
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
            value={formatCurrency(calculations.grandTotal)}
            highlight="primary"
            className="font-bold text-base"
          />
        </div>
      </SectionCard>

      {/* ─── Logistics & Remarks ────────────────────────────────── */}
      <SectionCard title="Logistics &amp; Remarks" onEdit={() => onEditStep?.(1)}>
        {form.remarks ? (
          <p className="text-sm text-foreground whitespace-pre-wrap">{form.remarks}</p>
        ) : (
          <p className="text-sm text-muted-foreground/50">No remarks</p>
        )}
      </SectionCard>

      {/* ─── Quotation Status ─────────────────────────────────── */}
      <SectionCard title="Quotation Status" onEdit={() => onEditStep?.(3)}>
        <DetailRow
          label="Status"
          value={formatEnumLabel(form.status)}
          highlight={form.status === "accepted" ? "success" : form.status === "rejected" ? "destructive" : form.status === "expired" ? "warning" : "primary"}
        />
      </SectionCard>

      {/* ═══════ Bottom spacing for sticky nav ═══════════════════ */}
      <div className="h-4" />
    </div>
  );
}
