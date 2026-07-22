import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SPECIAL_OVERRIDES: Record<string, string> = {
  cod: "COD",
  vat: "VAT",
  api: "API",
  walk_in: "Walk-in",
  "walk-in": "Walk-in",
  walkin: "Walk-in",
  whatsapp: "WhatsApp",
};

/**
 * Converts a raw enum/database value into a human-friendly display label.
 *
 * Rules:
 * - Replace underscores with spaces
 * - Convert words to Title Case
 * - Preserve known abbreviations (COD, VAT, API)
 * - Allow optional explicit label overrides
 *
 * Examples:
 *   "new_order"      → "New Order"
 *   "pending"        → "Pending"
 *   "advance_paid"   → "Advance Paid"
 *   "bank_transfer"  → "Bank Transfer"
 *   "cod"            → "COD"
 *   "walk_in"        → "Walk-in"
 *   "whatsapp"       → "WhatsApp"
 */
export function formatEnumLabel(value: string): string {
  if (!value) return value;

  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();

  // Check explicit overrides first
  if (SPECIAL_OVERRIDES[lower]) return SPECIAL_OVERRIDES[lower];

  // Split by underscore, hyphen, or space — capitalize each word
  return lower
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

