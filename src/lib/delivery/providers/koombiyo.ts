// ─── Koombiyo Delivery — Courier Provider ─────────────────────────────
//
// API Base URL: https://application.koombiyodelivery.lk/api/
// Auth: API key passed as URL-encoded body parameter (`apikey`)
// Content-Type: application/x-www-form-urlencoded (not JSON)
//
// Endpoints used:
//   POST /Districts/users   — list all districts (states)
//   POST /Cities/users      — list cities by district_id
//   POST /Waybils/users     — get allocated barcode(s)
//   POST /Addorders/users   — register a new shipment
//   POST /Orderhistory/users — tracking history for a waybill
//
// Notes:
//   - Waybills must be pre-allocated via Waybils/users BEFORE adding orders.
//   - Districts & Cities use numeric IDs (not names).
//   - No dedicated COD/finance endpoint — del_charge comes only via webhook.
// ────────────────────────────────────────────────────────────────────────

import { createClient } from "@/lib/supabase/client";
import {
  registerProvider,
  SHARED_SETTINGS_KEYS,
  type CourierProvider,
  type StatusDisplayEntry,
} from "@/lib/delivery/provider-registry";
import type {
  CourierLocations,
  CourierState,
  CourierCity,
  OrderFinanceInfo,
  TrackingEvent,
} from "@/lib/delivery/types";


// ─── Settings Keys ───────────────────────────────────────────────────

const SETTINGS_KEYS = {
  api_key: "courier_koombiyo_api_key",
} as const;

// ─── API Base URL ────────────────────────────────────────────────────

const API_BASE = "https://application.koombiyodelivery.lk/api";

type ApiRecord = Record<string, unknown>;

function isApiRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstField(record: ApiRecord, keys: readonly string[]): unknown {
  for (const key of keys) {
    const value = record[key];
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return undefined;
}

function stringField(
  record: ApiRecord,
  keys: readonly string[],
  fallback = "",
): string {
  const value = firstField(record, keys);
  return value === undefined ? fallback : String(value);
}

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Build a URLSearchParams body from a plain object.
 * Koombiyo always uses application/x-www-form-urlencoded.
 */
function formBody(params: Record<string, string>): URLSearchParams {
  return new URLSearchParams(params);
}

/**
 * Raw POST to the Koombiyo API.
 * Handles URL-encoded bodies, non-OK statuses, and JSON parsing.
 */
async function apiPost(
  endpoint: string,
  body: Record<string, string>,
): Promise<unknown> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formBody(body),
  });

  if (!res.ok) {
    let errorMsg = `Koombiyo API error (${res.status})`;
    try {
      const text = await res.text();
      if (text) errorMsg = text.slice(0, 300);
    } catch {
      /* ignore */
    }
    throw new Error(errorMsg);
  }

  // Koombiyo returns JSON on success
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  // Some endpoints may return plain text
  const text = await res.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

/**
 * Safely extract an array from an API response.
 * Handles { data: [...] }, [...], and { ...single... } formats.
 */
function extractArray(data: unknown, field?: string): unknown[] {
  if (Array.isArray(data)) return data;
  if (!isApiRecord(data)) return [];
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.result)) return data.result;
  if (Array.isArray(data.list)) return data.list;
  if (field && Array.isArray(data[field])) return data[field];
  // Single object wrapped in response
  return [data];
}

// ─── District / City ID Lookup ──────────────────────────────────────
// Koombiyo uses numeric IDs for districts and cities, but orders store
// names. We look up the ID from the cached locations.

async function loadCachedLocationsFromDb(
  businessId: string,
): Promise<{ states: CourierState[]; cities: CourierCity[] } | null> {
  try {
    const supabase = createClient();
    const { data: settings } = await supabase
      .from("business_settings")
      .select("key, value")
      .eq("business_id", businessId)
      .in("key", [
        SHARED_SETTINGS_KEYS.location_states,
        SHARED_SETTINGS_KEYS.location_cities,
      ]);

    if (!settings) return null;

    const map: Record<string, string> = {};
    settings.forEach((s) => {
      map[s.key] = String(s.value);
    });

    const statesJson = map[SHARED_SETTINGS_KEYS.location_states];
    const citiesJson = map[SHARED_SETTINGS_KEYS.location_cities];

    if (!statesJson || !citiesJson) return null;

    return {
      states: JSON.parse(statesJson),
      cities: JSON.parse(citiesJson),
    };
  } catch (err) {
    console.error("[Koombiyo] Failed to load cached locations:", err);
    return null;
  }
}

