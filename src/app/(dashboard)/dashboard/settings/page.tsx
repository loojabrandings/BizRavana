"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-media-query";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Boxes,
  Camera,
  CheckIcon,
  ChevronDown,
  DollarSign,
  FileText,

  Package,
  Pipette,
  ReceiptText,
  Save,
  Settings2,
  Shield,
  ShoppingCart,
  Smartphone,
  Sun,
  Trash2,
  Truck,
  Type,
  Upload,
  User,
  Users,
  Database,
  Download,
  Globe,
  Image as ImageIcon,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Monitor,
  Moon,
  Palette as TabPalette,
  Plus,
  UserCog,
  SlidersHorizontal,
  MessageCircle,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, formatEnumLabel } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  usePreferences,
  type AccentColor,
  type FontFamily,
  type FontSize,
  type BackgroundStyle,
} from "@/stores/preferences-store";
import { useOrdersSettings } from "@/stores/orders-settings-store";
import { useQuotationSettings } from "@/stores/quotation-settings-store";
import { useExpenseSettings } from "@/stores/expense-settings-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SRI_LANKA_DISTRICTS } from "@/constants/districts";
import { ImageCropDialog } from "@/components/shared/image-crop-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CollapsibleCard } from "@/components/shared/collapsible-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CourierSettings } from "@/components/delivery/courier-settings";
import { WhatsAppTemplatesSettings } from "@/components/whatsapp/whatsapp-templates-settings";

import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════

const THEME_OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun, description: "Clean, bright interface" },
  { value: "dark" as const, label: "Dark", icon: Moon, description: "Easy on the eyes" },
  { value: "system" as const, label: "System", icon: Monitor, description: "Follows your device" },
] as const;

const FONT_OPTIONS: { value: FontFamily; label: string; preview: string; description: string }[] = [
  { value: "poppins", label: "Poppins", preview: "The quick brown fox", description: "Modern & clean — default" },
  { value: "lora", label: "Lora", preview: "The quick brown fox", description: "Elegant serif" },
  { value: "caveat", label: "Caveat", preview: "The quick brown fox", description: "Friendly script accent" },
];

const FONT_SIZE_OPTIONS: { value: FontSize; label: string; preview: string; description: string }[] = [
  { value: "small", label: "Small", preview: "Aa", description: "14px — compact" },
  { value: "medium", label: "Medium", preview: "Aa", description: "16px — balanced" },
  { value: "large", label: "Large", preview: "Aa", description: "18px — comfortable" },
];

const PALETTE_OPTIONS: { value: AccentColor; label: string; colors: string[] }[] = [
  { value: "blue", label: "Ocean", colors: ["bg-[oklch(0.546_0.245_262.881)]", "bg-[oklch(0.623_0.214_259.815)]", "bg-[oklch(0.4_0.2_262)]", "bg-[oklch(0.85_0.04_270)]", "bg-[oklch(0.922_0_0)]"] },
  { value: "green", label: "Forest", colors: ["bg-[oklch(0.527_0.154_150.069)]", "bg-[oklch(0.627_0.194_149.214)]", "bg-[oklch(0.4_0.15_149)]", "bg-[oklch(0.85_0.04_149)]", "bg-[oklch(0.922_0_0)]"] },
  { value: "purple", label: "Twilight", colors: ["bg-[oklch(0.558_0.288_302.321)]", "bg-[oklch(0.627_0.265_303.9)]", "bg-[oklch(0.4_0.2_303)]", "bg-[oklch(0.85_0.04_303)]", "bg-[oklch(0.922_0_0)]"] },
  { value: "rose", label: "Blush", colors: ["bg-[oklch(0.645_0.246_16.439)]", "bg-[oklch(0.715_0.143_16.439)]", "bg-[oklch(0.5_0.2_16)]", "bg-[oklch(0.85_0.04_16)]", "bg-[oklch(0.922_0_0)]"] },
  { value: "amber", label: "Sunset", colors: ["bg-[oklch(0.769_0.188_70.08)]", "bg-[oklch(0.828_0.167_70.08)]", "bg-[oklch(0.6_0.15_70)]", "bg-[oklch(0.85_0.04_70)]", "bg-[oklch(0.922_0_0)]"] },
];




const paymentMethodOptions = [
  { value: "cod", label: "COD" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "online", label: "Online" },
];

const TIMEZONES = [
  "Asia/Colombo", "Asia/Kolkata", "Asia/Dubai", "Asia/Singapore",
  "Asia/Kuala_Lumpur", "Asia/Bangkok", "Asia/Dhaka", "Asia/Kathmandu",
  "Asia/Karachi", "Asia/Tokyo", "Asia/Shanghai", "Australia/Sydney",
  "Pacific/Auckland", "Europe/London", "Europe/Paris", "America/New_York",
  "America/Chicago", "America/Los_Angeles",
];

const DATE_FORMATS = [
  { label: "YYYY-MM-DD", value: "YYYY-MM-DD", example: "2026-07-19" },
  { label: "DD-MM-YYYY", value: "DD-MM-YYYY", example: "19-07-2026" },
  { label: "YY-MM-DD", value: "YY-MM-DD", example: "26-07-19" },
  { label: "DD-MM-YY", value: "DD-MM-YY", example: "19-07-26" },
];

const CURRENCIES = [
  { label: "LKR (Rs.)", value: "LKR" }, { label: "USD ($)", value: "USD" },
  { label: "EUR (€)", value: "EUR" }, { label: "GBP (£)", value: "GBP" },
  { label: "INR (₹)", value: "INR" }, { label: "AED (د.إ)", value: "AED" },
  { label: "SGD (S$)", value: "SGD" }, { label: "MYR (RM)", value: "MYR" },
  { label: "THB (฿)", value: "THB" }, { label: "AUD (A$)", value: "AUD" },
];

const COUNTRIES = [
  "Sri Lanka", "India", "Maldives", "Bangladesh", "Nepal", "Pakistan",
  "Singapore", "Malaysia", "Thailand", "United Arab Emirates",
  "United Kingdom", "United States", "Australia",
];

// ═══════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════

const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

// ═══════════════════════════════════════════════════════════════════════
// REUSABLE UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function FormField({
  label,
  hint,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex items-baseline justify-between">
          <Label className="text-sm font-medium text-foreground/80">{label}</Label>
          {hint && <span className="text-[11px] text-muted-foreground/50">{hint}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

function OptionCard({
  selected, onClick, children, className,
}: {
  selected: boolean; onClick: () => void; children: React.ReactNode; className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200",
        selected
          ? "border-primary/40 bg-primary/[0.04] shadow-sm"
          : "border-border/30 bg-transparent hover:border-border/60 hover:bg-muted/20 hover:shadow-sm",
        className,
      )}
    >
      {children}
      {selected && (
        <motion.div
          layoutId="option-indicator"
          className="absolute inset-0 rounded-xl ring-1 ring-primary/20"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </motion.button>
  );
}

function SettingsRow({
  label, hint, children,
}: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={staggerItem}
      className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 py-2.5 first:pt-0 last:pb-0 group/setting"
    >
      <div className="shrink-0 sm:w-[220px]">
        <Label className="text-sm font-medium text-foreground/80">{label}</Label>
        {hint && <p className="text-[11px] text-muted-foreground/50 mt-0.5 leading-tight">{hint}</p>}
      </div>
      <div className="flex-1 flex justify-start sm:justify-end">{children}</div>
    </motion.div>
  );
}

function SectionDivider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border/20" />
      </div>
    </div>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "info" }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
      variant === "default" && "bg-muted text-muted-foreground/60",
      variant === "success" && "bg-success/10 text-success",
      variant === "warning" && "bg-warning/10 text-warning",
      variant === "info" && "bg-info/10 text-info",
    )}>{children}</span>
  );
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">{title}</Label>
      {action}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SOCIAL MEDIA HELPERS
// ═══════════════════════════════════════════════════════════════════════

