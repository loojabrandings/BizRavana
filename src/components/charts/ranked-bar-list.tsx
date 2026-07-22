import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { Layers3 } from "lucide-react";

export function RankedBarList({
  data,
}: {
  data: Array<{ label: string; value: number }>;
}) {
  const max = Math.max(1, ...data.map((item) => item.value));

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
          <Layers3 className="size-5 text-muted-foreground/60" />
        </div>
        <p className="text-sm text-muted-foreground">No data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const pct = Math.round((item.value / max) * 100);
        return (
          <motion.div
            key={`ranked-${index}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/30"
          >
            {/* Rank badge */}
            <span className={cn("rank-badge", index === 0 && "rank-badge-top")}>
              {index + 1}
            </span>

            {/* Name + bar */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {item.label}
              </p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary transition-all duration-300 group-hover:bg-primary/80"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(4, pct)}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.05 }}
                />
              </div>
            </div>

            {/* Value */}
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {formatCurrency(item.value)}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
