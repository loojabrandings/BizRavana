/**
 * WhatsApp Actions — shared utilities for WhatsApp template rendering and sending.
 *
 * Provides pure functions to:
 *   - Map Order table row → TemplateData
 *   - Map OrderFormData (preview) → TemplateData
 *   - Map QuotationFormData (preview) → TemplateData
 *   - Open WhatsApp with a rendered message
 */

import { renderTemplate, type TemplateData, type TemplateLineItem } from "@/lib/template-engine";
import type { MessageTemplate } from "@/lib/supabase/message-templates";

// ─── Types ─────────────────────────────────────────────────────────

export interface OrderTableRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string | null;
  customer_whatsapp: string | null;
  customer_address: string | null;
  customer_district: string | null;
  customer_city: string | null;
  customer_email: string | null;
  advance_paid: number;
  total: number;
  delivery_charge: number;
  subtotal: number;
  discount: number;
  waybill_id: string | null;
  dispatched_date: string | null;
  status: string;
  payment_status: string;
  payment_method: string | null;
  expected_delivery_date: string | null;
  items: Array<{
    product_name: string;
    category: string | null;
    quantity: number;
    unit_price: number;
  }>;
}

export interface OrderPreviewData {
  order_number: string;
  created_date: string;
  dispatched_date: string;
  customer_name: string;
  address: string;
  whatsapp: string;
  phone: string;
  email: string;
  district: string;
  nearest_city: string;
  status: string;
  payment_status: string;
  payment_method: string;
  expected_delivery_date: string;
  delivery_charge: number;
  discount: number;
  discount_type: string;
  subtotal: number;
  total: number;
  advance_paid: number;
  balance_remaining: number;
  remarks: string;
  waybill_id: string;
  items: Array<{
    product_name: string;
    category?: string;
    quantity: number;
    unit_price: number;
    notes?: string;
  }>;
}

export interface QuotationPreviewData {
  quotation_number: string;
  created_date: string;
  customer_name: string;
  address: string;
  whatsapp: string;
  phone: string;
  email: string;
  district: string;
  nearest_city: string;
  status: string;
  delivery_charge: number;
  discount: number;
  discount_type: string;
  subtotal: number;
  grand_total: number;
  expiry_date: string;
  remarks: string;
  items: Array<{
    product_name: string;
    category?: string;
    quantity: number;
    unit_price: number;
    notes?: string;
  }>;
}

// ─── Mappers ───────────────────────────────────────────────────────

function toTemplateLineItems(
  items: Array<{ product_name: string; category?: string | null; quantity: number; unit_price: number; notes?: string | null }>,
): TemplateLineItem[] {
  return items.map((item, i) => ({
    name: item.product_name || `Item #${i + 1}`,
    quantity: item.quantity,
    unit_price: item.unit_price,
    notes: item.notes || undefined,
    category: item.category || undefined,
  }));
}

/**
 * Map an Order table row to TemplateData.
 */
export function orderRowToTemplateData(row: OrderTableRow): TemplateData {
  const items = toTemplateLineItems(row.items);
  const totalQty = row.items.reduce((sum, i) => sum + i.quantity, 0);

  return {
    order_number: row.order_number,
    customer_name: row.customer_name,
    address: row.customer_address || "",
    whatsapp: row.customer_whatsapp || "",
    phone: row.customer_phone || "",
    email: row.customer_email || "",
    district: row.customer_district || "",
    nearest_city: row.customer_city || "",
    order_status: row.status,
    payment_status: row.payment_status,
    payment_method: row.payment_method || "",
    scheduled_delivery_date: row.expected_delivery_date || "",
    dispatched_date: row.dispatched_date || "",
    delivery_charge: row.delivery_charge,
    discount: row.discount,
    subtotal: row.subtotal,
    grand_total: row.total,
    advance_payment: row.advance_paid,
    remaining_balance: Math.max(0, row.total - row.advance_paid),
    cod_amount: row.payment_method === "cod" ? row.total : undefined,
    total_quantity: totalQty,
    tracking_number: row.waybill_id || "",
    items,
  };
}

/**
 * Map OrderPreview form data to TemplateData.
 */
export function orderPreviewToTemplateData(data: OrderPreviewData): TemplateData {
  const items = toTemplateLineItems(data.items);
  const totalQty = data.items.reduce((sum, i) => sum + i.quantity, 0);

  return {
    order_number: data.order_number,
    order_date: data.created_date,
    customer_name: data.customer_name,
    address: data.address,
    whatsapp: data.whatsapp,
    phone: data.phone,
    email: data.email,
    district: data.district,
    nearest_city: data.nearest_city,
    order_status: data.status,
    payment_status: data.payment_status,
    payment_method: data.payment_method,
    scheduled_delivery_date: data.expected_delivery_date,
    dispatched_date: data.dispatched_date,
    delivery_charge: data.delivery_charge,
    discount: data.discount,
    discount_type: data.discount_type === "percentage" ? `${data.discount}%` : "Fixed",
    subtotal: data.subtotal,
    grand_total: data.total,
    advance_payment: data.advance_paid,
    remaining_balance: data.balance_remaining,
    cod_amount: data.payment_method === "cod" ? data.total : undefined,
    total_quantity: totalQty,
    items,
    notes: data.remarks,
    tracking_number: data.waybill_id,
  };
}

/**
 * Map QuotationPreview form data to TemplateData.
 */
export function quotationPreviewToTemplateData(data: QuotationPreviewData): TemplateData {
  const items = toTemplateLineItems(data.items);
  const totalQty = data.items.reduce((sum, i) => sum + i.quantity, 0);

  return {
    quotation_number: data.quotation_number,
    quotation_date: data.created_date,
    expiry_date: data.expiry_date,
    customer_name: data.customer_name,
    address: data.address,
    whatsapp: data.whatsapp,
    phone: data.phone,
    email: data.email,
    district: data.district,
    nearest_city: data.nearest_city,
    order_status: data.status,
    delivery_charge: data.delivery_charge,
    discount: data.discount,
    discount_type: data.discount_type === "percentage" ? `${data.discount}%` : "Fixed",
    subtotal: data.subtotal,
    grand_total: data.grand_total,
    total_quantity: totalQty,
    items,
    notes: data.remarks,
  };
}

/**
 * Normalize a phone number to international format (digits only, e.g. 94XXXXXXXXX) for wa.me.
 * If a local Sri Lankan number is given (07XXXXXXXX or 7XXXXXXXX), automatically prepends 94.
 */
export function formatWhatsAppPhone(phone: string): string {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");
  // If local Sri Lankan 10 digits starting with 0: e.g. 0771234567 -> 94771234567
  if (digits.length === 10 && digits.startsWith("0")) {
    digits = "94" + digits.slice(1);
  } else if (digits.length === 9 && !digits.startsWith("0") && !digits.startsWith("94")) {
    // 9 digits without leading 0: e.g. 771234567 -> 94771234567
    digits = "94" + digits;
  }
  return digits;
}

/**
 * Open WhatsApp with a rendered template message.
 */
export function openWhatsAppWithMessage(phone: string, message: string): void {
  if (!phone) return;
  const cleaned = formatWhatsAppPhone(phone);
  if (!cleaned) return;
  const url = `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Render a template with given data and open WhatsApp.
 */
export function sendWhatsAppTemplate(
  template: MessageTemplate,
  data: TemplateData,
  phone: string,
): void {
  const message = renderTemplate(template.content, data);
  openWhatsAppWithMessage(phone, message);
}
