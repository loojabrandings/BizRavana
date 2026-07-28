// ─── Courier Provider Types ──────────────────────────────────────────

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

export interface ShipOrderParams {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string | null;
  customer_address: string | null;
  customer_city: string | null;
  customer_district: string | null;
  total: number;
  advance_paid: number;
  waybill_id: string | null;
  items: { product_name: string; quantity: number; unit_price: number }[];
}

export interface ShipOrderResult {
  waybill: string;
}

// ─── Dashboard Types ─────────────────────────────────────────────────

/** A single status bucket shown on the courier dashboard (e.g. "Delivered", "In Transit"). */
export interface CourierStatusBreakdown {
  id: string;
  label: string;
  count: number;
  deliveryCharge: number;
}

/** A single row in the recent activity table on the courier dashboard. */
export interface CourierRecentActivity {
  orderNumber: string;
  customerName: string;
  waybill: string;
  status: string;
  date: string;
}

/** Full dashboard payload returned by a provider's fetchDashboard(). */
export interface CourierDashboardData {
  connected: boolean;
  providerLabel: string;
  totalOrders: number;
  statusBreakdown: CourierStatusBreakdown[];
  recentActivity: CourierRecentActivity[];
}

// ─── Business Settings key conventions ───────────────────────────────
// Settings are stored as flat key-value pairs in `business_settings`:
//   courier_selected_provider         — the active provider ID
//   courier_<provider>_<field>        — provider-specific credentials
//   courier_location_states           — cached states (shared across providers)
//   courier_location_cities           — cached cities (shared across providers)
//   courier_location_synced_at        — cache timestamp
