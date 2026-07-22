"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  ImageIcon,
  Printer,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Truck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatEnumLabel } from "@/lib/utils";
import { formatPhoneNumber } from "@/lib/formatters";
import type { OrderFormData } from "./types";
import type { ShippingLabelData } from "@/lib/shipping-label/types";
import { formatCurrency } from "./utils";
import { toast } from "sonner";
import { ShipmentStatusPanel } from "./shipment-status-panel";
import { useIsMobile } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import { useWhatsAppAction } from "@/components/whatsapp/use-whatsapp-action";
import { orderPreviewToTemplateData } from "@/components/whatsapp/whatsapp-actions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Separator } from "@/components/ui/separator";
import { ShippingLabelDialog } from "@/components/orders/shipping-label-dialog";
import { fetchLabelData } from "@/lib/shipping-label/fetch-data";
import { generateShippingLabelPdf } from "@/lib/shipping-label/generate-pdf";
import { validateLabelData } from "@/lib/shipping-label/validate";

// ─── Props ─────────────────────────────────────────────────────────

interface OrderPreviewProps {
  data: OrderFormData;
  onBack: () => void;
  onEdit?: () => void;
  onStatusChange?: (status: string) => void;
  onPaymentStatusChange?: (paymentStatus: string) => void;
}

// ─── Constants ─────────────────────────────────────────────────────

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

// ─── Helpers ───────────────────────────────────────────────────────

import { formatDate as formatDatePref } from "@/lib/formatters";

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return formatDatePref(dateStr);
}

// ─── PDF Generation ────────────────────────────────────────────────

