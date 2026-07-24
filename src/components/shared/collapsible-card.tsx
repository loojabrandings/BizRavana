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

// ─── Accordion Section ─────────────────────────────────────────────

export function CollapsibleCard({
  icon: Icon, title, description, badge, defaultOpen = false, children, id, collapsible = true,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; description?: string; badge?: string; defaultOpen?: boolean; children: React.ReactNode;
  id?: string; collapsible?: boolean;
}) {
  const [open, setOpen] = useState(collapsible ? defaultOpen : true);

  const handleToggle = collapsible ? () => setOpen((v) => !v) : undefined;

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="group/card"
    >
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "flex w-full items-center gap-3 sm:gap-4 px-0 py-3 sm:py-4 text-left transition-colors duration-200 rounded-xl",
          collapsible && "hover:bg-muted/[0.03] cursor-pointer",
          !collapsible && "cursor-default",
        )}
        tabIndex={collapsible ? 0 : -1}
      >
        <motion.div
          animate={collapsible ? { scale: open ? 1.1 : 1 } : { scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={cn(
            "flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
            (collapsible && open) || !collapsible
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
              : "bg-muted/40 text-muted-foreground/40",
          )}
        >
          <Icon className="size-4 sm:size-4.5" />
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "text-sm font-semibold transition-colors duration-200",
              (collapsible && open) || !collapsible ? "text-foreground" : "text-foreground/80",
            )}>
              {title}
            </h3>
            {badge && <CardBadge>{badge}</CardBadge>}
          </div>
          {description && <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground/50 leading-snug">{description}</p>}
        </div>

        {collapsible && (
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
              "flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
              open ? "text-primary/50" : "text-muted-foreground/20 group-hover/card:text-muted-foreground/40",
            )}
          >
            <ChevronDown className="size-3.5 sm:size-4" />
          </motion.div>
        )}
      </button>

      {collapsible ? (
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
              <div className="ml-[52px] border-t border-border/10" />
              <motion.div
                className="ml-[52px] pb-2 pt-4 sm:pb-3 sm:pt-5 space-y-4"
                variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
                initial="hidden"
                animate="visible"
              >
                {children}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div>
          <div className="ml-[52px] border-t border-border/10" />
          <div className="ml-[52px] pb-2 pt-4 sm:pb-3 sm:pt-5 space-y-4">
            {children}
          </div>
        </div>
      )}
    </motion.div>
  );
}
