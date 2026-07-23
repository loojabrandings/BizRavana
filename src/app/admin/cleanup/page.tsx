"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  Hourglass,
  Loader2,
  Plus,
  RefreshCw,
  Shield,
  Skull,
  Trash2,
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
import { useRouter } from "next/navigation";
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

interface CleanupBusiness {
  id: string;
  name: string;
  owner_name: string | null;
  owner_email: string | null;
  plan_name: string | null;
  account_status: string;
  expired_since: string | null;
  data_delete_after: string | null;
  deleted_at: string | null;
  created_at: string;
  orders_count: number;
  data_size_estimate: string | null;
}

type FilterTab = "scheduled" | "overdue" | "recently_deleted" | "all";

interface StatsSummary {
  total: number;
  scheduled: number;
  overdue: number;
  recentlyDeleted: number;
}

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════

function getDaysUntilDeletion(dateStr: string | null): { days: number; overdue: boolean } {
  if (!dateStr) return { days: 0, overdue: false };
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return { days, overdue: days <= 0 };
}

function getDaysSinceExpired(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; icon: typeof Clock; style: string }> = {
    expired: { label: "Expired", icon: Hourglass, style: "bg-destructive/10 text-destructive border-destructive/20" },
    trial_expired: { label: "Trial Expired", icon: Hourglass, style: "bg-warning/10 text-warning border-warning/20" },
    suspended: { label: "Suspended", icon: Ban, style: "bg-destructive/10 text-destructive border-destructive/20" },
    archived: { label: "Archived", icon: Database, style: "bg-muted/30 text-muted-foreground border-border/20" },
    deleted: { label: "Deleted", icon: Skull, style: "bg-muted/30 text-muted-foreground/60 border-border/20" },
  };
  const match = config[status];
  if (match) {
    const Icon = match.icon;
    return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold capitalize", match.style)}><Icon className="size-2.5" />{match.label}</span>;
  }
  return <span className="inline-flex items-center gap-1 rounded-full border border-border/20 bg-muted/30 px-2 py-0.5 text-xs font-semibold text-muted-foreground capitalize">{status.replace(/_/g, " ")}</span>;
}

function RetentionBadge({ days, overdue }: { days: number; overdue: boolean }) {
  if (overdue) return <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive"><AlertTriangle className="size-2.5" />Overdue by {Math.abs(days)}d</span>;
  if (days <= 3) return <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning"><Clock className="size-2.5" />{days} day{days !== 1 ? "s" : ""} left</span>;
  return <span className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-xs font-semibold text-success"><CheckCircle2 className="size-2.5" />{days} day{days !== 1 ? "s" : ""} left</span>;
}

