import { createClient } from "@/lib/supabase/client";
import {
  registerProvider,
  SHARED_SETTINGS_KEYS,
  type CourierProvider,
  type StatusDisplayEntry,
} from "@/lib/delivery/provider-registry";
import type {
  CourierDashboardData,
  CourierLocations,
  CourierState,
  CourierCity,
  OrderFinanceInfo,
  TrackingEvent,
} from "@/lib/delivery/types";

// ─── Settings Keys ───────────────────────────────────────────────────

const SETTINGS_KEYS = {
  tenant: "courier_royal_express_tenant",
  email: "courier_royal_express_email",
  password: "courier_royal_express_password",
  origin_city: "courier_royal_express_origin_city",
  origin_state: "courier_royal_express_origin_state",
} as const;

// ─── API Base URL ────────────────────────────────────────────────────

const API_BASE = "https://v1.api.curfox.com/api/public/merchant";

type ApiRecord = Record<string, unknown>;

function isApiRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function apiRecord(value: unknown): ApiRecord {
  return isApiRecord(value) ? value : {};
}

function dataArray(payload: unknown): unknown[] {
  const data = apiRecord(payload).data;
  return Array.isArray(data) ? data : [];
}

function dataRecord(payload: unknown): ApiRecord {
  return apiRecord(apiRecord(payload).data);
}

function stringField(record: ApiRecord, key: string, fallback = ""): string {
  const value = record[key];
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

function nullableStringField(record: ApiRecord, key: string): string | null {
  const value = record[key];
  return value === null || value === undefined || value === "" ? null : String(value);
}

function errorMessage(payload: unknown, fallback: string): string {
  const record = apiRecord(payload);
  const message = nullableStringField(record, "message");
  if (message) return message;

  const errors = apiRecord(record.errors);
  const fieldErrors = Object.values(errors).flatMap((value) =>
    Array.isArray(value) ? value.map(String) : [],
  );
  return fieldErrors.length > 0 ? fieldErrors.join("; ") : fallback;
}

// ─── Helpers ─────────────────────────────────────────────────────────

async function getToken(credentials: Record<string, string>): Promise<string> {
  const loginRes = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-tenant": credentials.tenant || "royalexpress",
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  if (!loginRes.ok) {
    const errorPayload: unknown = await loginRes.json().catch(() => ({}));
    throw new Error(errorMessage(errorPayload, "Failed to authenticate with courier"));
  }

  const loginData = apiRecord((await loginRes.json()) as unknown);
  const token = nullableStringField(loginData, "token");
  if (!token) throw new Error("Courier authentication response did not include a token");
  return token;
}

function authHeaders(token: string, tenant: string): Record<string, string> {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-tenant": tenant || "royalexpress",
  };
}

// ─── Status Mapping ──────────────────────────────────────────────────
// Precise Curfox status → internal delivery status mappings.
// Avoids the fragile keyword matching in the shared fallback.

function royalExpressMapStatus(apiStatus: string): string | null {
  const s = apiStatus.toLowerCase().trim();

  // Exact matches first
  const exact: Record<string, string> = {
    confirmed: "confirmed",
    draft: "confirmed",
    dispatched: "in_branch",
    "in transit": "in_branch",
    "out for delivery": "assigned_to_rider",
    delivered: "delivered",
    completed: "delivered",
    cancelled: "cancelled",
  };

  if (exact[s]) return exact[s];

  // Partial matches for known patterns
  // Royal Express treats a partially delivered order as delivered.
  if (s.includes("partially delivered")) return "delivered";
  if (s.includes("failed to deliver")) return "returned";
  if (s.includes("failed")) return "returned";
  if (s.includes("return")) return "returned";
  if (s.includes("rto")) return "returned";
  if (s.includes("reschedule")) return "to_dispatch";
  if (s.includes("hold")) return "to_dispatch";
  if (s.includes("pickup") || s.includes("collected")) return "in_branch";
  if (s.includes("rider") || s.includes("assign")) return "assigned_to_rider";

  return null;
}

// ─── Dashboard Status Display Config ─────────────────────────────────
// Defines the 7 standard cards shown on the courier page.
// Each entry declares which Curfox status labels (lowercase, partial match)
// should appear under that card, plus a semantic category for styling.

const STATUS_DISPLAY: StatusDisplayEntry[] = [
  {
    id: "confirmed",
    label: "Confirmed",
    matchPatterns: ["confirmed"],
    category: "confirmed",
  },
  {
    id: "dispatched",
    label: "Dispatched",
    matchPatterns: ["dispatched"],
    category: "transit",
  },
  {
    id: "in_transit",
    label: "In Transit",
    matchPatterns: ["in transit", "in_branch"],
    category: "transit",
  },
  {
    id: "to_be_delivered",
    label: "To Be Delivered",
    matchPatterns: ["to be delivered", "out for delivery", "rider assigned", "assigned_to_rider"],
    category: "rider",
  },
  {
    id: "rescheduled",
    label: "Rescheduled",
    matchPatterns: ["rescheduled", "to_dispatch"],
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
    // Partially delivered orders are counted as delivered.
    matchPatterns: ["delivered", "completed", "partially delivered"],
    category: "completed",
  },
];

