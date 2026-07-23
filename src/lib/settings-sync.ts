/**
 * Settings Sync — Persist operational settings to Supabase `business_settings` table.
 *
 * Stores each store's full state as a single JSONB value under a well‑known key:
 *   "orders_settings"     → useOrdersSettings
 *   "quotation_settings"  → useQuotationSettings
 *   "expense_settings"    → useExpenseSettings
 *   "preferences"         → usePreferences
 *
 * On app mount, call `hydrateStoresFromServer(businessId)` to merge server
 * values into the Zustand stores (server wins over localStorage).
 *
 * Subscribe to store changes and auto‑save to Supabase with a 1‑second debounce.
 */

import { type SupabaseClient } from "@supabase/supabase-js";
import { useOrdersSettings } from "@/stores/orders-settings-store";
import { useQuotationSettings } from "@/stores/quotation-settings-store";
import { useExpenseSettings } from "@/stores/expense-settings-store";
import { usePreferences } from "@/stores/preferences-store";

// ─── Well‑known keys ──────────────────────────────────────────────

const KEYS = {
  ORDERS: "orders_settings",
  QUOTATIONS: "quotation_settings",
  EXPENSES: "expense_settings",
  PREFERENCES: "preferences",
} as const;

// ─── Type helpers ─────────────────────────────────────────────────

/** Extract the state shape (data fields only, no action methods) from a Zustand store. */
type StoreState<T> = T extends { (): infer S; getState: () => infer S } ? S : never;

type OrdersState = StoreState<typeof useOrdersSettings>;
type QuotationState = StoreState<typeof useQuotationSettings>;
type ExpenseState = StoreState<typeof useExpenseSettings>;
type PreferencesState = StoreState<typeof usePreferences>;

// ─── Load from server ─────────────────────────────────────────────

async function loadSettings(supabase: SupabaseClient, businessId: string) {
  const { data, error } = await supabase
    .from("business_settings")
    .select("key, value")
    .eq("business_id", businessId)
    .in("key", Object.values(KEYS));

  if (error) {
    console.error("[settings-sync] Failed to load settings:", error.message);
    return {};
  }

  const result: Record<string, Record<string, unknown>> = {};
  for (const row of data ?? []) {
    if (typeof row.value === "object" && row.value !== null && !Array.isArray(row.value)) {
      result[row.key] = row.value as Record<string, unknown>;
    }
  }
  return result;
}

/**
 * Hydrate all four Zustand stores with values from Supabase.
 * Only fields that exist in the server payload are overwritten.
 * Call this once on app mount after the business ID is known.
 */
export async function hydrateStoresFromServer(
  supabase: SupabaseClient,
  businessId: string,
): Promise<void> {
  const server = await loadSettings(supabase, businessId);

  // ── Orders ──
  const ordersData = server[KEYS.ORDERS];
  if (ordersData && typeof ordersData === "object") {
    const setPartial: Partial<OrdersState> = {};
    const current = useOrdersSettings.getState();
    for (const key of Object.keys(ordersData) as (keyof OrdersState)[]) {
      if (key in current && typeof (current as any)[key] !== "function") {
        (setPartial as any)[key] = ordersData[key];
      }
    }
    if (Object.keys(setPartial).length > 0) {
      useOrdersSettings.setState(setPartial);
    }
  }

  // ── Quotations ──
  const quotationData = server[KEYS.QUOTATIONS];
  if (quotationData && typeof quotationData === "object") {
    const setPartial: Partial<QuotationState> = {};
    const current = useQuotationSettings.getState();
    for (const key of Object.keys(quotationData) as (keyof QuotationState)[]) {
      if (key in current && typeof (current as any)[key] !== "function") {
        (setPartial as any)[key] = quotationData[key];
      }
    }
    if (Object.keys(setPartial).length > 0) {
      useQuotationSettings.setState(setPartial);
    }
  }

  // ── Expenses ──
  const expenseData = server[KEYS.EXPENSES];
  if (expenseData && typeof expenseData === "object") {
    const setPartial: Partial<ExpenseState> = {};
    const current = useExpenseSettings.getState();
    for (const key of Object.keys(expenseData) as (keyof ExpenseState)[]) {
      if (key in current && typeof (current as any)[key] !== "function") {
        (setPartial as any)[key] = expenseData[key];
      }
    }
    if (Object.keys(setPartial).length > 0) {
      useExpenseSettings.setState(setPartial);
    }
  }

  // ── Preferences ──
  const prefsData = server[KEYS.PREFERENCES];
  if (prefsData && typeof prefsData === "object") {
    const setPartial: Partial<PreferencesState> = {};
    const current = usePreferences.getState();
    for (const key of Object.keys(prefsData) as (keyof PreferencesState)[]) {
      if (key in current && typeof (current as any)[key] !== "function") {
        (setPartial as any)[key] = prefsData[key];
      }
    }
    if (Object.keys(setPartial).length > 0) {
      usePreferences.setState(setPartial);
    }
  }
}

