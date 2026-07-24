"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Save, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/shared/collapsible-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { syncCourierLocations } from "@/lib/delivery/courier-utils";
import { WaybillSettings } from "@/components/delivery/waybill-settings";

// ─── Constants ──────────────────────────────────────────────────────

const COURIER_OPTIONS = [
  { value: "none", label: "None — No courier integration" },
  { value: "royal_express", label: "Royal Express" },
];

const SETTINGS_KEYS = {
  selected_courier: "courier_selected_provider",
  royal_express_tenant: "courier_royal_express_tenant",
  royal_express_email: "courier_royal_express_email",
  royal_express_password: "courier_royal_express_password",
} as const;

// ─── Component ──────────────────────────────────────────────────────

export function CourierSettings({ activeSection }: { activeSection?: string | null }) {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [selectedCourier, setSelectedCourier] = useState("none");

  // Royal Express credential fields
  const [tenant, setTenant] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [savedCredentials, setSavedCredentials] = useState(false);

  // ── Load existing settings ─────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("business_id")
          .eq("user_id", session.user.id)
          .single();

        if (!profile?.business_id) return;
        setBusinessId(profile.business_id);

        const { data: settings } = await supabase
          .from("business_settings")
          .select("key, value")
          .eq("business_id", profile.business_id);

        if (settings) {
          const map: Record<string, string> = {};
          settings.forEach((s) => {
            map[s.key] = String(s.value);
          });

          const provider = map[SETTINGS_KEYS.selected_courier];
          if (provider) setSelectedCourier(provider);

          if (provider === "royal_express") {
            setTenant("royalexpress"); // auto-filled, readonly
            setEmail(map[SETTINGS_KEYS.royal_express_email] || "");
            setPassword(map[SETTINGS_KEYS.royal_express_password] || "");

            const hasCreds =
              !!map[SETTINGS_KEYS.royal_express_tenant] &&
              !!map[SETTINGS_KEYS.royal_express_email] &&
              !!map[SETTINGS_KEYS.royal_express_password];
            setSavedCredentials(hasCreds);
          }
        }
      } catch (err) {
        console.error("Failed to load courier settings:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Save handler: Courier credentials only ────────────────────
  const handleSave = useCallback(async () => {
    if (!businessId) {
      toast.error("No business found");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();

      // Save selected courier
      await supabase.from("business_settings").upsert(
        { business_id: businessId, key: SETTINGS_KEYS.selected_courier, value: selectedCourier },
        { onConflict: "business_id, key" },
      );

      if (selectedCourier === "royal_express") {
        const entries: Record<string, string> = {
          [SETTINGS_KEYS.royal_express_tenant]: tenant,
          [SETTINGS_KEYS.royal_express_email]: email,
          [SETTINGS_KEYS.royal_express_password]: password,
        };

        for (const [key, value] of Object.entries(entries)) {
          if (value.trim()) {
            await supabase.from("business_settings").upsert(
              { business_id: businessId, key, value },
              { onConflict: "business_id, key" },
            );
          }
        }

        setSavedCredentials(!!tenant.trim() && !!email.trim() && !!password.trim());

        // Auto-sync locations after saving credentials
        setSyncing(true);
        try {
          await syncCourierLocations(businessId, {
            tenant,
            email,
            password,
          });
          toast.success("District & city data synced from Royal Express");
        } catch (syncErr) {
          // Don't block the save — locations can be retried
          toast.error("Failed to sync locations", {
            description: syncErr instanceof Error ? syncErr.message : undefined,
          });
        } finally {
          setSyncing(false);
        }
      }

      toast.success("Courier settings saved");
    } catch (err) {
      toast.error("Failed to save courier settings", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    } finally {
      setSaving(false);
    }
  }, [businessId, selectedCourier, tenant, email, password]);

  // ── Test connection ────────────────────────────────────────────
  const handleTestConnection = useCallback(async () => {
    if (!tenant.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all credential fields first");
      return;
    }
    setTesting(true);
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
    } finally {
      setTesting(false);
    }
  }, [tenant, email, password]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-5 animate-spin text-muted-foreground/60" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(!activeSection || activeSection === "courier-provider") && (
        <CollapsibleCard id="settings-courier-provider" collapsible={false} icon={Truck} title="Courier Provider" description="Select a courier company to enable delivery tracking and shipment management. More couriers will be added in future updates.">
        {/* ── Courier Selector ── */}
        <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
              Choose Courier Service
            </Label>
            <div className="mt-2">
              <Select
                value={selectedCourier}
                onValueChange={(v) => {
                  if (v) {
                    setSelectedCourier(v);
                    if (v === "royal_express") {
                      setTenant("royalexpress");
                    }
                  }
                  if (v && v !== "royal_express") {
                    setSavedCredentials(false);
                  }
                }}
              >
                <SelectTrigger className="h-9 w-full sm:w-[320px]">
                  <SelectValue placeholder="Select a courier company..." />
                </SelectTrigger>
                <SelectContent>
                  {COURIER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Royal Express Credentials ── */}
          {selectedCourier === "royal_express" && (
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
                  {savedCredentials && (
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
                      onChange={(e) => setEmail(e.target.value)}
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
                      onChange={(e) => setPassword(e.target.value)}
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
                    onClick={handleTestConnection}
                    disabled={
                      testing || !tenant.trim() || !email.trim() || !password.trim()
                    }
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
          )}
      </CollapsibleCard>
      )}

      {(!activeSection || activeSection === "waybill-settings") && (
      <CollapsibleCard id="settings-waybill-settings" collapsible={false} icon={Truck} title="Waybill Settings" description="Configure how waybill IDs are managed and assigned to orders.">
        <WaybillSettings businessId={businessId} />
      </CollapsibleCard>
      )}
    </div>
  );
}