function findDistrictId(
  locations: { states: CourierState[] },
  districtName: string | null,
): string | null {
  if (!districtName) return null;
  const name = districtName.trim().toLowerCase();
  const match = locations.states.find((s) => s.name.toLowerCase() === name);
  return match ? String(match.id) : null;
}

function findCityId(
  locations: { cities: CourierCity[] },
  cityName: string | null,
): string | null {
  if (!cityName) return null;
  const name = cityName.trim().toLowerCase();
  const match = locations.cities.find((c) => c.name.toLowerCase() === name);
  return match ? String(match.id) : null;
}

// ─── Status Mapping ──────────────────────────────────────────────────
// Precise Koombiyo API status → internal delivery status mappings.
// Avoids the fragile keyword matching in the shared fallback.

function koombiyoMapStatus(apiStatus: string): string | null {
  const s = apiStatus.toLowerCase().trim();

  // Exact matches first
  const exact: Record<string, string> = {
    confirmed: "confirmed",
    pending: "confirmed",
    delivered: "delivered",
    completed: "delivered",
    cancelled: "cancelled",
    canceled: "cancelled",
  };

  if (exact[s]) return exact[s];

  // Partial matches — order matters (fail BEFORE deliver for "Failed to Deliver")
  if (s.includes("fail")) return "returned";
  if (s.includes("deliver")) return "delivered";
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("return")) return "returned";
  if (s.includes("rto")) return "returned";
  if (s.includes("reschedule")) return "to_dispatch";
  if (s.includes("hold")) return "to_dispatch";
  if (s.includes("out for delivery")) return "assigned_to_rider";
  if (s.includes("rider") || s.includes("assign")) return "assigned_to_rider";
  if (s.includes("pickup") || s.includes("collected") || s.includes("pick")) return "in_branch";
  if (s.includes("transit") || s.includes("dispatch") || s.includes("warehouse")) return "in_branch";
  if (s.includes("branch")) return "in_branch";

  return null;
}

// ─── Dashboard Status Display Config ─────────────────────────────────
// Defines the standard cards shown on the courier page.
// Each entry declares which Koombiyo status labels (lowercase, partial match)
// should appear under that card, plus a semantic category for styling.

const STATUS_DISPLAY: StatusDisplayEntry[] = [
  {
    id: "confirmed",
    label: "Confirmed",
    matchPatterns: ["confirmed", "pending"],
    category: "confirmed",
  },
  {
    id: "in_transit",
    label: "In Transit",
    matchPatterns: [
      "in transit",
      "transit",
      "in_branch",
      "dispatched",
      "warehouse",
      "pickup",
      "collected",
    ],
    category: "transit",
  },
  {
    id: "to_be_delivered",
    label: "To Be Delivered",
    matchPatterns: [
      "out for delivery",
      "to be delivered",
      "rider assigned",
      "assigned_to_rider",
    ],
    category: "rider",
  },
  {
    id: "rescheduled",
    label: "Rescheduled",
    matchPatterns: ["rescheduled", "hold", "to_dispatch"],
    category: "rescheduled",
  },
  {
    id: "to_be_returned",
    label: "To Be Returned",
    matchPatterns: ["to be returned", "returned", "rto"],
    category: "pending",
  },
  {
    id: "delivered",
    label: "Delivered",
    matchPatterns: ["delivered", "completed"],
    category: "completed",
  },
  {
    id: "cancelled",
    label: "Cancelled",
    matchPatterns: ["cancelled", "canceled", "failed"],
    category: "failed",
  },
];

// ─── Provider Implementation ─────────────────────────────────────────

