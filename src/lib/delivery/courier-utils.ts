// ─── Courier Utils — Provider-Aware Dispatch Layer ───────────────────
//
// This module is the public API for courier operations. It delegates
// to registered providers via the provider registry. To add a new courier,
// create a provider module in ./providers/ and register it there.
//
// All types are re-exported from ./types.ts for backward compatibility.
// ──────────────────────────────────────────────────────────────────────

// Import providers so they auto-register
import "./providers/index";

import { createClient } from "@/lib/supabase/client";
import {
  getProvider,
  extractCredentials,
  getAllProviders,
  SHARED_SETTINGS_KEYS,
} from "@/lib/delivery/provider-registry";
import type {
  CourierConfig,
  CourierLocations,
  TrackingEvent,
  OrderFinanceInfo,
  ShipOrderParams,
  ShipOrderResult,
} from "@/lib/delivery/types";

// ─── Re-export types for backward compatibility ──────────────────────

export type {
  CourierState,
  CourierCity,
  CourierConfig,
  CourierLocations,
  TrackingEvent,
  OrderFinanceInfo,
} from "@/lib/delivery/types";

// ─── Provider Discovery ──────────────────────────────────────────────

export { getAllProviders } from "@/lib/delivery/provider-registry";

// ─── Config Loader ───────────────────────────────────────────────────

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

    const providerId = map[SHARED_SETTINGS_KEYS.selected_courier] || null;
    if (!providerId || providerId === "none") {
      return { provider: null, providerLabel: null, credentials: {} };
    }

    const provider = getProvider(providerId);
    const credentials = provider
      ? extractCredentials(providerId, map)
      : {};

    return {
      provider: providerId,
      providerLabel: provider?.label || providerId,
      credentials,
    };
  } catch (err) {
    console.error("Failed to load courier config:", err);
    return null;
  }
}

// ─── Dispatch ────────────────────────────────────────────────────────

/**
 * Send an order to the courier service. Returns the waybill number.
 * Delegates to the registered provider matching `config.provider`.
 */
export async function shipWithCourier(
  order: ShipOrderParams,
  config: CourierConfig,
): Promise<ShipOrderResult> {
  const provider = getProvider(config.provider ?? "");
  if (!provider) {
    throw new Error(`Unknown courier provider: ${config.provider}`);
  }
  return provider.ship(order, config.credentials);
}

// ─── Tracking ────────────────────────────────────────────────────────

/**
 * Fetch tracking history for a waybill number from the specified provider.
 *
 * @param waybillNumber - The waybill/tracking number
 * @param credentials - Provider credentials (from loadCourierConfig)
 * @param providerId - Provider ID (e.g. "royal_express")
 */
export async function trackShipment(
  waybillNumber: string,
  credentials: Record<string, string>,
  providerId: string,
): Promise<TrackingEvent[]> {
  const provider = getProvider(providerId);
  if (!provider) {
    throw new Error(`Unknown courier provider: ${providerId}`);
  }
  return provider.track(waybillNumber, credentials);
}

/**
 * Fetch financial info for a waybill from the specified provider.
 *
 * @param waybillNumber - The waybill/tracking number
 * @param credentials - Provider credentials (from loadCourierConfig)
 * @param providerId - Provider ID (e.g. "royal_express")
 */
export async function fetchOrderFinance(
  waybillNumber: string,
  credentials: Record<string, string>,
  providerId: string,
): Promise<OrderFinanceInfo> {
  const provider = getProvider(providerId);
  if (!provider) {
    throw new Error(`Unknown courier provider: ${providerId}`);
  }
  return provider.fetchFinance(waybillNumber, credentials);
}

// ─── Location Sync ───────────────────────────────────────────────────

/**
 * Sync location data from the specified courier provider.
 *
 * @param businessId - Business ID
 * @param credentials - Provider credentials
 * @param providerId - Provider ID (e.g. "royal_express")
 */
export async function syncCourierLocations(
  businessId: string,
  credentials: Record<string, string>,
  providerId: string,
): Promise<CourierLocations> {
  const provider = getProvider(providerId);
  if (!provider) {
    throw new Error(`Unknown courier provider: ${providerId}`);
  }
  return provider.syncLocations(businessId, credentials);
}

// ─── Delivery Status Sync ───────────────────────────────────────────

