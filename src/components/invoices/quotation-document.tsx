"use client";

import { Building2, Globe, Mail, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPhoneNumber } from "@/lib/formatters";
import { formatDate as fmtDate } from "@/lib/formatters";
import { usePreferences } from "@/stores/preferences-store";
import { useQuotationSettings } from "@/stores/quotation-settings-store";
import type { QuotationFormData } from "@/components/quotations/types";
import type { BusinessProfile } from "./invoice-document";

export type { BusinessProfile };

interface QuotationDocumentProps {
  data: QuotationFormData;
  business: BusinessProfile;
}

// ─── Helpers ───────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return "\u2014";
  return fmtDate(dateStr);
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "Draft", sent: "Sent", accepted: "Accepted",
    rejected: "Rejected", expired: "Expired",
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
// QUOTATION DOCUMENT COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function QuotationDocument({ data, business }: QuotationDocumentProps) {
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

          {/* Right: Quotation Title */}
          <div className="text-right shrink-0">
            <h2
              className="text-4xl font-bold tracking-tight leading-none"
              style={{ color: "var(--primary, #2563eb)" }}
            >
              QUOTATION
            </h2>
          </div>
        </div>

        {/* ═══ Divider ══════════════════════════════════════════ */}
        <div
          className="my-6 h-px"
          style={{ backgroundColor: "var(--primary, #2563eb)", opacity: 0.3 }}
        />

        {/* ═══ Customer & Quotation Details (Two-Column) ═══════ */}
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

          {/* Right: Quotation Details */}
          <div>
            <h3
              className="text-sm font-bold uppercase tracking-wider mb-3"
              style={{ color: "var(--primary, #2563eb)" }}
            >
              Quotation Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-baseline text-xs">
                <span className="font-medium text-gray-400 shrink-0 w-[120px]">Quotation No:</span>
                <span className="text-gray-800">#{data.quotation_number}</span>
              </div>
              <div className="flex items-baseline text-xs">
                <span className="font-medium text-gray-400 shrink-0 w-[120px]">Date:</span>
                <span className="text-gray-800">{formatDate(data.created_date)}</span>
              </div>
              {data.expiry_date && (
                <div className="flex items-baseline text-xs">
                  <span className="font-medium text-gray-400 shrink-0 w-[120px]">Valid Until:</span>
                  <span className="text-gray-800">{formatDate(data.expiry_date)}</span>
                </div>
              )}
              <div className="flex items-baseline text-xs">
                <span className="font-medium text-gray-400 shrink-0 w-[120px]">Status:</span>
                <span className="text-gray-800">
                  {statusLabel(data.status)}
                </span>
              </div>
              {data.remarks && (
                <div className="flex items-baseline text-xs">
                  <span className="font-medium text-gray-400 shrink-0 w-[120px]">Remarks:</span>
                  <span className="text-gray-800">{data.remarks}</span>
                </div>
              )}
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
                  {fmtCurrency(data.grand_total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Bank Details ════════════════════════════════════════ */}
      {(() => {
        const bank = useQuotationSettings.getState();
        if (!bank.showBankDetails) return null;
        const hasAny = bank.bankAccountName || bank.bankName || bank.accountNumber || bank.branch;
        if (!hasAny) return null;
        return (
          <div className="px-10 pb-4">
            <div
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: "var(--primary, #2563eb)" }}
            >
              Bank Details
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-600">
              {bank.bankAccountName && (
                <>
                  <span className="font-medium text-gray-400">Account Name:</span>
                  <span>{bank.bankAccountName}</span>
                </>
              )}
              {bank.bankName && (
                <>
                  <span className="font-medium text-gray-400">Bank:</span>
                  <span>{bank.bankName}</span>
                </>
              )}
              {bank.accountNumber && (
                <>
                  <span className="font-medium text-gray-400">Account No:</span>
                  <span>{bank.accountNumber}</span>
                </>
              )}
              {bank.branch && (
                <>
                  <span className="font-medium text-gray-400">Branch:</span>
                  <span>{bank.branch}</span>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* ═══ Thank You (above footer divider) ═══════════════════ */}
      <div className="text-center text-xs text-gray-400 px-10 pb-2">
        Thank you for choosing {business.name || "BizRavana"}.
      </div>

      {/* ═══ Footer ══════════════════════════════════════════════ */}
      <div className="border-t border-gray-200 px-10 py-4">
        <div className="flex flex-row justify-between gap-1 text-xs text-gray-400">
          <p className="text-left">
            This quotation was generated electronically. No signature is required.
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
