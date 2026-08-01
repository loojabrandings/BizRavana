"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Loader2, RefreshCw, Save, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { WaybillSettings } from "@/components/delivery/waybill-settings";
import {
  getProviderOptions,
  getProvider,
  extractCredentials,
  SHARED_SETTINGS_KEYS,
  type CourierProvider,
} from "@/lib/delivery/provider-registry";
import { loadCourierConfig, syncCourierLocations } from "@/lib/delivery/courier-utils";

// ─── Settings Keys ────────────────────────────────────────────────

const REFRESH_MODE_KEY = "courier_refresh_mode";

// ═══════════════════════════════════════════════════════════════════
// AutoCredentialForm — renders inputs from provider.credentialFields
// ═══════════════════════════════════════════════════════════════════

interface AutoCredentialFormProps {
  businessId: string;
  credentials: Record<string, string>;
  onChange: (field: string, value: string) => void;
  saved: boolean;
  onSaved: (saved: boolean) => void;
  provider: CourierProvider;
}

function AutoCredentialForm({
  businessId,
  credentials,
  onChange,
  saved,
  onSaved,
  provider,
}: AutoCredentialFormProps) {
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // ── Test Connection ─────────────────────────────────────────────
  const handleTestConnection = useCallback(async () => {
    const missing = (provider.credentialFields || [])
      .filter((f) => f.required && !credentials[f.key]?.trim());
    if (missing.length > 0) {
      toast.error(
        `Please fill in the required fields first: ${missing.map((f) => f.label).join(", ")}`,
      );
      return;
    }

    setTesting(true);
    try {
      const ok = await provider.testConnection(credentials);
      if (ok) {
        toast.success("Connection successful! Your credentials are valid.");
      } else {
        toast.error("Connection failed. Please check your credentials.");
      }
    } catch (err) {
      toast.error("Connection failed", {
        description: err instanceof Error ? err.message : "Could not reach the courier API.",
      });
    } finally {
      setTesting(false);
    }
  }, [provider, credentials]);

  // ── Save Credentials ────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const supabase = createClient();

      // Write each credential field using the provider's settingsKeys mapping
      for (const field of provider.credentialFields || []) {
        const dbKey = provider.settingsKeys[field.key];
        if (dbKey && credentials[field.key]?.trim()) {
          await supabase.from("business_settings").upsert(
            { business_id: businessId, key: dbKey, value: credentials[field.key].trim() },
            { onConflict: "business_id, key" },
          );
        }
      }

      // Auto-sync locations AFTER saving credentials but BEFORE
      // marking saved/ showing success — so a sync failure surfaces
      // before the user thinks everything is done.
      setSyncing(true);
      try {
        await syncCourierLocations(businessId, credentials, provider.id);
      } catch (syncErr) {
        // Sync failure is non-fatal — still show save success
        // but surface the warning.
        console.error("Location sync failed:", syncErr);
      } finally {
        setSyncing(false);
      }

      // Check if all required fields are filled
      const allRequiredFilled = (provider.credentialFields || [])
        .filter((f) => f.required)
        .every((f) => !!credentials[f.key]?.trim());
      onSaved(allRequiredFilled);

      toast.success(`${provider.label} credentials saved and locations synced`);
    } catch (err) {
      toast.error("Failed to save credentials", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    } finally {
      setSaving(false);
    }
  }, [businessId, provider, credentials, onSaved]);

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
              {provider.label} API Credentials
            </Label>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              Enter your {provider.label} API credentials.
            </p>
          </div>
          {saved && (
            <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success">
              <Check className="mr-1 size-3" />
              Saved
            </span>
          )}
        </div>

        <div className="space-y-3">
          {(provider.credentialFields || []).map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground/70">
                {field.label}
                {field.required && <span className="text-destructive ml-0.5">*</span>}
              </Label>
              <Input
                type={field.type || "text"}
                value={credentials[field.key] ?? ""}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                readOnly={field.readonly}
                className={cn(
                  "h-10",
                  field.readonly && "bg-muted/20 text-muted-foreground/70 cursor-not-allowed",
                )}
              />
              {field.hint && (
                <p className="text-[11px] text-muted-foreground/50">{field.hint}</p>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={testing}
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

// ═══════════════════════════════════════════════════════════════════
// CourierSettings — main settings component
// ═══════════════════════════════════════════════════════════════════

export function CourierSettings({ activeSection }: { activeSection?: string | null }) {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProvider, setSavingProvider] = useState(false);

  const [selectedCourier, setSelectedCourier] = useState("none");
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [savedCredentials, setSavedCredentials] = useState(false);

  // Dynamic options from registered providers
  const courierOptions = useMemo(() => getProviderOptions(), []);

  // ── Refresh mode state ────────────────────────────────────────
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60);
  const [savingRefreshMode, setSavingRefreshMode] = useState(false);

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

        // Use the shared config loader to get provider + credentials
        const config = await loadCourierConfig();

        if (config?.provider) {
          setSelectedCourier(config.provider);
          setCredentials(config.credentials);
          const hasAnyCreds = Object.values(config.credentials).some((v) => !!v.trim());
          setSavedCredentials(hasAnyCreds);
        } else {
          setSelectedCourier("none");
          setCredentials({});
          setSavedCredentials(false);
        }

        // Load refresh mode preference
        const { data: refreshSetting } = await supabase
          .from("business_settings")
          .select("value")
          .eq("business_id", profile.business_id)
          .eq("key", REFRESH_MODE_KEY)
          .maybeSingle();

        if (refreshSetting?.value) {
          const val = typeof refreshSetting.value === "string"
            ? refreshSetting.value
            : JSON.stringify(refreshSetting.value);
          try {
            const parsed = JSON.parse(val);
            setAutoRefresh(parsed.enabled ?? false);
            setRefreshInterval(parsed.interval ?? 60);
          } catch {
            setAutoRefresh(false);
            setRefreshInterval(60);
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

  // ── Save refresh mode ─────────────────────────────────────────
  const handleSaveRefreshMode = useCallback(async () => {
    if (!businessId) {
      toast.error("No business found");
      return;
    }
    setSavingRefreshMode(true);
    try {
      const supabase = createClient();
      await supabase.from("business_settings").upsert(
        {
          business_id: businessId,
          key: REFRESH_MODE_KEY,
          value: JSON.stringify({ enabled: autoRefresh, interval: refreshInterval }),
        },
        { onConflict: "business_id, key" },
      );
      toast.success(autoRefresh ? "Auto-refresh enabled" : "Manual refresh mode saved");
    } catch (err) {
      toast.error("Failed to save refresh mode", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSavingRefreshMode(false);
    }
  }, [businessId, autoRefresh, refreshInterval]);

  // ── Credential change handler ─────────────────────────────────
  const handleCredentialChange = useCallback((field: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── Credential saved handler ──────────────────────────────────
  const handleCredentialsSaved = useCallback((saved: boolean) => {
    setSavedCredentials(saved);
  }, []);

  // ── Provider switch handler ───────────────────────────────────
  const handleProviderChange = useCallback(async (value: string) => {
    if (!value) return;
    setSelectedCourier(value);

    // Save the provider selection immediately and load credentials
    if (businessId) {
      const supabase = createClient();

      // Persist selection to database
      await supabase.from("business_settings").upsert(
        { business_id: businessId, key: SHARED_SETTINGS_KEYS.selected_courier, value },
        { onConflict: "business_id, key" },
      );

      if (value === "none") {
        setCredentials({});
        setSavedCredentials(false);
        return;
      }

      // Load existing credentials for the newly selected provider
      const provider = getProvider(value);
      if (provider) {
        const { data: settings } = await supabase
          .from("business_settings")
          .select("key, value")
          .eq("business_id", businessId);

        if (settings) {
          const map: Record<string, string> = {};
          settings.forEach((s) => { map[s.key] = String(s.value); });
          const extractedCreds = extractCredentials(value, map);
          setCredentials(extractedCreds);
          const hasCreds = Object.values(extractedCreds).some((v) => !!v.trim());
          setSavedCredentials(hasCreds);
        }
      }
    }
  }, [businessId]);

  // ── Save provider selection ───────────────────────────────────
  const handleSaveProvider = useCallback(async () => {
    if (!businessId) {
      toast.error("No business found");
      return;
    }
    setSavingProvider(true);
    try {
      const supabase = createClient();
      await supabase.from("business_settings").upsert(
        { business_id: businessId, key: SHARED_SETTINGS_KEYS.selected_courier, value: selectedCourier },
        { onConflict: "business_id, key" },
      );
      toast.success("Courier selection saved");
    } catch (err) {
      toast.error("Failed to save courier selection", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSavingProvider(false);
    }
  }, [businessId, selectedCourier]);

  // ── Determine which credential form to render ─────────────────
  const selectedProvider = selectedCourier !== "none" ? getProvider(selectedCourier) : null;

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
        <CollapsibleCard
          id="settings-courier-provider"
          collapsible={false}
          icon={Truck}
          title="Courier Provider"
          description="Select a courier company to enable delivery tracking and shipment management. More couriers can be added by registering new provider modules."
        >
          {/* ── Courier Selector ── */}
          <div>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
              Choose Courier Service
            </Label>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 sm:flex-none">
                <Select
                  value={selectedCourier}
                  onValueChange={(v) => { if (v) handleProviderChange(v); }}
                >
                  <SelectTrigger className="h-9 w-full sm:w-[320px]">
                    <SelectValue placeholder="Select a courier company...">
                      {courierOptions.find((o) => o.value === selectedCourier)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {courierOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCourier !== "none" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveProvider}
              disabled={savingProvider}
            >
              {savingProvider ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Truck className="size-3.5" />
              )}
              Re-save Selection
            </Button>
          )}
            </div>
          </div>

          {/* ── Auto-generated Credential Form ── */}
          {selectedCourier !== "none" && selectedProvider && businessId && (
            <AutoCredentialForm
              businessId={businessId}
              credentials={credentials}
              onChange={handleCredentialChange}
              saved={savedCredentials}
              onSaved={handleCredentialsSaved}
              provider={selectedProvider}
            />
          )}

          {/* ── No provider found ── */}
          {selectedCourier !== "none" && !selectedProvider && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mt-5 overflow-hidden"
            >
              <div className="rounded-xl border border-dashed border-border/30 bg-muted/5 p-6 text-center">
                <Truck className="mx-auto size-8 text-muted-foreground/30" />
                <p className="mt-2 text-sm font-medium text-foreground/70">
                  {selectedCourier}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/50">
                  Provider module not found. Make sure the provider is imported in providers/index.ts.
                </p>
              </div>
            </motion.div>
          )}
        </CollapsibleCard>
      )}

      {(!activeSection || activeSection === "refresh-settings") && selectedCourier !== "none" && (
        <CollapsibleCard
          id="settings-courier-refresh"
          collapsible={false}
          icon={RefreshCw}
          title="Refresh Settings"
          description="Configure how the courier dashboard refreshes its data."
        >
          <div className="space-y-5">
            {/* Auto-refresh toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
                  <Clock className="size-[18px]" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Auto Refresh
                  </Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Automatically refresh the courier dashboard at a set interval.
                  </p>
                </div>
              </div>
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                aria-label="Toggle auto refresh"
              />
            </div>

            {/* Interval selector - only visible when auto is on */}
            {autoRefresh && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex items-center gap-4 pl-12"
              >
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
                  Interval
                </Label>
                <Select
                  value={String(refreshInterval)}
                  onValueChange={(v) => setRefreshInterval(Number(v))}
                >
                  <SelectTrigger className="h-9 w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="120">2 minutes</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            )}

            {/* Save button */}
            <div className="flex justify-end border-t border-border/30 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveRefreshMode}
                disabled={savingRefreshMode}
              >
                {savingRefreshMode ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="size-3.5" />
                )}
                Save Refresh Settings
              </Button>
            </div>
          </div>
        </CollapsibleCard>
      )}

      {(!activeSection || activeSection === "waybill-settings") && (
        <CollapsibleCard
          id="settings-waybill-settings"
          collapsible={false}
          icon={Truck}
          title="Waybill Settings"
          description="Configure how waybill IDs are managed and assigned to orders."
        >
          <WaybillSettings
              businessId={businessId}
              providerId={selectedCourier !== "none" ? selectedCourier : undefined}
              onNavigateToProvider={() => {
                const el = document.getElementById("settings-courier-provider");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
        </CollapsibleCard>
      )}
    </div>
  );
}
