"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellRing,
  CheckCheck,
  Info,
  Loader2,
  Megaphone,
  AlertTriangle,
  CreditCard,
  Wallet,
  HardDrive,
  BarChart3,
  Shield,
  CalendarClock,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications, type NotificationItem } from "@/providers/notification-provider";

// ══════════════════════════════════════════════════════════════════
// CATEGORY ICON MAP
// ══════════════════════════════════════════════════════════════════

const categoryIcons: Record<string, typeof Bell> = {
  general: Info,
  announcement: Megaphone,
  subscription: CalendarClock,
  payment: Wallet,
  maintenance: AlertTriangle,
  usage: BarChart3,
  storage: HardDrive,
  security: Shield,
  account: CreditCard,
};

const categoryColors: Record<string, string> = {
  general: "bg-blue-500/10 text-blue-500",
  announcement: "bg-primary/10 text-primary",
  subscription: "bg-purple-500/10 text-purple-500",
  payment: "bg-success/10 text-success",
  maintenance: "bg-warning/10 text-warning",
  usage: "bg-orange-500/10 text-orange-500",
  storage: "bg-cyan-500/10 text-cyan-500",
  security: "bg-destructive/10 text-destructive",
  account: "bg-muted/30 text-muted-foreground",
};

// ══════════════════════════════════════════════════════════════════
// TIME HELPER
// ══════════════════════════════════════════════════════════════════

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ══════════════════════════════════════════════════════════════════
// PRIORITY INDICATOR
// ══════════════════════════════════════════════════════════════════

function PriorityDot({ priority }: { priority: string }) {
  if (priority === "urgent") {
    return <span className="size-1.5 rounded-full bg-destructive shrink-0" title="Urgent" />;
  }
  if (priority === "important") {
    return <span className="size-1.5 rounded-full bg-warning shrink-0" title="Important" />;
  }
  return null;
}

// ══════════════════════════════════════════════════════════════════
// NOTIFICATION POPOVER — Consumes from NotificationProvider
// ══════════════════════════════════════════════════════════════════

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // ── Consume shared notification state from provider ─────────
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead: markAll,
  } = useNotifications();

  // ── Open/Close ────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // ── Mark All as Read ──────────────────────────────────────
  const handleMarkAllRead = useCallback(async () => {
    setMarkingAll(true);
    await markAll();
    setMarkingAll(false);
  }, [markAll]);

  // ── Handle Notification Click ────────────────────────────
  const handleNotificationClick = useCallback(
    async (notif: NotificationItem) => {
      if (!notif.is_read) await markAsRead(notif.id);
      if (notif.action_url) {
        router.push(notif.action_url);
        setOpen(false);
      }
    },
    [markAsRead, router],
  );

  const displayCount = unreadCount;

  return (
    <>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-muted-foreground transition-all hover:scale-105 hover:bg-accent hover:text-accent-foreground active:scale-95"
        aria-label={`Notifications${displayCount > 0 ? ` (${displayCount} unread)` : ""}`}
      >
        {displayCount > 0 ? (
          <BellRing className="size-[18px] animate-[ring_1s_ease-in-out_1]" aria-hidden />
        ) : (
          <Bell className="size-[18px]" aria-hidden />
        )}
        {displayCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-[16px] h-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground shadow-sm">
            {displayCount > 9 ? "9+" : displayCount}
          </span>
        )}
      </button>

      {/* Popover */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            ref={popoverRef}
            className="absolute right-0 top-full mt-1 z-50 w-[380px] max-w-[calc(100vw-16px)] rounded-2xl border border-border/40 bg-card shadow-xl overflow-hidden md:right-4 lg:right-6"
            style={{ maxHeight: "min(600px, calc(100vh - 100px))" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-muted-foreground/60" />
                <span className="text-sm font-semibold text-foreground">
                  Notifications
                </span>
                {displayCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                    {displayCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {displayCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={markingAll}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground/70 hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    {markingAll ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <CheckCheck className="size-3" />
                    )}
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div
              className="overflow-y-auto"
              style={{
                maxHeight: "calc(min(600px, calc(100vh - 100px)) - 52px)",
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-5 animate-spin text-muted-foreground/50" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 px-4 text-center">
                  <BellRing className="size-8 text-muted-foreground/20" />
                  <p className="text-sm font-medium text-muted-foreground/60">
                    No notifications yet
                  </p>
                  <p className="text-xs text-muted-foreground/40">
                    You&apos;ll see notifications here when admin sends
                    announcements or system events occur.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/10">
                  {notifications.map((notif) => {
                    const Icon = categoryIcons[notif.category] || Info;
                    const isUnread = !notif.is_read;
                    return (
                      <button
                        key={notif.id}
                        type="button"
                        onClick={() => handleNotificationClick(notif)}
                        className={cn(
                          "w-full text-left px-4 py-3 transition-colors hover:bg-muted/30 group",
                          isUnread && "bg-primary/[0.02]",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-xl mt-0.5",
                              categoryColors[notif.category] ||
                                "bg-muted/30 text-muted-foreground/60",
                            )}
                          >
                            <Icon className="size-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            {/* Title row */}
                            <div className="flex items-start gap-1.5">
                              <p
                                className={cn(
                                  "text-sm leading-snug truncate",
                                  isUnread
                                    ? "font-semibold text-foreground"
                                    : "font-medium text-muted-foreground/80",
                                )}
                              >
                                {notif.title}
                              </p>
                              <PriorityDot priority={notif.priority} />
                            </div>

                            {/* Message */}
                            {notif.message && (
                              <p className="mt-0.5 text-xs text-muted-foreground/60 line-clamp-2 leading-relaxed">
                                {notif.message}
                              </p>
                            )}

                            {/* Footer */}
                            <div className="mt-1.5 flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground/40 tabular-nums">
                                {timeAgo(notif.created_at)}
                              </span>
                              {notif.source === "admin" && (
                                <span className="rounded-full bg-primary/5 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                                  Admin
                                </span>
                              )}
                              {notif.action_label && (
                                <span className="text-[10px] text-primary/60 group-hover:text-primary transition-colors inline-flex items-center gap-0.5">
                                  {notif.action_label}
                                  <ChevronRight className="size-2.5" />
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Unread dot */}
                          {isUnread && (
                            <span className="size-2 rounded-full bg-primary shrink-0 mt-2" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-border/20 px-4 py-2.5 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    router.push("/dashboard");
                    setOpen(false);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground/60 hover:text-foreground transition-colors"
                >
                  View all notifications
                  <ChevronRight className="size-3" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
