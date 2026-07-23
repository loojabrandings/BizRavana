"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  Copy,
  HelpCircle,
  Landmark,
  Loader2,
  Mail,
  MessageCircle,
  RefreshCw,
  Save,
  Settings,
  Smartphone,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";

// ══════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════

interface AdminSettings {
  company_name: string;
  company_address: string;
  company_phone: string;
  support_email: string;
  support_whatsapp: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_branch: string;
  trial_duration_days: number;
  payment_instructions: string;
}

type SettingsSection = "company" | "bank" | "support" | "trial" | "payment";

const DEFAULT_SETTINGS: AdminSettings = {
  company_name: "BizRavana",
  company_address: "",
  company_phone: "",
  support_email: "",
  support_whatsapp: "94750350109",
  bank_name: "Commercial Bank of Ceylon",
  bank_account_name: "BizRavana Technologies",
  bank_account_number: "1234567890",
  bank_branch: "Colombo 01",
  trial_duration_days: 3,
  payment_instructions: "",
};

const ADMIN_SETTINGS_KEY = "admin_settings";

// ══════════════════════════════════════════════════════════════════
// SECTION CARD
// ══════════════════════════════════════════════════════════════════

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  id,
  saving,
  onSave,
}: {
  title: string;
  description: string;
  icon: typeof Building2;
  children: React.ReactNode;
  id: SettingsSection;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card overflow-hidden" id={id}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="size-4.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground/70">{description}</p>
          </div>
        </div>
        <Button size="sm" onClick={onSave} disabled={saving}>
          {saving ? (
            <Loader2 className="size-3.5 animate-spin mr-1.5" />
          ) : (
            <Save className="size-3.5 mr-1.5" />
          )}
          Save
        </Button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        {children}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// FIELD
// ══════════════════════════════════════════════════════════════════

function Field({
  label,
  description,
  error,
  children,
}: {
  label: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground/90">{label}</Label>
        {error && <span className="text-xs text-destructive font-medium">{error}</span>}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground/70">{description}</p>
      )}
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// COPY BUTTON
// ══════════════════════════════════════════════════════════════════

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex size-7 items-center justify-center rounded-md hover:bg-muted transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <CheckCircle2 className="size-3.5 text-success" />
      ) : (
        <Copy className="size-3.5 text-muted-foreground/60" />
      )}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════
// NAV SIDEBAR (for section navigation)
// ══════════════════════════════════════════════════════════════════

