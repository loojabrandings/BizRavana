import type React from "react";
import { cn } from "@/lib/utils";

export function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl sm:rounded-3xl glass-card overflow-hidden", className)}>
      <div className="border-b border-border/50 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex size-8 sm:size-9 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10">
            <Icon className="size-3.5 sm:size-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{title}</p>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{description}</p>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 py-4 sm:py-5">{children}</div>
    </div>
  );
}
