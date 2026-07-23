"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellOff,
  BellRing,
  CalendarClock,
  CheckCheck,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Megaphone,
  MessageSquare,
  PauseCircle,
  PlayCircle,
  Send,
  Settings2,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Broadcast {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  audience_type: string;
  audience_config: Record<string, unknown>;
  action_label: string | null;
  action_url: string | null;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  expires_at: string | null;
  recipient_count: number;
  read_count: number;
  created_by: string | null;
  created_at: string;
}

interface NotificationRule {
  id: string;
  rule_key: string;
  name: string;
  description: string | null;
  category: string;
  priority: string;
  trigger_config: Record<string, unknown>;
  template_title: string;
  template_message: string;
  is_enabled: boolean;
  is_essential: boolean;
  last_executed_at: string | null;
  created_at: string;
}

interface StatsSummary {
  totalSent: number;
  scheduled: number;
  drafts: number;
  activeRules: number;
}

type TabKey = "overview" | "create" | "sent" | "scheduled" | "rules";

// ══════════════════════════════════════════════════════════════════
// CATEGORY/PRIORITY CONFIG
// ══════════════════════════════════════════════════════════════════

const categories = [
  { value: "general", label: "General", icon: "ℹ️" },
  { value: "announcement", label: "Announcement", icon: "📢" },
  { value: "subscription", label: "Subscription", icon: "📅" },
  { value: "payment", label: "Payment", icon: "💳" },
  { value: "maintenance", label: "Maintenance", icon: "🔧" },
  { value: "usage", label: "Usage", icon: "📊" },
  { value: "storage", label: "Storage", icon: "💾" },
  { value: "security", label: "Security", icon: "🛡️" },
  { value: "account", label: "Account", icon: "👤" },
];

const priorities = [
  { value: "normal", label: "Normal", color: "bg-blue-500/10 text-blue-500" },
  { value: "important", label: "Important", color: "bg-warning/10 text-warning" },
  { value: "urgent", label: "Urgent", color: "bg-destructive/10 text-destructive" },
];

const audienceOptions = [
  { value: "all", label: "All Businesses" },
  { value: "active", label: "Active Subscriptions" },
  { value: "trial", label: "Trial Accounts" },
  { value: "expired", label: "Expired Accounts" },
  { value: "suspended", label: "Suspended Accounts" },
  { value: "basic_plan", label: "Basic Plan" },
  { value: "standard_plan", label: "Standard Plan" },
  { value: "premium_plan", label: "Premium Plan" },
  { value: "enterprise_plan", label: "Enterprise Plan" },
];

function CategoryBadge({ category }: { category: string }) {
  const cat = categories.find((c) => c.value === category);
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/20 bg-muted/30 px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {cat?.icon || "📌"} {cat?.label || category}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const p = priorities.find((pr) => pr.value === priority);
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold", p?.color || "bg-muted/30 text-muted-foreground")}>
      {p?.label || priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; icon: typeof Send; style: string }> = {
    draft: { label: "Draft", icon: Bell, style: "bg-muted/30 text-muted-foreground border-border/20" },
    scheduled: { label: "Scheduled", icon: CalendarClock, style: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    sent: { label: "Sent", icon: Send, style: "bg-success/10 text-success border-success/20" },
    cancelled: { label: "Cancelled", icon: BellOff, style: "bg-destructive/10 text-destructive border-destructive/20" },
    archived: { label: "Archived", icon: EyeOff, style: "bg-muted/30 text-muted-foreground border-border/20" },
  };
  const match = config[status];
  if (match) {
    const Icon = match.icon;
    return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold", match.style)}><Icon className="size-2.5" />{match.label}</span>;
  }
  return <span className="inline-flex items-center gap-1 rounded-full border border-border/20 bg-muted/30 px-2 py-0.5 text-xs font-semibold text-muted-foreground capitalize">{status}</span>;
}

function AudienceBadge({ type }: { type: string }) {
  const opt = audienceOptions.find((o) => o.value === type);
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/20 bg-muted/30 px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {opt?.label || type}
    </span>
  );
}

