"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { Layers3 } from "lucide-react";

// ─── Color palette for chart segments ───────────────────────────────
const SEGMENT_COLORS = [
  { stroke: "var(--chart-1)", bg: "bg-[var(--chart-1)]", label: "text-[var(--chart-1)]" },
  { stroke: "var(--chart-2)", bg: "bg-[var(--chart-2)]", label: "text-[var(--chart-2)]" },
  { stroke: "var(--chart-3)", bg: "bg-[var(--chart-3)]", label: "text-[var(--chart-3)]" },
  { stroke: "var(--chart-4)", bg: "bg-[var(--chart-4)]", label: "text-[var(--chart-4)]" },
  { stroke: "var(--chart-5)", bg: "bg-[var(--chart-5)]", label: "text-[var(--chart-5)]" },
];

export interface DonutChartData {
  label: string;
  value: number;
}

export function DonutChart({
  data,
  size = 160,
  strokeWidth = 28,
}: {
  data: DonutChartData[];
  size?: number;
  strokeWidth?: number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

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

  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  // Build arc segments
  let cumulativePercent = 0;
  const segments = data.map((item, index) => {
    const percent = total > 0 ? item.value / total : 0;
    const offset = cumulativePercent * circumference;
    const length = percent * circumference;
    cumulativePercent += percent;

    const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length];

    return {
      ...item,
      percent,
      offset,
      length,
      color,
      index,
    };
  });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
      {/* ─── Donut SVG ─────────────────────────────────────────── */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-muted/40"
            strokeWidth={strokeWidth}
          />

          {/* Segments */}
          {segments.map((seg) => (
            <motion.circle
              key={`segment-${seg.index}`}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color.stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${seg.length} ${circumference - seg.length}`}
              strokeDashoffset={circumference - seg.offset}
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{
                strokeDasharray: `${seg.length} ${circumference - seg.length}`,
                strokeDashoffset: circumference - seg.offset,
              }}
              transition={{ duration: 0.8, ease: "easeOut", delay: seg.index * 0.1 }}
              className="drop-shadow-sm"
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {total}
          </span>
          <span className="text-sm text-muted-foreground">Total</span>
        </div>
      </div>

      {/* ─── Legend ────────────────────────────────────────────── */}
      <div className="flex-1 space-y-2 self-center sm:self-start">
        {segments.map((seg) => (
          <motion.div
            key={`legend-${seg.index}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: seg.index * 0.08 }}
            className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/30"
          >
            {/* Color dot */}
            <span
              className={cn(
                "size-2.5 shrink-0 rounded-full ring-2 ring-background",
                seg.color.bg,
              )}
            />

            {/* Label */}
            <span className="min-w-0 flex-1 truncate text-sm text-foreground">
              {seg.label}
            </span>

            {/* Percent badge */}
            <span className="text-xs font-semibold text-muted-foreground tabular-nums">
              {(seg.percent * 100).toFixed(1)}%
            </span>

            {/* Value */}
            <span className="text-sm font-semibold tabular-nums text-foreground min-w-[60px] text-right">
              {formatCurrency(seg.value)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
