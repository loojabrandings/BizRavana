import { cn } from "@/lib/utils";

interface RetroGridProps {
  angle?: number;
  cellSize?: number;
  opacity?: number;
  className?: string;
}

export function RetroGrid({
  angle = 55,
  cellSize = 56,
  opacity = 0.4,
  className,
}: RetroGridProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [perspective:240px]",
        className
      )}
    >
      <div
        className="absolute inset-0"
        style={{ transform: `rotateX(${angle}deg)` }}
      >
        <div
          className="animate-retro-grid absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, color-mix(in oklch, var(--border) 30%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--border) 30%, transparent) 1px, transparent 1px)`,
            backgroundSize: `${cellSize}px ${cellSize}px`,
            opacity,
          }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
    </div>
  );
}
