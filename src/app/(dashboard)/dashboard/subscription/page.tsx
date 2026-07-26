"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
type PayHerePayment = Database["public"]["Tables"]["payhere_payments"]["Row"];
type PayHereHistoryPayment = Pick<
  PayHerePayment,
  | "id"
  | "plan_id"
  | "amount"
  | "status"
  | "payment_method"
  | "order_id"
  | "payhere_payment_id"
  | "status_message"
  | "created_at"
>;

interface PaymentHistoryItem {
  id: string;
  planId: string | null;
  amount: number;
  statusLabel: string;
  methodLabel: string;
  reference: string | null;
  paymentId: string | null;
  note: string | null;
  createdAt: string;
  successful: boolean;
  failed: boolean;
}

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

// ══════════════════════════════════════════════════════════════════════
// SUBSCRIPTION PAGE
// ══════════════════════════════════════════════════════════════════════

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [usage, setUsage] = useState<UsageCounts | null>(null);
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [payHerePayments, setPayHerePayments] = useState<PayHereHistoryPayment[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);

  // Payment proof upload
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
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
  const selectedPaymentPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) || null,
    [plans, selectedPlanId],
  );
  const pendingPaymentProof = useMemo(
    () => proofs.find((proof) => proof.status === "pending") || null,
    [proofs],
  );
  const paymentHistory = useMemo<PaymentHistoryItem[]>(() => {
    const bankPayments: PaymentHistoryItem[] = proofs.map((proof) => ({
      id: `bank-${proof.id}`,
      planId: proof.plan_id,
      amount: proof.amount,
      statusLabel:
        proof.status === "pending" ? "Under review" : proof.status,
      methodLabel: "Bank transfer",
      reference: null,
      paymentId: null,
      note: proof.admin_note,
      createdAt: proof.created_at,
      successful: proof.status === "approved",
      failed: proof.status === "rejected",
    }));
    const cardPayments: PaymentHistoryItem[] = payHerePayments.map(
      (payment) => ({
        id: `payhere-${payment.id}`,
        planId: payment.plan_id,
        amount: payment.amount,
        statusLabel:
          payment.status === "success"
            ? "Successful"
            : payment.status === "created"
              ? "Started"
              : payment.status,
        methodLabel: payment.payment_method
          ? `Card · ${payment.payment_method}`
          : "Card · PayHere",
        reference: payment.order_id,
        paymentId: payment.payhere_payment_id,
        note: payment.status_message,
        createdAt: payment.created_at,
        successful: payment.status === "success",
        failed: [
          "canceled",
          "failed",
          "chargedback",
          "invalid",
        ].includes(payment.status),
      }),
    );

    return [...bankPayments, ...cardPayments].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [payHerePayments, proofs]);

  const openPaymentPage = useCallback(
    (planId?: string) => {
      const query = planId ? `?plan=${encodeURIComponent(planId)}` : "";
      router.push(`/dashboard/subscription/payment${query}`);
    },
    [router],
  );

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

      const [proofsResult, payHereResult] = await Promise.all([
        supabase
          .from("payment_proofs")
          .select("*")
          .eq("business_id", profile.business_id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("payhere_payments")
          .select(
            "id, plan_id, amount, status, payment_method, order_id, payhere_payment_id, status_message, created_at",
          )
          .eq("business_id", profile.business_id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (proofsResult.data) setProofs(proofsResult.data);
      if (payHereResult.data) setPayHerePayments(payHereResult.data);
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
  const resetUploadForm = useCallback(() => {
    setProofFile(null);
    setProofPreview(null);
    setNotes("");
    setSelectedPlanId("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, WEBP, or PDF receipt.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Receipt must be smaller than 5 MB.");
      e.target.value = "";
      return;
    }
    setProofFile(file);
    if (file.type === "application/pdf") {
      setProofPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProofPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleUploadProof = useCallback(async () => {
    if (!proofFile || !selectedPlanId || !selectedPaymentPlan) {
      toast.error("Please select a plan and attach your receipt.");
      return;
    }
    if (pendingPaymentProof) {
      toast.error("You already have a payment waiting for review.");
      return;
    }

    setUploading(true);
    try {
      const payload = new FormData();
      payload.set("planId", selectedPlanId);
      payload.set("notes", notes);
      payload.set("receipt", proofFile);

      const response = await fetch("/api/payments/bank-transfer", {
        method: "POST",
        body: payload,
      });
      const result = await response.json() as {
        error?: string;
        payment?: { planName: string; amount: number };
      };
      if (!response.ok || !result.payment) {
        throw new Error(result.error || "Payment submission failed.");
      }

      toast.success("Payment receipt submitted for review.");
      setUploadDialogOpen(false);
      setUploadedPlanName(result.payment.planName);
      setWhatsappPlanName(result.payment.planName);
      setWhatsappAmount(result.payment.amount);
      setSuccessDialogOpen(true);

      resetUploadForm();
      await fetchData();
    } catch (err) {
      toast.error("Failed to submit payment", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setUploading(false);
    }
  }, [proofFile, selectedPlanId, selectedPaymentPlan, pendingPaymentProof, notes, fetchData, resetUploadForm]);

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
                    if (firstPaid) openPaymentPage(firstPaid.id);
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
                          <Button
                            variant="outline"
                            className="w-full max-w-[160px]"
                            onClick={() => plan.name === "Enterprise"
                              ? router.push("/contact")
                              : openPaymentPage(plan.id)}
                          >
                            <CreditCard className="size-3.5 mr-1.5" />
                            {plan.name === "Enterprise" ? "Contact Sales" : "Renew"}
                          </Button>
                        ) : plan.name === "Enterprise" ? (
                          <Button
                            variant="outline"
                            className="w-full max-w-[160px]"
                            onClick={() => router.push("/contact")}
                        >
                            <MessageCircle className="size-3.5 mr-1.5" />
                            Contact Sales
                          </Button>
                        ) : plan.name === "Standard" ? (
                          <Button
                            variant="default"
                            className="w-full max-w-[160px] shadow-sm shadow-primary/20 ring-1 ring-primary/30"
                            onClick={() => openPaymentPage(plan.id)}
                          >
                            <Sparkles className="size-3.5 mr-1.5" />
                            {isUpgrade ? "Upgrade" : "Choose Plan"}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full max-w-[160px]"
                            onClick={() => openPaymentPage(plan.id)}
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
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => plan.name === "Enterprise"
                          ? router.push("/contact")
                          : openPaymentPage(plan.id)}
                      >
                        <CreditCard className="size-3.5 mr-1.5" />
                        {plan.name === "Enterprise" ? "Contact Sales" : "Renew Plan"}
                      </Button>
                    ) : (
                      <Button
                        variant={["Basic", "Enterprise"].includes(plan.name) ? "outline" : "default"}
                        className="w-full"
                        onClick={() => plan.name === "Enterprise"
                          ? router.push("/contact")
                          : openPaymentPage(plan.id)}
                      >
                        {plan.name === "Enterprise" ? (
                          <>
                            <MessageCircle className="size-3.5 mr-1.5" />
                            Contact Sales
                          </>
                        ) : (
                          isUpgrade ? "Upgrade" : "Choose Plan"
                        )}
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
             (hidden for now)
         ═══════════════════════════════════════════════════════════════ */}

      {/* ═══════════════════════════════════════════════════════════════
          5. PAYMENT HISTORY
             (hidden for now)
         ═══════════════════════════════════════════════════════════════ */}

      {/* ═══════════════════════════════════════════════════════════════
          UPGRADE PLAN DIALOG (unchanged)
         ═══════════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl border border-border/30 bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/20 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Payment History</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Your latest card and bank-transfer payments.</p>
          </div>
          <FileText className="size-5 text-muted-foreground/50" />
        </div>

        {paymentHistory.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-10 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted/20">
              <FileText className="size-5 text-muted-foreground/40" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">No payments submitted yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Your card payments and bank-transfer reviews will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/15">
            {paymentHistory.slice(0, 8).map((payment) => {
              const plan = plans.find((item) => item.id === payment.planId);
              return (
                <div key={payment.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg",
                      payment.successful
                        ? "bg-success/10 text-success"
                        : payment.failed
                          ? "bg-destructive/10 text-destructive"
                          : "bg-warning/10 text-warning",
                    )}>
                      {payment.successful
                        ? <CheckCircle2 className="size-4" />
                        : payment.failed
                          ? <XCircle className="size-4" />
                          : payment.methodLabel.startsWith("Card")
                            ? <CreditCard className="size-4" />
                            : <Clock className="size-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{plan?.name || "Subscription"} plan</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(payment.createdAt)} · {payment.methodLabel}
                      </p>
                      {payment.reference && (
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          Order: {payment.reference}
                        </p>
                      )}
                      {payment.paymentId && (
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                          PayHere ID: {payment.paymentId}
                        </p>
                      )}
                      {payment.note && (
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {payment.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 pl-12 sm:pl-0">
                    <p className="text-sm font-bold tabular-nums text-foreground">Rs. {payment.amount.toLocaleString()}</p>
                    <span className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
                      payment.successful
                        ? "border-success/20 bg-success/10 text-success"
                        : payment.failed
                          ? "border-destructive/20 bg-destructive/10 text-destructive"
                          : "border-warning/20 bg-warning/10 text-warning",
                    )}>
                      {payment.statusLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Dialog open={!!upgradePlan} onOpenChange={(open) => !open && setUpgradePlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {upgradePlan?.id === currentPlan?.id ? `Renew ${upgradePlan?.name}` : `Choose ${upgradePlan?.name}`}
            </DialogTitle>
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
              Pay the exact amount by bank transfer and upload the receipt. The plan will be activated for 30 days after admin approval.
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
                setUpgradePlan(null);
                setUploadDialogOpen(true);
              }}
            >
              <Upload className="size-3.5 mr-1.5" />
              Continue to Payment
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
            <DialogTitle>Pay by Bank Transfer</DialogTitle>
            <DialogDescription>
              Transfer the exact plan amount, then attach your receipt for verification.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {pendingPaymentProof && (
              <div className="flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/[0.06] p-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-warning" />
                <div>
                  <p className="text-sm font-semibold text-warning">Payment already under review</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Wait for the current payment to be approved or rejected before submitting another.
                  </p>
                </div>
              </div>
            )}

            {/* Plan Selection */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/70">Select Plan</label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                disabled={!!pendingPaymentProof}
                className="flex h-10 w-full rounded-xl border border-border/40 bg-transparent px-3 py-2 text-sm text-foreground"
              >
                <option value="">Select a plan</option>
                {plans.filter((p) => !["Trial", "Enterprise"].includes(p.name)).map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — Rs. {plan.monthly_price.toLocaleString()}/mo
                  </option>
                ))}
              </select>
            </div>

            {selectedPaymentPlan && (
              <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount to transfer</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{selectedPaymentPlan.name} plan · 30 days</p>
                </div>
                <p className="text-xl font-bold tabular-nums text-primary">
                  Rs. {selectedPaymentPlan.monthly_price.toLocaleString()}
                </p>
              </div>
            )}

            <div className="rounded-xl border border-border/30 bg-muted/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">{adminSettings.bank_name}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={handleCopyAccountNumber}>
                  {copied ? <CheckCircle2 className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                <span className="text-muted-foreground">Account name</span>
                <span className="text-right font-medium text-foreground">{adminSettings.bank_account_name}</span>
                <span className="text-muted-foreground">Account number</span>
                <span className="text-right font-semibold tabular-nums text-foreground">{adminSettings.bank_account_number}</span>
                <span className="text-muted-foreground">Branch</span>
                <span className="text-right font-medium text-foreground">{adminSettings.bank_branch || "—"}</span>
              </div>
              {adminSettings.payment_instructions && (
                <p className="mt-3 border-t border-border/20 pt-3 text-xs leading-relaxed text-muted-foreground">
                  {adminSettings.payment_instructions}
                </p>
              )}
            </div>

            {/* File Upload */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/70">Receipt or transfer confirmation</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!!pendingPaymentProof}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border/40 px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/[0.02] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {proofPreview ? (
                  <img src={proofPreview} alt="Proof preview" className="max-h-32 rounded-lg object-contain" />
                ) : proofFile ? (
                  <>
                    <FileText className="size-8 text-primary/70" />
                    <span className="font-medium text-foreground">{proofFile.name}</span>
                  </>
                ) : (
                  <>
                    <Upload className="size-8 text-muted-foreground/40" />
                    <span>Click to attach your receipt</span>
                    <span className="text-sm text-muted-foreground/40">JPG, PNG, WEBP, or PDF · maximum 5 MB</span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
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

            {/* Review information */}
            <div className="rounded-xl border border-border/20 bg-primary/[0.03] p-3">
              <div className="flex items-start gap-2.5">
                <Clock className="size-4 text-primary/60 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground/80">What happens next?</p>
                  <p className="text-sm text-muted-foreground/60 mt-0.5">
                    An admin will verify the receipt. Your selected plan is activated for 30 days after approval.
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
              disabled={uploading || !proofFile || !selectedPlanId || !!pendingPaymentProof}
            >
              {uploading ? (
                <><Loader2 className="size-3.5 mr-1.5 animate-spin" /> Submitting...</>
              ) : (
                <><Upload className="size-3.5 mr-1.5" /> Submit for Review</>
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
