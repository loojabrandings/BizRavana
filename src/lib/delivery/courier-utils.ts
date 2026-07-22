import { createClient } from "@/lib/supabase/client";

const SETTINGS_KEYS = {
  selected_courier: "courier_selected_provider",
  royal_express_tenant: "courier_royal_express_tenant",
  royal_express_email: "courier_royal_express_email",
  royal_express_password: "courier_royal_express_password",
  royal_express_origin_city: "courier_royal_express_origin_city",
  royal_express_origin_state: "courier_royal_express_origin_state",
  location_states: "courier_location_states",
  location_cities: "courier_location_cities",
  location_synced_at: "courier_location_synced_at",
} as const;

export interface CourierState {
  id: number;
  name: string;
}

export interface CourierCity {
  id: number;
  name: string;
  state_id: number;
}

export interface CourierLocations {
  states: CourierState[];
  cities: CourierCity[];
  syncedAt: string | null;
}

export interface CourierConfig {
  provider: string | null;
  providerLabel: string | null;
  credentials: Record<string, string>;
}

export interface TrackingEvent {
  status: string;
  dateTime: string;
  dateTimeAgo: string;
  user: string;
}

export interface OrderFinanceInfo {
  financeStatus: string;
  invoiceRefNo: string | null;
  invoiceNo: string | null;
}

const PROVIDER_LABELS: Record<string, string> = {
  royal_express: "Royal Express",
};

/** Load the courier configuration for the current user's business. */
export async function loadCourierConfig(): Promise<CourierConfig | null> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id")
      .eq("user_id", session.user.id)
      .single();

    if (!profile?.business_id) return null;

    const { data: settings } = await supabase
      .from("business_settings")
      .select("key, value")
      .eq("business_id", profile.business_id);

    if (!settings) return null;

    const map: Record<string, string> = {};
    settings.forEach((s) => { map[s.key] = String(s.value); });

    const provider = map[SETTINGS_KEYS.selected_courier] || null;
    if (!provider || provider === "none") {
      return { provider: null, providerLabel: null, credentials: {} };
    }

    const credentials: Record<string, string> = {};
    if (provider === "royal_express") {
      credentials.tenant = map[SETTINGS_KEYS.royal_express_tenant] || "";
      credentials.email = map[SETTINGS_KEYS.royal_express_email] || "";
      credentials.password = map[SETTINGS_KEYS.royal_express_password] || "";
      credentials.origin_city = map[SETTINGS_KEYS.royal_express_origin_city] || "";
      credentials.origin_state = map[SETTINGS_KEYS.royal_express_origin_state] || "";
    }

    return { provider, providerLabel: PROVIDER_LABELS[provider] || provider, credentials };
  } catch (err) {
    console.error("Failed to load courier config:", err);
    return null;
  }
}

/** Authenticate with Royal Express and return a bearer token. */
async function getRoyalExpressToken(
  credentials: Record<string, string>,
): Promise<string> {
  const loginRes = await fetch("https://v1.api.curfox.com/api/public/merchant/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-tenant": credentials.tenant || "royalexpress",
    },
    body: JSON.stringify({ email: credentials.email, password: credentials.password }),
  });

  if (!loginRes.ok) {
    const errData = await loginRes.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to authenticate with courier");
  }

  const loginData = await loginRes.json();
  return loginData.token;
}

/** Send an order to the courier service. Returns the waybill number. */
export async function shipWithCourier(
  order: {
    id: string;
    order_number: string;
    customer_name: string;
    customer_phone: string | null;
    customer_address: string | null;
    customer_city: string | null;
    customer_district: string | null;
    total: number;
    advance_paid: number;
    items: { product_name: string; quantity: number; unit_price: number }[];
  },
  config: CourierConfig,
): Promise<{ waybill: string }> {
  if (config.provider === "royal_express") {
    return shipViaRoyalExpress(order, config.credentials);
  }
  throw new Error(`Unknown courier provider: ${config.provider}`);
}

