"use client";

import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  ShoppingCart,
  X,
  CheckCircle2,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatEnumLabel } from "@/lib/utils";
import { formatPhoneNumber } from "@/lib/formatters";
import type { QuotationFormData } from "./types";
import { formatCurrency, formatDate } from "./utils";
import { useWhatsAppAction } from "@/components/whatsapp/use-whatsapp-action";
import { quotationPreviewToTemplateData } from "@/components/whatsapp/whatsapp-actions";
import { useIsMobile } from "@/hooks/use-media-query";

// ─── Props ─────────────────────────────────────────────────────────

interface QuotationPreviewProps {
  data: QuotationFormData;
  onBack: () => void;
  onEdit?: () => void;
  onStatusChange?: (status: string) => void;
  onConvertToOrder?: () => void;
  convertedOrderId?: string | null;
}

// ─── Helpers ───────────────────────────────────────────────────────

// WhatsApp share handled by useWhatsAppAction hook + quotationPreviewToTemplateData mapper

function generateQuotationPdf(data: QuotationFormData) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("QUOTATION", pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Quotation #${data.quotation_number}`, pageWidth / 2, 33, { align: "center" });
  doc.text(`Date: ${formatDate(data.created_date)}`, pageWidth / 2, 39, { align: "center" });

  doc.setDrawColor(200, 200, 200);
  doc.line(15, 44, pageWidth - 15, 44);

  let y = 52;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Customer Information", 15, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const customerInfo = [
    ["Name", data.customer_name],
    ["Phone", formatPhoneNumber(data.phone)],
    ["WhatsApp", formatPhoneNumber(data.whatsapp) || "—"],
    ["Email", data.email || "—"],
    ["Address", data.address],
    ["District", data.district || "—"],
    ["City", data.nearest_city || "—"],
  ];

  customerInfo.forEach(([label, value]) => {
    doc.text(`${label}:`, 20, y);
    doc.text(String(value), 55, y);
    y += 5;
  });

  y += 4;
  const tableBody = data.items.map((item, i) => [
    String(i + 1),
    item.category || "—",
    item.product_name,
    String(item.quantity),
    `${formatCurrency(item.unit_price)}`,
    `${formatCurrency(item.quantity * item.unit_price)}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["#", "Category", "Product", "Qty", "Unit Price", "Total"]],
    body: tableBody,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 8 }, 1: { cellWidth: 28 }, 2: { cellWidth: 50 },
      3: { cellWidth: 14, halign: "center" }, 4: { cellWidth: 28, halign: "right" },
      5: { cellWidth: 28, halign: "right" },
    },
    margin: { left: 15, right: 15 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 15, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const discountVal =
    data.discount_type === "percentage"
      ? data.subtotal * (Math.min(data.discount, 100) / 100)
      : data.discount;

  const summaryLines = [
    { label: "Subtotal", value: data.subtotal },
    { label: "Discount", value: discountVal, suffix: data.discount_type === "percentage" ? ` (${data.discount}%)` : "" },
    { label: "Delivery Charge", value: data.delivery_charge },
    { label: "Grand Total", value: data.grand_total, bold: true },
  ];

  const rightX = pageWidth - 15;
  const leftX = rightX - 70;
  summaryLines.forEach((line) => {
    if (line.bold) doc.setFont("helvetica", "bold");
    else doc.setFont("helvetica", "normal");
    doc.text(`${line.label}${line.suffix || ""}:`, leftX, y);
    doc.text(`${formatCurrency(line.value)}`, rightX, y, { align: "right" });
    y += 6;
  });

  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Status: ${formatEnumLabel(data.status)}`, 15, y);
  y += 5;
  if (data.expiry_date) {
    doc.text(`Valid Until: ${formatDate(data.expiry_date)}`, 15, y);
    y += 5;
  }

  if (data.remarks) {
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Remarks:", 15, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const splitRemarks = doc.splitTextToSize(data.remarks, pageWidth - 30);
    (splitRemarks as string[]).forEach((line: string) => { doc.text(line, 15, y); y += 5; });
  }

  doc.save(`quotation-${data.quotation_number}.pdf`);
}

