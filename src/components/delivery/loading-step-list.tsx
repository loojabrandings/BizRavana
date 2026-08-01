"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LoadingStep } from "@/lib/delivery/loading-steps";

/**
 * Shared step-checklist used by loading screens (courier page + finance tab).
 * Renders a check circle for done steps, a small spinner for the active step,
 * and a hollow ring for pending steps.
 */
export function LoadingStepList({ steps }: { steps: LoadingStep[] }) {
  return (
    <div className="w-full max-w-xs space-y-2.5">
      {steps.map((step) => {
        const isDone = step.state === "done";
        const isActive = step.state === "active";
        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2.5"
          >
            {isDone ? (
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                <Check className="size-3" />
              </span>
            ) : isActive ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
            ) : (
              <span className="size-4 shrink-0 rounded-full border border-border/40" />
            )}
            <span
              className={cn(
                "text-sm",
                isDone
                  ? "text-muted-foreground"
                  : isActive
                    ? "font-medium text-foreground"
                    : "text-muted-foreground/60",
              )}
            >
              {step.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