async function shipViaRoyalExpress(
  order: {
    order_number: string;
    customer_name: string;
    customer_phone: string | null;
    customer_address: string | null;
    customer_city: string | null;
    customer_district: string | null;
    total: number;
    advance_paid: number;
    items: { product_name: string; quantity: number; unit_price: number }[];
  },
  credentials: Record<string, string>,
): Promise<{ waybill: string }> {
  const token = await getRoyalExpressToken(credentials);
  const cod = Math.max(0, order.total - order.advance_paid);
  const description = order.items.map((i) => `${i.product_name} x${i.quantity}`).join(", ");

  const bizRes = await fetch("https://v1.api.curfox.com/api/public/merchant/business?noPagination=1", {
    method: "GET",
    headers: {
      Accept: "application/json", "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, "X-tenant": credentials.tenant || "royalexpress",
    },
  });

  if (!bizRes.ok) {
    const errData = await bizRes.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to fetch merchant businesses");
  }

  const bizData = await bizRes.json();
  const businesses = bizData.data || [];
  const defaultBusiness = businesses.find((b: any) => b.is_default) || businesses[0];
  if (!defaultBusiness) {
    throw new Error("No business found in your Royal Express account. Please set up a business in the Royal Express merchant portal first.");
  }

  const merchantBusinessId = String(defaultBusiness.id);

  const shipRes = await fetch("https://v1.api.curfox.com/api/public/merchant/order/single", {
    method: "POST",
    headers: {
      Accept: "application/json", "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, "X-tenant": credentials.tenant || "royalexpress",
    },
    body: JSON.stringify({
      general_data: {
        merchant_business_id: merchantBusinessId,
        origin_city_name: credentials.origin_city || "Kotte",
        origin_state_name: credentials.origin_state || "Colombo",
      },
      order_data: [{
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
      }],
    }),
  });

  if (!shipRes.ok) {
    let errorMsg = "Failed to create shipment with courier";
    try {
      const errData = await shipRes.json();
      if (errData.errors && typeof errData.errors === "object") {
        const fieldErrors: string[] = [];
        for (const [, messages] of Object.entries(errData.errors)) {
          if (Array.isArray(messages)) fieldErrors.push(...messages);
        }
        if (fieldErrors.length > 0) errorMsg = fieldErrors.join("; ");
      } else if (errData.message) {
        errorMsg = errData.message;
      }
    } catch { /* ignore */ }
    throw new Error(errorMsg);
  }

  const shipData = await shipRes.json();
  const waybill = shipData.data?.[0];
  if (!waybill) throw new Error("No waybill returned from courier");
  return { waybill };
}

/** Fetch tracking history for a waybill number from Royal Express. */
export async function trackShipment(
  waybillNumber: string,
  credentials: Record<string, string>,
): Promise<TrackingEvent[]> {
  const token = await getRoyalExpressToken(credentials);

  const res = await fetch(
    "https://v1.api.curfox.com/api/public/merchant/order/tracking-info?waybill_number=" + encodeURIComponent(waybillNumber),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        "X-tenant": credentials.tenant || "royalexpress",
      },
    },
  );

  if (!res.ok) {
    let errorMsg = "Failed to fetch tracking info";
    try {
      const errData = await res.json();
      if (errData.message) errorMsg = errData.message;
    } catch { /* ignore */ }
    throw new Error(errorMsg);
  }

  const data = await res.json();
  const events: any[] = data.data || [];

  return events.map((e: any) => ({
    status: e.status?.name || "Unknown",
    dateTime: e.date_time || "",
    dateTimeAgo: e.date_time_ago || "",
    user: e.user ? (e.user.first_name || "") + " " + (e.user.last_name || "") : "",
  }));
}

/**
 * Fetch financial status for a waybill from Royal Express.
 * Returns finance status, invoice ref, and invoice number.
 */
