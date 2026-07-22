"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Animation Variants ────────────────────────────────────────────

const collapseVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: "auto", opacity: 1 },
};

// ─── Badge sub-component ───────────────────────────────────────────

function CardBadge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "info" }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
      variant === "default" && "bg-muted text-muted-foreground/60",
      variant === "success" && "bg-success/10 text-success",
      variant === "warning" && "bg-warning/10 text-warning",
      variant === "info" && "bg-info/10 text-info",
    )}>{children}</span>
  );
}

// ─── CollapsibleCard ───────────────────────────────────────────────

export function CollapsibleCard({
  icon: Icon, title, description, badge, defaultOpen = false, children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; description?: string; badge?: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "group/card rounded-2xl border transition-all duration-300 overflow-hidden glass-card relative",
        open ? "border-border/50 shadow-sm" : "border-border/20",
        !open && hovered ? "shadow-xl -translate-y-1 scale-[1.005] border-primary/30 bg-primary/[0.02] ring-1 ring-primary/20" : "",
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4.5 text-left transition-colors hover:bg-muted/10"
      >
        <motion.div
          animate={{ scale: open ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={cn(
            "flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl transition-all duration-300",
            open ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "bg-muted text-muted-foreground/50",
          )}
        >
          <Icon className="size-4 sm:size-4.5" />
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground transition-colors duration-200">
              {title}
            </h3>
            {badge && <CardBadge>{badge}</CardBadge>}
          </div>
          {description && <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground/60 leading-snug">{description}</p>}
        </div>

        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground/30 transition-colors group-hover/card:text-muted-foreground/60"
        >
          <ChevronDown className="size-3.5 sm:size-4" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="card-content"
            variants={collapseVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden will-change-[height,opacity]"
          >
            <div className="mx-4 sm:mx-6 border-t border-border/20" />
            <motion.div
              className="px-4 sm:px-6 py-4 sm:py-5 space-y-4"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
              initial="hidden"
              animate="visible"
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
