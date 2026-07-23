/**
 * Customer Parser — extracts structured customer details from unstructured
 * pasted text (WhatsApp messages, SMS, social media DMs, etc.).
 *
 * ## Design
 *
 * 1. Strip WhatsApp timestamp headers from all lines
 * 2. Classify each line:
 *    - Phone line  → extracted into phone field
 *    - First line  → name field
 *    - District match → district field (line still included in address)
 *    - Everything else → address field (unchanged)
 * 3. City matching (two-phase):
 *    - Forward match: if district identified, check last address line
 *      against the filtered city list for that district
 *    - Reverse lookup: if no district identified, check last word(s) of
 *      last address line against ALL courier cities to infer district + city
 */

import { SRI_LANKA_DISTRICTS } from "@/constants/districts";

// ─── Types ─────────────────────────────────────────────────────────

export interface ParsedCustomer {
  name: string;
  phone: string;
  address: string;
  district: string;
  city: string;
}

export interface CourierCityData {
  cities: Array<{ id: number; name: string; state_id: number }>;
  states: Array<{ id: number; name: string }>;
}

// ─── Constants ─────────────────────────────────────────────────────

/**
 * Regex to strip WhatsApp timestamp headers.
 * Matches: [7:08 PM, 7/21/2026] 465: text
 *          [3:33 PM, 7/22/2026] 467: text
 *          [12:05 AM, 12/25/2026] 1234: text
 */
const WHATSAPP_HEADER_RE =
  /\[\d{1,2}:\d{2}\s*[AP]M,\s*\d{1,2}\/\d{1,2}\/\d{4}\]\s*\d+:?\s*/g;

/**
 * Sri Lankan mobile phone regex — finds 07XXXXXXXX within text.
 * Handles: 0711291725, 077 9394 568, 076-932-5472, Kamal 0771234567
 */
const PHONE_RE = /07\d{8}/;

// ─── Public API ────────────────────────────────────────────────────

/**
 * Strip WhatsApp timestamp headers from the raw pasted text.
 */
export function stripWhatsAppHeaders(text: string): string {
  return text.replace(WHATSAPP_HEADER_RE, "").trim();
}

/**
 * Check whether a string is (or contains) a Sri Lankan mobile number.
 */
export function isPhone(text: string): boolean {
  return extractPhone(text) !== null;
}

/**
 * Extract a Sri Lankan mobile number from a string.
 * Returns the 10-digit number or null if none found.
 */
export function extractPhone(text: string): string | null {
  // Try to find 07XXXXXXXX directly in the text
  const directMatch = text.match(PHONE_RE);
  if (directMatch) return directMatch[0];

  // Try with whitespace/dashes removed (handles "077 9394 568")
  const cleaned = text.replace(/[\s\-()]/g, "");
  const cleanedMatch = cleaned.match(PHONE_RE);
  if (cleanedMatch) return cleanedMatch[0];

  return null;
}

/**
 * Normalize a string for fuzzy district/city matching by handling common
 * Sinhala transliteration variations (e.g. "Rathnapura" → "Ratnapura").
 *
 * Normalizations:
 *   - th → t  (e.g. Rathnapura → Ratnapura)
 *   - dh → d  (e.g. Madhu → Madu)
 *   - sh → s  (e.g. Nuwara Eliya has no sh, but for completeness)
 */
function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .replace(/th/g, "t")
    .replace(/dh/g, "d")
    .replace(/sh/g, "s")
    .trim();
}

/**
 * Match a trimmed line against the Sri Lankan districts list (case-insensitive).
 * Handles common Sinhala transliteration spelling variations.
 * Returns the properly-cased district name or null.
 */
export function matchDistrict(
  line: string,
  districts: readonly string[] = SRI_LANKA_DISTRICTS,
): string | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const normalized = normalizeForMatch(trimmed);

  for (const district of districts) {
    // Try exact match first (fast path)
    if (trimmed.toLowerCase() === district.toLowerCase()) {
      return district;
    }
    // Fall back to normalized match for transliteration variants
    if (normalized === normalizeForMatch(district)) {
      return district;
    }
  }
  return null;
}

/**
 * Try to match a city name within a line against a list of city names.
 *
 * Search order:
 *   1. The entire trimmed line
 *   2. The last two words (for "Nuwara Eliya" style names)
 *   3. The last word
 *
 * Returns the matched (properly-cased) city name or null.
 */
