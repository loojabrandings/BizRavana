"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Ban,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  CreditCard,
  FileText,
  Gift,
  HardDrive,
  Hourglass,
  Image as ImageIcon,
  Infinity,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { fetchUserEmails } from "@/lib/admin-utils";

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════

interface BusinessDetail {
  id: string;
  name: string;
  type: string | null;
  phone: string | null;
  district: string | null;
  address: string | null;
  logo_url: string | null;
  account_status: string;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  subscription_started_at: string | null;
  subscription_ends_at: string | null;
  data_delete_after: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  owner_id: string;
  plan_id: string | null;
}

interface OwnerProfile {
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface PlanInfo {
  id: string;
  name: string;
  monthly_price: number;
  order_limit: number;
  expense_limit: number;
  product_limit: number;
  quotation_limit: number;
  inventory_limit: number;
  storage_limit_mb: number;
  courier_accounts: number;
  whatsapp_templates: number;
  team_members: number;
  bulk_import: boolean;
  activity_log: boolean;
  smart_automation: boolean;
  ai_assistant: boolean;
}

interface PaymentRecord {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  proof_image_url: string | null;
  created_at: string;
  plan_name: string | null;
}

interface UsageCounts {
  orders: number;
  expenses: number;
  products: number;
  quotations: number;
  inventory: number;
  storage_mb: number;
}

// ══════════════════════════════════════════════════════════════════
// STATUS BADGE
// ══════════════════════════════════════════════════════════════════

function StatusBadge({ status, size = "sm" }: { status: string; size?: "sm" | "lg" }) {
  const styles: Record<string, string> = {
    trial: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    trial_expired: "bg-warning/10 text-warning border-warning/20",
    pending_payment: "bg-warning/10 text-warning border-warning/20",
    active: "bg-success/10 text-success border-success/20",
    expired: "bg-destructive/10 text-destructive border-destructive/20",
    suspended: "bg-destructive/10 text-destructive border-destructive/20",
    archived: "bg-muted text-muted-foreground border-border/20",
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full border font-semibold capitalize",
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
      styles[status] || "bg-muted text-muted-foreground",
    )}>
      {status.replace("_", " ")}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-warning/10 text-warning border-warning/20",
    approved: "bg-success/10 text-success border-success/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold capitalize",
      styles[status] || "bg-muted text-muted-foreground",
    )}>
      {status === "pending" && <Clock className="size-2.5" />}
      {status === "approved" && <CheckCircle2 className="size-2.5" />}
      {status === "rejected" && <XCircle className="size-2.5" />}
      {status}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════
// USAGE METER
// ══════════════════════════════════════════════════════════════════

