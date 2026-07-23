"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Award,
  BadgeCheck,
  Ban,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  CreditCard,
  Crown,
  Download,
  ExternalLink,
  FileText,
  Gift,
  HeartHandshake,
  HelpCircle,
  Hourglass,
  Image as ImageIcon,
  Infinity,
  LayoutList,
  Loader2,
  MessageCircle,
  Package,
  ShoppingCart,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
  XCircle,
  Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-media-query";
import { toast } from "sonner";
import type { Database } from "@/types/database";

// ══════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════

type SubscriptionPlan = Database["public"]["Tables"]["subscription_plans"]["Row"];
type Business = Database["public"]["Tables"]["businesses"]["Row"];
type PaymentProof = Database["public"]["Tables"]["payment_proofs"]["Row"];

interface UsageCounts {
  orders: number;
  expenses: number;
  products: number;
  quotations: number;
  inventory: number;
  storage_mb: number;
  team_members: number;
  courier_accounts: number;
  whatsapp_templates: number;
}

interface PlanFeature {
  label: string;
  key: keyof Pick<
    SubscriptionPlan,
    | "order_limit" | "expense_limit" | "product_limit" | "quotation_limit"
    | "inventory_limit" | "courier_accounts" | "whatsapp_templates"
    | "team_members" | "storage_limit_mb"
  >;
  suffix?: string;
  icon?: typeof ShoppingCart;
}

interface BoolFeature {
  label: string;
  key: keyof Pick<
    SubscriptionPlan,
    "bulk_import" | "activity_log" | "smart_automation" | "ai_assistant"
  >;
}

// ══════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════

function getPlanIcon(name: string) {
  switch (name.toLowerCase()) {
    case "trial": return Gift;
    case "basic": return Building2;
    case "standard": return Star;
    case "premium": return Crown;
    case "enterprise": return Award;
    default: return Building2;
  }
}

