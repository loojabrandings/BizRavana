"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Save, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { syncCourierLocations } from "@/lib/delivery/courier-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// ─── Props ──────────────────────────────────────────────────────────

interface RoyalExpressCredentialsProps {
  businessId: string;
  credentials: Record<string, string>;
  onChange: (field: string, value: string) => void;
  saved: boolean;
  onSaved: (saved: boolean) => void;
}

// ─── Component ──────────────────────────────────────────────────────

export function RoyalExpressCredentials({
  businessId,
  credentials,
  onChange,
  saved,
  onSaved,
}: RoyalExpressCredentialsProps) {
  const tenant = credentials.tenant ?? "royalexpress";
  const email = credentials.email ?? "";
  const password = credentials.password ?? "";

  // ── Test Connection ─────────────────────────────────────────────
  const handleTestConnection = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all credential fields first");
      return;
    }

    try {
      const res = await fetch(
        "https://v1.api.curfox.com/api/public/merchant/login",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-tenant": tenant.trim(),
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim(),
          }),
        },
      );

      const data = await res.json();

      if (res.ok && data.token) {
        toast.success("Connection successful! Your credentials are valid.");
      } else if (data.message === "Account Not Found") {
        toast.error("Account not found. Check your tenant name.");
      } else if (data.message === "Password Invalid!") {
        toast.error("Invalid password. Please check your credentials.");
      } else {
        toast.error("Connection failed", {
          description: data.message || "Could not connect to Royal Express API.",
        });
      }
    } catch (err) {
      toast.error("Connection failed", {
        description:
          err instanceof Error
            ? err.message
            : "Could not reach the Royal Express API. Check your internet connection.",
      });
    }
  }, [tenant, email, password]);

  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const entries: Record<string, string> = {
        courier_royal_express_tenant: tenant,
        courier_royal_express_email: email,
        courier_royal_express_password: password,
      };

      for (const [key, value] of Object.entries(entries)) {
        if (value.trim()) {
          await supabase.from("business_settings").upsert(
            { business_id: businessId, key, value },
            { onConflict: "business_id, key" },
          );
        }
      }

      onSaved(!!tenant.trim() && !!email.trim() && !!password.trim());

      // Auto-sync locations after saving credentials
      setSyncing(true);
      try {
        await syncCourierLocations(businessId, { tenant, email, password }, "royal_express");
        toast.success("District & city data synced from Royal Express");
      } catch (syncErr) {
        toast.error("Failed to sync locations", {
          description: syncErr instanceof Error ? syncErr.message : undefined,
        });
      } finally {
        setSyncing(false);
      }

      toast.success("Courier settings saved");
    } catch (err) {
      toast.error("Failed to save courier settings", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    } finally {
      setSaving(false);
    }
  }, [businessId, tenant, email, password, onSaved]);

  const [testing, setTesting] = useState(false);

  const handleTestClick = useCallback(async () => {
    setTesting(true);
    try {
      await handleTestConnection();
    } finally {
      setTesting(false);
    }
  }, [handleTestConnection]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mt-5 overflow-hidden"
    >
      <div className="rounded-xl border border-border/30 bg-muted/5 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold text-foreground">
              Royal Express API Credentials
            </Label>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              Enter your Royal Express (Curfox DMS) API login details.
            </p>
          </div>
          {saved && (
            <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success">
              Saved
            </span>
          )}
        </div>

        <div className="space-y-3">
          {/* Tenant — auto-filled and readonly for Royal Express */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground/70">
              Tenant Name
            </Label>
            <Input
              value={tenant}
              readOnly
              className="h-10 bg-muted/20 text-muted-foreground/70 cursor-not-allowed"
            />
            <p className="text-[11px] text-muted-foreground/50">
              Auto-filled for Royal Express. Cannot be changed.
            </p>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground/70">
              API Email
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="sales@testmerchant.com"
              className="h-10"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground/70">
              API Password
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => onChange("password", e.target.value)}
              placeholder="Enter your API password"
              className="h-10"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestClick}
            disabled={testing || !email.trim() || !password.trim()}
          >
            {testing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Truck className="size-3.5" />
            )}
            {testing ? "Testing..." : "Test Connection"}
          </Button>

          <Button
            variant="gradient"
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            {syncing ? "Syncing locations..." : saving ? "Saving..." : "Save Credentials"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