function StatsCard({ label, value, icon: Icon, accent }: {
  label: string; value: string | number; icon: typeof Database;
  accent: "destructive" | "warning" | "default" | "primary";
}) {
  const accentStyles: Record<string, string> = {
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    default: "bg-muted/30 text-muted-foreground border-border/20",
    primary: "bg-primary/10 text-primary border-primary/20",
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/20 bg-card p-4">
      <div className={cn("flex size-10 items-center justify-center rounded-lg", accentStyles[accent])}><Icon className="size-5" /></div>
      <div><p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</p><p className="text-xs text-muted-foreground/70">{label}</p></div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// DIALOGS (unchanged)
// ══════════════════════════════════════════════════════════════════

function RetainDialog({ open, onOpenChange, business, onRetain, loading }: {
  open: boolean; onOpenChange: (open: boolean) => void;
  business: CleanupBusiness | null; onRetain: (days: number) => void; loading: boolean;
}) {
  const [days, setDays] = useState(14);
  const [customDays, setCustomDays] = useState(false);
  useEffect(() => { if (open) { setDays(14); setCustomDays(false); } }, [open]);
  if (!business) return null;
  const presets = [7, 14, 30, 60];
  const currentDeleteDate = business.data_delete_after ? new Date(business.data_delete_after).toLocaleDateString() : "—";
  const newDeleteDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 mb-2"><RefreshCw className="size-5 text-primary" /></div>
          <DialogTitle>Extend Data Retention</DialogTitle>
          <DialogDescription>Postpone data deletion for <strong>{business.name}</strong>.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-xl border border-border/20 bg-muted/5 p-3 space-y-1.5">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground/70">Current deletion</span><span className="font-medium text-foreground">{currentDeleteDate}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground/70">New deletion</span><span className="font-medium text-foreground">{newDeleteDate}</span></div>
          </div>
          <div><Label className="text-xs text-muted-foreground/70 mb-2 block">Retention Period</Label>
            <div className="grid grid-cols-4 gap-2">{presets.map((p) => (
              <button key={p} type="button" onClick={() => { setDays(p); setCustomDays(false); }}
                className={cn("rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                  !customDays && days === p ? "border-primary/50 bg-primary/5 text-primary ring-1 ring-primary/20" : "border-border/20 text-muted-foreground/70 hover:border-border/40 hover:text-foreground")}>{p}d</button>
            ))}</div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={customDays} onChange={(e) => setCustomDays(e.target.checked)} className="rounded border-border/40" /><span className="text-sm text-foreground/80">Custom</span></label>
            {customDays && <Input type="number" min={1} max={365} value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-24 h-9" />}
          </div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={() => onRetain(days)} disabled={loading}>{loading && <Loader2 className="size-4 animate-spin" />}Extend by {days} day{days !== 1 ? "s" : ""}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReactivateDialog({ open, onOpenChange, business, onReactivate, loading }: {
  open: boolean; onOpenChange: (open: boolean) => void;
  business: CleanupBusiness | null; onReactivate: () => void; loading: boolean;
}) {
  if (!business) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm"><DialogHeader><div className="flex size-10 items-center justify-center rounded-xl bg-success/10 mb-2"><RefreshCw className="size-5 text-success" /></div>
        <DialogTitle>Reactivate Business</DialogTitle><DialogDescription>Reactivate <strong>{business.name}</strong>. This clears the deletion schedule.</DialogDescription></DialogHeader>
        <div className="rounded-xl border border-border/20 bg-muted/5 p-3 space-y-1.5 my-2">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground/70">Business</span><span className="font-medium text-foreground">{business.name}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground/70">Status</span><StatusBadge status={business.account_status} /></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground/70">Scheduled deletion</span><span className="font-medium text-foreground">{business.data_delete_after ? new Date(business.data_delete_after).toLocaleDateString() : "—"}</span></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={onReactivate} disabled={loading}>{loading && <Loader2 className="size-4 animate-spin" />}Reactivate (7-Day Trial)</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════

export default function AdminCleanupPage() {
  const [businesses, setBusinesses] = useState<CleanupBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("scheduled");
  const [searchQuery, setSearchQuery] = useState("");
  const [retainTarget, setRetainTarget] = useState<CleanupBusiness | null>(null);
  const [retaining, setRetaining] = useState(false);
  const [reactivateTarget, setReactivateTarget] = useState<CleanupBusiness | null>(null);
  const [reactivating, setReactivating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CleanupBusiness | null>(null);
  const [clearTarget, setClearTarget] = useState<CleanupBusiness | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Mobile action sheet
  const [actionSheetTarget, setActionSheetTarget] = useState<CleanupBusiness | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  // ── Fetch Cleanup Queue ────────────────────────────────────────
  const fetchCleanupQueue = useCallback(async () => {
    try {
      setLoading(true);
      const selectFields = "id, name, owner_id, plan_id, account_status, trial_ends_at, subscription_ends_at, data_delete_after, deleted_at, created_at, updated_at";
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const [scheduledRes, deletedRes] = await Promise.all([
        supabase.from("businesses").select(selectFields).not("data_delete_after", "is", null).is("deleted_at", null).order("data_delete_after", { ascending: true }).limit(100),
        supabase.from("businesses").select(selectFields).not("deleted_at", "is", null).gt("deleted_at", thirtyDaysAgo).order("deleted_at", { ascending: false }).limit(50),
      ]);
      if (scheduledRes.error) throw scheduledRes.error;
      if (deletedRes.error) throw deletedRes.error;
      const data = [...(scheduledRes.data || []), ...(deletedRes.data || [])];

      const ownerIds = [...new Set(data.map((b) => b.owner_id))];
      const planIds = [...new Set(data.map((b) => b.plan_id).filter(Boolean))];
      const bizIds = data.map((b) => b.id);
      const [profilesRes, plansRes, emailMap] = await Promise.all([
        ownerIds.length > 0 ? supabase.from("profiles").select("user_id, full_name").in("user_id", ownerIds) : { data: [] },
        planIds.length > 0 ? supabase.from("subscription_plans").select("id, name").in("id", planIds) : { data: [] },
        fetchUserEmails(ownerIds),
      ]);
      const profileMap = new Map((profilesRes.data || []).map((p) => [p.user_id, p]));
      const planMap = new Map((plansRes.data || []).map((p) => [p.id, p.name]));

      const orderCountMap = new Map<string, number>();
      if (bizIds.length > 0) {
        const orderPromises = bizIds.map((id) => supabase.from("orders").select("*", { count: "exact", head: true }).eq("business_id", id).is("deleted_at", null));
        const orderResults = await Promise.all(orderPromises);
        orderResults.forEach((res, idx) => { if (res.count !== null) orderCountMap.set(bizIds[idx], res.count); });
      }

      const getExpiredSince = (b: typeof data[0]): string | null => {
        if (b.account_status === "trial_expired" && b.trial_ends_at) return b.trial_ends_at;
        if ((b.account_status === "expired" || b.account_status === "suspended") && b.subscription_ends_at) return b.subscription_ends_at;
        if (b.deleted_at) return b.deleted_at;
        return b.updated_at;
      };
      const estimateDataSize = (ordersCount: number): string | null => {
        if (ordersCount === 0) return null;
        if (ordersCount < 10) return "< 10 MB";
        if (ordersCount < 50) return "10–50 MB";
        if (ordersCount < 200) return "50–200 MB";
        return "> 200 MB";
      };

      const enriched: CleanupBusiness[] = data.map((b) => {
        const profile = profileMap.get(b.owner_id);
        const ordersCount = orderCountMap.get(b.id) || 0;
        return { id: b.id, name: b.name, owner_name: profile?.full_name || null, owner_email: emailMap[b.owner_id] || null,
          plan_name: b.plan_id ? planMap.get(b.plan_id) || null : null, account_status: b.account_status,
          expired_since: getExpiredSince(b), data_delete_after: b.data_delete_after, deleted_at: b.deleted_at,
          created_at: b.created_at, orders_count: ordersCount, data_size_estimate: estimateDataSize(ordersCount) };
      });
      setBusinesses(enriched);
    } catch (err) { console.error("Failed to fetch cleanup queue:", err); toast.error("Failed to load cleanup queue"); }
    finally { setLoading(false); }
  }, [supabase]);

  useEffect(() => { fetchCleanupQueue(); }, [fetchCleanupQueue]);

  // ── Stats ──────────────────────────────────────────────────────
  const stats: StatsSummary = useMemo(() => {
    const now = new Date();
    const scheduled = businesses.filter((b) => b.data_delete_after && !b.deleted_at && new Date(b.data_delete_after) > now).length;
    const overdue = businesses.filter((b) => b.data_delete_after && !b.deleted_at && new Date(b.data_delete_after) <= now).length;
    const recentlyDeleted = businesses.filter((b) => b.deleted_at).length;
    return { total: businesses.length, scheduled, overdue, recentlyDeleted };
  }, [businesses]);

  // ── Filtered ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = businesses;
    const now = new Date();
    if (activeTab === "scheduled") result = result.filter((b) => b.data_delete_after && !b.deleted_at && new Date(b.data_delete_after) > now);
    else if (activeTab === "overdue") result = result.filter((b) => b.data_delete_after && !b.deleted_at && new Date(b.data_delete_after) <= now);
    else if (activeTab === "recently_deleted") result = result.filter((b) => b.deleted_at);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((b) => b.name.toLowerCase().includes(q) || b.owner_name?.toLowerCase().includes(q) || b.owner_email?.toLowerCase().includes(q) || b.plan_name?.toLowerCase().includes(q));
    }
    return result;
  }, [businesses, activeTab, searchQuery]);

  // ── Handlers (unchanged) ──────────────────────────────────────
  const handleRetain = useCallback(async (days: number) => {
    if (!retainTarget) return; setRetaining(true);
    try { const extended = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      await supabase.from("businesses").update({ data_delete_after: extended.toISOString(), updated_at: new Date().toISOString() }).eq("id", retainTarget.id);
      toast.success(`Retention extended by ${days} days`); setRetainTarget(null); fetchCleanupQueue();
    } catch { toast.error("Failed to extend retention"); } finally { setRetaining(false); }
  }, [retainTarget, supabase, fetchCleanupQueue]);

  const handleReactivate = useCallback(async () => {
    if (!reactivateTarget) return; setReactivating(true);
    try { const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await supabase.from("businesses").update({ account_status: "trial", trial_started_at: new Date().toISOString(), trial_ends_at: trialEnd.toISOString(), data_delete_after: null, updated_at: new Date().toISOString() }).eq("id", reactivateTarget.id);
      toast.success(`Reactivated with 7-day trial`); setReactivateTarget(null); fetchCleanupQueue();
    } catch { toast.error("Failed to reactivate"); } finally { setReactivating(false); }
  }, [reactivateTarget, supabase, fetchCleanupQueue]);

  const handleDeleteNow = useCallback(async () => {
    if (!deleteTarget) return; setConfirmLoading(true);
    try { const now = new Date().toISOString();
      await supabase.from("businesses").update({ account_status: "deleted", deleted_at: now, updated_at: now }).eq("id", deleteTarget.id);
      toast.success(`Marked as deleted`); setDeleteTarget(null); fetchCleanupQueue();
    } catch { toast.error("Failed to delete"); } finally { setConfirmLoading(false); }
  }, [deleteTarget, supabase, fetchCleanupQueue]);

  const handleClearDeletion = useCallback(async () => {
    if (!clearTarget) return; setConfirmLoading(true);
    try { await supabase.from("businesses").update({ data_delete_after: null, updated_at: new Date().toISOString() }).eq("id", clearTarget.id);
      toast.success(`Deletion schedule cleared`); setClearTarget(null); fetchCleanupQueue();
    } catch { toast.error("Failed to clear schedule"); } finally { setConfirmLoading(false); }
  }, [clearTarget, supabase, fetchCleanupQueue]);

  // ── Mobile action sheet ──────────────────────────────────────
  const handleOpenActionSheet = useCallback((biz: CleanupBusiness) => {
    setActionSheetTarget(biz);
    setActionSheetOpen(true);
  }, []);

  const actionSheetActions: ActionSheetAction[] = useMemo(() => {
    if (!actionSheetTarget || actionSheetTarget.deleted_at) return [];
    return [
      { label: "Reactivate", onClick: () => { setReactivateTarget(actionSheetTarget); setActionSheetTarget(null); }, icon: <RefreshCw className="size-4" />, variant: "success" },
      { label: "Extend Retention", onClick: () => { setRetainTarget(actionSheetTarget); setActionSheetTarget(null); }, icon: <Plus className="size-4" /> },
      { label: "Clear Schedule", onClick: () => { setClearTarget(actionSheetTarget); setActionSheetTarget(null); }, icon: <Shield className="size-4" /> },
      { label: "Delete Now", onClick: () => { setDeleteTarget(actionSheetTarget); setActionSheetTarget(null); }, icon: <Trash2 className="size-4" />, variant: "destructive" },
    ];
  }, [actionSheetTarget]);

  // ── Desktop columns ─────────────────────────────────────────
  const columns: Column<CleanupBusiness>[] = useMemo(() => [
    { header: "Business", accessor: (biz) => {
      const isDeleted = !!biz.deleted_at;
      const { overdue } = getDaysUntilDeletion(biz.data_delete_after);
      const { days } = getDaysUntilDeletion(biz.data_delete_after);
      return (
        <div className="flex items-center gap-2.5">
          <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg",
            isDeleted ? "bg-muted/30" : overdue ? "bg-destructive/10" : days <= 3 ? "bg-warning/10" : "bg-primary/10")}>
            {isDeleted ? <Skull className="size-4 text-muted-foreground/50" /> : overdue ? <AlertTriangle className="size-4 text-destructive" /> : <Building2 className={cn("size-4", days <= 3 ? "text-warning" : "text-primary")} />}
          </div>
          <div className="min-w-0">
            <button type="button" onClick={() => router.push(`/admin/businesses/${biz.id}`)} className="text-sm font-medium text-foreground truncate max-w-[160px] hover:text-primary transition-colors text-left">{biz.name}</button>
            {biz.owner_name && <p className="text-[10px] text-muted-foreground/60 truncate max-w-[160px]">{biz.owner_name}{biz.owner_email ? ` · ${biz.owner_email}` : ""}</p>}
          </div>
        </div>
      );
    }},
    { header: "Status", hideBelow: "sm", accessor: (biz) => <StatusBadge status={biz.account_status} /> },
    { header: "Deletion Date", accessor: (biz) => {
      const { overdue } = getDaysUntilDeletion(biz.data_delete_after);
      const { days } = getDaysUntilDeletion(biz.data_delete_after);
      return biz.data_delete_after ? (
        <span className={cn("text-sm tabular-nums font-medium", overdue ? "text-destructive" : days <= 3 ? "text-warning" : "text-foreground/80")}>{new Date(biz.data_delete_after).toLocaleDateString()}</span>
      ) : biz.deleted_at ? (
        <span className="text-sm text-muted-foreground/60 tabular-nums">{new Date(biz.deleted_at).toLocaleDateString()}</span>
      ) : <span className="text-sm text-muted-foreground/50 italic">—</span>;
    }},
    { header: "Retention", hideBelow: "sm", accessor: (biz) => {
      if (!biz.data_delete_after || biz.deleted_at) return <span className="text-sm text-muted-foreground/50 italic">—</span>;
      const { days, overdue } = getDaysUntilDeletion(biz.data_delete_after);
      return <RetentionBadge days={days} overdue={overdue} />;
    }},
    { header: "Expired Since", hideBelow: "md", accessor: (biz) => {
      const expiredDaysAgo = getDaysSinceExpired(biz.expired_since);
      return expiredDaysAgo !== null ? <span className="text-sm text-muted-foreground/80 tabular-nums">{expiredDaysAgo} day{expiredDaysAgo !== 1 ? "s" : ""} ago</span> : <span className="text-sm text-muted-foreground/50 italic">—</span>;
    }},
    { header: "Orders", hideBelow: "lg", accessor: (biz) => <div><span className="text-sm tabular-nums text-muted-foreground/80">{biz.orders_count}</span>{biz.data_size_estimate && <p className="text-[10px] text-muted-foreground/60">{biz.data_size_estimate}</p>}</div> },
    { header: "", className: "w-44", headerClassName: "hidden sm:table-cell", accessor: (biz) => biz.deleted_at ? <span className="text-xs text-muted-foreground/50 italic">Deleted</span> : (
      <div className="flex items-center gap-0.5 max-lg:opacity-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon-xs" onClick={() => setReactivateTarget(biz)} title="Reactivate"><RefreshCw className="size-3.5 text-primary" /></Button>
        <Button variant="ghost" size="icon-xs" onClick={() => setRetainTarget(biz)} title="Extend retention"><Plus className="size-3.5 text-muted-foreground/60" /></Button>
        <Button variant="ghost" size="icon-xs" onClick={() => setClearTarget(biz)} title="Clear schedule"><Shield className="size-3.5 text-muted-foreground/60" /></Button>
        <Button variant="ghost" size="icon-xs" onClick={() => setDeleteTarget(biz)} title="Delete immediately"><Trash2 className="size-3.5 text-destructive/60" /></Button>
        <Button variant="ghost" size="icon-xs" onClick={() => router.push(`/admin/businesses/${biz.id}`)} title="View"><ExternalLink className="size-3.5 text-muted-foreground/60" /></Button>
      </div>
    )},
  ], [router]);

  // ── Mobile card renderer ─────────────────────────────────────
  const renderMobileCard = useCallback((biz: CleanupBusiness) => {
    const isDeleted = !!biz.deleted_at;
    const { days, overdue } = getDaysUntilDeletion(biz.data_delete_after);
    const expiredDaysAgo = getDaysSinceExpired(biz.expired_since);
    return (
      <AdminMobileRecordCard
        primary={biz.name}
        status={<StatusBadge status={biz.account_status} />}
        details={[
          ...(biz.owner_name ? [{ label: "Owner", value: <span>{biz.owner_name}</span> }] : []),
          { label: "Deletion Date", value: <span className={cn("tabular-nums font-medium", overdue ? "text-destructive" : days <= 3 ? "text-warning" : "")}>
            {biz.data_delete_after ? new Date(biz.data_delete_after).toLocaleDateString() : biz.deleted_at ? new Date(biz.deleted_at).toLocaleDateString() : "—"}</span> },
          { label: "Retention", value: biz.data_delete_after ? <RetentionBadge days={days} overdue={overdue} /> : <span className="italic text-muted-foreground/60">—</span> },
          ...(expiredDaysAgo !== null ? [{ label: "Expired", value: <span className="tabular-nums">{expiredDaysAgo} day{expiredDaysAgo !== 1 ? "s" : ""} ago</span> }] : []),
          { label: "Orders", value: <span>{biz.orders_count}{biz.data_size_estimate ? ` (${biz.data_size_estimate})` : ""}</span> },
        ]}
        actions={isDeleted ? <span className="text-xs text-muted-foreground/50 italic py-2">Deleted</span> : (
          <>
            <button type="button" onClick={() => router.push(`/admin/businesses/${biz.id}`)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium min-h-11 hover:bg-accent transition-colors">
              <ExternalLink className="size-3.5" /> View
            </button>
            <button type="button" onClick={() => handleOpenActionSheet(biz)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium min-h-11 hover:bg-primary/90 transition-colors">
              Manage
            </button>
          </>
        )}
      />
    );
  }, [router, handleOpenActionSheet]);

  // ── Tabs ──────────────────────────────────────────────────────
  const tabs = [
    { key: "scheduled", label: "Scheduled", count: stats.scheduled },
    { key: "overdue", label: "Overdue", count: stats.overdue },
    { key: "recently_deleted", label: "Recently Deleted", count: stats.recentlyDeleted },
    { key: "all", label: "All", count: stats.total },
  ];

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeTab !== "scheduled") count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [activeTab, searchQuery]);

  const handleClearFilters = useCallback(() => { setActiveTab("scheduled"); setSearchQuery(""); }, []);

  const emptyState = (
    <div className="flex flex-col items-center gap-2 py-4">
      <Database className="size-8 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground/60">
        {searchQuery ? "No businesses match your search." :
         activeTab === "scheduled" ? "No businesses scheduled for deletion. The queue is clean! 🎉" :
         activeTab === "overdue" ? "No overdue deletions." :
         activeTab === "recently_deleted" ? "No recently deleted businesses." : "The cleanup queue is empty."}
      </p>
    </div>
  );

  // ── Loading ───────────────────────────────────────────────────
  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground/50" /></div>;

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      <AdminPageHeader title="Cleanup Queue" subtitle="Manage expired accounts scheduled for automatic data deletion" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard label="Scheduled for Deletion" value={stats.scheduled} icon={CalendarClock} accent="warning" />
        <StatsCard label="Overdue" value={stats.overdue} icon={AlertTriangle} accent="destructive" />
        <StatsCard label="Recently Deleted" value={stats.recentlyDeleted} icon={Skull} accent="default" />
        <StatsCard label="Total in Queue" value={stats.total} icon={Database} accent="primary" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <AdminMobileTabs tabs={tabs} activeTab={activeTab} onTabChange={(k) => setActiveTab(k as FilterTab)} />
        <AdminSearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search businesses..." filterCount={activeFilterCount} onClearFilters={handleClearFilters} />
      </div>

      <AdminResponsiveTable<CleanupBusiness>
        columns={columns} data={filtered} keyExtractor={(b) => b.id}
        mobileCard={renderMobileCard} emptyState={emptyState}
      />

      {actionSheetTarget && !actionSheetTarget.deleted_at && (
        <AdminActionSheet
          open={actionSheetOpen} onOpenChange={(o) => { if (!o) { setActionSheetOpen(false); setActionSheetTarget(null); } }}
          title={actionSheetTarget.name} description="Cleanup actions" actions={actionSheetActions} />
      )}

      {/* Empty state hint */}
      {businesses.length === 0 && !loading && (
        <div className="rounded-2xl border border-border/20 bg-muted/10 p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2"><CheckCircle2 className="size-5 text-success" /><p className="text-sm font-semibold text-foreground/80">All Clear</p></div>
          <p className="text-sm text-muted-foreground/60">There are no accounts in the cleanup queue.</p>
        </div>
      )}

      <RetainDialog open={retainTarget !== null} onOpenChange={(o) => { if (!o) setRetainTarget(null); }} business={retainTarget} onRetain={handleRetain} loading={retaining} />
      <ReactivateDialog open={reactivateTarget !== null} onOpenChange={(o) => { if (!o) setReactivateTarget(null); }} business={reactivateTarget} onReactivate={handleReactivate} loading={reactivating} />

      <ConfirmDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)} onConfirm={handleDeleteNow}
        title="Delete Business Now" description={`Immediately soft-delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete Now" variant="destructive" loading={confirmLoading} />

      <ConfirmDialog open={clearTarget !== null} onOpenChange={() => setClearTarget(null)} onConfirm={handleClearDeletion}
        title="Clear Deletion Schedule" description={`Cancel scheduled deletion for "${clearTarget?.name}"? Data will be retained indefinitely.`}
        confirmLabel="Clear Schedule" loading={confirmLoading} />
    </div>
  );
}
