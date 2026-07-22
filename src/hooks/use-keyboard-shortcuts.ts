"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// ─── Types ─────────────────────────────────────────────────────

export interface ShortcutAction {
  key: string;
  label: string;
  group: "navigation" | "actions" | "general";
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
}

// ─── All available shortcuts (also used by the help dialog) ────

export const SHORTCUTS: ShortcutAction[] = [
  { key: "Enter", label: "Enter", group: "actions", description: "Submit form / Save" },
  { key: "Escape", label: "Esc", group: "general", description: "Cancel / Close / Go back" },
  { key: "n", label: "n", group: "actions", description: "New Order" },
  { key: "n", alt: true, label: "Alt+N", group: "actions", description: "New Expense" },
  { key: "d", label: "d", group: "navigation", description: "Go to Dashboard" },
  { key: "o", label: "o", group: "navigation", description: "Go to Orders" },
  { key: "e", label: "e", group: "navigation", description: "Go to Expenses" },
  { key: "q", label: "q", group: "navigation", description: "Go to Quotations" },
  { key: "p", label: "p", group: "navigation", description: "Go to Products" },
  { key: "i", label: "i", group: "navigation", description: "Go to Inventory" },
  { key: "r", label: "r", group: "navigation", description: "Go to Reports" },
  { key: "s", label: "s", group: "navigation", description: "Go to Settings" },
  { key: "?", label: "?", group: "general", description: "Show keyboard shortcuts" },
];

// ─── Navigation map ────────────────────────────────────────────

const NAV_MAP: Record<string, string> = {
  d: "/dashboard",
  o: "/dashboard/orders",
  e: "/dashboard/expenses",
  q: "/dashboard/quotations",
  p: "/dashboard/products",
  i: "/dashboard/inventory",
  r: "/dashboard/reports",
  s: "/dashboard/settings",
};

// ─── Helpers ───────────────────────────────────────────────────

/** Returns true when the user is typing inside an input/textarea/select. */
function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  if (el instanceof HTMLInputElement) return true;
  if (el instanceof HTMLTextAreaElement) return true;
  if (el instanceof HTMLSelectElement) return true;
  if (el.getAttribute("contenteditable") === "true") return true;
  return false;
}

// ─── Hook ──────────────────────────────────────────────────────

export function useKeyboardShortcuts(
  router: AppRouterInstance,
  callbacks?: {
    onOpenSearch?: () => void;
  },
) {
  const [showHelp, setShowHelp] = useState(false);
  const showHelpRef = useRef(showHelp);
  showHelpRef.current = showHelp;

  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Always allow Escape to close the help dialog if it's open
      if (e.key === "Escape" && showHelpRef.current) {
        setShowHelp(false);
        e.preventDefault();
        return;
      }

      // Check if user is typing in an input — skip all shortcuts except Escape
      if (isInputFocused()) {
        if (e.key === "Escape") {
          // Blur the focused element (effectively "cancel")
          (document.activeElement as HTMLElement)?.blur();
          e.preventDefault();
        }
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // ── / — Open global search ──────────────────────────
      if (e.key === "/" && !isCtrl && !isAlt && !isShift) {
        e.preventDefault();
        callbacksRef.current?.onOpenSearch?.();
        return;
      }

      // ── ? — Show help ───────────────────────────────────
      if (e.key === "?" && !isCtrl && !isAlt) {
        e.preventDefault();
        setShowHelp(true);
        return;
      }

      // ── Escape — Navigate back ───────────────────────────
      if (e.key === "Escape" && !isCtrl && !isAlt) {
        e.preventDefault();
        router.back();
        return;
      }

      // ── n — New Order (no modifier, single key) ──────────
      if (e.key === "n" && !isCtrl && !isAlt && !isShift) {
        e.preventDefault();
        router.push("/dashboard/orders?action=new");
        return;
      }

      // ── Alt+N — New Expense ──────────────────────────────
      if (e.key === "n" && isAlt && !isCtrl && !isShift) {
        e.preventDefault();
        router.push("/dashboard/expenses?action=new");
        return;
      }

      // ── Single-letter navigation (no modifier) ───────────
      const key = e.key.toLowerCase();
      if (key.length === 1 && !isCtrl && !isAlt && !isShift && key in NAV_MAP) {
        e.preventDefault();
        router.push(NAV_MAP[key]);
        return;
      }
    },
    [router],
  );

  useEffect(() => {
    // Use capture phase to intercept browser shortcuts (Ctrl+N, Ctrl+Shift+N)
    // before they reach the browser's default handler.
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => document.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [handleKeyDown]);

  return { showHelp, setShowHelp };
}
