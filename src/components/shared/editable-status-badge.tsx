import { ChevronDown, CheckIcon } from "lucide-react";
import { cn, formatEnumLabel } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
/**
 * Maps a status value to its text color using:
 * 1. Parent-provided colorMap
 * 2. Falls back to empty string
 */
function getStatusColor(value: string, colorMap?: Record<string, string>): string {
  return colorMap?.[value] ?? "";
}

export function EditableStatusBadge({
  value,
  options,
  colorMap,
  onUpdate,
}: {
  value: string;
  options: readonly { value: string; label: string }[];
  colorMap?: Record<string, string>;
  onUpdate: (newValue: string) => void;
}) {
  const displayColor = getStatusColor(value, colorMap);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex w-full items-center justify-between gap-1 rounded-md pl-3 pr-1.5 py-0.5 text-sm font-semibold whitespace-nowrap transition-all cursor-pointer bg-transparent",
          "hover:bg-accent/30",
          "active:scale-[0.97]",
          displayColor,
        )}
      >
        {formatEnumLabel(value)}
        <ChevronDown className="size-2.5 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[140px] p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-1.5 pb-1">
            Change to
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <DropdownMenuItem
              key={option.value}
              className={cn(
                "pr-10",
                isSelected && "bg-primary/10 font-semibold text-primary",
              )}
              onClick={() => onUpdate(option.value)}
            >
              <span className={cn(getStatusColor(option.value, colorMap))}>
                {formatEnumLabel(option.label)}
              </span>
              {isSelected && (
                <span className="pointer-events-none absolute right-3 flex size-4 items-center justify-center">
                  <CheckIcon className="size-3.5 text-primary" />
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
