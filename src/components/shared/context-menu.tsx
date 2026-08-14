"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  onClick: () => void;
  disabled?: boolean;
  separatorAfter?: boolean;
  variant?: "default" | "danger";
}

export interface ContextMenuSection {
  id: string;
  label?: string;
  items: ContextMenuItem[];
}

interface ContextMenuProps {
  sections: ContextMenuSection[];
  x: number;
  y: number;
  onClose: () => void;
  /** Optional className for overriding styles */
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────────

export function ContextMenu({
  sections,
  x,
  y,
  onClose,
  className,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay adding the listener to avoid the same click that opened the menu
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Calculate position to keep menu within viewport
  const adjustedPosition = (() => {
    const menuWidth = 220;
    const menuHeight = sections.reduce((total, section) => {
      return total + (section.label ? 36 : 0) + section.items.length * 36 + (section.items.filter(i => i.separatorAfter).length * 8);
    }, 16);

    const maxX = window.innerWidth - menuWidth - 16;
    const maxY = window.innerHeight - menuHeight - 16;

    return {
      left: Math.min(x, maxX),
      top: Math.min(y, maxY),
    };
  })();

  return (
    <div
      ref={menuRef}
      className={cn(
        "fixed z-[100] min-w-[200px] rounded-xl border border-border/50 bg-popover p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150",
        className,
      )}
      style={{
        left: adjustedPosition.left,
        top: adjustedPosition.top,
      }}
    >
      {sections.map((section, sectionIdx) => (
        <div key={section.id}>
          {sectionIdx > 0 && (
            <div className="mx-1.5 my-1 border-t border-border/40" />
          )}

          {section.label && (
            <div className="px-2.5 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
              {section.label}
            </div>
          )}

          <div className="space-y-0.5">
            {section.items.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                  }
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                  item.disabled
                    ? "cursor-not-allowed opacity-40"
                    : item.variant === "danger"
                      ? "text-destructive/80 hover:bg-status-danger-bg hover:text-destructive"
                      : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {item.icon && (
                  <item.icon
                    className={cn(
                      "size-3.5 shrink-0",
                      item.iconClassName || "text-muted-foreground/60",
                    )}
                  />
                )}
                <span className="flex-1">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
