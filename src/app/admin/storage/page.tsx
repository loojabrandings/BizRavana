"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Database,
  ExternalLink,
  FileText,
  HardDrive,
  Image as ImageIcon,
  Landmark,
  Loader2,
  Search,
  Upload,
  Receipt,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// ══ Responsive Admin Components ══════════════════════════════════
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSearchBar } from "@/components/admin/search-bar";
import {
  AdminResponsiveTable,
  AdminMobileRecordCard,
  type Column,
} from "@/components/admin/responsive-table";

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════

interface BucketInfo {
  name: string;
  label: string;
  icon: typeof Database;
  description: string;
  pathPattern: string;
  fileCount: number;
  totalSizeMb: number;
  businessCount: number;
}

interface BusinessStorage {
  id: string;
  name: string;
  plan_name: string | null;
  account_status: string;
  paymentProofsSize: number;
  paymentProofsCount: number;
  logosSize: number;
  logosCount: number;
  orderImagesSize: number;
  orderImagesCount: number;
  totalSizeMb: number;
  totalFiles: number;
}

// ══════════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════════

const BUCKETS: Omit<BucketInfo, "fileCount" | "totalSizeMb" | "businessCount">[] = [
  { name: "payment-proofs", label: "Payment Proofs", icon: Receipt, description: "Bank transfer receipts uploaded by businesses", pathPattern: "proofs/{businessId}/" },
  { name: "profile-images", label: "Profile Images", icon: User, description: "Business logos and user avatars", pathPattern: "logos/{businessId}/" },
  { name: "order-images", label: "Order Images", icon: ImageIcon, description: "Per-item photos attached to orders", pathPattern: "{businessId}/" },
];

// ══════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════

function formatMb(mb: number): string {
  if (mb < 0.01) return "< 0.01";
  if (mb < 1) return mb.toFixed(2);
  if (mb < 1000) return mb.toFixed(1);
  return `${(mb / 1024).toFixed(2)} GB`;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    trial: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    trial_expired: "bg-warning/10 text-warning border-warning/20",
    active: "bg-success/10 text-success border-success/20",
    expired: "bg-destructive/10 text-destructive border-destructive/20",
    pending_payment: "bg-warning/10 text-warning border-warning/20",
    suspended: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize", styles[status] || "bg-muted text-muted-foreground")}>{status.replace("_", " ")}</span>;
}

function StatsCard({ label, value, sublabel, icon: Icon, accent }: {
  label: string; value: string | number; sublabel?: string; icon: typeof Database;
  accent: "primary" | "info" | "warning" | "default";
}) {
  const accentStyles: Record<string, string> = {
    primary: "bg-primary/10 text-primary border-primary/20",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    default: "bg-muted/30 text-muted-foreground border-border/20",
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/20 bg-card p-4">
      <div className={cn("flex size-10 items-center justify-center rounded-lg", accentStyles[accent])}><Icon className="size-5" /></div>
      <div><p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</p><p className="text-xs text-muted-foreground/70">{label}</p>{sublabel && <p className="text-[10px] text-muted-foreground/50">{sublabel}</p>}</div>
    </div>
  );
}

