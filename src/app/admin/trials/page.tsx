"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Clock,
  ExternalLink,
  Gift,
  Hourglass,
  Loader2,
  Lock,
  Plus,
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

interface TrialBusiness {
  id: string;
  name: string;
  owner_name: string | null;
  owner_email: string | null;
  plan_name: string | null;
  account_status: string;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  data_delete_after: string | null;
  created_at: string;
  orders_count: number;
}

type FilterTab = "active" | "expired" | "all";

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
  const isActive = status === "trial";
  const isExpired = status === "trial_expired";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold capitalize",
      isActive ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" :
      isExpired ? "bg-warning/10 text-warning border-warning/20" : "bg-muted text-muted-foreground border-border/20")}>
      {isActive ? <Clock className="size-2.5" /> : isExpired ? <Hourglass className="size-2.5" /> : null}
      {status.replace("_", " ")}
    </span>
  );
}

function StatsCard({ label, value, icon: Icon, accent }: {
  label: string; value: string | number; icon: typeof Clock;
  accent: "blue" | "warning" | "default";
}) {
  const accentStyles: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    warning: "bg-warning/10 text-warning border-warning/20",
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
// EXTEND TRIAL DIALOG (unchanged)
// ══════════════════════════════════════════════════════════════════

function ExtendTrialDialog({ open, onOpenChange, business, onExtend, loading }: {
  open: boolean; onOpenChange: (open: boolean) => void;
  business: TrialBusiness | null; onExtend: (days: number) => void; loading: boolean;
}) {
  const [days, setDays] = useState(3);
  const [customDays, setCustomDays] = useState(false);
  useEffect(() => { if (open) { setDays(3); setCustomDays(false); } }, [open]);
  if (!business) return null;
  const presets = [3, 7, 14, 30];
  const currentEnd = business.trial_ends_at ? new Date(business.trial_ends_at).toLocaleDateString() : "—";
  const newEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 mb-2">
            <Hourglass className="size-5 text-blue-500" />
          </div>
          <DialogTitle>Extend Trial</DialogTitle>
          <DialogDescription>Extend the trial period for <strong>{business.name}</strong>.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-xl border border-border/20 bg-muted/5 p-3 space-y-1.5">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground/70">Current ends</span><span className="font-medium text-foreground">{currentEnd}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground/70">New ends</span><span className="font-medium text-foreground">{newEnd}</span></div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground/70 mb-2 block">Duration</Label>
            <div className="grid grid-cols-4 gap-2">
              {presets.map((p) => (
                <button key={p} type="button" onClick={() => { setDays(p); setCustomDays(false); }}
                  className={cn("rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    !customDays && days === p ? "border-primary/50 bg-primary/5 text-primary ring-1 ring-primary/20" : "border-border/20 text-muted-foreground/70 hover:border-border/40 hover:text-foreground")}>{p} days</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={customDays} onChange={(e) => setCustomDays(e.target.checked)} className="rounded border-border/40" />
              <span className="text-sm text-foreground/80">Custom</span>
            </label>
            {customDays && <Input type="number" min={1} max={365} value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-24 h-9" placeholder="Days" />}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={() => onExtend(days)} disabled={loading}>{loading && <Loader2 className="size-4 animate-spin" />}Extend by {days} day{days !== 1 ? "s" : ""}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════

export default function AdminTrialsPage() {
  const [businesses, setBusinesses] = useState<TrialBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [extendTarget, setExtendTarget] = useState<TrialBusiness | null>(null);
  const [extending, setExtending] = useState(false);
  const [lockTarget, setLockTarget] = useState<TrialBusiness | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TrialBusiness | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Mobile action sheet
  const [actionSheetTarget, setActionSheetTarget] = useState<TrialBusiness | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchTrials = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("businesses")
        .select("id, name, owner_id, plan_id, account_status, trial_started_at, trial_ends_at, data_delete_after, created_at")
        .in("account_status", ["trial", "trial_expired"]).is("deleted_at", null)
        .order("created_at", { ascending: false }).limit(100);
      if (error) throw error;

      const ownerIds = [...new Set((data || []).map((b) => b.owner_id))];
      const planIds = [...new Set((data || []).map((b) => b.plan_id).filter(Boolean))];
      const [profilesRes, plansRes, emailMap] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name").in("user_id", ownerIds),
        supabase.from("subscription_plans").select("id, name").in("id", planIds),
        fetchUserEmails(ownerIds),
      ]);
      const profileMap = new Map((profilesRes.data || []).map((p) => [p.user_id, p]));
      const planMap = new Map((plansRes.data || []).map((p) => [p.id, p.name]));

      const bizIds = (data || []).map((b) => b.id);
      const orderCountMap = new Map<string, number>();
      if (bizIds.length > 0) {
        const orderPromises = bizIds.map((id) => supabase.from("orders").select("*", { count: "exact", head: true }).eq("business_id", id).is("deleted_at", null));
        const orderResults = await Promise.all(orderPromises);
        orderResults.forEach((res, idx) => { if (res.count !== null) orderCountMap.set(bizIds[idx], res.count); });
      }

      const enriched: TrialBusiness[] = (data || []).map((b) => {
        const profile = profileMap.get(b.owner_id);
        return { id: b.id, name: b.name,          owner_name: profile?.full_name || null, owner_email: emailMap[b.owner_id] || null,
          plan_name: b.plan_id ? planMap.get(b.plan_id) || null : null, account_status: b.account_status,
          trial_started_at: b.trial_started_at, trial_ends_at: b.trial_ends_at, data_delete_after: b.data_delete_after,
          created_at: b.created_at, orders_count: orderCountMap.get(b.id) || 0 };
      });
      setBusinesses(enriched);
    } catch (err) { console.error("Failed to fetch trials:", err); toast.error("Failed to load trial accounts"); }
    finally { setLoading(false); }
  }, [supabase]);

  useEffect(() => { fetchTrials(); }, [fetchTrials]);

  // ── Stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const active = businesses.filter((b) => b.account_status === "trial").length;
    const expired = businesses.filter((b) => b.account_status === "trial_expired").length;
    const expiringSoon = businesses.filter((b) => {
      if (!b.trial_ends_at || b.account_status !== "trial") return false;
      const { days } = getDaysRemaining(b.trial_ends_at);
      return days <= 3 && days > 0;
    }).length;
    return { active, expired, expiringSoon, total: businesses.length };
  }, [businesses]);

  // ── Filtered ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = businesses;
    if (activeTab === "active") result = result.filter((b) => b.account_status === "trial");
    else if (activeTab === "expired") result = result.filter((b) => b.account_status === "trial_expired");
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((b) => b.name.toLowerCase().includes(q) || b.owner_name?.toLowerCase().includes(q) || b.owner_email?.toLowerCase().includes(q) || b.plan_name?.toLowerCase().includes(q));
    }
    return result;
  }, [businesses, activeTab, searchQuery]);

  // ── Extend Trial ──────────────────────────────────────────────
  const handleExtend = useCallback(async (days: number) => {
    if (!extendTarget) return;
    setExtending(true);
    try {
      const extended = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      await supabase.from("businesses").update({ account_status: "trial", trial_ends_at: extended.toISOString(), data_delete_after: null, updated_at: new Date().toISOString() }).eq("id", extendTarget.id);
      toast.success(`Trial extended by ${days} days for "${extendTarget.name}"`);
      setExtendTarget(null); fetchTrials();
    } catch { toast.error("Failed to extend trial"); }
    finally { setExtending(false); }
  }, [extendTarget, supabase, fetchTrials]);

  // ── Lock ──────────────────────────────────────────────────────
  const handleLock = useCallback(async () => {
    if (!lockTarget) return;
    setConfirmLoading(true);
    try { await supabase.from("businesses").update({ account_status: "suspended", updated_at: new Date().toISOString() }).eq("id", lockTarget.id);
      toast.success(`"${lockTarget.name}" locked`); setLockTarget(null); fetchTrials(); }
    catch { toast.error("Failed to lock account"); }
    finally { setConfirmLoading(false); }
  }, [lockTarget, supabase, fetchTrials]);

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setConfirmLoading(true);
    try {
      const now = new Date().toISOString();
      await supabase.from("businesses").update({ account_status: "deleted", deleted_at: now, updated_at: now }).eq("id", deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`); setDeleteTarget(null); fetchTrials();
    } catch { toast.error("Failed to delete account"); }
    finally { setConfirmLoading(false); }
  }, [deleteTarget, supabase, fetchTrials]);

  // ── Mobile action sheet ──────────────────────────────────────
  const handleOpenActionSheet = useCallback((biz: TrialBusiness) => {
    setActionSheetTarget(biz);
    setActionSheetOpen(true);
  }, []);

  const actionSheetActions: ActionSheetAction[] = useMemo(() => {
    if (!actionSheetTarget) return [];
    return [
      { label: "Extend Trial", onClick: () => { setExtendTarget(actionSheetTarget); setActionSheetTarget(null); }, icon: <Plus className="size-4" /> },
      { label: "Lock Account", onClick: () => { setLockTarget(actionSheetTarget); setActionSheetTarget(null); }, icon: <Lock className="size-4" />, variant: "warning" },
      { label: "Delete Account", onClick: () => { setDeleteTarget(actionSheetTarget); setActionSheetTarget(null); }, icon: <Trash2 className="size-4" />, variant: "destructive" },
    ];
  }, [actionSheetTarget]);

  // ── Desktop columns ─────────────────────────────────────────
  const columns: Column<TrialBusiness>[] = useMemo(() => [
    { header: "Business", accessor: (biz) => (
      <div className="flex items-center gap-2.5">
        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", biz.account_status === "trial" ? "bg-blue-500/10" : "bg-warning/10")}>
          <Gift className={cn("size-4", biz.account_status === "trial" ? "text-blue-500" : "text-warning")} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate max-w-[180px]">{biz.name}</p>
          {biz.owner_name && <p className="text-[10px] text-muted-foreground/60 truncate max-w-[180px]">{biz.owner_name}{biz.owner_email ? ` · ${biz.owner_email}` : ""}</p>}
        </div>
      </div>
    )},
    { header: "Trial Started", hideBelow: "sm", accessor: (biz) => <span className="text-sm text-muted-foreground/80 tabular-nums">{biz.trial_started_at ? new Date(biz.trial_started_at).toLocaleDateString() : "—"}</span> },
    { header: "Trial Ends", accessor: (biz) => {
      const { expired } = getDaysRemaining(biz.trial_ends_at);
      return <span className={cn("text-sm tabular-nums", expired ? "text-destructive font-semibold" : "text-muted-foreground/80")}>{biz.trial_ends_at ? new Date(biz.trial_ends_at).toLocaleDateString() : "—"}</span>;
    }},
    { header: "Days Left", accessor: (biz) => {
      const { days, expired } = getDaysRemaining(biz.trial_ends_at);
      return biz.trial_ends_at ? (
        <span className={cn("inline-flex items-center gap-1 text-sm font-semibold tabular-nums", expired ? "text-destructive" : days <= 3 ? "text-warning" : "text-muted-foreground/80")}>
          {expired ? <><Hourglass className="size-3" /> 0</> : days}
        </span>
      ) : <span className="text-sm text-muted-foreground/50">—</span>;
    }},
    { header: "Orders", hideBelow: "md", accessor: (biz) => <span className="text-sm tabular-nums text-muted-foreground/80">{biz.orders_count}</span> },
    { header: "Status", accessor: (biz) => <StatusBadge status={biz.account_status} /> },
    { header: "", className: "w-36", headerClassName: "hidden sm:table-cell", accessor: (biz) => (
      <div className="flex items-center gap-1 max-lg:opacity-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon-xs" onClick={() => setExtendTarget(biz)} title="Extend trial"><Plus className="size-3.5 text-blue-500" /></Button>
        <Button variant="ghost" size="icon-xs" onClick={() => setLockTarget(biz)} title="Lock account"><Lock className="size-3.5 text-muted-foreground/60" /></Button>
        <Button variant="ghost" size="icon-xs" onClick={() => setDeleteTarget(biz)} title="Delete account"><Trash2 className="size-3.5 text-destructive/60" /></Button>
      </div>
    )},
  ], []);

  // ── Mobile card renderer ─────────────────────────────────────
  const renderMobileCard = useCallback((biz: TrialBusiness) => {
    const { days, expired } = getDaysRemaining(biz.trial_ends_at);
    return (
      <AdminMobileRecordCard
        primary={biz.name}
        status={<StatusBadge status={biz.account_status} />}
        details={[
          ...(biz.owner_name ? [{ label: "Owner", value: <span>{biz.owner_name}</span> }] : []),
          { label: "Trial Ends", value: <span className={expired ? "text-destructive font-semibold" : ""}>{biz.trial_ends_at ? new Date(biz.trial_ends_at).toLocaleDateString() : "—"}</span> },
          { label: "Days Left", value: <span className={cn("font-semibold", expired ? "text-destructive" : days <= 3 ? "text-warning" : "")}>{expired ? "Expired" : `${days} day${days !== 1 ? "s" : ""}`}</span> },
          { label: "Started", value: <span className="tabular-nums">{biz.trial_started_at ? new Date(biz.trial_started_at).toLocaleDateString() : "—"}</span> },
          { label: "Orders", value: <span className="tabular-nums">{biz.orders_count}</span> },
        ]}
        actions={
          <>
            <button type="button" onClick={() => window.open(`/admin/businesses/${biz.id}`, "_self")}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium min-h-11 hover:bg-accent transition-colors">
              <ExternalLink className="size-3.5" /> View
            </button>
            <button type="button" onClick={() => handleOpenActionSheet(biz)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium min-h-11 hover:bg-primary/90 transition-colors">
              More
            </button>
          </>
        }
      />
    );
  }, [handleOpenActionSheet]);

  // ── Tabs ──────────────────────────────────────────────────────
  const tabs = [
    { key: "active", label: "Active Trials", count: stats.active },
    { key: "expired", label: "Expired", count: stats.expired },
    { key: "all", label: "All", count: stats.total },
  ];

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeTab !== "active") count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [activeTab, searchQuery]);

  const handleClearFilters = useCallback(() => { setActiveTab("active"); setSearchQuery(""); }, []);

  const emptyState = (
    <div className="flex flex-col items-center gap-2 py-4">
      <Gift className="size-8 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground/60">
        {searchQuery ? "No trials match your search." : activeTab === "active" ? "No active trials 🎉" : "No trial accounts found."}
      </p>
    </div>
  );

  // ── Loading ───────────────────────────────────────────────────
  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground/50" /></div>;

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      <AdminPageHeader title="Trial Management" subtitle="Monitor and manage businesses on trial plans" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard label="Active Trials" value={stats.active} icon={Gift} accent="blue" />
        <StatsCard label="Expired" value={stats.expired} icon={Hourglass} accent="warning" />
        <StatsCard label="Expiring Soon" value={stats.expiringSoon} icon={Clock} accent="default" />
        <StatsCard label="Total" value={stats.total} icon={Gift} accent="default" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <AdminMobileTabs tabs={tabs} activeTab={activeTab} onTabChange={(k) => setActiveTab(k as FilterTab)} />
        <AdminSearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search businesses..." filterCount={activeFilterCount} onClearFilters={handleClearFilters} />
      </div>

      <AdminResponsiveTable<TrialBusiness>
        columns={columns} data={filtered} keyExtractor={(b) => b.id}
        mobileCard={renderMobileCard} emptyState={emptyState}
      />

      {actionSheetTarget && (
        <AdminActionSheet
          open={actionSheetOpen} onOpenChange={(o) => { if (!o) { setActionSheetOpen(false); setActionSheetTarget(null); } }}
          title={actionSheetTarget.name} description="Trial actions" actions={actionSheetActions} />
      )}

      <ExtendTrialDialog open={extendTarget !== null} onOpenChange={(o) => { if (!o) setExtendTarget(null); }} business={extendTarget} onExtend={handleExtend} loading={extending} />

      <ConfirmDialog open={lockTarget !== null} onOpenChange={() => setLockTarget(null)} onConfirm={handleLock}
        title="Lock Account" description={`Suspend "${lockTarget?.name}"? They will lose dashboard access.`}
        confirmLabel="Lock Account" variant="destructive" loading={confirmLoading} />

      <ConfirmDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Account" description={`Permanently delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete Permanently" variant="destructive" loading={confirmLoading} />
    </div>
  );
}
