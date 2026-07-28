import type {
  CourierConfig,
  CourierDashboardData,
  CourierLocations,
  TrackingEvent,
  OrderFinanceInfo,
  ShipOrderParams,
  ShipOrderResult,
} from "./types";

// ─── Provider Interface ──────────────────────────────────────────────

export interface CourierProvider {
  /** Unique identifier for this provider (e.g. "royal_express", "koombiyo"). */
  id: string;
  /** Human-readable label (e.g. "Royal Express"). */
  label: string;
  /**
   * Maps logical credential field names to their `business_settings` key.
   * Example: { tenant: "courier_royal_express_tenant", email: "courier_royal_express_email" }
   */
  settingsKeys: Record<string, string>;

  /** Test the connection with the given credentials. Returns true if valid. */
  testConnection(credentials: Record<string, string>): Promise<boolean>;

  /** Ship an order through this courier. Returns the waybill number. */
  ship(order: ShipOrderParams, credentials: Record<string, string>): Promise<ShipOrderResult>;

  /** Fetch tracking history for a waybill. */
  track(waybillNumber: string, credentials: Record<string, string>): Promise<TrackingEvent[]>;

  /** Fetch financial info for a waybill. */
  fetchFinance(waybillNumber: string, credentials: Record<string, string>): Promise<OrderFinanceInfo>;

  /** Sync location data (states, cities) from the courier API. */
  syncLocations(businessId: string, credentials: Record<string, string>): Promise<CourierLocations>;

  /**
   * Optional: provider-specific validation of credentials before testing/saving.
   * Return an error message string if invalid, or null if OK.
   */
  validateCredentials?(credentials: Record<string, string>): string | null;

  /**
   * Optional: fetch dashboard overview data for the courier page.
   * Different providers have different API endpoints for status summaries
   * and recent activity, so this is provider-specific.
   */
  fetchDashboard?(credentials: Record<string, string>): Promise<CourierDashboardData>;
}

// ─── Registry ────────────────────────────────────────────────────────

const providers = new Map<string, CourierProvider>();

/** Register a courier provider. Called once at module import time. */
export function registerProvider(provider: CourierProvider): void {
  if (providers.has(provider.id)) {
    console.warn(`[CourierRegistry] Provider "${provider.id}" is already registered. Skipping.`);
    return;
  }
  providers.set(provider.id, provider);
}

/** Get a provider by its ID. */
export function getProvider(id: string): CourierProvider | undefined {
  return providers.get(id);
}

/** Get all registered providers. */
export function getAllProviders(): CourierProvider[] {
  return Array.from(providers.values());
}

/** Get provider option entries for the settings dropdown. */
export function getProviderOptions(): { value: string; label: string }[] {
  const options = Array.from(providers.values()).map((p) => ({
    value: p.id,
    label: p.label,
  }));
  return [{ value: "none", label: "None — No courier integration" }, ...options];
}

/** Build the SETTINGS_KEYS map for the selected provider. */
export function getProviderSettingsKeys(providerId: string): Record<string, string> | null {
  const provider = providers.get(providerId);
  return provider?.settingsKeys ?? null;
}

/** Extract credentials for a provider from a full settings map. */
export function extractCredentials(
  providerId: string,
  settingsMap: Record<string, string>,
): Record<string, string> {
  const provider = providers.get(providerId);
  if (!provider) return {};

  const credentials: Record<string, string> = {};
  for (const [field, key] of Object.entries(provider.settingsKeys)) {
    credentials[field] = settingsMap[key] ?? "";
  }
  return credentials;
}

/** Get the shared setting keys used by the courier system (non-provider-specific). */
export const SHARED_SETTINGS_KEYS = {
  selected_courier: "courier_selected_provider",
  location_states: "courier_location_states",
  location_cities: "courier_location_cities",
  location_synced_at: "courier_location_synced_at",
} as const;