function getPlanColor(name: string) {
  switch (name.toLowerCase()) {
    case "trial": return { bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400", border: "border-blue-500/30", light: "from-blue-500/20 to-transparent", accent: "blue" };
    case "basic": return { bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400", border: "border-slate-500/30", light: "from-slate-500/20 to-transparent", accent: "slate" };
    case "standard": return { bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400", border: "border-purple-500/30", light: "from-purple-500/20 to-transparent", accent: "purple" };
    case "premium": return { bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400", border: "border-amber-500/30", light: "from-amber-500/20 to-transparent", accent: "amber" };
    case "enterprise": return { bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400", border: "border-rose-500/30", light: "from-rose-500/20 to-transparent", accent: "rose" };
    default: return { bg: "bg-muted text-muted-foreground", border: "border-border/30", light: "from-muted/20 to-transparent", accent: "muted" };
  }
}

function getStatusVariant(status: string) {
  switch (status) {
    case "trial": return { label: "Trial", variant: "info" as const, icon: Gift };
    case "trial_expired": return { label: "Trial Expired", variant: "warning" as const, icon: Hourglass };
    case "pending_payment": return { label: "Pending Payment", variant: "warning" as const, icon: Clock };
    case "active": return { label: "Active", variant: "success" as const, icon: CheckCircle2 };
    case "expired": return { label: "Expired", variant: "destructive" as const, icon: XCircle };
    case "suspended": return { label: "Suspended", variant: "destructive" as const, icon: Ban };
    default: return { label: status, variant: "default" as const, icon: HelpCircle };
  }
}

function getDaysRemaining(dateStr: string | null): { days: number; expired: boolean } {
  if (!dateStr) return { days: 0, expired: false };
  const end = new Date(dateStr);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  return { days, expired: days <= 0 };
}

function formatLimit(value: number): string {
  if (value >= 999999) return "Unlimited";
  return value.toLocaleString();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const planFeatures: PlanFeature[] = [
  { label: "Orders", key: "order_limit", icon: ShoppingCart },
  { label: "Expenses", key: "expense_limit", icon: Package },
  { label: "Products", key: "product_limit", icon: FileText },
  { label: "Quotations", key: "quotation_limit", icon: FileText },
  { label: "Inventory Items", key: "inventory_limit", icon: Package },
  { label: "Courier Accounts", key: "courier_accounts", icon: HeartHandshake },
  { label: "WhatsApp Templates", key: "whatsapp_templates", icon: MessageCircle },
  { label: "File Storage", key: "storage_limit_mb", suffix: "MB" },
  { label: "Team Members", key: "team_members", icon: Building2 },
];

const boolFeatures: BoolFeature[] = [
  { label: "Bulk Import", key: "bulk_import" },
  { label: "Activity Log", key: "activity_log" },
  { label: "Smart Automation", key: "smart_automation" },
  { label: "AI Assistant", key: "ai_assistant" },
];

const featureGroups: {
  label: string;
  items: (
    | { type: "numeric"; key: string; label: string; suffix?: string; icon?: typeof ShoppingCart }
    | { type: "boolean"; key: string; label: string }
  )[];
}[] = [
  {
    label: "Usage Limits",
    items: [
      { type: "numeric", key: "order_limit", label: "Orders", icon: ShoppingCart },
      { type: "numeric", key: "expense_limit", label: "Expenses", icon: Package },
      { type: "numeric", key: "product_limit", label: "Products", icon: FileText },
      { type: "numeric", key: "quotation_limit", label: "Quotations", icon: FileText },
      { type: "numeric", key: "inventory_limit", label: "Inventory Items", icon: Package },
      { type: "numeric", key: "storage_limit_mb", label: "File Storage", suffix: "MB" },
    ],
  },
  {
    label: "Integrations",
    items: [
      { type: "numeric", key: "courier_accounts", label: "Courier Accounts", icon: HeartHandshake },
      { type: "numeric", key: "whatsapp_templates", label: "WhatsApp Templates", icon: MessageCircle },
    ],
  },
  {
    label: "Collaboration",
    items: [
      { type: "numeric", key: "team_members", label: "Team Members", icon: Building2 },
      { type: "boolean", key: "activity_log", label: "Activity Log" },
    ],
  },
  {
    label: "Advanced",
    items: [
      { type: "boolean", key: "bulk_import", label: "Bulk Import" },
      { type: "boolean", key: "smart_automation", label: "Smart Automation" },
      { type: "boolean", key: "ai_assistant", label: "AI Assistant" },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════
// ADMIN SETTINGS TYPE
// ══════════════════════════════════════════════════════════════════════

interface AdminSettings {
  company_name: string;
  company_address: string;
  company_phone: string;
  support_email: string;
  support_whatsapp: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_branch: string;
  trial_duration_days: number;
  payment_instructions: string;
}

const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  company_name: "BizRavana",
  company_address: "",
  company_phone: "",
  support_email: "",
  support_whatsapp: "94750350109",
  bank_name: "Commercial Bank of Ceylon",
  bank_account_name: "BizRavana Technologies",
  bank_account_number: "1234567890",
  bank_branch: "Colombo 01",
  trial_duration_days: 3,
  payment_instructions: "",
};

// ══════════════════════════════════════════════════════════════════════
// STORAGE BUCKET
// ══════════════════════════════════════════════════════════════════════

const PAYMENT_PROOF_BUCKET = "payment-proofs";

// ══════════════════════════════════════════════════════════════════════
// SUBSCRIPTION PAGE
// ══════════════════════════════════════════════════════════════════════

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [usage, setUsage] = useState<UsageCounts | null>(null);
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);

  // Payment proof upload
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [notes, setNotes] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upgrade dialog state
  const [upgradePlan, setUpgradePlan] = useState<SubscriptionPlan | null>(null);

  // Success dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [uploadedPlanName, setUploadedPlanName] = useState("");
  // Preserved for WhatsApp notification (not cleared by form reset)
  const [whatsappPlanName, setWhatsappPlanName] = useState("");
  const [whatsappAmount, setWhatsappAmount] = useState(0);

  // Mobile comparison sheet
  const [comparisonSheetOpen, setComparisonSheetOpen] = useState(false);

  // Mobile card scroll tracking
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Copy feedback
  const [copied, setCopied] = useState(false);

  const isMobile = useIsMobile();
  const supabase = useMemo(() => createClient(), []);

  // ── Handle card scroll snap tracking ──
  const handleCardsScroll = useCallback(() => {
    const container = cardsContainerRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.clientWidth;
    const idx = Math.round(scrollLeft / cardWidth);
    setActiveCardIndex(Math.min(idx, plans.filter((p) => p.name !== "Trial").length - 1));
  }, [plans]);

  // ── Fetch all data ──
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("user_id", user.id)
        .single();

      if (!profile?.business_id) return;

      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", profile.business_id)
        .single();

      if (biz) {
        setBusiness(biz);
        setBusinessName(biz.name);
      }

      const { data: plansData } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (plansData) setPlans(plansData);

      if (biz?.plan_id) {
        const { data: planData } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("id", biz.plan_id)
          .single();
        if (planData) setCurrentPlan(planData);
      }

      // Fetch admin settings (bank details, support WhatsApp, etc.)
      const { data: settingsData } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "admin_settings")
        .maybeSingle();

      if (settingsData?.value) {
        setAdminSettings({
          ...DEFAULT_ADMIN_SETTINGS,
          ...(settingsData.value as Partial<AdminSettings>),
        });
      }

      await fetchUsage(profile.business_id);

      const { data: proofsData } = await supabase
        .from("payment_proofs")
        .select("*")
        .eq("business_id", profile.business_id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (proofsData) setProofs(proofsData);
    } catch (err) {
      console.error("Error fetching subscription data:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchUsage = useCallback(async (businessId: string) => {
    try {
      const promises = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("business_id", businessId).is("deleted_at", null),
        supabase.from("expenses").select("id", { count: "exact", head: true }).eq("business_id", businessId).is("deleted_at", null),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("business_id", businessId).is("deleted_at", null).eq("is_active", true),
        supabase.from("quotations").select("id", { count: "exact", head: true }).eq("business_id", businessId).is("deleted_at", null),
        supabase.from("inventory_items").select("id", { count: "exact", head: true }).eq("business_id", businessId).is("deleted_at", null),
      ]);

      setUsage({
        orders: promises[0].count || 0,
        expenses: promises[1].count || 0,
        products: promises[2].count || 0,
        quotations: promises[3].count || 0,
        inventory: promises[4].count || 0,
        storage_mb: 0,
        team_members: 1,
        courier_accounts: 1,
        whatsapp_templates: 1,
      });
    } catch {
      // Silently fail
    }
  }, [supabase]);

  // ── Initial load ──
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Payment Proof Upload ──
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = () => setProofPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleUploadProof = useCallback(async () => {
    if (!proofFile || !amount || !selectedPlanId || !business?.id) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      const filePath = `proofs/${business.id}/${Date.now()}-${proofFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from(PAYMENT_PROOF_BUCKET)
        .upload(filePath, proofFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(PAYMENT_PROOF_BUCKET)
        .getPublicUrl(filePath);

      const { error: proofError } = await supabase
        .from("payment_proofs")
        .insert({
          business_id: business.id,
          plan_id: selectedPlanId,
          amount: parseFloat(amount),
          payment_method: paymentMethod,
          proof_image_url: publicUrl,
          notes: notes || null,
          status: "pending",
        });

      if (proofError) throw proofError;

      if (business.account_status === "trial" || business.account_status === "trial_expired") {
        await supabase
          .from("businesses")
          .update({ account_status: "pending_payment" })
          .eq("id", business.id);
        setBusiness((prev) => prev ? { ...prev, account_status: "pending_payment" } : null);
      }

      toast.success("Payment proof submitted successfully!");
      setUploadDialogOpen(false);

      // Save plan info in preserved state before form resets
      const selectedPlan = plans.find((p) => p.id === selectedPlanId);
      if (selectedPlan) {
        setUploadedPlanName(selectedPlan.name);
        setWhatsappPlanName(selectedPlan.name);
        setWhatsappAmount(parseFloat(amount));
        setSuccessDialogOpen(true);
      }

      resetUploadForm();

      const { data: proofsData } = await supabase
        .from("payment_proofs")
        .select("*")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (proofsData) setProofs(proofsData);
    } catch (err) {
      toast.error("Failed to upload payment proof", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setUploading(false);
    }
  }, [proofFile, amount, selectedPlanId, paymentMethod, notes, business, supabase, plans]);

  const resetUploadForm = () => {
    setProofFile(null);
    setProofPreview(null);
    setAmount("");
    setPaymentMethod("bank_transfer");
    setNotes("");
    setSelectedPlanId("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAdminWhatsApp = useCallback(() => {
    if (whatsappPlanName && whatsappAmount > 0) {
      const msg = [
        `*New Payment Receipt - BizRavana*`,
        ``,
        `Business: ${businessName || "—"}`,
        `Plan: ${whatsappPlanName}`,
        `Amount: Rs. ${whatsappAmount.toLocaleString()}`,
        ``,
        `Please review and approve.`,
      ].join("\n");
      window.open(`https://wa.me/${adminSettings.support_whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
    }
  }, [whatsappPlanName, whatsappAmount, businessName, adminSettings.support_whatsapp]);

  const handleCopyAccountNumber = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(adminSettings.bank_account_number);
      setCopied(true);
      toast.success("Account number copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [adminSettings.bank_account_number]);

  // ── Loading State ──
  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        {/* Hero skeleton */}
        <div className="rounded-2xl border border-border/40 bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="size-14 animate-pulse rounded-xl bg-muted/30" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-40 animate-pulse rounded-lg bg-muted/30" />
              <div className="h-4 w-64 animate-pulse rounded-lg bg-muted/20" />
              <div className="h-4 w-48 animate-pulse rounded-lg bg-muted/20" />
            </div>
          </div>
        </div>
        {/* Table skeleton */}
        <div className="h-72 animate-pulse rounded-2xl bg-muted/10" />
        {/* Usage skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/10" />
          ))}
        </div>
      </div>
    );
  }

  // Derived state
  const activePlan = currentPlan || (business?.account_status === "trial"
    ? plans.find((p) => p.name === "Trial")
    : plans.find((p) => p.sort_order === 1));

  const statusInfo = business ? getStatusVariant(business.account_status) : null;
  const StatusIcon = statusInfo?.icon || HelpCircle;
  const trialDays = business ? getDaysRemaining(business.trial_ends_at) : { days: 0, expired: false };
  const subDays = business ? getDaysRemaining(business.subscription_ends_at) : { days: 0, expired: false };
  const isTrial = business?.account_status === "trial";
  const isExpired = business?.account_status === "trial_expired" || business?.account_status === "expired";
  const isPendingPayment = business?.account_status === "pending_payment";
  const currentPlanName = currentPlan?.name || "Trial";
  const color = currentPlan ? getPlanColor(currentPlanName) : getPlanColor("trial");
  const PlanIcon = currentPlan ? getPlanIcon(currentPlanName) : Gift;

  const trialProgress = isTrial && business?.trial_ends_at
    ? Math.max(0, Math.min(100, Math.round(((3 - trialDays.days) / 3) * 100)))
    : 0;

  // Plans (excluding Trial for the pricing sections)
  const paidPlans = plans.filter((p) => p.name !== "Trial");

  // Mobile cards refs
  cardRefs.current = cardRefs.current.slice(0, paidPlans.length);

  return (
    <div className="space-y-8 p-4 sm:p-6 pb-24 sm:pb-6">
      {/* ═══════════════════════════════════════════════════════
          PAGE HEADER
         ═══════════════════════════════════════════════════════ */}
      <PageHeader
        title="Subscription"
        description="Manage your plan, view usage, and upload payment proofs."
      />

      {/* ═══════════════════════════════════════════════════════════════
          1. CURRENT SUBSCRIPTION HERO
         ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border/40 bg-hero shadow-sm"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,var(--hero-accent),transparent_32%),radial-gradient(circle_at_90%_20%,color-mix(in_srgb,var(--brand-accent)_22%,transparent),transparent_28%)]" />
        <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(oklch(1_0_0_/_0.16)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0_/_0.16)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute top-0 right-0 size-64 bg-gradient-to-bl from-primary/[0.03] to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-6 sm:p-8">
          {/* Expired Warning Banner */}
          {isExpired && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/[0.06] p-4">
              <XCircle className="size-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-destructive">Your subscription has expired</p>
                <p className="mt-0.5 text-sm text-muted-foreground/80">
                  Upgrade your plan to continue using BizRavana without interruption.
                </p>
              </div>
            </div>
          )}

          {/* Pending Payment Banner */}
          {isPendingPayment && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/[0.06] p-4">
              <Clock className="size-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-warning">Payment pending review</p>
                <p className="mt-0.5 text-sm text-muted-foreground/80">
                  Your payment proof is being reviewed by the admin. You will be notified once approved.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-5">
              {/* Plan icon */}
              <div className={cn(
                "flex size-14 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset",
                color.bg,
                color.border,
              )}>
                <PlanIcon className="size-7" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {currentPlanName}
                  </h2>

                  {/* Status badge */}
                  {statusInfo && (
                    <span className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
                      statusInfo.variant === "success" && "bg-success/10 text-success",
                      statusInfo.variant === "warning" && "bg-warning/10 text-warning",
                      statusInfo.variant === "destructive" && "bg-destructive/10 text-destructive",
                      statusInfo.variant === "default" && "bg-muted text-muted-foreground",
                      statusInfo.variant === "info" && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                    )}>
                      <StatusIcon className="size-3.5" />
                      {statusInfo.label}
                    </span>
                  )}
                </div>

                {/* Plan details */}
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                  {currentPlan && currentPlan.monthly_price > 0 && (
                    <span className="flex items-center gap-1.5 tabular-nums">
                      <Coins className="size-3.5 text-muted-foreground/70" />
                      <span className="font-medium text-foreground">Rs. {currentPlan.monthly_price.toLocaleString()}</span>
                      <span className="text-muted-foreground/80">/month</span>
                    </span>
                  )}

                  {currentPlan && currentPlan.monthly_price === 0 && (
                    <span className="flex items-center gap-1.5 text-muted-foreground/80">
                      Custom pricing
                    </span>
                  )}

                  {business?.subscription_ends_at && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-muted-foreground/70" />
                      Renews {formatDate(business.subscription_ends_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {isExpired && (
                <Button
                  variant="default"
                  onClick={() => {
                    const firstPaid = paidPlans[0];
                    if (firstPaid) setUpgradePlan(firstPaid);
                  }}
                >
                  <Sparkles className="size-3.5 mr-1.5" />
                  Upgrade Now
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://wa.me/${adminSettings.support_whatsapp}`, "_blank")}
              >
                <MessageCircle className="size-3.5 mr-1.5" />
                Contact Support
              </Button>
            </div>
          </div>

          {/* Trial Progress Bar */}
          {isTrial && business?.trial_ends_at && (
            <div className="mt-6 border-t border-border/20 pt-5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Hourglass className="size-4 text-primary/60" />
                  <span className="text-sm font-medium text-foreground/80">Trial Period</span>
                </div>
                <span className={cn(
                  "text-sm font-semibold tabular-nums",
                  trialDays.expired ? "text-destructive" : trialDays.days <= 1 ? "text-warning" : "text-foreground"
                )}>
                  {trialDays.expired
                    ? "Expired"
                    : `${trialDays.days} day${trialDays.days === 1 ? "" : "s"} remaining`
                  }
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={trialProgress}
                  className={cn(
                    "h-2 rounded-full",
                    trialDays.days <= 1 && "[&>div]:bg-warning",
                    trialDays.expired && "[&>div]:bg-destructive",
                  )}
                />
                <div className="flex justify-between mt-1.5">
                  <span className="text-sm text-muted-foreground/70">Started</span>
                  <span className="text-sm text-muted-foreground/70 tabular-nums">
                    Day {Math.min(3, 3 - trialDays.days + 1)} of 3
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          2. USAGE OVERVIEW
         ═══════════════════════════════════════════════════════════════ */}
      {usage && activePlan && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl glass-card overflow-hidden"
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="size-4 text-muted-foreground/70" />
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Usage Overview
                </h3>
              </div>
              <span className="text-sm text-muted-foreground/70">
                Plan: {activePlan.name}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <UsageMeter
                label="Orders"
                used={usage.orders}
                limit={activePlan.order_limit}
                icon={ShoppingCart}
              />
              <UsageMeter
                label="Expenses"
                used={usage.expenses}
                limit={activePlan.expense_limit}
                icon={Package}
              />
              <UsageMeter
                label="Active Products"
                used={usage.products}
                limit={activePlan.product_limit}
                icon={FileText}
              />
              <UsageMeter
                label="Quotations"
                used={usage.quotations}
                limit={activePlan.quotation_limit}
                icon={FileText}
              />
              <UsageMeter
                label="Inventory Items"
                used={usage.inventory}
                limit={activePlan.inventory_limit}
                icon={Package}
              />
              <UsageMeter
                label="File Storage"
                used={usage.storage_mb}
                limit={activePlan.storage_limit_mb}
                suffix="MB"
                icon={ImageIcon}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          3. PRICING SECTION
         ═══════════════════════════════════════════════════════════════ */}

      {/* ── Section Label ── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/70">
            Pricing Plans
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground/60">
            {isMobile ? "Swipe through plans to compare" : "Compare features across all plans"}
          </p>
        </div>
      </div>

      {/* ── DESKTOP: Comparison Table ── */}
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="rounded-2xl glass-card overflow-hidden">
            {/* Fixed Header */}
            <div className="min-w-[820px]">
              <div className="grid grid-cols-[220px_repeat(4,1fr)] divide-x divide-border/20 border-b border-border/20 bg-card/95 backdrop-blur-sm">
                <div className="flex items-center px-5 py-5">
                  <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/70">Feature</span>
                </div>
                {paidPlans.map((plan) => {
                  const isCurrent = currentPlan?.id === plan.id;
                  const planColor = getPlanColor(plan.name);
                  return (
                    <div
                      key={plan.id}
                      className={cn(
                        "flex flex-col items-center justify-center px-4 py-5 text-center",
                        isCurrent && "bg-primary/[0.03]",
                        plan.name === "Standard" && "bg-primary/[0.10] ring-2 ring-primary/25 ring-inset",
                      )}
                    >
                      {/* Plan Name — Primary */}
                      <span className={cn(
                        "text-xl font-bold tracking-tight text-foreground",
                        isCurrent && "text-primary",
                      )}>
                        {plan.name}
                      </span>
                      {/* Price — Secondary */}
                      {plan.monthly_price > 0 ? (
                        <div className="mt-2 flex items-baseline gap-0.5">
                          <span className="text-lg font-semibold text-foreground tabular-nums">
                            Rs. {plan.monthly_price.toLocaleString()}
                          </span>
                          <span className="text-sm text-muted-foreground">/mo</span>
                        </div>
                      ) : (
                        <span className="mt-2 text-lg font-semibold text-foreground/80">Custom</span>
                      )}
                      {/* Badge — Tertiary */}
                      {plan.name === "Standard" && !isCurrent && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                          <Sparkles className="size-3" />
                          Most Popular
                        </span>
                      )}
                      {isCurrent && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-sm font-semibold text-success">
                          <BadgeCheck className="size-3" />
                          Current
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sticky CTA Row */}
            <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-y border-border/20">
              <div className="min-w-[820px]">
                <div className="grid grid-cols-[220px_repeat(4,1fr)] divide-x divide-border/20">
                  <div className="px-5 py-4" />
                  {paidPlans.map((plan) => {
                    const isCurrent = currentPlan?.id === plan.id;
                    const isUpgrade = !isCurrent && (plan.sort_order > (currentPlan?.sort_order || 0));
                    return (
                      <div key={plan.id} className="flex items-center justify-center px-4 py-4">
                        {isCurrent ? (
                          <Button variant="outline" className="w-full max-w-[160px]" disabled>
                            <BadgeCheck className="size-3.5 mr-1.5" />
                            Current
                          </Button>
                        ) : plan.name === "Enterprise" ? (
                          <Button
                            variant="outline"
                            className="w-full max-w-[160px]"                            onClick={() => window.open(`https://wa.me/${adminSettings.support_whatsapp}`, "_blank")}
                        >
                            <MessageCircle className="size-3.5 mr-1.5" />
                            Contact Sales
                          </Button>
                        ) : plan.name === "Standard" ? (
                          <Button
                            variant="default"
                            className="w-full max-w-[160px] shadow-sm shadow-primary/20 ring-1 ring-primary/30"
                            onClick={() => setUpgradePlan(plan)}
                          >
                            <Sparkles className="size-3.5 mr-1.5" />
                            {isUpgrade ? "Upgrade" : "Choose Plan"}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full max-w-[160px]"
                            onClick={() => setUpgradePlan(plan)}
                          >
                            {isUpgrade ? "Upgrade" : "Choose Plan"}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="max-h-[calc(100dvh_-_22rem)] overflow-y-auto">
              <div className="min-w-[820px]">
                {featureGroups.map((group, gIdx) => (
                  <div key={group.label}>
                    {/* Group header */}
                    <div className={cn(
                      "bg-muted/8 px-5 py-2.5 border-b border-border/20",
                      gIdx > 0 && "border-t border-border/5 mt-1",
                    )}>
                      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">
                        {group.label}
                      </span>
                    </div>

                    {group.items.map((item) => (
                      <div
                        key={item.key}
                        className="grid grid-cols-[220px_repeat(4,1fr)] divide-x divide-border/20 border-b border-border/90 hover:bg-muted/5 transition-colors"
                      >
                        <div className="sticky left-0 z-10 flex items-center gap-2.5 px-5 py-3.5 border-r border-border/10">
                          {item.type === "numeric" && item.icon && (
                            <item.icon className="size-3.5 text-muted-foreground/60 shrink-0" />
                          )}
                          <span className="text-sm text-foreground/80">{item.label}</span>
                        </div>
                        {paidPlans.map((plan) => {
                          const isCurrent = currentPlan?.id === plan.id;
                          return (
                            <div
                              key={plan.id}
                              className={cn(
                                "flex items-center justify-center px-4 py-3.5",
                                isCurrent && "bg-primary/[0.02]",
                                plan.name === "Standard" && "bg-primary/[0.08]",
                              )}
                            >
                              {item.type === "numeric" ? (
                                (() => {
                                  const val = plan[item.key as keyof typeof plan] as number;
                                  const isUnlimited = val >= 999999;
                                  return isUnlimited ? (
                                    <Infinity className="size-4 text-muted-foreground/60" />
                                  ) : (
                                    <span className="text-sm font-semibold tabular-nums text-foreground/90">
                                      {val.toLocaleString()}{item.suffix ? ` ${item.suffix}` : ""}
                                    </span>
                                  );
                                })()
                              ) : (
                                (plan[item.key as keyof typeof plan] as boolean) ? (
                                  <CheckCircle2 className="size-4 text-success" />
                                ) : (
                                  <X className="size-4 text-muted-foreground/50" />
                                )
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}


              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── MOBILE: Swipeable Pricing Cards ── */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Cards container */}
          <div
            ref={cardsContainerRef}
            onScroll={handleCardsScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 px-4 pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {paidPlans.map((plan, idx) => {
              const isCurrent = currentPlan?.id === plan.id;
              const planColor = getPlanColor(plan.name);
              const Icon = getPlanIcon(plan.name);
              const isUpgrade = !isCurrent && (plan.sort_order > (currentPlan?.sort_order || 0));

              return (
                <div
                  key={plan.id}
                  ref={(el) => { cardRefs.current[idx] = el; }}
                  className={cn(
                    "relative flex flex-col min-w-[85vw] max-w-[320px] snap-start rounded-2xl border transition-all duration-200 shrink-0",
                    isCurrent
                      ? "border-primary/40 bg-primary/[0.04] shadow-md shadow-primary/5 ring-1 ring-primary/10"
                      : "glass-card",
                  )}
                >
                  {/* Popular badge */}
                  {plan.name === "Standard" && !isCurrent && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-sm">
                        <Sparkles className="size-3" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Current badge */}
                  {isCurrent && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">
                        <BadgeCheck className="size-3" />
                        Current
                      </span>
                    </div>
                  )}

                  {/* Header */}
                  <div className={cn("p-5 rounded-t-2xl", planColor.light)}>
                    <div className={cn("inline-flex size-10 items-center justify-center rounded-xl mb-3", planColor.bg)}>
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                    <div className="mt-1.5 flex items-baseline gap-1">
                      <span className="text-2xl font-bold tracking-tight text-foreground">
                        {plan.monthly_price > 0 ? `Rs. ${plan.monthly_price.toLocaleString()}` : "Custom"}
                      </span>
                      {plan.monthly_price > 0 && (
                        <span className="text-sm text-muted-foreground/80">/mo</span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex-1 p-5 space-y-3">
                    {planFeatures.map((feat) => {
                      const val = plan[feat.key] as number;
                      const isUnlimited = val >= 999999;
                      return (
                        <div key={feat.key} className="flex items-center justify-between gap-2">
                          <span className="text-sm text-foreground/80">{feat.label}</span>
                          <span className="text-sm font-semibold text-foreground tabular-nums">
                            {isUnlimited ? "Unlimited" : `${val.toLocaleString()}${feat.suffix ? ` ${feat.suffix}` : ""}`}
                          </span>
                        </div>
                      );
                    })}

                    <Separator className="my-2" />

                    {boolFeatures.map((feat) => {
                      const enabled = plan[feat.key] as boolean;
                      return (
                        <div key={feat.key} className="flex items-center justify-between gap-2">
                          <span className="text-sm text-foreground/80">{feat.label}</span>
                          {enabled ? (
                            <CheckCircle2 className="size-4 text-success" />
                          ) : (
                            <X className="size-3.5 text-muted-foreground/50" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Action */}
                  <div className="px-5 pb-5">
                    {isCurrent ? (
                      <Button variant="outline" className="w-full" disabled>
                        <BadgeCheck className="size-3.5 mr-1.5" />
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        variant={plan.name === "Basic" ? "outline" : "default"}
                        className="w-full"
                        onClick={() => setUpgradePlan(plan)}
                      >
                        {isUpgrade ? "Upgrade" : "Choose Plan"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dot Indicators */}
          {paidPlans.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {paidPlans.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const container = cardsContainerRef.current;
                    if (container) {
                      container.scrollTo({
                        left: idx * container.clientWidth,
                        behavior: "smooth",
                      });
                    }
                  }}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    idx === activeCardIndex
                      ? "size-2 bg-primary"
                      : "size-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                  )}
                  aria-label={`View ${paidPlans[idx]?.name} plan`}
                />
              ))}
            </div>
          )}

          {/* Compare Plans Button */}
          <div className="mt-3 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setComparisonSheetOpen(true)}
            >
              <LayoutList className="size-3.5 mr-1.5" />
              Compare Plans
            </Button>
          </div>

          {/* ── MOBILE COMPARISON SHEET ── */}
          <Sheet open={comparisonSheetOpen} onOpenChange={setComparisonSheetOpen}>
            <SheetContent side="bottom" className="h-[85dvh] p-0 rounded-t-2xl">
              <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/20">
                <SheetTitle>Compare Plans</SheetTitle>
                <SheetDescription>Side-by-side feature comparison</SheetDescription>
              </SheetHeader>

              <ScrollArea className="flex-1 h-full">
                <div className="min-w-[600px] p-5 pt-3">
                  {/* Header row */}
                  <div className="grid grid-cols-[160px_repeat(4,1fr)] divide-x divide-border/20 gap-px bg-border/10 rounded-xl overflow-hidden mb-4">
                    <div className="bg-card p-3" />
                    {paidPlans.map((plan) => {
                      const isCurrent = currentPlan?.id === plan.id;
                      const planColor = getPlanColor(plan.name);
                      return (
                        <div
                          key={plan.id}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 text-center",
                            isCurrent ? "bg-primary/[0.04]" : "bg-card",
                            plan.name === "Standard" && "bg-primary/[0.10] ring-2 ring-primary/25 ring-inset",
                          )}
                        >
                          {/* Plan Name */}
                          <span className={cn(
                            "text-base font-bold tracking-tight text-foreground",
                            isCurrent && "text-primary",
                          )}>
                            {plan.name}
                          </span>
                          {/* Price */}
                          <div className="mt-1 flex items-baseline gap-0.5">
                            <span className="text-sm font-semibold text-foreground tabular-nums">
                              Rs. {plan.monthly_price.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground">/mo</span>
                          </div>
                          {/* Badge */}
                          {isCurrent && (
                            <span className="mt-1.5 inline-flex items-center gap-0.5 rounded-full bg-success/10 px-1.5 py-0.5 text-xs font-semibold text-success">
                              Current
                            </span>
                          )}
                          {plan.name === "Standard" && !isCurrent && (
                            <span className="mt-1.5 inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                              Popular
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {featureGroups.map((group) => (
                    <div key={group.label} className="mb-3">
                      <div className="px-3 py-1.5 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">{group.label}</span>
                      </div>
                      <div className="space-y-px">
                        {group.items.map((item) => (
                          <div key={item.key} className="grid grid-cols-[160px_repeat(4,1fr)] divide-x divide-border/20 gap-px">
                            <div className="flex items-center gap-2 bg-muted/10 px-3 py-2.5 rounded-l-lg">
                              <span className="text-sm text-muted-foreground/70">{item.label}</span>
                            </div>
                            {paidPlans.map((plan) => {
                              const isCurrent = currentPlan?.id === plan.id;
                              return (
                                <div
                                  key={plan.id}
                                  className={cn(
                                    "flex items-center justify-center px-2 py-2.5",
                                    isCurrent ? "bg-primary/[0.02]" : "bg-card",
                                    plan.name === "Standard" && "bg-primary/[0.5]",
                                  )}
                                >
                                  {item.type === "numeric" ? (
                                    (() => {
                                      const val = plan[item.key as keyof typeof plan] as number;
                                      const isUnlimited = val >= 999999;
                                      return isUnlimited ? (
                                        <Infinity className="size-3 text-muted-foreground/60" />
                                      ) : (
                                        <span className="text-sm font-semibold tabular-nums text-foreground/90">
                                          {val.toLocaleString()}
                                        </span>
                                      );
                                    })()
                                  ) : (
                                    (plan[item.key as keyof typeof plan] as boolean) ? (
                                      <CheckCircle2 className="size-3.5 text-success" />
                                    ) : (
                                      <X className="size-3.5 text-muted-foreground/50" />
                                    )
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </motion.div>
      )}



      {/* ═══════════════════════════════════════════════════════════════
          4. PAYMENT & BILLING
         ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center gap-2.5 mb-4">
          <CreditCard className="size-4 text-muted-foreground/70" />
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/70">
            Payment & Billing
          </h3>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* ── Bank Details Card ── */}
          <div className="rounded-2xl glass-card overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="size-4 text-primary" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">Bank Transfer Details</h4>
              </div>

              <div className="space-y-3">                    <div className="flex items-center justify-between rounded-xl border border-border/20 bg-muted/5 px-4 py-2.5">
                  <span className="text-sm text-muted-foreground/80">Bank</span>
                  <span className="text-sm font-medium text-foreground/90">{adminSettings.bank_name}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/20 bg-muted/5 px-4 py-2.5">
                  <span className="text-sm text-muted-foreground/80">Account Name</span>
                  <span className="text-sm font-medium text-foreground/90">{adminSettings.bank_account_name}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/20 bg-muted/5 px-4 py-2.5">
                  <span className="text-sm text-muted-foreground/80">Account Number</span>
                  <span className="flex items-center gap-2">
                    <code className="text-sm font-semibold text-foreground tracking-wider">{adminSettings.bank_account_number}</code>
                    <button
                      type="button"
                      onClick={handleCopyAccountNumber}
                      className="flex size-6 items-center justify-center rounded-md hover:bg-muted transition-colors"
                      aria-label="Copy account number"
                    >
                      {copied ? (
                        <CheckCircle2 className="size-3.5 text-success" />
                      ) : (
                        <Copy className="size-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/20 bg-muted/5 px-4 py-2.5">
                  <span className="text-sm text-muted-foreground/80">Branch</span>
                  <span className="text-sm font-medium text-foreground/90">{adminSettings.bank_branch}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAccountNumber}
                >
                  <Copy className="size-3 mr-1.5" />
                  {copied ? "Copied!" : "Copy Number"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://wa.me/${adminSettings.support_whatsapp}`, "_blank")}
                >
                  <Download className="size-3 mr-1.5" />
                  Download Instructions
                </Button>
              </div>
            </div>
          </div>

          {/* ── Payment Proof Card ── */}
          <div className="rounded-2xl glass-card overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <Upload className="size-4 text-primary" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">Payment Proof</h4>
              </div>

              {/* Status */}
              {proofs.length > 0 ? (
                <div className="rounded-xl border border-border/20 bg-muted/5 p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex size-10 items-center justify-center rounded-lg",
                      proofs[0].status === "approved" && "bg-success/10",
                      proofs[0].status === "rejected" && "bg-destructive/10",
                      proofs[0].status === "pending" && "bg-warning/10",
                    )}>
                      {proofs[0].status === "approved" ? (
                        <CheckCircle2 className="size-5 text-success" />
                      ) : proofs[0].status === "rejected" ? (
                        <XCircle className="size-5 text-destructive" />
                      ) : (
                        <Clock className="size-5 text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {proofs[0].status === "approved" ? "Approved" :
                         proofs[0].status === "rejected" ? "Rejected" :
                         "Pending Review"}
                      </p>
                      <p className="text-sm text-muted-foreground/80">
                        Rs. {proofs[0].amount.toLocaleString()} · {new Date(proofs[0].created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {proofs[0].proof_image_url && (
                      <a
                        href={proofs[0].proof_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                        aria-label="View receipt"
                      >
                        <Eye className="size-4 text-muted-foreground" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/20 bg-muted/5 p-4 mb-4">
                  <div className="flex flex-col items-center gap-2 text-center">                     <Upload className="size-6 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground/80">No payment proof uploaded yet</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  variant="gradient"
                  onClick={() => {
                    setSelectedPlanId(currentPlan?.id || paidPlans[0]?.id || "");
                    setAmount(currentPlan?.monthly_price?.toString() || "");
                    setUploadDialogOpen(true);
                  }}
                >
                  <Upload className="size-3.5 mr-1.5" />
                  Upload Payment Proof
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://wa.me/${adminSettings.support_whatsapp}`, "_blank")}
                >
                  <MessageCircle className="size-3.5 mr-1.5" />
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          5. PAYMENT HISTORY
         ═══════════════════════════════════════════════════════════════ */}
      {proofs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl glass-card overflow-hidden"
        >
          <div className="p-5 sm:p-6">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/70 mb-4">
              Payment History
            </h4>

            {/* Desktop: Table */}
            {!isMobile && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/20">
                      <th className="pb-3 pr-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">Date</th>
                      <th className="pb-3 pr-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">Plan</th>
                      <th className="pb-3 pr-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">Amount</th>
                      <th className="pb-3 pr-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">Method</th>
                      <th className="pb-3 pr-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">Status</th>
                      <th className="pb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground/60">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proofs.map((proof) => {
                      const plan = plans.find((p) => p.id === proof.plan_id);
                      return (
                        <tr key={proof.id} className="border-b border-border/5 hover:bg-muted/5 transition-colors">
                          <td className="py-3 pr-4">
                            <span className="text-sm font-medium text-foreground/90 tabular-nums">
                              {new Date(proof.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-sm font-medium text-foreground/80">
                              {plan?.name || "—"}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-sm font-semibold text-foreground tabular-nums">
                              Rs. {proof.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-sm font-medium text-muted-foreground/80 capitalize">
                              {proof.payment_method?.replace("_", " ") || "—"}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-semibold",
                              proof.status === "approved" && "bg-success/10 text-success",
                              proof.status === "rejected" && "bg-destructive/10 text-destructive",
                              proof.status === "pending" && "bg-warning/10 text-warning",
                            )}>
                              {proof.status === "approved" ? <CheckCircle2 className="size-2.5" /> :
                               proof.status === "rejected" ? <XCircle className="size-2.5" /> :
                               <Clock className="size-2.5" />}
                              {proof.status.charAt(0).toUpperCase() + proof.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3">
                            {proof.proof_image_url && (
                              <a
                                href={proof.proof_image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                              >
                                <Eye className="size-3" />
                                View
                              </a>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile: Cards */}
            {isMobile && (
              <div className="space-y-2">
                {proofs.map((proof) => {
                  const plan = plans.find((p) => p.id === proof.plan_id);
                  return (
                    <div
                      key={proof.id}
                      className="flex items-center gap-3 rounded-xl border border-border/20 bg-muted/5 p-3.5"
                    >
                      <div className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg",
                        proof.status === "approved" && "bg-success/10",
                        proof.status === "rejected" && "bg-destructive/10",
                        proof.status === "pending" && "bg-warning/10",
                      )}>
                        {proof.status === "approved" ? <CheckCircle2 className="size-4 text-success" /> :
                         proof.status === "rejected" ? <XCircle className="size-4 text-destructive" /> :
                         <Clock className="size-4 text-warning" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">
                            Rs. {proof.amount.toLocaleString()}
                          </p>
                          <span className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-sm font-semibold",
                            proof.status === "approved" && "bg-success/10 text-success",
                            proof.status === "rejected" && "bg-destructive/10 text-destructive",
                            proof.status === "pending" && "bg-warning/10 text-warning",
                          )}>
                            {proof.status.charAt(0).toUpperCase() + proof.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">            <span className="text-sm text-muted-foreground/80">
              {new Date(proof.created_at).toLocaleDateString()}
            </span>
                          {plan && (
                            <>
                              <span className="text-sm text-muted-foreground/50">·</span>
                              <span className="text-sm text-muted-foreground/60">{plan.name}</span>
                            </>
                          )}
                          {proof.payment_method && (
                            <>
                              <span className="text-sm text-muted-foreground/50">·</span>
                              <span className="text-sm text-muted-foreground/60 capitalize">
                                {proof.payment_method.replace("_", " ")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {proof.proof_image_url && (
                        <a
                          href={proof.proof_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                          aria-label="View receipt"
                        >
                          <Eye className="size-3.5 text-muted-foreground" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          UPGRADE PLAN DIALOG (unchanged)
         ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={!!upgradePlan} onOpenChange={(open) => !open && setUpgradePlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade to {upgradePlan?.name}</DialogTitle>
            <DialogDescription>
              {upgradePlan?.monthly_price && upgradePlan.monthly_price > 0
                ? `Rs. ${upgradePlan.monthly_price.toLocaleString()}/month`
                : "Custom pricing — contact support"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-border/30 bg-muted/10 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
                Plan Features
              </h4>
              <div className="space-y-1.5">
                {upgradePlan && [
                  { label: "Orders", value: formatLimit(upgradePlan.order_limit) },
                  { label: "Expenses", value: formatLimit(upgradePlan.expense_limit) },
                  { label: "Products", value: formatLimit(upgradePlan.product_limit) },
                  { label: "Storage", value: upgradePlan.storage_limit_mb >= 999999 ? "Unlimited" : `${upgradePlan.storage_limit_mb} MB` },
                  { label: "Team Members", value: formatLimit(upgradePlan.team_members) },
                ].map((f) => (
                  <div key={f.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{f.label}</span>
                    <span className="font-medium text-foreground">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              To upgrade, please make a bank transfer and upload the payment proof. Once admin approves, your plan will be activated.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setUpgradePlan(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!upgradePlan) return;
                setSelectedPlanId(upgradePlan.id);
                setAmount(upgradePlan.monthly_price > 0 ? upgradePlan.monthly_price.toString() : "");
                setUpgradePlan(null);
                setUploadDialogOpen(true);
              }}
            >
              <Upload className="size-3.5 mr-1.5" />
              Upload Payment Proof
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════
          UPLOAD PAYMENT PROOF DIALOG (unchanged)
         ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={uploadDialogOpen} onOpenChange={(open) => {
        setUploadDialogOpen(open);
        if (!open) resetUploadForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Payment Proof</DialogTitle>
            <DialogDescription>
              Transfer the amount to our bank account and upload the receipt here.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Plan Selection */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/70">Select Plan</label>
              <select
                value={selectedPlanId}
                onChange={(e) => {
                  setSelectedPlanId(e.target.value);
                  const plan = plans.find((p) => p.id === e.target.value);
                  if (plan && plan.monthly_price > 0) setAmount(plan.monthly_price.toString());
                }}
                className="flex h-10 w-full rounded-xl border border-border/40 bg-transparent px-3 py-2 text-sm text-foreground"
              >
                <option value="">Select a plan</option>
                {plans.filter((p) => p.name !== "Trial").map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — Rs. {plan.monthly_price.toLocaleString()}/mo
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/70">Amount (Rs.)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1250"
                className="flex h-10 w-full rounded-xl border border-border/40 bg-transparent px-3 py-2 text-sm text-foreground"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/70">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-border/40 bg-transparent px-3 py-2 text-sm text-foreground"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash Deposit</option>
                <option value="online">Online Payment</option>
              </select>
            </div>

            {/* File Upload */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/70">Payment Receipt / Screenshot</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border/40 px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/[0.02]"
              >
                {proofPreview ? (
                  <img src={proofPreview} alt="Proof preview" className="max-h-32 rounded-lg object-contain" />
                ) : (
                  <>
                    <Upload className="size-8 text-muted-foreground/40" />
                    <span>Click to upload receipt image</span>
                    <span className="text-sm text-muted-foreground/40">PNG, JPG up to 5MB</span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="sr-only"
              />
              {proofFile && (
                <div className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-1.5">
                  <span className="text-sm text-muted-foreground truncate">{proofFile.name}</span>
                  <button
                    type="button"
                    onClick={() => { setProofFile(null); setProofPreview(null); }}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/70">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information..."
                rows={2}
                className="flex w-full rounded-xl border border-border/40 bg-transparent px-3 py-2 text-sm text-foreground resize-none"
              />
            </div>

            {/* WhatsApp notification info */}
            <div className="rounded-xl border border-border/20 bg-primary/[0.03] p-3">
              <div className="flex items-start gap-2.5">
                <MessageCircle className="size-4 text-primary/60 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground/80">WhatsApp Notification</p>
                  <p className="text-sm text-muted-foreground/60 mt-0.5">
                    A notification will be sent to the admin via WhatsApp with your payment details.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setUploadDialogOpen(false); resetUploadForm(); }}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleUploadProof}
              disabled={uploading || !proofFile || !amount || !selectedPlanId}
            >
              {uploading ? (
                <><Loader2 className="size-3.5 mr-1.5 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="size-3.5 mr-1.5" /> Submit Proof</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════
          SUCCESS DIALOG (new)
         ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <div className="flex flex-col items-center text-center py-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-success/10 mb-4">
              <CheckCircle2 className="size-8 text-success" />
            </div>
            <DialogTitle className="text-lg">Payment Proof Submitted!</DialogTitle>
            <DialogDescription className="mt-2 max-w-xs">
              Your payment for <span className="font-medium text-foreground">{uploadedPlanName}</span> plan
              is pending admin review. You will be notified once approved.
            </DialogDescription>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              variant="gradient"
              className="w-full"
              onClick={() => {
                setSuccessDialogOpen(false);
                handleAdminWhatsApp();
              }}
            >
              <MessageCircle className="size-3.5 mr-1.5" />
              Inform Admin on WhatsApp
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSuccessDialogOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// USAGE METER COMPONENT
// ══════════════════════════════════════════════════════════════════════

function UsageMeter({
  label,
  used,
  limit,
  suffix,
  icon: Icon,
}: {
  label: string;
  used: number;
  limit: number;
  suffix?: string;
  icon: typeof ShoppingCart;
}) {
  const percentage = limit > 0 && limit < 999999 ? Math.min(100, Math.round((used / limit) * 100)) : null;
  const isUnlimited = limit >= 999999;
  const isWarning = percentage !== null && percentage >= 80;
  const isDanger = percentage !== null && percentage >= 95;

  return (
    <div className="rounded-xl border border-border/20 bg-muted/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            "flex size-7 items-center justify-center rounded-lg shrink-0",
            isDanger ? "bg-destructive/10" : isWarning ? "bg-warning/10" : "bg-primary/10",
          )}>
            <Icon className={cn(
              "size-3.5",
              isDanger ? "text-destructive" : isWarning ? "text-warning" : "text-primary/70",
            )} />
          </div>
          <span className="text-sm font-medium text-foreground/80 truncate">{label}</span>
        </div>
        <span className={cn(
          "text-sm font-semibold tabular-nums shrink-0 ml-2",
          isDanger ? "text-destructive" : isWarning ? "text-warning" : "text-foreground/80",
        )}>
          {isUnlimited ? (
            <span className="flex items-center gap-1 text-muted-foreground/70">
              <Infinity className="size-3" />
            </span>
          ) : (
            <>{used.toLocaleString()} / {limit.toLocaleString()}{suffix ? ` ${suffix}` : ""}</>
          )}
        </span>
      </div>

      {!isUnlimited && percentage !== null && (
        <div className="space-y-1">
          <Progress
            value={percentage}
            className={cn(
              "h-1.5",
              isDanger && "[&>div]:bg-destructive",
              isWarning && !isDanger && "[&>div]:bg-warning",
            )}
          />
          <div className="flex justify-between">
            <span className={cn(
              "text-sm tabular-nums",
              isDanger ? "text-destructive" : isWarning ? "text-warning" : "text-muted-foreground/70",
            )}>
              {percentage}% used
            </span>
            <span className="text-sm text-muted-foreground/50 tabular-nums">
              {(100 - percentage)}% available
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
