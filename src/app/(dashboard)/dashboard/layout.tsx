import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/auth-routing";
import {
  DashboardSessionProvider,
  type DashboardSession,
} from "@/providers/dashboard-session-provider";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  if (isSuperAdmin(user)) {
    redirect("/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, business_id, role, businesses(id, name, account_status, data_delete_after)")
    .eq("user_id", user.id)
    .single();

  const businessRaw = profile?.businesses;
  const business = Array.isArray(businessRaw) ? businessRaw[0] : businessRaw;

  const session: DashboardSession = {
    userId: user.id,
    email: user.email || "",
    fullName: profile?.full_name || "User",
    avatarUrl: profile?.avatar_url || null,
    businessId: profile?.business_id || business?.id || "",
    businessName: business?.name || "",
    role: profile?.role || null,
    accountStatus: business?.account_status || null,
    dataDeleteAfter: business?.data_delete_after || null,
  };

  return (
    <DashboardSessionProvider session={session}>
      <DashboardLayout>{children}</DashboardLayout>
    </DashboardSessionProvider>
  );
}
