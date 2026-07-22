"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRef } from "react";
import { motion } from "framer-motion";
import { Truck, Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatEnumLabel, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ManualWaybill } from "@/lib/delivery/waybill-utils";

interface EnterWaybillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  targetStatus: "packed" | "dispatched";
  onConfirm: (waybillId: string) => Promise<boolean>;
  /** Available manual waybills to suggest (when waybill method is manual). */
  availableWaybills?: ManualWaybill[];
  /** Whether manual waybill mode is active. */
  isManualMode?: boolean;
}

export function EnterWaybillDialog({
  open,
  onOpenChange,
  orderNumber,
  targetStatus,
  onConfirm,
  availableWaybills = [],
  isManualMode = false,
}: EnterWaybillDialogProps) {
  const [waybillId, setWaybillId] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Filter available waybills based on the current waybillId input
  const filteredSuggestions = useMemo(() => {
    if (!isManualMode || availableWaybills.length === 0) return [];
    const term = waybillId.trim().toLowerCase();
    if (!term) return availableWaybills.slice(0, 20);
    return availableWaybills
      .filter((wb) => wb.waybill_id.toLowerCase().includes(term))
      .slice(0, 20);
  }, [availableWaybills, waybillId, isManualMode]);

  const handleSelectSuggestion = useCallback((selectedId: string) => {
    setWaybillId(selectedId);
    setShowSuggestions(false);
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmed = waybillId.trim();
    if (!trimmed) {
      toast.error("Please enter a waybill ID");
      return;
    }
    setSubmitting(true);
    try {
      const success = await onConfirm(trimmed);
      if (success) {
        setWaybillId("");
        setShowSuggestions(false);
        onOpenChange(false);
      }
    } finally {
      setSubmitting(false);
    }
  }, [waybillId, onConfirm, onOpenChange]);

  const handleCancel = useCallback(() => {
    setWaybillId("");
    setShowSuggestions(false);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleOpenChange = useCallback((next: boolean) => {
    if (!next) {
      setWaybillId("");
      setShowSuggestions(false);
    } else {
      setShowSuggestions(isManualMode && availableWaybills.length > 0);
    }
    onOpenChange(next);
  }, [onOpenChange, isManualMode, availableWaybills.length]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="size-4.5 text-primary" />
            Enter Waybill ID
          </DialogTitle>
          <DialogDescription>
            Order <strong>#{orderNumber}</strong> is moving to{" "}
            <strong>{targetStatus}</strong>. Please enter the waybill / tracking
            ID to proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-4">
          {/* ─── Waybill Input with inline suggestions ──────── */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <Label htmlFor="waybill-input" className="text-sm font-medium text-foreground/80">
              Waybill / Tracking ID
            </Label>
            <div className="relative">
              {/* Search icon hint when manual mode with suggestions */}
              {isManualMode && availableWaybills.length > 0 && (
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40 pointer-events-none" />
              )}
              <input
                ref={inputRef}
                id="waybill-input"
                value={waybillId}
                onChange={(e) => {
                  setWaybillId(e.target.value);
                  if (isManualMode && availableWaybills.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onFocus={() => {
                  if (isManualMode && availableWaybills.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder={
                  isManualMode && availableWaybills.length > 0
                    ? "Search or type waybill ID..."
                    : "e.g. WB-2024-001, RE12345678"
                }
                className={cn(
                  "w-full h-10 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors",
                  isManualMode && availableWaybills.length > 0
                    ? "pl-8 pr-3"
                    : "px-3",
                )}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !submitting) handleSubmit();
                  if (e.key === "Escape") handleCancel();
                }}
              />
            </div>

            {/* Inline suggestions panel */}
            {showSuggestions && isManualMode && filteredSuggestions.length > 0 && (
              <div
                ref={panelRef}
                className="rounded-lg border border-border/30 bg-popover shadow-lg overflow-hidden"
              >
                <div className="max-h-[180px] overflow-y-auto space-y-0.5 p-1">
                  {filteredSuggestions.map((wb) => (
                    <button
                      key={wb.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(wb.waybill_id)}
                      className={cn(
                        "w-full flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
                        waybillId === wb.waybill_id
                          ? "bg-primary/5 text-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      <span className="font-mono text-xs font-medium">{wb.waybill_id}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground/50">
              {isManualMode && availableWaybills.length > 0
                ? `Type to filter ${availableWaybills.length} available waybills, or enter a custom ID.`
                : "This ID will be saved as the waybill number for tracking purposes."}
            </p>
          </motion.div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={submitting}
          >
            Skip — Set later
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || !waybillId.trim()}
          >
            {submitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Truck className="size-3.5" />
            )}
            {submitting ? "Saving..." : `Confirm & Mark ${formatEnumLabel(targetStatus)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
