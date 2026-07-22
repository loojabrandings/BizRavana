/**
 * SearchableSelect — A searchable dropdown using Popover + Command (cmdk).
 *
 * Use this instead of Select when the option list is long enough to
 * benefit from keyboard-filtering (districts, cities, etc.).
 *
 * @example
 * <SearchableSelect
 *   value={form.district}
 *   onValueChange={(v) => updateForm("district", v)}
 *   options={SRI_LANKA_DISTRICTS}
 *   placeholder="Select district"
 *   searchPlaceholder="Search districts..."
 * />
 */

"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  className?: string;
  emptyMessage?: string;
  /** Optional search placeholder inside the dropdown */
  searchPlaceholder?: string;
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  className,
  emptyMessage = "No results found.",
  searchPlaceholder = "Search...",
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 text-sm font-normal text-foreground outline-none transition-colors select-none",
          "hover:border-foreground/20",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          !value && "text-muted-foreground",
          className,
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground/60 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="w-[--anchor-width] p-0 shadow-lg"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  data-checked={value === option ? "true" : undefined}
                  onSelect={() => {
                    onValueChange(option);
                    setOpen(false);
                  }}
                >
                  <span className="flex-1">{option}</span>
                  <Check
                    className={cn(
                      "size-3.5",
                      value === option ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
