"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FileText,
  History,
  Loader2,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ══ Responsive Admin Components ══════════════════════════════════
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminMobileTabs } from "@/components/admin/mobile-tabs";
import { AdminSearchBar } from "@/components/admin/search-bar";
import {
  AdminResponsiveTable,
  AdminMobileRecordCard,
  type Column,
} from "@/components/admin/responsive-table";

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════

interface ActivityLogRow {
  id: string;
  admin_id: string;
  admin_name: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  target_name: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

type FilterTab = "all" | "payment_approved" | "payment_rejected" | "other";
type DateRange = "all" | "7d" | "30d" | "90d";

interface StatsSummary {
  total: number;
  paymentApproved: number;
  paymentRejected: number;
  other: number;
}

// ══════════════════════════════════════════════════════════════════
// ACTION BADGE
// ══════════════════════════════════════════════════════════════════

function ActionBadge({ action }: { action: string }) {
  const config: Record<string, { label: string; icon: typeof CheckCircle2; style: string }> = {
    payment_approved: { label: "Payment Approved", icon: CheckCircle2, style: "bg-success/10 text-success border-success/20" },
    payment_rejected: { label: "Payment Rejected", icon: XCircle, style: "bg-destructive/10 text-destructive border-destructive/20" },
  };
  const match = config[action];
  if (match) {
    const Icon = match.icon;
    return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold", match.style)}><Icon className="size-2.5" />{match.label}</span>;
  }
  return <span className="inline-flex items-center gap-1 rounded-full border border-border/20 bg-muted/30 px-2 py-0.5 text-xs font-semibold text-muted-foreground capitalize"><Activity className="size-2.5" />{action.replace(/_/g, " ")}</span>;
}

function ActionIcon({ action }: { action: string }) {
  const icons: Record<string, typeof CheckCircle2> = { payment_approved: CheckCircle2, payment_rejected: XCircle };
  const Icon = icons[action] || Activity;
  const colors: Record<string, string> = { payment_approved: "text-success", payment_rejected: "text-destructive" };
  return <Icon className={cn("size-4", colors[action] || "text-muted-foreground/60")} />;
}

function StatsCard({ label, value, icon: Icon, accent }: {
  label: string; value: string | number; icon: typeof Activity;
  accent: "success" | "destructive" | "default" | "primary";
}) {
  const accentStyles: Record<string, string> = {
    success: "bg-success/10 text-success border-success/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
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
// ACTIVITY DETAIL DIALOG (unchanged)
// ══════════════════════════════════════════════════════════════════

function ActivityDetailDialog({ open, onOpenChange, log }: {
  open: boolean; onOpenChange: (open: boolean) => void; log: ActivityLogRow | null;
}) {
  const router = useRouter();
  if (!log) return null;
  const detailEntries = log.details ? Object.entries(log.details).filter(([key]) => key !== "id") : [];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn("flex size-10 items-center justify-center rounded-xl",
              log.action === "payment_approved" ? "bg-success/10" : log.action === "payment_rejected" ? "bg-destructive/10" : "bg-primary/10")}>
              <ActionIcon action={log.action} /></div>
            <div><DialogTitle className="capitalize">{log.action.replace(/_/g, " ")}</DialogTitle><DialogDescription>{new Date(log.created_at).toLocaleString()}</DialogDescription></div></div>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl border border-border/20 bg-muted/5 p-4 space-y-2">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground/70">Admin</span><span className="text-sm font-medium text-foreground">{log.admin_name || "Unknown"}</span></div>
            {log.target_name && <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground/70">Target</span>
              <button type="button" onClick={() => { if (log.target_id) router.push(`/admin/businesses/${log.target_id}`); }}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"><Building2 className="size-3.5" />{log.target_name}<ExternalLink className="size-3" /></button></div>}
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground/70">Action</span><ActionBadge action={log.action} /></div>
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground/70">Timestamp</span><span className="text-sm text-foreground tabular-nums">{new Date(log.created_at).toLocaleString()}</span></div></div>
          {detailEntries.length > 0 && <div><h4 className="text-sm font-semibold text-foreground/80 mb-2 flex items-center gap-1.5"><FileText className="size-3.5 text-muted-foreground/60" />Details</h4>
            <div className="rounded-xl border border-border/20 bg-background p-4 space-y-2 max-h-[300px] overflow-y-auto">
              {detailEntries.map(([key, value]) => <div key={key} className="flex items-start justify-between gap-4">
                <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider shrink-0 min-w-[100px]">{key.replace(/_/g, " ")}</span>
                <span className="text-sm text-foreground text-right break-all">{value === null ? <span className="text-muted-foreground/50 italic">—</span> : typeof value === "object" ? <pre className="text-xs text-muted-foreground/80 text-right whitespace-pre-wrap font-mono">{JSON.stringify(value, null, 2)}</pre> : String(value)}</span></div>)}</div></div>}
          <details className="group"><summary className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors"><ChevronDown className="size-3 group-open:rotate-180 transition-transform" />Raw JSON</summary>
            <pre className="mt-2 rounded-lg bg-muted/20 p-3 text-[11px] text-muted-foreground/60 font-mono overflow-x-auto whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre></details></div>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════════
// DATE RANGE DROPDOWN (unchanged)
// ══════════════════════════════════════════════════════════════════

function DateRangeButton({ value, onChange }: { value: DateRange; onChange: (value: DateRange) => void }) {
  const options: { value: DateRange; label: string }[] = [
    { value: "all", label: "All Time" }, { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" }, { value: "90d", label: "Last 90 Days" },
  ];
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label || "All Time";
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className={cn("inline-flex items-center gap-2 rounded-xl border border-input bg-transparent px-3 py-1.5 text-sm font-medium transition-all",
          "text-muted-foreground/80 hover:text-foreground hover:bg-accent", value !== "all" && "border-primary/30 bg-primary/5 text-primary")}>
        <Calendar className="size-3.5" /><span>{selectedLabel}</span><ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} /></button>
      {open && <><div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-xl border border-border/40 bg-card p-1 shadow-lg">
          {options.map((opt) => (
            <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn("w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-all",
                value === opt.value ? "bg-primary/10 text-primary" : "text-muted-foreground/70 hover:bg-muted/30 hover:text-foreground")}>{opt.label}</button>))}</div></>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════

export default function AdminActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [selectedLog, setSelectedLog] = useState<ActivityLogRow | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  // ── Fetch Activity Logs ────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("admin_activity_log").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;

      const adminIds = [...new Set((data || []).map((l) => l.admin_id).filter(Boolean))];
      const bizIds = [...new Set((data || []).filter((l) => l.target_type === "business" && l.target_id).map((l) => l.target_id as string))];

      const [profilesRes, bizRes] = await Promise.all([
        adminIds.length > 0 ? supabase.from("profiles").select("user_id, full_name").in("user_id", adminIds) : { data: [] },
        bizIds.length > 0 ? supabase.from("businesses").select("id, name").in("id", bizIds) : { data: [] },
      ]);
      const adminMap = new Map((profilesRes.data || []).map((p) => [p.user_id, p.full_name]));
      const bizMap = new Map((bizRes.data || []).map((b) => [b.id, b.name]));

      const enriched: ActivityLogRow[] = (data || []).map((l) => ({
        id: l.id, admin_id: l.admin_id, admin_name: adminMap.get(l.admin_id) || null,
        action: l.action, target_type: l.target_type, target_id: l.target_id,
        target_name: l.target_id && l.target_type === "business" ? bizMap.get(l.target_id) || null : null,
        details: (l.details || {}) as Record<string, unknown>, created_at: l.created_at,
      }));
      setLogs(enriched);
    } catch (err) { console.error("Failed to fetch activity log:", err); toast.error("Failed to load activity log"); }
    finally { setLoading(false); }
  }, [supabase]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // ── Stats ──────────────────────────────────────────────────────
  const stats: StatsSummary = useMemo(() => ({
    total: logs.length, paymentApproved: logs.filter((l) => l.action === "payment_approved").length,
    paymentRejected: logs.filter((l) => l.action === "payment_rejected").length,
    other: logs.filter((l) => l.action !== "payment_approved" && l.action !== "payment_rejected").length,
  }), [logs]);

  // ── Filtered ──────────────────────────────────────────────────
  const filteredLogs = useMemo(() => {
    let result = logs;
    if (activeTab === "payment_approved") result = result.filter((l) => l.action === "payment_approved");
    else if (activeTab === "payment_rejected") result = result.filter((l) => l.action === "payment_rejected");
    else if (activeTab === "other") result = result.filter((l) => l.action !== "payment_approved" && l.action !== "payment_rejected");

    if (dateRange !== "all") {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - (dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90));
      result = result.filter((l) => new Date(l.created_at) >= cutoff);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((l) => l.admin_name?.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.target_name?.toLowerCase().includes(q));
    }
    return result;
  }, [logs, activeTab, dateRange, searchQuery]);

  // ── Desktop columns ─────────────────────────────────────────
  const columns: Column<ActivityLogRow>[] = useMemo(() => [
    { header: "Timestamp", className: "w-48", accessor: (log) => (
      <div className="flex flex-col"><span className="text-sm text-foreground tabular-nums">{new Date(log.created_at).toLocaleDateString()}</span>
        <span className="text-[10px] text-muted-foreground/60 tabular-nums">{new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div>
    )},
    { header: "Action", accessor: (log) => <ActionBadge action={log.action} /> },
    { header: "Admin", hideBelow: "sm", accessor: (log) => <span className="text-sm text-foreground/80">{log.admin_name || <span className="text-muted-foreground/50 italic">Unknown</span>}</span> },
    { header: "Target", hideBelow: "md", accessor: (log) => log.target_name ? (
      <button type="button" onClick={() => router.push(`/admin/businesses/${log.target_id}`)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
        <Building2 className="size-3.5 text-muted-foreground/60 shrink-0" />
        <span className="truncate max-w-[160px]">{log.target_name}</span>
        <ExternalLink className="size-2.5 text-muted-foreground/40 shrink-0" /></button>
    ) : <span className="text-sm text-muted-foreground/50 italic">—</span> },
    { header: "Details", hideBelow: "lg", accessor: (log) => (
      <span className="text-xs text-muted-foreground/70 truncate max-w-[200px] block">
        {log.details && Object.keys(log.details).length > 0
          ? Object.entries(log.details).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(", ")
          : "—"}
      </span>
    )},
    { header: "", className: "w-10", accessor: (log) => (
      <button type="button" onClick={() => setSelectedLog(log)}
        className="flex size-7 items-center justify-center rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors" title="View details">
        <FileText className="size-3.5" />
      </button>
    )},
  ], [router]);

  // ── Mobile card renderer ─────────────────────────────────────
  const renderMobileCard = useCallback((log: ActivityLogRow) => {
    const detailPreview = log.details && Object.keys(log.details).length > 0
      ? Object.entries(log.details).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(", ")
      : null;
    return (
      <AdminMobileRecordCard
        primary={log.admin_name || "Unknown Admin"}
        status={<ActionBadge action={log.action} />}
        details={[
          { label: "Date", value: <span className="tabular-nums">{new Date(log.created_at).toLocaleString()}</span> },
          ...(log.target_name ? [{
            label: "Target",
            value: <button type="button" onClick={() => router.push(`/admin/businesses/${log.target_id}`)}
              className="text-primary hover:underline text-left">{log.target_name}</button>,
          }] : []),
          ...(detailPreview ? [{ label: "Summary", value: <span className="text-xs text-muted-foreground/80">{detailPreview}</span> }] : []),
        ]}
        actions={
          <button type="button" onClick={() => setSelectedLog(log)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium min-h-11 hover:bg-accent transition-colors">
            <FileText className="size-3.5" /> View Details
          </button>
        }
      />
    );
  }, [router]);

  // ── Tabs ──────────────────────────────────────────────────────
  const tabs = [
    { key: "all", label: "All Activity", count: stats.total },
    { key: "payment_approved", label: "Payment Approvals", count: stats.paymentApproved },
    { key: "payment_rejected", label: "Payment Rejections", count: stats.paymentRejected },
    { key: "other", label: "Other", count: stats.other },
  ];

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeTab !== "all") count++;
    if (dateRange !== "all") count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [activeTab, dateRange, searchQuery]);

  const handleClearFilters = useCallback(() => { setActiveTab("all"); setDateRange("all"); setSearchQuery(""); }, []);

  const emptyState = (
    <div className="flex flex-col items-center gap-2 py-4">
      <History className="size-8 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground/60">
        {searchQuery ? "No activity logs match your search." : "No activity logged yet."}
      </p>
    </div>
  );

  // ── Loading ───────────────────────────────────────────────────
  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground/50" /></div>;

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      <AdminPageHeader title="Activity Log" subtitle="Audit trail of all administrative actions across the platform" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard label="Total Actions" value={stats.total} icon={History} accent="primary" />
        <StatsCard label="Payment Approvals" value={stats.paymentApproved} icon={CheckCircle2} accent="success" />
        <StatsCard label="Payment Rejections" value={stats.paymentRejected} icon={XCircle} accent="destructive" />
        <StatsCard label="Other Actions" value={stats.other} icon={Activity} accent="default" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <AdminMobileTabs tabs={tabs} activeTab={activeTab} onTabChange={(k) => setActiveTab(k as FilterTab)} />
        <AdminSearchBar
          value={searchQuery} onChange={setSearchQuery} placeholder="Search logs..."
          filterCount={activeFilterCount} onClearFilters={handleClearFilters}
          extras={<DateRangeButton value={dateRange} onChange={setDateRange} />}
        />
      </div>

      <AdminResponsiveTable<ActivityLogRow>
        columns={columns} data={filteredLogs} keyExtractor={(l) => l.id}
        mobileCard={renderMobileCard} emptyState={emptyState}
      />

      <ActivityDetailDialog open={selectedLog !== null} onOpenChange={(o) => { if (!o) setSelectedLog(null); }} log={selectedLog} />
    </div>
  );
}
