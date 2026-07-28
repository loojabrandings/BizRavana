"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bug, ExternalLink, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSearchBar } from "@/components/admin/search-bar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type BugReport = Database["public"]["Tables"]["bug_reports"]["Row"] & {
  business_name: string;
};
type ReportStatus = BugReport["status"];

const statuses: Array<{ value: ReportStatus; label: string }> = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function AdminBugReportsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReportStatus>("all");
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bug_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;

      const businessIds = [...new Set((data ?? []).map((report) => report.business_id))];
      const { data: businesses } = businessIds.length > 0
        ? await supabase
            .from("businesses")
            .select("id, name")
            .in("id", businessIds)
        : { data: [] };
      const names = new Map((businesses ?? []).map((business) => [business.id, business.name]));
      setReports((data ?? []).map((report) => ({
        ...report,
        business_name: names.get(report.business_id) || "Unknown business",
      })));
    } catch (error) {
      console.error("Bug reports load failed:", error);
      toast.error("Bug reports could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReports();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadReports]);

  const updateLocal = (id: string, changes: Partial<BugReport>) => {
    setReports((current) => current.map((report) =>
      report.id === id ? { ...report, ...changes } : report,
    ));
  };

  const save = async (report: BugReport) => {
    setSavingId(report.id);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("bug_reports")
      .update({
        status: report.status,
        admin_notes: report.admin_notes?.trim() || null,
        resolved_at: ["resolved", "closed"].includes(report.status)
          ? report.resolved_at || now
          : null,
        updated_at: now,
      })
      .eq("id", report.id);
    setSavingId(null);
    if (error) {
      toast.error("Bug report could not be updated.");
      return;
    }
    toast.success("Bug report updated.");
    await loadReports();
  };

  const openScreenshot = async (report: BugReport) => {
    const response = await fetch(`/api/bug-reports/${report.id}/screenshot`);
    const result = await response.json() as { url?: string; error?: string };
    if (!response.ok || !result.url) {
      toast.error(result.error || "Screenshot could not be opened.");
      return;
    }
    window.open(result.url, "_blank", "noopener,noreferrer");
  };

  const filtered = reports.filter((report) => {
    if (statusFilter !== "all" && report.status !== statusFilter) return false;
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [
      report.title,
      report.description,
      report.business_name,
      report.page_url || "",
    ].some((value) => value.toLowerCase().includes(query));
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Bug Reports"
        subtitle="Review issues reported by BizRavana users and keep them updated."
      />

      <AdminSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search reports or businesses..."
        extras={
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter((value || "all") as typeof statusFilter)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center">
          <Bug className="mx-auto size-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No bug reports found.</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((report) => (
            <article key={report.id} className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">{report.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {report.business_name} · {new Date(report.created_at).toLocaleString()}
                  </p>
                </div>
                <Select value={report.status} onValueChange={(value) => updateLocal(report.id, { status: (value || "new") as ReportStatus })}>
                  <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What happened</p>
                  <p className="mt-1 whitespace-pre-wrap text-foreground/85">{report.description}</p>
                </div>
                {report.expected_result && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Expected result</p>
                    <p className="mt-1 whitespace-pre-wrap text-foreground/85">{report.expected_result}</p>
                  </div>
                )}
                {report.page_url && (
                  <a href={report.page_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    <ExternalLink className="size-3.5" /> Open reported page
                  </a>
                )}
                {report.screenshot_path && (
                  <button type="button" onClick={() => void openScreenshot(report)} className="ml-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    <ExternalLink className="size-3.5" /> View screenshot
                  </button>
                )}
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer">Browser details</summary>
                  <p className="mt-2 break-all">{report.browser_info || "Not provided"}</p>
                </details>
              </div>

              <div className="mt-4 space-y-2 border-t border-border/30 pt-4">
                <label className="text-sm font-medium">Admin response</label>
                <Textarea
                  value={report.admin_notes || ""}
                  onChange={(event) => updateLocal(report.id, { admin_notes: event.target.value })}
                  placeholder="Add an update the user can see..."
                  className="min-h-20"
                />
                <Button size="sm" onClick={() => void save(report)} disabled={savingId === report.id}>
                  {savingId === report.id ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save Update
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
