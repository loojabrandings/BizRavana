"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn, formatEnumLabel } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

const Select = SelectPrimitive.Root

// ─── SelectGroup ─────────────────────────────────────────────────

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={className}
      {...props}
    />
  )
}

// ─── SelectValue ─────────────────────────────────────────────────

function SelectValue({
  className,
  children,
  placeholder,
  ...props
}: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("data-placeholder:text-muted-foreground flex-1 text-left min-w-0", className)}
      placeholder={placeholder}
      {...props}
    >
      {typeof children === "string" ? formatEnumLabel(children) : children}
    </SelectPrimitive.Value>
  )
}

// ─── SelectTrigger ──────────────────────────────────────────────

function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "group inline-flex h-9 items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-sm text-foreground select-none outline-none transition-colors dark:bg-input/30",
        "hover:border-foreground/20",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="shrink-0 transition-transform duration-200 group-data-[popup-open]:rotate-180">
        <ChevronDownIcon className="size-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

// ─── SelectContent ──────────────────────────────────────────────

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            "w-[--anchor-width] overflow-hidden rounded-xl border border-border/50 bg-[var(--glass-bg)] backdrop-blur-xl p-1.5 shadow-lg",
            "transition-all duration-150 ease-out",
            "data-starting-style:opacity-0 data-starting-style:translate-y-1 data-starting-style:scale-[0.98]",
            "data-ending-style:opacity-0 data-ending-style:translate-y-1 data-ending-style:scale-[0.98]",
            "motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100",
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List
            className="max-h-80 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/50 [&::-webkit-scrollbar-track]:bg-transparent"
            style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}
          >
            {children}
          </SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

// ─── SelectLabel ────────────────────────────────────────────────

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={className}
      {...props}
    />
  )
}

// ─── SelectItem ─────────────────────────────────────────────────

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full min-h-10 cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-colors duration-150",
        "pr-10",
        "max-sm:min-h-11",
        "hover:bg-accent hover:text-foreground",
        "data-highlighted:bg-accent data-highlighted:text-foreground",
        "aria-selected:bg-primary aria-selected:text-foreground aria-selected:font-semibold",
        "aria-selected:hover:bg-primary/90",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex-1 truncate text-left">
        {typeof children === "string" ? formatEnumLabel(children) : children}
      </SelectPrimitive.ItemText>

      <SelectPrimitive.ItemIndicator
        className="pointer-events-none absolute right-3 flex size-4 items-center justify-center text-foreground"
        render={
          <span><CheckIcon className="size-4" /></span>
        }
      />
    </SelectPrimitive.Item>
  )
}

// ─── SelectSeparator ────────────────────────────────────────────

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={className}
      {...props}
    />
  )
}

// ─── Scroll buttons ─────────────────────────────────────────────

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={className}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={className}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
