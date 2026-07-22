"use client";

import { useSyncExternalStore } from "react";

function getOnlineStatus(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

function subscribeToOnlineStatus(onChange: () => void): () => void {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/**
 * Tracks the browser's online/offline status using native events.
 *
 * Returns `isOnline` — `true` when connected, `false` when offline.
 *
 * Uses `useSyncExternalStore` for efficient, tear-free subscriptions
 * without polling the server.
 */
export function useNetworkStatus(): { isOnline: boolean } {
  const isOnline = useSyncExternalStore(
    subscribeToOnlineStatus,
    getOnlineStatus,
    () => true,
  );

  return { isOnline };
}
