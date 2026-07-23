"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Hourglass,
  XCircle,
  Sparkles,
  CalendarClock,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useReadOnlyMode } from "@/providers/readonly-mode-provider";

/**
 * Premium read-only mode banner displayed at the top of the dashboard
 * when the business account has expired or the trial has ended.
 *
 * Shows:
 * - Trial expired → upgrade CTA with retention days
 * - Subscription expired → renew CTA with retention days
 */
export function ReadOnlyBanner() {
  const { isReadOnly, accountStatus, retentionDaysRemaining } = useReadOnlyMode();
  const router = useRouter();

  if (!isReadOnly) return null;

  const isTrialExpired = accountStatus === "trial_expired";
  const isSubExpired = accountStatus === "expired";

  const icon = isTrialExpired ? Hourglass : XCircle;
  const Icon = icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -20, height: 0 }}
      className="relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-destructive/[0.06] via-destructive/[0.03] to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,var(--destructive)_0%,transparent_40%)] opacity-[0.07]" />

      <div className="relative mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        {/* Left: Icon + Message */}
        <div className="flex items-start gap-3 min-w-0">
          <div className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
            isTrialExpired
              ? "bg-warning/10 text-warning ring-warning/20"
              : "bg-destructive/10 text-destructive ring-destructive/20",
          )}>
            <Icon className="size-5" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {isTrialExpired
                ? "Your trial has ended"
                : "Your subscription has expired"
              }
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground/80 leading-relaxed">
              {isTrialExpired
                ? "Upgrade to a paid plan to continue using all features."
                : "Renew your subscription to regain full access to BizRavana."
              }
              {retentionDaysRemaining !== null && retentionDaysRemaining > 0 && (
                <span className="block mt-1 text-xs text-muted-foreground/60">
                  <CalendarClock className="inline size-3 mr-1 -mt-0.5" />
                  Your data will be retained for{" "}
                  <strong className="text-foreground/80">{retentionDaysRemaining} more day{retentionDaysRemaining !== 1 ? "s" : ""}</strong>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push("/dashboard/subscription")}
            className={cn(
              "shadow-sm",
              isTrialExpired && "bg-warning text-warning-foreground hover:bg-warning/90",
            )}
          >
            <Sparkles className="size-3.5 mr-1.5" />
            {isTrialExpired ? "Upgrade Now" : "Renew Subscription"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/subscription")}
            className="text-muted-foreground/70 hover:text-foreground"
          >
            <ShieldAlert className="size-3.5 mr-1.5" />
            View Plans
          </Button>
        </div>
      </div>

      {/* Bottom border */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-px",
        isTrialExpired
          ? "bg-gradient-to-r from-warning/30 via-warning/10 to-transparent"
          : "bg-gradient-to-r from-destructive/30 via-destructive/10 to-transparent",
      )} />
    </motion.div>
  );
}
