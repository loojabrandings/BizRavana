"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Bug, Camera, ExternalLink, Eye, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ReportStatus = "new" | "reviewing" | "in_progress" | "resolved" | "closed";
interface UserBugReport {
  id: string;
  title: string;
  description: string;
  expected_result: string | null;
  status: ReportStatus;
  admin_notes: string | null;
  screenshot_path: string | null;
  page_url: string | null;
  created_at: string;
  updated_at: string;
}

const statusLabels: Record<ReportStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export function BugReportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [tab, setTab] = useState<"report" | "history">("report");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expectedResult, setExpectedResult] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reports, setReports] = useState<UserBugReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<UserBugReport | null>(null);

  const loadReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const response = await fetch("/api/bug-reports", { cache: "no-store" });
      const result = await response.json() as { reports?: UserBugReport[]; error?: string };
      if (!response.ok) throw new Error(result.error || "Reports could not be loaded.");
      setReports(result.reports ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reports could not be loaded.");
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    if (!open || tab !== "history") return;
    const timer = window.setTimeout(() => {
      void loadReports();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadReports, open, tab]);

  const submit = async () => {
    if (title.trim().length < 3 || description.trim().length < 10) {
      toast.error("Add a title and describe what happened.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.set("title", title);
      payload.set("description", description);
      payload.set("expectedResult", expectedResult);
      payload.set("pageUrl", window.location.href);
      payload.set("browserInfo", navigator.userAgent);
      if (screenshot) payload.set("screenshot", screenshot);

      const response = await fetch("/api/bug-reports", { method: "POST", body: payload });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Bug report could not be submitted.");

      setTitle("");
      setDescription("");
      setExpectedResult("");
      setScreenshot(null);
      toast.success("Bug report submitted.", {
        description: "You can follow its progress under My Reports.",
      });
      setTab("history");
      await loadReports();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bug report could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  };

  const openScreenshot = async (report: UserBugReport) => {
    const response = await fetch(`/api/bug-reports/${report.id}/screenshot`);
    const result = await response.json() as { url?: string; error?: string };
    if (!response.ok || !result.url) {
      toast.error(result.error || "Screenshot could not be opened.");
      return;
    }
    window.open(result.url, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="size-5 text-primary" />
            Report a Bug
          </DialogTitle>
          <DialogDescription>
            Tell us what went wrong so we can investigate it.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 rounded-xl bg-muted/40 p-1">
          {(["report", "history"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setTab(item);
                setSelectedReport(null);
              }}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                tab === item ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {item === "report" ? "Report Bug" : "My Reports"}
            </button>
          ))}
        </div>

        {tab === "report" ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Issue title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} placeholder="Short summary of the issue" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">What happened?</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} className="min-h-28" placeholder="Explain the steps and what you saw..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">What did you expect?</label>
              <Textarea value={expectedResult} onChange={(e) => setExpectedResult(e.target.value)} maxLength={3000} className="min-h-20" placeholder="Describe the result you expected..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Screenshot <span className="text-muted-foreground">(optional)</span></label>
              <label className="flex min-h-24 cursor-pointer items-center justify-center rounded-xl border border-dashed border-border bg-muted/15 p-4 text-center hover:bg-muted/30">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (file && file.size > 5 * 1024 * 1024) {
                      toast.error("Screenshot must be smaller than 5 MB.");
                      e.target.value = "";
                      return;
                    }
                    setScreenshot(file);
                  }}
                />
                {screenshot ? (
                  <span className="flex items-center gap-2 text-sm">
                    <Camera className="size-4 text-primary" />
                    <span className="max-w-[300px] truncate">{screenshot.name}</span>
                    <button type="button" onClick={(e) => { e.preventDefault(); setScreenshot(null); }} className="rounded-md p-1 hover:bg-muted">
                      <X className="size-3.5" />
                    </button>
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Click to attach JPG, PNG or WEBP · max 5 MB</span>
                )}
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Current page and browser details are attached automatically.
            </p>
            <Button className="w-full" onClick={() => void submit()} disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {submitting ? "Submitting..." : "Submit Bug Report"}
            </Button>
          </div>
        ) : selectedReport ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setSelectedReport(null)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to My Reports
            </button>

            <div className="rounded-xl border border-border/50 bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">{selectedReport.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitted {new Date(selectedReport.created_at).toLocaleString()}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                  {statusLabels[selectedReport.status]}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What happened?</p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-foreground">
                    {selectedReport.description}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Expected result</p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-foreground">
                    {selectedReport.expected_result || "Not provided"}
                  </p>
                </div>

                {selectedReport.page_url && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reported page</p>
                    <a
                      href={selectedReport.page_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 inline-flex max-w-full items-center gap-1.5 break-all text-sm font-medium text-primary hover:underline"
                    >
                      {selectedReport.page_url}
                      <ExternalLink className="size-3.5 shrink-0" />
                    </a>
                  </div>
                )}

                {selectedReport.admin_notes && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin response</p>
                    <p className="mt-1.5 whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-sm leading-6 text-muted-foreground">
                      {selectedReport.admin_notes}
                    </p>
                  </div>
                )}
              </div>

              {selectedReport.screenshot_path && (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-5"
                  onClick={() => void openScreenshot(selectedReport)}
                >
                  <ExternalLink className="size-4" />
                  View Screenshot
                </Button>
              )}
            </div>
          </div>
        ) : loadingReports ? (
          <div className="flex justify-center py-14"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
        ) : reports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            You have not submitted any bug reports yet.
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="rounded-xl border border-border/50 bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{report.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(report.created_at).toLocaleString()}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                    {statusLabels[report.status]}
                  </span>
                </div>
                {report.admin_notes && (
                  <p className="mt-3 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                    {report.admin_notes}
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setSelectedReport(report)}
                >
                  <Eye className="size-3.5" />
                  View Report
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
