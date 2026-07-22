import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    // Base
    "group/button relative inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent",
    "text-sm font-medium whitespace-nowrap",
    "transition-all duration-200 ease-out",
    "outline-none select-none",
    // Focus
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    // Active press (except when it controls a popup)
    "active:not-aria-[haspopup]:scale-[0.97]",
    // Disabled
    "disabled:pointer-events-none disabled:opacity-50",
    // Invalid
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
    "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
    // Icons
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: ["bg-primary text-primary-foreground",
      "shadow-sm shadow-primary/20",
      "hover:shadow-md hover:shadow-primary/25 hover:-translate-y-0.5",
    ].join(" "),
        gradient: [
          "bg-primary text-primary-foreground",
          "shadow-sm shadow-primary/20",
          "hover:shadow-md hover:shadow-primary/25 hover:-translate-y-0.5",
        ].join(" "),
        outline: [
          "border-border bg-background text-foreground",
          "hover:bg-muted hover:text-foreground",
          "dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        ].join(" "),
        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
        ].join(" "),
        ghost: [
          "text-foreground",
          "hover:bg-muted hover:text-foreground",
          "dark:hover:bg-muted/50",
        ].join(" "),
        destructive: [
          "bg-destructive/10 text-destructive",
          "hover:bg-destructive/20",
          "focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
          "dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        ].join(" "),
        link: [
          "text-primary underline-offset-4",
          "hover:underline",
        ].join(" "),
      },
      size: {
        default: "h-9 gap-2 px-4",
        xs: "h-7 gap-1.5 rounded-lg px-2.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-[10px] px-3 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2.5 px-5",
        icon: "size-9",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-[10px]",
        "icon-lg": "size-10",
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
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
