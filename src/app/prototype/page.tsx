"use client";

import { useState, useSyncExternalStore, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  Filter,
  Loader2,
  Moon,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sun,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DemoVariant = "primary" | "secondary" | "outline" | "ghost" | "success" | "destructive";
type DemoSize = "sm" | "md" | "lg";

const variants: Record<DemoVariant, string> = {
  primary:
    "border-transparent bg-primary text-white shadow-sm shadow-primary/20 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25",
  secondary:
    "border-transparent bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-secondary/80 hover:shadow-sm",
  outline:
    "border-border bg-transparent text-foreground shadow-xs hover:-translate-y-0.5 hover:border-primary/30 hover:bg-muted hover:shadow-sm",
  ghost:
    "border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
  success:
    "border-transparent bg-success text-white shadow-sm shadow-success/15 hover:-translate-y-0.5 hover:bg-success/90 hover:shadow-md",
  destructive:
    "border-transparent bg-destructive text-destructive-foreground shadow-sm shadow-destructive/15 hover:-translate-y-0.5 hover:bg-destructive/90 hover:shadow-md",
};

const sizes: Record<DemoSize, string> = {
  sm: "h-8 gap-1.5 rounded-[10px] px-3 text-sm [&_svg]:size-3.5",
  md: "h-10 gap-2 rounded-[10px] px-4 text-sm [&_svg]:size-4",
  lg: "h-12 gap-2.5 rounded-[10px] px-6 text-[15px] font-semibold [&_svg]:size-[18px]",
};

function DemoButton({
  variant = "primary",
  size = "md",
  iconOnly = false,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: DemoVariant;
  size?: DemoSize;
  iconOnly?: boolean;
  loading?: boolean;
}) {
  const iconSizes: Record<DemoSize, string> = {
    sm: "size-8 px-0",
    md: "size-10 px-0",
    lg: "size-12 px-0",
  };

  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        "group relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden border font-medium whitespace-nowrap",
        "transition-all duration-200 ease-out active:scale-[0.97]",
        "outline-none focus-visible:ring-3 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none",
        variants[variant],
        sizes[size],
        iconOnly && iconSizes[size],
        className,
      )}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center gap-[inherit]">
        {loading && <Loader2 className="animate-spin" />}
        {children}
      </span>
      <span
        aria-hidden
        className="button-shimmer animate-shimmer pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
    </button>
  );
}

function DemoSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <DemoButton variant="outline" size="md" iconOnly disabled aria-label="Loading theme">
        <Sun />
      </DemoButton>
    );
  }

  const dark = resolvedTheme === "dark";
  return (
    <DemoButton
      variant="outline"
      size="md"
      iconOnly
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      title={`Switch to ${dark ? "light" : "dark"} mode`}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <Sun /> : <Moon />}
    </DemoButton>
  );
}