// ─── Provider Implementation ─────────────────────────────────────────

export const royalExpressProvider: CourierProvider = {
  id: "royal_express",
  label: "Royal Express",
  settingsKeys: { ...SETTINGS_KEYS },

  // ── Auto-generated credential form metadata ──────────────────
  credentialFields: [
    {
      key: "tenant",
      label: "Tenant Name",
      type: "text",
      readonly: true,
      hint: "Auto-filled for Royal Express. Cannot be changed.",
    },
    {
      key: "email",
      label: "API Email",
      type: "email",
      placeholder: "sales@testmerchant.com",
      required: true,
    },
    {
      key: "password",
      label: "API Password",
      type: "password",
      placeholder: "Enter your API password",
      required: true,
    },
  ],

  validateCredentials(credentials: Record<string, string>): string | null {
    if (!credentials.email?.trim()) return "API Email is required.";
    if (!credentials.password?.trim()) return "API Password is required.";
    return null;
  },

  async testConnection(credentials: Record<string, string>): Promise<boolean> {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-tenant": credentials.tenant || "royalexpress",
      },
      body: JSON.stringify({
        email: credentials.email?.trim(),
        password: credentials.password?.trim(),
      }),
    });

    const data = apiRecord((await res.json()) as unknown);
    return res.ok && nullableStringField(data, "token") !== null;
  },

  async ship(order, credentials): Promise<{ waybill: string }> {
    const token = await getToken(credentials);
    const cod = Math.max(0, order.total - order.advance_paid);
    const description = order.items
      .map((i) => `${i.product_name} x${i.quantity}`)
      .join(", ");

    const bizRes = await fetch(`${API_BASE}/business?noPagination=1`, {
      method: "GET",
      headers: authHeaders(token, credentials.tenant),
    });

    if (!bizRes.ok) {
      const errorPayload: unknown = await bizRes.json().catch(() => ({}));
      throw new Error(errorMessage(errorPayload, "Failed to fetch merchant businesses"));
    }

    const bizData: unknown = await bizRes.json();
    const businesses = dataArray(bizData).filter(isApiRecord);
    const defaultBusiness =
      businesses.find((business) => Boolean(business.is_default)) || businesses[0];
    if (!defaultBusiness) {
      throw new Error(
        "No business found in your Royal Express account. Please set up a business in the Royal Express merchant portal first.",
      );
    }
    const merchantBusinessId = stringField(defaultBusiness, "id");
    if (!merchantBusinessId) {
      throw new Error("Royal Express business response did not include an ID");
    }

    const requestBody = {
      general_data: {
        merchant_business_id: merchantBusinessId,
        origin_city_name: credentials.origin_city || "Kotte",
        origin_state_name: credentials.origin_state || "Colombo",
      },
      order_data: [
        {
          ...(order.waybill_id ? { waybill_number: order.waybill_id } : {}),
          order_no: order.order_number,
          customer_name: order.customer_name,
          customer_address: order.customer_address || "",
          customer_phone: order.customer_phone || "",
          destination_city_name: order.customer_city || "Colombo 01",
          destination_state_name: order.customer_district || "Colombo",
          cod,
          description: description.slice(0, 255),
          weight: 1,
          remark: "",
        },
      ],
    };

    const shipRes = await fetch(`${API_BASE}/order/single`, {
      method: "POST",
      headers: authHeaders(token, credentials.tenant),
      body: JSON.stringify(requestBody),
    });

    if (!shipRes.ok) {
      let errorMsg = "Failed to create shipment with courier";
      try {
        const responseText = await shipRes.text();
        const errorPayload = JSON.parse(responseText) as unknown;
        errorMsg = errorMessage(errorPayload, errorMsg);
      } catch {
        /* ignore */
      }
      throw new Error(errorMsg);
    }

    const shipData: unknown = await shipRes.json();
    const waybillValue = dataArray(shipData)[0];
    if (waybillValue === null || waybillValue === undefined || waybillValue === "") {
      throw new Error("No waybill returned from courier");
    }
    return { waybill: String(waybillValue) };
  },

  async track(waybillNumber, credentials): Promise<TrackingEvent[]> {
    const token = await getToken(credentials);

    const res = await fetch(
      `${API_BASE}/order/tracking-info?waybill_number=${encodeURIComponent(waybillNumber)}`,
      {
        method: "GET",
        headers: authHeaders(token, credentials.tenant),
      },
    );

    if (!res.ok) {
      let errorMsg = "Failed to fetch tracking info";
      try {
        const errorPayload: unknown = await res.json();
        errorMsg = errorMessage(errorPayload, errorMsg);
      } catch {
        /* ignore */
      }
      throw new Error(errorMsg);
    }

    const data: unknown = await res.json();
    const events = dataArray(data);

    return events.map((event) => {
      const record = apiRecord(event);
      const status = apiRecord(record.status);
      const user = apiRecord(record.user);
      return {
        status: stringField(status, "name", "Unknown"),
        dateTime: stringField(record, "date_time"),
        dateTimeAgo: stringField(record, "date_time_ago"),
        user: `${stringField(user, "first_name")} ${stringField(user, "last_name")}`.trim(),
      };
    });
  },

  async fetchFinance(waybillNumber, credentials): Promise<OrderFinanceInfo> {
    const token = await getToken(credentials);

    const res = await fetch(
      `${API_BASE.replace("/public", "")}/order/waybill-finance-status?waybill_number=${encodeURIComponent(waybillNumber)}`,
      {
        method: "GET",
        headers: authHeaders(token, credentials.tenant),
      },
    );

    if (!res.ok) {
      let errorMsg = "Failed to fetch finance info";
      try {
        const errorPayload: unknown = await res.json();
        errorMsg = errorMessage(errorPayload, errorMsg);
      } catch {
        /* ignore */
      }
      throw new Error(errorMsg);
    }

    const data: unknown = await res.json();
    const finance = dataRecord(data);

    return {
      financeStatus: stringField(finance, "finance_status", "Unknown"),
      invoiceRefNo: nullableStringField(finance, "invoice_ref_no"),
      invoiceNo: nullableStringField(finance, "invoice_no"),
    };
  },

  async fetchDashboard(
    credentials: Record<string, string>,
  ): Promise<CourierDashboardData> {
    const token = await getToken(credentials);

    // Fetch order status list to know available statuses
    const statusRes = await fetch(`${API_BASE}/order/status-list`, {
      method: "GET",
      headers: authHeaders(token, credentials.tenant),
    });

    const statusPayload: unknown = statusRes.ok ? await statusRes.json() : null;
    const statuses = dataArray(statusPayload).filter(isApiRecord);

    // Map merchant-visible Curfox statuses to dashboard breakdown
    const statusBreakdown = statuses
      .filter((status) => Number(status.is_merchant_status) === 1)
      .map((status) => ({
        id: stringField(status, "key"),
        label: stringField(status, "name"),
        count: 0,
        deliveryCharge: 0,
      }));

    return {
      connected: true,
      providerLabel: "Royal Express",
      totalOrders: 0,
      statusBreakdown,
      recentActivity: [],
    };
  },

  // ── Provider-level status mapping ───────────────────────────
  mapStatus: royalExpressMapStatus,
  statusDisplayConfig: STATUS_DISPLAY,

  async syncLocations(businessId, credentials): Promise<CourierLocations> {
    const token = await getToken(credentials);

    const statesRes = await fetch(`${API_BASE}/state?noPagination=1`, {
      method: "GET",
      headers: authHeaders(token, credentials.tenant),
    });

    if (!statesRes.ok) {
      const errorPayload: unknown = await statesRes.json().catch(() => ({}));
      throw new Error(errorMessage(errorPayload, "Failed to fetch states from courier"));
    }

    const statesData: unknown = await statesRes.json();
    const states: CourierState[] = dataArray(statesData).map((state) => {
      const record = apiRecord(state);
      return {
        id: Number(record.id),
        name: stringField(record, "name"),
      };
    });

    const citiesRes = await fetch(`${API_BASE}/city?noPagination=1`, {
      method: "GET",
      headers: authHeaders(token, credentials.tenant),
    });

    if (!citiesRes.ok) {
      const errorPayload: unknown = await citiesRes.json().catch(() => ({}));
      throw new Error(errorMessage(errorPayload, "Failed to fetch cities from courier"));
    }

    const citiesData: unknown = await citiesRes.json();
    const cities: CourierCity[] = dataArray(citiesData).map((city) => {
      const record = apiRecord(city);
      return {
        id: Number(record.id),
        name: stringField(record, "name"),
        state_id: Number(record.state_id),
      };
    });

    const supabase = createClient();
    const now = new Date().toISOString();

    await Promise.all([
      supabase.from("business_settings").upsert(
        {
          business_id: businessId,
          key: SHARED_SETTINGS_KEYS.location_states,
          value: JSON.stringify(states),
        },
        { onConflict: "business_id, key" },
      ),
      supabase.from("business_settings").upsert(
        {
          business_id: businessId,
          key: SHARED_SETTINGS_KEYS.location_cities,
          value: JSON.stringify(cities),
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

    return { states, cities, syncedAt: now };
  },
};

// ─── Auto-register on import ─────────────────────────────────────────

registerProvider(royalExpressProvider);
