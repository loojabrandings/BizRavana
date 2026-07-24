"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type UserRole = "owner" | "admin" | "member";

export interface UserRoleState {
  role: UserRole | null;
  isLoading: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
  canManage: boolean;
  canAccessBilling: boolean;
  isOwnerOnly: boolean;
}

const UserRoleContext = createContext<UserRoleState | null>(null);

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setIsLoading(false);
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();
        if (profile) {
          setRole(profile.role);
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    };
    fetchRole();
  }, []);

  const value: UserRoleState = {
    role,
    isLoading,
    isOwner: role === "owner",
    isAdmin: role === "admin",
    isMember: role === "member",
    canManage: role === "owner" || role === "admin",
    canAccessBilling: role === "owner",
    isOwnerOnly: role === "owner",
  };

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  );
}

/**
 * Returns the current user's role within their business.
 * Must be used inside a UserRoleProvider.
 */
export function useUserRole(): UserRoleState {
  const ctx = useContext(UserRoleContext);
  if (!ctx) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return ctx;
}