function BucketCard({ bucket, loading }: { bucket: BucketInfo; loading: boolean }) {
  const Icon = bucket.icon;
  const percentage = bucket.totalSizeMb > 0 ? Math.min(100, (bucket.totalSizeMb / 500) * 100) : 0;
  return (<div className="rounded-xl border border-border/20 bg-card p-5 space-y-4">
    <div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-lg bg-primary/10"><Icon className="size-4.5 text-primary" /></div>
      <div><h4 className="text-sm font-semibold text-foreground">{bucket.label}</h4><p className="text-xs text-muted-foreground/70">{bucket.description}</p></div></div>
    {loading ? (<div className="space-y-2"><div className="h-4 w-24 animate-pulse rounded bg-muted/30" /><div className="h-2 animate-pulse rounded-full bg-muted/30" /><div className="h-3 w-32 animate-pulse rounded bg-muted/20" /></div>) : (
      <><div className="grid grid-cols-2 gap-3"><div><p className="text-lg font-bold text-foreground tabular-nums">{formatMb(bucket.totalSizeMb)}</p><p className="text-xs text-muted-foreground/60">Total Size</p></div><div><p className="text-lg font-bold text-foreground tabular-nums">{bucket.fileCount.toLocaleString()}</p><p className="text-xs text-muted-foreground/60">Files</p></div></div>
        <div><div className="flex items-center justify-between mb-1"><span className="text-xs text-muted-foreground/60">Usage</span><span className="text-xs text-muted-foreground/70 tabular-nums">{formatMb(bucket.totalSizeMb)} / 500 MB</span></div>
          <Progress value={percentage} className={cn("h-1.5", percentage >= 90 && "[&>div]:bg-destructive", percentage >= 70 && percentage < 90 && "[&>div]:bg-warning")} /></div>
        <div className="flex items-center justify-between text-xs text-muted-foreground/70"><span>Businesses with files</span><span className="font-medium tabular-nums">{bucket.businessCount}</span></div>
        <p className="text-[10px] text-muted-foreground/50 font-mono">{bucket.pathPattern}</p>
      </>)}
  </div>);
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════

export default function AdminStoragePage() {
  const [businesses, setBusinesses] = useState<BusinessStorage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [bucketInfo, setBucketInfo] = useState<BucketInfo[]>(BUCKETS.map((b) => ({ ...b, fileCount: 0, totalSizeMb: 0, businessCount: 0 })));

  const supabase = useMemo(() => createClient(), []);

  // ── Fetch Storage Data ─────────────────────────────────────────
  const fetchStorageData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: bizData, error: bizError } = await supabase.from("businesses").select("id, name, plan_id, account_status").is("deleted_at", null).order("name").limit(100);
      if (bizError) throw bizError;
      if (!bizData || bizData.length === 0) { setLoading(false); return; }

      const planIds = [...new Set(bizData.map((b) => b.plan_id).filter(Boolean))];
      const { data: plansData } = planIds.length > 0 ? await supabase.from("subscription_plans").select("id, name").in("id", planIds) : { data: [] };
      const planMap = new Map((plansData || []).map((p) => [p.id, p.name]));

      const BATCH_SIZE = 15;
      const results: BusinessStorage[] = [];
      const bucketAgg = BUCKETS.map((b) => ({ name: b.name, fileCount: 0, totalSizeMb: 0, businessIds: new Set<string>() }));

      for (let i = 0; i < bizData.length; i += BATCH_SIZE) {
        const batch = bizData.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(batch.map(async (biz) => {
          let paymentProofsSize = 0, paymentProofsCount = 0, logosSize = 0, logosCount = 0, orderImagesSize = 0, orderImagesCount = 0;
          try { const { data: proofFiles } = await supabase.storage.from("payment-proofs").list(`proofs/${biz.id}`, { limit: 200 });
            if (proofFiles) { for (const f of proofFiles) { paymentProofsSize += (f.metadata?.size || 0) / (1024 * 1024); paymentProofsCount++; } } } catch { /* best-effort */ }
          try { const { data: logoFiles } = await supabase.storage.from("profile-images").list(`logos/${biz.id}`, { limit: 20 });
            if (logoFiles) { for (const f of logoFiles) { logosSize += (f.metadata?.size || 0) / (1024 * 1024); logosCount++; } } } catch { /* best-effort */ }
          try { const { data: orderFiles } = await supabase.storage.from("order-images").list(biz.id, { limit: 200 });
            if (orderFiles) { for (const f of orderFiles) { orderImagesSize += (f.metadata?.size || 0) / (1024 * 1024); orderImagesCount++; } } } catch { /* best-effort */ }
          return { id: biz.id, name: biz.name, plan_name: biz.plan_id ? planMap.get(biz.plan_id) || null : null, account_status: biz.account_status, paymentProofsSize, paymentProofsCount, logosSize, logosCount, orderImagesSize, orderImagesCount, totalSizeMb: Math.round((paymentProofsSize + logosSize + orderImagesSize) * 100) / 100, totalFiles: paymentProofsCount + logosCount + orderImagesCount };
        }));
        results.push(...batchResults);
        for (const r of batchResults) {
          if (r.paymentProofsCount > 0) { bucketAgg[0].fileCount += r.paymentProofsCount; bucketAgg[0].totalSizeMb += r.paymentProofsSize; bucketAgg[0].businessIds.add(r.id); }
          if (r.logosCount > 0) { bucketAgg[1].fileCount += r.logosCount; bucketAgg[1].totalSizeMb += r.logosSize; bucketAgg[1].businessIds.add(r.id); }
          if (r.orderImagesCount > 0) { bucketAgg[2].fileCount += r.orderImagesCount; bucketAgg[2].totalSizeMb += r.orderImagesSize; bucketAgg[2].businessIds.add(r.id); }
        }
      }
      results.sort((a, b) => b.totalSizeMb - a.totalSizeMb);
      setBusinesses(results);
      setBucketInfo((prev) => prev.map((b, idx) => ({ ...b, fileCount: bucketAgg[idx]?.fileCount || 0, totalSizeMb: Math.round((bucketAgg[idx]?.totalSizeMb || 0) * 100) / 100, businessCount: bucketAgg[idx]?.businessIds.size || 0 })));
    } catch (err) { console.error("Failed to fetch storage data:", err); toast.error("Failed to load storage data"); }
    finally { setLoading(false); }
  }, [supabase]);

  useEffect(() => { fetchStorageData(); }, [fetchStorageData]);

  // ── Stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalSize = businesses.reduce((sum, b) => sum + b.totalSizeMb, 0);
    const totalFiles = businesses.reduce((sum, b) => sum + b.totalFiles, 0);
    const businessesWithFiles = businesses.filter((b) => b.totalFiles > 0).length;
    return { totalSize, totalFiles, businessesWithFiles, totalBusinesses: businesses.length };
  }, [businesses]);

  // ── Filtered ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return businesses;
    const q = searchQuery.toLowerCase();
    return businesses.filter((b) => b.name.toLowerCase().includes(q) || b.plan_name?.toLowerCase().includes(q) || b.id.toLowerCase().includes(q));
  }, [businesses, searchQuery]);

  // ── Desktop columns ─────────────────────────────────────────
  const columns: Column<BusinessStorage>[] = useMemo(() => [
    { header: "Business", className: "w-56", accessor: (biz) => (
      <div className="flex items-center gap-2.5">
        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", biz.totalSizeMb > 0 ? "bg-primary/10" : "bg-muted/30")}>
          {biz.totalSizeMb > 0 ? <Upload className="size-4 text-primary" /> : <HardDrive className="size-4 text-muted-foreground/50" />}
        </div>
        <div className="min-w-0">
          <button type="button" onClick={() => window.open(`/admin/businesses/${biz.id}`, "_self")} className="text-sm font-medium text-foreground truncate max-w-[180px] hover:text-primary transition-colors text-left">{biz.name}</button>
          <StatusBadge status={biz.account_status} />
        </div>
      </div>
    )},
    { header: "Plan", hideBelow: "sm", accessor: (biz) => <span className="text-sm text-muted-foreground/80">{biz.plan_name || "—"}</span> },
    { header: "Payment Proofs", hideBelow: "md", accessor: (biz) => <div className="flex items-center gap-2"><Receipt className="size-3 text-muted-foreground/50" /><span className="text-sm tabular-nums text-muted-foreground/80">{biz.paymentProofsCount > 0 ? `${biz.paymentProofsCount} (${formatMb(biz.paymentProofsSize)})` : "—"}</span></div> },
    { header: "Logos", hideBelow: "md", accessor: (biz) => <div className="flex items-center gap-2"><User className="size-3 text-muted-foreground/50" /><span className="text-sm tabular-nums text-muted-foreground/80">{biz.logosCount > 0 ? `${biz.logosCount} (${formatMb(biz.logosSize)})` : "—"}</span></div> },
    { header: "Order Images", hideBelow: "md", accessor: (biz) => <div className="flex items-center gap-2"><ImageIcon className="size-3 text-muted-foreground/50" /><span className="text-sm tabular-nums text-muted-foreground/80">{biz.orderImagesCount > 0 ? `${biz.orderImagesCount} (${formatMb(biz.orderImagesSize)})` : "—"}</span></div> },
    { header: "Total Size", accessor: (biz) => (
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-[60px]"><div className={cn("h-1.5 rounded-full", biz.totalSizeMb > 0 ? "bg-muted/30" : "bg-muted/10")}>
          {biz.totalSizeMb > 0 && <div className={cn("h-full rounded-full", biz.totalSizeMb > 50 ? "bg-destructive" : biz.totalSizeMb > 10 ? "bg-warning" : "bg-primary")} style={{ width: `${Math.min(100, (biz.totalSizeMb / 50) * 100)}%` }} />}</div>
        </div>
        <span className={cn("text-sm font-semibold tabular-nums shrink-0 w-14 text-right", biz.totalSizeMb > 0 ? "text-foreground" : "text-muted-foreground/50")}>{biz.totalSizeMb > 0 ? formatMb(biz.totalSizeMb) : "—"}</span>
      </div>
    )},
    { header: "Files", className: "w-20", accessor: (biz) => <span className="text-sm tabular-nums text-muted-foreground/80">{biz.totalFiles > 0 ? biz.totalFiles : "—"}</span> },
  ], []);

  // ── Mobile card renderer ─────────────────────────────────────
  const renderMobileCard = useCallback((biz: BusinessStorage) => (
    <AdminMobileRecordCard
      primary={biz.name}
      status={<StatusBadge status={biz.account_status} />}
      details={[
        ...(biz.plan_name ? [{ label: "Plan", value: <span className="font-medium">{biz.plan_name}</span> }] : []),
        { label: "Total Size", value: <span className="font-semibold tabular-nums">{biz.totalSizeMb > 0 ? formatMb(biz.totalSizeMb) : "—"}</span> },
        { label: "Total Files", value: <span className="tabular-nums">{biz.totalFiles > 0 ? biz.totalFiles : "—"}</span> },
        ...(biz.paymentProofsCount > 0 ? [{ label: "Payment Proofs", value: <span className="tabular-nums">{biz.paymentProofsCount} ({formatMb(biz.paymentProofsSize)})</span> }] : []),
        ...(biz.logosCount > 0 ? [{ label: "Logos", value: <span className="tabular-nums">{biz.logosCount} ({formatMb(biz.logosSize)})</span> }] : []),
        ...(biz.orderImagesCount > 0 ? [{ label: "Order Images", value: <span className="tabular-nums">{biz.orderImagesCount} ({formatMb(biz.orderImagesSize)})</span> }] : []),
      ]}
      actions={
        <button type="button" onClick={() => window.open(`/admin/businesses/${biz.id}`, "_self")}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium min-h-11 hover:bg-accent transition-colors">
          <ExternalLink className="size-3.5" /> View
        </button>
      }
    />
  ), []);

  const emptyState = (
    <div className="flex flex-col items-center gap-2 py-4">
      <HardDrive className="size-8 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground/60">{searchQuery ? "No businesses match your search." : "No storage data available."}</p>
    </div>
  );

  // ── Loading ───────────────────────────────────────────────────
  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground/50" /></div>;

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      <AdminPageHeader title="Storage Management" subtitle="Monitor storage usage across all buckets and businesses" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard label="Total Storage" value={formatMb(stats.totalSize)} sublabel={`Across ${stats.businessesWithFiles} businesses`} icon={HardDrive} accent="primary" />
        <StatsCard label="Total Files" value={stats.totalFiles} sublabel={`${stats.businessesWithFiles} businesses with files`} icon={FileText} accent="info" />
        <StatsCard label="Avg Per Business" value={stats.businessesWithFiles > 0 ? formatMb(stats.totalSize / stats.businessesWithFiles) : "—"} sublabel={stats.businessesWithFiles > 0 ? `${(stats.totalFiles / stats.businessesWithFiles).toFixed(1)} files avg` : undefined} icon={Database} accent="warning" />
        <StatsCard label="Businesses Tracked" value={stats.totalBusinesses} sublabel={`${stats.businessesWithFiles} with uploads`} icon={Landmark} accent="default" />
      </div>

      <div>
        <div className="flex items-center gap-2.5 mb-4"><HardDrive className="size-4 text-muted-foreground/70" /><h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/70">Storage Buckets</h3></div>
        <div className="grid gap-4 sm:grid-cols-3">{bucketInfo.map((bucket) => <BucketCard key={bucket.name} bucket={bucket} loading={false} />)}</div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5"><Upload className="size-4 text-muted-foreground/70" /><h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/70">Storage by Business</h3></div>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
            <Input placeholder="Search businesses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm w-full" />
          </div>
        </div>

        <AdminResponsiveTable<BusinessStorage>
          columns={columns} data={filtered} keyExtractor={(b) => b.id}
          mobileCard={renderMobileCard} emptyState={emptyState}
        />
      </div>

      <div className="rounded-xl border border-border/20 bg-muted/5 p-4">
        <div className="flex items-start gap-3"><Database className="size-4 text-muted-foreground/60 shrink-0 mt-0.5" />
          <div><p className="text-sm font-medium text-foreground/80">About Storage Estimation</p>
            <p className="mt-0.5 text-xs text-muted-foreground/70 leading-relaxed">
              Storage sizes are estimated by listing files in each bucket&apos;s business-specific path and summing their metadata sizes.
              Files are limited to 200 per bucket per business. Actual usage may be higher for businesses with more files.</p></div></div>
      </div>
    </div>
  );
}