export const koombiyoProvider: CourierProvider = {
  id: "koombiyo",
  label: "Koombiyo Delivery",
  settingsKeys: { ...SETTINGS_KEYS },

  // ── Auto-generated credential form metadata ──────────────────
  credentialFields: [
    {
      key: "api_key",
      label: "API Key",
      type: "password",
      placeholder: "Enter your Koombiyo API key",
      required: true,
      hint: "Your API key from the Koombiyo Delivery merchant portal.",
    },
  ],

  validateCredentials(credentials: Record<string, string>): string | null {
    if (!credentials.api_key?.trim()) return "API Key is required.";
    return null;
  },

  async testConnection(credentials: Record<string, string>): Promise<boolean> {
    try {
      const data = await apiPost("/Districts/users", {
        apikey: credentials.api_key.trim(),
      });
      // Any non-error response means the API key works
      return data !== null && data !== undefined;
    } catch {
      return false;
    }
  },

  async ship(
    order,
    credentials,
  ): Promise<{ waybill: string }> {
    const apiKey = credentials.api_key.trim();

    // ── 1. Get a pre-allocated waybill from Koombiyo ───────────
    const waybillData = await apiPost("/Waybils/users", {
      apikey: apiKey,
      limit: "1",
    });

    // Extract waybill — Koombiyo may return various shapes
    const waybillArray = extractArray(waybillData);
    let waybill: string | null = null;
    for (const entry of waybillArray) {
      if (typeof entry === "string") {
        waybill = entry;
        break;
      }
      if (isApiRecord(entry)) {
        const value = firstField(entry, ["waybill_id", "waybill", "barcode"]);
        if (value === undefined) continue;
        waybill = String(value);
        break;
      }
    }

    if (!waybill) {
      throw new Error(
        "No available barcodes from Koombiyo. " +
          "Please add barcodes via the Koombiyo merchant portal first.",
      );
    }

    // ── 2. Resolve district / city names → IDs ─────────────────
    // Koombiyo requires numeric IDs. We look them up from the
    // cached locations that syncLocations() stored.
    // If lookup fails, pass the name directly — the API may accept it.
    let districtId = order.customer_district || "1";
    let cityId = order.customer_city || "1";

    try {
      // Get business_id from the order record
      const supabase = createClient();
      const { data: orderRecord } = await supabase
        .from("orders")
        .select("business_id")
        .eq("id", order.id)
        .maybeSingle();

      if (orderRecord?.business_id) {
        const cached = await loadCachedLocationsFromDb(orderRecord.business_id);
        if (cached) {
          const foundDistrict = findDistrictId(cached, order.customer_district);
          if (foundDistrict) districtId = foundDistrict;

          const foundCity = findCityId(cached, order.customer_city);
          if (foundCity) cityId = foundCity;
        }
      }
    } catch (err) {
      console.warn("[Koombiyo] Could not resolve district/city IDs, using raw values:", err);
    }

    // ── 3. Register the order with Koombiyo ────────────────────
    const cod = Math.max(0, order.total - order.advance_paid);
    const description = order.items
      .map((i) => `${i.product_name} x${i.quantity}`)
      .join(", ")
      .slice(0, 255);

    const params: Record<string, string> = {
      apikey: apiKey,
      orderWaybillid: waybill,
      orderNo: order.order_number,
      receiverName: order.customer_name,
      receiverStreet: order.customer_address || "",
      receiverDistrict: districtId,
      receiverCity: cityId,
      receiverPhone: order.customer_phone || "",
      description,
      spclNote: "",
      getCod: String(cod),
    };

    try {
      await apiPost("/Addorders/users", params);
    } catch (err) {
      // The waybill was consumed from Koombiyo's pool but the order
      // registration failed. The waybill is now "wasted" in Koombiyo.
      // We still return it so the order gets a waybill_id and the
      // user can follow up with Koombiyo support.
      console.warn(
        "[Koombiyo] Order registration failed but waybill was consumed:",
        waybill,
        err,
      );
      throw new Error(
        `Waybill ${waybill} was claimed from Koombiyo but order registration failed. ` +
          `The waybill ID has been saved to the order so you can follow up. ` +
          `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }

    return { waybill };
  },

  async track(
    waybillNumber: string,
    credentials: Record<string, string>,
  ): Promise<TrackingEvent[]> {
    const data = await apiPost("/Orderhistory/users", {
      apikey: credentials.api_key.trim(),
      waybillid: waybillNumber,
    });

    const events = extractArray(data);

    if (events.length === 0) return [];

    return events.map((event) => {
      const record = isApiRecord(event) ? event : {};
      return {
        status: stringField(record, ["status", "status_name", "event"], "Unknown"),
        dateTime: stringField(record, ["date", "date_time", "created_at"]),
        dateTimeAgo: "",
        user: stringField(record, ["user", "updated_by"]),
      };
    });
  },

  async fetchFinance(): Promise<OrderFinanceInfo> {
    // Koombiyo does not have a dedicated COD/finance endpoint.
    // The `del_charge` value is delivered only via webhook.
    // The finance tab will show "N/A" and rely on manual toggle.
    return {
      financeStatus: "N/A",
      invoiceRefNo: null,
      invoiceNo: null,
    };
  },

  // ── Provider-level status mapping ───────────────────────────
  mapStatus: koombiyoMapStatus,
  statusDisplayConfig: STATUS_DISPLAY,

  async syncLocations(
    businessId: string,
    credentials: Record<string, string>,
  ): Promise<CourierLocations> {
    const apiKey = credentials.api_key.trim();

    // ── 1. Fetch all districts ─────────────────────────────────
    const districtsRaw = await apiPost("/Districts/users", {
      apikey: apiKey,
    });

    const districtEntries = extractArray(districtsRaw);
    const districts: CourierState[] = districtEntries.map((district) => {
      const record = isApiRecord(district) ? district : {};
      const id = firstField(record, ["id", "district_id", "state_id"]);
      return {
        id: Number(id),
        name: stringField(record, ["name", "district_name", "state_name"], String(id)),
      };
    });

    // ── 2. Fetch cities for each district ──────────────────────
    const allCities: CourierCity[] = [];

    // Fetch cities in parallel batches (avoid rate limiting)
    const BATCH_SIZE = 5;
    for (let i = 0; i < districts.length; i += BATCH_SIZE) {
      const batch = districts.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((district) =>
          apiPost("/Cities/users", {
            apikey: apiKey,
            district_id: String(district.id),
          }).catch((err) => {
            console.warn(
              `[Koombiyo] Failed to fetch cities for district ${district.id}:`,
              err,
            );
            return null;
          }),
        ),
      );

      for (let j = 0; j < batch.length; j++) {
        const result = results[j];
        if (result.status === "fulfilled" && result.value) {
          const cityEntries = extractArray(result.value);
          const cities: CourierCity[] = cityEntries.map((city) => {
            const record = isApiRecord(city) ? city : {};
            const id = firstField(record, ["id", "city_id"]);
            return {
              id: Number(id),
              name: stringField(record, ["name", "city_name"], String(id)),
              state_id: batch[j].id,
            };
          });
          allCities.push(...cities);
        }
      }
    }

    // ── 3. Persist to business_settings ────────────────────────
    const supabase = createClient();
    const now = new Date().toISOString();

    await Promise.all([
      supabase.from("business_settings").upsert(
        {
          business_id: businessId,
          key: SHARED_SETTINGS_KEYS.location_states,
          value: JSON.stringify(districts),
        },
        { onConflict: "business_id, key" },
      ),
      supabase.from("business_settings").upsert(
        {
          business_id: businessId,
          key: SHARED_SETTINGS_KEYS.location_cities,
          value: JSON.stringify(allCities),
        },
        { onConflict: "business_id, key" },
      ),
      supabase.from("business_settings").upsert(
        {
          business_id: businessId,
          key: SHARED_SETTINGS_KEYS.location_synced_at,
          value: now,
        },
        { onConflict: "business_id, key" },
      ),
    ]);

    return { states: districts, cities: allCities, syncedAt: now };
  },
};

// ─── Auto-register on import ─────────────────────────────────────────

registerProvider(koombiyoProvider);
