import { cn } from "@/lib/utils";

interface MeteorsProps {
  number?: number;
  className?: string;
}

export function Meteors({ number = 12, className }: MeteorsProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      {Array.from({ length: number }).map((_, i) => {
        const x = (i * 17 + 3) % 100;
        const y = (i * 13 + 7) % 100;
        const delay = (i * 0.7 + 0.2) % 6;
        const duration = 2.5 + (i * 0.4) % 3;
        const angle = 215 + (i * 3) % 10;

        return (
          <span
            key={i}
            className="animate-meteor absolute h-px w-[40px] rounded-full bg-gradient-to-r from-primary to-transparent"
            style={{
              top: `${y}%`,
              left: `${x}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              "--meteor-angle": `${angle}deg`,
            } as React.CSSProperties}
          >
            <span className="absolute -top-[1.5px] right-0 h-[4px] w-[4px] rounded-full bg-primary" />
          </span>
        );
      })}
    </div>
  );
}