function SettingsNav({
  activeSection,
  onSectionChange,
}: {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}) {
  const sections: { id: SettingsSection; label: string; icon: typeof Settings }[] = [
    { id: "company", label: "Company Info", icon: Building2 },
    { id: "bank", label: "Bank Details", icon: Landmark },
    { id: "support", label: "Support", icon: MessageCircle },
    { id: "trial", label: "Trial Config", icon: Clock },
    { id: "payment", label: "Payment Instructions", icon: Banknote },
  ];

  return (
    <nav className="flex gap-1 rounded-xl bg-muted/30 p-1 border border-border/20 overflow-x-auto sm:flex-col sm:w-48 sm:shrink-0 sm:bg-transparent sm:border-0 sm:p-0 sm:gap-1">
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => {
              onSectionChange(section.id);
              document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all whitespace-nowrap sm:w-full",
              activeSection === section.id
                ? "bg-card text-foreground shadow-sm ring-1 ring-border/30 sm:bg-primary/10 sm:ring-primary/20 sm:text-primary"
                : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/30",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="hidden sm:inline">{section.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SettingsSection>("company");

  // Track which sections have pending saves
  const [savingSection, setSavingSection] = useState<SettingsSection | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ── Intersection Observer for active section ──
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const sections: SettingsSection[] = ["company", "bank", "support", "trial", "payment"];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SettingsSection);
          }
        }
      },
      { root: container, rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [loading]);

  // ── Load Settings ─────────────────────────────────────────────
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", ADMIN_SETTINGS_KEY)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data?.value) {
        const stored = data.value as Record<string, unknown>;
        setSettings({
          company_name: String(stored.company_name || DEFAULT_SETTINGS.company_name),
          company_address: String(stored.company_address || DEFAULT_SETTINGS.company_address),
          company_phone: String(stored.company_phone || DEFAULT_SETTINGS.company_phone),
          support_email: String(stored.support_email || DEFAULT_SETTINGS.support_email),
          support_whatsapp: String(stored.support_whatsapp || DEFAULT_SETTINGS.support_whatsapp),
          bank_name: String(stored.bank_name || DEFAULT_SETTINGS.bank_name),
          bank_account_name: String(stored.bank_account_name || DEFAULT_SETTINGS.bank_account_name),
          bank_account_number: String(stored.bank_account_number || DEFAULT_SETTINGS.bank_account_number),
          bank_branch: String(stored.bank_branch || DEFAULT_SETTINGS.bank_branch),
          trial_duration_days: Number(stored.trial_duration_days) || DEFAULT_SETTINGS.trial_duration_days,
          payment_instructions: String(stored.payment_instructions || DEFAULT_SETTINGS.payment_instructions),
        });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // ── Save Section ──────────────────────────────────────────────
  const saveSection = useCallback(async (section: SettingsSection) => {
    // Validate required fields
    if (!settings.company_name.trim() || !settings.bank_name.trim() ||
        !settings.bank_account_name.trim() || !settings.bank_account_number.trim() ||
        !settings.bank_branch.trim() || !settings.support_whatsapp.trim()) {
      toast.error("Please fill in all required fields before saving");
      setSavingSection(null);
      return;
    }

    setSavingSection(section);
    try {
      const { error } = await supabase
        .from("admin_settings")
        .upsert(
          {
            key: ADMIN_SETTINGS_KEY,
            value: settings,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" },
        );

      if (error) throw error;

      const labels: Record<SettingsSection, string> = {
        company: "Company information",
        bank: "Bank details",
        support: "Support settings",
        trial: "Trial configuration",
        payment: "Payment instructions",
      };

      toast.success(`${labels[section]} saved successfully`);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save settings");
    } finally {
      setSavingSection(null);
    }
  }, [settings, supabase]);

  // ── Field update helper ───────────────────────────────────────
  const updateField = useCallback(<K extends keyof AdminSettings>(
    key: K,
    value: AdminSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ═══ Page Header ═══════════════════════════════════════ */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Admin Settings</h2>
        <p className="mt-0.5 text-sm text-muted-foreground/70">
          Configure platform-wide settings displayed on subscription and support pages
        </p>
      </div>

      {/* ═══ Layout: Nav + Content ════════════════════════════ */}
      <div className="flex flex-col gap-6 sm:flex-row">
        {/* Navigation sidebar */}
        <div className="sm:sticky sm:top-20 sm:self-start shrink-0">
          <SettingsNav activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>

        {/* Settings sections */}
        <div ref={scrollContainerRef} className="flex-1 space-y-6 overflow-y-auto">
          {/* ════════════════════════════════════════════════════
              1. COMPANY INFORMATION
              ════════════════════════════════════════════════════ */}
          <SectionCard
            id="company"
            title="Company Information"
            description="Business name and contact details shown on the platform"
            icon={Building2}
            saving={savingSection === "company"}
            onSave={() => saveSection("company")}
          >
            <Field
              label="Company Name"
              description="Displayed on subscription pages and payment instructions"
              error={!settings.company_name.trim() ? "Required" : undefined}
            >
              <Input
                value={settings.company_name}
                onChange={(e) => updateField("company_name", e.target.value)}
                placeholder="BizRavana"
                className="h-9"
              />
            </Field>

            <Field label="Company Address">
              <Textarea
                value={settings.company_address}
                onChange={(e) => updateField("company_address", e.target.value)}
                placeholder="123 Main Street, Colombo, Sri Lanka"
                className="min-h-[60px] resize-none"
                rows={2}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone Number">
                <Input
                  value={settings.company_phone}
                  onChange={(e) => updateField("company_phone", e.target.value)}
                  placeholder="+94 11 234 5678"
                  className="h-9"
                  type="tel"
                />
              </Field>

              <Field label="Support Email">
                <Input
                  value={settings.support_email}
                  onChange={(e) => updateField("support_email", e.target.value)}
                  placeholder="support@bizravana.com"
                  className="h-9"
                  type="email"
                />
              </Field>
            </div>
          </SectionCard>

          {/* ════════════════════════════════════════════════════
              2. BANK TRANSFER DETAILS
              ════════════════════════════════════════════════════ */}
          <SectionCard
            id="bank"
            title="Bank Transfer Details"
            description="Bank account information shown to businesses for payment"
            icon={Landmark}
            saving={savingSection === "bank"}
            onSave={() => saveSection("bank")}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Bank Name"
                error={!settings.bank_name.trim() ? "Required" : undefined}
              >
                <Input
                  value={settings.bank_name}
                  onChange={(e) => updateField("bank_name", e.target.value)}
                  placeholder="Commercial Bank of Ceylon"
                  className="h-9"
                />
              </Field>

              <Field
                label="Branch"
                error={!settings.bank_branch.trim() ? "Required" : undefined}
              >
                <Input
                  value={settings.bank_branch}
                  onChange={(e) => updateField("bank_branch", e.target.value)}
                  placeholder="Colombo 01"
                  className="h-9"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Account Holder Name"
                error={!settings.bank_account_name.trim() ? "Required" : undefined}
              >
                <Input
                  value={settings.bank_account_name}
                  onChange={(e) => updateField("bank_account_name", e.target.value)}
                  placeholder="BizRavana Technologies"
                  className="h-9"
                />
              </Field>

              <Field
                label="Account Number"
                error={!settings.bank_account_number.trim() ? "Required" : undefined}
              >
                <div className="relative">
                  <Input
                    value={settings.bank_account_number}
                    onChange={(e) => updateField("bank_account_number", e.target.value)}
                    placeholder="1234567890"
                    className="h-9 pr-9 font-mono tracking-wider"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
                    <CopyButton value={settings.bank_account_number} />
                  </div>
                </div>
              </Field>
            </div>

            {/* Preview card */}
            <div className="rounded-xl border border-border/20 bg-muted/5 p-4 mt-2">
              <div className="flex items-center gap-2 mb-3">
                <Banknote className="size-4 text-muted-foreground/60" />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">
                  Preview — Bank Details Card
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground/70">Bank</span>
                  <span className="font-medium text-foreground/90">{settings.bank_name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground/70">Account Name</span>
                  <span className="font-medium text-foreground/90">{settings.bank_account_name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground/70">Account Number</span>
                  <code className="text-sm font-semibold text-foreground tracking-wider">
                    {settings.bank_account_number}
                  </code>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground/70">Branch</span>
                  <span className="font-medium text-foreground/90">{settings.bank_branch}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ════════════════════════════════════════════════════
              3. SUPPORT CONTACT
              ════════════════════════════════════════════════════ */}
          <SectionCard
            id="support"
            title="Support Contact"
            description="Contact information shown to businesses for support inquiries"
            icon={MessageCircle}
            saving={savingSection === "support"}
            onSave={() => saveSection("support")}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="WhatsApp Number"
                description="Used for the 'Contact Support' button (without + prefix)"
                error={!settings.support_whatsapp.trim() ? "Required" : undefined}
              >
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    value={settings.support_whatsapp}
                    onChange={(e) => updateField("support_whatsapp", e.target.value.replace(/\D/g, ""))}
                    placeholder="94750350109"
                    className="h-9 pl-9 font-mono"
                  />
                </div>
              </Field>

              <Field label="Support Email">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    value={settings.support_email}
                    onChange={(e) => updateField("support_email", e.target.value)}
                    placeholder="support@bizravana.com"
                    className="h-9 pl-9"
                    type="email"
                  />
                </div>
              </Field>
            </div>

            {/* Preview */}
            <div className="rounded-xl border border-border/20 bg-muted/5 p-4 mt-2">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="size-4 text-muted-foreground/60" />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">
                  Preview — Contact Buttons
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/20 bg-card px-3 py-1.5 text-sm">
                  <Smartphone className="size-3.5 text-green-500" />
                  wa.me/{settings.support_whatsapp || "..."}
                </span>
                {settings.support_email && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/20 bg-card px-3 py-1.5 text-sm">
                    <Mail className="size-3.5 text-primary" />
                    {settings.support_email}
                  </span>
                )}
              </div>
            </div>
          </SectionCard>

          {/* ════════════════════════════════════════════════════
              4. TRIAL CONFIGURATION
              ════════════════════════════════════════════════════ */}
          <SectionCard
            id="trial"
            title="Trial Configuration"
            description="Default trial duration for new business sign-ups"
            icon={Clock}
            saving={savingSection === "trial"}
            onSave={() => saveSection("trial")}
          >
            <Field
              label="Trial Duration (Days)"
              description="Number of days new accounts have before trial expiry. The auto-expiry cron uses this setting."
              error={
                settings.trial_duration_days < 1
                  ? "Must be at least 1 day"
                  : settings.trial_duration_days > 90
                    ? "Maximum 90 days"
                    : undefined
              }
            >
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={90}
                  value={settings.trial_duration_days}
                  onChange={(e) => updateField("trial_duration_days", Math.max(1, Math.min(90, Number(e.target.value) || 1)))}
                  className="w-24 h-9"
                />
                <div className="flex gap-1.5">
                  {[3, 7, 14, 30].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => updateField("trial_duration_days", preset)}
                      className={cn(
                        "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all",
                        settings.trial_duration_days === preset
                          ? "border-primary/50 bg-primary/5 text-primary ring-1 ring-primary/20"
                          : "border-border/20 text-muted-foreground/70 hover:border-border/40 hover:text-foreground",
                      )}
                    >
                      {preset}d
                    </button>
                  ))}
                </div>
              </div>
            </Field>

            <div className="rounded-xl border border-border/20 bg-muted/5 p-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="size-4 text-muted-foreground/60 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground/80">How this works</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/70 leading-relaxed">
                    New businesses automatically get a trial for the configured number of days. 
                    After the trial period, the account status changes to <strong>trial_expired</strong> and 
                    the dashboard enters read-only mode. The daily cron job (migration 020) processes 
                    expirations automatically. Changes take effect for new sign-ups immediately; 
                    existing trials use their original end dates.
                  </p>
                </div>
              </div>
            </div>

            {settings.trial_duration_days !== DEFAULT_SETTINGS.trial_duration_days && (
              <div className="rounded-xl border border-warning/20 bg-warning/[0.04] p-3">
                <div className="flex items-start gap-2.5">
                  <RefreshCw className="size-4 text-warning shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground/80">
                    You&apos;ve changed the default trial duration from <strong>{DEFAULT_SETTINGS.trial_duration_days} days</strong> to <strong>{settings.trial_duration_days} days</strong>. 
                    Note: This only affects new sign-ups. Existing trials are not retroactively changed.
                  </p>
                </div>
              </div>
            )}
          </SectionCard>

          {/* ════════════════════════════════════════════════════
              5. PAYMENT INSTRUCTIONS
              ════════════════════════════════════════════════════ */}
          <SectionCard
            id="payment"
            title="Payment Instructions"
            description="Custom message shown to businesses when uploading payment proofs"
            icon={Banknote}
            saving={savingSection === "payment"}
            onSave={() => saveSection("payment")}
          >
            <Field
              label="Instructions Text"
              description="Displayed in the payment proof upload dialog. Supports plain text only."
            >
              <Textarea
                value={settings.payment_instructions}
                onChange={(e) => updateField("payment_instructions", e.target.value)}
                placeholder={`After making the bank transfer, upload the payment receipt/screenshot below for admin approval.\n\nPlease ensure the receipt clearly shows:\n• Transaction date\n• Amount transferred\n• Sender account name`}
                className="min-h-[120px] resize-y"
                rows={5}
              />
            </Field>

            <div className="flex items-center justify-between rounded-xl border border-border/20 bg-muted/5 p-3">
              <span className="text-sm text-muted-foreground/70">Character count</span>
              <span className={cn(
                "text-sm font-medium tabular-nums",
                settings.payment_instructions.length > 500 ? "text-destructive" : "text-muted-foreground/80",
              )}>
                {settings.payment_instructions.length} / 1000
              </span>
            </div>
          </SectionCard>

          {/* ═══ Footer spacing ════════════════════════════════ */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
