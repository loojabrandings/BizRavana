"use client";

import { X, Keyboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SHORTCUTS, type ShortcutAction } from "@/hooks/use-keyboard-shortcuts";
import { cn } from "@/lib/utils";

// ─── Group shortcuts by category ──────────────────────────────

interface ShortcutGroup {
  title: string;
  filter: ShortcutAction["group"];
}

const GROUPS: ShortcutGroup[] = [
  { title: "Navigation", filter: "navigation" },
  { title: "Actions", filter: "actions" },
  { title: "General", filter: "general" },
];

// ─── Kbd Component ────────────────────────────────────────────

function Kbd({ shortcut }: { shortcut: ShortcutAction }) {
  const keys: string[] = [];
  if (shortcut.ctrl) keys.push("Ctrl");
  if (shortcut.shift) keys.push("Shift");
  if (shortcut.alt) keys.push("Alt");
  keys.push(shortcut.label);
  return (
    <span className="inline-flex items-center gap-0.5">
      {keys.map((k, i) => (
        <span
          key={i}
          className={cn(
            "inline-flex h-6 min-w-[22px] items-center justify-center rounded-md border border-border/50 bg-muted/60 px-1.5 text-[11px] font-semibold tracking-tight text-foreground/80 shadow-xs",
          )}
        >
          {k}
        </span>
      ))}
    </span>
  );
}

// ─── Dialog Component ─────────────────────────────────────────

export function KeyboardShortcutsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-4 z-50 m-auto flex h-fit max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl sm:inset-x-auto sm:inset-y-12"
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Keyboard className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold tracking-tight">
                    Keyboard Shortcuts
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Press{" "}
                    <span className="font-semibold text-foreground/80">
                      ?
                    </span>{" "}
                    at any time to show this panel
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-6">
                {GROUPS.map((group) => {
                  const items = SHORTCUTS.filter((s) => s.group === group.filter);
                  if (items.length === 0) return null;
                  return (
                    <div key={group.title}>
                      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
                        {group.title}
                      </h3>
                      <div className="space-y-1">
                        {items.map((shortcut, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-muted/40"
                          >
                            <span className="text-sm text-foreground/80">
                              {shortcut.description}
                            </span>
                            <Kbd shortcut={shortcut} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="rounded-xl border border-border/40 bg-muted/20 px-3.5 py-3">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground/70">
                      Tip:
                    </span>{" "}
                    Single-letter shortcuts work only when no text field is
                    focused. Press <span className="font-semibold">Esc</span> to
                    blur the current field first.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
