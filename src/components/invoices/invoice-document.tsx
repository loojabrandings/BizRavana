"use client";

import { Building2, Globe, Mail, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPhoneNumber, formatDate as fmtDate } from "@/lib/formatters";
import { usePreferences } from "@/stores/preferences-store";
import type { OrderFormData } from "@/components/orders/types";

// ─── Types ─────────────────────────────────────────────────────────

export interface BusinessProfile {
  name: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  registration_number: string | null;
}

interface InvoiceDocumentProps {
  data: OrderFormData;
  business: BusinessProfile;
}

// ─── Helpers ───────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return "\u2014";
  return fmtDate(dateStr);
}

function statusTextClass(status: string): string {
  const s = status?.toLowerCase() || "";
  if (s === "paid" || s === "delivered" || s === "active") return "text-success";
  if (s === "advanced" || s === "dispatched" || s === "packed") return "text-warning";
  if (s === "pending" || s === "new_order" || s === "ready") return "text-status-info";
  if (s === "cancelled" || s === "returned") return "text-destructive";
  return "text-muted-foreground";
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    new_order: "New Order", ready: "Ready", packed: "Packed",
    dispatched: "Dispatched", delivered: "Delivered", cancelled: "Cancelled",
    returned: "Returned", pending: "Pending", advanced: "Advanced", paid: "Paid",
    cod: "COD", cash: "Cash", card: "Card", bank_transfer: "Bank Transfer",
    online: "Online", other: "Other",
  };
  return map[status] || status;
}

const CURRENCY_SYMBOL_MAP: Record<string, string> = {
  LKR: "Rs.", USD: "$", EUR: "\u20AC", GBP: "\u00A3", INR: "\u20B9",
  AED: "\u062F.\u0625", SGD: "S$", MYR: "RM", THB: "\u0E3F", AUD: "A$",
};

const CURRENCY_LOCALE_MAP: Record<string, string> = {
  LKR: "en-LK", USD: "en-US", EUR: "de-DE", GBP: "en-GB", INR: "en-IN",
  AED: "ar-AE", SGD: "en-SG", MYR: "ms-MY", THB: "th-TH", AUD: "en-AU",
};

function getCurrencySymbol(): string {
  const code = usePreferences.getState().currency || "LKR";
  return CURRENCY_SYMBOL_MAP[code] || code;
}

