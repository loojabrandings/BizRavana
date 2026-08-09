"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeatureItem } from "./features-data";

const EASE = [0.22, 1, 0.36, 1] as const;

interface FeatureAccordionItemProps {
  feature: FeatureItem;
  index: number;
  isExpanded: boolean;
  onToggle: (index: number) => void;
}

export function FeatureAccordionItem({
  feature,
  index,
  isExpanded,
  onToggle,
}: FeatureAccordionItemProps) {
  const buttonId = `feature-trigger-${feature.id}`;
  const panelId = `feature-panel-${feature.id}`;

  return (
    <motion.li
      layout
      className="w-full list-none"
      transition={{ duration: 0.5, ease: EASE }}
    >
      <div
        className={cn(
          "border bg-[color-mix(in_oklab,var(--muted),black_5%)] transition-colors duration-300",
          isExpanded
            ? "relative z-10 w-full rounded-2xl border-transparent text-foreground lg:w-[120%]"
            : "w-fit rounded-full border-transparent hover:brightness-[0.95]",
        )}
      >
        <button
          type="button"
          id={buttonId}
          aria-expanded={isExpanded}
          aria-controls={panelId}
          onClick={() => onToggle(index)}
          className={cn(
            "group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-300",
            isExpanded ? "rounded-t-2xl" : "rounded-full",
          )}
        >
          {!isExpanded && (
            <span
              aria-hidden
              className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition-colors duration-300"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key="plus"
                  initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex"
                >
                  <Plus className="size-3.5" />
                </motion.span>
              </AnimatePresence>
            </span>
          )}
          <span
            className={cn(
              "flex-1 truncate transition-all duration-300",
              isExpanded
                ? "text-lg font-semibold text-foreground"
                : "text-base font-medium text-foreground/80",
            )}
          >
            {feature.title}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="panel"
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="overflow-hidden"
            >
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.05 }}
                className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground"
              >
                {feature.description}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  );
}
