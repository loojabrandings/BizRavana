// ─── Inventory Item ────────────────────────────────────────────────

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface InventoryItem {
  id: string;
  name: string;
  category: string | null;
  size_variant: string | null;
  current_stock: number;
  unit_cost: number | null;
  stock_value: number | null;
  supplier: string | null;
  reorder_level: number;
  last_restocked_at: string | null;
  created_at: string;
}

// ─── Inventory Transaction ────────────────────────────────────────

export type TransactionType = "stock_in" | "stock_out" | "adjustment";

export interface InventoryTransaction {
  id: string;
  inventory_item_id: string;
  type: TransactionType;
  quantity: number;
  unit_cost: number | null;
  reference_type: string | null;
  reference_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

// ─── Stock Form ────────────────────────────────────────────────────

export interface StockFormData {
  item_name: string;
  category: string;
  size_variant: string;
  quantity: number;
  unit_cost: number;
  supplier: string;
  reorder_level: number;
  type: "stock_in" | "stock_out";
  notes: string;
}

export interface StockFormCalculations {
  stock_after: number;
  stock_value_change: number;
}

// ─── Constants ─────────────────────────────────────────────────────

export const stockStatusTabs: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
];

export const stockStatusOptions: { value: string; label: string }[] = [
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
];

export const stockTypeOptions: { value: string; label: string }[] = [
  { value: "stock_in", label: "Stock In" },
  { value: "stock_out", label: "Stock Out" },
];

// ─── Color Maps ────────────────────────────────────────────────────

export const statusColorMap: Record<string, string> = {
  in_stock: "text-success",
  low_stock: "text-warning",
  out_of_stock: "text-destructive",
};

export const statusBgMap: Record<string, string> = {
  in_stock: "",
  low_stock: "bg-warning/5",
  out_of_stock: "bg-destructive/5",
};
