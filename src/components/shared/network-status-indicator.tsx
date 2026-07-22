"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * A subtle, always-visible status pill in the global header that
 * shows the current cloud connectivity state.
 *
 * - 🟢 Online / Synced  — normal operation
 * - 🔴 Offline          — no internet connection
 *
 * Displays a reconnection toast when the connection is restored.
 */
export function NetworkStatusIndicator() {
  const { isOnline } = useNetworkStatus();
  const [justReconnected, setJustReconnected] = useState(false);
  const prevOnline = useRef(isOnline);
  const prefersReducedMotion = useReducedMotion();

  // ─── Reconnection toast + pulse effect ────────────────────────
  useEffect(() => {
    if (!prevOnline.current && isOnline) {
      // Just came back online
      toast.success("Connection restored.", {
        description: "BizRavana is back online.",
        duration: 4000,
      });

      // Trigger a brief pulse on the dot
      setJustReconnected(true);
      const timer = setTimeout(() => setJustReconnected(false), 1000);
      return () => clearTimeout(timer);
    }

    if (prevOnline.current && !isOnline) {
      toast.error("Unable to connect.", {
        description: "Please check your internet connection and try again.",
        duration: 6000,
      });
    }

    prevOnline.current = isOnline;
  }, [isOnline]);

  // ─── Offline → toast on mount ─────────────────────────────────
  useEffect(() => {
    if (!isOnline) {
      toast.error("Unable to connect.", {
        description: "Please check your internet connection and try again.",
        duration: 6000,
      });
    }
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isOnline) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              aria-label="Online — Connected to BizRavana Cloud"
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all duration-200",
                "bg-success/10 text-success",
                "hover:bg-success/15",
                "active:scale-95",
              )}
            />
          }
        >
          <span className="relative flex size-2 shrink-0">
            <span
              className={cn(
                "absolute inline-flex size-full rounded-full bg-success opacity-75",
                justReconnected && !prefersReducedMotion && "animate-ping",
              )}
              style={{ animationDuration: "600ms" }}
            />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          Online
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={10} className="status-tooltip status-tooltip-online min-w-60">
          <div className="relative px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2 shrink-0">
                <span className="inline-flex size-2 rounded-full bg-success" />
              </span>
              <p className="text-sm font-semibold text-foreground">
                Connected to BizRavana Cloud
              </p>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              All changes are automatically saved and synced.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label="Offline — No internet connection"
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all duration-200",
              "bg-destructive/10 text-destructive",
              "hover:bg-destructive/15",
              "active:scale-95",
            )}
          />
        }
      >
        <span className="relative flex size-2 shrink-0">
          <span className="inline-flex size-2 rounded-full bg-destructive" />
        </span>
        Offline
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={10} className="status-tooltip status-tooltip-offline min-w-60">
        <div className="relative px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2 shrink-0">
              <span className="inline-flex size-2 rounded-full bg-destructive" />
            </span>
            <p className="text-sm font-semibold text-foreground">
              You&apos;re currently offline.
            </p>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            BizRavana requires an internet connection to access and update business data.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Reconnect to continue.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
