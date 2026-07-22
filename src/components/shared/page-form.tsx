"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

// ─── Types ────────────────────────────────────────────────────────

export interface PageFormBreadcrumb {
  label: string;
  href?: string;
}

export interface PageFormProps {
  /** Breadcrumb trail (e.g. [{ label: "Orders", href: "#" }, { label: "New Order" }]) */
  breadcrumb: PageFormBreadcrumb[];
  /** Page title */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Optional back action (shown as a button) */
  onBack?: () => void;
  /** Max width for the content container (default: 1200px) */
  maxWidth?: string;
  /** Extra className for the container */
  className?: string;
  /** Form sections/content */
  children: React.ReactNode;
}

// ─── Form Section ─────────────────────────────────────────────────

export interface PageFormSectionProps {
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

export function PageFormSection({
  title,
  description,
  className,
  children,
}: PageFormSectionProps) {
  return (
    <div
      className={cn(
        "rounded-2xl glass-card p-6 md:p-7 space-y-5",
        className,
      )}
    >
      {title && (
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Form Field Layout ────────────────────────────────────────────

export interface PageFormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function PageFormField({
  label,
  required,
  error,
  className,
  children,
}: PageFormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="flex items-center gap-1 text-sm font-medium text-foreground/85">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

// ─── Form Row (horizontal grid) ───────────────────────────────────

export function PageFormRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      {...props}
    />
  );
}

// ─── Form Actions Bar ─────────────────────────────────────────────

export interface PageFormActionsProps {
  className?: string;
  children: React.ReactNode;
}

export function PageFormActions({ className, children }: PageFormActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-3 border-t border-border/50 pt-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ─── Form Divider ─────────────────────────────────────────────────

export function PageFormDivider({ className }: { className?: string }) {
  return (
    <div className={cn("border-t border-border/50", className)} />
  );
}

// ─── Main Shell ───────────────────────────────────────────────────

export function PageForm({
  breadcrumb,
  title,
  description,
  onBack,
  maxWidth = "1200px",
  className,
  children,
}: PageFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn("space-y-6", className)}
    >
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumb.map((crumb, i) => {
              const isLast = i === breadcrumb.length - 1;
              return (
                <BreadcrumbItem key={`item-${i}`}>
                  {isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={crumb.href ?? "#"}
                      onClick={(e) => {
                        if (!crumb.href || crumb.href === "#") {
                          e.preventDefault();
                        }
                      }}
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              );
            })}
            {/* Separators rendered as siblings, not children of BreadcrumbItem */}
            {breadcrumb.slice(0, -1).map((_, i) => (
              <BreadcrumbSeparator key={`sep-${i}`} />
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="size-3.5" />
            Back
          </Button>
        )}
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Content container */}
      <div
        className="mx-auto w-full space-y-6"
        style={{ maxWidth }}
      >
        {children}
      </div>
    </motion.div>
  );
}