function StatsCard({ label, value, icon: Icon, accent }: {
  label: string; value: string | number; icon: typeof Bell;
  accent: "primary" | "warning" | "success" | "default";
}) {
  const styles: Record<string, string> = {
    primary: "bg-primary/10 text-primary border-primary/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    success: "bg-success/10 text-success border-success/20",
    default: "bg-muted/30 text-muted-foreground border-border/20",
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/20 bg-card p-4">
      <div className={cn("flex size-10 items-center justify-center rounded-lg", styles[accent])}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</p>
        <p className="text-xs text-muted-foreground/70">{label}</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// CREATE BROADCAST DIALOG
// ══════════════════════════════════════════════════════════════════

function CreateBroadcastDialog({ open, onOpenChange, onCreated }: {
  open: boolean; onOpenChange: (open: boolean) => void; onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("announcement");
  const [priority, setPriority] = useState("normal");
  const [audienceType, setAudienceType] = useState("all");
  const [actionLabel, setActionLabel] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [sendTiming, setSendTiming] = useState<"now" | "schedule" | "draft">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [recipientPreview, setRecipientPreview] = useState<number | null>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => { if (open) { setTitle(""); setMessage(""); setCategory("announcement"); setPriority("normal"); setAudienceType("all"); setActionLabel(""); setActionUrl(""); setSendTiming("now"); setScheduledDate(""); setScheduledTime(""); setRecipientPreview(null); } }, [open]);

  // ── Preview recipient count ───────────────────────────────
  const fetchRecipientCount = useCallback(async () => {
    try {
      let query = supabase.from("businesses").select("*", { count: "exact", head: true }).is("deleted_at", null);
      if (audienceType === "active") query = query.eq("account_status", "active");
      else if (audienceType === "trial") query = query.eq("account_status", "trial");
      else if (audienceType === "expired") query = query.in("account_status", ["expired", "trial_expired"]);
      else if (audienceType === "suspended") query = query.eq("account_status", "suspended");
      else if (audienceType !== "all") {
        // Plan-based — count with a simpler approach
        const planName = audienceType.replace("_plan", "");
        const { data: plans } = await supabase.from("subscription_plans").select("id").ilike("name", planName);
        if (plans && plans.length > 0) {
          query = query.in("plan_id", plans.map((p) => p.id));
        }
      }
      const { count } = await query;
      setRecipientPreview(count);
    } catch { setRecipientPreview(null); }
  }, [audienceType, supabase]);

  useEffect(() => { if (open && audienceType !== "selected") fetchRecipientCount(); }, [open, audienceType, fetchRecipientCount]);

  // ── Save ──────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const status = sendTiming === "draft" ? "draft" : sendTiming === "schedule" ? "scheduled" : "sent";
      let scheduledAt: string | null = null;
      if (sendTiming === "schedule" && scheduledDate) {
        scheduledAt = scheduledTime ? `${scheduledDate}T${scheduledTime}:00` : `${scheduledDate}T00:00:00`;
      }

      const { data, error } = await supabase.from("notification_broadcasts").insert({
        title: title.trim(),
        message: message.trim(),
        category,
        priority,
        audience_type: audienceType,
        audience_config: {},
        action_label: actionLabel.trim() || null,
        action_url: actionUrl.trim() || null,
        status,
        scheduled_at: scheduledAt,
        created_by: session?.user?.id || null,
      }).select("id").single();

      if (error) throw error;

      // If sending now, deliver immediately via the server API
      if (sendTiming === "now" && data) {
        await supabase.from("notification_broadcasts").update({
          status: "sent",
          sent_at: new Date().toISOString(),
        }).eq("id", data.id);

        // Call the deliver API to actually insert notification records
        const res = await fetch("/api/admin/deliver-broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ broadcastId: data.id }),
        });
        if (res.ok) {
          const result = await res.json();
          toast.success(`Delivered to ${result.delivered} business${result.delivered !== 1 ? "es" : ""}`);
        } else {
          const errData = await res.json();
          toast.error(`Failed to deliver: ${errData.error || "Unknown error"}`);
        }
      }

      // Log activity
      await supabase.from("admin_activity_log").insert({
        admin_id: session?.user?.id,
        action: sendTiming === "draft" ? "notification_draft_created" : sendTiming === "schedule" ? "notification_scheduled" : "notification_sent",
        target_type: "notification_broadcast",
        target_id: data?.id,
        details: { title: title.trim(), audience_type: audienceType, category, priority },
      });

      toast.success(sendTiming === "draft" ? "Draft saved" : sendTiming === "schedule" ? "Notification scheduled" : "Notification sent");
      onOpenChange(false);
      onCreated();
    } catch (err) {
      console.error("Failed to create notification:", err);
      toast.error("Failed to create notification");
    } finally { setSaving(false); }
  }, [title, message, category, priority, audienceType, actionLabel, actionUrl, sendTiming, scheduledDate, scheduledTime, supabase, onOpenChange, onCreated]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 mb-2">
            <Megaphone className="size-5 text-primary" />
          </div>
          <DialogTitle>Create Notification</DialogTitle>
          <DialogDescription>Send a broadcast notification to businesses.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/90">Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Scheduled Maintenance" className="h-9" maxLength={100} />
            <p className="text-xs text-muted-foreground/50">{title.length}/100</p>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground/90">Message *</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter notification message..." className="min-h-[80px] resize-y" rows={3} maxLength={500} />
            <p className="text-xs text-muted-foreground/50">{message.length}/500</p>
          </div>

          {/* Category + Priority */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground/90">Category</Label>
              <Select value={category} onValueChange={(val) => setCategory(val || "announcement")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground/90">Priority</Label>
              <Select value={priority} onValueChange={(val) => setPriority(val || "normal")}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Audience */}
          <div className="space-y-1.5">              <Label className="text-sm font-medium text-foreground/90">Audience</Label>
              <Select value={audienceType} onValueChange={(val) => setAudienceType(val || "all")}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {audienceOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {recipientPreview !== null && (
              <p className="text-xs text-muted-foreground/60 mt-1">
                Recipients: <strong className="text-foreground">{recipientPreview.toLocaleString()} businesses</strong>
              </p>
            )}
          </div>

          {/* Action */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground/90">Action Label (optional)</Label>
              <Input value={actionLabel} onChange={(e) => setActionLabel(e.target.value)} placeholder="e.g., View Details" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground/90">Action URL (optional)</Label>
              <Input value={actionUrl} onChange={(e) => setActionUrl(e.target.value)} placeholder="e.g., /dashboard/settings" className="h-9" />
            </div>
          </div>

          {/* Send Timing */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground/90">Send Timing</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "now", label: "Send Now", icon: Send },
                { value: "schedule", label: "Schedule", icon: CalendarClock },
                { value: "draft", label: "Save as Draft", icon: Bell },
              ].map((opt) => {
                const Icon = opt.icon;
                const isActive = sendTiming === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => setSendTiming(opt.value as typeof sendTiming)}
                    className={cn("inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                      isActive ? "border-primary/50 bg-primary/5 text-primary ring-1 ring-primary/20" : "border-border/20 text-muted-foreground/70 hover:border-border/40 hover:text-foreground")}>
                    <Icon className="size-3.5" />{opt.label}</button>
                );
              })}
            </div>
          </div>

          {/* Schedule date/time */}
          {sendTiming === "schedule" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground/90">Date</Label>
                <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground/90">Time</Label>
                <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="h-9" />
              </div>
            </div>
          )}

          {/* Preview card */}
          <div className="rounded-xl border border-border/20 bg-muted/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2">Preview</p>
            <div className="flex items-start gap-3">
              <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl",
                category === "maintenance" ? "bg-warning/10" : category === "payment" ? "bg-success/10" : "bg-primary/10")}>
                <Bell className={cn("size-4", category === "maintenance" ? "text-warning" : category === "payment" ? "text-success" : "text-primary")} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground">{title || "Notification Title"}</p>
                  <PriorityBadge priority={priority} />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground/70 line-clamp-2">{message || "Notification message will appear here."}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-muted-foreground/40">Just now</span>
                  <CategoryBadge category={category} />
                  <AudienceBadge type={audienceType} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !title.trim() || !message.trim()}>
            {saving && <Loader2 className="size-4 animate-spin mr-1.5" />}
            {sendTiming === "now" ? "Send Now" : sendTiming === "schedule" ? "Schedule" : "Save Draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Data
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [stats, setStats] = useState<StatsSummary>({ totalSent: 0, scheduled: 0, drafts: 0, activeRules: 0 });

  // Dialogs
  const [showCreate, setShowCreate] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Broadcast | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  // ── Fetch Data ────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [broadcastsRes, rulesRes] = await Promise.all([
        supabase.from("notification_broadcasts").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("notification_rules").select("*").order("rule_key"),
      ]);

      const bData = (broadcastsRes.data || []) as Broadcast[];
      const rData = (rulesRes.data || []) as NotificationRule[];

      setBroadcasts(bData);
      setRules(rData);

      setStats({
        totalSent: bData.filter((b) => b.status === "sent").length,
        scheduled: bData.filter((b) => b.status === "scheduled").length,
        drafts: bData.filter((b) => b.status === "draft").length,
        activeRules: rData.filter((r) => r.is_enabled).length,
      });
    } catch (err) {
      console.error("Failed to fetch notification data:", err);
    } finally { setLoading(false); }
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Cancel Scheduled ─────────────────────────────────────
  const handleCancel = useCallback(async () => {
    if (!cancelTarget) return;
    try {
      await supabase.from("notification_broadcasts").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", cancelTarget.id);
      toast.success(`Scheduled broadcast cancelled`);
      setCancelTarget(null);
      fetchData();
    } catch { toast.error("Failed to cancel"); }
  }, [cancelTarget, supabase, fetchData]);

  // ── Toggle Rule ──────────────────────────────────────────
  const handleToggleRule = useCallback(async (rule: NotificationRule) => {
    try {
      if (rule.is_essential && rule.is_enabled) {
        toast.warning("This is an essential notification and cannot be disabled.");
        return;
      }
      await supabase.from("notification_rules").update({ is_enabled: !rule.is_enabled, updated_at: new Date().toISOString() }).eq("id", rule.id);
      toast.success(`${rule.is_enabled ? "Disabled" : "Enabled"} rule: ${rule.name}`);
      fetchData();
    } catch { toast.error("Failed to update rule"); }
  }, [supabase, fetchData]);

  // ── Duplicate Broadcast ──────────────────────────────────
  const handleDuplicate = useCallback(async (broadcast: Broadcast) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from("notification_broadcasts").insert({
        title: broadcast.title + " (Copy)",
        message: broadcast.message,
        category: broadcast.category,
        priority: broadcast.priority,
        audience_type: broadcast.audience_type,
        audience_config: broadcast.audience_config,
        action_label: broadcast.action_label,
        action_url: broadcast.action_url,
        status: "draft",
        created_by: session?.user?.id || null,
      });
      toast.success("Duplicated as draft");
      fetchData();
    } catch { toast.error("Failed to duplicate"); }
  }, [supabase, fetchData]);

  // ── Filtered ─────────────────────────────────────────────
  const filteredBroadcasts = useMemo(() => {
    let result = broadcasts;
    if (activeTab === "sent") result = result.filter((b) => b.status === "sent");
    else if (activeTab === "scheduled") result = result.filter((b) => b.status === "scheduled");
    else if (activeTab === "overview") result = result.filter((b) => b.status === "sent" || b.status === "scheduled" || b.status === "draft");
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((b) => b.title.toLowerCase().includes(q) || b.message.toLowerCase().includes(q) || b.category.includes(q));
    }
    return result;
  }, [broadcasts, activeTab, searchQuery]);

  const filteredRules = useMemo(() => {
    let result = rules;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(q) || r.category.includes(q) || r.rule_key.includes(q));
    }
    return result;
  }, [rules, searchQuery]);

  // ── Columns: Sent Broadcasts ─────────────────────────────
  const sentColumns: Column<Broadcast>[] = useMemo(() => [
    { header: "Title", accessor: (b) => (
      <div className="min-w-0 max-w-[200px]">
        <p className="text-sm font-medium text-foreground truncate">{b.title}</p>
        <p className="text-xs text-muted-foreground/60 truncate">{b.message}</p>
      </div>
    )},
    { header: "Category", hideBelow: "sm", accessor: (b) => <CategoryBadge category={b.category} /> },
    { header: "Priority", hideBelow: "sm", accessor: (b) => <PriorityBadge priority={b.priority} /> },
    { header: "Audience", hideBelow: "md", accessor: (b) => <AudienceBadge type={b.audience_type} /> },
    { header: "Sent", accessor: (b) => {
      const date = b.sent_at || b.created_at;
      return <span className="text-sm text-muted-foreground/80 tabular-nums">{new Date(date).toLocaleDateString()}</span>;
    }},
    { header: "Read", hideBelow: "lg", accessor: (b) => (
      <span className="text-sm tabular-nums text-muted-foreground/80">{b.read_count || 0} / {b.recipient_count || 0}</span>
    )},
    { header: "", className: "w-36", headerClassName: "hidden sm:table-cell", accessor: (b) => (
      <div className="flex items-center gap-1 max-lg:opacity-100 opacity-0 group-hover:opacity-100 transition-opacity">
        {b.status === "draft" && (
          <>
            <button type="button" onClick={() => {
              fetch("/api/admin/deliver-broadcast", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ broadcastId: b.id }),
              }).then((r) => r.json()).then((result) => {
                if (result.delivered !== undefined) {
                  toast.success(`Sent to ${result.delivered} business${result.delivered !== 1 ? "es" : ""}`);
                  fetchData();
                } else {
                  toast.error(result.error || "Delivery failed");
                }
              }).catch(() => toast.error("Delivery failed"));
            }} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-success hover:bg-success/10 transition-colors" title="Send now">
              <Send className="size-3" /> Send
            </button>
            <button type="button" onClick={() => handleDuplicate(b)} className="flex size-7 items-center justify-center rounded-md hover:bg-muted transition-colors" title="Duplicate">
              <Copy className="size-3.5 text-muted-foreground/60" />
            </button>
          </>
        )}
        {b.status === "scheduled" && (
          <>
            <button type="button" onClick={() => {
              fetch("/api/admin/deliver-broadcast", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ broadcastId: b.id }),
              }).then((r) => r.json()).then((result) => {
                if (result.delivered !== undefined) {
                  toast.success(`Sent to ${result.delivered} business${result.delivered !== 1 ? "es" : ""}`);
                  fetchData();
                } else {
                  toast.error(result.error || "Delivery failed");
                }
              }).catch(() => toast.error("Delivery failed"));
            }} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-success hover:bg-success/10 transition-colors" title="Send now">
              <Send className="size-3" /> Send Now
            </button>
            <button type="button" onClick={() => setCancelTarget(b)} className="flex size-7 items-center justify-center rounded-md hover:bg-muted transition-colors" title="Cancel">
              <Trash2 className="size-3.5 text-destructive/60" />
            </button>
          </>
        )}
      </div>
    )},
  ], [handleDuplicate, fetchData]);

  // ── Columns: Rules ───────────────────────────────────────
  const rulesColumns: Column<NotificationRule>[] = useMemo(() => [
    { header: "Rule", accessor: (r) => (
      <div className="min-w-0 max-w-[200px]">
        <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
        {r.description && <p className="text-xs text-muted-foreground/60 truncate">{r.description}</p>}
      </div>
    )},
    { header: "Trigger", hideBelow: "sm", accessor: (r) => (
      <span className="text-xs text-muted-foreground/80 font-mono">{r.rule_key}</span>
    )},
    { header: "Category", hideBelow: "md", accessor: (r) => <CategoryBadge category={r.category} /> },
    { header: "Priority", hideBelow: "md", accessor: (r) => <PriorityBadge priority={r.priority} /> },
    { header: "Status", accessor: (r) => (
      <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
        r.is_enabled ? "bg-success/10 text-success border-success/20" : "bg-muted/30 text-muted-foreground border-border/20")}>
        {r.is_enabled ? <PlayCircle className="size-2.5" /> : <PauseCircle className="size-2.5" />}
        {r.is_enabled ? "Enabled" : "Disabled"}
      </span>
    )},
    { header: "Last Run", hideBelow: "lg", accessor: (r) => (
      <span className="text-sm text-muted-foreground/80 tabular-nums">{r.last_executed_at ? new Date(r.last_executed_at).toLocaleDateString() : "—"}</span>
    )},
    { header: "", className: "w-12", headerClassName: "hidden sm:table-cell", accessor: (r) => (
      <button type="button" onClick={() => handleToggleRule(r)}
        className={cn("flex size-7 items-center justify-center rounded-md transition-colors",
          r.is_enabled ? "text-muted-foreground/50 hover:text-warning hover:bg-warning/10" : "text-muted-foreground/50 hover:text-success hover:bg-success/10")}
        title={r.is_enabled && r.is_essential ? "Essential — cannot disable" : r.is_enabled ? "Disable" : "Enable"}>
        {r.is_enabled ? <PauseCircle className="size-3.5" /> : <PlayCircle className="size-3.5" />}
      </button>
    )},
  ], [handleToggleRule]);

  // ── Mobile card: Broadcasts ─────────────────────────────
  const renderMobileCard = useCallback((b: Broadcast) => (
    <AdminMobileRecordCard
      primary={b.title}
      status={<StatusBadge status={b.status} />}
      details={[
        { label: "Category", value: <CategoryBadge category={b.category} /> },
        { label: "Priority", value: <PriorityBadge priority={b.priority} /> },
        { label: "Audience", value: <AudienceBadge type={b.audience_type} /> },
        { label: "Sent", value: <span className="tabular-nums">{new Date(b.sent_at || b.created_at).toLocaleDateString()}</span> },
        { label: "Read", value: <span>{b.read_count || 0} / {b.recipient_count || 0}</span> },
      ]}
      actions={
        <>
          {(b.status === "draft" || b.status === "scheduled") && (
            <button type="button" onClick={() => {
              fetch("/api/admin/deliver-broadcast", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ broadcastId: b.id }),
              }).then((r) => r.json()).then((result) => {
                if (result.delivered !== undefined) {
                  toast.success(`Sent to ${result.delivered} business${result.delivered !== 1 ? "es" : ""}`);
                  fetchData();
                } else {
                  toast.error(result.error || "Delivery failed");
                }
              }).catch(() => toast.error("Delivery failed"));
            }} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium min-h-11 hover:bg-primary/90 transition-colors">
              <Send className="size-3.5" /> Send Now
            </button>
          )}
        </>
      }
    />
  ), []);

  // ── Mobile card: Rules ───────────────────────────────────
  const renderRuleMobileCard = useCallback((r: NotificationRule) => (
    <AdminMobileRecordCard
      primary={r.name}
      status={<span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
        r.is_enabled ? "bg-success/10 text-success border-success/20" : "bg-muted/30 text-muted-foreground border-border/20")}>
        {r.is_enabled ? "Enabled" : "Disabled"}</span>}
      details={[
        { label: "Trigger", value: <span className="font-mono text-xs">{r.rule_key}</span> },
        { label: "Category", value: <CategoryBadge category={r.category} /> },
        { label: "Priority", value: <PriorityBadge priority={r.priority} /> },
        ...(r.last_executed_at ? [{ label: "Last Run", value: <span className="tabular-nums">{new Date(r.last_executed_at).toLocaleDateString()}</span> }] : []),
      ]}
      actions={
        <button type="button" onClick={() => handleToggleRule(r)}
          className={cn("inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium min-h-11",
            r.is_enabled ? "bg-warning/10 text-warning border border-warning/20" : "bg-success/10 text-success border border-success/20")}>
          {r.is_enabled ? <PauseCircle className="size-3.5" /> : <PlayCircle className="size-3.5" />}
          {r.is_enabled ? "Disable" : "Enable"}
        </button>
      }
    />
  ), [handleToggleRule]);

  // ── Tabs ─────────────────────────────────────────────────
  const tabs = [
    { key: "overview", label: "Overview", count: stats.totalSent + stats.scheduled + stats.drafts },
    { key: "create", label: "Create", icon: "+" },
    { key: "sent", label: "Sent", count: stats.totalSent },
    { key: "scheduled", label: "Scheduled", count: stats.scheduled },
    { key: "rules", label: "Automated Rules", count: stats.activeRules },
  ];

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeTab !== "overview") count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [activeTab, searchQuery]);

  const handleClearFilters = useCallback(() => { setActiveTab("overview"); setSearchQuery(""); }, []);

  // ── Loading ──────────────────────────────────────────────
  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground/50" /></div>;

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      <AdminPageHeader
        title="Notification Management"
        subtitle="Create and manage platform-wide broadcasts and automated notifications"
        actions={[{ label: "New Notification", onClick: () => setShowCreate(true), variant: "primary" }]}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatsCard label="Total Sent" value={stats.totalSent} icon={Send} accent="success" />
        <StatsCard label="Scheduled" value={stats.scheduled} icon={CalendarClock} accent="warning" />
        <StatsCard label="Drafts" value={stats.drafts} icon={Bell} accent="default" />
        <StatsCard label="Active Rules" value={stats.activeRules} icon={Settings2} accent="primary" />
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <AdminMobileTabs tabs={tabs} activeTab={activeTab} onTabChange={(k) => setActiveTab(k as TabKey)} />
        <AdminSearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search notifications..." filterCount={activeFilterCount} onClearFilters={handleClearFilters} />
      </div>

      {/* ── Tab Content ──────────────────────────────────────── */}
      {activeTab === "create" ? (
        <div className="rounded-2xl border border-border/40 bg-card p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <Megaphone className="size-10 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold text-foreground">Create a New Notification</h3>
            <p className="text-sm text-muted-foreground/70 max-w-md">Send a broadcast to all businesses, filter by subscription plan, or target specific accounts.</p>
            <Button onClick={() => setShowCreate(true)}>
              <Megaphone className="size-4 mr-1.5" /> Open Create Dialog
            </Button>
          </div>
        </div>
      ) : activeTab === "rules" ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Automated Notification Rules</h3>
              <p className="text-xs text-muted-foreground/70 mt-0.5">System notifications sent automatically based on triggers. Essential rules cannot be disabled.</p>
            </div>
          </div>
          {rules.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <Settings2 className="size-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground/60">No automated rules configured.</p>
            </div>
          ) : searchQuery ? (
            <AdminResponsiveTable<NotificationRule>
              columns={rulesColumns} data={filteredRules} keyExtractor={(r) => r.id}
              mobileCard={renderRuleMobileCard}
              emptyState={<div className="flex flex-col items-center gap-2 py-4"><Settings2 className="size-8 text-muted-foreground/30" /><p className="text-sm text-muted-foreground/60">No rules match your search.</p></div>}
            />
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between rounded-xl border border-border/20 bg-card p-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl mt-0.5",
                      rule.is_enabled ? "bg-primary/10" : "bg-muted/30")}>
                      <BellRing className={cn("size-4", rule.is_enabled ? "text-primary" : "text-muted-foreground/50")} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{rule.name}</p>
                        {rule.is_essential && (
                          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">Essential</span>
                        )}
                      </div>
                      {rule.description && <p className="text-xs text-muted-foreground/60 mt-0.5">{rule.description}</p>}
                      <div className="flex items-center gap-2 mt-1.5">
                        <CategoryBadge category={rule.category} />
                        <PriorityBadge priority={rule.priority} />
                        <span className="text-[10px] text-muted-foreground/40 font-mono">{rule.rule_key}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                      <span className={cn(
                        rule.is_enabled ? "text-success" : "text-muted-foreground/50"
                      )}>{rule.is_enabled ? "Enabled" : "Disabled"}</span>
                    </div>
                    <Switch
                      checked={rule.is_enabled}
                      onCheckedChange={() => handleToggleRule(rule)}
                      disabled={rule.is_essential && rule.is_enabled}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <AdminResponsiveTable<Broadcast>
          columns={sentColumns} data={filteredBroadcasts} keyExtractor={(b) => b.id}
          mobileCard={renderMobileCard}
          emptyState={
            <div className="flex flex-col items-center gap-2 py-4">
              <Bell className="size-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground/60">
                {searchQuery ? "No notifications match your search." : activeTab === "scheduled" ? "No scheduled notifications." : "No notifications sent yet."}
              </p>
            </div>
          }
        />
      )}

      {/* Dialogs */}
      <CreateBroadcastDialog open={showCreate} onOpenChange={setShowCreate} onCreated={fetchData} />
      <ConfirmDialog
        open={cancelTarget !== null} onOpenChange={() => setCancelTarget(null)} onConfirm={handleCancel}
        title="Cancel Scheduled Broadcast"
        description={`Cancel "${cancelTarget?.title}"? It will not be sent.`}
        confirmLabel="Cancel Broadcast"
        variant="destructive"
      />
    </div>
  );
}