export function matchCityInLine(
  line: string,
  cityNames: string[],
): string | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const cityIndex = buildCityLookup(cityNames);

  // 1. Try full line
  const full = cityIndex.get(trimmed.toLowerCase());
  if (full) return full;

  const words = trimmed.split(/\s+/);

  // 2. Try last two words
  if (words.length >= 2) {
    const lastTwo = words.slice(-2).join(" ");
    const match = cityIndex.get(lastTwo.toLowerCase());
    if (match) return match;
  }

  // 3. Try last word
  const lastWord = words[words.length - 1];
  const match = cityIndex.get(lastWord.toLowerCase());
  if (match) return match;

  return null;
}

/**
 * Look up a city name across ALL courier cities to find its district.
 * Returns { district, city } or null.
 */
export function lookupCityInAllCities(
  cityName: string,
  cities: CourierCityData["cities"],
  states: CourierCityData["states"],
): { district: string; city: string } | null {
  const lowerName = cityName.toLowerCase();
  const match = cities.find((c) => c.name.toLowerCase() === lowerName);
  if (!match) return null;

  const state = states.find((s) => s.id === match.state_id);
  if (!state) return null;

  return { district: state.name, city: match.name };
}

/**
 * Main parse function.
 *
 * @param text - Raw pasted text (with or without WhatsApp headers)
 * @param options.courierData - Optional courier city/state data for city matching
 * @param options.districts - Optional district list (defaults to SRI_LANKA_DISTRICTS)
 */
export function parseCustomerText(
  text: string,
  options?: {
    courierData?: CourierCityData;
    districts?: readonly string[];
  },
): ParsedCustomer {
  const districts = options?.districts ?? SRI_LANKA_DISTRICTS;
  const courierData = options?.courierData;

  // ── Step 1: Strip WhatsApp headers ──────────────────────────
  const clean = stripWhatsAppHeaders(text);

  // ── Step 2: Split into non-empty lines ──────────────────────
  const lines = clean
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { name: "", phone: "", address: text.trim(), district: "", city: "" };
  }

  // ── Step 3: Classify lines ──────────────────────────────────
  let name = "";
  let phone = "";
  let district = "";
  let city = "";
  const addressLines: string[] = [];

  for (const line of lines) {
    // Phone detection (earliest match wins, first phone found is used)
    if (!phone) {
      const extracted = extractPhone(line);
      if (extracted) {
        phone = extracted;
        continue; // don't include phone-only lines in address
      }
    }

    // First line = name
    if (!name) {
      name = line;
      continue; // don't include name in address
    }

    // District detection — line stays in address even if matched
    if (!district) {
      const matched = matchDistrict(line, districts);
      if (matched) {
        district = matched;
      }
    }

    // Everything else → address
    addressLines.push(line);
  }

  // ── Step 4: City matching ───────────────────────────────────

  if (district && courierData) {
    // ── Forward match: district known → filter cities → check last line ──
    const state = courierData.states.find(
      (s) => s.name.toLowerCase() === district.toLowerCase(),
    );
    if (state) {
      const filteredCities = courierData.cities
        .filter((c) => c.state_id === state.id)
        .map((c) => c.name);

      if (addressLines.length > 0) {
        const lastLine = addressLines[addressLines.length - 1];
        const matchedCity = matchCityInLine(lastLine, filteredCities);
        if (matchedCity) {
          city = matchedCity;
        }
      }

      // Fallback: district name itself may be a city (e.g. "Ratnapura")
      if (!city && filteredCities.includes(district)) {
        city = district;
      }
    }
  } else if (!district && courierData && addressLines.length > 0) {
    // ── Reverse lookup: no district → check last line against ALL cities ──
    const lastLine = addressLines[addressLines.length - 1];
    const allCityNames = courierData.cities.map((c) => c.name);
    const matched = matchCityInLine(lastLine, allCityNames);
    if (matched) {
      const result = lookupCityInAllCities(matched, courierData.cities, courierData.states);
      if (result) {
        district = result.district;
        city = result.city;
      }
    }
  }

  // ── Step 5: Assemble address (raw, nothing removed) ────────
  const address = addressLines.join("\n");

  return { name, phone, address, district, city };
}

// ─── Internal helpers ──────────────────────────────────────────────

/** Build a case-insensitive lookup map from a list of city names. */
function buildCityLookup(cityNames: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const name of cityNames) {
    map.set(name.toLowerCase(), name);
  }
  return map;
}