export default function ButtonPrototypePage() {
  const [message, setMessage] = useState("Ready to test.");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("All");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const testSave = () => {
    setSaving(true);
    setMessage("Saving changes...");
    window.setTimeout(() => {
      setSaving(false);
      setMessage("Changes saved successfully.");
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 opacity-60 [background-image:radial-gradient(circle_at_12%_0%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_26%),radial-gradient(circle_at_88%_8%,color-mix(in_oklch,var(--primary)_8%,transparent),transparent_22%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-6 flex flex-col gap-5 rounded-2xl border border-border/60 bg-card/90 p-5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Fresh prototype
            </span>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              BizRavana UI System Prototype
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Preview the recommended typography and canonical button system across
              realistic interface examples.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Light / Dark</span>
            <ThemeSwitcher />
          </div>
        </header>

        <div className="mb-6 flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <span className="size-2 rounded-full bg-success" />
          {message}
        </div>

        <div className="grid gap-6">
          <DemoSection
            title="Recommended canonical typography system"
            description="A readable hierarchy for marketing, dashboard, admin, forms, and data-heavy screens."
          >
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
              <div className="overflow-hidden rounded-xl border border-border/60 bg-background">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-border/50 bg-muted/30 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Typography role</span>
                  <span>Size / weight</span>
                </div>

                <div className="divide-y divide-border/50">
                  <div className="grid gap-2 px-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <div>
                      <p className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.1] tracking-tight">
                        Manage smarter.
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Display typography is reserved for high-impact marketing moments.
                      </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">40–48 / 600</span>
                  </div>

                  <div className="grid gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <div>
                      <p className="text-xl font-semibold leading-[1.25] tracking-tight sm:text-2xl">
                        Orders
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Page title for dashboard and admin screens.
                      </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">20–24 / 600</span>
                  </div>

                  <div className="grid gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <p className="text-lg font-semibold leading-[1.3]">Sales overview</p>
                    <span className="text-xs font-medium text-muted-foreground">18 / 600</span>
                  </div>

                  <div className="grid gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <p className="text-base font-semibold leading-[1.35]">Recent orders</p>
                    <span className="text-xs font-medium text-muted-foreground">16 / 600</span>
                  </div>

                  <div className="grid gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <p className="text-sm leading-[1.55] text-foreground">
                      Your order has been created and is ready for processing.
                    </p>
                    <span className="text-xs font-medium text-muted-foreground">14 / 400</span>
                  </div>

                  <div className="grid gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <p className="text-[13px] leading-[1.5] text-muted-foreground">
                      Supporting text explains the next step without looking disabled.
                    </p>
                    <span className="text-xs font-medium text-muted-foreground">13 / 400</span>
                  </div>

                  <div className="grid gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <p className="text-xs font-semibold leading-[1.4] tracking-wide text-muted-foreground">
                      PAID · 26 JUL 2026 · 10:42 AM
                    </p>
                    <span className="text-xs font-medium text-muted-foreground">12 / 600</span>
                  </div>
                </div>
              </div>

              <div className="grid content-start gap-4">
                <div className="rounded-xl border border-border/60 bg-background p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Minimum readable sizes
                  </p>
                  <div className="mt-4 grid gap-3">
                    {[
                      ["Body and tables", "14px"],
                      ["Supporting text", "13px"],
                      ["Metadata and badges", "12px"],
                      ["Form labels", "13–14px"],
                      ["Buttons", "14px"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-4">
                        <span className="text-sm text-foreground">{label}</span>
                        <span className="text-sm font-semibold text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-success/25 bg-success/5 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Check className="size-4 text-success" />
                    Contrast rule
                  </div>
                  <p className="mt-2 text-[13px] leading-[1.55] text-muted-foreground">
                    Use solid muted foreground for informative secondary text. Keep opacity
                    reductions for decorative or truly disabled content.
                  </p>
                </div>

                <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <X className="size-4 text-destructive" />
                    Avoid
                  </div>
                  <p className="mt-2 text-[13px] leading-[1.55] text-muted-foreground">
                    Do not combine 8–11px text with faded muted colors for labels,
                    instructions, dates, prices, or actions.
                  </p>
                </div>
              </div>
            </div>
          </DemoSection>

          <DemoSection
            title="Recommended canonical glassmorphism system"
            description="Three controlled glass levels for cards, tables, inset content, dialogs, and floating surfaces."
          >
            <div className="grid gap-5">
              <div className="relative overflow-hidden rounded-xl border border-border/60 bg-background p-4 sm:p-5">
                <div className="pointer-events-none absolute -left-20 -top-24 size-64 rounded-full bg-primary/25 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 right-0 size-72 rounded-full bg-cyan-500/15 blur-3xl" />
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="relative">
                    <p className="text-sm font-semibold text-foreground">Page surface</p>
                    <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                      Restrained blobs and gradients make glass depth visible.
                    </p>
                  </div>
                  <span className="relative rounded-full border border-border/50 bg-background/60 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-md">
                    page + ambient color
                  </span>
                </div>

                <div className="relative grid gap-4 lg:grid-cols-3">
                  <div className="glass-card rounded-xl p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-foreground">Glass Base</p>
                        <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                          Default material for dashboard cards and tables.
                        </p>
                      </div>
                      <span className="size-2.5 shrink-0 rounded-full bg-primary" />
                    </div>
                    <div className="mt-4 rounded-[10px] border border-border/30 bg-muted/30 p-3 backdrop-blur-md">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Glass Inset
                      </p>
                      <p className="mt-1 text-sm text-foreground">Quieter content inside base glass</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMessage("Interactive card clicked.")}
                    className="glass-card rounded-xl p-5 text-left outline-none transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring/40"
                  >
                    <div className="flex size-9 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                      <ArrowRight className="size-4" />
                    </div>
                    <p className="mt-4 text-base font-semibold text-foreground">Glass Interactive</p>
                    <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                      Base glass with clear hover and keyboard focus.
                    </p>
                  </button>

                  <div className="rounded-xl border border-[var(--glass-border)] bg-popover/75 p-5 shadow-xl backdrop-blur-2xl">
                    <div className="flex size-9 items-center justify-center rounded-[10px] bg-secondary text-secondary-foreground">
                      <MoreHorizontal className="size-4" />
                    </div>
                    <p className="mt-4 text-base font-semibold text-popover-foreground">Glass Elevated</p>
                    <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                      More opaque glass for dialogs, popovers, and menus.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Information", "border-primary/25 bg-primary/10", "text-primary"],
                  ["Success", "border-success/25 bg-success/10", "text-success"],
                  ["Warning", "border-warning/30 bg-warning/10", "text-warning"],
                  ["Danger", "border-destructive/25 bg-destructive/10", "text-destructive"],
                ].map(([label, surface, accent]) => (
                  <div key={label} className={cn("rounded-xl border p-4 shadow-sm backdrop-blur-xl", surface)}>
                    <span className={cn("text-sm font-semibold", accent)}>{label}</span>
                    <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                      Semantic tint over glass
                    </p>
                  </div>
                ))}
              </div>

              <div className="glass-card overflow-hidden rounded-xl">
                <div className="flex flex-col gap-3 border-b border-border/50 bg-muted/20 px-4 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-semibold text-foreground">Canonical glass data table</p>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      Glass Base shell, Glass Inset header, subtle dividers, and one hover state.
                    </p>
                  </div>
                  <DemoButton size="sm"><Plus />New Order</DemoButton>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-sm">
                    <thead className="bg-muted/30 backdrop-blur-md">
                      <tr className="border-b border-border/50">
                        {["Order", "Customer", "Status", "Amount", "Date"].map((heading) => (
                          <th
                            key={heading}
                            className={cn(
                              "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                              heading === "Amount" && "text-right",
                            )}
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        ["BR-1042", "Nimal Perera", "Paid", "Rs. 12,500", "26 Jul 2026"],
                        ["BR-1041", "Kasun Silva", "Pending", "Rs. 8,900", "25 Jul 2026"],
                        ["BR-1040", "Amali Fernando", "Dispatched", "Rs. 21,400", "24 Jul 2026"],
                      ].map((row) => (
                        <tr key={row[0]} className="transition-colors hover:bg-muted/25">
                          <td className="px-4 py-3.5 font-semibold text-foreground">{row[0]}</td>
                          <td className="px-4 py-3.5 text-foreground">{row[1]}</td>
                          <td className="px-4 py-3.5">
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                              {row[2]}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right font-medium tabular-nums text-foreground">
                            {row[3]}
                          </td>
                          <td className="px-4 py-3.5 text-muted-foreground">{row[4]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.45fr)]">
                <div className="glass-card rounded-xl p-5">
                  <p className="text-sm font-semibold text-foreground">Glass surface rules</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      "Use only Glass Base, Glass Inset, and Glass Elevated.",
                      "Page blobs stay restrained but visible behind the glass.",
                      "Inset glass never looks more elevated than its parent.",
                      "Desktop tables and mobile cards use the same glass family.",
                    ].map((rule) => (
                      <div key={rule} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" />
                        <p className="text-[13px] leading-5 text-muted-foreground">{rule}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-xl p-5">
                  <p className="text-sm font-semibold text-foreground">Glass levels</p>
                  <div className="mt-4 flex items-end gap-3">
                    <div className="flex size-14 items-center justify-center rounded-[10px] border border-border/30 bg-muted/30 text-xs font-semibold backdrop-blur-md">
                      Inset
                    </div>
                    <div className="glass-card flex size-16 items-center justify-center rounded-xl text-xs font-semibold">
                      Base
                    </div>
                    <div className="flex size-20 items-center justify-center rounded-2xl border border-[var(--glass-border)] bg-popover/75 text-xs font-semibold shadow-xl backdrop-blur-2xl">
                      Elevated
                    </div>
                  </div>
                  <p className="mt-3 text-[13px] leading-5 text-muted-foreground">
                    Quiet inner layer · standard card/table · floating overlay
                  </p>
                </div>
              </div>
            </div>
          </DemoSection>

          <div className="pt-2">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              BizRavana Canonical Buttons
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Based on the landing navbar button: 10px shape, compact proportions,
              subtle lift, soft shadow, and shimmer on primary actions.
            </p>
          </div>

          <DemoSection
            title="Three-size system"
            description="All sizes keep the navbar button's 10px radius and interaction style."
          >
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Small · 32px</p>
                <DemoButton size="sm"><Filter />Filter</DemoButton>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Medium · 40px</p>
                <DemoButton size="md"><Save />Save Changes</DemoButton>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Large · 48px</p>
                <DemoButton size="lg">Start Free Trial<ArrowRight /></DemoButton>
              </div>
            </div>
          </DemoSection>

          <DemoSection
            title="Semantic variants"
            description="Color and emphasis communicate what each action means."
          >
            <div className="flex flex-wrap gap-3">
              <DemoButton onClick={() => setMessage("Primary action clicked.")}><Save />Primary</DemoButton>
              <DemoButton variant="secondary" onClick={() => setMessage("Secondary action clicked.")}>Secondary</DemoButton>
              <DemoButton variant="outline" onClick={() => setMessage("Outline action clicked.")}>Outline</DemoButton>
              <DemoButton variant="ghost" onClick={() => setMessage("Ghost action clicked.")}>Ghost</DemoButton>
              <DemoButton variant="success" onClick={() => setMessage("Approved.")}><Check />Approve</DemoButton>
              <DemoButton variant="destructive" onClick={() => setDeleteOpen(true)}><Trash2 />Delete</DemoButton>
            </div>
          </DemoSection>

          <DemoSection
            title="States and icon buttons"
            description="Loading, disabled, and icon-only controls use the same sizing and focus contract."
          >
            <div className="flex flex-wrap items-center gap-3">
              <DemoButton loading={saving} onClick={testSave}>
                {!saving && <Save />}
                {saving ? "Saving..." : "Test Loading"}
              </DemoButton>
              <DemoButton variant="outline" disabled>Disabled</DemoButton>
              <DemoButton
                variant="outline"
                size="sm"
                iconOnly
                aria-label="Copy"
                title="Copy"
                onClick={() => setMessage("Copied.")}
              >
                <Copy />
              </DemoButton>
              <DemoButton variant="ghost" size="md" iconOnly aria-label="Refresh" title="Refresh">
                <RefreshCw />
              </DemoButton>
              <DemoButton variant="ghost" size="md" iconOnly aria-label="More actions" title="More actions">
                <MoreHorizontal />
              </DemoButton>
            </div>
          </DemoSection>

          <div className="grid gap-6 xl:grid-cols-2">
            <DemoSection
              title="Real usage · Form footer"
              description="One primary action, one alternative, and stable loading width."
            >
              <div className="rounded-xl border border-border/60 bg-background p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-medium">
                    Business name
                    <input
                      defaultValue="Art of Frames"
                      className="h-10 rounded-[10px] border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
                    />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium">
                    Phone number
                    <input
                      defaultValue="077 123 4567"
                      className="h-10 rounded-[10px] border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20"
                    />
                  </label>
                </div>
                <div className="mt-5 flex flex-col-reverse gap-2 border-t border-border/50 pt-4 sm:flex-row sm:justify-end">
                  <DemoButton variant="outline">Cancel</DemoButton>
                  <DemoButton loading={saving} onClick={testSave}>
                    {!saving && <Save />}
                    {saving ? "Saving..." : "Save Changes"}
                  </DemoButton>
                </div>
              </div>
            </DemoSection>

            <DemoSection
              title="Real usage · Table toolbar"
              description="Create is primary; search, filter, and row utilities stay lower emphasis."
            >
              <div className="overflow-hidden rounded-xl border border-border/60 bg-background">
                <div className="flex flex-col gap-3 border-b border-border/50 p-3 sm:flex-row">
                  <div className="flex h-10 flex-1 items-center gap-2 rounded-[10px] border border-input px-3 text-muted-foreground">
                    <Search className="size-4" />
                    <span className="text-sm">Search orders...</span>
                  </div>
                  <div className="flex gap-2">
                    <DemoButton variant="outline"><Filter />Filter</DemoButton>
                    <DemoButton><Plus />New Order</DemoButton>
                  </div>
                </div>
                {["BR-1042 · Nimal Perera", "BR-1041 · Kasun Silva"].map((item) => (
                  <div key={item} className="flex items-center justify-between border-b border-border/40 p-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Pending · Rs. 12,500</p>
                    </div>
                    <DemoButton variant="ghost" size="sm" iconOnly aria-label={`More actions for ${item}`}>
                      <MoreHorizontal />
                    </DemoButton>
                  </div>
                ))}
              </div>
            </DemoSection>

            <DemoSection
              title="Real usage · Filters"
              description="Pill geometry is reserved for selectable filters, not normal actions."
            >
              <div className="flex flex-wrap gap-2">
                {["All", "Pending", "Paid", "Dispatched"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={filter === item}
                    onClick={() => {
                      setFilter(item);
                      setMessage(`${item} filter selected.`);
                    }}
                    className={cn(
                      "h-9 rounded-full border px-4 text-[13px] font-medium outline-none transition-colors",
                      "focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      filter === item
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </DemoSection>

            <DemoSection
              title="Real usage · File actions"
              description="Utility actions remain readable without competing with the primary action."
            >
              <div className="flex flex-wrap gap-3">
                <DemoButton variant="outline"><Upload />Upload Receipt</DemoButton>
                <DemoButton variant="outline"><Download />Invoice</DemoButton>
                <DemoButton><Plus />Add Product</DemoButton>
              </div>
            </DemoSection>
          </div>

          <DemoSection
            title="Real usage · Marketing and authentication"
            description="Large buttons retain the navbar shape and shimmer without introducing a separate design language."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl bg-foreground p-6 text-background">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-60">Marketing</p>
                <h3 className="mt-2 text-xl font-semibold">Manage smarter. Grow faster.</h3>
                <p className="mt-2 text-sm opacity-70">Run your daily business from one simple workspace.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <DemoButton size="lg">Start Free Trial<ArrowRight /></DemoButton>
                  <DemoButton
                    size="lg"
                    variant="outline"
                    className="border-background/20 bg-transparent text-background hover:bg-background/10"
                  >
                    Explore Features
                  </DemoButton>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Authentication</p>
                <div className="mt-4 grid gap-2">
                  <DemoButton size="lg" className="w-full">Continue to Dashboard<ArrowRight /></DemoButton>
                  <DemoButton size="lg" variant="outline" className="w-full">Create a Free Account</DemoButton>
                </div>
              </div>
            </div>
          </DemoSection>
        </div>

        <footer className="py-8 text-center text-xs text-muted-foreground">
          Prototype only · Existing global CSS tokens · No production components changed
        </footer>
      </div>

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex size-11 items-center justify-center rounded-[10px] bg-destructive/10 text-destructive">
                <Trash2 className="size-5" />
              </div>
              <DemoButton variant="ghost" size="sm" iconOnly aria-label="Close" onClick={() => setDeleteOpen(false)}>
                <X />
              </DemoButton>
            </div>
            <h2 id="delete-title" className="mt-4 text-lg font-semibold">Delete this record?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This action cannot be undone. The destructive action stays visually distinct.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <DemoButton variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</DemoButton>
              <DemoButton
                variant="destructive"
                onClick={() => {
                  setDeleteOpen(false);
                  setMessage("Delete action confirmed in the prototype.");
                }}
              >
                <Trash2 />
                Delete Record
              </DemoButton>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
