"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface AdminMobileTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
}

export function AdminMobileTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: AdminMobileTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active tab into view
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeEl = scrollRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeTab]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex items-center gap-1 rounded-xl bg-muted/30 p-1 border border-border/20 overflow-x-auto scrollbar-none",
        className,
      )}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          data-tab={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap shrink-0",
            activeTab === tab.key
              ? "bg-card text-foreground shadow-sm ring-1 ring-border/30"
              : "text-muted-foreground/70 hover:text-foreground",
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-1 text-[10px] font-semibold",
                activeTab === tab.key
                  ? "bg-primary/10 text-primary"
                  : "bg-muted/50 text-muted-foreground/60",
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
