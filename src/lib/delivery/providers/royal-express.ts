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
    const errData = await loginRes.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to authenticate with courier");
  }

  const loginData = await loginRes.json();
  return loginData.token;
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
    matchPatterns: ["delivered", "completed"],
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

    const data = await res.json();
    return res.ok && !!data.token;
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
      const errData = await bizRes.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to fetch merchant businesses");
    }

    const bizData = await bizRes.json();
    const businesses = bizData.data || [];
    const defaultBusiness =
      businesses.find((b: any) => b.is_default) || businesses[0];
    if (!defaultBusiness) {
      throw new Error(
        "No business found in your Royal Express account. Please set up a business in the Royal Express merchant portal first.",
      );
    }
    const merchantBusinessId = String(defaultBusiness.id);

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
        const errData = JSON.parse(responseText);
        if (errData.errors && typeof errData.errors === "object") {
          const fieldErrors: string[] = [];
          for (const [, messages] of Object.entries(errData.errors)) {
            if (Array.isArray(messages)) fieldErrors.push(...messages);
          }
          if (fieldErrors.length > 0) errorMsg = fieldErrors.join("; ");
        } else if (errData.message) {
          errorMsg = errData.message;
        }
      } catch {
        /* ignore */
      }
      throw new Error(errorMsg);
    }

    const shipData = await shipRes.json();
    const waybill = shipData.data?.[0];
    if (!waybill) throw new Error("No waybill returned from courier");
    return { waybill };
  },

  async track(waybillNumber, credentials): Promise<any[]> {
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
        const errData = await res.json();
        if (errData.message) errorMsg = errData.message;
      } catch {
        /* ignore */
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    const events: any[] = data.data || [];

    return events.map((e: any) => ({
      status: e.status?.name || "Unknown",
      dateTime: e.date_time || "",
      dateTimeAgo: e.date_time_ago || "",
      user: e.user
        ? `${e.user.first_name || ""} ${e.user.last_name || ""}`.trim()
        : "",
    }));
  },

  async fetchFinance(waybillNumber, credentials): Promise<any> {
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
        const errData = await res.json();
        if (errData.message) errorMsg = errData.message;
      } catch {
        /* ignore */
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    const d = data.data || {};

    return {
      financeStatus: d.finance_status || "Unknown",
      invoiceRefNo: d.invoice_ref_no || null,
      invoiceNo: d.invoice_no || null,
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

    const statuses: { key: string; name: string; is_merchant_status: number }[] =
      statusRes.ok
        ? (await statusRes.json()).data || []
        : [];

    // Map merchant-visible Curfox statuses to dashboard breakdown
    const statusBreakdown = statuses
      .filter((s) => s.is_merchant_status === 1)
      .map((s) => ({
        id: s.key,
        label: s.name,
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
      const errData = await statesRes.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to fetch states from courier");
    }

    const statesData = await statesRes.json();
    const states: CourierState[] = (statesData.data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
    }));

    const citiesRes = await fetch(`${API_BASE}/city?noPagination=1`, {
      method: "GET",
      headers: authHeaders(token, credentials.tenant),
    });

    if (!citiesRes.ok) {
      const errData = await citiesRes.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to fetch cities from courier");
    }

    const citiesData = await citiesRes.json();
    const cities: CourierCity[] = (citiesData.data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      state_id: c.state_id,
    }));

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