function generateInvoicePdf(data: OrderFormData) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Order #${data.order_number}`, pageWidth / 2, 33, { align: "center" });
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
  doc.text("Payment Summary", 15, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const paymentLines = [
    { label: "Subtotal", value: data.subtotal },
    { label: "Discount", value: data.discount, suffix: data.discount_type === "percentage" ? ` (${data.discount}%)` : "" },
    { label: "Delivery Charge", value: data.delivery_charge },
    { label: "Grand Total", value: data.total, bold: true },
    { label: "Advance Paid", value: data.advance_paid },
    { label: "Balance", value: data.balance_remaining, bold: true },
  ];

  const rightX = pageWidth - 15;
  const leftX = rightX - 70;
  paymentLines.forEach((line) => {
    if (line.bold) doc.setFont("helvetica", "bold");
    else doc.setFont("helvetica", "normal");
    doc.text(`${line.label}${line.suffix || ""}:`, leftX, y);
    doc.text(`Rs. ${formatCurrency(line.value)}`, rightX, y, { align: "right" });
    y += 6;
  });

  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Payment Method: ${formatEnumLabel(data.payment_method)}`, 15, y);
  y += 5;
  doc.text(`Status: ${formatEnumLabel(data.status)}`, 15, y);
  y += 5;
  doc.text(`Payment Status: ${formatEnumLabel(data.payment_status)}`, 15, y);
  y += 5;
  doc.text(`Order Source: ${formatEnumLabel(data.order_source)}`, 15, y);

  if (data.expected_delivery_date) {
    y += 5;
    doc.text(`Expected Delivery: ${formatDate(data.expected_delivery_date)}`, 15, y);
  }

  if (data.remarks) {
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Remarks:", 15, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const splitRemarks = doc.splitTextToSize(data.remarks, pageWidth - 30);
    splitRemarks.forEach((line: string) => { doc.text(line, 15, y); y += 5; });
  }

  doc.save(`invoice-${data.order_number}.pdf`);
}

// ─── WhatsApp Share ────────────────────────────────────────────────

// Replaced by useWhatsAppAction hook and orderPreviewToTemplateData mapper

// ═══════════════════════════════════════════════════════════════════
// SUBCOMPONENTS
// ═══════════════════════════════════════════════════════════════════

// ─── OrderPreviewHeader ─────────────────────────────────────────

function OrderPreviewHeader({
  data,
  onBack,
  onEdit,
  onWhatsApp,
  onPrintLabel,
  isMobile,
}: {
  data: OrderFormData;
  onBack: () => void;
  onEdit?: () => void;
  onWhatsApp?: () => void;
  onPrintLabel?: () => void;
  isMobile?: boolean;
}) {
  if (isMobile) {
    return (
      <div>
        {/* Top row: order info + close */}
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground leading-tight">
              Order #{data.order_number}
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

        {/* Bottom row: action buttons */}
        <div className="mt-4 flex items-center gap-2">
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
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-sm font-medium h-9"
                >
                  <Printer className="size-3.5" />
                  Print
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="min-w-[140px]">
              <DropdownMenuItem onClick={() => generateInvoicePdf(data)}>
                <FileText className="size-4" />
                Invoice
              </DropdownMenuItem>
              {data.waybill_id && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onPrintLabel?.()}>
                    <Truck className="size-4" />
                    Shipping Label
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
      {/* Left: Order info */}
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Order #{data.order_number}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {formatDate(data.created_date)}
        </p>
      </div>

      {/* Right: Action buttons */}
      <div className="flex shrink-0 items-center gap-2">
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
        {data.waybill_id && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPrintLabel}
            className="gap-1.5 text-sm font-medium"
          >
            <Truck className="size-3.5" />
            Shipping Label
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateInvoicePdf(data)}
          className="gap-1.5 text-sm font-medium"
        >
          <FileText className="size-3.5" />
          Invoice
        </Button>
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
  onPaymentStatusChange,
  isMobile,
}: {
  data: OrderFormData;
  onStatusChange?: (status: string) => void;
  onPaymentStatusChange?: (paymentStatus: string) => void;
  isMobile?: boolean;
}) {
  const hasWaybill = !!data.waybill_id;

  if (isMobile) {
    return (
      <div className="rounded-xl border border-border/40 bg-card">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Customer Details
          </h3>
        </div>
        <div className="px-4 pb-5 space-y-5">
          {/* Name */}
          <div>
            <span className="block text-xs font-medium text-muted-foreground mb-1">Name</span>
            <span className="text-lg font-semibold text-foreground">{data.customer_name || "—"}</span>
          </div>

          {/* Address */}
          <div>
            <span className="block text-xs font-medium text-muted-foreground mb-1">Address</span>
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
              <span className="block text-xs font-medium text-muted-foreground mb-1">District</span>
              <span className="text-sm text-foreground">{data.district || "—"}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-muted-foreground mb-1">Nearest City</span>
              <span className="text-sm text-foreground">{data.nearest_city || "—"}</span>
            </div>
          </div>

          {/* Tracking */}
          {hasWaybill && (
            <div className="flex items-center gap-2">
              <Truck className="size-3.5 shrink-0 text-primary/60" />
              <span className="text-sm font-medium text-foreground">{data.waybill_id}</span>
            </div>
          )}

          {/* Divider before status */}
          <div className="border-t border-border/30" />

          {/* Status dropdowns */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Order Status</label>
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
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Payment Status</label>
              <Select
                value={data.payment_status}
                onValueChange={(v) => v && onPaymentStatusChange?.(v)}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue>{data.payment_status}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl glass-card transition-shadow duration-200 hover:shadow-sm">
      <div className="p-6">
        {/* ─── Top row: Name + Status dropdowns ──────────────── */}
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
              <span className="text-success">
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

          {/* Right: Status dropdowns - horizontal */}
          <div className="shrink-0 flex gap-3" style={{ minWidth: 160 }}>
            <div className="flex-1">
              <label className="block text-xs font-medium tracking-wider text-muted-foreground/70">
                Order Status
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
            <div className="flex-1">
              <label className="block text-xs font-medium tracking-wider text-muted-foreground/70">
                Payment Status
              </label>
              <Select
                value={data.payment_status}
                onValueChange={(v) => v && onPaymentStatusChange?.(v)}
              >
                <SelectTrigger className="mt-1 w-full h-8 text-sm">
                  <SelectValue>
                    {data.payment_status}
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
            </div>
          </div>
        </div>

        {/* ─── Divider ───────────────────────────────────────── */}
        <div className="my-5 border-t border-border/50" />

        {/* ─── Bottom row: Address + Tracking ────────────────── */}
        <div className="flex items-start justify-between gap-6">
          {/* Left: Delivery Address */}
          <div className="min-w-0 flex-1">
            <label className="text-xs font-medium tracking-wider text-muted-foreground/70">
              Delivery Address
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
                  <span className="text-xs font-medium tracking-wider text-muted-foreground/70">District </span>
                  <span className="text-foreground">{data.district}</span>
                </div>
              )}
              {data.nearest_city && (
                <div>
                  <span className="text-xs font-medium tracking-wider text-muted-foreground/70">City </span>
                  <span className="text-foreground">{data.nearest_city}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Tracking */}
          <div className="shrink-0" style={{ minWidth: 160 }}>
            <label className="block text-xs font-medium tracking-wider text-muted-foreground/70">
              Tracking
            </label>
            {hasWaybill ? (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary/5 px-2.5 py-1.5">
                <Truck className="size-3.5 shrink-0 text-primary/60" />
                <span className="text-sm font-medium text-foreground">{data.waybill_id}</span>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground/50">—</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ItemThumbnail ─────────────────────────────────────────────
/** Small thumbnail with click-to-open lightbox, used inside the Description column */
function ItemThumbnail({ url }: { url: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger onClick={() => setOpen(true)} className="block">
        <div className="group relative size-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border/50 bg-muted/30 transition-all duration-200 hover:border-primary/40 hover:shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Item image"
            className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] w-auto p-2" showCloseButton={true}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Item image"
          className="max-h-[85vh] w-auto rounded-lg object-contain"
        />
      </DialogContent>
    </Dialog>
  );
}

// ─── OrderItemsMobileCard ─────────────────────────────────────

function OrderItemsMobileCard({ items, itemImagesMap }: { items: OrderFormData["items"]; itemImagesMap: Record<string, string[]> }) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const itemImgUrls = itemImagesMap[item.id] || [];
        return (
          <div
            key={item.id}
            className="rounded-2xl glass-card p-4"
          >
            <div className="flex items-start gap-3">
              {/* Thumbnail */}
              {itemImgUrls.length > 0 ? (
                <div className="shrink-0">
                  <ItemThumbnail url={itemImgUrls[0]} />
                </div>
              ) : (
                <div className="flex shrink-0 size-10 items-center justify-center rounded-lg bg-muted/30">
                  <ImageIcon className="size-4 text-muted-foreground/20" />
                </div>
              )}
              {/* Details & Pricing */}
              <div className="min-w-0 flex-1 space-y-1.5">
                {/* Row 1: Item name | Category */}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.product_name || `Item #${i + 1}`}
                  </p>
                  {item.category && (
                    <span className="shrink-0 text-xs text-muted-foreground/60">
                      {item.category}
                    </span>
                  )}
                </div>

                <div className="border-t border-border/20" />

                {/* Row 2: Qty */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Qty</span>
                  <span className="text-sm font-medium tabular-nums text-foreground">{item.quantity}</span>
                </div>

                {/* Row 3: Unit Price */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Unit Price</span>
                  <span className="text-sm font-medium tabular-nums text-foreground">{formatCurrency(item.unit_price)}</span>
                </div>

                {/* Row 4: Total */}
                <div className="flex items-center justify-between gap-2 border-t border-border/20 pt-2">
                  <span className="text-xs font-semibold text-foreground">Total</span>
                  <span className="text-sm font-bold tabular-nums text-primary">{formatCurrency(item.quantity * item.unit_price)}</span>
                </div>

                {/* Notes */}
                {item.notes && (
                  <p className="text-xs italic text-muted-foreground/50 pt-1">{item.notes}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {items.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground/50">
          No items
        </p>
      )}
    </div>
  );
}

// ─── OrderItemsTable ────────────────────────────────────────────

function OrderItemsTable({ items, itemImagesMap }: { items: OrderFormData["items"]; itemImagesMap: Record<string, string[]> }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/60">
      <table className="w-full"><thead>
            <tr className="border-b border-border/40 bg-muted/20">
              <th className="w-14 px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Attch.
              </th>
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
            </tr></thead><tbody>
            {items.map((item, i) => {
              const itemImgUrls = itemImagesMap[item.id] || [];
              return (
                <tr
                  key={item.id}
                  className="border-b border-border/20 transition-colors duration-150 hover:bg-muted/10 last:border-b-0"
                >
                  {/* ── Attachment column ─────────────────────── */}
                  <td className="px-2 py-3 align-middle">
                    {itemImgUrls.length > 0 ? (
                      <div className="flex justify-center">
                        <ItemThumbnail url={itemImgUrls[0]} />
                      </div>
                    ) : (
                      <span className="flex justify-center text-muted-foreground/15">
                        <ImageIcon className="size-4" />
                      </span>
                    )}
                  </td>

                  {/* ── Description column ──────────────────── */}
                  <td className="px-5 py-3.5">
                    {/* Product Name */}
                    <p className="text-sm font-medium text-foreground">
                      {item.product_name || `Item #${i + 1}`}
                    </p>

                    {/* Product Category */}
                    {item.category && (
                      <p className="mt-0.5 text-sm text-muted-foreground/60">
                        {item.category}
                      </p>
                    )}

                    {/* Item Notes */}
                    {item.notes && (
                      <p className="mt-0.5 text-sm italic text-muted-foreground/40">
                        {item.notes}
                      </p>
                    )}
                  </td>

                  {/* ── Qty ──────────────────────────────────── */}
                  <td className="px-4 py-3.5 text-center text-sm tabular-nums text-foreground">
                    {item.quantity}
                  </td>

                  {/* ── Unit Price ──────────────────────────── */}
                  <td className="px-4 py-3.5 text-right text-sm tabular-nums text-muted-foreground">
                    {formatCurrency(item.unit_price)}
                  </td>

                  {/* ── Amount ──────────────────────────────── */}
                  <td className="px-5 py-3.5 text-right text-sm font-semibold tabular-nums text-foreground">
                    {formatCurrency(item.quantity * item.unit_price)}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-sm text-muted-foreground/50"
                >
                  No items
            </td>
            </tr>
            )}
        </tbody></table>
    </div>
  );
}

// ─── OrderSummary ───────────────────────────────────────────────

function OrderSummary({ data, isMobile }: { data: OrderFormData; isMobile?: boolean }) {
  const isCod = data.payment_method === "cod";
  const isPaid = data.payment_status === "paid";
  const isPartial = data.payment_status === "advanced" && !isPaid;

  return (
    <div className={isMobile ? "w-full space-y-0" : "ml-auto w-full max-w-[340px] space-y-0"}>
      {/* Subtotal */}
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-muted-foreground">Subtotal</span>          <span className="text-sm font-medium tabular-nums text-foreground">
              {formatCurrency(data.subtotal)}
            </span>
      </div>

      {/* Discount (if any) */}
      {data.discount > 0 && (
        <div className="flex items-center justify-between py-1.5">
          <span className="text-sm text-muted-foreground">
            Discount{data.discount_type === "percentage" ? ` (${data.discount}%)` : ""}
          </span>
          <span className="text-sm font-medium tabular-nums text-destructive">
            {formatCurrency(data.discount)}
          </span>
        </div>
      )}

      {/* Delivery Charge */}
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-muted-foreground">Delivery Charge</span>          <span className="text-sm font-medium tabular-nums text-foreground">
              {formatCurrency(data.delivery_charge)}
            </span>
      </div>

      {/* Advance Payment */}
      {data.advance_paid > 0 && (
        <>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-muted-foreground">Advance Payment</span>
            <span className="text-sm font-medium tabular-nums text-success">
              {formatCurrency(data.advance_paid)}
            </span>
          </div>
          <div className="my-1.5 border-t border-border/40" />
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm font-medium text-muted-foreground">Grand Total</span>
            <span className={`text-lg font-bold tabular-nums ${isPartial ? "text-foreground" : "text-primary"}`}>
              {formatCurrency(data.total)}
            </span>
          </div>
        </>
      )}

      {/* If no advance payment, still show divider + grand total */}
      {data.advance_paid <= 0 && (
        <>
          <div className="my-1.5 border-t border-border/40" />
          <div className="flex items-center justify-between py-1.5">
            <span className="text-sm font-medium text-muted-foreground">Grand Total</span>
            <span className="text-lg font-bold tabular-nums text-primary">
              {formatCurrency(data.total)}
            </span>
          </div>
        </>
      )}

      {/* Payment status callout */}
      {isCod && (
        <div className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
          Total (COD) — collect {formatCurrency(data.total)} at delivery
        </div>
      )}
      {isPaid && (
        <div className="mt-3 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          Paid — no balance remaining
        </div>
      )}
      {isPartial && (
        <div className="flex items-center justify-between py-1.5">
          <span className="text-sm font-medium text-muted-foreground">Remaining Balance</span>
          <span className="text-lg font-bold tabular-nums text-primary">
            {formatCurrency(data.balance_remaining)}
          </span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export function OrderPreview({
  data,
  onBack,
  onEdit,
  onStatusChange,
  onPaymentStatusChange,
}: OrderPreviewProps) {
  const isMobile = useIsMobile();
  const { handleAction, renderDialogs } = useWhatsAppAction();

  // ─── Shipping Label Reprint State ─────────────────────────
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);
  const [labelData, setLabelData] = useState<ShippingLabelData | null>(null);
  const [labelDataUrl, setLabelDataUrl] = useState<string | null>(null);

  const handlePrintLabel = useCallback(async () => {
    if (!data.waybill_id || !data.id) return;
    try {
      const { data: fetchedData, error } = await fetchLabelData(data.id);
      if (fetchedData && !error) {
        // Override waybillId from the order snapshot
        fetchedData.waybillId = data.waybill_id;
        // Validate data before generating
        const validation = validateLabelData(fetchedData);
        if (!validation.valid) {
          toast.error("Cannot generate shipping label", {
            description: `Missing: ${validation.missingFields.join(", ")}`,
          });
          return;
        }
        setLabelData(fetchedData);
        const result = await generateShippingLabelPdf(fetchedData);
        setLabelDataUrl(result.dataUrl);
        setLabelDialogOpen(true);
      } else {
        console.error("Failed to fetch label data:", error);
      }
    } catch (err) {
      console.error("Failed to generate shipping label:", err);
    }
  }, [data.id, data.waybill_id]);

  const handleWhatsApp = useCallback(() => {
    const phone = data.whatsapp || data.phone;
    if (!phone) return;
    const templateData = orderPreviewToTemplateData(data);
    handleAction("order_preview_whatsapp", templateData, phone);
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

      {/* ─── Shipping Label Reprint Dialog ──────────────── */}
      <ShippingLabelDialog
        open={labelDialogOpen}
        onOpenChange={setLabelDialogOpen}
        labelData={labelData}
        initialDataUrl={labelDataUrl || undefined}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={cn(
          "flex flex-col rounded-2xl",
          isMobile
            ? "min-h-full bg-card border border-border/40"
            : "glass-card",
        )}
      >
        {/* ═══════ Header (sticky on mobile) ═════════════════════ */}
        <div className={isMobile ? "sticky top-0 z-10 bg-card px-4 pt-4 pb-3" : "px-8 pt-7 pb-6"}>
          <OrderPreviewHeader data={data} onBack={onBack} onEdit={onEdit} onWhatsApp={handleWhatsApp} onPrintLabel={handlePrintLabel} isMobile={isMobile} />
        </div>

      <div className="border-t border-border/40" />

      {/* ═══════ Scrollable Content ═══════════════════════════════ */}
      <div
        className={isMobile ? "flex-1 overflow-y-auto px-4" : "flex-1 overflow-y-auto px-8"}
        style={isMobile ? undefined : { maxHeight: "calc(100vh - 320px)" }}
      >
        <div className={isMobile ? "py-4" : "py-8"}>
          {/* ─── Responsive layout ────────────────────────── */}
          <div className={isMobile ? "space-y-6" : "grid grid-cols-[2fr_1fr] gap-8"}>
            {/* ═══ Left: Customer Info + Order Details ════════ */}
            <div className="space-y-6">
              <CustomerInformationCard
                data={data}
                onStatusChange={onStatusChange}
                onPaymentStatusChange={onPaymentStatusChange}
                isMobile={isMobile}
              />

              <div>
                <h3 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground/70">
                  Order Items
                </h3>
                {isMobile ? (
                  <OrderItemsMobileCard items={data.items} itemImagesMap={data.itemImagesMap || {}} />
                ) : (
                  <OrderItemsTable items={data.items} itemImagesMap={data.itemImagesMap || {}} />
                )}
              </div>

              <OrderSummary data={data} isMobile={isMobile} />
            </div>

            {/* ═══ Right: API Information ═════════════════════ */}
            {!isMobile && <ShipmentStatusPanel data={data} />}
          </div>

          {/* ═══ Shipment Status on Mobile (below all content) ═══ */}
          {isMobile && (
            <div className="mt-6">
              <ShipmentStatusPanel data={data} />
            </div>
          )}
        </div>
      </div>

      {/* ═══════ Footer ════════════════════════════════════════════ */}
      {!isMobile && (
        <div className="border-t border-border/40 px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-1.5 text-sm font-medium"
            >
              <ArrowLeft className="size-3.5" />
              Back to Orders
            </Button>
            <p className="text-sm text-muted-foreground/50">
              Order #{data.order_number} &middot; {formatEnumLabel(data.status)}
            </p>
          </div>
        </div>
      )}      </motion.div>
    </>
  );
  }
