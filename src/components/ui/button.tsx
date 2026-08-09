import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    // Base
    "group/button relative inline-flex shrink-0 touch-manipulation items-center justify-center overflow-hidden rounded-[10px] border border-transparent",
    "text-sm font-medium whitespace-nowrap",
    "transition-all duration-200 ease-out",
    "outline-none select-none",
    // Focus
    "focus-visible:ring-3 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    // Active press (except when it controls a popup)
    "active:not-aria-[haspopup]:scale-[0.97]",
    // Disabled
    "disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none",
    // Invalid
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
    "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
    // Icons
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-white",
          "shadow-sm shadow-primary/20",
          "hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25",
        ].join(" "),
        gradient: [
          "bg-primary text-white",
          "shadow-sm shadow-primary/20",
          "hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25",
        ].join(" "),
        outline: [
          "border-border bg-transparent text-foreground shadow-xs",
          "hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted hover:shadow-sm",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:-translate-y-0.5 hover:bg-secondary/80 hover:shadow-sm",
        ].join(" "),
        ghost: [
          "text-muted-foreground",
          "hover:bg-muted hover:text-foreground",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground shadow-sm shadow-destructive/15",
          "hover:-translate-y-0.5 hover:bg-destructive/90 hover:shadow-md",
        ].join(" "),
        success: [
          "bg-success text-white shadow-sm shadow-success/15",
          "hover:-translate-y-0.5 hover:bg-success/90 hover:shadow-md",
        ].join(" "),
        link: [
          "text-primary underline-offset-4",
          "hover:underline",
        ].join(" "),
      },
      size: {
        default: "h-10 gap-2 px-4",
        md: "h-10 gap-2 px-4",
        xs: "h-8 gap-1.5 px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-[10px] px-3 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2.5 px-6 text-[15px] font-semibold [&_svg:not([class*='size-'])]:size-[18px]",
        icon: "size-10 max-sm:size-11",
        "icon-xs": "size-8 max-sm:size-11 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 max-sm:size-11",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    loadingText?: ReactNode;
  }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center gap-[inherit]">
        {loading && <Loader2 className="animate-spin" aria-hidden />}
        {loading && loadingText ? loadingText : children}
      </span>
      {variant !== "link" && (
        <span
          aria-hidden
          className="button-shimmer animate-shimmer pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/button:opacity-100"
        />
      )}
    </ButtonPrimitive>
  );
}

function ButtonLink({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
  VariantProps<typeof buttonVariants> & { children: ReactNode }) {
  return (
    <Link
      data-slot="button-link"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center gap-[inherit]">
        {children}
      </span>
      {variant !== "link" && (
        <span
          aria-hidden
          className="button-shimmer animate-shimmer pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/button:opacity-100"
        />
      )}
    </Link>
  );
}

export { Button, ButtonLink, buttonVariants };
