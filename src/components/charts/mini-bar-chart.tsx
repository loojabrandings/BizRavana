import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/formatters";

export function MiniBarChart({ data }: { data: Array<{ label: string; revenue: number; expenses: number }> }) {
  const maxValue = Math.max(
    1,
    ...data.flatMap((row) => [row.revenue, row.expenses]),
  );

  return (
    <div className="flex h-40 items-end gap-2 px-1">
      {data.map((row, index) => (
        <motion.div
          key={`bar-${index}`}
          className="flex flex-1 flex-col items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.025 }}
        >
          {/* Bar group with subtle track */}
          <div className="flex h-32 w-full items-end justify-center gap-[3px] rounded-lg bg-muted/30 px-[2px]">
            <div
              className="chart-bar-revenue max-w-[18px]"
              style={{ height: `${Math.max(8, (row.revenue / maxValue) * 100)}%` }}
              title={`Revenue ${formatCurrency(row.revenue)}`}
            />
            <div
              className="chart-bar-expense max-w-[18px]"
              style={{ height: `${Math.max(8, (row.expenses / maxValue) * 100)}%` }}
              title={`Expenses ${formatCurrency(row.expenses)}`}
            />
          </div>
          <span className="text-sm text-muted-foreground">{row.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