// ─── Constants ─────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
] as const;

// ═══════════════════════════════════════════════════════════════════
// SUBCOMPONENTS
// ═══════════════════════════════════════════════════════════════════

// ─── QuotationPreviewHeader ─────────────────────────────────────

function QuotationPreviewHeader({
  data,
  onBack,
  onEdit,
  onConvertToOrder,
  convertedOrderId,
  onWhatsApp,
  isMobile,
}: {
  data: QuotationFormData;
  onBack: () => void;
  onEdit?: () => void;
  onConvertToOrder?: () => void;
  convertedOrderId?: string | null;
  onWhatsApp?: () => void;
  isMobile?: boolean;
}) {
  if (isMobile) {
    return (
      <div>
        {/* Top row: quotation info + close */}
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground leading-tight">
              Quotation #{data.quotation_number}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground/70">
              {formatDate(data.created_date)}
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

        {/* Row 1: Full-width Convert to Order / Converted badge */}
        {convertedOrderId ? (
          <div className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success">
            <CheckCircle2 className="size-3.5" />
            Converted to Order
          </div>
        ) : (
          onConvertToOrder && data.status !== "converted" && (
            <Button
              variant="default"
              size="sm"
              onClick={onConvertToOrder}
              className="mt-4 w-full gap-1.5 text-sm font-medium h-10 bg-success hover:bg-success/90 text-success-foreground"
            >
              <ShoppingCart className="size-3.5" />
              Convert to Order
            </Button>
          )
        )}

        {/* Row 2: Action buttons */}
        <div className="mt-3 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onWhatsApp}
            disabled={!(data.whatsapp || data.phone)}
            className="flex-1 gap-1.5 text-sm font-medium h-9"
          >
            <MessageCircle className="size-3.5" />
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateQuotationPdf(data)}
            className="flex-1 gap-1.5 text-sm font-medium h-9"
          >
            <FileText className="size-3.5" />
            Invoice
          </Button>
          {onEdit && (
            <Button
              variant="outline"
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
    );
  }

  return (
    <div className="flex items-start justify-between gap-6">
      {/* Left: Quotation info */}
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Quotation #{data.quotation_number}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {formatDate(data.created_date)}
        </p>
      </div>

      {/* Right: Action buttons */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Convert to Order */}
        {onConvertToOrder && data.status !== "converted" && (
          <Button
            variant="default"
            size="sm"
            onClick={onConvertToOrder}
            className="gap-1.5 text-sm font-medium bg-success hover:bg-success/90 text-success-foreground"
          >
            <ShoppingCart className="size-3.5" />
            Convert to Order
          </Button>
        )}
        {convertedOrderId && (
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-success/10 px-3 py-1.5 text-sm font-medium text-success">
            <CheckCircle2 className="size-3.5" />
            Converted
          </div>
        )}
        {/* WhatsApp share */}
        <Button
          variant="default"
          size="sm"
          onClick={onWhatsApp}
          disabled={!(data.whatsapp || data.phone)}
          className="gap-1.5 text-sm font-medium"
        >
          <MessageCircle className="size-3.5" />
          WhatsApp
        </Button>
        {/* PDF download */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateQuotationPdf(data)}
          className="gap-1.5 text-sm font-medium"
        >
          <FileText className="size-3.5" />
          Invoice
        </Button>
        {/* Edit */}
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-1.5 text-sm font-medium"
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
        )}
        <button
          type="button"
          onClick={onBack}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Close"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

// ─── CustomerInformationCard ────────────────────────────────────

function CustomerInformationCard({
  data,
  onStatusChange,
  isMobile,
}: {
  data: QuotationFormData;
  onStatusChange?: (status: string) => void;
  isMobile?: boolean;
}) {
  if (isMobile) {
    return (
      <div className="rounded-xl glass-card">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Customer Details
          </h3>
        </div>
        <div className="px-4 pb-4 space-y-2">
          {/* Name */}
          <div>
            <span className="block text-sm text-muted-foreground mb-0.5">Name</span>
            <span className="text-sm text-foreground">{data.customer_name || "—"}</span>
          </div>

          {/* Address */}
          <div>
            <span className="block text-sm text-muted-foreground mb-0.5">Address</span>
            <span className="text-sm text-foreground">{data.address || "—"}</span>
          </div>

          {/* WhatsApp & Phone inline */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-1.5">
              {data.whatsapp ? (
                <>
                  <MessageCircle className="size-3.5 shrink-0 text-emerald-500" />
                  <span className="text-sm text-foreground truncate">{formatPhoneNumber(data.whatsapp)}</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground/50">WhatsApp —</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {data.phone ? (
                <>
                  <Phone className="size-3.5 shrink-0 text-red-500" />
                  <span className="text-sm text-foreground truncate">{formatPhoneNumber(data.phone)}</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground/50">Phone —</span>
              )}
            </div>
          </div>

          {/* Email */}
          {data.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="size-3.5 shrink-0 text-blue-500" />
              <span className="text-sm text-foreground">{data.email}</span>
            </div>
          )}

          {/* District & City inline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-sm text-muted-foreground mb-0.5">District</span>
              <span className="text-sm text-foreground">{data.district || "—"}</span>
            </div>
            <div>
              <span className="block text-sm text-muted-foreground mb-0.5">Nearest City</span>
              <span className="text-sm text-foreground">{data.nearest_city || "—"}</span>
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <span className="block text-sm text-muted-foreground mb-0.5">Expiry Date</span>
            <span className="text-sm text-foreground">{data.expiry_date ? formatDate(data.expiry_date) : "—"}</span>
          </div>

          {/* Status dropdown */}
          <div className="pt-1">
            <label className="block text-sm text-muted-foreground mb-0.5">Quotation Status</label>
            <Select
              value={data.status}
              onValueChange={(v) => v && onStatusChange?.(v)}
            >
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue>{data.status}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl glass-card transition-shadow duration-200 hover:shadow-sm">
      <div className="p-6">
        {/* ─── Top row: Name + Status dropdown ──────────────── */}
        <div className="flex items-start justify-between gap-6">
          {/* Left: Customer name, WhatsApp, Phone */}
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-foreground">
              {data.customer_name}
            </h2>
            <div className="mt-3 space-y-2">
              {data.whatsapp && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/10">
                    <MessageCircle className="size-3 text-emerald-500" />
                  </div>
                  <span className="font-medium text-success">
                    {formatPhoneNumber(data.whatsapp)}
                  </span>
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex size-6 items-center justify-center rounded-full bg-red-500/10">
                    <Phone className="size-3 text-red-500" />
                  </div>
                  <span className="text-muted-foreground">{formatPhoneNumber(data.phone)}</span>
                </div>
              )}
              {data.email && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex size-6 items-center justify-center rounded-full bg-blue-500/10">
                    <Mail className="size-3 text-blue-500" />
                  </div>
                  <span className="text-muted-foreground">{data.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Status dropdown */}
          <div className="shrink-0" style={{ minWidth: 140 }}>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
              Quotation Status
            </label>
            <Select
              value={data.status}
              onValueChange={(v) => v && onStatusChange?.(v)}
            >
              <SelectTrigger className="mt-1 w-full h-8 text-sm">
                <SelectValue>
                  {data.status}
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
          </div>
        </div>

        {/* ─── Divider ───────────────────────────────────────── */}
        <div className="my-5 border-t border-border/50" />

        {/* ─── Bottom row: Address + Expiry ────────────────── */}
        <div className="flex items-start justify-between gap-6">
          {/* Left: Address */}
          <div className="min-w-0 flex-1">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
              Customer Address
            </label>
            {data.address ? (
              <address className="mt-2 not-italic text-sm leading-relaxed text-foreground">
                <span className="block">{data.address}</span>
              </address>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground/50">—</p>
            )}
            <div className="mt-1.5 flex gap-4 text-sm">
              {data.district && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">District </span>
                  <span className="text-foreground">{data.district}</span>
                </div>
              )}
              {data.nearest_city && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">City </span>
                  <span className="text-foreground">{data.nearest_city}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Expiry Date */}
          <div className="shrink-0" style={{ minWidth: 140 }}>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
              Expiry Date
            </label>
            <p className="mt-2 text-sm text-foreground">
              {data.expiry_date ? formatDate(data.expiry_date) : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ConvertCard ─────────────────────────────────────────────

function ConvertCard({
  onConvertToOrder,
  convertedOrderId,
}: {
  onConvertToOrder?: () => void;
  convertedOrderId?: string | null;
}) {
  if (convertedOrderId) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl glass-card p-8 transition-shadow duration-200 hover:shadow-sm">
        <div className="flex size-12 items-center justify-center rounded-xl bg-success/10">
          <CheckCircle2 className="size-6 text-success" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-foreground">
          Converted to Order
        </h3>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          This quotation has been converted to an order.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center rounded-xl glass-card p-8 transition-shadow duration-200 hover:shadow-sm">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
        <ShoppingCart className="size-6 text-primary" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">
        Ready to Convert
      </h3>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Convert this quotation into a sales order to process it further.
      </p>
      {onConvertToOrder && (
        <Button
          variant="gradient"
          size="sm"
          onClick={onConvertToOrder}
          className="mt-5 gap-1.5"
        >
          <ShoppingCart className="size-3.5" />
          Convert to Order
        </Button>
      )}
    </div>
  );
}

// ─── QuotationItemsTable ────────────────────────────────────────────

function QuotationItemsTable({ items }: { items: QuotationFormData["items"] }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/60">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/40 bg-muted/20">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Description
            </th>
            <th className="w-16 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Qty
            </th>
            <th className="w-28 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Unit Price
            </th>
            <th className="w-28 px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={item.id}
              className="border-b border-border/20 transition-colors duration-150 hover:bg-muted/10 last:border-b-0"
            >
              <td className="px-5 py-3.5">
                <p className="text-sm font-medium text-foreground">
                  {item.product_name || `Item #${i + 1}`}
                </p>
                {item.category && (
                  <p className="mt-0.5 text-sm text-muted-foreground/60">
                    {item.category}
                  </p>
                )}
                {item.notes && (
                  <p className="mt-0.5 text-sm italic text-muted-foreground/40">
                    {item.notes}
                  </p>
                )}
              </td>
              <td className="px-4 py-3.5 text-center text-sm tabular-nums text-foreground">
                {item.quantity}
              </td>
              <td className="px-4 py-3.5 text-right text-sm tabular-nums text-muted-foreground">
                {formatCurrency(item.unit_price)}
              </td>
              <td className="px-5 py-3.5 text-right text-sm font-semibold tabular-nums text-foreground">
                {formatCurrency(item.quantity * item.unit_price)}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="px-5 py-8 text-center text-sm text-muted-foreground/50"
              >
                No items
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── QuotationSummary ───────────────────────────────────────────────

function QuotationSummary({ data }: { data: QuotationFormData }) {
  const discountVal =
    data.discount_type === "percentage"
      ? data.subtotal * (Math.min(data.discount, 100) / 100)
      : data.discount;

  return (
    <div className="ml-auto w-full max-w-[340px] space-y-0">
      {/* Subtotal */}
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-muted-foreground">Subtotal</span>
        <span className="text-sm tabular-nums text-foreground">
          {formatCurrency(data.subtotal)}
        </span>
      </div>

      {/* Discount (if any) */}
      {data.discount > 0 && (
        <div className="flex items-center justify-between py-1.5">
          <span className="text-sm text-muted-foreground">
            Discount{data.discount_type === "percentage" ? ` (${data.discount}%)` : ""}
          </span>
          <span className="text-sm tabular-nums text-destructive">
            {formatCurrency(discountVal)}
          </span>
        </div>
      )}

      {/* Delivery Charge */}
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-muted-foreground">Delivery Charge</span>
        <span className="text-sm tabular-nums text-foreground">
          {formatCurrency(data.delivery_charge)}
        </span>
      </div>

      {/* Grand Total */}
      <div className="my-1.5 border-t border-border/40" />
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm font-medium text-foreground">Grand Total</span>
        <span className="text-lg font-bold tabular-nums text-primary">
          {formatCurrency(data.grand_total)}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

// ─── QuotationItemsMobileCard ─────────────────────────────────────

function QuotationItemsMobileCard({ items }: { items: QuotationFormData["items"] }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
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
      ))}
      {items.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground/50">
          No items
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function QuotationPreview({
  data,
  onBack,
  onEdit,
  onStatusChange,
  onConvertToOrder,
  convertedOrderId,
}: QuotationPreviewProps) {
  const { handleAction, renderDialogs } = useWhatsAppAction();
  const isMobile = useIsMobile();

  const handleWhatsApp = useCallback(() => {
    const phone = data.whatsapp || data.phone;
    if (!phone) return;
    const templateData = quotationPreviewToTemplateData(data);
    handleAction("quotation_preview_whatsapp", templateData, phone);
  }, [data, handleAction]);

  // ─── Escape key exits preview ─────────────────────────────────
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

  return (
    <>
      {renderDialogs()}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex flex-col rounded-2xl glass-card"
      >
        {/* ═══════ Header ════════════════════════════════════════════ */}
        <div className={isMobile ? "px-4 pt-4 pb-3" : "px-8 pt-7 pb-6"}>
          <QuotationPreviewHeader
            data={data}
            onBack={onBack}
            onEdit={onEdit}
            onConvertToOrder={onConvertToOrder}
            convertedOrderId={convertedOrderId}
            onWhatsApp={handleWhatsApp}
            isMobile={isMobile}
          />
        </div>

      <div className="border-t border-border/40" />

      {/* ═══════ Scrollable Content ═══════════════════════════════ */}
      <div
        className={cn("flex-1 overflow-y-auto", isMobile ? "px-4" : "px-8")}
        style={{ maxHeight: "calc(100vh - 320px)" }}
      >
        <div className={isMobile ? "py-4 space-y-4" : "py-8"}>
          {isMobile ? (
            <>
              {/* Customer Info */}
              <CustomerInformationCard
                data={data}
                onStatusChange={onStatusChange}
                isMobile={true}
              />
              {/* Items */}
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Quotation Items
                </h3>
                <QuotationItemsMobileCard items={data.items} />
              </div>
              {/* Summary */}
              <QuotationSummary data={data} />
            </>
          ) : (
            <>
              {/* ─── Two-column cards ───────────────────────────── */}
              <div className="grid grid-cols-[62%_38%] gap-8">
                {/* Left: Customer Information Card */}
                <CustomerInformationCard
                  data={data}
                  onStatusChange={onStatusChange}
                />

                {/* Right: Convert Card */}
                <ConvertCard
                  onConvertToOrder={onConvertToOrder}
                  convertedOrderId={convertedOrderId}
                />
              </div>

              {/* ─── Quotation Items Table ──────────────────────── */}
              <div className="mt-8">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Quotation Items
                </h3>
                <QuotationItemsTable items={data.items} />
              </div>

              {/* ─── Quotation Summary ──────────────────────────── */}
              <div className="mt-8">
                <QuotationSummary data={data} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══════ Footer ════════════════════════════════════════════ */}
      <div className="border-t border-border/40">
        {isMobile ? (
          <div className="px-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-1.5 text-sm font-medium"
            >
              <ArrowLeft className="size-3.5" />
              Back to Quotations
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-8 py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-1.5 text-sm font-medium"
            >
              <ArrowLeft className="size-3.5" />
              Back to Quotations
            </Button>
            <p className="text-sm text-muted-foreground/50">
              Quotation #{data.quotation_number} &middot; {formatEnumLabel(data.status)}
            </p>
          </div>
        )}
      </div>      </motion.div>
    </>
  );
  }