/**
 * Map a courier API status name to the internal deliveries.status value.
 * Uses keyword matching so it works generically across providers.
 *
 * NOTE: When a provider supplies its own `mapStatus`, that is used instead.
 * This function is the shared fallback for providers that don't implement it.
 */
function mapApiStatusToDeliveryStatus(apiStatus: string): string | null {
  const s = apiStatus.toLowerCase();
  // fail check must come BEFORE deliver — "FAILED TO DELIVER" contains both words
  if (s.includes("fail")) return "returned";
  if (s.includes("deliver")) return "delivered";
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("return")) return "returned";
  if (s.includes("reschedule")) return "to_dispatch";
  if (s.includes("rider") || s.includes("assign")) return "assigned_to_rider";
  if (s.includes("confirm") || s.includes("draft") || s.includes("pending")) return "confirmed";
  if (
    s.includes("pick") ||
    s.includes("branch") ||
    s.includes("warehouse") ||
    s.includes("transit") ||
    s.includes("dispatch") ||
    s.includes("collected")
  ) {
    return "in_branch";
  }
  return null; // no mapping — keep existing status
}

/**
 * Map a status using the provider's own logic, falling back to the shared
 * keyword-based mapper if the provider doesn't implement mapStatus.
 */
function mapStatusWithProviderFallback(
  apiStatus: string,
  providerId: string,
): string | null {
  const provider = getProvider(providerId);
  if (provider?.mapStatus) {
    return provider.mapStatus(apiStatus);
  }
  return mapApiStatusToDeliveryStatus(apiStatus);
}

/**
 * Fetch the latest tracking status for all active deliveries from the courier API
 * and update the local deliveries table with the latest status.
 *
 * Also discovers orders that have waybill IDs but no delivery record yet,
 * creates delivery records for them so they appear on the courier dashboard.
 *
 * @returns Summary of how many deliveries were updated, failed, or had no change.
 */