const SOCIAL_DOMAINS: Record<string, string> = {
  facebook: "https://facebook.com/",
  instagram: "https://instagram.com/",
  tiktok: "https://www.tiktok.com/@",
  linkedin: "https://linkedin.com/in/",
};

function buildSocialUrl(type: "facebook" | "instagram" | "tiktok" | "linkedin", input: string): string {
  const trimmed = input.trim();
  // If already a full URL, return as-is
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // If it contains a dot, it's likely a domain — just prepend protocol
  if (trimmed.includes(".")) return `https://${trimmed}`;
  // Otherwise it's just a username — prepend the social domain
  return `${SOCIAL_DOMAINS[type]}${trimmed}`;
}

// ═══════════════════════════════════════════════════════════════════════
// SOCIAL MEDIA BRAND ICONS
// ═══════════════════════════════════════════════════════════════════════

function SocialIcon({ type, href, size = "sm" }: { type: "facebook" | "instagram" | "tiktok" | "linkedin"; href?: string; size?: "sm" | "md" }) {
  const isSm = size === "sm";
  const iconSize = isSm ? "size-7" : "size-9";
  const svgSize = isSm ? "size-3.5" : "size-4.5";
  const base = cn(iconSize, "flex items-center justify-center rounded-full shadow-sm transition-transform hover:scale-110");

  const icon = (() => {
    switch (type) {
      case "facebook":
        return (
          <span className={cn(base, "bg-[#1877F2]")} title="Facebook">
            <svg viewBox="0 0 24 24" className={cn(svgSize, "text-white")} fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </span>
        );
      case "instagram":
        return (
          <span className={cn(base, "bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]")} title="Instagram">
            <svg viewBox="0 0 24 24" className={cn(svgSize, "text-white")} fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </span>
        );
      case "tiktok":
        return (
          <span className={cn(base, "bg-[#000000] dark:bg-white")} title="TikTok">
            <svg viewBox="0 0 24 24" className={cn(svgSize, "text-white dark:text-black")} fill="currentColor">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
          </span>
        );
      case "linkedin":
        return (
          <span className={cn(base, "bg-[#0A66C2]")} title="LinkedIn">
            <svg viewBox="0 0 24 24" className={cn(svgSize, "text-white")} fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </span>
        );
    }
  })();

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {icon}
      </a>
    );
  }

  return icon;
}

// ═══════════════════════════════════════════════════════════════════════
// IMAGE UPLOAD HELPERS
// ═══════════════════════════════════════════════════════════════════════

const SUPABASE_STORAGE_BUCKET = "profile-images";