function UsageMeter({
  label,
  used,
  limit,
  icon: Icon,
  suffix,
}: {
  label: string;
  used: number;
  limit: number;
  icon: typeof ShoppingCart;
  suffix?: string;
}) {
  const isUnlimited = limit >= 999999;
  const percentage = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = !isUnlimited && percentage >= 100;

  return (
    <div className="rounded-xl border border-border/20 bg-muted/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="size-3.5 text-muted-foreground/60" />
          <span className="text-sm font-medium text-foreground/80">{label}</span>
        </div>
        <span className={cn(
          "text-sm font-semibold tabular-nums",
          isAtLimit ? "text-destructive" : isNearLimit ? "text-warning" : "text-foreground",
        )}>
          {used.toLocaleString()}
          {isUnlimited ? (
            <span className="text-muted-foreground/60 ml-1">
              <Infinity className="size-3 inline" />
            </span>
          ) : (
            <span className="text-muted-foreground/60 ml-1">
              / {limit.toLocaleString()}{suffix ? ` ${suffix}` : ""}
            </span>
          )}
        </span>
      </div>
      {!isUnlimited && (
        <Progress
          value={percentage}
          className={cn(
            "h-1.5",
            isAtLimit && "[&>div]:bg-destructive",
            isNearLimit && !isAtLimit && "[&>div]:bg-warning",
          )}
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SECTION CARD
// ══════════════════════════════════════════════════════════════════

function SectionCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: typeof Building2;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border/40 bg-card overflow-hidden", className)}>
      <div className="flex items-center gap-2.5 border-b border-border/20 px-6 py-4">
        <Icon className="size-4 text-muted-foreground/70" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<BusinessDetail | null>(null);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [usage, setUsage] = useState<UsageCounts | null>(null);
  const [allPlans, setAllPlans] = useState<PlanInfo[]>([]);

  // Danger zone confirmations
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Change plan dialog
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");

  const supabase = useMemo(() => createClient(), []);

  const fetchData = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoading(true);

      // Fetch business
      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

      if (!biz) {
        toast.error("Business not found");
        router.push("/admin/businesses");
        return;
      }

      setBusiness(biz as BusinessDetail);

      // Fetch owner profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url")
        .eq("user_id", biz.owner_id)
        .single();

      if (profile) {
        // Fetch real email from auth.users (email column doesn't exist in public.profiles)
        const emailMap = await fetchUserEmails([biz.owner_id]);
        setOwner({ ...profile, email: emailMap[biz.owner_id] || null } as OwnerProfile);
      }

      // Fetch all active plans
      const { data: plans } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (plans) setAllPlans(plans as PlanInfo[]);

      // Fetch current plan details
      if (biz.plan_id) {
        const { data: p } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("id", biz.plan_id)
          .single();
        if (p) setPlan(p as PlanInfo);
      }

      // Fetch payment history
      const { data: proofData } = await supabase
        .from("payment_proofs")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(20);

      // Enrich payments with plan names
      if (proofData) {
        const planIds = [...new Set(proofData.map((p) => p.plan_id).filter(Boolean))];
        const { data: planRefs } = planIds.length > 0
          ? await supabase.from("subscription_plans").select("id, name").in("id", planIds)
          : { data: [] };
        const planMap = new Map((planRefs || []).map((p) => [p.id, p.name]));

        setPayments(
          proofData.map((p) => ({
            id: p.id,
            amount: p.amount,
            status: p.status,
            payment_method: p.payment_method,
            proof_image_url: p.proof_image_url,
            created_at: p.created_at,
            plan_name: p.plan_id ? planMap.get(p.plan_id) || null : null,
          })),
        );
      }

      // Fetch usage counts
      const [orderCount, expenseCount, productCount, quoteCount, inventoryCount] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("business_id", businessId).is("deleted_at", null),
        supabase.from("expenses").select("id", { count: "exact", head: true }).eq("business_id", businessId).is("deleted_at", null),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("business_id", businessId).is("deleted_at", null).eq("is_active", true),
        supabase.from("quotations").select("id", { count: "exact", head: true }).eq("business_id", businessId).is("deleted_at", null),
        supabase.from("inventory_items").select("id", { count: "exact", head: true }).eq("business_id", businessId).is("deleted_at", null),
      ]);

      // Estimate storage usage from storage buckets
      let storageMb = 0;
      try {
        // payment-proofs: proofs/{businessId}/
        const { data: proofFiles } = await supabase.storage
          .from("payment-proofs")
          .list(`proofs/${businessId}`, { limit: 100 });
        if (proofFiles) {
          for (const f of proofFiles) {
            storageMb += (f.metadata?.size || 0) / (1024 * 1024);
          }
        }

        // profile-images logos: logos/{businessId}/
        const { data: logoFiles } = await supabase.storage
          .from("profile-images")
          .list(`logos/${businessId}`, { limit: 10 });
        if (logoFiles) {
          for (const f of logoFiles) {
            storageMb += (f.metadata?.size || 0) / (1024 * 1024);
          }
        }

        // order-images: {businessId}/
        const { data: orderImages } = await supabase.storage
          .from("order-images")
          .list(businessId, { limit: 100 });
        if (orderImages) {
          for (const f of orderImages) {
            storageMb += (f.metadata?.size || 0) / (1024 * 1024);
          }
        }
      } catch { /* storage estimation is best-effort */ }

      setUsage({
        orders: orderCount.count || 0,
        expenses: expenseCount.count || 0,
        products: productCount.count || 0,
        quotations: quoteCount.count || 0,
        inventory: inventoryCount.count || 0,
        storage_mb: Math.round(storageMb * 10) / 10,
      });
    } catch (err) {
      console.error("Failed to fetch business detail:", err);
      toast.error("Failed to load business details");
    } finally {
      setLoading(false);
    }
  }, [businessId, supabase, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Danger Zone Actions ──────────────────────────────────
  const handleDangerAction = useCallback(async () => {
    if (!business || !confirmAction) return;
    setProcessing(true);
    try {
      const now = new Date().toISOString();
      const updates: Record<string, string | null> = { updated_at: now };

      switch (confirmAction) {
        case "suspend":
          updates.account_status = "suspended";
          break;
        case "activate":
          updates.account_status = "active";
          // Set subscription period when manually activating
          updates.subscription_started_at = now;
          const subEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          updates.subscription_ends_at = subEnd;
          // Clear data retention flag since business is now active
          updates.data_delete_after = null;
          break;
        case "archive":
          updates.account_status = "archived";
          break;
        case "delete":
          updates.account_status = "deleted";
          updates.deleted_at = now;
          break;
        default:
          return;
      }

      const { error } = await supabase
        .from("businesses")
        .update(updates)
        .eq("id", business.id);

      if (error) throw error;
      toast.success(`Business ${confirmAction}d successfully`);
      setConfirmAction(null);
      fetchData();
    } catch (err) {
      console.error(`Failed to ${confirmAction} business:`, err);
      toast.error(`Failed to ${confirmAction} business`);
    } finally {
      setProcessing(false);
    }
  }, [business, confirmAction, supabase, fetchData]);

  // ─── Extend Trial ─────────────────────────────────────────
  const handleExtendTrial = useCallback(async () => {
    if (!business) return;
    setProcessing(true);
    try {
      const now = new Date();
      const extended = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const { error } = await supabase
        .from("businesses")
        .update({
          account_status: "trial",
          trial_ends_at: extended.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", business.id);

      if (error) throw error;
      toast.success("Trial extended by 3 days");
      fetchData();
    } catch (err) {
      console.error("Failed to extend trial:", err);
      toast.error("Failed to extend trial");
    } finally {
      setProcessing(false);
    }
  }, [business, supabase, fetchData]);

  // ─── Change Plan ──────────────────────────────────────────
  const handleChangePlan = useCallback(async () => {
    if (!business || !selectedPlanId) return;
    setProcessing(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("businesses")
        .update({
          plan_id: selectedPlanId,
          updated_at: now,
        })
        .eq("id", business.id);

      if (error) throw error;
      toast.success("Plan changed successfully");
      setShowChangePlan(false);
      fetchData();
    } catch (err) {
      console.error("Failed to change plan:", err);
      toast.error("Failed to change plan");
    } finally {
      setProcessing(false);
    }
  }, [business, selectedPlanId, supabase, fetchData]);

  // ─── Loading State ────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  if (!business) return null;

  const initials = business.name
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);

  const daysRemaining = (dateStr: string | null): number | null => {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const trialDays = business.trial_ends_at ? daysRemaining(business.trial_ends_at) : null;
  const subDays = business.subscription_ends_at ? daysRemaining(business.subscription_ends_at) : null;

  return (
    <div className="space-y-6">
      {/* ═══ Back button + Header ═══════════════════════════ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/businesses")}
            className="mt-1 shrink-0"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 min-w-0">
            <Avatar className="size-12 sm:size-14 rounded-xl shrink-0">
              <AvatarImage src={business.logo_url || undefined} alt={business.name} />
              <AvatarFallback className="rounded-xl bg-primary/10 text-base sm:text-lg font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground break-words">{business.name}</h2>
                <StatusBadge status={business.account_status} size="lg" />
              </div>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground/70 break-words">
                {business.type || "Business"} · {business.district || "No district"} · Created{" "}
                {new Date(business.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ═══ LEFT COLUMN ════════════════════════════════════ */}

        {/* ─── Overview ───────────────────────────────────── */}
        <SectionCard title="Overview" icon={Building2}>
          <div className="space-y-4">
            {/* Owner */}
            {owner && (
              <div className="flex items-center gap-3 rounded-xl border border-border/20 bg-muted/5 p-4">
                <Avatar className="size-10">
                  <AvatarImage src={owner.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                    {owner.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{owner.full_name}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground/70">
                    {owner.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="size-3" />
                        {owner.email}
                      </span>
                    )}
                    {owner.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="size-3" />
                        {owner.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Business info */}
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Phone" value={business.phone || "—"} icon={Phone} />
              <InfoRow label="District" value={business.district || "—"} icon={MapPin} />
              <InfoRow label="Address" value={business.address || "—"} icon={MapPin} className="col-span-2" />
              <InfoRow label="Created" value={new Date(business.created_at).toLocaleDateString()} icon={Calendar} />
              <InfoRow label="Last Updated" value={new Date(business.updated_at).toLocaleDateString()} icon={Calendar} />
            </div>
          </div>
        </SectionCard>

        {/* ─── Subscription ───────────────────────────────── */}
        <SectionCard title="Subscription" icon={Crown}>
          <div className="space-y-4">
            {/* Current plan */}
            <div className="flex items-center justify-between rounded-xl border border-border/20 bg-muted/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  {plan ? <Crown className="size-5 text-primary" /> : <Gift className="size-5 text-primary" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{plan?.name || "No Plan"}</p>
                  {plan && plan.monthly_price > 0 && (
                    <p className="text-xs text-muted-foreground/70">Rs. {plan.monthly_price.toLocaleString()} / month</p>
                  )}
                  {!plan && <p className="text-xs text-muted-foreground/70">No subscription plan assigned</p>}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPlanId(business.plan_id || "");
                  setShowChangePlan(true);
                }}
              >
                <Sparkles className="size-3 mr-1.5" />
                Change Plan
              </Button>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/20 bg-muted/5 p-3">
                <p className="text-xs font-medium text-muted-foreground/70">Trial Period</p>
                <p className="mt-1 text-sm font-semibold text-foreground tabular-nums">
                  {business.trial_started_at ? new Date(business.trial_started_at).toLocaleDateString() : "—"}
                  {business.trial_ends_at && ` → ${new Date(business.trial_ends_at).toLocaleDateString()}`}
                </p>
                {trialDays !== null && (
                  <p className={cn(
                    "mt-0.5 text-xs",
                    trialDays === 0 ? "text-destructive" : "text-muted-foreground/60",
                  )}>
                    {trialDays > 0 ? `${trialDays} days remaining` : "Expired"}
                  </p>
                )}
              </div>
              <div className="rounded-xl border border-border/20 bg-muted/5 p-3">
                <p className="text-xs font-medium text-muted-foreground/70">Subscription</p>
                <p className="mt-1 text-sm font-semibold text-foreground tabular-nums">
                  {business.subscription_started_at ? new Date(business.subscription_started_at).toLocaleDateString() : "—"}
                  {business.subscription_ends_at && ` → ${new Date(business.subscription_ends_at).toLocaleDateString()}`}
                </p>
                {subDays !== null && (
                  <p className={cn(
                    "mt-0.5 text-xs",
                    subDays === 0 ? "text-destructive" : "text-muted-foreground/60",
                  )}>
                    {subDays > 0 ? `${subDays} days remaining` : "Expired"}
                  </p>
                )}
              </div>
            </div>

            {/* Data retention */}
            {business.data_delete_after && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
                <p className="text-xs font-medium text-destructive">Data Retention</p>
                <p className="mt-0.5 text-sm text-foreground/80">
                  Data will be deleted after {new Date(business.data_delete_after).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2">
              {(business.account_status === "trial" || business.account_status === "trial_expired") && (
                <Button variant="outline" size="sm" onClick={handleExtendTrial} disabled={processing}>
                  <Hourglass className="size-3 mr-1.5" />
                  Extend Trial
                </Button>
              )}
              {business.account_status !== "active" && (
                <Button size="sm" onClick={() => setConfirmAction("activate")}>
                  <BadgeCheck className="size-3 mr-1.5" />
                  Activate
                </Button>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ═══ RIGHT COLUMN ═══════════════════════════════════ */}

        {/* ─── Usage ──────────────────────────────────────── */}
        <SectionCard title="Usage" icon={BarChart3}>
          {usage && plan ? (
            <div className="space-y-3">
              <UsageMeter label="Orders" used={usage.orders} limit={plan.order_limit} icon={ShoppingCart} />
              <UsageMeter label="Expenses" used={usage.expenses} limit={plan.expense_limit} icon={Package} />
              <UsageMeter label="Active Products" used={usage.products} limit={plan.product_limit} icon={FileText} />
              <UsageMeter label="Quotations" used={usage.quotations} limit={plan.quotation_limit} icon={FileText} />
              <UsageMeter label="Inventory Items" used={usage.inventory} limit={plan.inventory_limit} icon={Package} />
              <UsageMeter label="Storage" used={usage.storage_mb} limit={plan.storage_limit_mb} icon={ImageIcon} suffix="MB" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <BarChart3 className="size-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground/60">
                {!plan ? "No plan assigned — usage not tracked" : "Usage data not available"}
              </p>
            </div>
          )}
        </SectionCard>

        {/* ─── Payment History ────────────────────────────── */}
        <SectionCard title="Payment History" icon={CreditCard}>
          {payments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CreditCard className="size-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground/60">No payment records found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-xl border border-border/20 bg-muted/5 p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex size-9 items-center justify-center rounded-lg",
                      payment.status === "approved" && "bg-success/10",
                      payment.status === "rejected" && "bg-destructive/10",
                      payment.status === "pending" && "bg-warning/10",
                    )}>
                      {payment.status === "approved" ? (
                        <CheckCircle2 className="size-4 text-success" />
                      ) : payment.status === "rejected" ? (
                        <XCircle className="size-4 text-destructive" />
                      ) : (
                        <Clock className="size-4 text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Rs. {payment.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        {payment.plan_name && `${payment.plan_name} · `}
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <PaymentStatusBadge status={payment.status} />
                    {payment.proof_image_url && (
                      <a
                        href={payment.proof_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex size-7 items-center justify-center rounded-md hover:bg-muted transition-colors"
                        title="View receipt"
                      >
                        <ImageIcon className="size-3.5 text-muted-foreground/60" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ═══ DANGER ZONE ═════════════════════════════════════ */}
      <SectionCard
        title="Danger Zone"
        icon={AlertTriangle}
        className="border-destructive/30"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground/70">
            Destructive actions that cannot be undone. Proceed with caution.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DangerButton
              label={business.account_status === "suspended" ? "Reactivate" : "Suspend"}
              description={business.account_status === "suspended" ? "Restore full access" : "Temporarily block access"}
              icon={Ban}
              onClick={() => setConfirmAction(business.account_status === "suspended" ? "activate" : "suspend")}
            />
            <DangerButton
              label="Archive"
              description="Hide from active views"
              icon={HardDrive}
              onClick={() => setConfirmAction("archive")}
            />
            <DangerButton
              label="Delete"
              description="Permanently remove"
              icon={Trash2}
              destructive
              onClick={() => setConfirmAction("delete")}
            />
          </div>
        </div>
      </SectionCard>

      {/* ═══ CHANGE PLAN DIALOG ══════════════════════════════ */}
      <ConfirmDialog
        open={showChangePlan}
        onOpenChange={setShowChangePlan}
        onConfirm={handleChangePlan}
        title="Change Plan"
        description="Select a new subscription plan for this business."
        confirmLabel="Change Plan"
        loading={processing}
      >
        <div className="space-y-2 mt-3">
          {allPlans.map((p) => (
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
                <p className="text-xs text-muted-foreground/70">Rs. {p.monthly_price.toLocaleString()} / month</p>
              </div>
              {selectedPlanId === p.id && <CheckCircle2 className="size-4 text-primary" />}
            </button>
          ))}
        </div>
      </ConfirmDialog>

      {/* ═══ DANGER CONFIRM DIALOG ═══════════════════════════ */}
      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={() => setConfirmAction(null)}
        onConfirm={handleDangerAction}
        title={
          confirmAction === "activate"
            ? "Activate Business"
            : confirmAction === "suspend"
              ? "Suspend Business"
              : confirmAction === "archive"
                ? "Archive Business"
                : "Delete Business"
        }
        description={
          confirmAction === "activate"
            ? "This will restore full access to the business."
            : confirmAction === "suspend"
              ? "The business owner will lose access to the dashboard until reactivated."
              : confirmAction === "archive"
                ? "The business will be hidden from active views but can be restored."
                : "This will permanently delete the business and all associated data. This cannot be undone."
        }
        confirmLabel={
          confirmAction === "activate"
            ? "Activate"
            : confirmAction === "suspend"
              ? "Suspend"
              : confirmAction === "archive"
                ? "Archive"
                : "Delete Permanently"
        }
        variant={confirmAction === "delete" ? "destructive" : "default"}
        loading={processing}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════

function InfoRow({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  icon: typeof Building2;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 rounded-lg border border-border/10 bg-muted/5 px-3 py-2", className)}>
      <Icon className="size-3.5 shrink-0 text-muted-foreground/50" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground/60">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function DangerButton({
  label,
  description,
  icon: Icon,
  destructive,
  onClick,
}: {
  label: string;
  description: string;
  icon: typeof Ban;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
        destructive
          ? "border-destructive/20 bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/30"
          : "border-border/20 bg-muted/5 hover:bg-muted/10 hover:border-border/40",
      )}
    >
      <Icon className={cn("size-6", destructive ? "text-destructive" : "text-muted-foreground/60")} />
      <div>
        <p className={cn("text-sm font-semibold", destructive ? "text-destructive" : "text-foreground")}>{label}</p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">{description}</p>
      </div>
    </button>
  );
}