// ─── Save to server ───────────────────────────────────────────────

async function saveSettings(
  supabase: SupabaseClient,
  businessId: string,
  key: string,
  value: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase.from("business_settings").upsert(
    { business_id: businessId, key, value },
    { onConflict: "business_id, key" },
  );
  if (error) {
    console.error(`[settings-sync] Failed to save "${key}":`, error.message);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────

/** Filter out function properties from a Zustand store state, keeping only data. */
function stripFunctions<T extends Record<string, unknown>>(state: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(state).filter(([_, v]) => typeof v !== "function"),
  );
}

// ─── Debounced auto‑sync ──────────────────────────────────────────

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

function debouncedSave(
  supabase: SupabaseClient,
  businessId: string,
  key: string,
  value: Record<string, unknown>,
  delayMs = 1000,
) {
  const existing = debounceTimers.get(key);
  if (existing) clearTimeout(existing);

  debounceTimers.set(
    key,
    setTimeout(() => {
      debounceTimers.delete(key);
      saveSettings(supabase, businessId, key, value);
    }, delayMs),
  );
}

/**
 * Subscribe to Zustand store changes and auto‑save to Supabase.
 * Returns an unsubscribe function to call on cleanup.
 */
export function setupAutoSync(
  supabase: SupabaseClient,
  businessId: string,
): () => void {
  const unsubs: (() => void)[] = [];

  // ── Orders ──
  const unsubOrders = useOrdersSettings.subscribe((state) => {
    debouncedSave(supabase, businessId, KEYS.ORDERS, stripFunctions(state as unknown as Record<string, unknown>));
  });
  unsubs.push(unsubOrders);

  // ── Quotations ──
  const unsubQuotations = useQuotationSettings.subscribe((state) => {
    debouncedSave(supabase, businessId, KEYS.QUOTATIONS, stripFunctions(state as unknown as Record<string, unknown>));
  });
  unsubs.push(unsubQuotations);

  // ── Expenses ──
  const unsubExpenses = useExpenseSettings.subscribe((state) => {
    debouncedSave(supabase, businessId, KEYS.EXPENSES, stripFunctions(state as unknown as Record<string, unknown>));
  });
  unsubs.push(unsubExpenses);

  // ── Preferences ──
  const unsubPreferences = usePreferences.subscribe((state) => {
    debouncedSave(supabase, businessId, KEYS.PREFERENCES, stripFunctions(state as unknown as Record<string, unknown>));
  });
  unsubs.push(unsubPreferences);

  // Also do an initial push so the server gets the current localStorage values
  // (important for brand‑new users who have never synced)
  pushCurrentState(supabase, businessId);

  return () => {
    for (const unsub of unsubs) unsub();
    for (const [key, timer] of debounceTimers) {
      clearTimeout(timer);
      debounceTimers.delete(key);
    }
  };
}

/**
 * Push the current in‑memory state of all four stores to Supabase.
 * Useful on initial mount so a new user's settings are available cross‑device.
 */
async function pushCurrentState(
  supabase: SupabaseClient,
  businessId: string,
): Promise<void> {
  await Promise.all([
    saveSettings(supabase, businessId, KEYS.ORDERS, stripFunctions(useOrdersSettings.getState() as unknown as Record<string, unknown>)),
    saveSettings(supabase, businessId, KEYS.QUOTATIONS, stripFunctions(useQuotationSettings.getState() as unknown as Record<string, unknown>)),
    saveSettings(supabase, businessId, KEYS.EXPENSES, stripFunctions(useExpenseSettings.getState() as unknown as Record<string, unknown>)),
    saveSettings(supabase, businessId, KEYS.PREFERENCES, stripFunctions(usePreferences.getState() as unknown as Record<string, unknown>)),
  ]);
}
