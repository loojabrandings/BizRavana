import { Layers3 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Column header type for the table shell variant ─────────────
interface EmptyStateColumn {
  id: string;
  label: string;
  className?: string;
  hideOnMobile?: boolean;
}

// ─── Props ────────────────────────────────────────────────────────

export interface EmptyStateProps {
  /** Optional icon component */
  icon?: React.ElementType;
  /** Main heading text */
  title: string;
  /** Optional supporting description */
  description?: string;
  /** Optional action element (e.g. a Button) */
  action?: React.ReactNode;
  /** Optional column headers to show as a header row (table variant) */
  columns?: EmptyStateColumn[];
  /** Show a checkbox placeholder in the header row */
  showCheckbox?: boolean;
  /** Additional className for the outer container */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  columns,
  showCheckbox,
  className,
}: EmptyStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-muted ring-1 ring-border/50">
        {Icon ? (
          <Icon className="size-6 text-muted-foreground/50" />
        ) : (
          <Layers3 className="size-6 text-muted-foreground/50" />
        )}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );

  // If columns are provided, render the table shell with header row
  if (columns) {
    return (
      <div className={cn("rounded-2xl border border-border bg-card", className)}>
        <div className="border-b border-border/50 px-6 py-3">
          <div className="flex gap-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {showCheckbox && <span className="w-10 shrink-0" />}
            {columns.map((col) => (
              <span
                key={col.id}
                className={cn(col.hideOnMobile && "hidden md:block", col.className)}
              >
                {col.label}
              </span>
            ))}
          </div>
        </div>
        {content}
      </div>
    );
  }

  // Standalone variant (no column headers)
  return (
    <div className={cn("rounded-2xl border border-border bg-card", className)}>
      {content}
    </div>
  );
}
