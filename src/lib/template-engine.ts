/**
 * Template Engine — Reusable placeholder system for message templates.
 *
 * Supports dynamic placeholders like {{customer_name}}, {{order_number}},
 * and the special {{item_details}} placeholder which auto-generates a
 * formatted multi-line list of order/quotation items grouped by category.
 *
 * Designed to be reusable across:
 *   - WhatsApp message templates
 *   - Email templates (future)
 *   - SMS templates (future)
 *   - Courier label templates (future)
 */

// ─── Types ─────────────────────────────────────────────────────────

export interface TemplateLineItem {
  name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  category?: string;
}

export interface TemplateData {
  // Order / Quotation info
  order_number?: string;
  order_date?: string;

  // Customer
  customer_name?: string;
  address?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  district?: string;
  nearest_city?: string;

  // Status & logistics
  order_status?: string;
  payment_status?: string;
  payment_method?: string;
  scheduled_delivery_date?: string;

  // Financial
  delivery_charge?: number;
  discount?: number;
  discount_type?: string;
  subtotal?: number;
  grand_total?: number;
  advance_payment?: number;
  remaining_balance?: number;
  cod_amount?: number;

  // Items
  total_quantity?: number;
  items?: TemplateLineItem[];

  // Other
  notes?: string;
  tracking_number?: string;
  courier?: string;

  // Quotation-specific
  quotation_number?: string;
  quotation_date?: string;
  expiry_date?: string;
}

export type TemplateContext =
  | "order_table_whatsapp"
  | "order_preview_whatsapp"
  | "quotation_preview_whatsapp";

export interface PlaceholderGroup {
  label: string;
  items: string[];
}

// ─── Currency Formatting ──────────────────────────────────────────

import { formatCurrency as fmtCurrency } from "@/lib/formatters";

function fmt(amount: number): string {
  return fmtCurrency(amount);
}

// ─── Date Formatting ──────────────────────────────────────────────

/**
 * Format a date string according to the business's date format preference.
 * Accepts ISO date strings ("2024-12-15") or ISO datetime strings.
 * If the date cannot be parsed or no format is given, returns the original value.
 *
 * The shortYear variable is used for 2-digit year formats (YY-MM-DD, DD-MM-YY).
 */
function formatDateWithPreference(
  dateStr: string | undefined | null,
  dateFormat?: string,
): string {
  if (!dateStr) return "";

  // Try to parse the date
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  if (!dateFormat) return dateStr;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  const shortYear = String(year).slice(-2);

  switch (dateFormat) {
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD-MM-YYYY":
      return `${day}-${month}-${year}`;
    case "YY-MM-DD":
      return `${shortYear}-${month}-${day}`;
    case "DD-MM-YY":
      return `${day}-${month}-${shortYear}`;
    // Legacy formats (still supported for saved preferences)
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "MM-DD-YYYY":
      return `${month}-${day}-${year}`;
    default:
      return dateStr;
  }
}

// ─── Item Details Rendering (Multi-Category) ──────────────────────

/**
 * Generate a formatted multi-line list of all order/quotation items,
 * grouped by category.
 *
 * Rules:
 *   - Groups items by their category snapshot
 *   - Displays each category header only once
 *   - Continues item numbering across categories
 *   - Uncategorized items go under "Other Items"
 *   - Item notes are only shown when they have a value
 *   - Uses item snapshot data, not current master data
 */
