import type { InventoryItem, StockStatus } from "./types";

// ─── Stock Status ─────────────────────────────────────────────────

export function getStockStatus(item: {
  current_stock: number;
  reorder_level: number;
}): StockStatus {
  if (item.current_stock <= 0) return "out_of_stock";
  if (item.current_stock <= item.reorder_level) return "low_stock";
  return "in_stock";
}

export function getStockStatusLabel(status: StockStatus): string {
  switch (status) {
    case "in_stock":
      return "In Stock";
    case "low_stock":
      return "Low Stock";
    case "out_of_stock":
      return "Out of Stock";
  }
}

// ─── Stock Value ──────────────────────────────────────────────────

export function getStockValue(item: {
  current_stock: number;
  unit_cost: number | null;
}): number | null {
  if (item.unit_cost === null || item.unit_cost <= 0) return null;
  return item.current_stock * item.unit_cost;
}

// ─── Formatting ───────────────────────────────────────────────────

import {
  formatCurrency,
  formatDate,
  formatDateTime,
} from "@/lib/formatters";

export { formatCurrency, formatDate, formatDateTime };

// ─── ID Generator ─────────────────────────────────────────────────

let _idCounter = 0;

export function generateTransactionId(): string {
  return `txn_${++_idCounter}_${Date.now()}`;
}

// ─── Compute stock_value for every item ──────────────────────────

export function computeStockValues(
  items: InventoryItem[],
): InventoryItem[] {
  return items.map((item) => ({
    ...item,
    stock_value: getStockValue(item),
  }));
}