function ImageUploadOverlay({
  onUpload,
  onDelete,
  hasImage,
  uploading,
  shape = "round",
}: {
  onUpload: () => void;
  onDelete: () => void;
  hasImage: boolean;
  uploading: boolean;
  shape?: "round" | "rect";
}) {
  return (
    <div className={cn(
      "absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
      shape === "round" ? "rounded-full" : "rounded-xl",
    )}>
      <button
        type="button"
        onClick={onUpload}
        disabled={uploading}className="flex size-7 items-center justify-center rounded-full bg-background/20 text-foreground transition-all hover:bg-background/30 hover:scale-110"
            title="Upload photo"
      >
        {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
      </button>
      {hasImage && (
        <button
          type="button"
          onClick={onDelete}className="flex size-7 items-center justify-center rounded-full bg-background/20 text-foreground transition-all hover:bg-destructive/40 hover:scale-110 ml-1.5"
            title="Remove photo"
        >
          <Trash2 className="size-3.5" />
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// GENERAL TAB
// ═══════════════════════════════════════════════════════════════════════

function GeneralSettings() {
  const { setTheme: setNextTheme } = useTheme();
  const customColorInputRef = useRef<HTMLInputElement>(null);
  const { theme, accent, accentCustom, fontFamily, fontSize, currency, dateFormat, backgroundStyle, setAccent, setAccentCustom, setFontFamily, setFontSize, setCurrency, setDateFormat, setBackgroundStyle, setTheme: setPreferencesTheme } = usePreferences();

  const handleThemeChange = useCallback((newTheme: "light" | "dark" | "system") => {
    setNextTheme(newTheme);
    setPreferencesTheme(newTheme);
  }, [setNextTheme, setPreferencesTheme]);

  return (
    <div className="space-y-4">
      <CollapsibleCard icon={Sun} title="Theme & Style" description="Choose your color scheme and design personality.">
        <div className="space-y-0.5">
          <div>
            <SectionHeader title="Interface Theme" />
            <div className="grid grid-cols-3 gap-3">
              {THEME_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const selected = theme === opt.value;
                return (
                  <motion.button
                    key={opt.value} type="button" onClick={() => handleThemeChange(opt.value)}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={cn(
                      "relative flex flex-col items-center gap-2.5 rounded-xl border p-4.5 transition-all duration-200",
                      selected ? "border-primary/30 bg-primary/[0.04] shadow-sm" : "border-border/30 bg-transparent hover:border-border/60 hover:bg-muted/20 hover:shadow-sm",
                    )}
                  >
                    {selected && <motion.div layoutId="theme-indicator" className="absolute inset-0 rounded-xl ring-1 ring-primary/15" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                    <div className={cn("flex size-11 items-center justify-center rounded-xl transition-all duration-200", selected ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "bg-muted/60 text-muted-foreground/70")}>
                      <Icon className="size-5" />
                    </div>
                    <span className={cn("text-sm font-semibold", selected ? "text-foreground" : "text-muted-foreground/60")}>{opt.label}</span>
                    <span className="text-[11px] text-muted-foreground/40 text-center leading-tight">{opt.description}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <SectionDivider />

          <div>
            <SectionHeader title="Design Personality" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PALETTE_OPTIONS.map((palette) => {
                const selected = accent === palette.value;
                return (
                  <motion.button
                    key={palette.value} type="button" onClick={() => setAccent(palette.value)}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={cn(
                      "relative group rounded-xl border p-4 transition-all duration-200",
                      selected ? "border-primary/30 bg-primary/[0.04] shadow-sm" : "border-border/30 hover:border-border/60 hover:bg-muted/20 hover:shadow-sm",
                    )}
                  >
                    {selected && <motion.div layoutId="palette-indicator" className="absolute inset-0 rounded-xl ring-1 ring-primary/15" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                    <div className="mb-3 flex gap-1 overflow-hidden rounded-lg">
                      {palette.colors.map((color, i) => <div key={i} className={cn("h-8 flex-1 transition-all duration-200 group-hover:scale-y-110 group-hover:rounded-sm", color)} />)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={cn("text-sm font-semibold", selected ? "text-foreground" : "text-muted-foreground/70")}>{palette.label}</span>
                      {selected && <Badge variant="info">Active</Badge>}
                    </div>
                  </motion.button>
                );
              })}

              <motion.button
                type="button" onClick={() => customColorInputRef.current?.click()}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className={cn(
                  "group rounded-xl border p-4 transition-all duration-200",
                  accent === "custom" ? "border-primary/30 bg-primary/[0.04] shadow-sm" : "border-border/30 hover:border-border/60 hover:bg-muted/20 hover:shadow-sm",
                )}
              >
                {accent === "custom" && <motion.div layoutId="palette-indicator" className="absolute inset-0 rounded-xl ring-1 ring-primary/15" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                <div className="mb-3 flex gap-1 overflow-hidden rounded-lg">
                  <div className="h-8 flex-1 transition-transform group-hover:scale-y-110" style={{ backgroundColor: accentCustom || "#6366f1" }} />
                  <div className="h-8 flex-1 bg-gradient-to-r from-transparent to-muted" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pipette className="size-3.5 text-muted-foreground/60" />
                    <span className={cn("text-sm font-semibold", accent === "custom" ? "text-foreground" : "text-muted-foreground/70")}>Custom</span>
                  </div>
                  <ChevronDown className="size-3.5 text-muted-foreground/40" />
                </div>
                <input ref={customColorInputRef} type="color" value={accentCustom || "#6366f1"}
                  onChange={(e) => { setAccentCustom(e.target.value); setAccent("custom"); }}
                  className="sr-only" tabIndex={-1} />
              </motion.button>
            </div>
          </div>

          <SectionDivider />

          <div>
            <SectionHeader title="Background Style" />
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                type="button" onClick={() => setBackgroundStyle("blobs")}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative flex flex-col items-center gap-2.5 rounded-xl border p-4.5 transition-all duration-200",
                  backgroundStyle === "blobs" ? "border-primary/30 bg-primary/[0.04] shadow-sm" : "border-border/30 bg-transparent hover:border-border/60 hover:bg-muted/20 hover:shadow-sm",
                )}
              >
                {backgroundStyle === "blobs" && <motion.div layoutId="bg-indicator" className="absolute inset-0 rounded-xl ring-1 ring-primary/15" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                <div className={cn("flex size-11 items-center justify-center rounded-xl transition-all duration-200", backgroundStyle === "blobs" ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "bg-muted/60 text-muted-foreground/70")}>
                  <span className="text-xl">✨</span>
                </div>
                <span className={cn("text-sm font-semibold", backgroundStyle === "blobs" ? "text-foreground" : "text-muted-foreground/60")}>Blobs</span>
                <span className="text-[11px] text-muted-foreground/40 text-center leading-tight">Gradient blobs</span>
              </motion.button>

              <motion.button
                type="button" onClick={() => setBackgroundStyle("solid")}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative flex flex-col items-center gap-2.5 rounded-xl border p-4.5 transition-all duration-200",
                  backgroundStyle === "solid" ? "border-primary/30 bg-primary/[0.04] shadow-sm" : "border-border/30 bg-transparent hover:border-border/60 hover:bg-muted/20 hover:shadow-sm",
                )}
              >
                {backgroundStyle === "solid" && <motion.div layoutId="bg-indicator" className="absolute inset-0 rounded-xl ring-1 ring-primary/15" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                <div className={cn("flex size-11 items-center justify-center rounded-xl transition-all duration-200", backgroundStyle === "solid" ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "bg-muted/60 text-muted-foreground/70")}>
                  <span className="text-xl">●</span>
                </div>
                <span className={cn("text-sm font-semibold", backgroundStyle === "solid" ? "text-foreground" : "text-muted-foreground/60")}>Solid</span>
                <span className="text-[11px] text-muted-foreground/40 text-center leading-tight">Clean solid background</span>
              </motion.button>
            </div>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard icon={Type} title="Typography" description="Choose your font and size with a live preview.">
        <div className="space-y-0.5">
          <div>
            <SectionHeader title="Font Personality" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {FONT_OPTIONS.map((opt) => {
                const selected = fontFamily === opt.value;
                return (
                  <OptionCard key={opt.value} selected={selected} onClick={() => setFontFamily(opt.value)}>
                    <div className="min-w-0 flex-1">
                      <span className={cn("block text-lg font-medium", selected ? "text-foreground" : "text-foreground/80")} style={{ fontFamily: `'${opt.label}', sans-serif` }}>{opt.preview}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground/60">{opt.description}</span>
                    </div>
                  </OptionCard>
                );
              })}
            </div>
          </div>

          <SectionDivider />

          <div>
            <SectionHeader title="Font Size" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {FONT_SIZE_OPTIONS.map((opt) => {
                const selected = fontSize === opt.value;
                const sizeMap: Record<FontSize, string> = { small: "text-sm", medium: "text-base", large: "text-lg" };
                return (
                  <OptionCard key={opt.value} selected={selected} onClick={() => setFontSize(opt.value)}>
                    <div className="min-w-0 flex-1">
                      <span className={cn("block font-medium", selected ? "text-foreground" : "text-foreground/80", sizeMap[opt.value])}>{opt.preview} — {opt.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground/60">{opt.description}</span>
                    </div>
                  </OptionCard>
                );
              })}
            </div>
          </div>

        </div>
      </CollapsibleCard>


      {/* ── Currency & Date Format ── */}
      <CollapsibleCard icon={DollarSign} title="Currency & Date Format" description="Set your preferred currency and date display format." >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Currency">
            <Select value={currency} onValueChange={(v) => v && setCurrency(v)}>
              <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Date Format">
            <Select value={dateFormat} onValueChange={(v) => v && setDateFormat(v)}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue>
                  <span>{dateFormat}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMATS.map((df) => (
                  <SelectItem key={df.value} value={df.value}>
                    <span className="flex w-full items-center justify-between gap-4">
                      <span className="font-medium">{df.label}</span>
                      <span className="text-xs text-muted-foreground/50 tabular-nums">{df.example}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </CollapsibleCard>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PROFILE TAB
// ═══════════════════════════════════════════════════════════════════════

function ProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBusiness, setSavingBusiness] = useState(false);

  // Image upload / delete state
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [avatarCropOpen, setAvatarCropOpen] = useState(false);
  const [avatarCropSrc, setAvatarCropSrc] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarConfirmOpen, setAvatarConfirmOpen] = useState(false);
  const [logoCropOpen, setLogoCropOpen] = useState(false);
  const [logoCropSrc, setLogoCropSrc] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoConfirmOpen, setLogoConfirmOpen] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [businessLogoUrl, setBusinessLogoUrl] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [tagline, setTagline] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Sri Lanka");
  const [businessType, setBusinessType] = useState("");
  const [currency, setCurrency] = useState("LKR");
  const [timezone, setTimezone] = useState("Asia/Colombo");
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const initials = useMemo(() => {
    const first = firstName?.charAt(0)?.toUpperCase() || "U";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return `${first}${last}` || "U";
  }, [firstName, lastName]);

  const businessInitials = useMemo(() => businessName?.charAt(0)?.toUpperCase() || "B", [businessName]);

  // ── Avatar Handlers ──

  const handleAvatarFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setAvatarCropSrc(reader.result as string); setAvatarCropOpen(true); };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const handleAvatarCropComplete = useCallback(async (croppedBlob: Blob) => {
    if (!userId) return;
    setUploadingAvatar(true);
    try {
      const supabase = createClient();
      const filePath = `avatars/${userId}/avatar-${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage.from(SUPABASE_STORAGE_BUCKET).upload(filePath, croppedBlob, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(filePath);
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", userId);
      setAvatarUrl(publicUrl);
      toast.success("Avatar updated successfully");
    } catch (err) {
      toast.error("Failed to upload avatar", { description: err instanceof Error ? err.message : "An error occurred." });
    } finally { setUploadingAvatar(false); }
  }, [userId]);

  const handleAvatarDelete = useCallback(async () => {
    if (!userId || !avatarUrl) { setAvatarConfirmOpen(false); return; }
    setAvatarConfirmOpen(false);
    try {
      const supabase = createClient();
      const oldPath = avatarUrl.split("/").slice(-3).join("/");
      await supabase.storage.from(SUPABASE_STORAGE_BUCKET).remove([oldPath]);
      await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", userId);
      setAvatarUrl(null);
      toast.success("Avatar removed");
    } catch (err) {
      toast.error("Failed to remove avatar", { description: err instanceof Error ? err.message : "An error occurred." });
    }
  }, [userId, avatarUrl]);

  // ── Logo Handlers ──

  const handleLogoFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setLogoCropSrc(reader.result as string); setLogoCropOpen(true); };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const handleLogoCropComplete = useCallback(async (croppedBlob: Blob) => {
    if (!businessId) return;
    setUploadingLogo(true);
    try {
      const supabase = createClient();
      const filePath = `logos/${businessId}/logo-${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage.from(SUPABASE_STORAGE_BUCKET).upload(filePath, croppedBlob, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(filePath);
      await supabase.from("businesses").update({ logo_url: publicUrl }).eq("id", businessId);
      setBusinessLogoUrl(publicUrl);
      toast.success("Logo updated successfully");
    } catch (err) {
      toast.error("Failed to upload logo", { description: err instanceof Error ? err.message : "An error occurred." });
    } finally { setUploadingLogo(false); }
  }, [businessId]);

  const handleLogoDelete = useCallback(async () => {
    if (!businessId || !businessLogoUrl) { setLogoConfirmOpen(false); return; }
    setLogoConfirmOpen(false);
    try {
      const supabase = createClient();
      const oldPath = businessLogoUrl.split("/").slice(-3).join("/");
      await supabase.storage.from(SUPABASE_STORAGE_BUCKET).remove([oldPath]);
      await supabase.from("businesses").update({ logo_url: null }).eq("id", businessId);
      setBusinessLogoUrl(null);
      toast.success("Logo removed");
    } catch (err) {
      toast.error("Failed to remove logo", { description: err instanceof Error ? err.message : "An error occurred." });
    }
  }, [businessId, businessLogoUrl]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) { window.location.replace("/login"); return; }
        setUserId(session.user.id);
        setEmail(session.user.email || "");

        const { data: profile } = await supabase.from("profiles")
          .select("full_name, phone, avatar_url, business_id")
          .eq("user_id", session.user.id).single();

        if (profile) {
          const fullName = String(profile.full_name || "");
          const spaceIdx = fullName.lastIndexOf(" ");
          if (spaceIdx > 0) { setFirstName(fullName.slice(0, spaceIdx)); setLastName(fullName.slice(spaceIdx + 1)); }
          else { setFirstName(fullName); setLastName(""); }
          setPhone(String(profile.phone || ""));
          setAvatarUrl(profile.avatar_url);
          setBusinessId(profile.business_id);
        }

        if (profile?.business_id) {
          const { data: business } = await supabase.from("businesses")
            .select("name, type, phone, district, address, logo_url")
            .eq("id", profile.business_id).single();
          if (business) {
            setBusinessName(String(business.name || ""));
            setBusinessType(String(business.type || ""));
            setBusinessPhone(String(business.phone || ""));
            setDistrict(String(business.district || ""));
            setAddress(String(business.address || ""));
            setBusinessLogoUrl(business.logo_url);
          }

          const { data: settings } = await supabase.from("business_settings")
            .select("key, value").eq("business_id", profile.business_id);
          if (settings) {
            const map: Record<string, string> = {};
            settings.forEach((s) => { map[s.key] = String(s.value); });
            setTagline(map.tagline || ""); setWhatsappNumber(map.whatsapp_number || "");
            setBusinessEmail(map.business_email || ""); setWebsite(map.website || "");
            setCity(map.city || ""); setPostalCode(map.postal_code || "");
            setCountry(map.country || "Sri Lanka"); setCurrency(map.currency || "LKR");
            setTimezone(map.timezone || "Asia/Colombo"); setDateFormat(map.date_format || "YYYY-MM-DD");
            // Sync currency & dateFormat to preferences store for General tab
            usePreferences.getState().setCurrency(map.currency || "LKR");
            usePreferences.getState().setDateFormat(map.date_format || "YYYY-MM-DD");
            setFacebook(map.facebook || ""); setInstagram(map.instagram || "");
            setTiktok(map.tiktok || ""); setLinkedin(map.linkedin || "");
          }
        }
      } catch (error) { console.error("Profile fetch error:", error); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const handleSaveProfile = useCallback(async () => {
    if (!userId) return;
    setSavingProfile(true);
    try {
      const supabase = createClient();
      const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
      await supabase.from("profiles").update({ full_name: fullName, phone: phone || null, updated_at: new Date().toISOString() }).eq("user_id", userId);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to update profile", { description: err instanceof Error ? err.message : "An error occurred." });
    } finally { setSavingProfile(false); }
  }, [userId, firstName, lastName, phone]);

  const handleSaveBusiness = useCallback(async () => {
    if (!businessId) return;
    setSavingBusiness(true);
    try {
      const supabase = createClient();
      await supabase.from("businesses").update({
        name: businessName, type: businessType || null, phone: businessPhone || null,
        district: district || null, address: address || null, updated_at: new Date().toISOString(),
      }).eq("id", businessId);

      const prefs = usePreferences.getState();
      const entries: Record<string, string> = {
        tagline, whatsapp_number: whatsappNumber, business_email: businessEmail, website,
        city, postal_code: postalCode, country, timezone,
        currency: prefs.currency, date_format: prefs.dateFormat,
        facebook, instagram, tiktok, linkedin,
      };
      for (const [key, value] of Object.entries(entries)) {
        await supabase.from("business_settings").upsert({ business_id: businessId, key, value }, { onConflict: "business_id, key" });
      }
      toast.success("Business profile updated successfully");
    } catch (err) {
      toast.error("Failed to update business profile", { description: err instanceof Error ? err.message : "An error occurred." });
    } finally { setSavingBusiness(false); }
  }, [businessId, businessName, businessType, businessPhone, district, address, tagline, whatsappNumber, businessEmail, website, city, postalCode, country, currency, timezone, dateFormat, facebook, instagram, tiktok, linkedin]);

  return (
    <>
      {/* Crop & Confirm Dialogs */}
      <ImageCropDialog open={avatarCropOpen} onOpenChange={setAvatarCropOpen} imageSrc={avatarCropSrc} onCropComplete={handleAvatarCropComplete} cropShape="round" title="Crop Profile Photo" />
      <ConfirmDialog open={avatarConfirmOpen} onOpenChange={setAvatarConfirmOpen} title="Remove Profile Photo" description="Are you sure you want to remove your profile photo?" confirmLabel="Remove" variant="destructive" onConfirm={handleAvatarDelete} />
      <ImageCropDialog open={logoCropOpen} onOpenChange={setLogoCropOpen} imageSrc={logoCropSrc} onCropComplete={handleLogoCropComplete} cropShape="rect" title="Crop Business Logo" />
      <ConfirmDialog open={logoConfirmOpen} onOpenChange={setLogoConfirmOpen} title="Remove Business Logo" description="Are you sure you want to remove your business logo?" confirmLabel="Remove" variant="destructive" onConfirm={handleLogoDelete} />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/20" />)}
        </div>
      ) : (
        <div className="space-y-4">

          {/* ── Profile Hero Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-primary/[0.03] to-transparent shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-transparent pointer-events-none" />
            <div className="relative p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0 group">
                    <div className="absolute inset-0 rounded-full bg-primary/10 blur-md" />
                    <Avatar className="relative size-16 ring-2 ring-border/20 shadow-sm">
                      <AvatarImage src={avatarUrl || undefined} alt={firstName || "User"} />
                      <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">{initials}</AvatarFallback>
                    </Avatar>
                    <ImageUploadOverlay
                      onUpload={() => avatarInputRef.current?.click()}
                      onDelete={() => setAvatarConfirmOpen(true)}
                      hasImage={!!avatarUrl}
                      uploading={uploadingAvatar}
                      shape="round"
                    />
                    <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarFileSelect} className="sr-only" tabIndex={-1} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{firstName} {lastName}</h2>
                    <p className="text-sm text-muted-foreground">{email}</p>
                    {phone && <p className="text-xs text-muted-foreground/60 mt-0.5">{phone}</p>}
                  </div>
                </div>
                <Button variant="gradient" size="sm" onClick={handleSaveProfile} disabled={savingProfile} className="shrink-0">
                  {savingProfile ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  {savingProfile ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* ── Personal Information ── */}
          <CollapsibleCard icon={User} title="Personal Information" description="Your personal details and contact information.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="First Name"><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-10" /></FormField>
              <FormField label="Last Name"><Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-10" /></FormField>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Email Address">
                <div className="flex h-10 items-center rounded-xl border border-border/40 bg-muted/20 px-3 text-sm text-muted-foreground">
                  <Mail className="mr-2 size-3.5 text-muted-foreground/40" />{email}
                </div>
              </FormField>
              <FormField label="Phone Number"><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10" /></FormField>
            </div>
          </CollapsibleCard>

          {/* ── Branding (Business Profile) ── */}
          <CollapsibleCard icon={ImageIcon} title="Business Profile" description="Your business identity, contact, address, and online presence — all in one place.">
            {/* ── Live Business Card Preview ── */}
            <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-card via-card to-muted/10 shadow-lg">
              {/* Decorative top accent bar */}
              <div className="h-2 bg-gradient-to-r from-primary/60 via-primary/30 to-primary/10" />

              <div className="p-5 sm:p-6 space-y-4">
                {/* Logo + Name */}
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-2xl bg-primary/15 blur-xl" />
                    <Avatar className="relative size-16 rounded-2xl ring-2 ring-border/20 shadow-lg">
                      <AvatarImage src={businessLogoUrl || undefined} alt={businessName || "Business"} />
                      <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xl font-bold">
                        {businessInitials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <h3 className="text-xl font-bold text-foreground leading-tight">{businessName || "Your Business Name"}</h3>
                    {tagline && <p className="text-sm text-muted-foreground/60 mt-0.5 leading-snug">{tagline}</p>}
                  </div>
                </div>

                {/* Contact Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {businessPhone && (
                    <div className="flex items-center gap-3 rounded-xl bg-muted/20 border border-border/10 px-3.5 py-2.5 transition-colors hover:bg-muted/30">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary/60">
                        <Smartphone className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">Phone</p>
                        <p className="text-sm font-medium text-foreground/80 truncate">{businessPhone}</p>
                      </div>
                    </div>
                  )}
                  {businessEmail && (
                    <div className="flex items-center gap-3 rounded-xl bg-muted/20 border border-border/10 px-3.5 py-2.5 transition-colors hover:bg-muted/30">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary/60">
                        <Mail className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">Email</p>
                        <p className="text-sm font-medium text-foreground/80 truncate">{businessEmail}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Address & Website */}
                <div className="space-y-2.5">
                  {(city || district) && (
                    <div className="flex items-start gap-3 rounded-xl bg-muted/20 border border-border/10 px-3.5 py-2.5">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary/60">
                        <MapPin className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">Location</p>
                        <p className="text-sm text-foreground/70">{address}</p>
                      </div>
                    </div>
                  )}
                  {website && (
                    <div className="flex items-center gap-3 rounded-xl bg-primary/[0.03] border border-primary/10 px-3.5 py-2.5">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary/60">
                        <Globe className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-primary/40">Website</p>
                        <p className="text-sm font-medium text-primary/70">{website.replace("https://", "").replace("http://", "")}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Social Media */}
                {(facebook || instagram || tiktok || linkedin) && (
                  <div className="pt-3.5 border-t border-border/15">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {facebook && <SocialIcon type="facebook" href={buildSocialUrl("facebook", facebook)} />}
                        {instagram && <SocialIcon type="instagram" href={buildSocialUrl("instagram", instagram)} />}
                        {tiktok && <SocialIcon type="tiktok" href={buildSocialUrl("tiktok", tiktok)} />}
                        {linkedin && <SocialIcon type="linkedin" href={buildSocialUrl("linkedin", linkedin)} />}
                      </div>
                      <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-muted-foreground/25">Live Preview</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <SectionDivider />

            {/* ── Logo & Identity ── */}
            <div>
              <SectionHeader title="Logo & Identity" />
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-4 shrink-0">
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-xl bg-primary/5 blur-sm" />
                    <Avatar className="relative size-16 rounded-xl ring-2 ring-border/20 shadow-sm">
                      <AvatarImage src={businessLogoUrl || undefined} alt={businessName || "Business"} />
                      <AvatarFallback className="rounded-xl bg-primary/10 text-lg font-bold text-primary">{businessInitials}</AvatarFallback>
                    </Avatar>
                    <ImageUploadOverlay
                      onUpload={() => logoInputRef.current?.click()}
                      onDelete={() => setLogoConfirmOpen(true)}
                      hasImage={!!businessLogoUrl}
                      uploading={uploadingLogo}
                      shape="rect"
                    />
                    <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoFileSelect} className="sr-only" tabIndex={-1} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Business Logo</p>
                    <p className="text-xs text-muted-foreground/60">Square image, max 2MB</p>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Business Name"><Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="h-10" /></FormField>
                  <FormField label="Tagline"><Input value={tagline} onChange={(e) => setTagline(e.target.value)} className="h-10" /></FormField>
                </div>
              </div>
            </div>

            <SectionDivider />

            {/* ── Contact Information ── */}
            <div>
              <SectionHeader title="Contact Information" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Business Phone"><Input value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} className="h-10" /></FormField>
                <FormField label="WhatsApp Number"><Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="h-10" /></FormField>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Email Address"><Input type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} className="h-10" /></FormField>
                <FormField label="Website"><Input value={website} onChange={(e) => setWebsite(e.target.value)} className="h-10" /></FormField>
              </div>
            </div>

            <SectionDivider />

            {/* ── Address ── */}
            <div>
              <SectionHeader title="Address" />
              <FormField label="Address"><Input value={address} onChange={(e) => setAddress(e.target.value)} className="h-10" /></FormField>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="City"><Input value={city} onChange={(e) => setCity(e.target.value)} className="h-10" /></FormField>
                <FormField label="District">
                  <Select value={district} onValueChange={(v) => v && setDistrict(v)}>
                    <SelectTrigger className="h-9 w-full"><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent>{SRI_LANKA_DISTRICTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
              </div>
            </div>

            <SectionDivider />

            {/* ── Social Media ── */}
            <div>
              <SectionHeader title="Social Media" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField>
                  <div className="flex items-center gap-2.5">
                    <SocialIcon type="facebook" size="md" />
                    <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="Facebook page URL" className="h-10 flex-1" aria-label="Facebook URL" />
                  </div>
                </FormField>
                <FormField>
                  <div className="flex items-center gap-2.5">
                    <SocialIcon type="instagram" size="md" />
                    <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram profile URL" className="h-10 flex-1" aria-label="Instagram URL" />
                  </div>
                </FormField>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="">
                  <div className="flex items-center gap-2.5">
                    <SocialIcon type="tiktok" size="md" />
                    <Input value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="TikTok profile URL" className="h-10 flex-1" aria-label="TikTok URL" />
                  </div>
                </FormField>
                <FormField>
                  <div className="flex items-center gap-2.5">
                    <SocialIcon type="linkedin" size="md" />
                    <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn page URL" className="h-10 flex-1" aria-label="LinkedIn URL" />
                  </div>
                </FormField>
              </div>
            </div>
          </CollapsibleCard>


          {/* ── Save All ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Button variant="gradient" size="lg" className="w-full mt-2 shadow-sm" onClick={handleSaveBusiness} disabled={savingBusiness}>
              {savingBusiness ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {savingBusiness ? "Saving All Changes..." : "Save All Business Changes"}
            </Button>
          </motion.div>

        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// OPERATIONAL TAB
// ═══════════════════════════════════════════════════════════════════════

function OperationalSettings() {
  const [newPaymentMethod, setNewPaymentMethod] = useState("");
  const ordersSettings = useOrdersSettings();
  const quotationSettings = useQuotationSettings();

  // Helper to format a number with the same padding as the start value
  const fmtOrderNum = (val: number) => {
    const start = ordersSettings.orderNumberStart || "1";
    const pad = start.length;
    return ordersSettings.orderNumberPrefix + String(val).padStart(pad, "0");
  };
  const fmtQuotNum = (val: number) => {
    const start = quotationSettings.quotationNumberStart || "1";
    const pad = start.length;
    return quotationSettings.quotationNumberPrefix + String(val).padStart(pad, "0");
  };
  const expenseSettings = useExpenseSettings();
  const [newMethodName, setNewMethodName] = useState("");
  const [expenseAddToInventory, setExpenseAddToInventory] = useState(true);

  return (
    <div className="space-y-4">
      {/* Order Settings */}
      <CollapsibleCard icon={Package} title="Order Settings" description="Configure order numbering, defaults, and workflow.">
        <div>
          <SectionHeader title="Order Numbering" />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="w-full sm:flex-1">
              <Label className="text-xs text-muted-foreground/70 mb-1.5 block">Prefix</Label>
              <Input value={ordersSettings.orderNumberPrefix} onChange={(e) => ordersSettings.setOrderNumberPrefix(e.target.value)} placeholder="e.g. INV-" className="h-10 w-full" />
            </div>
            <div className="w-full sm:flex-1">
              <Label className="text-xs text-muted-foreground/70 mb-1.5 block">Starting Number</Label>
              <Input type="text" value={ordersSettings.orderNumberStart} onChange={(e) => { const v = e.target.value; if (/^\d*$/.test(v)) ordersSettings.setOrderNumberStart(v || "1"); }} className="h-10 w-full" inputMode="numeric" />
            </div>
            <div className="w-full sm:w-auto shrink-0">
              <Label className="text-xs text-muted-foreground/70 mb-1.5 block">Preview</Label>
              <div className="flex h-10 items-center gap-1.5 rounded-xl border border-border/30 bg-muted/20 px-3 w-full sm:w-auto overflow-x-auto">
                <code className="text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">
                  {fmtOrderNum(parseInt(ordersSettings.orderNumberStart || "1", 10))}
                </code>
                <span className="text-muted-foreground/30 shrink-0">→</span>
                <code className="text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">
                  {fmtOrderNum(parseInt(ordersSettings.orderNumberStart || "1", 10) + 1)}
                </code>
                <span className="text-muted-foreground/30 shrink-0">→</span>
                <code className="text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">
                  {fmtOrderNum(parseInt(ordersSettings.orderNumberStart || "1", 10) + 2)}
                </code>
              </div>
            </div>
          </div>
        </div>

        <SectionDivider />

        <div>
          <SectionHeader title="Defaults" />
          <SettingsRow label="Payment Methods">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
              {ordersSettings.orderPaymentMethods.map((method) => {
                const isDefault = ordersSettings.defaultPaymentMethod === method;
                return (
                  <motion.div
                    key={method}
                    layout
                    className="flex items-center gap-1.5 rounded-xl border bg-card px-3 py-2 transition-all duration-200"
                  >
                    <span
                      className={cn(
                        "text-sm font-medium cursor-pointer",
                        isDefault ? "text-primary" : "text-foreground",
                      )}
                      onClick={() => ordersSettings.setDefaultPaymentMethod(method)}
                      title="Click to set as default"
                    >
                      {formatEnumLabel(method)}
                      {isDefault && (
                        <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                          Default
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => ordersSettings.removeOrderPaymentMethod(method)}
                      className="ml-0.5 flex size-4 items-center justify-center rounded-full text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </motion.div>
                );
              })}
              <div className="flex items-center gap-1.5">
                <Input
                  placeholder="Add method..."
                  className="h-9 w-32 text-sm"
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newPaymentMethod.trim()) {
                      ordersSettings.addOrderPaymentMethod(newPaymentMethod.trim());
                      setNewPaymentMethod("");
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0"
                  onClick={() => {
                    if (newPaymentMethod.trim()) {
                      ordersSettings.addOrderPaymentMethod(newPaymentMethod.trim());
                      setNewPaymentMethod("");
                    }
                  }}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          </SettingsRow>
          <SettingsRow label="Default Delivery Charge" hint="Pre-filled in new orders (LKR)">
            <Input
              type="number"
              min={0}
              value={ordersSettings.defaultDeliveryCharge}
              onChange={(e) =>
                ordersSettings.setDefaultDeliveryCharge(Number(e.target.value) || 0)
              }
              className="h-10 w-28 text-right"
            />
          </SettingsRow>
        </div>

        <SectionDivider />

        <SettingsRow label="Default Landing Page" hint="Redirect to orders page on login">
          <div className="flex items-center gap-2.5">
            <Switch id="orders-default-landing" checked={ordersSettings.isDefaultLandingPage} onCheckedChange={ordersSettings.setIsDefaultLandingPage} />
            <Label htmlFor="orders-default-landing" className="text-sm text-muted-foreground cursor-pointer">Make Orders the default page</Label>
          </div>
        </SettingsRow>

        <SectionDivider />      </CollapsibleCard>

      {/* Quotation Settings */}
      <CollapsibleCard icon={FileText} title="Quotation Settings" description="Configure quotation numbering and default expiry.">
        <div>
          <SectionHeader title="Quotation Numbering" />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="w-full sm:flex-1">
              <Label className="text-xs text-muted-foreground/70 mb-1.5 block">Prefix</Label>
              <Input value={quotationSettings.quotationNumberPrefix} onChange={(e) => quotationSettings.setQuotationNumberPrefix(e.target.value)} placeholder="e.g. QTN-" className="h-10 w-full" />
            </div>
            <div className="w-full sm:flex-1">
              <Label className="text-xs text-muted-foreground/70 mb-1.5 block">Starting Number</Label>
              <Input type="text" value={quotationSettings.quotationNumberStart} onChange={(e) => { const v = e.target.value; if (/^\d*$/.test(v)) quotationSettings.setQuotationNumberStart(v || "1"); }} className="h-10 w-full" inputMode="numeric" />
            </div>
            <div className="w-full sm:w-auto shrink-0">
              <Label className="text-xs text-muted-foreground/70 mb-1.5 block">Preview</Label>
              <div className="flex h-10 items-center gap-1.5 rounded-xl border border-border/30 bg-muted/20 px-3 w-full sm:w-auto overflow-x-auto">
                <code className="text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">
                  {fmtQuotNum(parseInt(quotationSettings.quotationNumberStart || "1", 10))}
                </code>
                <span className="text-muted-foreground/30 shrink-0">→</span>
                <code className="text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">
                  {fmtQuotNum(parseInt(quotationSettings.quotationNumberStart || "1", 10) + 1)}
                </code>
                <span className="text-muted-foreground/30 shrink-0">→</span>
                <code className="text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">
                  {fmtQuotNum(parseInt(quotationSettings.quotationNumberStart || "1", 10) + 2)}
                </code>
              </div>
            </div>
          </div>
        </div>

        <SectionDivider />

        <div>
          <SectionHeader title="Expiry" />
          <SettingsRow label="Expire After" hint="Number of days until a quotation expires">
            <div className="flex items-center gap-2">
              <Input type="number" value={quotationSettings.quotationExpiryDays} onChange={(e) => quotationSettings.setQuotationExpiryDays(Number(e.target.value) || 0)} className="h-10 w-24 text-right" min={0} max={365} />
              <span className="text-sm text-muted-foreground/60">days</span>
            </div>
          </SettingsRow>
        </div>
      </CollapsibleCard>

      {/* Expense Settings */}
      <CollapsibleCard icon={Settings2} title="Expense Settings" description="Configure payment methods and defaults for new expenses." >
        <div>
          <SectionHeader title="Payment Methods" />
          <div className="space-y-2.5">
            <div className="flex flex-wrap gap-2">
              {expenseSettings.expensePaymentMethods.map((method) => {
                const isDefault = expenseSettings.defaultExpensePaymentMethod === method;
                return (
                  <motion.div
                    key={method}
                    layout
                    className="flex items-center gap-1.5 rounded-xl border bg-card px-3 py-2 transition-all duration-200"
                  >
                    <span
                      className={cn(
                        "text-sm font-medium cursor-pointer",
                        isDefault ? "text-primary" : "text-foreground",
                      )}
                      onClick={() => expenseSettings.setDefaultExpensePaymentMethod(method)}
                      title="Click to set as default"
                    >
                      {formatEnumLabel(method)}
                      {isDefault && (
                        <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                          Default
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => expenseSettings.removePaymentMethod(method)}
                      className="flex size-4 items-center justify-center rounded-full text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title="Remove payment method"
                    >
                      <svg className="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M3 3l6 6M9 3l-6 6" />
                      </svg>
                    </button>
                  </motion.div>
                );
              })}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <Input
                  value={newMethodName}
                  onChange={(e) => setNewMethodName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newMethodName.trim()) {
                      e.preventDefault();
                      expenseSettings.addPaymentMethod(newMethodName.trim().toLowerCase().replace(/\s+/g, "_"));
                      setNewMethodName("");
                    }
                  }}
                  placeholder="Add method..."
                  className="h-9 w-full sm:w-36 rounded-xl text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="size-9 shrink-0"
                  onClick={() => {
                    if (newMethodName.trim()) {
                      expenseSettings.addPaymentMethod(newMethodName.trim().toLowerCase().replace(/\s+/g, "_"));
                      setNewMethodName("");
                    }
                  }}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground/50">
              Click a method to set it as default. New methods are stored as lowercase with underscores.
            </p>
          </div>
        </div>

        <SettingsRow label="Add to Inventory" hint="Auto-add expenses to inventory tracking">
          <div className="py-1">
            <Switch id="add-to-inventory" checked={expenseAddToInventory} onCheckedChange={setExpenseAddToInventory} />
          </div>
        </SettingsRow>
      </CollapsibleCard>


    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DATA & SECURITY TAB
// ═══════════════════════════════════════════════════════════════════════

// ─── Data entity definitions for export/import ─────────────────────

interface DataEntity {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tables: string[];
  color: string;
}

const DATA_ENTITIES: DataEntity[] = [
  { key: "orders", label: "Orders", icon: ShoppingCart, color: "text-primary", tables: ["orders", "order_items", "order_status_history"] },
  { key: "products", label: "Products", icon: Package, color: "text-warning", tables: ["products", "price_snapshots"] },
  { key: "inventory", label: "Inventory", icon: Boxes, color: "text-info", tables: ["inventory_items", "inventory_transactions"] },
  { key: "expenses", label: "Expenses", icon: ReceiptText, color: "text-destructive", tables: ["expenses"] },
  { key: "customers", label: "Customers", icon: Users, color: "text-success", tables: ["customers"] },
  { key: "quotations", label: "Quotations", icon: FileText, color: "text-primary/70", tables: ["quotations", "quotation_items"] },
  { key: "deliveries", label: "Deliveries", icon: Truck, color: "text-info", tables: ["deliveries"] },
  { key: "settings", label: "Settings", icon: Settings2, color: "text-muted-foreground", tables: ["business_settings"] },
];

const ALL_ENTITY_KEYS = DATA_ENTITIES.map((e) => e.key);

// ─── Entity Checkbox (extracted to prevent remounting) ────────────

function EntityCheckbox({
  entity,
  checked,
  onToggle,
}: {
  entity: { key: string; label: string; icon?: React.ComponentType<{ className?: string }>; color?: string };
  checked: boolean;
  onToggle: () => void;
}) {
  const Icon = entity.icon;
  return (
    <label
      className={cn(
        "relative flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 select-none",
        checked
          ? "border-primary/30 bg-primary/[0.04] shadow-sm"
          : "border-border/20 bg-transparent hover:border-border/50 hover:bg-muted/10",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="size-4 rounded-md border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-1"
      />
      {Icon && (
        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", checked ? "bg-primary/[0.08]" : "bg-muted/30")}>
          <Icon className={cn("size-4", entity.color || "text-muted-foreground/60")} />
        </div>
      )}
      <span className="text-sm font-medium text-foreground">{entity.label}</span>
      <div className="ml-auto">
        {checked && (
          <div className="flex size-5 items-center justify-center rounded-full bg-primary">
            <CheckIcon className="size-3 text-primary-foreground" />
          </div>
        )}
      </div>
    </label>
  );
}

// ─── Data Security Settings ──────────────────────────────────────

function DataSecuritySettings() {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedExport, setSelectedExport] = useState<Set<string>>(new Set(ALL_ENTITY_KEYS));
  const [selectedImport, setSelectedImport] = useState<Set<string>>(new Set(ALL_ENTITY_KEYS));
  
  const [resetting, setResetting] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const allSelected = (set: Set<string>) => set.size === ALL_ENTITY_KEYS.length;

  const toggle = useCallback(
    (key: string, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
      setter((prev) => {
        const next = new Set(prev);
        if (key === "all") {
          return next.size === ALL_ENTITY_KEYS.length ? new Set() : new Set(ALL_ENTITY_KEYS);
        }
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [],
  );

  // ── Entity selection grid (shared for both dialogs) ──────────
  const EntitySelectionGrid = useCallback(
    ({
      selected,
      setSelected,
    }: {
      selected: Set<string>;
      setSelected: React.Dispatch<React.SetStateAction<Set<string>>>;
    }) => (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-2">
        <EntityCheckbox
          entity={{ key: "all", label: "All Data" }}
          checked={allSelected(selected)}
          onToggle={() => toggle("all", setSelected)}
        />
        {DATA_ENTITIES.map((entity) => (
          <EntityCheckbox
            key={entity.key}
            entity={entity}
            checked={selected.has(entity.key)}
            onToggle={() => toggle(entity.key, setSelected)}
          />
        ))}
      </div>
    ),
    [toggle],
  );

  // ── Export handler ───────────────────────────────────────────
  const handleExport = useCallback(async () => {
    if (selectedExport.size === 0) {
      toast.error("Select at least one entity to export");
      return;
    }
    setBackingUp(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { toast.error("Not authenticated"); return; }
      const { data: profile } = await supabase.from("profiles").select("business_id").eq("user_id", session.user.id).single();
      if (!profile?.business_id) { toast.error("No business found"); return; }

      const tables = DATA_ENTITIES
        .filter((e) => selectedExport.has(e.key))
        .flatMap((e) => e.tables);

      const backup: {
        exported_at: string;
        business_id: string;
        entities: string[];
        data: Record<string, unknown[]>;
      } = {
        exported_at: new Date().toISOString(),
        business_id: profile.business_id,
        entities: Array.from(selectedExport),
        data: {},
      };

      for (const table of tables) {
        const { data } = await supabase.from(table).select("*").eq("business_id", profile.business_id);
        backup.data[table] = (data as unknown[]) || [];
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${tables.length} table(s) successfully`);
      setExportDialogOpen(false);
    } catch (err) {
      toast.error("Export failed", { description: err instanceof Error ? err.message : "An error occurred." });
    } finally {
      setBackingUp(false);
    }
  }, [selectedExport]);

  // ── Import handler (triggers after file selection + entity choice) ──
  const [importFile, setImportFile] = useState<{
    file: File;
    text: string;
    backup: { business_id: string; data: Record<string, unknown[]> };
  } | null>(null);

  // Generated columns — these are computed by the database and must be excluded from INSERTs
  const GENERATED_COLUMNS: Record<string, string[]> = {
    products: ["profit_margin"],
    orders: ["balance_remaining", "total"],
    order_items: ["total_price"],
    quotations: ["grand_total"],
    quotation_items: ["total_price"],
    expenses: ["total_cost"],
  };

  // Tables that don't have an updated_at column in the schema
  const TABLES_WITHOUT_UPDATED_AT = new Set([
    "order_items",
    "order_status_history",
    "inventory_transactions",
    "quotation_items",
    "price_snapshots",
  ]);

  const handleImportAfterFile = useCallback(async () => {
    if (!importFile) return;
    if (selectedImport.size === 0) {
      toast.error("Select at least one entity to import");
      return;
    }
    setRestoring(true);
    try {
      const tables = DATA_ENTITIES
        .filter((e) => selectedImport.has(e.key))
        .flatMap((e) => e.tables);

      const available = tables.filter((t) => importFile.backup.data[t] !== undefined);
      if (available.length === 0) {
        toast.error("None of the selected entities have data in this backup");
        return;
      }

      const supabase = createClient();
      let restored = 0;

      for (const table of available) {
        const rows = importFile.backup.data[table] as Record<string, unknown>[];
        if (rows.length === 0) continue;

        const generatedCols = GENERATED_COLUMNS[table] ?? [];
        const hasUpdatedAt = !TABLES_WITHOUT_UPDATED_AT.has(table);

        const clean = rows.map((row) => {
          const record = row as Record<string, unknown>;
          const sanitized: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(record)) {
            if (key === "deleted_at") continue;
            if (generatedCols.includes(key)) continue;
            if (!hasUpdatedAt && key === "updated_at") continue;
            sanitized[key] = value;
          }
          if (hasUpdatedAt) {
            sanitized.updated_at = new Date().toISOString();
          }
          return sanitized;
        });

        for (let i = 0; i < clean.length; i += 50) {
          const batch = clean.slice(i, i + 50);
          // Use upsert for all tables to handle existing records gracefully
          const upsertOptions =
            table === "business_settings"
              ? { onConflict: "business_id, key" }
              : {};
          const { error } = await supabase
            .from(table)
            .upsert(batch, upsertOptions);
          if (error) {
            console.error(`Failed to insert into ${table}:`, error);
          } else {
            restored += batch.length;
          }
        }
      }

      toast.success(`Restored ${restored} record(s) from ${available.length} table(s)`);
      setImportDialogOpen(false);
      setImportFile(null);
    } catch (err) {
      toast.error("Import failed", {
        description: err instanceof Error ? err.message : "Invalid or corrupted backup file.",
      });
    } finally {
      setRestoring(false);
    }
  }, [importFile, selectedImport]);

  const handleChooseFile = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const backup = JSON.parse(text);
        if (!backup.data || !backup.business_id) {
          toast.error("Invalid backup file");
          return;
        }
        setImportFile({ file, text, backup });
        setImportDialogOpen(true);
      } catch {
        toast.error("Invalid backup file");
      }
    };
    input.click();
  }, []);

  // Exclude business_settings — preserve user preferences, courier credentials, etc.
  const RESET_TABLES = DATA_ENTITIES
    .filter((e) => e.key !== "settings")
    .flatMap((e) => e.tables)
    .reverse(); // Delete child tables first to avoid FK constraint violations

  const handleReset = useCallback(async () => {
    setResetting(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { toast.error("Not authenticated"); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("user_id", session.user.id)
        .single();
      if (!profile?.business_id) { toast.error("No business found"); return; }

      let deleted = 0;
      for (const table of RESET_TABLES) {
        const { data: deletedRows, error } = await supabase
          .from(table)
          .delete()
          .eq("business_id", profile.business_id)
          .select("id");
        if (error) {
          console.error(`Failed to delete from ${table}:`, error);
        } else {
          deleted += deletedRows?.length || 0;
        }
      }

      toast.success(
        `Reset complete. Deleted ${deleted} record(s) across ${RESET_TABLES.length} table(s).`,
      );
    } catch (err) {
      toast.error("Reset failed", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    } finally {
      setResetting(false);
      setResetConfirmOpen(false);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title="Reset All System Data?"
        description="This will permanently delete all orders, expenses, products, inventory items, customers, quotations, and delivery data for your business. Account and business profile information will be preserved. This action cannot be undone."
        confirmLabel="Yes, Reset Everything"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleReset}
        loading={resetting}
      />

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>
              Choose what to include in the backup file.
            </DialogDescription>
          </DialogHeader>

          <EntitySelectionGrid selected={selectedExport} setSelected={setSelectedExport} />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExportDialogOpen(false)}
              disabled={backingUp}
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleExport}
              disabled={backingUp || selectedExport.size === 0}
            >
              {backingUp ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              {backingUp
                ? "Exporting..."
                : selectedExport.size === ALL_ENTITY_KEYS.length
                  ? "Export All"
                  : `Export (${selectedExport.size})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>
              Choose what to restore from{" "}
              <strong>{importFile?.file.name || "the backup file"}</strong>.
            </DialogDescription>
          </DialogHeader>

          <EntitySelectionGrid selected={selectedImport} setSelected={setSelectedImport} />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportDialogOpen(false);
                setImportFile(null);
              }}
              disabled={restoring}
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleImportAfterFile}
              disabled={restoring || selectedImport.size === 0}
            >
              {restoring ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {restoring
                ? "Importing..."
                : selectedImport.size === ALL_ENTITY_KEYS.length
                  ? "Import All"
                  : `Import (${selectedImport.size})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Backup — simple card with two action buttons */}
      <CollapsibleCard icon={Download} title="Manual Backup & Restore" description="Export your business data as JSON or restore from a previous backup.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <motion.button
            type="button"
            onClick={() => {
              setSelectedExport(new Set(ALL_ENTITY_KEYS));
              setExportDialogOpen(true);
            }}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border/30 p-6 text-center transition-all duration-200 hover:border-primary/30 hover:bg-primary/[0.02] hover:shadow-sm"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/[0.08]">
              <Download className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Export Data</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                Download your data as a JSON file
              </p>
            </div>
          </motion.button>

          <motion.button
            type="button"
            onClick={handleChooseFile}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border/30 p-6 text-center transition-all duration-200 hover:border-primary/30 hover:bg-primary/[0.02] hover:shadow-sm"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-muted/30">
              <Upload className="size-5 text-muted-foreground/70" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Import Backup</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                Restore from a JSON backup file
              </p>
            </div>
          </motion.button>
        </div>
      </CollapsibleCard>

      {/* Cloud Backup */}
      <CollapsibleCard icon={Database} title="Cloud Backup & Restore" description="Automatically backup your data to the cloud." badge="Coming Soon">
        <div className="flex items-center gap-4 rounded-xl bg-muted/10 border border-border/10 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/30">
            <Database className="size-5 text-muted-foreground/40" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Automatic Cloud Backups
            </p>
            <p className="text-xs text-muted-foreground/60 mt-0.5 leading-relaxed">
              Scheduled backups will be available in a future update. Your data
              is always securely stored with Supabase.
            </p>
          </div>
        </div>
      </CollapsibleCard>

      {/* Danger Zone — Reset System Data */}
      <CollapsibleCard icon={AlertTriangle} title="Danger Zone" description="Irreversible actions that permanently delete data.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              Reset System Data
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1 leading-relaxed">
              Permanently delete all orders, expenses, products, inventory,
              and customer data. Account and business profile data will be
              preserved.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setResetConfirmOpen(true)}
            disabled={resetting}
            className="shrink-0"
          >
            {resetting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {resetting ? "Resetting..." : "Reset All Data"}
          </Button>
        </div>
        <div className="flex items-start gap-2 rounded-lg bg-destructive/[0.03] border border-destructive/10 px-3.5 py-2.5">
          <Shield className="size-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            Account and Business profile data will be preserved.
          </p>
        </div>
      </CollapsibleCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// COURIER TAB — Component imported from @/components/delivery/courier-settings
// ═══════════════════════════════════════════════════════════════════════
// TAB DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════

const TABS = [
  { value: "general", label: "General", icon: TabPalette, component: GeneralSettings },
  { value: "profile", label: "Profile", icon: UserCog, component: ProfileSettings },
  { value: "operational", label: "Operational", icon: SlidersHorizontal, component: OperationalSettings },
  { value: "courier", label: "Courier", icon: Truck, component: CourierSettings },
  { value: "data-security", label: "Data & Security", icon: Lock, component: DataSecuritySettings },
  { value: "whatsapp-templates", label: "WhatsApp Templates", icon: MessageCircle, component: WhatsAppTemplatesSettings },
] as const;

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Settings & Configuration"
        description={isMobile ? undefined : "Manage your account, business, preferences, and system settings."}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList variant="line" className="w-full justify-start flex-nowrap gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <TabsTrigger
                key={tab.value} value={tab.value}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 whitespace-nowrap text-sm font-medium transition-all duration-200",
                  isActive ? "text-foreground" : "text-muted-foreground/60 hover:text-foreground/80",
                )}
              >
                <Icon className={cn("size-4 transition-colors duration-200", isActive ? "text-primary" : "text-muted-foreground/40")} />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
        </div>

        <div className="mt-4 sm:mt-6">
          {TABS.map((tab) => {
            const Component = tab.component;
            return (
              <TabsContent key={tab.value} value={tab.value}>
                <motion.div key={tab.value} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                  <Component />
                </motion.div>
              </TabsContent>
            );
          })}
        </div>
      </Tabs>
    </div>
  );
}
