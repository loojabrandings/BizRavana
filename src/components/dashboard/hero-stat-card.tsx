import Link from "next/link";
import { Minus, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroStatTrend {
  value: string;
  direction: "up" | "down" | "neutral";
}

export interface HeroStatTrendBadge {
  percentage: string;
  /** Actual direction of change — controls which arrow icon is shown */
  direction: "up" | "down" | "neutral";
  /** Whether the change is good, bad, or neutral — controls color */
  color: "good" | "bad" | "neutral";
  label: string;
}

function TrendBadge({ badge, mutedClass }: { badge: HeroStatTrendBadge; mutedClass: string }) {
  const colorClass =
    badge.color === "good"
      ? "text-success"
      : badge.color === "bad"
        ? "text-destructive"
        : mutedClass;

  const icon =
    badge.direction === "up" ? (
      <TrendingUp className="size-3" strokeWidth={2.5} />
    ) : badge.direction === "down" ? (
      <TrendingDown className="size-3" strokeWidth={2.5} />
    ) : (
      <Minus className="size-3" strokeWidth={2.5} />
    );

  return (
    <div className="flex flex-col items-end gap-0">
      <span className={cn("inline-flex items-center gap-1 text-sm font-semibold", colorClass)}>
        {icon}
        {badge.percentage}
      </span>
      <span className={cn("text-sm leading-none", mutedClass)}>{badge.label}</span>
    </div>
  );
}

export function HeroStatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendBadge,
  secondary,
  href,
  variant = "hero",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: HeroStatTrend;
  trendBadge?: HeroStatTrendBadge;
  secondary?: React.ReactNode;
  /** Optional link — when set, the card becomes clickable */
  href?: string;
  /** "hero" = dark hero section styling, "flat" = standard card styling for reports */
  variant?: "hero" | "flat";
}) {
  const style = variant === "flat"
    ? {
        card: "flex h-full flex-col rounded-2xl border border-border/50 bg-card p-4 shadow-sm transition hover:shadow-md",
        icon: "text-muted-foreground/60",
        label: "text-sm font-medium text-muted-foreground",
        value: "text-foreground",
        secondary: "text-muted-foreground",
        trendNeutral: "bg-muted text-muted-foreground",
        trendMuted: "text-muted-foreground/55",
        border: "border-border/30",
        ringOff: "",
      }
    : {
        card: "flex h-full flex-col rounded-2xl border border-hero-foreground/10 bg-hero-foreground/10 p-4 backdrop-blur transition hover:bg-hero-foreground/15",
        icon: "text-hero-foreground/80",
        label: "text-sm font-medium text-hero-foreground/80",
        value: "text-hero-foreground",
        secondary: "text-hero-foreground/60",
        trendNeutral: "bg-hero-foreground/10 text-hero-foreground/60",
        trendMuted: "text-hero-foreground/55",
        border: "border-hero-foreground/10",
        ringOff: "ring-offset-hero/80",
      };

  const card = (innerTrendBadge: boolean) =>
    innerTrendBadge ? (
      <div className={style.card}>
        <div className="flex items-center gap-2">
          <Icon className={cn("size-4 shrink-0", style.icon)} />
          <span className={style.label}>{label}</span>
        </div>

        <div className="mt-2 flex items-end justify-between">
          <p className={cn("text-3xl font-semibold tracking-tightest", style.value)}>
            {value}
          </p>
          <TrendBadge badge={trendBadge!} mutedClass={style.trendMuted} />
        </div>

        {secondary && (
          <p className={cn("mt-auto pt-2 text-sm", style.secondary)}>{secondary}</p>
        )}
      </div>
    ) : (
      <div className={style.card}>
        <div className="mb-1 flex items-center gap-2">
          <Icon className={cn("size-4 shrink-0", style.icon)} />
          <span className={style.label}>{label}</span>
        </div>

        <div className="flex items-end gap-3">
          <p className={cn("text-3xl font-semibold tracking-tightest", style.value)}>
            {value}
          </p>

          {trend && trend.direction !== "neutral" && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium",
                trend.direction === "up"
                  ? "bg-success/20 text-success"
                  : "bg-destructive/20 text-destructive",
              )}
            >
              <svg
                className={cn("h-2.5 w-2.5", trend.direction === "up" ? "rotate-0" : "rotate-180")}
                viewBox="0 0 10 6"
                fill="none"
              >
                <path
                  d="M0 6L5 0L10 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {trend.value}
            </span>
          )}

          {trend && trend.direction === "neutral" && (
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-medium", style.trendNeutral)}>
              <svg className="h-2.5 w-2.5" viewBox="0 0 10 2" fill="none">
                <path d="M0 1L10 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {trend.value}
            </span>
          )}
        </div>

        {secondary && (
          <p className={cn("mt-1 text-sm", style.secondary)}>{secondary}</p>
        )}
      </div>
    );

  const inner = trendBadge ? card(true) : card(false);

  if (href) {
    return (
      <Link
        href={href}
        className={cn("block cursor-pointer rounded-2xl outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]", style.ringOff)}
      >
        {inner}
      </Link>
    );
  }

  return inner;
}
