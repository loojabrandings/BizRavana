import { createClient } from "@/lib/supabase/client";
import { useQuotationSettings } from "@/stores/quotation-settings-store";

let _idCounter = 0;
let _quotationSequenceCounter = 0;

export function generateItemId() {
  return `qt_item_${++_idCounter}_${Date.now()}`;
}

/**
 * Parse the start value (string) to a numeric value and determine padding.
 * e.g. "001" → startNum=1, padding=3 → numbers become "001", "002", "003"...
 */
function parseStart(startStr: string): { startNum: number; padding: number } {
  const startNum = parseInt(startStr, 10) || 1;
  const padding = startStr.length;
  return { startNum, padding };
}

/**
 * Format a sequential number with the padding from the configured start string.
 */
function formatSeq(num: number, padding: number): string {
  return String(num).padStart(padding, "0");
}

/**
 * Generate a sequential quotation number using the configured prefix and
 * starting number from the operational settings. Format: {prefix}{sequential}
 * Example: "QTN-001", "QTN-002", "QT-100", "100"
 * Supports leading zeros: start "001" → "QTN-001", "QTN-002"...
 */
export function generateQuotationNumber(): string {
  const settings = useQuotationSettings.getState();
  const prefix = settings.quotationNumberPrefix;
  const { startNum, padding } = parseStart(settings.quotationNumberStart || "1");

  _quotationSequenceCounter++;
  const seq = formatSeq(startNum + _quotationSequenceCounter - 1, padding);
  return `${prefix}${seq}`;
}

/**
 * Undo one `generateQuotationNumber()` call so the module counter can be
 * re-initialized from the database without leaking an extra increment.
 */
export function rollbackQuotationSequence(): void {
  _quotationSequenceCounter = Math.max(0, _quotationSequenceCounter - 1);
}

/**
 * Query the database for the highest quotation number for this business and
 * set the internal sequence counter so the next call to
 * {@link generateQuotationNumber} produces the next available number.
 */
export async function initializeQuotationSequence(
  businessId: string,
): Promise<void> {
  const settings = useQuotationSettings.getState();
  const prefix = settings.quotationNumberPrefix || "";
  const { startNum, padding: _unused } = parseStart(settings.quotationNumberStart || "1");

  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("quotations")
      .select("quotation_number")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!data || data.length === 0) {
      // No quotations exist — reset counter so the first
      // generateQuotationNumber() returns the configured start number
      _quotationSequenceCounter = 0;
      return;
    }

    const lastQuotationNumber = String(data[0].quotation_number);
    // Strip the configured prefix to extract the numeric portion
    let numStr = lastQuotationNumber;
    if (prefix && lastQuotationNumber.startsWith(prefix)) {
      numStr = lastQuotationNumber.slice(prefix.length);
    }
    const lastNum = parseInt(numStr, 10);
    if (isNaN(lastNum)) {
      _quotationSequenceCounter = 0;
      return;
    }

    // Set counter so the next generateQuotationNumber() call yields lastNum + 1
    // formula: seq = startNum + counter - 1  =>  counter = lastNum - startNum + 1
    _quotationSequenceCounter = Math.max(0, lastNum - startNum + 1);
  } catch (err) {
    console.error("Failed to initialize quotation sequence:", err);
    _quotationSequenceCounter = 0;
  }
}

/**
 * Calculate the default expiry date based on the configured expiry days.
 * Returns an ISO date string (YYYY-MM-DD).
 */
export function calculateDefaultExpiryDate(): string {
  const settings = useQuotationSettings.getState();
  const days = settings.quotationExpiryDays || 14;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

import { formatCurrency, formatDate } from "@/lib/formatters";

export { formatCurrency, formatDate };
