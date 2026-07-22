export interface OrderFormLineItem {
  id: string;
  product_name: string;
  category: string;
  quantity: number;
  unit_price: number;
  notes: string;
  /** Per-item image file (local, for preview and upload) */
  imageFile?: File | null;
  /** Per-item image preview URL (local blob URL) */
  imagePreviewUrl?: string | null;
}

export interface OrderFormData {
  // System
  /** Primary key (UUID) for database operations */
  id: string;
  order_number: string;
  created_date: string;
  dispatched_date: string;

  // Customer
  customer_name: string;
  address: string;
  district: string;
  nearest_city: string;
  whatsapp: string;
  phone: string;
  email: string;

  // Items
  items: OrderFormLineItem[];
  expected_delivery_date: string;

  // Payment
  subtotal: number;
  discount: number;
  discount_type: "percentage" | "fixed";
  delivery_charge: number;
  advance_paid: number;
  payment_method: "cod" | "bank_transfer" | "cash" | "other";
  total: number;
  balance_remaining: number;

  // Order Management
  status: string;
  payment_status: string;
  order_source: string;

  // Tracking
  waybill_id: string;

  // Other
  remarks: string;

  // Images
  /** URLs of uploaded images stored in Supabase Storage */
  images: string[];
  /** Per-item image URL mapping (itemId → URLs). Transient — not saved to DB. */
  itemImagesMap?: Record<string, string[]>;
}

export interface OrderFormCalculations {
  subtotal: number;
  discountVal: number;
  total: number;
  balanceRemaining: number;
}
