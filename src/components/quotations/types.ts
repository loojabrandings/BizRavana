export interface QuotationFormLineItem {
  id: string;
  product_name: string;
  category: string;
  quantity: number;
  unit_price: number;
  notes: string;
}

export interface QuotationFormData {
  // System
  quotation_number: string;
  created_date: string;

  // Customer
  customer_name: string;
  address: string;
  district: string;
  nearest_city: string;
  whatsapp: string;
  phone: string;
  email: string;

  // Items
  items: QuotationFormLineItem[];
  expiry_date: string;

  // Financial
  subtotal: number;
  discount: number;
  discount_type: "percentage" | "fixed";
  delivery_charge: number;
  grand_total: number;

  // Management
  status: string;

  // Other
  remarks: string;
}

export interface QuotationFormCalculations {
  subtotal: number;
  discountVal: number;
  grandTotal: number;
}
