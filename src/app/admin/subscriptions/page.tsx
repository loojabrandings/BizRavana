"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  Ban,
  CheckCircle2,
  Clock,
  Coins,
  Crown,
  ExternalLink,
  Gift,
  Hourglass,
  Loader2,
  Plus,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";
import { fetchUserEmails } from "@/lib/admin-utils";

// ══ Responsive Admin Components ══════════════════════════════════
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminMobileTabs } from "@/components/admin/mobile-tabs";
import { AdminSearchBar } from "@/components/admin/search-bar";
import {
  AdminResponsiveTable,
  AdminActionSheet,
  AdminMobileRecordCard,
  type Column,
  type ActionSheetAction,
} from "@/components/admin/responsive-table";

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════

interface SubscriptionRow {
  id: string;
  name: string;
  owner_name: string | null;
  owner_email: string | null;
  plan_id: string | null;
  plan_name: string | null;
  plan_price: number;
  account_status: string;
  subscription_started_at: string | null;
  subscription_ends_at: string | null;
  data_delete_after: string | null;
  created_at: string;
  last_payment_amount: number | null;
  last_payment_date: string | null;
  last_payment_plan_name: string | null;
}

type FilterTab = "active" | "expiring" | "expired" | "all";

interface PlanOption {
  id: string;
  name: string;
  monthly_price: number;
}

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════

function getDaysRemaining(dateStr: string | null): { days: number; expired: boolean } {
  if (!dateStr) return { days: 0, expired: false };
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  return { days, expired: days <= 0 };
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-success/10 text-success border-success/20",
    expired: "bg-destructive/10 text-destructive border-destructive/20",
    pending_payment: "bg-warning/10 text-warning border-warning/20",
    suspended: "bg-destructive/10 text-destructive border-destructive/20",
    archived: "bg-muted text-muted-foreground border-border/20",
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold capitalize",
      styles[status] || "bg-muted text-muted-foreground",
    )}>
      {status === "active" && <CheckCircle2 className="size-2.5" />}
      {status === "expired" && <Hourglass className="size-2.5" />}
      {status === "pending_payment" && <Clock className="size-2.5" />}
      {status === "suspended" && <Ban className="size-2.5" />}
      {status.replace("_", " ")}
    </span>
  );
}

function StatsCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: typeof Crown;
  accent: "success" | "warning" | "destructive" | "default";
}) {
  const accentStyles: Record<string, string> = {
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    default: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/20 bg-card p-4">
      <div className={cn("flex size-10 items-center justify-center rounded-lg", accentStyles[accent])}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-xs text-muted-foreground/70">{label}</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// EXTEND SUBSCRIPTION DIALOG (unchanged)
// ══════════════════════════════════════════════════════════════════

function ExtendSubscriptionDialog({
  open,
  onOpenChange,
  business,
  onExtend,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: SubscriptionRow | null;
  onExtend: (days: number) => void;
  loading: boolean;
}) {
  const [days, setDays] = useState(30);
  const [customDays, setCustomDays] = useState(false);

  useEffect(() => {
    if (open) { setDays(30); setCustomDays(false); }
  }, [open]);

  if (!business) return null;

  const presets = [7, 14, 30, 90];
  const currentEnd = business.subscription_ends_at
    ? new Date(business.subscription_ends_at).toLocaleDateString()
    : "—";
  const newEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 mb-2">
            <Hourglass className="size-5 text-primary" />
          </div>
          <DialogTitle>Extend Subscription</DialogTitle>
          <DialogDescription>
            Extend the subscription for <strong>{business.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-xl border border-border/20 bg-muted/5 p-3 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground/70">Current ends</span>
              <span className="font-medium text-foreground">{currentEnd}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground/70">New ends</span>
              <span className="font-medium text-foreground">{newEnd}</span>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground/70 mb-2 block">Duration</Label>
            <div className="grid grid-cols-4 gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setDays(p); setCustomDays(false); }}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    !customDays && days === p
                      ? "border-primary/50 bg-primary/5 text-primary ring-1 ring-primary/20"
                      : "border-border/20 text-muted-foreground/70 hover:border-border/40 hover:text-foreground",
                  )}
                >
                  {p}d
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={customDays}
                onChange={(e) => setCustomDays(e.target.checked)}
                className="rounded border-border/40"
              />
              <span className="text-sm text-foreground/80">Custom</span>
            </label>
            {customDays && (
              <Input
                type="number"
                min={1}
                max={365}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-24 h-9"
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={() => onExtend(days)} disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Extend by {days} day{days !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════════
// CHANGE PLAN DIALOG (unchanged)
// ══════════════════════════════════════════════════════════════════

function ChangePlanDialog({
  open,
  onOpenChange,
  business,
  plans,
  onSave,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: SubscriptionRow | null;
  plans: PlanOption[];
  onSave: (planId: string) => void;
  loading: boolean;
}) {
  const [selectedPlanId, setSelectedPlanId] = useState("");

  useEffect(() => {
    if (open && business) setSelectedPlanId(business.plan_id || "");
  }, [open, business]);

  if (!business) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 mb-2">
            <ArrowUpDown className="size-5 text-primary" />
          </div>
          <DialogTitle>Change Plan</DialogTitle>
          <DialogDescription>
            Change the subscription plan for <strong>{business.name}</strong>.
            Currently on <strong>{business.plan_name || "no plan"}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {plans.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPlanId(p.id)}
              className={cn(
                "w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all",
                selectedPlanId === p.id
                  ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                  : "border-border/20 hover:border-border/40 hover:bg-muted/5",
              )}
            >
              <div>
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground/70">
                  Rs. {p.monthly_price.toLocaleString()} / month
                </p>
              </div>
              {selectedPlanId === p.id && <CheckCircle2 className="size-4 text-primary shrink-0" />}
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button
            onClick={() => onSave(selectedPlanId)}
            disabled={loading || !selectedPlanId || selectedPlanId === business.plan_id}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Change Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("active");
  const [searchQuery, setSearchQuery] = useState("");

  // Extend dialog
  const [extendTarget, setExtendTarget] = useState<SubscriptionRow | null>(null);
  const [extending, setExtending] = useState(false);

  // Change plan dialog
  const [changeTarget, setChangeTarget] = useState<SubscriptionRow | null>(null);
  const [changing, setChanging] = useState(false);

  // Confirm dialogs
  const [suspendTarget, setSuspendTarget] = useState<SubscriptionRow | null>(null);
  const [cancelTarget, setCancelTarget] = useState<SubscriptionRow | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Mobile action sheet
  const [actionSheetTarget, setActionSheetTarget] = useState<SubscriptionRow | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  // ── Fetch Plans (for change-plan dropdown) ──────────────────
  useEffect(() => {
    supabase
      .from("subscription_plans")
      .select("id, name, monthly_price")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data) setPlans(data as PlanOption[]);
      });
  }, [supabase]);

  // ── Fetch Subscriptions ─────────────────────────────────────
  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, owner_id, plan_id, account_status, subscription_started_at, subscription_ends_at, data_delete_after, created_at")
        .in("account_status", ["active", "expired", "pending_payment", "suspended"])
        .is("deleted_at", null)
        .order("subscription_ends_at", { ascending: true, nullsFirst: false })
        .limit(100);

      if (error) throw error;

      // Batch-fetch profiles and plan names
      const ownerIds = [...new Set((data || []).map((b) => b.owner_id))];
      const planIds = [...new Set((data || []).map((b) => b.plan_id).filter(Boolean))];

      const [profilesRes, plansRes, emailMap] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name").in("user_id", ownerIds),
        supabase.from("subscription_plans").select("id, name, monthly_price").in("id", planIds),
        fetchUserEmails(ownerIds),
      ]);

      const profileMap = new Map((profilesRes.data || []).map((p) => [p.user_id, p]));
      const planMap = new Map((plansRes.data || []).map((p) => [p.id, p]));

      // Fetch latest approved payment per business
      const bizIds = (data || []).map((b) => b.id);
      const { data: latestPayments } = await supabase
        .from("payment_proofs")
        .select("business_id, amount, created_at, plan_id")
        .eq("status", "approved")
        .in("business_id", bizIds)
        .order("created_at", { ascending: false });

      // Get only the latest payment per business
      const paymentMap = new Map<string, { amount: number; date: string; plan_id: string | null }>();
      if (latestPayments) {
        for (const p of latestPayments) {
          if (!paymentMap.has(p.business_id)) {
            paymentMap.set(p.business_id, {
              amount: p.amount,
              date: p.created_at,
              plan_id: p.plan_id,
            });
          }
        }
      }

      const enriched: SubscriptionRow[] = (data || []).map((b) => {
        const profile = profileMap.get(b.owner_id);
        const planInfo = planMap.get(b.plan_id || "");
        const lastPay = paymentMap.get(b.id);
        return {
          id: b.id,
          name: b.name,
          owner_name: profile?.full_name || null,
          owner_email: emailMap[b.owner_id] || null,
          plan_id: b.plan_id,
          plan_name: planInfo?.name || null,
          plan_price: planInfo?.monthly_price || 0,
          account_status: b.account_status,
          subscription_started_at: b.subscription_started_at,
          subscription_ends_at: b.subscription_ends_at,
          data_delete_after: b.data_delete_after,
          created_at: b.created_at,
          last_payment_amount: lastPay?.amount || null,
          last_payment_date: lastPay?.date || null,
          last_payment_plan_name: lastPay?.plan_id ? planMap.get(lastPay.plan_id)?.name || null : null,
        };
      });

      setSubscriptions(enriched);
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // ── Stats ───────────────────────────────────────────────────
  const stats = useMemo(() => {
    const active = subscriptions.filter((s) => s.account_status === "active").length;
    const expired = subscriptions.filter((s) => s.account_status === "expired").length;
    const expiring = subscriptions.filter((s) => {
      if (!s.subscription_ends_at || s.account_status !== "active") return false;
      const { days, expired: isExpired } = getDaysRemaining(s.subscription_ends_at);
      return days <= 7 && !isExpired;
    }).length;
    const monthlyRev = subscriptions
      .filter((s) => s.last_payment_amount)
      .reduce((sum, s) => sum + (s.last_payment_amount || 0), 0);
    return { active, expired, expiring, total: subscriptions.length, monthlyRev };
  }, [subscriptions]);

  // ── Filtered ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = subscriptions;

    if (activeTab === "active") {
      result = result.filter((s) => s.account_status === "active");
    } else if (activeTab === "expiring") {
      result = result.filter((s) => {
        if (s.account_status !== "active" || !s.subscription_ends_at) return false;
        const { days, expired } = getDaysRemaining(s.subscription_ends_at);
        return days <= 7 && !expired;
      });
    } else if (activeTab === "expired") {
      result = result.filter((s) => s.account_status === "expired");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.owner_name?.toLowerCase().includes(q) ||
          s.owner_email?.toLowerCase().includes(q) ||
          s.plan_name?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [subscriptions, activeTab, searchQuery]);

  // ── Extend ──────────────────────────────────────────────────
  const handleExtend = useCallback(async (days: number) => {
    if (!extendTarget) return;
    setExtending(true);
    try {
      const now = new Date();
      const extended = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      const { error } = await supabase
        .from("businesses")
        .update({
          account_status: "active",
          subscription_started_at: extendTarget.subscription_started_at || now.toISOString(),
          subscription_ends_at: extended.toISOString(),
          data_delete_after: null,
          updated_at: now.toISOString(),
        })
        .eq("id", extendTarget.id);

      if (error) throw error;
      toast.success(`Subscription extended by ${days} days for "${extendTarget.name}"`);
      setExtendTarget(null);
      fetchSubscriptions();
    } catch (err) {
      console.error("Extend error:", err);
      toast.error("Failed to extend subscription");
    } finally {
      setExtending(false);
    }
  }, [extendTarget, supabase, fetchSubscriptions]);

  // ── Change Plan ─────────────────────────────────────────────
  const handleChangePlan = useCallback(async (planId: string) => {
    if (!changeTarget) return;
    setChanging(true);
    try {
      const { error } = await supabase
        .from("businesses")
        .update({
          plan_id: planId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", changeTarget.id);

      if (error) throw error;
      const newPlan = plans.find((p) => p.id === planId);
      toast.success(`"${changeTarget.name}" changed to ${newPlan?.name || "new plan"}`);
      setChangeTarget(null);
      fetchSubscriptions();
    } catch (err) {
      console.error("Change plan error:", err);
      toast.error("Failed to change plan");
    } finally {
      setChanging(false);
    }
  }, [changeTarget, plans, supabase, fetchSubscriptions]);

  // ── Suspend ─────────────────────────────────────────────────
  const handleSuspend = useCallback(async () => {
    if (!suspendTarget) return;
    setConfirmLoading(true);
    try {
      const { error } = await supabase
        .from("businesses")
        .update({
          account_status: "suspended",
          updated_at: new Date().toISOString(),
        })
        .eq("id", suspendTarget.id);

      if (error) throw error;
      toast.success(`"${suspendTarget.name}" suspended`);
      setSuspendTarget(null);
      fetchSubscriptions();
    } catch (err) {
      console.error("Suspend error:", err);
      toast.error("Failed to suspend subscription");
    } finally {
      setConfirmLoading(false);
    }
  }, [suspendTarget, supabase, fetchSubscriptions]);

  // ── Cancel ──────────────────────────────────────────────────
  const handleCancel = useCallback(async () => {
    if (!cancelTarget) return;
    setConfirmLoading(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("businesses")
        .update({
          account_status: "expired",
          data_delete_after: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: now,
        })
        .eq("id", cancelTarget.id);

      if (error) throw error;
      toast.success(`"${cancelTarget.name}" cancelled`);
      setCancelTarget(null);
      fetchSubscriptions();
    } catch (err) {
      console.error("Cancel error:", err);
      toast.error("Failed to cancel subscription");
    } finally {
      setConfirmLoading(false);
    }
  }, [cancelTarget, supabase, fetchSubscriptions]);

  // ── Mobile action sheet ─────────────────────────────────────
  const handleOpenActionSheet = useCallback((sub: SubscriptionRow) => {
    setActionSheetTarget(sub);
    setActionSheetOpen(true);
  }, []);

  const actionSheetActions: ActionSheetAction[] = useMemo(() => {
    if (!actionSheetTarget) return [];
    const actions: ActionSheetAction[] = [
      {
        label: "Extend Subscription",
        onClick: () => { setExtendTarget(actionSheetTarget); setActionSheetTarget(null); },
        icon: <Plus className="size-4" />,
      },
      {
        label: "Change Plan",
        onClick: () => { setChangeTarget(actionSheetTarget); setActionSheetTarget(null); },
        icon: <ArrowUpDown className="size-4" />,
      },
    ];
    if (actionSheetTarget.account_status !== "suspended") {
      actions.push({
        label: "Suspend",
        onClick: () => { setSuspendTarget(actionSheetTarget); setActionSheetTarget(null); },
        icon: <Ban className="size-4" />,
        variant: "warning",
      });
    }
    if (actionSheetTarget.account_status !== "expired") {
      actions.push({
        label: "Cancel Subscription",
        onClick: () => { setCancelTarget(actionSheetTarget); setActionSheetTarget(null); },
        icon: <XCircle className="size-4" />,
        variant: "destructive",
      });
    }
    return actions;
  }, [actionSheetTarget]);

  // ── Desktop columns ─────────────────────────────────────────
  const columns: Column<SubscriptionRow>[] = useMemo(() => [
    {
      header: "Business",
      accessor: (sub) => (
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            sub.account_status === "active" ? "bg-success/10" :
            sub.account_status === "expired" ? "bg-destructive/10" : "bg-muted/30",
          )}>
            {sub.account_status === "active" ? (
              <Crown className="size-4 text-success" />
            ) : sub.account_status === "expired" ? (
              <Hourglass className="size-4 text-destructive" />
            ) : (
              <Gift className="size-4 text-muted-foreground/60" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate max-w-[160px]">{sub.name}</p>
            {sub.owner_name && (
              <p className="text-[10px] text-muted-foreground/60 truncate max-w-[160px]">
                {sub.owner_name}{sub.owner_email ? ` · ${sub.owner_email}` : ""}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Plan",
      accessor: (sub) => (
        <div>
          <span className="text-sm text-foreground/80">{sub.plan_name || "—"}</span>
          {sub.plan_price > 0 && (
            <p className="text-[10px] text-muted-foreground/60">Rs. {sub.plan_price.toLocaleString()}/mo</p>
          )}
        </div>
      ),
    },
    {
      header: "Start Date",
      hideBelow: "lg",
      accessor: (sub) => (
        <span className="text-sm text-muted-foreground/80 tabular-nums">
          {sub.subscription_started_at
            ? new Date(sub.subscription_started_at).toLocaleDateString()
            : "—"}
        </span>
      ),
    },
    {
      header: "End Date",
      accessor: (sub) => {
        const { expired } = getDaysRemaining(sub.subscription_ends_at);
        return (
          <span className={cn("text-sm tabular-nums", expired ? "text-destructive font-semibold" : "text-muted-foreground/80")}>
            {sub.subscription_ends_at
              ? new Date(sub.subscription_ends_at).toLocaleDateString()
              : "—"}
          </span>
        );
      },
    },
    {
      header: "Days Left",
      hideBelow: "sm",
      accessor: (sub) => {
        const { days, expired } = getDaysRemaining(sub.subscription_ends_at);
        return sub.subscription_ends_at ? (
          <span className={cn(
            "inline-flex items-center gap-1 text-sm font-semibold tabular-nums",
            expired ? "text-destructive" : days <= 3 ? "text-warning" : "text-muted-foreground/80",
          )}>
            {expired ? <><Hourglass className="size-3" /> 0</> : days <= 7 ? <><Clock className="size-3" /> {days}</> : days}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground/50">—</span>
        );
      },
    },
    {
      header: "Last Payment",
      hideBelow: "md",
      accessor: (sub) => (
        sub.last_payment_amount ? (
          <div>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              Rs. {sub.last_payment_amount.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground/60">
              {sub.last_payment_date ? new Date(sub.last_payment_date).toLocaleDateString() : ""}
              {sub.last_payment_plan_name ? ` · ${sub.last_payment_plan_name}` : ""}
            </p>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground/50">—</span>
        )
      ),
    },
    {
      header: "Status",
      accessor: (sub) => <StatusBadge status={sub.account_status} />,
    },
    {
      header: "",
      className: "w-44",
      headerClassName: "hidden sm:table-cell",
      accessor: (sub) => (
        <div className="flex items-center gap-0.5 max-lg:opacity-100 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon-xs" onClick={() => setExtendTarget(sub)} title="Extend subscription">
            <Plus className="size-3.5 text-primary" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={() => setChangeTarget(sub)} title="Change plan">
            <ArrowUpDown className="size-3.5 text-muted-foreground/60" />
          </Button>
          {sub.account_status !== "suspended" && (
            <Button variant="ghost" size="icon-xs" onClick={() => setSuspendTarget(sub)} title="Suspend">
              <Ban className="size-3.5 text-muted-foreground/60" />
            </Button>
          )}
          {sub.account_status !== "expired" && (
            <Button variant="ghost" size="icon-xs" onClick={() => setCancelTarget(sub)} title="Cancel subscription">
              <XCircle className="size-3.5 text-destructive/60" />
            </Button>
          )}
        </div>
      ),
    },
  ], []);

  // ── Mobile card renderer ──────────────────────────────────────
  const renderMobileCard = useCallback((sub: SubscriptionRow) => {
    const { days, expired } = getDaysRemaining(sub.subscription_ends_at);
    return (
      <AdminMobileRecordCard
        primary={sub.name}
        status={<StatusBadge status={sub.account_status} />}
        details={[
          {
            label: "Plan",
            value: <span className="font-medium">{sub.plan_name || "—"}{sub.plan_price > 0 ? ` · Rs. ${sub.plan_price.toLocaleString()}/mo` : ""}</span>,
          },
          {
            label: "End Date",
            value: <span className={expired ? "text-destructive font-semibold" : ""}>
              {sub.subscription_ends_at ? new Date(sub.subscription_ends_at).toLocaleDateString() : "—"}
            </span>,
          },
          ...(sub.subscription_ends_at ? [{
            label: "Days Left",
            value: <span className={cn("font-semibold", expired ? "text-destructive" : days <= 3 ? "text-warning" : "")}>
              {expired ? "Expired" : `${days} day${days !== 1 ? "s" : ""}`}
            </span>,
          }] : []),
          ...(sub.last_payment_amount ? [{
            label: "Last Payment",
            value: <span className="font-medium tabular-nums">
              Rs. {sub.last_payment_amount.toLocaleString()}
              {sub.last_payment_date ? ` · ${new Date(sub.last_payment_date).toLocaleDateString()}` : ""}
            </span>,
          }] : []),
          {
            label: "Started",
            value: <span className="tabular-nums">{sub.subscription_started_at ? new Date(sub.subscription_started_at).toLocaleDateString() : "—"}</span>,
          },
        ]}
        actions={
          <>
            <button
              type="button"
              onClick={() => window.open(`/admin/businesses/${sub.id}`, "_self")}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium min-h-11 hover:bg-accent transition-colors"
            >
              <ExternalLink className="size-3.5" />
              View
            </button>
            <button
              type="button"
              onClick={() => handleOpenActionSheet(sub)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium min-h-11 hover:bg-primary/90 transition-colors"
            >
              More
            </button>
          </>
        }
      />
    );
  }, [handleOpenActionSheet]);

  // ── Tabs ────────────────────────────────────────────────────
  const tabs = [
    { key: "active", label: "Active", count: stats.active },
    { key: "expiring", label: "Expiring Soon", count: stats.expiring },
    { key: "expired", label: "Expired", count: stats.expired },
    { key: "all", label: "All", count: stats.total },
  ];

  // ── Filter count ────────────────────────────────────────────
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeTab !== "active") count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [activeTab, searchQuery]);

  const handleClearFilters = useCallback(() => {
    setActiveTab("active");
    setSearchQuery("");
  }, []);

  // ── Empty state ─────────────────────────────────────────────
  const emptyState = (
    <div className="flex flex-col items-center gap-2">
      <Crown className="size-8 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground/60">
        {searchQuery
          ? "No subscriptions match your search."
          : activeTab === "active"
            ? "No active subscriptions"
            : activeTab === "expiring"
              ? "No subscriptions expiring this week"
              : "No subscriptions found."}
      </p>
    </div>
  );

  // ── Loading ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      {/* ═══ Header ════════════════════════════════════════════ */}
      <AdminPageHeader
        title="Subscription Management"
        subtitle="Manage active, expiring, and expired subscriptions"
      />

      {/* ═══ Stats ═════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard label="Active" value={stats.active} icon={Crown} accent="success" />
        <StatsCard label="Expiring in 7 Days" value={stats.expiring} icon={Clock} accent="warning" />
        <StatsCard label="Expired" value={stats.expired} icon={Hourglass} accent="destructive" />
        <StatsCard label="Total Approved Payments" value={`Rs. ${stats.monthlyRev.toLocaleString()}`} icon={Coins} accent="default" />
      </div>

      {/* ═══ Tabs + Search ════════════════════════════════════ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <AdminMobileTabs tabs={tabs} activeTab={activeTab} onTabChange={(k) => setActiveTab(k as FilterTab)} />
        <AdminSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search businesses..."
          filterCount={activeFilterCount}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* ═══ Responsive Table ═════════════════════════════════ */}
      <AdminResponsiveTable<SubscriptionRow>
        columns={columns}
        data={filtered}
        keyExtractor={(sub) => sub.id}
        mobileCard={renderMobileCard}
        emptyState={emptyState}
      />

      {/* ═══ Mobile Action Sheet ══════════════════════════════ */}
      {actionSheetTarget && (
        <AdminActionSheet
          open={actionSheetOpen}
          onOpenChange={(open) => { if (!open) { setActionSheetOpen(false); setActionSheetTarget(null); } }}
          title={actionSheetTarget.name}
          description="Manage subscription"
          actions={actionSheetActions}
        />
      )}

      {/* ═══ Extend Dialog ════════════════════════════════════ */}
      <ExtendSubscriptionDialog
        open={extendTarget !== null}
        onOpenChange={(open) => { if (!open) setExtendTarget(null); }}
        business={extendTarget}
        onExtend={handleExtend}
        loading={extending}
      />

      {/* ═══ Change Plan Dialog ═══════════════════════════════ */}
      <ChangePlanDialog
        open={changeTarget !== null}
        onOpenChange={(open) => { if (!open) setChangeTarget(null); }}
        business={changeTarget}
        plans={plans}
        onSave={handleChangePlan}
        loading={changing}
      />

      {/* ═══ Suspend Confirm ══════════════════════════════════ */}
      <ConfirmDialog
        open={suspendTarget !== null}
        onOpenChange={() => setSuspendTarget(null)}
        onConfirm={handleSuspend}
        title="Suspend Subscription"
        description={`This will suspend "${suspendTarget?.name}". The business owner will lose dashboard access until reactivated.`}
        confirmLabel="Suspend"
        variant="destructive"
        loading={confirmLoading}
      />

      {/* ═══ Cancel Confirm ═══════════════════════════════════ */}
      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel Subscription"
        description={`This will cancel "${cancelTarget?.name}"'s subscription. Data will be retained for 14 days before deletion.`}
        confirmLabel="Cancel Subscription"
        variant="destructive"
        loading={confirmLoading}
      />
    </div>
  );
}
