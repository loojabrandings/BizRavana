"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import { Plus, ReceiptText, ShoppingCart, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ─── Types ─────────────────────────────────────────────────────

interface QuickActionSheetProps {
  open: boolean;
  onClose: () => void;
}

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: typeof ShoppingCart;
  color: string;
}

// ─── Actions ────────────────────────────────────────────────────

const quickActions: QuickAction[] = [
  {
    label: "New Order",
    description: "Create a new customer order",
    href: "/dashboard/orders?action=new",
    icon: ShoppingCart,
    color: "text-primary",
  },
  {
    label: "Add Expense",
    description: "Record a business expense",
    href: "/dashboard/expenses?action=new",
    icon: ReceiptText,
    color: "text-destructive",
  },
];

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function QuickActionSheet({ open, onClose }: QuickActionSheetProps) {
  // ─── Escape key handler ───────────────────────────────────
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  // ─── Render ───────────────────────────────────────────────
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[60]",
          "bg-black/50 backdrop-blur-sm",
          "animate-in fade-in duration-200",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        id="quick-action-sheet"
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[61]",
          "animate-in slide-in-from-bottom duration-300 ease-out",
        )}
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div
          className={cn(
            "rounded-t-3xl border border-border/50",
            "bg-[var(--glass-bg)] backdrop-blur-2xl",
            "shadow-2xl shadow-black/20",
            "px-5 pt-2 pb-5",
          )}
        >
          {/* Drag handle */}
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/20" />

          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Quick Actions
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Choose an action to get started
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Close quick actions"
              className="shrink-0"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Action buttons */}
          <div className="space-y-2.5">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-4 rounded-2xl",
                  "border border-border/40 bg-muted/30",
                  "px-4 py-4",
                  "transition-all duration-150",
                  "hover:bg-muted/60 hover:border-border/60",
                  "active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                )}
              >
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl",
                    "bg-primary/10",
                  )}
                >
                  <action.icon className={cn("size-5", action.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {action.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Plus className="size-4 text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
