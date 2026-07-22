"use client";

import { useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";

// ─── Types ─────────────────────────────────────────────────────

interface MobileRightDrawerProps {
  open: boolean;
  onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

/**
 * A shared right-side mobile drawer that renders the full Sidebar.
 *
 * Can be controlled from:
 * - The hamburger menu button in the top toolbar
 * - The More button in the bottom navigation
 *
 * Both buttons use the same open/close state for a single drawer instance.
 */
export function MobileRightDrawer({ open, onClose }: MobileRightDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // ─── Escape key handler ─────────────────────────────────────
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  // ─── Body scroll lock + keyboard listener ──────────────────
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

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[55]",
          "bg-black/50 backdrop-blur-sm",
          "animate-in fade-in duration-200",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        id="mobile-right-drawer"
        ref={drawerRef}
        className={cn(
          "fixed inset-y-0 right-0 z-[56] flex flex-col",
          "animate-in slide-in-from-right duration-300 ease-out",
          "w-[85vw] max-w-[320px]",
          "bg-[var(--glass-bg)] backdrop-blur-2xl",
          "border-l border-border/50",
          "shadow-2xl shadow-black/20",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Close button */}
        <div className="flex items-center justify-end px-3 pt-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="shrink-0"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-hidden">
          <Sidebar
            mobile
            onItemClick={onClose}
          />
        </div>
      </div>
    </>
  );
}
