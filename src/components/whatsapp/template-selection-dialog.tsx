"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageCircle, Star, X, Settings } from "lucide-react";
import type { MessageTemplate } from "@/lib/supabase/message-templates";

// ─── Props ─────────────────────────────────────────────────────────

interface TemplateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: MessageTemplate[];
  onSelect: (template: MessageTemplate) => void;
  onManageTemplates: () => void;
}

// ─── Component ─────────────────────────────────────────────────────

export function TemplateSelectionDialog({
  open,
  onOpenChange,
  templates,
  onSelect,
  onManageTemplates,
}: TemplateSelectionDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Sort: default first, then by created_at
  const sorted = [...templates].sort((a, b) => {
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // ─── Keyboard navigation ─────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : sorted.length - 1;
            const tpl = sorted[next];
            if (tpl) setSelectedId(tpl.id);
            return next;
          });
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev < sorted.length - 1 ? prev + 1 : 0;
            const tpl = sorted[next];
            if (tpl) setSelectedId(tpl.id);
            return next;
          });
          break;
        case "Enter":
          e.preventDefault();
          const tpl = sorted[focusedIndex];
          if (tpl) {
            onSelect(tpl);
            onOpenChange(false);
          }
          break;
      }
    },
    [sorted, focusedIndex, onSelect, onOpenChange],
  );

  // Sync focusedIndex with selectedId changes
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    const idx = sorted.findIndex((t) => t.id === id);
    if (idx >= 0) setFocusedIndex(idx);
  }, [sorted]);

  const handleConfirm = () => {
    const tpl = selectedId
      ? templates.find((t) => t.id === selectedId)
      : sorted[0];
    if (tpl) {
      onSelect(tpl);
      onOpenChange(false);
    }
  };

  // Reset selection when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setSelectedId(null);
      setFocusedIndex(0);
    }
    onOpenChange(open);
  };

  // Truncate content for preview
  const previewContent = (content: string, maxLen = 120): string => {
    const singleLine = content.replace(/\n/g, " ").trim();
    return singleLine.length > maxLen
      ? singleLine.slice(0, maxLen) + "…"
      : singleLine;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-0 gap-0 overflow-hidden">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="px-5 pt-5 pb-3">
          <DialogHeader className="text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <MessageCircle className="size-4 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-sm font-semibold">
                    Choose a WhatsApp Template
                  </DialogTitle>
                  <DialogDescription className="text-xxs text-muted-foreground/60 mt-0.5">
                    Select the message template to use for this customer.
                  </DialogDescription>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </DialogHeader>
        </div>

        {/* ── Template List ───────────────────────────────────── */}
        <div
          className="px-5 pb-2 max-h-[360px] overflow-y-auto space-y-1.5"
          onKeyDown={handleKeyDown}
        >
          {sorted.map((tpl, i) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => handleSelect(tpl.id)}
              onMouseEnter={() => setFocusedIndex(i)}
              className={cn(
                "group relative w-full text-left rounded-xl border p-3 transition-all duration-150 outline-none",
                focusedIndex === i && "ring-2 ring-primary/15 border-primary/30",
                selectedId === tpl.id
                  ? "border-primary/30 bg-primary/[0.04] shadow-sm"
                  : "border-border/20 hover:border-border/40 hover:bg-muted/10",
              )}
            >
              {/* Selected ring */}
              {selectedId === tpl.id && (
                <motion.div
                  layoutId="template-select-ring"
                  className="absolute inset-0 rounded-xl ring-1 ring-primary/15"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {tpl.title}
                      </span>
                      {tpl.is_default && (
                        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-micro font-semibold text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
                          <Star className="size-2 fill-amber-500/30" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xxs text-muted-foreground/50 leading-relaxed line-clamp-2">
                      {previewContent(tpl.content)}
                    </p>
                  </div>
                  {/* Radio indicator */}
                  <div
                    className={cn(
                      "mt-0.5 size-4 shrink-0 rounded-full border-2 transition-all",
                      selectedId === tpl.id
                        ? "border-primary bg-primary"
                        : "border-border/40 group-hover:border-border/60",
                    )}
                  >
                    {selectedId === tpl.id && (
                      <div className="flex size-full items-center justify-center">
                        <div className="size-1.5 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <div className="border-t border-border/10 px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="xs"
              onClick={onManageTemplates}
              className="gap-1.5 h-7 text-xxs text-muted-foreground/50 hover:text-foreground"
            >
              <Settings className="size-2.5" />
              Manage Templates
            </Button>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => onOpenChange(false)}
                className="h-7 text-xxs text-muted-foreground/50"
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                size="xs"
                onClick={handleConfirm}
                className="h-7 text-xxs gap-1"
              >
                <MessageCircle className="size-2.5" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