// ── Local formatCurrency with 2 decimal places (matches InvoiceTemplate) ──
function fmtCurrency(amount: number): string {
  const code = usePreferences.getState().currency || "LKR";
  const symbol = getCurrencySymbol();
  const locale = CURRENCY_LOCALE_MAP[code] || "en-US";
  return (
    symbol +
    " " +
    new Intl.NumberFormat(locale, {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  );
}

function formatPlainNumber(amount: number): string {
  const code = usePreferences.getState().currency || "LKR";
  const locale = CURRENCY_LOCALE_MAP[code] || "en-US";
  return new Intl.NumberFormat(locale, {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ═══════════════════════════════════════════════════════════════════
// INVOICE DOCUMENT COMPONENT
// ═══════════════════════════════════════════════════════════════════
// Renders only the white invoice paper — no toolbars, no modals,
// no action buttons. Used in both the preview dialog and the
// server-rendered print page (which Puppeteer renders into a PDF).
// ═══════════════════════════════════════════════════════════════════

export function InvoiceDocument({ data, business }: InvoiceDocumentProps) {
  const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const discountVal = data.discount_type === "percentage"
    ? subtotal * (Math.min(data.discount, 100) / 100)
    : data.discount;

  const customerInfoRows = [
    { label: "Customer Name", value: data.customer_name },
    { label: "Phone", value: formatPhoneNumber(data.phone) },
    { label: "WhatsApp", value: data.whatsapp ? formatPhoneNumber(data.whatsapp) : null },
    { label: "Email", value: data.email || null },
    { label: "Address", value: data.address },
  ].filter((r) => r.value !== null && r.value !== "");

  return (
    <div
      className="bg-white text-black rounded-2xl border border-gray-200 shadow-xl overflow-hidden mx-auto flex flex-col"
      style={{ width: "210mm", minHeight: "297mm", fontFamily: "inherit" }}
    >
      <div className="p-10 flex-1">
        {/* ═══ Header ════════════════════════════════════════════ */}
        <div className="flex flex-row items-start justify-between gap-6">
          {/* Left: Business Info */}
          <div className="flex items-start gap-4 min-w-0 flex-1">
            {business.logo_url && (
              <div className="relative shrink-0 flex items-center justify-center size-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={business.logo_url}
                  alt={business.name}
                  className="max-w-full max-h-full object-contain"
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
            )}
            <div className="min-w-0">
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{ color: "var(--primary, #2563eb)" }}
              >
                {business.name || "Business Name"}
              </h1>
              <div className="mt-2 space-y-1 text-xs text-gray-500">
                {business.address && (
                  <div className="flex items-start gap-1.5">
                    <MapPin className="size-3 mt-0.5 shrink-0 text-gray-400" />
                    <span>{business.address}</span>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="size-3 shrink-0 text-gray-400" />
                    <span>{formatPhoneNumber(business.phone)}</span>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="size-3 shrink-0 text-gray-400" />
                    <span>{business.email}</span>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="size-3 shrink-0 text-gray-400" />
                    <span className="text-gray-500">{business.website.replace(/^https?:\/\//, "")}</span>
                  </div>
                )}
                {business.registration_number && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="size-3 shrink-0 text-gray-400" />
                    <span>Reg No: {business.registration_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Invoice Title */}
          <div className="text-right shrink-0">
            <h2
              className="text-4xl font-bold tracking-tight leading-none"
              style={{ color: "var(--primary, #2563eb)" }}
            >
              INVOICE
            </h2>
            <div className="mt-3.5 space-y-1 text-xs text-gray-500">
              <p>
                <span className="font-medium text-gray-500">Order No: </span>
                <span className="font-normal text-gray-700">#{data.order_number}</span>
              </p>
              <p>
                <span className="font-medium text-gray-500">Date: </span>
                <span className="font-normal text-gray-700">{formatDate(data.created_date)}</span>
              </p>
              {data.expected_delivery_date && (
                <p>
                  <span className="font-medium text-gray-500">Due Date: </span>
                  <span className="font-normal text-gray-700">{formatDate(data.expected_delivery_date)}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ═══ Divider ══════════════════════════════════════════ */}
        <div
          className="my-6 h-px"
          style={{ backgroundColor: "var(--primary, #2563eb)", opacity: 0.3 }}
        />

        {/* ═══ Customer & Order Details (Two-Column) ═════════ */}
        <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-4">
          {/* Left: Customer Information */}
          <div>
            <h3
              className="text-sm font-bold uppercase tracking-wider mb-3"
              style={{ color: "var(--primary, #2563eb)" }}
            >
              Customer Information
            </h3>
            <div className="space-y-2">
              {customerInfoRows.length === 0 ? (
                <p className="text-xs text-gray-400">\u2014</p>
              ) : (
                customerInfoRows.map((row) => (
                  <div key={row.label} className="flex items-baseline text-xs">
                    <span className="font-medium text-gray-400 shrink-0 w-[120px]">{row.label}:</span>
                    <span className="text-gray-800">{row.value}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Order Details */}
          <div>
            <h3
              className="text-sm font-bold uppercase tracking-wider mb-3"
              style={{ color: "var(--primary, #2563eb)" }}
            >
              Order Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-baseline text-xs">
                <span className="font-medium text-gray-400 shrink-0 w-[120px]">Payment Status:</span>
                <span className="text-gray-800">
                  {data.payment_status ? statusLabel(data.payment_status) : "\u2014"}
                </span>
              </div>
              <div className="flex items-baseline text-xs">
                <span className="font-medium text-gray-400 shrink-0 w-[120px]">Payment Method:</span>
                <span className="text-gray-800">{data.payment_method ? statusLabel(data.payment_method) : "\u2014"}</span>
              </div>
              <div className="flex items-baseline text-xs">
                <span className="font-medium text-gray-400 shrink-0 w-[120px]">Dispatched Date:</span>
                <span className="text-gray-800">{data.dispatched_date ? formatDate(data.dispatched_date) : "\u2014"}</span>
              </div>
              <div className="flex items-baseline text-xs">
                <span className="font-medium text-gray-400 shrink-0 w-[120px]">Waybill ID:</span>
                <span className="text-gray-800">{data.waybill_id || "\u2014"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Items Table ═══════════════════════════════════════ */}
        <div className="mb-6 overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--primary, #2563eb)" }}>
                <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-white w-8">#</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-white w-24">Category</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-white">Product</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-white w-12">Qty</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-white w-28">
                  Unit Price ({getCurrencySymbol()})
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-white w-28">
                  Total ({getCurrencySymbol()})
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No items</td>
                </tr>
              ) : (
                data.items.map((item, i) => (
                  <tr
                    key={item.id}
                    className={cn(
                      "border-b border-gray-100 transition-colors",
                      i % 2 === 1 ? "bg-gray-50/50" : "bg-white",
                      "hover:bg-gray-50"
                    )}
                  >
                    <td className="px-3 py-3 text-center text-gray-500 text-xs tabular-nums">{i + 1}</td>
                    <td className="px-3 py-3 text-left text-xs text-gray-600">{item.category || "\u2014"}</td>
                    <td className="px-3 py-3">
                      <p className="text-gray-800 font-medium">{item.product_name}</p>
                      {item.notes && <p className="text-xs text-gray-400 italic mt-0.5">{item.notes}</p>}
                    </td>
                    <td className="px-3 py-3 text-center tabular-nums text-gray-700">{item.quantity}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-600">{formatPlainNumber(item.unit_price)}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-gray-800">
                      {formatPlainNumber(item.quantity * item.unit_price)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ═══ Payment Summary ═══════════════════════════════════ */}
        <div className="flex justify-end mb-6">
          <div className="w-full max-w-xs rounded-xl border border-gray-200 bg-gray-50/80 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-800 tabular-nums">{fmtCurrency(subtotal)}</span>
              </div>
              {discountVal > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Discount{data.discount_type === "percentage" ? ` (${data.discount}%)` : ""}
                  </span>
                  <span className="font-medium text-destructive tabular-nums">-{fmtCurrency(discountVal)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Delivery Charge</span>
                <span className="font-medium text-gray-800 tabular-nums">{fmtCurrency(data.delivery_charge)}</span>
              </div>
              <div className="border-t border-gray-200" />
              <div className="flex items-center justify-between">
                <span
                  className="text-base font-bold"
                  style={{ color: "var(--primary, #2563eb)" }}
                >
                  Grand Total
                </span>
                <span
                  className="text-base font-bold tabular-nums"
                  style={{ color: "var(--primary, #2563eb)" }}
                >
                  {fmtCurrency(data.total)}
                </span>
              </div>
              {data.advance_paid > 0 && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Advance Paid</span>
                    <span className="font-medium text-success tabular-nums">{fmtCurrency(data.advance_paid)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">Balance Due</span>
                    <span className="text-base font-bold tabular-nums text-gray-900">
                      {fmtCurrency(data.balance_remaining)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Thank You (above footer divider) ═══════════════ */}
      <div className="text-center text-xs text-gray-400 px-10 pb-2">
        Thank you for choosing {business.name || "BizRavana"}.
      </div>

      {/* ═══ Footer ══════════════════════════════════════════════ */}
      <div className="border-t border-gray-200 px-10 py-4">
        <div className="flex flex-row justify-between gap-1 text-xs text-gray-400">
          <p className="text-left">
            This invoice was generated electronically. No signature is required.
          </p>
          <p className="text-right">
            Powered by{" "}
            <span
              className="font-medium"
              style={{ color: "var(--primary, #2563eb)" }}
            >
              BizRavana.com
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
