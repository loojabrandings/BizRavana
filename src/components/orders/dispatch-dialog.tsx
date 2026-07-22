"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MapPin, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────

export type DispatchMode = "local" | "courier";

interface DispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courierName: string | null;
  /** Called when the user picks a dispatch mode. Return true if successful. */
  onDispatch: (mode: DispatchMode) => Promise<boolean>;
}

// ─── Component ────────────────────────────────────────────────────

export function DispatchDialog({
  open,
  onOpenChange,
  courierName,
  onDispatch,
}: DispatchDialogProps) {
  const [dispatching, setDispatching] = useState<DispatchMode | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Reset focus when dialog opens
  useEffect(() => {
    if (open) setFocusedIndex(0);
  }, [open]);

  const handleDispatch = useCallback(
    async (mode: DispatchMode) => {
      setDispatching(mode);
      try {
        const success = await onDispatch(mode);
        if (success) {
          onOpenChange(false);
        }
      } finally {
        setDispatching(null);
      }
    },
    [onDispatch, onOpenChange],
  );

  // ─── Keyboard navigation ─────────────────────────────────────
  const maxIndex = courierName ? 1 : 0;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
          break;
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          setFocusedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (dispatching !== null) return;
          const mode: DispatchMode = focusedIndex === 0 ? "local" : "courier";
          if (mode === "courier" && !courierName) return;
          handleDispatch(mode);
          break;
      }
    },
    [focusedIndex, maxIndex, courierName, dispatching, handleDispatch],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Dispatch Order</DialogTitle>
          <DialogDescription>
            How would you like to dispatch this order?
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex flex-col gap-3 py-2"
          onKeyDown={handleKeyDown}
        >
          {/* Option 1: Dispatch Locally */}
          <motion.button
            type="button"
            onClick={() => handleDispatch("local")}
            disabled={dispatching !== null}
            onMouseEnter={() => setFocusedIndex(0)}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className={cn(
              "group relative flex items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200 outline-none",
              focusedIndex === 0 && "ring-2 ring-primary/20 border-primary/30",
              dispatching === "local"
                ? "border-primary/30 bg-primary/[0.04] shadow-sm"
                : "border-border/30 hover:border-border/60 hover:bg-muted/20 hover:shadow-sm",
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground/50 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              <MapPin className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                Dispatch Locally
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground/60 leading-relaxed">
                Mark the order as dispatched without sending it to a courier
                service. The order status will change to{" "}
                <strong>Dispatched</strong>.
              </p>
            </div>
            {dispatching === "local" && (
              <Loader2 className="size-4 animate-spin text-primary shrink-0 mt-1" />
            )}
          </motion.button>

          {/* Option 2: Dispatch to Courier */}
          {courierName && (
            <motion.button
              type="button"
              onClick={() => handleDispatch("courier")}
              disabled={dispatching !== null}
              onMouseEnter={() => setFocusedIndex(1)}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className={cn(
                "group relative flex items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200 outline-none",
                focusedIndex === 1 && "ring-2 ring-primary/20 border-primary/30",
                dispatching === "courier"
                  ? "border-primary/30 bg-primary/[0.04] shadow-sm"
                  : "border-border/30 hover:border-border/60 hover:bg-muted/20 hover:shadow-sm",
              )}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Truck className="size-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Dispatch via {courierName}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground/60 leading-relaxed">
                  Send the order details to {courierName} for delivery. A
                  waybill number will be assigned automatically.
                </p>
              </div>
              {dispatching === "courier" && (
                <Loader2 className="size-4 animate-spin text-primary shrink-0 mt-1" />
              )}
            </motion.button>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={dispatching !== null}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
