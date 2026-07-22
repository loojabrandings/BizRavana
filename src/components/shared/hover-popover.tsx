"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger, PopoverTitle } from "@/components/ui/popover";

/**
 * A popover that opens on hover instead of click.
 * Includes a small close delay to prevent flickering when moving
 * from the trigger to the popup content.
 *
 * Made reusable so it can be used elsewhere in the application.
 */
export function HoverPopover({
  children,
  title,
  items,
}: {
  /** Trigger content – rendered inline inside the popover trigger */
  children: ReactNode;
  /** Bold title shown at the top of the popover card */
  title: string;
  /** List of strings rendered as a bulleted list inside the popover */
  items: string[];
}) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleOpen = useCallback(() => {
    clearTimer();
    setOpen(true);
  }, [clearTimer]);

  const handleClose = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setOpen(false);
    }, 80) as ReturnType<typeof setTimeout>;
  }, []);

  return (
    <div onMouseEnter={handleOpen} onMouseLeave={handleClose} className="inline-flex flex-col">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="pointer-events-none">
          <div className="cursor-pointer flex flex-col items-start">{children}</div>
        </PopoverTrigger>
        <PopoverContent
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
          className="max-w-[280px]"
        >
          {title && <PopoverTitle className="mb-1">{title}</PopoverTitle>}
          {items.length > 0 && (
            <ul className="space-y-1">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-0.5 shrink-0 select-none">•</span>
                  <span className="break-words">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
