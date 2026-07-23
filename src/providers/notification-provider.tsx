"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════

export interface NotificationItem {
  id: string;
  title: string;
  message: string | null;
  category: string;
  priority: string;
  source: string;
  is_read: boolean;
  action_label: string | null;
  action_url: string | null;
  created_at: string;
}

export interface NotificationState {
  /** List of notifications (most recent first, max 50) */
  notifications: NotificationItem[];
  /** Count of unread notifications */
  unreadCount: number;
  /** Whether the initial fetch is still loading */
  loading: boolean;
  /** Mark a single notification as read */
  markAsRead: (id: string) => Promise<void>;
  /** Mark all notifications as read for this business */
  markAllAsRead: () => Promise<void>;
  /** Force a full refetch from the server */
  refetch: () => Promise<void>;
}

// ══════════════════════════════════════════════════════════════════
// CONTEXT
// ══════════════════════════════════════════════════════════════════

const NotificationContext = createContext<NotificationState | null>(null);

// ══════════════════════════════════════════════════════════════════
// PROVIDER
// ══════════════════════════════════════════════════════════════════

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Refs for cleanup and dedup
  const businessIdRef = useRef<string | null>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  // ── Fetch helper ───────────────────────────────────────────
  const fetchNotifications = useCallback(async (bizId: string) => {
    const supabase = supabaseRef.current;
    if (!supabase) return;

    try {
      // Fetch unread count
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("business_id", bizId)
        .eq("is_read", false);

      // Fetch recent notifications
      const { data } = await supabase
        .from("notifications")
        .select("id, title, message, category, priority, source, is_read, action_label, action_url, created_at")
        .eq("business_id", bizId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (count !== null) setUnreadCount(count);
      if (data) setNotifications(data as NotificationItem[]);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Realtime subscription ──────────────────────────────────
  const subscribeToRealtime = useCallback(
    (bizId: string) => {
      const supabase = supabaseRef.current;
      if (!supabase) return;

      // Clean up any existing subscription
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channel = supabase
        .channel(`notifications:${bizId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `business_id=eq.${bizId}`,
          },
          (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
            const newNotif = payload.new as unknown as NotificationItem;
            if (!newNotif?.id) return;

            setNotifications((prev) => {
              // Dedup: skip if already in list
              if (prev.some((n) => n.id === newNotif.id)) return prev;
              return [newNotif, ...prev].slice(0, 50);
            });
            if (!newNotif.is_read) {
              setUnreadCount((prev) => prev + 1);
            }
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `business_id=eq.${bizId}`,
          },
          (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
            const updated = payload.new as unknown as NotificationItem;
            if (!updated?.id) return;

            setNotifications((prev) =>
              prev.map((n) =>
                n.id === updated.id
                  ? { ...n, is_read: updated.is_read, title: updated.title, message: updated.message }
                  : n,
              ),
            );
            // Note: unreadCount is NOT decremented here because the optimistic
            // update in markAsRead/markAllAsRead already handles it.
            // The Realtime UPDATE handler only syncs the notification list.
          },
        )
        .subscribe((status) => {
          if (status !== "SUBSCRIBED") {
            console.debug("Realtime notification channel status:", status);
          }
        });

      channelRef.current = channel;
    },
    [],
  );

  // ── Initialize: auth session → fetch → subscribe ──────────
  useEffect(() => {
    const supabase = createClient();
    supabaseRef.current = supabase;

    let mounted = true;

    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user || !mounted) {
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("business_id")
          .eq("user_id", session.user.id)
          .single();

        const bizId = (profile as { business_id: string | null } | null)
          ?.business_id;

        if (!bizId) {
          setLoading(false);
          return;
        }

        businessIdRef.current = bizId;

        // Initial fetch
        await fetchNotifications(bizId);

        // Subscribe to realtime
        subscribeToRealtime(bizId);
      } catch {
        setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
      // Cleanup: remove the Realtime channel
      if (channelRef.current && supabaseRef.current) {
        supabaseRef.current.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchNotifications, subscribeToRealtime]);

  // ── Refetch on window focus (fallback for stale data) ─────
  useEffect(() => {
    const handleFocus = () => {
      const bizId = businessIdRef.current;
      if (bizId) {
        fetchNotifications(bizId);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchNotifications]);

  // ── Mark as Read ──────────────────────────────────────────
  const markAsRead = useCallback(async (notifId: string) => {
    const supabase = supabaseRef.current;
    if (!supabase) return;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    // Server update (realtime will handle sync)
    await supabase.from("notifications").update({ is_read: true }).eq("id", notifId);
  }, []);

  // ── Mark All as Read ──────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    const bizId = businessIdRef.current;
    const supabase = supabaseRef.current;
    if (!bizId || !supabase) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    // Server update
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("business_id", bizId)
      .eq("is_read", false);
  }, []);

  // ── Full refetch ──────────────────────────────────────────
  const refetch = useCallback(async () => {
    const bizId = businessIdRef.current;
    if (bizId) {
      await fetchNotifications(bizId);
    }
  }, [fetchNotifications]);

  const value: NotificationState = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// ══════════════════════════════════════════════════════════════════
// HOOK
// ══════════════════════════════════════════════════════════════════

/**
 * Hook that provides the shared notification state.
 * Must be used inside a `<NotificationProvider>`.
 *
 * Usage:
 * ```tsx
 * const { notifications, unreadCount, markAsRead } = useNotifications();
 * ```
 */
export function useNotifications(): NotificationState {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return ctx;
}