export async function fetchOrderFinance(
  waybillNumber: string,
  credentials: Record<string, string>,
): Promise<OrderFinanceInfo> {
  const token = await getRoyalExpressToken(credentials);

  const res = await fetch(
    "https://v1.api.curfox.com/api/merchant/order/waybill-finance-status?waybill_number=" + encodeURIComponent(waybillNumber),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        "X-tenant": credentials.tenant || "royalexpress",
      },
    },
  );

  if (!res.ok) {
    let errorMsg = "Failed to fetch finance info";
    try {
      const errData = await res.json();
      if (errData.message) errorMsg = errData.message;
    } catch { /* ignore */ }
    throw new Error(errorMsg);
  }

  const data = await res.json();
  const d = data.data || {};

  return {
    financeStatus: d.finance_status || "Unknown",
    invoiceRefNo: d.invoice_ref_no || null,
    invoiceNo: d.invoice_no || null,
  };
}

/** Fetch and cache states & cities from Royal Express. */
export async function syncCourierLocations(
  businessId: string,
  credentials: Record<string, string>,
): Promise<CourierLocations> {
  const token = await getRoyalExpressToken(credentials);

  const statesRes = await fetch("https://v1.api.curfox.com/api/public/merchant/state?noPagination=1", {
    method: "GET",
    headers: {
      Accept: "application/json", "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, "X-tenant": credentials.tenant || "royalexpress",
    },
  });

  if (!statesRes.ok) {
    const errData = await statesRes.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to fetch states from courier");
  }

  const statesData = await statesRes.json();
  const states: CourierState[] = (statesData.data || []).map((s: any) => ({
    id: s.id, name: s.name,
  }));

  const citiesRes = await fetch("https://v1.api.curfox.com/api/public/merchant/city?noPagination=1", {
    method: "GET",
    headers: {
      Accept: "application/json", "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, "X-tenant": credentials.tenant || "royalexpress",
    },
  });

  if (!citiesRes.ok) {
    const errData = await citiesRes.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to fetch cities from courier");
  }

  const citiesData = await citiesRes.json();
  const cities: CourierCity[] = (citiesData.data || []).map((c: any) => ({
    id: c.id, name: c.name, state_id: c.state_id,
  }));

  const supabase = createClient();
  const now = new Date().toISOString();

  await Promise.all([
    supabase.from("business_settings").upsert(
      { business_id: businessId, key: SETTINGS_KEYS.location_states, value: JSON.stringify(states) },
      { onConflict: "business_id, key" },
    ),
    supabase.from("business_settings").upsert(
      { business_id: businessId, key: SETTINGS_KEYS.location_cities, value: JSON.stringify(cities) },
      { onConflict: "business_id, key" },
    ),
    supabase.from("business_settings").upsert(
      { business_id: businessId, key: SETTINGS_KEYS.location_synced_at, value: now },
      { onConflict: "business_id, key" },
    ),
  ]);

  return { states, cities, syncedAt: now };
}

/** Load cached locations from business_settings. */
export async function loadCachedLocations(
  businessId: string,
): Promise<CourierLocations | null> {
  try {
    const supabase = createClient();
    const { data: settings } = await supabase
      .from("business_settings")
      .select("key, value")
      .eq("business_id", businessId)
      .in("key", [SETTINGS_KEYS.location_states, SETTINGS_KEYS.location_cities, SETTINGS_KEYS.location_synced_at]);

    if (!settings) return null;

    const map: Record<string, string> = {};
    settings.forEach((s) => { map[s.key] = String(s.value); });

    const statesJson = map[SETTINGS_KEYS.location_states];
    const citiesJson = map[SETTINGS_KEYS.location_cities];

    if (!statesJson || !citiesJson) return null;

    return {
      states: JSON.parse(statesJson),
      cities: JSON.parse(citiesJson),
      syncedAt: map[SETTINGS_KEYS.location_synced_at] || null,
    };
  } catch (err) {
    console.error("Failed to load cached locations:", err);
    return null;
  }
}
