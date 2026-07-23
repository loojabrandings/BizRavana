"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Banknote,
  Building2,
  Clock,
  CreditCard,
  Crown,
  DollarSign,
  HardDrive,
  Loader2,
  TrendingUp,
  TriangleAlert,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════

interface DashboardStats {
  totalBusinesses: number;
  newThisMonth: number;
  activeSubscriptions: number;
  trialAccounts: number;
  pendingPayments: number;
  expiredAccounts: number;
  monthlyRevenue: number;
  scheduledDeletions: number;
}

// ══════════════════════════════════════════════════════════════════
// STAT CARD
// ══════════════════════════════════════════════════════════════════

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent,
}: {
  label: string;
  value: string | number;
  icon: typeof Building2;
  trend?: { value: string; positive: boolean };
  accent: "primary" | "warning" | "destructive" | "success" | "info";
}) {
  const accentStyles = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
    success: "bg-success/10 text-success",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground/80">
          {label}
        </CardTitle>
        <div className={cn("flex size-8 items-center justify-center rounded-lg", accentStyles[accent])}>
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        {trend && (
          <p className={cn(
            "mt-1 flex items-center gap-1 text-xs",
            trend.positive ? "text-success" : "text-destructive",
          )}>
            <TrendingUp className={cn("size-3", !trend.positive && "rotate-180")} />
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ══════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD PAGE
// ══════════════════════════════════════════════════════════════════

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Calculate the start of the current month
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Run all queries in parallel
      const [
        { count: total },
        { count: newThisMonth },
        { count: active },
        { count: trial },
        { count: pending },
        { count: expired },
        { count: scheduledDeletions },
        pendingPayments,
      ] = await Promise.all([
        supabase.from("businesses").select("*", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("businesses").select("*", { count: "exact", head: true }).is("deleted_at", null).gte("created_at", monthStart),
        supabase.from("businesses").select("*", { count: "exact", head: true }).eq("account_status", "active").is("deleted_at", null),
        supabase.from("businesses").select("*", { count: "exact", head: true }).eq("account_status", "trial").is("deleted_at", null),
        supabase.from("payment_proofs").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("businesses").select("*", { count: "exact", head: true }).in("account_status", ["expired", "trial_expired"]).is("deleted_at", null),
        supabase.from("businesses").select("*", { count: "exact", head: true }).not("data_delete_after", "is", null).lte("data_delete_after", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()).is("deleted_at", null),
        supabase.from("payment_proofs").select("amount").eq("status", "approved"),
      ]);

      // Calculate monthly revenue from approved payments this month
      const revenuePayments = pendingPayments.data || [];
      const monthlyRevenue = revenuePayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

      setStats({
        totalBusinesses: total || 0,
        newThisMonth: newThisMonth || 0,
        activeSubscriptions: active || 0,
        trialAccounts: trial || 0,
        pendingPayments: pending || 0,
        expiredAccounts: expired || 0,
        monthlyRevenue,
        scheduledDeletions: scheduledDeletions || 0,
      });
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Businesses",
      value: stats?.totalBusinesses ?? 0,
      icon: Building2,
      accent: "primary" as const,
      trend: { value: `${stats?.newThisMonth ?? 0} this month`, positive: true },
    },
    {
      label: "Active Subscriptions",
      value: stats?.activeSubscriptions ?? 0,
      icon: Crown,
      accent: "success" as const,
    },
    {
      label: "Trial Accounts",
      value: stats?.trialAccounts ?? 0,
      icon: Clock,
      accent: "info" as const,
    },
    {
      label: "Pending Payments",
      value: stats?.pendingPayments ?? 0,
      icon: Wallet,
      accent: "warning" as const,
    },
    {
      label: "Expired Accounts",
      value: stats?.expiredAccounts ?? 0,
      icon: XCircle,
      accent: "destructive" as const,
    },
    {
      label: "Monthly Revenue",
      value: `Rs. ${(stats?.monthlyRevenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      accent: "success" as const,
    },
    {
      label: "Scheduled Deletions",
      value: stats?.scheduledDeletions ?? 0,
      icon: TriangleAlert,
      accent: "warning" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Admin Dashboard</h2>
        <p className="mt-0.5 text-sm text-muted-foreground/70">
          Overview of all businesses and system health
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-border/40 bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickActionLink
            href="/admin/payments"
            label="Review Pending Payments"
            description={`${stats?.pendingPayments || 0} payment(s) awaiting approval`}
            icon={Wallet}
            accent="warning"
          />
          <QuickActionLink
            href="/admin/businesses"
            label="Manage Businesses"
            description={`${stats?.totalBusinesses || 0} total businesses`}
            icon={Building2}
            accent="primary"
          />
          <QuickActionLink
            href="/admin/cleanup"
            label="Data Cleanup"
            description={`${stats?.scheduledDeletions || 0} account(s) scheduled for deletion`}
            icon={TriangleAlert}
            accent="destructive"
          />
        </div>
      </div>
    </div>
  );
}

function QuickActionLink({
  href,
  label,
  description,
  icon: Icon,
  accent,
}: {
  href: string;
  label: string;
  description: string;
  icon: typeof Building2;
  accent: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-start gap-3 rounded-xl border border-border/20 bg-muted/5 p-4 transition-all hover:border-border/40 hover:bg-muted/10"
    >
      <div className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg",
        accent === "warning" && "bg-warning/10 text-warning",
        accent === "primary" && "bg-primary/10 text-primary",
        accent === "destructive" && "bg-destructive/10 text-destructive",
      )}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {label}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground/70">{description}</p>
      </div>
    </a>
  );
}
