"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  Coins,
  Download,
  Eye,
  FileText,
  Loader2,
  MessageSquare,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

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

type PaymentStatus = "pending" | "approved" | "rejected";
type FilterTab = "all" | "pending" | "approved" | "rejected";

interface PaymentProofRow {
  id: string;
  business_id: string;
  business_name: string;
  plan_name: string;
  amount: number;
  payment_method: string;
  proof_image_url: string | null;
  notes: string | null;
  admin_note: string | null;
  status: PaymentStatus;
  created_at: string;
  approved_at: string | null;
}

interface StatsSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalRevenue: number;
}

// ══════════════════════════════════════════════════════════════════
// STATUS BADGE
// ══════════════════════════════════════════════════════════════════

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
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
// RECEIPT PREVIEW DIALOG (unchanged)
// ══════════════════════════════════════════════════════════════════

function ReceiptPreviewDialog({
  open,
  onOpenChange,
  imageUrl,
  businessName,
  amount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  businessName: string;
  amount: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="p-0 gap-0 overflow-hidden max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/20">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Payment Receipt — {businessName}</p>
            <p className="text-xs text-muted-foreground/70">Rs. {amount.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              const link = document.createElement("a");
              link.href = imageUrl;
              link.download = `receipt-${businessName.replace(/\s+/g, "-").toLowerCase()}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}>
              <Download className="size-3.5 mr-1.5" /> Download
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={() => onOpenChange(false)}>
              <X className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center bg-muted/20 p-6 overflow-auto max-h-[calc(90vh-8rem)]">
          <img src={imageUrl} alt={`Payment receipt for ${businessName}`}
            className="max-w-full max-h-[70vh] rounded-xl object-contain shadow-lg ring-1 ring-border/10" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════════
// REVIEW DIALOG (unchanged)
// ══════════════════════════════════════════════════════════════════

function ReviewDialog({
  open, onOpenChange, payment, action, onConfirm, loading,
}: {
  open: boolean; onOpenChange: (open: boolean) => void;
  payment: PaymentProofRow | null; action: "approve" | "reject";
  onConfirm: (adminNote: string) => void; loading: boolean;
}) {
  const [adminNote, setAdminNote] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (open) { setAdminNote(""); setTimeout(() => textareaRef.current?.focus(), 100); } }, [open]);
  if (!payment) return null;
  const isApprove = action === "approve";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <div className={cn("flex size-10 items-center justify-center rounded-xl mb-2", isApprove ? "bg-success/10" : "bg-destructive/10")}>
            {isApprove ? <CheckCircle2 className="size-5 text-success" /> : <XCircle className="size-5 text-destructive" />}
          </div>
          <DialogTitle>{isApprove ? "Approve Payment" : "Reject Payment"}</DialogTitle>
          <DialogDescription>
            {isApprove ? "This will activate the subscription for 30 days." : "This will mark the payment as rejected."}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border border-border/20 bg-muted/5 p-4 space-y-2 my-2">
          {[
            ["Business", payment.business_name],
            ["Plan", payment.plan_name],
            ["Amount", `Rs. ${payment.amount.toLocaleString()}`],
            ["Method", payment.payment_method.replace("_", " ")],
            ["Submitted", new Date(payment.created_at).toLocaleDateString()],
          ].map(([label, value]) => (
            <div key={label as string} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground/70">{label as string}</span>
              <span className="text-sm font-medium text-foreground">{value}</span>
            </div>
          ))}
          {payment.notes && (
            <div className="pt-2 border-t border-border/10">
              <span className="text-sm text-muted-foreground/70 block mb-1">Customer Note</span>
              <p className="text-sm text-foreground/80 italic">&ldquo;{payment.notes}&rdquo;</p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80 flex items-center gap-1.5">
            <MessageSquare className="size-3.5 text-muted-foreground/60" />
            Admin Note <span className="text-xs text-muted-foreground/50 font-normal">(optional)</span>
          </label>
          <Textarea ref={textareaRef}
            placeholder={isApprove ? "Add a note about this approval..." : "Provide a reason for rejection..."}
            value={adminNote} onChange={(e) => setAdminNote(e.target.value)} className="min-h-[80px] resize-none" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button variant={isApprove ? "default" : "destructive"} onClick={() => onConfirm(adminNote)} disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            {isApprove ? "Approve & Activate" : "Reject Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════════
// STATS CARD (unchanged)
// ══════════════════════════════════════════════════════════════════

function StatsCard({ label, value, icon: Icon, accent }: {
  label: string; value: string | number; icon: typeof Clock;
  accent: "warning" | "success" | "destructive" | "default";
}) {
  const accentStyles: Record<string, string> = {
    warning: "bg-warning/10 text-warning border-warning/20",
    success: "bg-success/10 text-success border-success/20",
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
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentProofRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("pending");
  const [searchQuery, setSearchQuery] = useState("");

  // Receipt preview
  const [previewPayment, setPreviewPayment] = useState<PaymentProofRow | null>(null);

  // Review dialog
  const [reviewPayment, setReviewPayment] = useState<PaymentProofRow | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve");
  const [processing, setProcessing] = useState(false);

  // Mobile action sheet
  const [actionSheetTarget, setActionSheetTarget] = useState<PaymentProofRow | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  // ── Fetch Payments ──────────────────────────────────────────
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const { data: proofs, error } = await supabase
        .from("payment_proofs").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;

      const bizIds = [...new Set((proofs || []).map((p) => p.business_id))];
      const planIds = [...new Set((proofs || []).map((p) => p.plan_id).filter(Boolean))];
      const [bizRes, planRes] = await Promise.all([
        supabase.from("businesses").select("id, name").in("id", bizIds),
        supabase.from("subscription_plans").select("id, name").in("id", planIds),
      ]);
      const bizMap = new Map((bizRes.data || []).map((b) => [b.id, b.name]));
      const planMap = new Map((planRes.data || []).map((p) => [p.id, p.name]));

      const enriched: PaymentProofRow[] = (proofs || []).map((p) => ({
        id: p.id, business_id: p.business_id,
        business_name: bizMap.get(p.business_id) || "Unknown",
        plan_name: p.plan_id ? planMap.get(p.plan_id) || "—" : "—",
        amount: p.amount, payment_method: p.payment_method,
        proof_image_url: p.proof_image_url, notes: p.notes, admin_note: p.admin_note,
        status: p.status as PaymentStatus, created_at: p.created_at, approved_at: p.approved_at,
      }));
      setPayments(enriched);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
      toast.error("Failed to load payment proofs");
    } finally { setLoading(false); }
  }, [supabase]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  // ── Stats ───────────────────────────────────────────────────
  const stats: StatsSummary = useMemo(() => ({
    total: payments.length,
    pending: payments.filter((p) => p.status === "pending").length,
    approved: payments.filter((p) => p.status === "approved").length,
    rejected: payments.filter((p) => p.status === "rejected").length,
    totalRevenue: payments.filter((p) => p.status === "approved").reduce((sum, p) => sum + p.amount, 0),
  }), [payments]);

  // ── Filtered ────────────────────────────────────────────────
  const filteredPayments = useMemo(() => {
    let result = payments;
    if (activeTab !== "all") result = result.filter((p) => p.status === activeTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.business_name.toLowerCase().includes(q) || p.plan_name.toLowerCase().includes(q) ||
          p.payment_method.toLowerCase().includes(q) || p.amount.toString().includes(q),
      );
    }
    return result;
  }, [payments, activeTab, searchQuery]);

  // ── Log Activity ────────────────────────────────────────────
  const logActivity = useCallback(async (action: string, targetBusinessId: string, details: Record<string, unknown>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("admin_activity_log").insert({ admin_id: user.id, action, target_type: "business", target_id: targetBusinessId, details });
    } catch { /* best-effort */ }
  }, [supabase]);

  // ── Approve ─────────────────────────────────────────────────
  const handleApprove = useCallback(async (adminNote: string) => {
    if (!reviewPayment) return;
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const now = new Date().toISOString();
      const subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from("payment_proofs").update({ status: "approved", approved_at: now, approved_by: user?.id || null, admin_note: adminNote || null }).eq("id", reviewPayment.id);
      await supabase.from("businesses").update({ account_status: "active", subscription_started_at: now, subscription_ends_at: subscriptionEnd, data_delete_after: null, updated_at: now }).eq("id", reviewPayment.business_id);
      await logActivity("payment_approved", reviewPayment.business_id, { payment_id: reviewPayment.id, amount: reviewPayment.amount, plan_name: reviewPayment.plan_name, admin_note: adminNote || null });
      toast.success("Payment approved! Subscription activated for 30 days.");
      setReviewPayment(null);
      fetchPayments();
    } catch (err) { console.error("Approve error:", err); toast.error("Failed to approve payment"); }
    finally { setProcessing(false); }
  }, [reviewPayment, supabase, logActivity, fetchPayments]);

  // ── Reject ──────────────────────────────────────────────────
  const handleReject = useCallback(async (adminNote: string) => {
    if (!reviewPayment) return;
    setProcessing(true);
    try {
      await supabase.from("payment_proofs").update({ status: "rejected", admin_note: adminNote || null }).eq("id", reviewPayment.id);
      await logActivity("payment_rejected", reviewPayment.business_id, { payment_id: reviewPayment.id, amount: reviewPayment.amount, plan_name: reviewPayment.plan_name, admin_note: adminNote || null });
      toast.success("Payment rejected.");
      setReviewPayment(null);
      fetchPayments();
    } catch { toast.error("Failed to reject payment"); }
    finally { setProcessing(false); }
  }, [reviewPayment, supabase, logActivity, fetchPayments]);

  // ── Mobile action sheet ─────────────────────────────────────
  const handleOpenActionSheet = useCallback((payment: PaymentProofRow) => {
    setActionSheetTarget(payment);
    setActionSheetOpen(true);
  }, []);

  const actionSheetActions: ActionSheetAction[] = useMemo(() => {
    if (!actionSheetTarget || actionSheetTarget.status !== "pending") return [];
    return [
      { label: "Approve Payment", onClick: () => { setReviewPayment(actionSheetTarget); setReviewAction("approve"); }, icon: <CheckCircle2 className="size-4" />, variant: "success" },
      { label: "Reject Payment", onClick: () => { setReviewPayment(actionSheetTarget); setReviewAction("reject"); }, icon: <XCircle className="size-4" />, variant: "destructive" },
    ];
  }, [actionSheetTarget]);

  // ── Desktop columns ─────────────────────────────────────────
  const columns: Column<PaymentProofRow>[] = useMemo(() => [
    { header: "Business", accessor: (p) => (
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="size-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate max-w-[140px]">{p.business_name}</p>
          {p.admin_note && <p className="text-[10px] text-muted-foreground/50 truncate max-w-[140px]">Note: {p.admin_note}</p>}
        </div>
      </div>
    )},
    { header: "Plan", accessor: (p) => <span className="text-sm text-muted-foreground/80">{p.plan_name}</span> },
    { header: "Amount", accessor: (p) => <span className="text-sm font-semibold tabular-nums text-foreground">Rs. {p.amount.toLocaleString()}</span> },
    { header: "Method", hideBelow: "sm", accessor: (p) => <span className="text-sm text-muted-foreground/80 capitalize">{p.payment_method.replace("_", " ")}</span> },
    { header: "Submitted", hideBelow: "md", accessor: (p) => <span className="text-sm text-muted-foreground/80 tabular-nums">{new Date(p.created_at).toLocaleDateString()}</span> },
    { header: "Status", accessor: (p) => <PaymentStatusBadge status={p.status} /> },
    { header: "Proof", accessor: (p) => p.proof_image_url ? (
      <Button variant="ghost" size="icon-xs" onClick={() => setPreviewPayment(p)} className="text-muted-foreground/60 hover:text-foreground" title="View receipt">
        <Eye className="size-3.5" />
      </Button>
    ) : <span className="text-xs text-muted-foreground/50">—</span> },
    { header: "", className: "w-32", headerClassName: "hidden sm:table-cell", accessor: (p) => p.status === "pending" ? (
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={() => { setReviewPayment(p); setReviewAction("approve"); }} className="h-8 px-2 text-success hover:text-success hover:bg-success/10 text-xs">
          <CheckCircle2 className="size-3.5 mr-1" /> Approve
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setReviewPayment(p); setReviewAction("reject"); }} className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs">
          <XCircle className="size-3.5 mr-1" /> Reject
        </Button>
      </div>
    ) : <span className="text-xs text-muted-foreground/60">{p.status === "approved" ? "Approved" : "Rejected"}{p.approved_at && <><br /><span className="text-[10px]">{new Date(p.approved_at).toLocaleDateString()}</span></>}</span> },
  ], []);

  // ── Mobile card renderer ────────────────────────────────────
  const renderMobileCard = useCallback((payment: PaymentProofRow) => (
    <AdminMobileRecordCard
      primary={payment.business_name}
      status={<PaymentStatusBadge status={payment.status} />}
      details={[
        { label: "Plan", value: <span className="font-medium">{payment.plan_name}</span> },
        { label: "Amount", value: <span className="font-semibold tabular-nums">Rs. {payment.amount.toLocaleString()}</span> },
        { label: "Method", value: <span className="capitalize">{payment.payment_method.replace("_", " ")}</span> },
        { label: "Submitted", value: <span className="tabular-nums">{new Date(payment.created_at).toLocaleDateString()}</span> },
        ...(payment.admin_note ? [{ label: "Admin Note", value: <span className="italic text-muted-foreground/70">{payment.admin_note}</span> }] : []),
        ...(payment.approved_at ? [{ label: "Reviewed", value: <span className="tabular-nums">{new Date(payment.approved_at).toLocaleDateString()}</span> }] : []),
      ]}
      actions={
        <>
          {payment.proof_image_url && (
            <button type="button" onClick={() => setPreviewPayment(payment)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium min-h-11 hover:bg-accent transition-colors">
              <Eye className="size-3.5" /> Receipt
            </button>
          )}
          {payment.status === "pending" ? (
            <button type="button" onClick={() => handleOpenActionSheet(payment)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium min-h-11 hover:bg-primary/90 transition-colors">
              Review
            </button>
          ) : (
            <span className="text-xs text-muted-foreground/60 italic py-2">
              {payment.status === "approved" ? "Approved" : "Rejected"}
            </span>
          )}
        </>
      }
    />
  ), [handleOpenActionSheet]);

  // ── Tabs ────────────────────────────────────────────────────
  const tabs = [
    { key: "all", label: "All", count: stats.total },
    { key: "pending", label: "Pending", count: stats.pending },
    { key: "approved", label: "Approved", count: stats.approved },
    { key: "rejected", label: "Rejected", count: stats.rejected },
  ];

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeTab !== "pending") count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [activeTab, searchQuery]);

  const handleClearFilters = useCallback(() => { setActiveTab("pending"); setSearchQuery(""); }, []);

  // ── Empty state ─────────────────────────────────────────────
  const emptyState = (
    <div className="flex flex-col items-center gap-2 py-4">
      <FileText className="size-8 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground/60">
        {searchQuery ? "No payments match your search." : activeTab === "pending" ? "No pending payments! 🎉" : `No ${activeTab !== "all" ? activeTab : ""} payments found.`}
      </p>
    </div>
  );

  // ── Loading ─────────────────────────────────────────────────
  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground/50" /></div>;

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      <AdminPageHeader title="Payment Proofs" subtitle="Review and manage payment submissions from businesses" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard label="Pending Review" value={stats.pending} icon={Clock} accent="warning" />
        <StatsCard label="Approved" value={stats.approved} icon={CheckCircle2} accent="success" />
        <StatsCard label="Rejected" value={stats.rejected} icon={XCircle} accent="destructive" />
        <StatsCard label="Total Revenue" value={`Rs. ${stats.totalRevenue.toLocaleString()}`} icon={Coins} accent="default" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <AdminMobileTabs tabs={tabs} activeTab={activeTab} onTabChange={(k) => setActiveTab(k as FilterTab)} />
        <AdminSearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search payments..." filterCount={activeFilterCount} onClearFilters={handleClearFilters} />
      </div>

      <AdminResponsiveTable<PaymentProofRow>
        columns={columns} data={filteredPayments} keyExtractor={(p) => p.id}
        mobileCard={renderMobileCard} emptyState={emptyState}
      />

      {actionSheetTarget && actionSheetTarget.status === "pending" && (
        <AdminActionSheet
          open={actionSheetOpen} onOpenChange={(o) => { if (!o) { setActionSheetOpen(false); setActionSheetTarget(null); } }}
          title={actionSheetTarget.business_name}
          description={`Rs. ${actionSheetTarget.amount.toLocaleString()} · ${actionSheetTarget.plan_name}`}
          actions={actionSheetActions}
        />
      )}

      {previewPayment?.proof_image_url && (
        <ReceiptPreviewDialog open={previewPayment !== null} onOpenChange={(o) => { if (!o) setPreviewPayment(null); }}
          imageUrl={previewPayment.proof_image_url} businessName={previewPayment.business_name} amount={previewPayment.amount} />
      )}

      {reviewPayment && (
        <ReviewDialog open={reviewPayment !== null} onOpenChange={(o) => { if (!o) setReviewPayment(null); }}
          payment={reviewPayment} action={reviewAction}
          onConfirm={(adminNote) => reviewAction === "approve" ? handleApprove(adminNote) : handleReject(adminNote)} loading={processing} />
      )}
    </div>
  );
}
