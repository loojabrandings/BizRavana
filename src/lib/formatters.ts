import { usePreferences } from "@/stores/preferences-store";

const CURRENCY_CONFIG: Record<
  string,
  { symbol: string; locale: string }
> = {
  LKR: { symbol: "Rs.", locale: "en-LK" },
  USD: { symbol: "$", locale: "en-US" },
  EUR: { symbol: "€", locale: "de-DE" },
  GBP: { symbol: "£", locale: "en-GB" },
  INR: { symbol: "₹", locale: "en-IN" },
  AED: { symbol: "د.إ", locale: "ar-AE" },
  SGD: { symbol: "S$", locale: "en-SG" },
  MYR: { symbol: "RM", locale: "ms-MY" },
  THB: { symbol: "฿", locale: "th-TH" },
  AUD: { symbol: "A$", locale: "en-AU" },
};

function getCurrencyCode(): string {
  const currency = usePreferences.getState().currency;
  return currency || "LKR";
}

function getSymbol(code: string): string {
  return CURRENCY_CONFIG[code]?.symbol || code;
}

function getLocale(code: string): string {
  return CURRENCY_CONFIG[code]?.locale || "en-US";
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function formatCurrency(amount: number): string {
  const code = getCurrencyCode();
  const symbol = getSymbol(code);
  const locale = getLocale(code);
  return (
    symbol +
    " " +
    new Intl.NumberFormat(locale, {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  );
}

export function formatCompact(amount: number): string {
  const code = getCurrencyCode();
  const symbol = getSymbol(code);
  const locale = getLocale(code);
  return (
    symbol +
    " " +
    new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount)
  );
}

/**
 * Format a date string according to the user's preferred date format.
 *
 * Supported formats (from settings):
 *   YYYY-MM-DD  →  2024-03-15
 *   DD-MM-YYYY  →  15-03-2024
 *   YY-MM-DD    →  24-03-15
 *   DD-MM-YY    →  15-03-24
 */
export function formatDate(dateStr: string): string {
  const dateFormat = usePreferences.getState().dateFormat || "YYYY-MM-DD";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const shortYear = String(year).slice(-2);

  switch (dateFormat) {
    case "DD-MM-YYYY":
      return `${day}-${month}-${year}`;
    case "YY-MM-DD":
      return `${shortYear}-${month}-${day}`;
    case "DD-MM-YY":
      return `${day}-${month}-${shortYear}`;
    case "YYYY-MM-DD":
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * Format a date string with time according to the user's preferred date format.
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const formattedDate = formatDate(dateStr);
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${formattedDate} ${time}`;
}

/**
 * Format a Sri Lankan phone number for display.
 *
 * Local:     0750350109  →  0750 350 109
 * Intl:      94750350109 → +94 750 350 109
 *
 * Only formats the displayed value — does NOT modify the stored DB value.
 * Returns an empty string for null/undefined.
 * Returns the original value unchanged if it doesn't match a known format.
 */
export function formatPhoneNumber(value: string | null | undefined): string {
  if (!value) return "";

  // Strip all non-digit characters for analysis
  const cleaned = value.replace(/\D/g, "");

  // Sri Lankan local format: 0XX XXX XXX (e.g. 0750350109 → 0750 350 109)
  if (cleaned.length === 10 && cleaned.startsWith("0")) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  // Sri Lankan international format: 94XXXXXXXXX → +94 XXX XXX XXX
  if (cleaned.length === 11 && cleaned.startsWith("94")) {
    const after94 = cleaned.slice(2);
    return `+94 ${after94.slice(0, 3)} ${after94.slice(3, 6)} ${after94.slice(6)}`;
  }

  // If it doesn't match a known format, return the original value unchanged
  return value;
}
