"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Crown,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Star,
  Trash2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

// ══ Responsive Admin Components ══════════════════════════════════
import { AdminPageHeader } from "@/components/admin/page-header";
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

interface PlanFormData {
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
  sort_order: number;
  is_active: boolean;
}

interface PlanRecord extends PlanFormData {
  id: string;
  created_at: string;
  updated_at: string;
  businesses_count?: number;
}

// ══════════════════════════════════════════════════════════════════
// DEFAULT FORM VALUES
// ══════════════════════════════════════════════════════════════════

const defaultPlan: PlanFormData = {
  name: "", monthly_price: 0, order_limit: 0, expense_limit: 0, product_limit: 0,
  quotation_limit: 0, inventory_limit: 0, storage_limit_mb: 500,
  courier_accounts: 1, whatsapp_templates: 1, team_members: 1,
  bulk_import: false, activity_log: false, smart_automation: false, ai_assistant: false,
  sort_order: 0, is_active: true,
};

// ══════════════════════════════════════════════════════════════════
// PLAN FORM DIALOG (unchanged)
// ══════════════════════════════════════════════════════════════════

function PlanFormDialog({ open, onOpenChange, initialData, onSave, loading }: {
  open: boolean; onOpenChange: (open: boolean) => void;
  initialData: PlanFormData | null; onSave: (data: PlanFormData) => void; loading: boolean;
}) {
  const [form, setForm] = useState<PlanFormData>(initialData || defaultPlan);
  const isEditing = !!initialData;
  useEffect(() => { if (open) setForm(initialData || defaultPlan); }, [open, initialData]);

  const updateField = useCallback(<K extends keyof PlanFormData>(key: K, value: PlanFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Plan name is required"); return; }
    onSave(form);
  }, [form, onSave]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 mb-2">
            <Crown className="size-5 text-primary" />
          </div>
          <DialogTitle>{isEditing ? "Edit Plan" : "Create Plan"}</DialogTitle>
          <DialogDescription>{isEditing ? "Update the subscription plan details." : "Define a new subscription plan with usage limits and features."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-3">Plan Identity</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="plan-name">Plan Name</Label>
                <Input id="plan-name" placeholder="e.g. Basic, Standard, Premium" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-price">Monthly Price (Rs.)</Label>
                <Input id="plan-price" type="number" min={0} placeholder="0" value={form.monthly_price} onChange={(e) => updateField("monthly_price", Number(e.target.value))} />
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-3">Usage Limits</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumericField label="Orders" value={form.order_limit} onChange={(v) => updateField("order_limit", v)} />
              <NumericField label="Expenses" value={form.expense_limit} onChange={(v) => updateField("expense_limit", v)} />
              <NumericField label="Products" value={form.product_limit} onChange={(v) => updateField("product_limit", v)} />
              <NumericField label="Quotations" value={form.quotation_limit} onChange={(v) => updateField("quotation_limit", v)} />
              <NumericField label="Inventory Items" value={form.inventory_limit} onChange={(v) => updateField("inventory_limit", v)} />
              <NumericField label="Storage (MB)" value={form.storage_limit_mb} onChange={(v) => updateField("storage_limit_mb", v)} />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-3">Integrations & Team</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <NumericField label="Courier Accounts" value={form.courier_accounts} onChange={(v) => updateField("courier_accounts", v)} />
              <NumericField label="WhatsApp Templates" value={form.whatsapp_templates} onChange={(v) => updateField("whatsapp_templates", v)} />
              <NumericField label="Team Members" value={form.team_members} onChange={(v) => updateField("team_members", v)} />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-3">Advanced Features</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <BoolField label="Bulk Import (XLSX/CSV)" value={form.bulk_import} onChange={(v) => updateField("bulk_import", v)} />
              <BoolField label="Activity Log" value={form.activity_log} onChange={(v) => updateField("activity_log", v)} />
              <BoolField label="Smart Automation" value={form.smart_automation} onChange={(v) => updateField("smart_automation", v)} />
              <BoolField label="AI Assistant" value={form.ai_assistant} onChange={(v) => updateField("ai_assistant", v)} />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-3">Display Settings</h4>
            <div className="flex items-center gap-6">
              <div className="space-y-1.5 w-32">
                <Label htmlFor="plan-sort">Sort Order</Label>
                <Input id="plan-sort" type="number" min={0} value={form.sort_order} onChange={(e) => updateField("sort_order", Number(e.target.value))} />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <Switch id="plan-active" checked={form.is_active} onCheckedChange={(v) => updateField("is_active", v)} />
                <Label htmlFor="plan-active" className="text-sm text-foreground/80 cursor-pointer">Plan is active and visible to users</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading && <Loader2 className="size-4 animate-spin" />}{isEditing ? "Save Changes" : "Create Plan"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NumericField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <div className="space-y-1.5"><Label className="text-xs text-foreground/70">{label}</Label><Input type="number" min={0} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-9" /></div>;
}

function BoolField({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between rounded-lg border border-border/20 bg-muted/5 px-4 py-3"><Label className="text-sm text-foreground/80 cursor-pointer">{label}</Label><Switch checked={value} onCheckedChange={onChange} /></div>;
}

function formatLimit(value: number): string {
  return value >= 999999 ? "Unlimited" : value.toLocaleString();
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
      active ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20")}>
      {active ? <><CheckCircle2 className="size-2.5" /> Active</> : <><XCircle className="size-2.5" /> Disabled</>}
    </span>
  );
}

function FeatureTag({ label, enabled }: { label: string; enabled: boolean }) {
  if (!enabled) return null;
  return <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">{label}</span>;
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [disableTarget, setDisableTarget] = useState<PlanRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlanRecord | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Mobile action sheet
  const [actionSheetTarget, setActionSheetTarget] = useState<PlanRecord | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  // ── Fetch Plans ──────────────────────────────────────────────
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("subscription_plans").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      const planIds = (data || []).map((p) => p.id);
      const { data: bizCounts } = await supabase.from("businesses").select("plan_id").in("plan_id", planIds).is("deleted_at", null);
      const countMap = new Map<string, number>();
      if (bizCounts) for (const b of bizCounts) if (b.plan_id) countMap.set(b.plan_id, (countMap.get(b.plan_id) || 0) + 1);
      const enriched: PlanRecord[] = (data || []).map((p) => ({ ...p, businesses_count: countMap.get(p.id) || 0 } as PlanRecord));
      setPlans(enriched);
    } catch (err) { console.error("Failed to fetch plans:", err); toast.error("Failed to load subscription plans"); }
    finally { setLoading(false); }
  }, [supabase]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  // ── Save Plan ─────────────────────────────────────────────────
  const handleSave = useCallback(async (data: PlanFormData) => {
    setSaving(true);
    try {
      if (editingPlan) {
        await supabase.from("subscription_plans").update({ ...data, updated_at: new Date().toISOString() }).eq("id", editingPlan.id);
        toast.success(`"${data.name}" plan updated`);
      } else {
        await supabase.from("subscription_plans").insert(data);
        toast.success(`"${data.name}" plan created`);
      }
      setFormOpen(false); setEditingPlan(null); fetchPlans();
    } catch { toast.error(editingPlan ? "Failed to update plan" : "Failed to create plan"); }
    finally { setSaving(false); }
  }, [editingPlan, supabase, fetchPlans]);

  // ── Toggle Active ─────────────────────────────────────────────
  const handleToggleActive = useCallback(async () => {
    if (!disableTarget) return;
    setConfirmLoading(true);
    try {
      const newActive = !disableTarget.is_active;
      await supabase.from("subscription_plans").update({ is_active: newActive, updated_at: new Date().toISOString() }).eq("id", disableTarget.id);
      toast.success(`"${disableTarget.name}" ${newActive ? "enabled" : "disabled"}`);
      setDisableTarget(null); fetchPlans();
    } catch { toast.error("Failed to update plan status"); }
    finally { setConfirmLoading(false); }
  }, [disableTarget, supabase, fetchPlans]);

  // ── Delete Plan ───────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setConfirmLoading(true);
    try {
      await supabase.from("subscription_plans").delete().eq("id", deleteTarget.id);
      toast.success(`"${deleteTarget.name}" plan deleted`);
      setDeleteTarget(null); fetchPlans();
    } catch { toast.error("Failed to delete plan. It may have businesses assigned to it."); }
    finally { setConfirmLoading(false); }
  }, [deleteTarget, supabase, fetchPlans]);

  // ── Duplicate Plan ────────────────────────────────────────────
  const handleDuplicate = useCallback(async (plan: PlanRecord) => {
    try {
      await supabase.from("subscription_plans").insert({ ...plan, name: `${plan.name} (Copy)`, sort_order: plan.sort_order + 1, is_active: false });
      toast.success(`"${plan.name}" duplicated`); fetchPlans();
    } catch { toast.error("Failed to duplicate plan"); }
  }, [supabase, fetchPlans]);

  // ── Mobile action sheet ───────────────────────────────────────
  const handleOpenActionSheet = useCallback((plan: PlanRecord) => {
    setActionSheetTarget(plan);
    setActionSheetOpen(true);
  }, []);

  const actionSheetActions: ActionSheetAction[] = useMemo(() => {
    if (!actionSheetTarget) return [];
    return [
      { label: "Edit Plan", onClick: () => { setEditingPlan(actionSheetTarget); setFormOpen(true); }, icon: <Pencil className="size-4" /> },
      { label: actionSheetTarget.is_active ? "Disable Plan" : "Enable Plan", onClick: () => setDisableTarget(actionSheetTarget), icon: actionSheetTarget.is_active ? <XCircle className="size-4" /> : <CheckCircle2 className="size-4" />, variant: actionSheetTarget.is_active ? "warning" : "success" },
      { label: "Duplicate Plan", onClick: () => handleDuplicate(actionSheetTarget), icon: <Copy className="size-4" /> },
      { label: "Delete Plan", onClick: () => setDeleteTarget(actionSheetTarget), icon: <Trash2 className="size-4" />, variant: "destructive" },
    ];
  }, [actionSheetTarget, handleDuplicate]);

  // ── Desktop columns ──────────────────────────────────────────
  const columns: Column<PlanRecord>[] = useMemo(() => [
    { header: "Plan", accessor: (plan) => {
      const isPremiumOrEnterprise = plan.name.toLowerCase().includes("premium") || plan.name.toLowerCase().includes("enterprise");
      const isStandard = plan.name.toLowerCase().includes("standard");
      return (
        <div className="flex items-center gap-3">
          <div className={cn("flex size-8 items-center justify-center rounded-lg", plan.is_active ? "bg-primary/10" : "bg-muted/30")}>
            {isPremiumOrEnterprise ? <Crown className={cn("size-4", plan.is_active ? "text-primary" : "text-muted-foreground/50")} /> :
             isStandard ? <Star className={cn("size-4", plan.is_active ? "text-primary" : "text-muted-foreground/50")} /> :
             <Sparkles className={cn("size-4", plan.is_active ? "text-primary" : "text-muted-foreground/50")} />}
          </div>
          <div>
            <p className={cn("text-sm font-medium", plan.is_active ? "text-foreground" : "text-muted-foreground/60")}>{plan.name}</p>
            <p className="text-[10px] text-muted-foreground/50">Sort: {plan.sort_order}</p>
          </div>
        </div>
      );
    }},
    { header: "Price", accessor: (plan) => (
      <span className={cn("text-sm font-semibold tabular-nums", plan.is_active ? "text-foreground" : "text-muted-foreground/60")}>
        {plan.monthly_price === 0 ? "Free" : `Rs. ${plan.monthly_price.toLocaleString()}`}
      </span>
    )},
    { header: "Limits", hideBelow: "md", accessor: (plan) => (
      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground/70">
        <span>Orders: <strong>{formatLimit(plan.order_limit)}</strong></span>
        <span>Prods: <strong>{formatLimit(plan.product_limit)}</strong></span>
        <span>Storage: <strong>{formatLimit(plan.storage_limit_mb)}MB</strong></span>
      </div>
    )},
    { header: "Features", hideBelow: "lg", accessor: (plan) => (
      <div className="flex flex-wrap gap-1">
        <FeatureTag label="Bulk Import" enabled={plan.bulk_import} />
        <FeatureTag label="Activity Log" enabled={plan.activity_log} />
        <FeatureTag label="Automation" enabled={plan.smart_automation} />
        <FeatureTag label="AI" enabled={plan.ai_assistant} />
        {!plan.bulk_import && !plan.activity_log && !plan.smart_automation && !plan.ai_assistant && <span className="text-xs text-muted-foreground/50">Core only</span>}
      </div>
    )},
    { header: "Businesses", accessor: (plan) => <span className="text-sm tabular-nums text-muted-foreground/80">{plan.businesses_count || 0}</span> },
    { header: "Status", accessor: (plan) => <StatusBadge active={plan.is_active} /> },
    { header: "", className: "w-36", headerClassName: "hidden sm:table-cell", accessor: (plan) => (
      <div className="flex items-center gap-1 max-lg:opacity-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon-xs" onClick={() => { setEditingPlan(plan); setFormOpen(true); }} title="Edit plan">
          <Pencil className="size-3.5 text-primary" />
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={() => setDisableTarget(plan)}
          title={plan.is_active ? "Disable plan" : "Enable plan"}>
          {plan.is_active ? (
            <XCircle className="size-3.5 text-muted-foreground/60" />
          ) : (
            <CheckCircle2 className="size-3.5 text-success" />
          )}
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={() => handleDuplicate(plan)} title="Duplicate plan">
          <Copy className="size-3.5 text-muted-foreground/60" />
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={() => setDeleteTarget(plan)} title="Delete plan">
          <Trash2 className="size-3.5 text-destructive/60" />
        </Button>
      </div>
    )},
  ], [handleDuplicate]);

  // ── Mobile card renderer ─────────────────────────────────────
  const renderMobileCard = useCallback((plan: PlanRecord) => {
    const isPremiumOrEnterprise = plan.name.toLowerCase().includes("premium") || plan.name.toLowerCase().includes("enterprise");
    return (
      <AdminMobileRecordCard
        primary={<span className={plan.is_active ? "" : "text-muted-foreground/60"}>{plan.name}</span>}
        status={<StatusBadge active={plan.is_active} />}
        details={[
          { label: "Price", value: <span className="font-semibold">{plan.monthly_price === 0 ? "Free" : `Rs. ${plan.monthly_price.toLocaleString()}`}</span> },
          { label: "Orders", value: <span>{formatLimit(plan.order_limit)}</span> },
          { label: "Expenses", value: <span>{formatLimit(plan.expense_limit)}</span> },
          { label: "Products", value: <span>{formatLimit(plan.product_limit)}</span> },
          { label: "Storage", value: <span>{formatLimit(plan.storage_limit_mb)} MB</span> },
          { label: "Businesses", value: <span className="tabular-nums">{plan.businesses_count || 0}</span> },
          { label: "Features", value: <span className="text-xs">{(plan.bulk_import ? "Bulk Import, " : "") + (plan.activity_log ? "Activity Log, " : "") + (plan.smart_automation ? "Automation, " : "") + (plan.ai_assistant ? "AI" : "").replace(/,\s*$/, "") || "Core"}</span> },
        ]}
        actions={
          <button type="button" onClick={() => handleOpenActionSheet(plan)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium min-h-11 hover:bg-primary/90 transition-colors">
            <ExternalLink className="size-3.5" /> Manage
          </button>
        }
      />
    );
  }, [handleOpenActionSheet]);

  // ── Empty state ──────────────────────────────────────────────
  const emptyState = (
    <div className="flex flex-col items-center gap-2 py-4">
      <Crown className="size-8 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground/60">No plans defined yet.</p>
    </div>
  );

  // ── Loading ─────────────────────────────────────────────────
  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground/50" /></div>;

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      <AdminPageHeader
        title="Subscription Plans"
        subtitle={`${plans.length} plan${plans.length !== 1 ? "s" : ""} defined`}
        actions={[{ label: "Add Plan", onClick: () => { setEditingPlan(null); setFormOpen(true); }, icon: <Plus className="size-3.5" /> }]}
      />

      <AdminResponsiveTable<PlanRecord>
        columns={columns} data={plans} keyExtractor={(p) => p.id}
        mobileCard={renderMobileCard} emptyState={emptyState}
      />

      {actionSheetTarget && (
        <AdminActionSheet
          open={actionSheetOpen} onOpenChange={(o) => { if (!o) { setActionSheetOpen(false); setActionSheetTarget(null); } }}
          title={actionSheetTarget.name}
          description="Plan actions"
          actions={actionSheetActions}
        />
      )}

      <PlanFormDialog open={formOpen} onOpenChange={(o) => { if (!o) { setFormOpen(false); setEditingPlan(null); } }}
        initialData={editingPlan ? (() => { const { id, created_at, updated_at, businesses_count, ...data } = editingPlan; return data; })() : null}
        onSave={handleSave} loading={saving} />

      <ConfirmDialog open={disableTarget !== null} onOpenChange={() => setDisableTarget(null)} onConfirm={handleToggleActive}
        title={disableTarget?.is_active ? "Disable Plan" : "Enable Plan"}
        description={disableTarget?.is_active ? `"${disableTarget?.name}" will no longer be available for new subscriptions.` : `"${disableTarget?.name}" will become available.`}
        confirmLabel={disableTarget?.is_active ? "Disable" : "Enable"}
        variant={disableTarget?.is_active ? "destructive" : "default"} loading={confirmLoading} />

      <ConfirmDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Plan" description={`Permanently delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete Permanently" variant="destructive" loading={confirmLoading} />
    </div>
  );
}
