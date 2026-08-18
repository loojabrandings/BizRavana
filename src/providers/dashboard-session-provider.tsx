"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { UserRole } from "@/hooks/use-user-role";

export interface DashboardSession {
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  businessId: string;
  businessName: string;
  role: UserRole | null;
  accountStatus: string | null;
  dataDeleteAfter: string | null;
}

const DashboardSessionContext = createContext<DashboardSession | null>(null);

export function DashboardSessionProvider({
  session,
  children,
}: {
  session: DashboardSession;
  children: ReactNode;
}) {
  return (
    <DashboardSessionContext.Provider value={session}>
      {children}
    </DashboardSessionContext.Provider>
  );
}

export function useDashboardSession(): DashboardSession {
  const context = useContext(DashboardSessionContext);
  if (!context) {
    throw new Error(
      "useDashboardSession must be used within a DashboardSessionProvider",
    );
  }
  return context;
}
