"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Ban,
  Building2,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { fetchUserEmails } from "@/lib/admin-utils";

// ══ Responsive Admin Components ══════════════════════════════════
import { AdminPageHeader } from "@/components/admin/page-header";
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

interface BusinessRow {
  id: string;
  name: string;
  owner_email: string | null;
  owner_name: string | null;
  plan_name: string | null;
  account_status: string;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  created_at: string;
  storage_mb: number;
}

// ══════════════════════════════════════════════════════════════════
// STATUS BADGE
// ══════════════════════════════════════════════════════════════════

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    trial: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    trial_expired: "bg-warning/10 text-warning border-warning/20",
    pending_payment: "bg-warning/10 text-warning border-warning/20",
    active: "bg-success/10 text-success border-success/20",
    expired: "bg-destructive/10 text-destructive border-destructive/20",
    suspended: "bg-destructive/10 text-destructive border-destructive/20",
    archived: "bg-muted text-muted-foreground border-border/20",
    deleted: "bg-muted text-muted-foreground border-border/20",
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
      styles[status] || "bg-muted text-muted-foreground",
    )}>
      {status.replace("_", " ")}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════
// BUSINESS MANAGEMENT PAGE
// ══════════════════════════════════════════════════════════════════

export default function AdminBusinessesPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Mobile action sheet
  const [actionSheetTarget, setActionSheetTarget] = useState<BusinessRow | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("businesses")
        .select(`
          id, name, account_status, trial_ends_at, subscription_ends_at, created_at,
          plan_id,
          owner_id
        `)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Batch-fetch owner profiles and plan names (avoid N+1)
      const ownerIds = [...new Set((data || []).map((b) => b.owner_id).filter(Boolean))];
      const planIds = [...new Set((data || []).map((b) => b.plan_id).filter(Boolean))];

      const [profilesRes, plansRes, emailMap] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name").in("user_id", ownerIds),
        supabase.from("subscription_plans").select("id, name").in("id", planIds),
        fetchUserEmails(ownerIds),
      ]);

      const profileMap = new Map((profilesRes.data || []).map((p) => [p.user_id, p]));
      const planMap = new Map((plansRes.data || []).map((p) => [p.id, p.name]));

      const enriched: BusinessRow[] = (data || []).map((b) => {
        const profile = profileMap.get(b.owner_id);
        return {
          id: b.id,
          name: b.name,
          owner_email: emailMap[b.owner_id] || null,
          owner_name: profile?.full_name || null,
          plan_name: b.plan_id ? planMap.get(b.plan_id) || null : null,
          account_status: b.account_status,
          trial_ends_at: b.trial_ends_at,
          subscription_ends_at: b.subscription_ends_at,
          created_at: b.created_at,
          storage_mb: 0,
        };
      });

      setBusinesses(enriched);
    } catch (err) {
      console.error("Failed to fetch businesses:", err);
      toast.error("Failed to load businesses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return businesses;
    const q = searchQuery.toLowerCase();
    return businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.owner_name?.toLowerCase().includes(q) ||
        b.owner_email?.toLowerCase().includes(q) ||
        b.plan_name?.toLowerCase().includes(q) ||
        b.account_status.includes(q),
    );
  }, [businesses, searchQuery]);

  const handleAction = useCallback(async (businessId: string, action: string) => {
    const supabase = createClient();
    try {
      switch (action) {
        case "activate":
          await supabase
            .from("businesses")
            .update({ account_status: "active", updated_at: new Date().toISOString() })
            .eq("id", businessId);
          toast.success("Business activated");
          break;
        case "suspend":
          await supabase
            .from("businesses")
            .update({ account_status: "suspended", updated_at: new Date().toISOString() })
            .eq("id", businessId);
          toast.success("Business suspended");
          break;
        default:
          return;
      }
      fetchBusinesses();
    } catch (err) {
      toast.error(`Failed to ${action} business`);
    }
  }, [fetchBusinesses]);

  // ── Mobile action sheet ─────────────────────────────────────
  const handleOpenActionSheet = useCallback((biz: BusinessRow) => {
    setActionSheetTarget(biz);
    setActionSheetOpen(true);
  }, []);

  const actionSheetActions: ActionSheetAction[] = useMemo(() => {
    if (!actionSheetTarget) return [];
    const actions: ActionSheetAction[] = [
      {
        label: "View Details",
        onClick: () => { router.push(`/admin/businesses/${actionSheetTarget.id}`); },
        icon: <ExternalLink className="size-4" />,
      },
    ];
    if (actionSheetTarget.account_status !== "active") {
      actions.push({
        label: "Activate",
        onClick: () => handleAction(actionSheetTarget.id, "activate"),
        icon: <BadgeCheck className="size-4" />,
        variant: "success",
      });
    }
    if (actionSheetTarget.account_status !== "suspended" && actionSheetTarget.account_status !== "expired") {
      actions.push({
        label: "Suspend",
        onClick: () => handleAction(actionSheetTarget.id, "suspend"),
        icon: <Ban className="size-4" />,
        variant: "destructive",
      });
    }
    return actions;
  }, [actionSheetTarget, router, handleAction]);

  // ── Desktop columns ─────────────────────────────────────────
  const columns: Column<BusinessRow>[] = useMemo(() => [
    {
      header: "Business",
      accessor: (business) => (
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{business.name}</p>
            {business.plan_name && <p className="text-xs text-muted-foreground/60">{business.plan_name} plan</p>}
          </div>
        </div>
      ),
    },
    {
      header: "Owner",
      hideBelow: "md",
      accessor: (business) => (
        <div>
          <p className="text-sm text-foreground/80">{business.owner_name || "—"}</p>
          {business.owner_email && <p className="text-xs text-muted-foreground/60">{business.owner_email}</p>}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (business) => <StatusBadge status={business.account_status} />,
    },
    {
      header: "Expiry",
      accessor: (business) => (
        <span className="text-sm text-muted-foreground/80 tabular-nums">
          {business.subscription_ends_at
            ? new Date(business.subscription_ends_at).toLocaleDateString()
            : business.trial_ends_at
              ? new Date(business.trial_ends_at).toLocaleDateString()
              : "—"}
        </span>
      ),
    },
    {
      header: "Joined",
      hideBelow: "md",
      accessor: (business) => (
        <span className="text-sm text-muted-foreground/80">
          {new Date(business.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "",
      className: "w-12",
      accessor: (business) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex size-8 items-center justify-center rounded-lg max-lg:opacity-100 opacity-0 group-hover:opacity-100 hover:bg-muted transition-all">
                <MoreHorizontal className="size-4 text-muted-foreground" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => router.push(`/admin/businesses/${business.id}`)}>
              <ExternalLink className="size-3.5 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {business.account_status !== "active" && (
              <DropdownMenuItem onClick={() => handleAction(business.id, "activate")}>
                <BadgeCheck className="size-3.5 mr-2 text-success" />
                Activate
              </DropdownMenuItem>
            )}
            {business.account_status !== "suspended" && business.account_status !== "expired" && (
              <DropdownMenuItem onClick={() => handleAction(business.id, "suspend")}>
                <Ban className="size-3.5 mr-2 text-destructive" />
                Suspend
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [router, handleAction]);

  // ── Mobile card renderer ────────────────────────────────────
  const renderMobileCard = useCallback((business: BusinessRow) => (
    <AdminMobileRecordCard
      primary={business.name}
      status={<StatusBadge status={business.account_status} />}
      details={[
        {
          label: "Owner",
          value: <span>{business.owner_name || "—"}{business.owner_email ? ` · ${business.owner_email}` : ""}</span>,
        },
        ...(business.plan_name ? [{
          label: "Plan",
          value: <span className="font-medium">{business.plan_name}</span>,
        }] : []),
        {
          label: "Expiry",
          value: <span className="tabular-nums">
            {business.subscription_ends_at
              ? new Date(business.subscription_ends_at).toLocaleDateString()
              : business.trial_ends_at
                ? new Date(business.trial_ends_at).toLocaleDateString()
                : "—"}
          </span>,
        },
        {
          label: "Joined",
          value: <span className="tabular-nums">{new Date(business.created_at).toLocaleDateString()}</span>,
        },
      ]}
      actions={
        <>
          <button
            type="button"
            onClick={() => router.push(`/admin/businesses/${business.id}`)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium min-h-11 hover:bg-accent transition-colors"
          >
            <ExternalLink className="size-3.5" />
            View
          </button>
          <button
            type="button"
            onClick={() => handleOpenActionSheet(business)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium min-h-11 hover:bg-primary/90 transition-colors"
          >
            More
          </button>
        </>
      }
    />
  ), [router, handleOpenActionSheet]);

  // ── Empty state ─────────────────────────────────────────────
  const emptyState = (
    <div className="flex flex-col items-center gap-2 py-8">
      <Building2 className="size-8 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground/60">
        {searchQuery ? "No businesses match your search." : "No businesses found."}
      </p>
    </div>
  );

  // ── Loading ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      <AdminPageHeader
        title="Businesses"
        subtitle={`${businesses.length} business${businesses.length !== 1 ? "es" : ""} registered`}
      />

      <AdminSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search businesses..."
      />

      <AdminResponsiveTable<BusinessRow>
        columns={columns}
        data={filtered}
        keyExtractor={(b) => b.id}
        mobileCard={renderMobileCard}
        emptyState={emptyState}
      />

      {actionSheetTarget && (
        <AdminActionSheet
          open={actionSheetOpen}
          onOpenChange={(open) => { if (!open) { setActionSheetOpen(false); setActionSheetTarget(null); } }}
          title={actionSheetTarget.name}
          description={`${actionSheetTarget.plan_name || "No plan"} · ${actionSheetTarget.account_status.replace("_", " ")}`}
          actions={actionSheetActions}
        />
      )}
    </div>
  );
}
