"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { cn, formatEnumLabel } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
  label?: string;
  align?: "start" | "center" | "end";
  fullWidth?: boolean;
}

// ─── Main Dropdown Component ──────────────────────────────────────

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  className,
  size = "default",
  label,
  align = "start",
  fullWidth = false,
}: DropdownProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        className={cn(
          "group inline-flex h-9 items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-sm text-foreground select-none outline-none transition-colors dark:bg-input/30",
          "hover:border-foreground/20",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      >
        <SelectPrimitive.Value
          className="data-placeholder:text-muted-foreground flex-1 text-left min-w-0"
          placeholder={label ? `${label}: ${placeholder}` : placeholder}
        >
          {label && selectedOption
            ? `${label}: ${formatEnumLabel(selectedOption.label)}`
            : selectedOption
              ? formatEnumLabel(selectedOption.label)
              : undefined}
        </SelectPrimitive.Value>

        <SelectPrimitive.Icon className="shrink-0 transition-transform duration-200 group-data-[popup-open]:rotate-180">
          <ChevronDownIcon className="size-4" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          side="bottom"
          sideOffset={6}
          align={align}
          alignItemWithTrigger={false}
          className="isolate z-50"
        >
          <SelectPrimitive.Popup
            className="w-[--anchor-width] overflow-hidden rounded-xl border border-border/50 bg-[var(--glass-bg)] backdrop-blur-xl p-1.5 shadow-lg transition-all duration-150 ease-out data-starting-style:opacity-0 data-starting-style:translate-y-1 data-starting-style:scale-[0.98] data-ending-style:opacity-0 data-ending-style:translate-y-1 data-ending-style:scale-[0.98] motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100"
          >
            <SelectPrimitive.List
              className="max-h-80 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/50 [&::-webkit-scrollbar-track]:bg-transparent"
              style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}
            >
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={cn(
                      "relative flex w-full min-h-10 cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground outline-none pr-10 max-sm:min-h-11 transition-colors duration-150",
                      isSelected && "bg-primary text-foreground font-semibold hover:bg-primary/90",
                      !isSelected && "hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {/* Icon */}
                      {option.icon && (
                        <span className="shrink-0">
                          {option.icon}
                        </span>
                      )}

                      <span className="truncate text-left">
                        {formatEnumLabel(option.label)}
                      </span>
                    </span>

                    {/* Check icon on selected */}
                    {isSelected && (
                      <span className="pointer-events-none absolute right-3 flex size-4 items-center justify-center text-foreground">
                        <CheckIcon className="size-4" />
                      </span>
                    )}
                  </SelectPrimitive.Item>
                );
              })}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
