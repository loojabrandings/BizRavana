import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CourierStatusBreakdown } from "@/lib/delivery/types";

interface CourierStoreState {
  /** Standardised status breakdown (e.g. "Rescheduled", "To Be Delivered", "To Be Returned"). */
  statusBreakdown: CourierStatusBreakdown[];
  /** Total shipments dispatched to courier minus terminal statuses (delivered/cancelled/returned). */
  toBeDelivered: number;
  /** ISO timestamp of when the breakdown was last written. */
  lastUpdated: string | null;

  /** Write a fresh breakdown + toBeDelivered count from the courier page. */
  setBreakdown: (breakdown: CourierStatusBreakdown[], toBeDelivered: number) => void;
  /** Clear the cached data (e.g. on logout or provider change). */
  clear: () => void;
}

/**
 * Persisted (localStorage) cache for the courier page's status breakdown.
 *
 * Survives page refreshes so the main dashboard can read courier counts
 * without re-querying the deliveries table or calling the courier API.
 *
 * The courier page skips API syncs when `lastUpdated` is within `CACHE_TTL_MS`
 * (30 s), so stale data auto-expires on the next courier-page visit.
 *
 * Because it IS persisted, a page refresh does NOT clear the store.
 * `clear()` must be called explicitly (e.g. on logout or provider change).
 */
export const useCourierStore = create<CourierStoreState>()(
  persist(
    (set) => ({
      statusBreakdown: [],
      toBeDelivered: 0,
      lastUpdated: null,

      setBreakdown: (breakdown, toBeDelivered) =>
        set({
          statusBreakdown: breakdown,
          toBeDelivered,
          lastUpdated: new Date().toISOString(),
        }),

      clear: () =>
        set({ statusBreakdown: [], toBeDelivered: 0, lastUpdated: null }),
    }),
    {
      name: "freebuff-courier-store",
      // Only persist the data fields — the actions are re-hydrated.
      partialize: (state) => ({
        statusBreakdown: state.statusBreakdown,
        toBeDelivered: state.toBeDelivered,
        lastUpdated: state.lastUpdated,
      }),
    },
  ),
);
