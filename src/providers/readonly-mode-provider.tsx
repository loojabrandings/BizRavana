"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════

export interface ReadOnlyState {
  /** True when account is trial_expired or expired */
  isReadOnly: boolean;
  /** The raw account_status from the businesses table */
  accountStatus: string | null;
  /** Date after which data will be permanently deleted (ISO string) */
  dataDeleteAfter: string | null;
  /** Days until data retention expires (null if not set) */
  retentionDaysRemaining: number | null;
  /** Whether the status is still loading */
  isLoading: boolean;
  /**
   * Guard function to call before any create/edit/delete operation.
   * Returns `true` if the action is BLOCKED (read-only), `false` if allowed.
   * Shows a toast explaining why when blocked.
   */
  guard: (action?: string) => boolean;
}

// ══════════════════════════════════════════════════════════════════
// CONTEXT
// ══════════════════════════════════════════════════════════════════

const ReadOnlyContext = createContext<ReadOnlyState | null>(null);

// ══════════════════════════════════════════════════════════════════
// PROVIDER
// ══════════════════════════════════════════════════════════════════

export function ReadOnlyModeProvider({ children }: { children: React.ReactNode }) {
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [accountStatus, setAccountStatus] = useState<string | null>(null);
  const [dataDeleteAfter, setDataDeleteAfter] = useState<string | null>(null);
  const [retentionDaysRemaining, setRetentionDaysRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("business_id")
          .eq("user_id", session.user.id)
          .single();

        const bizId = (profile as { business_id: string | null } | null)?.business_id;
        if (!bizId) {
          setIsLoading(false);
          return;
        }

        const { data: business } = await supabase
          .from("businesses")
          .select("account_status, data_delete_after")
          .eq("id", bizId)
          .single();

        if (business) {
          const status = String(business.account_status || "");
          setAccountStatus(status);
          setDataDeleteAfter(business.data_delete_after);
          const readOnly = status === "trial_expired" || status === "expired";
          setIsReadOnly(readOnly);

          if (business.data_delete_after) {
            const diff = new Date(business.data_delete_after).getTime() - Date.now();
            setRetentionDaysRemaining(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))));
          }
        }
      } catch (err) {
        console.error("Failed to fetch business status:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const guard = useCallback(
    (action?: string): boolean => {
      // If still loading, block until we know the status
      if (isLoading) {
        toast.info("Verifying account...", {
          description: "Please wait a moment while we confirm your account status.",
          duration: 3000,
        });
        return true;
      }

      if (!isReadOnly) return false;

      const label = action || "This action";
      toast.error("Read-only mode", {
        description:
          accountStatus === "trial_expired"
            ? `${label} is not available. Your trial has expired — upgrade your plan to continue using BizRavana.`
            : `${label} is not available. Your subscription has expired — renew to regain full access.`,
        duration: 5000,
      });
      return true;
    },
    [isLoading, isReadOnly, accountStatus],
  );

  const value: ReadOnlyState = {
    isReadOnly,
    accountStatus,
    dataDeleteAfter,
    retentionDaysRemaining,
    isLoading,
    guard,
  };

  return (
    <ReadOnlyContext.Provider value={value}>
      {children}
    </ReadOnlyContext.Provider>
  );
}

// ══════════════════════════════════════════════════════════════════
// HOOK
// ══════════════════════════════════════════════════════════════════

/**
 * Hook that provides read-only mode enforcement across the dashboard.
 * Must be used inside a `<ReadOnlyModeProvider>`.
 *
 * Usage:
 * ```tsx
 * const { isReadOnly, guard } = useReadOnlyMode();
 *
 * const handleCreate = () => {
 *   if (guard("create")) return;
 *   // proceed with creation...
 * };
 * ```
 */
export function useReadOnlyMode(): ReadOnlyState {
  const ctx = useContext(ReadOnlyContext);
  if (!ctx) {
    throw new Error("useReadOnlyMode must be used within a ReadOnlyModeProvider");
  }
  return ctx;
}