function renderItemDetailsGrouped(items?: TemplateLineItem[]): string {
  if (!items || items.length === 0) return "";

  // Group items by category
  const grouped: Record<string, TemplateLineItem[]> = {};
  let itemCounter = 0;

  for (const item of items) {
    const cat = item.category?.trim() || "Other Items";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  const lines: string[] = [];
  const categoryKeys = Object.keys(grouped);

  categoryKeys.forEach((category, catIndex) => {
    if (catIndex > 0) lines.push("");
    lines.push(`*Category: ${category}*`);
    lines.push("");

    for (const item of grouped[category]) {
      itemCounter++;
      lines.push(`${itemCounter}. ${item.name}`);
      lines.push(`   Qty: ${item.quantity}`);
      lines.push(`   Unit Price: ${fmt(item.unit_price)}`);
      lines.push(`   Total: ${fmt(item.quantity * item.unit_price)}`);
      if (item.notes?.trim()) {
        lines.push(`   Item Note: ${item.notes.trim()}`);
      }
    }
  });

  return lines.join("\n");
}

/**
 * Legacy flat rendering (no category grouping, simpler format).
 * Kept for backward compatibility in case anyone references it directly.
 */
function renderItemDetailsFlat(items?: TemplateLineItem[]): string {
  if (!items || items.length === 0) return "";

  return items
    .map((item, i) => {
      const lines: string[] = [
        `${i + 1}. ${item.name}`,
        `   Qty: ${item.quantity}`,
        `   Unit Price: ${fmt(item.unit_price)}`,
        `   Total: ${fmt(item.quantity * item.unit_price)}`,
      ];
      if (item.notes?.trim()) {
        lines.push(`   Item Note: ${item.notes.trim()}`);
      }
      return lines.join("\n");
    })
    .join("\n\n");
}

// ─── Placeholder Definitions by Context ──────────────────────────

export const ALL_PLACEHOLDERS: Record<string, PlaceholderGroup[]> = {
  order_table_whatsapp: [
    {
      label: "Customer",
      items: [
        "{{customer_name}}",
        "{{address}}",
        "{{whatsapp}}",
        "{{phone}}",
        "{{email}}",
        "{{nearest_city}}",
        "{{district}}",
      ],
    },
    {
      label: "Order",
      items: [
        "{{order_number}}",
        "{{order_date}}",
        "{{order_status}}",
        "{{notes}}",
      ],
    },
    {
      label: "Items",
      items: [
        "{{item_details}}",
        "{{total_quantity}}",
      ],
    },
    {
      label: "Payment",
      items: [
        "{{subtotal}}",
        "{{discount}}",
        "{{delivery_charge}}",
        "{{grand_total}}",
        "{{advance_payment}}",
        "{{remaining_balance}}",
        "{{cod_amount}}",
        "{{payment_method}}",
        "{{payment_status}}",
      ],
    },
    {
      label: "Delivery",
      items: [
        "{{scheduled_delivery_date}}",
        "{{tracking_number}}",
        "{{courier}}",
      ],
    },
  ],
  order_preview_whatsapp: [
    {
      label: "Customer",
      items: [
        "{{customer_name}}",
        "{{address}}",
        "{{whatsapp}}",
        "{{phone}}",
        "{{email}}",
        "{{nearest_city}}",
        "{{district}}",
      ],
    },
    {
      label: "Order",
      items: [
        "{{order_number}}",
        "{{order_date}}",
        "{{order_status}}",
        "{{notes}}",
      ],
    },
    {
      label: "Items",
      items: [
        "{{item_details}}",
        "{{total_quantity}}",
      ],
    },
    {
      label: "Payment",
      items: [
        "{{subtotal}}",
        "{{discount}}",
        "{{delivery_charge}}",
        "{{grand_total}}",
        "{{advance_payment}}",
        "{{remaining_balance}}",
        "{{cod_amount}}",
        "{{payment_method}}",
        "{{payment_status}}",
      ],
    },
    {
      label: "Delivery",
      items: [
        "{{scheduled_delivery_date}}",
        "{{tracking_number}}",
        "{{courier}}",
      ],
    },
  ],
  quotation_preview_whatsapp: [
    {
      label: "Customer",
      items: [
        "{{customer_name}}",
        "{{address}}",
        "{{whatsapp}}",
        "{{phone}}",
        "{{email}}",
        "{{nearest_city}}",
        "{{district}}",
      ],
    },
    {
      label: "Quotation",
      items: [
        "{{quotation_number}}",
        "{{quotation_date}}",
        "{{expiry_date}}",
        "{{notes}}",
      ],
    },
    {
      label: "Items",
      items: [
        "{{item_details}}",
        "{{total_quantity}}",
      ],
    },
    {
      label: "Payment",
      items: [
        "{{subtotal}}",
        "{{discount}}",
        "{{delivery_charge}}",
        "{{grand_total}}",
      ],
    },
  ],
};

export function getPlaceholdersForContext(
  context: TemplateContext
): PlaceholderGroup[] {
  return ALL_PLACEHOLDERS[context] || ALL_PLACEHOLDERS.order_table_whatsapp;
}

// ─── Main Renderer ────────────────────────────────────────────────

/**
 * Render a message template by replacing all {{placeholders}} with the
 * corresponding values from the data object.
 *
 * Rules:
 *   - Known placeholders are replaced with their values
 *   - Unknown placeholders remain unchanged in the output
 *   - Empty/null/undefined values render as an empty string
 *   - Line breaks are preserved exactly as written in the template
 *   - WhatsApp formatting (*bold*, _italic_, ~strikethrough~) is passed through
 *   - `{{item_details}}` auto-generates a grouped, formatted list of all items
 *   - Financial values are formatted with the user's preferred currency symbol (e.g., "Rs. 1,000")
 *
 * @param template - The raw template string with {{placeholders}}
 * @param data     - The data to fill the placeholders with
 * @returns        - The rendered template string
 */
export function renderTemplate(
  template: string,
  data: TemplateData,
  options?: { dateFormat?: string }
): string {
  const df = options?.dateFormat;

  // Build a flat map of placeholder name → display value.
  // Financial fields are formatted; string fields are passed as-is.
  // Date fields are formatted according to the business's date format preference.
  const map: Record<string, string> = {
    order_number: data.order_number ?? "",
    order_date: formatDateWithPreference(data.order_date, df),
    customer_name: data.customer_name ?? "",
    address: data.address ?? "",
    whatsapp: data.whatsapp ?? "",
    phone: data.phone ?? "",
    email: data.email ?? "",
    district: data.district ?? "",
    nearest_city: data.nearest_city ?? "",
    order_status: data.order_status ?? "",
    payment_status: data.payment_status ?? "",
    payment_method: data.payment_method ?? "",
    scheduled_delivery_date: formatDateWithPreference(data.scheduled_delivery_date, df),
    delivery_charge:
      data.delivery_charge != null ? fmt(data.delivery_charge) : "",
    discount: data.discount != null ? fmt(data.discount) : "",
    discount_type: data.discount_type ?? "",
    subtotal: data.subtotal != null ? fmt(data.subtotal) : "",
    grand_total: data.grand_total != null ? fmt(data.grand_total) : "",
    advance_payment:
      data.advance_payment != null ? fmt(data.advance_payment) : "",
    remaining_balance:
      data.remaining_balance != null ? fmt(data.remaining_balance) : "",
    cod_amount: data.cod_amount != null ? fmt(data.cod_amount) : "",
    total_quantity:
      data.total_quantity != null ? String(data.total_quantity) : "",
    notes: data.notes ?? "",
    tracking_number: data.tracking_number ?? "",
    courier: data.courier ?? "",
    // Quotation-specific
    quotation_number: data.quotation_number ?? "",
    quotation_date: formatDateWithPreference(data.quotation_date, df),
    expiry_date: formatDateWithPreference(data.expiry_date, df),
  };

  let result = template;

  // Replace every simple placeholder with its value (or empty string)
  for (const [key, value] of Object.entries(map)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }

  // Special handling for {{item_details}}
  const itemDetailsText = renderItemDetailsGrouped(data.items);
  result = result.replace(/\{\{item_details\}\}/g, itemDetailsText);

  return result;
}

/**
 * Render a message with proper API signature including context and
 * optional business settings.
 */
export function renderMessageTemplate(params: {
  content: string;
  context?: TemplateContext;
  data: TemplateData;
  businessSettings?: Record<string, string>;
}): string {
  const dateFormat = params.businessSettings?.date_format;
  return renderTemplate(params.content, params.data, { dateFormat });
}

// ─── Presets ──────────────────────────────────────────────────────

/**
 * Default WhatsApp template for Order Table context.
 * Short and compact customer confirmation.
 */
export const DEFAULT_ORDER_TABLE_TEMPLATE = [
  "🛒 *Order #{{order_number}}*",
  "",
  "*Customer:* {{customer_name}}",
  "*Phone:* {{phone}}",
  "*Status:* {{order_status}}",
  "*Total:* {{grand_total}}",
  "",
  "Thank you! 🙏",
].join("\n");

/**
 * Default WhatsApp template for Order Preview context.
 * Detailed order confirmation.
 */
export const DEFAULT_ORDER_PREVIEW_TEMPLATE = [
  "🛒 *Order #{{order_number}}*",
  "",
  "*Customer:* {{customer_name}}",
  "*Phone:* {{phone}}",
  "*Address:* {{address}}",
  "*District:* {{district}}",
  "*City:* {{nearest_city}}",
  "",
  "*Items:*",
  "{{item_details}}",
  "",
  "*Subtotal:* {{subtotal}}",
  "{{#discount}}*Discount:* {{discount}}{{/discount}}",
  "*Delivery:* {{delivery_charge}}",
  "*Total:* {{grand_total}}",
  "{{#advance_payment}}*Advance Paid:* {{advance_payment}}{{/advance_payment}}",
  "{{#remaining_balance}}*Balance:* {{remaining_balance}}{{/remaining_balance}}",
  "",
  "*Payment Method:* {{payment_method}}",
  "*Status:* {{order_status}}",
  "{{#scheduled_delivery_date}}*Delivery Date:* {{scheduled_delivery_date}}{{/scheduled_delivery_date}}",
  "{{#notes}}",
  "*Remarks:* {{notes}}{{/notes}}",
  "",
  "Thank you for your order! 🙏",
].join("\n");

/**
 * Default WhatsApp template for Quotation Preview context.
 * Detailed quotation summary with expiry date and total.
 */
export const DEFAULT_QUOTATION_PREVIEW_TEMPLATE = [
  "📄 *Quotation #{{quotation_number}}*",
  "",
  "*Customer:* {{customer_name}}",
  "*Phone:* {{phone}}",
  "*Address:* {{address}}",
  "",
  "*Items:*",
  "{{item_details}}",
  "",
  "*Subtotal:* {{subtotal}}",
  "{{#discount}}*Discount:* {{discount}}{{/discount}}",
  "*Delivery:* {{delivery_charge}}",
  "*Grand Total:* {{grand_total}}",
  "{{#expiry_date}}*Valid Until:* {{expiry_date}}{{/expiry_date}}",
  "{{#notes}}",
  "*Remarks:* {{notes}}{{/notes}}",
  "",
  "Thank you for your interest! 🙏",
].join("\n");

export const DEFAULT_TEMPLATES: Record<TemplateContext, string> = {
  order_table_whatsapp: DEFAULT_ORDER_TABLE_TEMPLATE,
  order_preview_whatsapp: DEFAULT_ORDER_PREVIEW_TEMPLATE,
  quotation_preview_whatsapp: DEFAULT_QUOTATION_PREVIEW_TEMPLATE,
};

export const TEMPLATE_CONTEXT_LABELS: Record<TemplateContext, string> = {
  order_table_whatsapp: "Order Table",
  order_preview_whatsapp: "Order Preview",
  quotation_preview_whatsapp: "Quotation Preview",
};

export const TEMPLATE_CONTEXT_DESCRIPTIONS: Record<TemplateContext, string> = {
  order_table_whatsapp:
    "Used by the WhatsApp icon shown in each Orders table row.",
  order_preview_whatsapp:
    "Used by the WhatsApp button on the Order Preview page.",
  quotation_preview_whatsapp:
    "Used by the WhatsApp button on the Quotation Preview page.",
};

// Backward compatibility exports
export const DEFAULT_ORDER_WHATSAPP_TEMPLATE = DEFAULT_ORDER_PREVIEW_TEMPLATE;
export const DEFAULT_QUOTATION_WHATSAPP_TEMPLATE = DEFAULT_QUOTATION_PREVIEW_TEMPLATE;