export async function syncDeliveryStatuses(
  businessId: string,
  credentials: Record<string, string>,
  providerId: string,
): Promise<{ updated: number; failed: number; unchanged: number }> {
  const supabase = createClient();
  const provider = getProvider(providerId);
  if (!provider) return { updated: 0, failed: 0, unchanged: 0 };

  // ── 1. Get existing deliveries with waybills ────────────────
  const { data: deliveries, error: fetchError } = await supabase
    .from("deliveries")
    .select("id, waybill_id, status, order_id")
    .eq("business_id", businessId)
    .eq("courier", providerId)
    .not("waybill_id", "is", null);

  if (fetchError) {
    console.error("Failed to fetch deliveries for sync:", fetchError);
    return { updated: 0, failed: 0, unchanged: 0 };
  }

  // ── 2. Discover orders with waybills that aren't in deliveries yet ──
  const existingOrderIds = new Set((deliveries || []).map((d) => d.order_id).filter(Boolean));

  // Only discover orders that were dispatched through THIS courier provider.
  // Orders without courier_provider set (pre-migration) are skipped to avoid
  // incorrectly assigning them to a different provider.
  const { data: ordersWithWaybills } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, waybill_id, delivery_charge, created_at")
    .eq("business_id", businessId)
    .eq("courier_provider", providerId)
    .not("waybill_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);

  // Create delivery records for orders that don't have one yet
  if (ordersWithWaybills && ordersWithWaybills.length > 0) {
    const ordersToCreate: {
      business_id: string;
      order_id: string;
      waybill_id: string;
      courier: string;
      courier_charge: number;
      status: string;
    }[] = [];

    for (const order of ordersWithWaybills) {
      if (!order.waybill_id) continue;
      // Skip if this order already has a delivery record
      if (existingOrderIds.has(order.id)) continue;

      ordersToCreate.push({
        business_id: businessId,
        order_id: order.id,
        waybill_id: order.waybill_id,
        courier: providerId,
        courier_charge: order.delivery_charge ?? 0,
        status: "confirmed",
      });
    }

    if (ordersToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from("deliveries")
        .insert(ordersToCreate);

      if (insertError) {
        console.error("Failed to create delivery records:", insertError);
      }
    }
  }

  // ── 3. Re-fetch deliveries to include newly created ones ────
  const { data: allDeliveries } = await supabase
    .from("deliveries")
    .select("id, waybill_id, status, order_id")
    .eq("business_id", businessId)
    .eq("courier", providerId)
    .not("waybill_id", "is", null);

  if (!allDeliveries || allDeliveries.length === 0) {
    return { updated: 0, failed: 0, unchanged: 0 };
  }

  // ── 4. Track each waybill ───────────────────────────────────
  let updated = 0;
  let failed = 0;
  let unchanged = 0;

  for (const delivery of allDeliveries) {
    if (!delivery.waybill_id) continue;

    try {
      const events = await provider.track(delivery.waybill_id, credentials);
      if (events.length === 0) {
        unchanged++;
        continue;
      }

      // First event is the most recent status
      const latestApiStatus = events[0].status;
      // Use provider-level mapping if available; fall back to generic keyword matching
      const mappedStatus = mapStatusWithProviderFallback(latestApiStatus, providerId);

      if (mappedStatus && mappedStatus !== delivery.status) {
        await supabase
          .from("deliveries")
          .update({ status: mappedStatus, updated_at: new Date().toISOString() })
          .eq("id", delivery.id);
        updated++;

        // ── Auto-update linked order status when delivered ──
        if (mappedStatus === "delivered" && delivery.order_id) {
          const { error: orderUpdateError } = await supabase
            .from("orders")
            .update({
              status: "delivered",
              updated_at: new Date().toISOString(),
            })
            .eq("id", delivery.order_id)
            .neq("status", "delivered");

          if (orderUpdateError) {
            console.error(
              `Failed to auto-update order ${delivery.order_id} status to delivered:`,
              orderUpdateError,
            );
          } else {
            console.log(
              `Auto-updated order ${delivery.order_id} status to delivered`,
            );
          }
        }
      } else {
        unchanged++;
      }
    } catch (err) {
      console.error(`Failed to track waybill ${delivery.waybill_id}:`, err);
      failed++;
    }
  }

  // ── 5. Clean up legacy raw API statuses ─────────────────────
  // Deliveries may have old raw status values (e.g. "rescheduled", "assigned")
  // stored from earlier code versions before the mapApiStatusToDeliveryStatus
  // mapping existed, or from code paths that didn't go through the mapper.
  // Normalize them to the expected internal status set so the dashboard
  // correctly groups them under the right cards.
  const validStatuses = [
    "confirmed",
    "in_branch",
    "assigned_to_rider",
    "to_dispatch",
    "delivered",
    "returned",
    "cancelled",
  ] as const;

  const { data: legacyDeliveries } = await supabase
    .from("deliveries")
    .select("id, status")
    .eq("business_id", businessId)
    .eq("courier", providerId)
    .not("status", "in", `(${validStatuses.map((s) => `'${s}'`).join(",")})`);

  if (legacyDeliveries && legacyDeliveries.length > 0) {
    for (const ld of legacyDeliveries) {
      const mapped = mapStatusWithProviderFallback(ld.status, providerId);
      if (mapped && mapped !== ld.status) {
        await supabase
          .from("deliveries")
          .update({ status: mapped, updated_at: new Date().toISOString() })
          .eq("id", ld.id);
        console.log(`Normalized delivery ${ld.id}: ${ld.status} → ${mapped}`);
      }
    }
  }

  return { updated, failed, unchanged };
}

// ─── Cached Locations ────────────────────────────────────────────────

/**
 * Load cached locations from business_settings.
 * This is provider-agnostic — same cache is used regardless of provider.
 */
export async function loadCachedLocations(
  businessId: string,
): Promise<CourierLocations | null> {
  try {
    const supabase = createClient();
    const { data: settings } = await supabase
      .from("business_settings")
      .select("key, value")
      .eq("business_id", businessId)
      .in("key", [
        SHARED_SETTINGS_KEYS.location_states,
        SHARED_SETTINGS_KEYS.location_cities,
        SHARED_SETTINGS_KEYS.location_synced_at,
      ]);

    if (!settings) return null;

    const map: Record<string, string> = {};
    settings.forEach((s) => { map[s.key] = String(s.value); });

    const statesJson = map[SHARED_SETTINGS_KEYS.location_states];
    const citiesJson = map[SHARED_SETTINGS_KEYS.location_cities];

    if (!statesJson || !citiesJson) return null;

    return {
      states: JSON.parse(statesJson),
      cities: JSON.parse(citiesJson),
      syncedAt: map[SHARED_SETTINGS_KEYS.location_synced_at] || null,
    };
  } catch (err) {
    console.error("Failed to load cached locations:", err);
    return null;
  }
}
