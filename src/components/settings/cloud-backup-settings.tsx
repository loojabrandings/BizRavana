"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Database,
  Download,
  HardDrive,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/shared/collapsible-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────

const BACKUP_BUCKET = "cloud-backups";

const DATA_ENTITIES: { key: string; label: string }[] = [
  { key: "orders", label: "Orders" },
  { key: "products", label: "Products" },
  { key: "inventory", label: "Inventory" },
  { key: "expenses", label: "Expenses" },
  { key: "customers", label: "Customers" },
  { key: "quotations", label: "Quotations" },
  { key: "deliveries", label: "Deliveries" },
  { key: "settings", label: "Settings" },
];

interface CloudBackupMeta {
  path: string;
  fileName: string;
  createdAt: string;
  sizeBytes: number;
  entities: string[];
}

// ─── Helpers ──────────────────────────────────────────────────

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

// The tables to back up per entity
const ENTITY_TABLES: Record<string, string[]> = {
  orders: ["orders", "order_items", "order_status_history"],
  products: ["products", "price_snapshots", "categories"],
  inventory: ["inventory_items", "inventory_transactions"],
  expenses: ["expenses"],
  customers: ["customers"],
  quotations: ["quotations", "quotation_items"],
  deliveries: ["deliveries"],
  settings: ["business_settings"],
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export function CloudBackupSettings() {
  const supabase = useMemo(() => createClient(), []);

  // ── Business & Plan state ──
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [planLimitMb, setPlanLimitMb] = useState<number>(0);
  const [planName, setPlanName] = useState<string>("Free");
  const [loadingPlan, setLoadingPlan] = useState(true);

  // ── Backups state ──
  const [backups, setBackups] = useState<CloudBackupMeta[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Compute used storage ──
  const usedBytes = useMemo(
    () => backups.reduce((sum, b) => sum + b.sizeBytes, 0),
    [backups],
  );
  const usedMb = usedBytes / (1024 * 1024);
  const usagePercent = planLimitMb > 0 ? (usedMb / planLimitMb) * 100 : 0;
  const isNearLimit = usagePercent > 80;
  const isAtLimit = usagePercent >= 100;

  // ═════════════════════════════════════════════════════════════
  // FETCH HELPERS
  // ═════════════════════════════════════════════════════════════

  const fetchBusinessAndPlan = useCallback(async () => {
    try {
      setLoadingPlan(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("user_id", session.user.id)
        .single();

      if (!profile?.business_id) return;
      setBusinessId(profile.business_id);

      // Fetch business + plan
      const { data: business } = await supabase
        .from("businesses")
        .select("plan_id")
        .eq("id", profile.business_id)
        .single();

      if (business?.plan_id) {
        const { data: plan } = await supabase
          .from("subscription_plans")
          .select("name, storage_limit_mb")
          .eq("id", business.plan_id)
          .single();

        if (plan) {
          setPlanName(plan.name);
          setPlanLimitMb(plan.storage_limit_mb);
        }
      }
    } catch (err) {
      console.error("Failed to fetch plan:", err);
    } finally {
      setLoadingPlan(false);
    }
  }, [supabase]);

  const fetchBackups = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoadingBackups(true);
      const { data: files, error } = await supabase.storage
        .from(BACKUP_BUCKET)
        .list(`${businessId}/`, { sortBy: { column: "created_at", order: "desc" } });

      if (error) {
        // Bucket might not exist yet
        setBackups([]);
        return;
      }

      const parsed: CloudBackupMeta[] = await Promise.all(
        (files || [])
          .filter((f) => f.name.endsWith(".json"))
          .map(async (file) => {
            // Try to extract metadata from the file metadata or name
            const path = `${businessId}/${file.name}`;
            let entities: string[] = [];

            // Attempt to read first few bytes to get entities list
            try {
              const { data: metaData } = await supabase.storage
                .from(BACKUP_BUCKET)
                .download(path);
              if (metaData) {
                const text = await metaData.slice(0, 2000).text();
                try {
                  const partial = JSON.parse(text);
                  entities = partial.entities || [];
                } catch {
                  // Ignore parse errors on partial read
                }
              }
            } catch {
              // Ignore
            }

            return {
              path,
              fileName: file.name,
              createdAt: file.created_at || file.updated_at || "",
              sizeBytes: file.metadata?.size || 0,
              entities,
            };
          }),
      );

      setBackups(parsed);
    } catch (err) {
      console.error("Failed to fetch backups:", err);
      setBackups([]);
    } finally {
      setLoadingBackups(false);
    }
  }, [businessId, supabase]);

  // Initial load
  useEffect(() => {
    fetchBusinessAndPlan();
  }, [fetchBusinessAndPlan]);

  useEffect(() => {
    if (businessId) fetchBackups();
  }, [businessId, fetchBackups]);

  // ═════════════════════════════════════════════════════════════
  // CREATE BACKUP
  // ═════════════════════════════════════════════════════════════

  const handleCreateBackup = useCallback(async () => {
    if (!businessId) return;
    if (isAtLimit) {
      toast.error("Storage limit reached", {
        description: `Delete old backups to free up space (${formatBytes(usedBytes)} / ${planLimitMb} MB used).`,
      });
      return;
    }

    setCreating(true);
    try {
      const tables = Object.values(ENTITY_TABLES).flat();

      const backup: {
        exported_at: string;
        business_id: string;
        entities: string[];
        data: Record<string, unknown[]>;
      } = {
        exported_at: new Date().toISOString(),
        business_id: businessId,
        entities: DATA_ENTITIES.map((e) => e.key),
        data: {},
      };

      for (const table of tables) {
        const { data } = await supabase
          .from(table)
          .select("*")
          .eq("business_id", businessId);
        backup.data[table] = (data as unknown[]) || [];
      }

      const json = JSON.stringify(backup);
      const blob = new Blob([json], { type: "application/json" });
      const sizeBytes = blob.size;

      // Check if this backup would exceed the limit
      if (planLimitMb > 0 && (usedMb + sizeBytes / (1024 * 1024)) > planLimitMb) {
        toast.error("Not enough storage", {
          description: `This backup needs ${formatBytes(sizeBytes)}, but only ${formatBytes(Math.max(0, planLimitMb * 1024 * 1024 - usedBytes))} remaining.`,
        });
        return;
      }

      const fileName = `backup-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-")}.json`;
      const path = `${businessId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BACKUP_BUCKET)
        .upload(path, blob, {
          contentType: "application/json",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      toast.success("Cloud backup created", {
        description: `${formatBytes(sizeBytes)} — ${DATA_ENTITIES.length} entities backed up.`,
      });

      await fetchBackups();
    } catch (err) {
      toast.error("Backup failed", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    } finally {
      setCreating(false);
    }
  }, [businessId, supabase, fetchBackups, isAtLimit, planLimitMb, usedMb, usedBytes]);

  // ═════════════════════════════════════════════════════════════
  // RESTORE BACKUP
  // ═════════════════════════════════════════════════════════════

  const handleRestore = useCallback(
    async (backup: CloudBackupMeta) => {
      setRestoring(backup.path);
      try {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from(BACKUP_BUCKET)
          .download(backup.path);

        if (downloadError || !fileData) throw downloadError || new Error("Failed to download backup");

        const text = await fileData.text();
        const backupData = JSON.parse(text);

        if (!backupData.data || !backupData.business_id) {
          toast.error("Invalid backup file in cloud storage");
          return;
        }

        const GENERATED_COLUMNS: Record<string, string[]> = {
          products: ["profit_margin"],
          orders: ["balance_remaining", "total"],
          order_items: ["total_price"],
          quotations: ["grand_total"],
          quotation_items: ["total_price"],
          expenses: ["total_cost"],
        };

        const TABLES_WITHOUT_UPDATED_AT = new Set([
          "order_items",
          "order_status_history",
          "inventory_transactions",
          "quotation_items",
          "price_snapshots",
        ]);

        let restored = 0;
        let tablesCount = 0;

        for (const [table, rows] of Object.entries(backupData.data) as [string, unknown[]][]) {
          if (!rows || rows.length === 0) continue;
          tablesCount++;

          const generatedCols = GENERATED_COLUMNS[table] ?? [];
          const hasUpdatedAt = !TABLES_WITHOUT_UPDATED_AT.has(table);

          const clean = rows.map((row) => {
            const record = row as Record<string, unknown>;
            const sanitized: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(record)) {
              if (key === "deleted_at") continue;
              if (generatedCols.includes(key)) continue;
              if (!hasUpdatedAt && key === "updated_at") continue;
              sanitized[key] = value;
            }
            if (hasUpdatedAt) {
              sanitized.updated_at = new Date().toISOString();
            }
            return sanitized;
          });

          for (let i = 0; i < clean.length; i += 50) {
            const batch = clean.slice(i, i + 50);
            const upsertOptions =
              table === "business_settings"
                ? { onConflict: "business_id, key" as const }
                : {};
            const { error } = await supabase
              .from(table)
              .upsert(batch, upsertOptions as any);
            if (error) {
              console.error(`Restore failed for ${table}:`, error);
            } else {
              restored += batch.length;
            }
          }
        }

        toast.success(`Restored ${restored} record(s) from ${tablesCount} table(s)`);
      } catch (err) {
        toast.error("Restore failed", {
          description: err instanceof Error ? err.message : "An error occurred.",
        });
      } finally {
        setRestoring(null);
      }
    },
    [supabase],
  );

  // ═════════════════════════════════════════════════════════════
  // DELETE BACKUP
  // ═════════════════════════════════════════════════════════════

  const handleDeleteConfirmed = useCallback(async () => {
    if (!deleteConfirm) return;
    setDeleting(deleteConfirm);
    try {
      const { error } = await supabase.storage
        .from(BACKUP_BUCKET)
        .remove([deleteConfirm]);

      if (error) throw error;

      toast.success("Backup deleted");
      setDeleteConfirm(null);
      await fetchBackups();
    } catch (err) {
      toast.error("Failed to delete backup", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    } finally {
      setDeleting(null);
    }
  }, [deleteConfirm, supabase, fetchBackups]);

  // ═════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════

  if (loadingPlan) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-5 animate-spin text-muted-foreground/60" />
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}
        title="Delete Cloud Backup?"
        description="This will permanently remove this backup from cloud storage. This action cannot be undone."
        confirmLabel="Delete Backup"
        variant="destructive"
        loading={deleting === deleteConfirm}
        onConfirm={handleDeleteConfirmed}
      />

      {/* ── Storage Usage Card ── */}
      <div className="rounded-xl border border-border/30 bg-card p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              isAtLimit
                ? "bg-destructive/10 text-destructive"
                : isNearLimit
                  ? "bg-warning/10 text-warning"
                  : "bg-primary/10 text-primary",
            )}>
              <HardDrive className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Cloud Storage</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                {formatBytes(usedBytes)} used of {planLimitMb >= 999999 ? "Unlimited" : `${planLimitMb} MB`}
                {planLimitMb < 999999 && ` (${usagePercent.toFixed(1)}%)`}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/30 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Database className="size-3" />
            {planName} plan
          </span>
        </div>

        {/* Progress bar */}
        {planLimitMb < 999999 && (
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isAtLimit ? "bg-destructive" : isNearLimit ? "bg-warning" : "bg-primary",
              )}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        )}

        {/* Warning banner */}
        {isNearLimit && (
          <div className={cn(
            "mt-3 flex items-start gap-2 rounded-lg border p-3 text-xs leading-relaxed",
            isAtLimit
              ? "border-destructive/20 bg-destructive/[0.04] text-destructive/80"
              : "border-warning/20 bg-warning/[0.04] text-warning/80",
          )}>
            {isAtLimit ? (
              <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
            )}
            <span>
              {isAtLimit
                ? "Storage is full. Delete old backups to create new ones, or upgrade your plan for more space."
                : `Storage is at ${usagePercent.toFixed(0)}%. Consider cleaning up old backups or upgrading your plan.`}
            </span>
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="gradient"
            size="sm"
            onClick={handleCreateBackup}
            disabled={creating || !businessId || isAtLimit}
          >
            {creating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Cloud className="size-3.5" />
            )}
            {creating ? "Backing up..." : "Create Cloud Backup"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBackups}
            disabled={loadingBackups}
            aria-label="Refresh backups"
          >
            <RefreshCw className={cn("size-3.5", loadingBackups && "animate-spin")} />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground/50">
          {backups.length} {backups.length === 1 ? "backup" : "backups"} stored
        </p>
      </div>

      {/* ── Backup List ── */}
      {loadingBackups ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground/40" />
        </div>
      ) : backups.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/20 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/30">
            <Cloud className="size-6 text-muted-foreground/40" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">No cloud backups yet</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Create your first backup to protect your business data.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {backups.map((backup) => (
            <motion.div
              key={backup.path}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="group flex items-center gap-3 rounded-xl border border-border/20 bg-card/50 p-3.5 transition-all hover:border-border/40 hover:bg-card/80 hover:shadow-sm sm:gap-4"
            >
              {/* Icon */}
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary/70">
                <Database className="size-4" />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {backup.createdAt ? formatDate(backup.createdAt) : backup.fileName}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground/60">
                  <span>{formatBytes(backup.sizeBytes)}</span>
                  {backup.entities.length > 0 && (
                    <>
                      <span className="text-muted-foreground/30">·</span>
                      <span>{backup.entities.length} entities</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRestore(backup)}
                  disabled={restoring === backup.path}
                  className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                  title="Restore from this backup"
                >
                  {restoring === backup.path ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Download className="size-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteConfirm(backup.path)}
                  disabled={deleting === backup.path}
                  className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Delete this backup"
                >
                  {deleting === backup.path ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                </Button>
              </div>

              {/* Always visible restore/delete on mobile */}
              <div className="flex shrink-0 items-center gap-1 sm:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(backup)}
                  disabled={restoring === backup.path}
                >
                  {restoring === backup.path ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Download className="size-3.5" />
                  )}
                  Restore
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirm(backup.path)}
                  disabled={deleting === backup.path}
                  className="text-destructive border-destructive/30"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Info Banner ── */}
      <div className="flex items-start gap-2.5 rounded-xl border border-border/10 bg-muted/10 p-3.5">
        <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground/70 leading-relaxed">
          <p className="font-medium text-foreground/80">About Cloud Backups</p>
          <p className="mt-0.5">
            Backups include all your business data (orders, products, inventory, expenses, customers,
            quotations, deliveries, and settings). Restoring will overwrite existing data. Your plan
            includes <strong>{planLimitMb >= 999999 ? "unlimited" : `${planLimitMb} MB`} storage</strong>{" "}
            for cloud backups.
          </p>
        </div>
      </div>
    </>
  );
}
