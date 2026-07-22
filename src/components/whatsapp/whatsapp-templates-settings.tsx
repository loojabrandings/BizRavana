"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-media-query";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Copy,
  FileText,
  Loader2,
  MessageCircle,
  MoreVertical,
  Plus,
  RotateCcw,
  Save,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  fetchAllTemplates,
  createTemplate,
  updateTemplate,
  setDefaultTemplate,
  deleteTemplate,
  duplicateTemplate,
  getUserBusinessId,
  getCurrentUserId,
  toDbContext,
  type MessageTemplate,
} from "@/lib/supabase/message-templates";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────

type TemplateContext = "order_table" | "order_preview" | "quotation_preview";

interface PlaceholderGroup {
  label: string;
  items: string[];
}

// ─── Constants ─────────────────────────────────────────────────────

const CONTEXTS: { value: TemplateContext; label: string; description: string }[] = [
  {
    value: "order_table",
    label: "Order Table",
    description: "Used by the WhatsApp icon in each Orders table row.",
  },
  {
    value: "order_preview",
    label: "Order Preview",
    description: "Used by the WhatsApp button on the Order Preview page.",
  },
  {
    value: "quotation_preview",
    label: "Quotation Preview",
    description: "Used by the WhatsApp button on the Quotation Preview page.",
  },
];

const PLACEHOLDER_GROUPS: Record<TemplateContext, PlaceholderGroup[]> = {
  order_table: [
    { label: "Customer", items: ["{{customer_name}}", "{{address}}", "{{whatsapp}}", "{{phone}}", "{{email}}", "{{nearest_city}}", "{{district}}"] },
    { label: "Order", items: ["{{order_number}}", "{{order_date}}", "{{order_status}}", "{{notes}}"] },
    { label: "Items", items: ["{{item_details}}", "{{total_quantity}}"] },
    { label: "Payment", items: ["{{subtotal}}", "{{discount}}", "{{delivery_charge}}", "{{grand_total}}", "{{advance_payment}}", "{{remaining_balance}}", "{{cod_amount}}", "{{payment_method}}", "{{payment_status}}"] },
    { label: "Delivery", items: ["{{scheduled_delivery_date}}", "{{tracking_number}}", "{{courier}}"] },
  ],
  order_preview: [
    { label: "Customer", items: ["{{customer_name}}", "{{address}}", "{{whatsapp}}", "{{phone}}", "{{email}}", "{{nearest_city}}", "{{district}}"] },
    { label: "Order", items: ["{{order_number}}", "{{order_date}}", "{{order_status}}", "{{notes}}"] },
    { label: "Items", items: ["{{item_details}}", "{{total_quantity}}"] },
    { label: "Payment", items: ["{{subtotal}}", "{{discount}}", "{{delivery_charge}}", "{{grand_total}}", "{{advance_payment}}", "{{remaining_balance}}", "{{cod_amount}}", "{{payment_method}}", "{{payment_status}}"] },
    { label: "Delivery", items: ["{{scheduled_delivery_date}}", "{{tracking_number}}", "{{courier}}"] },
  ],
  quotation_preview: [
    { label: "Customer", items: ["{{customer_name}}", "{{address}}", "{{whatsapp}}", "{{phone}}", "{{email}}", "{{nearest_city}}", "{{district}}"] },
    { label: "Quotation", items: ["{{quotation_number}}", "{{quotation_date}}", "{{expiry_date}}", "{{notes}}"] },
    { label: "Items", items: ["{{item_details}}", "{{total_quantity}}"] },
    { label: "Payment", items: ["{{subtotal}}", "{{discount}}", "{{delivery_charge}}", "{{grand_total}}"] },
  ],
};

const SAMPLE_DATA: Record<string, string> = {
  customer_name: "Kamal Perera",
  address: "123, Galle Road, Colombo 03",
  whatsapp: "0771234567",
  phone: "0771234567",
  email: "kamal@example.com",
  nearest_city: "Colombo",
  district: "Colombo",
  order_number: "ORD-2024-0042",
  order_date: "2024-12-15",
  order_status: "Confirmed",
  notes: "Handle with care — fragile items",
  item_details: "*Category: Plymount*\n\n1. 4 × 6\n   Qty: 5\n   Unit Price: Rs. 1,000\n   Total: Rs. 5,000\n   Item Note: Happy Birthday Nangi\n\n2. 8 × 12\n   Qty: 1\n   Unit Price: Rs. 1,800\n   Total: Rs. 1,800\n\n*Category: Frames*\n\n3. 12 × 18 Frame\n   Qty: 1\n   Unit Price: Rs. 3,500\n   Total: Rs. 3,500\n   Item Note: Black frame",
  total_quantity: "7",
  subtotal: "Rs. 10,300",
  discount: "Rs. 500",
  delivery_charge: "Rs. 800",
  grand_total: "Rs. 10,600",
  advance_payment: "Rs. 3,000",
  remaining_balance: "Rs. 7,600",
  cod_amount: "Rs. 10,600",
  payment_method: "Cash on Delivery",
  payment_status: "Pending",
  scheduled_delivery_date: "2024-12-20",
  tracking_number: "LK-987-654-321",
  courier: "DHL Express",
  quotation_number: "QTN-2024-0089",
  quotation_date: "2024-12-14",
  expiry_date: "2025-01-14",
};

// ─── All known placeholder names flattened from the groups above ─────
const ALL_KNOWN_PLACEHOLDERS = new Set(
  Object.values(PLACEHOLDER_GROUPS).flatMap((groups) =>
    groups.flatMap((g) => g.items.map((ph) => ph.replace(/\{\{|\}\}/g, "")))
  )
);

// ─── Helpers ───────────────────────────────────────────────────────

function formatWhatsAppPreview(text: string): string {
  if (!text) return "";
  let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  html = html.replace(/\*([^*]+)\*/g, "<strong>$1</strong>");
  html = html.replace(/_([^_]+)_/g, "<em>$1</em>");
  html = html.replace(/~([^~]+)~/g, "<del>$1</del>");
  html = html.replace(/`{3}[\s\S]*?`{3}/g, "<code>$&</code>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\n/g, "<br />");
  return html;
}

function renderSamplePreview(content: string, dateFormat?: string): string {
  if (!content) return "";
  let result = content;
  for (const [key, value] of Object.entries(SAMPLE_DATA)) {
    // Apply date formatting to date fields
    let displayValue = value;
    if (dateFormat && ["order_date", "scheduled_delivery_date", "quotation_date", "expiry_date"].includes(key)) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const shortYear = String(year).slice(-2);
        switch (dateFormat) {
          case "YYYY-MM-DD": displayValue = `${year}-${month}-${day}`; break;
          case "DD-MM-YYYY": displayValue = `${day}-${month}-${year}`; break;
          case "YY-MM-DD": displayValue = `${shortYear}-${month}-${day}`; break;
          case "DD-MM-YY": displayValue = `${day}-${month}-${shortYear}`; break;
          // Legacy formats
          case "DD/MM/YYYY": displayValue = `${day}/${month}/${year}`; break;
          case "MM/DD/YYYY": displayValue = `${month}/${day}/${year}`; break;
          case "MM-DD-YYYY": displayValue = `${month}-${day}-${year}`; break;
        }
      }
    }
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), displayValue);
  }
  return result;
}

// ─── Placeholder Validation ───────────────────────────────────────

interface PlaceholderWarning {
  type: "unknown" | "malformed" | "unsupported";
  message: string;
}

/**
 * Validate placeholder usage in the template content.
 * Returns a list of warnings (non-blocking).
 */
function validatePlaceholders(content: string): PlaceholderWarning[] {
  const warnings: PlaceholderWarning[] = [];
  if (!content) return warnings;

  // 1. Check for well-formed {{...}} placeholders and see if they're known
  const wellFormedRegex = /\{\{([a-zA-Z_]+)\}\}/g;
  let match: RegExpExecArray | null;
  while ((match = wellFormedRegex.exec(content)) !== null) {
    const name = match[1];
    if (!ALL_KNOWN_PLACEHOLDERS.has(name)) {
      warnings.push({
        type: "unknown",
        message: `Unknown placeholder: {{${name}}}. It will appear as-is in the message.`,
      });
    }
  }

  // 2. Check for malformed placeholders
  // Missing closing braces: {{customer_name}
  const missingCloseRegex = /\{\{[a-zA-Z_]+\}(?!})/g;
  while ((match = missingCloseRegex.exec(content)) !== null) {
    warnings.push({
      type: "malformed",
      message: `Malformed placeholder: "${match[0]}" is missing a closing brace.`,
    });
  }

  // Missing opening braces: {customer_name}}
  const missingOpenRegex = /(?<!\{)\{[a-zA-Z_]+\}\}/g;
  while ((match = missingOpenRegex.exec(content)) !== null) {
    warnings.push({
      type: "malformed",
      message: `Malformed placeholder: "${match[0]}" is missing an opening brace.`,
    });
  }

  // Spaces inside braces: {{ customer_name }}
  const spacedRegex = /\{\{\s+[a-zA-Z_]+\s+\}\}/g;
  while ((match = spacedRegex.exec(content)) !== null) {
    warnings.push({
      type: "malformed",
      message: `Malformed placeholder: "${match[0]}" has spaces inside braces. Use {{${match[0].replace(/[{} ]/g, "")}}} instead.`,
    });
  }

  // Hyphenated content: {{customer-name}}
  const hyphenatedRegex = /\{\{[a-zA-Z_]+-[a-zA-Z_]+\}\}/g;
  while ((match = hyphenatedRegex.exec(content)) !== null) {
    warnings.push({
      type: "malformed",
      message: `Malformed placeholder: "${match[0]}" uses hyphens. Use underscores instead.`,
    });
  }

  // 3. Check for unsupported formatting (triple backticks which won't render in WhatsApp)
  const tripleCodeRegex = /```[\s\S]*?```/g;
  while ((match = tripleCodeRegex.exec(content)) !== null) {
    warnings.push({
      type: "unsupported",
      message: `Triple backticks (\`\`\`) are not supported in WhatsApp messages. Use single backticks for monospace instead.`,
    });
  }

  return warnings;
}

function dbToUiTemplate(db: MessageTemplate): SavedTemplate {
  return {
    id: db.id,
    title: db.title,
    content: db.content,
    isDefault: db.is_default,
    updatedAt: db.updated_at,
    context: db.template_context.replace("_whatsapp", "") as TemplateContext,
  };
}

// ─── Sub-types ─────────────────────────────────────────────────────

interface SavedTemplate {
  id: string;
  title: string;
  content: string;
  isDefault: boolean;
  updatedAt: string;
  context: TemplateContext;
}

// ═══════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function ContextPill({
  context,
  active,
  count,
  onClick,
}: {
  context: (typeof CONTEXTS)[number];
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg border px-3.5 py-2 text-left transition-all duration-200",
        active
          ? "border-primary/25 bg-primary/[0.05] shadow-sm"
          : "border-border/30 hover:border-border/50 hover:bg-muted/10",
      )}
    >
      <span className={cn("text-xs font-semibold", active ? "text-foreground" : "text-muted-foreground/80")}>
        {context.label}
      </span>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-nano font-semibold tabular-nums",
          active ? "bg-primary/10 text-primary" : "bg-muted/60 text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function TemplateListItem({
  template,
  isSelected,
  onSelect,
  onDuplicate,
  onSetDefault,
  onRename,
  onDelete,
}: {
  template: SavedTemplate;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onSetDefault: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  // Format relative time
  const formattedDate = useMemo(() => {
    if (!template.updatedAt) return "";
    const d = new Date(template.updatedAt);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, [template.updatedAt]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex w-full cursor-pointer items-center rounded-lg border px-3 py-2.5 text-left transition-all duration-150",
        isSelected
          ? "border-primary/30 bg-primary/[0.04] shadow-sm"
          : "border-border/20 hover:border-border/40 hover:bg-muted/10",
      )}
    >
      {isSelected && (
        <motion.div
          layoutId="template-selected-sidebar"
          className="absolute inset-0 rounded-lg ring-1 ring-primary/15"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <div className="relative z-10 flex w-full items-center gap-2 min-w-0">
        {/* Left: Selection indicator dot */}
        <div
          className={cn(
            "size-1.5 shrink-0 rounded-full transition-all duration-200",
            isSelected ? "bg-primary scale-110" : "bg-border/40 group-hover:bg-border/60",
          )}
        />

        {/* Center: Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "text-xs font-medium truncate",
                isSelected ? "text-foreground" : "text-foreground/70 group-hover:text-foreground/90",
              )}
            >
              {template.title}
            </span>
            {template.isDefault && (
              <span className="shrink-0 inline-flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-micro font-semibold text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
                <Star className="size-2 fill-amber-500/30" />
                Default
              </span>
            )}
          </div>
          {formattedDate && (
            <p className="text-nano text-muted-foreground/30 mt-0.5 truncate">
              Updated {formattedDate}
            </p>
          )}
        </div>

        {/* Right: 3-dots action menu (always visible) */}
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full transition-all duration-150",
              isSelected
                ? "text-foreground/50 hover:bg-primary/10 hover:text-primary"
                : "text-foreground/40 hover:bg-muted/30 hover:text-foreground",
            )}
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[130px] p-1">
            <DropdownMenuItem className="rounded-md text-xxs gap-1.5 py-1" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
              <Copy className="size-3" /> Duplicate
            </DropdownMenuItem>
            {!template.isDefault && (
              <DropdownMenuItem className="rounded-md text-xxs gap-1.5 py-1" onClick={(e) => { e.stopPropagation(); onSetDefault(); }}>
                <Star className="size-3" /> Set as Default
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="rounded-md text-xxs gap-1.5 py-1" onClick={(e) => { e.stopPropagation(); onRename(); }}>
              <FileText className="size-3" /> Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-md text-xxs gap-1.5 py-1 text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
              <Trash2 className="size-3" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function PlaceholderChips({
  groups,
  onInsert,
}: {
  groups: PlaceholderGroup[];
  onInsert: (placeholder: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = searchQuery.trim()
    ? groups
        .map((g) => ({ ...g, items: g.items.filter((ph) => ph.toLowerCase().includes(searchQuery.toLowerCase())) }))
        .filter((g) => g.items.length > 0)
    : groups;

  const totalPlaceholders = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="flex flex-1 flex-col gap-3 min-h-0">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground/50">
            Placeholders
          </span>
          <span className="inline-flex items-center justify-center rounded-full bg-muted/40 px-1.5 py-0.5 text-nano font-medium text-muted-foreground/50 tabular-nums">
            {totalPlaceholders}
          </span>
        </div>
      </div>

      {/* ── Search ─────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 size-2.5 -translate-y-1/2 text-muted-foreground/30" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter placeholders..."
          className="w-full h-8 rounded-md border border-border/20 bg-muted/10 pl-6 pr-6 text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 focus:bg-primary/[0.02] transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-foreground transition-colors"
          >
            <X className="size-2.5" />
          </button>
        )}
      </div>

      {/* ── Groups ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 scrollbar-thin">
        {filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex size-7 items-center justify-center rounded-full bg-muted/20">
              <Search className="size-3 text-muted-foreground/25" />
            </div>
            <p className="mt-2 text-xxs text-muted-foreground/40 font-medium">No placeholders match</p>
            {searchQuery && (
              <p className="text-nano text-muted-foreground/30 mt-0.5">Try a different search term</p>
            )}
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xxs font-semibold uppercase tracking-widest text-muted-foreground/35">
                  {group.label}
                </span>
                <span className="text-xxs text-muted-foreground/20 tabular-nums">{group.items.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map((ph) => (
                  <button
                    key={ph}
                    type="button"
                    title={`Click to insert ${ph}`}
                    onClick={() => onInsert(ph)}
                    className="group/chip inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-muted/20 px-2.5 py-1 text-xs font-mono leading-relaxed text-muted-foreground/60 transition-all hover:bg-primary/5 hover:text-primary border border-transparent hover:border-primary/20"
                  >
                    {ph.replace(/\{\{|\}\}/g, "")}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function WhatsAppPreview({
  title,
  rawContent,
  renderedContent,
  contextLabel,
  hasUnsaved,
}: {
  title: string;
  rawContent: string;
  renderedContent: string;
  contextLabel: string;
  hasUnsaved: boolean;
}) {
  const formatted = formatWhatsAppPreview(renderedContent);

  return (
    <div className="flex h-full flex-col rounded-xl border border-border/30 bg-gradient-to-b from-background to-muted/5 overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/20 px-4 py-3 bg-muted/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <MessageCircle className="size-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold truncate text-foreground">{title || "WhatsApp Preview"}</span>
              {hasUnsaved && (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-warning/10 px-1.5 py-0.5 text-micro font-semibold text-warning ring-1 ring-warning/20">
                  <AlertTriangle className="size-2" />
                  Unsaved
                </span>
              )}
            </div>
            <p className="text-xxs text-muted-foreground/50 truncate">{contextLabel}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {!rawContent.trim() ? (
          <div className="flex h-full flex-col items-center justify-center text-center px-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted/20 border border-border/10">
              <MessageCircle className="size-4 text-muted-foreground/25" />
            </div>
            <p className="mt-3 text-xs font-medium text-muted-foreground/50">Preview will appear here</p>
            <p className="mt-1 text-xxs text-muted-foreground/30">Type in the editor to see a live preview</p>
          </div>
        ) : (
          <div className="mx-auto max-w-[320px] space-y-1.5">
            <div className="text-center text-micro text-muted-foreground/30 font-medium tracking-wider uppercase">Today</div>
            <div className="rounded-2xl bg-gradient-to-b from-primary/[0.06] to-primary/[0.02] px-4 py-3 shadow-sm border border-primary/[0.08]">
              <div
                className="text-xs leading-relaxed text-foreground/90 [&_strong]:font-semibold [&_em]:italic [&_del]:line-through whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{ __html: formatted }}
              />
            </div>
            <div className="flex justify-end pr-1">
              <span className="text-micro text-muted-foreground/30">{rawContent.length} chars · 12:30 PM</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export function WhatsAppTemplatesSettings() {
  const isMobile = useIsMobile();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeContext, setActiveContext] = useState<TemplateContext>("order_preview");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isNewTemplate, setIsNewTemplate] = useState(false);
  const [mobilePlaceholderSearch, setMobilePlaceholderSearch] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [dateFormat, setDateFormat] = useState<string>("YYYY-MM-DD");

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Rename dialog
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameTemplateId, setRenameTemplateId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const lastSavedRef = useRef({ title: editTitle, content: editContent });

  useEffect(() => {
    setHasUnsavedChanges(editTitle !== lastSavedRef.current.title || editContent !== lastSavedRef.current.content);
  }, [editTitle, editContent]);

  // ── Load user / business / preferences on mount ──────────────────
  useEffect(() => {
    (async () => {
      try {
        const [bid, uid] = await Promise.all([getUserBusinessId(), getCurrentUserId()]);
        setBusinessId(bid);
        setUserId(uid);
      } catch (err) {
        console.error("Failed to load user context:", err);
        toast.error("Failed to load your profile.");
      }
    })();
    // Load date format from preferences store
    import("@/stores/preferences-store").then(({ usePreferences }) => {
      setDateFormat(usePreferences.getState().dateFormat);
    });
  }, []);

  // ── Load ALL templates when businessId changes ────────────────
  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const data = await fetchAllTemplates(businessId);
        setTemplates(data);
        setSelectedTemplateId(null);
        setEditTitle("");
        setEditContent("");
        lastSavedRef.current = { title: "", content: "" };
        setHasUnsavedChanges(false);
        setIsNewTemplate(false);
      } catch (err) {
        console.error("Failed to load templates:", err);
        toast.error("Failed to load templates.");
      } finally {
        setLoading(false);
      }
    })();
  }, [businessId]);

  // ── Derived data ───────────────────────────────────────────────
  // Filter the full template list by the active context
  const dbContext = toDbContext(activeContext);
  const templatesForCurrentContext = templates.filter(
    (t) => t.template_context === dbContext
  );
  const templatesForContext = templatesForCurrentContext.map(dbToUiTemplate);
  const selectedTemplate = templatesForContext.find((t) => t.id === selectedTemplateId) ?? null;
  const groups = PLACEHOLDER_GROUPS[activeContext];
  const contextInfo = CONTEXTS.find((c) => c.value === activeContext)!;

  // ── Reload all templates from DB ────────────────────────────
  // Using refs to avoid stale closure issues in callbacks
  const businessIdRef = useRef(businessId);
  const activeContextRef = useRef(activeContext);
  businessIdRef.current = businessId;
  activeContextRef.current = activeContext;

  const reloadTemplates = useCallback(async () => {
    const bid = businessIdRef.current;
    if (!bid) { console.log("reloadTemplates: no businessId"); return; }
    try {
      console.log("reloadTemplates: fetching all for", bid);
      const data = await fetchAllTemplates(bid);
      console.log("reloadTemplates: got", data.length, "templates total");
      setTemplates(data);
    } catch (err) {
      console.error("reloadTemplates error:", err);
    }
  }, []); // stable: reads from refs

  // ── Placeholder warnings ────────────────────────────────────────
  const placeholderWarnings = useMemo(() => validatePlaceholders(editContent), [editContent]);

  // ── Insert placeholder at cursor ──────────────────────────────
  const insertPlaceholder = useCallback(
    (placeholder: string) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        setEditContent((prev) => prev + placeholder);
        return;
      }
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = editContent.slice(0, start) + placeholder + editContent.slice(end);
      setEditContent(newContent);
      requestAnimationFrame(() => {
        textarea.focus();
        const cursorPos = start + placeholder.length;
        textarea.setSelectionRange(cursorPos, cursorPos);
      });
    },
    [editContent],
  );

  // ── Duplicate title check ──────────────────────────────────────
  const hasDuplicateTitle = useCallback(
    (title: string, excludeId?: string | null): boolean => {
      const normalized = title.trim().toLowerCase();
      return templatesForContext.some(
        (t) => t.title.toLowerCase() === normalized && t.id !== excludeId
      );
    },
    [templatesForContext],
  );

  // ── Save / Create ─────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    const bid = businessIdRef.current;
    const ctx = activeContextRef.current;
    console.log("handleSave called", { bid, ctx, isNewTemplate, editTitle, editContent });

    if (!bid) { toast.error("No business found."); return; }
    const title = editTitle.trim();
    const content = editContent;
    if (!title || !content) { toast.error("Title and content are required."); return; }
    if (title.length < 2) { toast.error("Title must be at least 2 characters."); return; }

    // Client-side duplicate title check
    if (hasDuplicateTitle(title, isNewTemplate ? null : selectedTemplateId)) {
      toast.error("A template with this title already exists in this context.");
      return;
    }

    setSaving(true);
    try {
      const dbContext = toDbContext(ctx);
      console.log("handleSave: about to save", { businessId: bid, context: dbContext, title, content });
      if (selectedTemplateId && !isNewTemplate) {
        await updateTemplate(selectedTemplateId, title, content, userId);
        console.log("handleSave: updated", selectedTemplateId);
        toast.success("Template saved successfully!");
      } else {
        const result = await createTemplate(bid, dbContext, title, content, userId);
        console.log("handleSave: created", result.id);
        toast.success("Template created successfully!");
        setSelectedTemplateId(result.id);
      }
      lastSavedRef.current = { title, content };
      setHasUnsavedChanges(false);
      setIsNewTemplate(false);
      await reloadTemplates();
    } catch (err) {
      console.error("handleSave error:", err);
      toast.error("Failed to save template", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    } finally {
      setSaving(false);
    }
  }, [editTitle, editContent, isNewTemplate, selectedTemplateId, userId, hasDuplicateTitle]); // stable: reads businessId/activeContext from refs

  // ── Reset to last saved ──────────────────────────────────────
  const handleReset = useCallback(() => {
    setEditTitle(lastSavedRef.current.title);
    setEditContent(lastSavedRef.current.content);
  }, []);

  // ── Select template ──────────────────────────────────────────
  const selectTemplate = useCallback((tpl: SavedTemplate) => {
    setSelectedTemplateId(tpl.id);
    setEditTitle(tpl.title);
    setEditContent(tpl.content);
    lastSavedRef.current = { title: tpl.title, content: tpl.content };
    setHasUnsavedChanges(false);
    setIsNewTemplate(false);
  }, []);

  // ── New template ─────────────────────────────────────────────
  const startNewTemplate = useCallback(() => {
    setIsNewTemplate(true);
    setSelectedTemplateId(null);
    setEditTitle("");
    setEditContent("");
    lastSavedRef.current = { title: "", content: "" };
    setHasUnsavedChanges(false);
    requestAnimationFrame(() => titleInputRef.current?.focus());
  }, []);

  // ── Delete template (opens confirmation dialog) ────────────────
  const handleDelete = useCallback((id: string) => {
    setPendingDeleteId(id);
    setDeleteConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    const id = pendingDeleteId;
    if (!id || !businessId) return;
    setDeleteConfirmOpen(false);
    setPendingDeleteId(null);
    try {
      await deleteTemplate(id, userId);
      toast.success("Template deleted.");
      if (selectedTemplateId === id) {
        setSelectedTemplateId(null);
        setEditTitle("");
        setEditContent("");
        lastSavedRef.current = { title: "", content: "" };
        setHasUnsavedChanges(false);
      }
      await reloadTemplates();
    } catch (err) {
      toast.error("Failed to delete template", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    }
  }, [pendingDeleteId, businessId, userId, selectedTemplateId, reloadTemplates]);

  // ── Set as default ───────────────────────────────────────────
  const handleSetDefault = useCallback(async (id: string) => {
    if (!businessId) return;
    try {
      const dbContext = toDbContext(activeContext);
      await setDefaultTemplate(id, businessId, dbContext, userId);
      toast.success("Default template updated.");
      await reloadTemplates();
    } catch (err) {
      toast.error("Failed to set default template", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    }
  }, [businessId, userId, activeContext, reloadTemplates]);

  // ── Duplicate template ───────────────────────────────────────
  const handleDuplicate = useCallback(async (tpl: SavedTemplate) => {
    if (!businessId) return;
    try {
      const dbTemplate = templates.find((t) => t.id === tpl.id);
      if (!dbTemplate) return;
      await duplicateTemplate(dbTemplate, userId);
      toast.success("Template duplicated.");
      await reloadTemplates();
    } catch (err) {
      toast.error("Failed to duplicate template", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    }
  }, [businessId, userId, templates, reloadTemplates]);

  // ── Rename template ────────────────────────────────────────────
  const handleRenameClick = useCallback((tpl: SavedTemplate) => {
    setRenameTemplateId(tpl.id);
    setRenameTitle(tpl.title);
    setRenameDialogOpen(true);
    requestAnimationFrame(() => renameInputRef.current?.focus());
  }, []);

  const confirmRename = useCallback(async () => {
    const id = renameTemplateId;
    const newTitle = renameTitle.trim();
    if (!id || !newTitle || newTitle.length < 2) {
      toast.error("Title must be at least 2 characters.");
      return;
    }
    if (hasDuplicateTitle(newTitle, id)) {
      toast.error("A template with this title already exists in this context.");
      return;
    }
    setRenameDialogOpen(false);
    try {
      // Update just the title — keep content unchanged
      const template = templates.find((t) => t.id === id);
      if (!template) return;
      await updateTemplate(id, newTitle, template.content, userId);
      toast.success("Template renamed.");
      // Update the editor if the renamed template is currently selected
      if (selectedTemplateId === id) {
        setEditTitle(newTitle);
        lastSavedRef.current = { ...lastSavedRef.current, title: newTitle };
      }
      await reloadTemplates();
    } catch (err) {
      toast.error("Failed to rename template", {
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    }
  }, [renameTemplateId, renameTitle, hasDuplicateTitle, templates, userId, selectedTemplateId, reloadTemplates]);

  // ── Switch context ───────────────────────────────────────────
  const switchContext = useCallback((ctx: TemplateContext) => {
    setActiveContext(ctx);
  }, []);

  // ── Loading state ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-6 animate-spin text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground/60">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ═══ Context Pills (same on all screens) ═══════════════════ */}
      <div className="flex flex-wrap gap-2">
        {CONTEXTS.map((ctx) => (
          <ContextPill
            key={ctx.value}
            context={ctx}
            active={activeContext === ctx.value}
            count={templates.filter((t) => t.template_context === toDbContext(ctx.value)).length}
            onClick={() => switchContext(ctx.value)}
          />
        ))}
      </div>

      {/* ═══ Mobile Layout ══════════════════════════════════════════ */}
      {isMobile ? (
        <div className="flex flex-col gap-4">
          {/* ── Saved Templates ── */}
          <div className="rounded-xl border border-border/30 bg-card/50 overflow-hidden">
            <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="size-3 text-muted-foreground/40" />
                <span className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground/50">Saved Templates</span>
              </div>
              <span className="inline-flex items-center justify-center rounded-full bg-muted/50 px-2 py-0.5 text-nano font-medium text-muted-foreground/50 tabular-nums ring-1 ring-border/10">
                {templatesForContext.length}
              </span>
            </div>
            <div className="space-y-px px-2.5 pb-2.5">
              {templatesForContext.length === 0 && !isNewTemplate ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted/30 border border-border/10">
                    <FileText className="size-3 text-muted-foreground/30" />
                  </div>
                  <p className="mt-2 text-xxs text-muted-foreground/40">No templates yet</p>
                  <Button variant="ghost" size="xs" onClick={startNewTemplate} className="mt-2 gap-1 h-6 text-xxs rounded-md">
                    <Plus className="size-2.5" /> Create your first template
                  </Button>
                </div>
              ) : (
                <>
                  {templatesForContext.map((tpl) => (
                    <TemplateListItem
                      key={tpl.id}
                      template={tpl}
                      isSelected={tpl.id === selectedTemplateId}
                      onSelect={() => selectTemplate(tpl)}
                      onDuplicate={() => handleDuplicate(tpl)}
                      onSetDefault={() => handleSetDefault(tpl.id)}
                      onRename={() => handleRenameClick(tpl)}
                      onDelete={() => handleDelete(tpl.id)}
                    />
                  ))}
                  {!isNewTemplate && (
                    <button
                      type="button"
                      onClick={startNewTemplate}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/20 py-2.5 text-xxs text-muted-foreground/40 transition-all hover:border-primary/30 hover:bg-primary/[0.02] hover:text-primary/60 mt-1"
                    >
                      <Plus className="size-3" />
                      <span>New Template</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Editor + Preview ── */}
          <div className="flex flex-col rounded-xl border border-border/30 bg-card/50 overflow-hidden">
            {/* Title */}
            <div className="border-b border-border/20 px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xxs font-semibold uppercase tracking-wider text-foreground/60">
                  Template Title <span className="text-destructive">*</span>
                </label>
                {editTitle.length > 60 && (
                  <span className={cn("text-nano tabular-nums", editTitle.length > 75 ? "text-destructive/70" : "text-muted-foreground/40")}>
                    {editTitle.length}/80
                  </span>
                )}
              </div>
              <Input
                ref={titleInputRef}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Example: Order Confirmation"
                className="h-9 text-sm font-medium"
                maxLength={80}
              />
            </div>

            {/* Compact Placeholder Chips Bar with Filter */}
            <div className="border-b border-border/10 px-4 py-2 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-nano font-semibold uppercase tracking-wider text-muted-foreground/40">Placeholders</span>
                  <span className="inline-flex items-center justify-center rounded-full bg-muted/30 px-1.5 py-0.5 text-micro font-medium text-muted-foreground/40">
                    {groups.reduce((sum, g) => sum + g.items.length, 0)}
                  </span>
                </div>
              </div>
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 size-2.5 -translate-y-1/2 text-muted-foreground/30" />
                <input
                  value={mobilePlaceholderSearch}
                  onChange={(e) => setMobilePlaceholderSearch(e.target.value)}
                  placeholder="Filter placeholders..."
                  className="w-full h-7 rounded-md border border-border/20 bg-muted/10 pl-6 pr-6 text-xxs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/30 focus:bg-primary/[0.02] transition-colors"
                />
                {mobilePlaceholderSearch && (
                  <button
                    type="button"
                    onClick={() => setMobilePlaceholderSearch("")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-foreground transition-colors"
                  >
                    <X className="size-2.5" />
                  </button>
                )}
              </div>
              {/* Filtered chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {groups
                  .flatMap((g) => g.items)
                  .filter((ph) =>
                    mobilePlaceholderSearch
                      ? ph.toLowerCase().includes(mobilePlaceholderSearch.toLowerCase())
                      : true
                  )
                  .map((ph) => (
                    <button
                      key={ph}
                      type="button"
                      onClick={() => insertPlaceholder(ph)}
                      className="shrink-0 inline-flex items-center rounded-lg bg-muted/20 px-2 py-1 text-xxs font-mono text-muted-foreground/60 whitespace-nowrap border border-transparent hover:border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                    >
                      {ph.replace(/\{\{|\}\}/g, "")}
                    </button>
                  ))}
              </div>
            </div>

            {/* Message Content */}
            <div className="flex flex-col px-4 py-3 gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xxs font-semibold uppercase tracking-wider text-foreground/60">
                  Message Content <span className="text-destructive">*</span>
                </label>
                <span className="text-nano text-muted-foreground/35 tabular-nums">{editContent.length} chars</span>
              </div>
              <Textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Type your message here... Use {{placeholders}} to insert dynamic content."
                className="min-h-[180px] resize-y font-mono text-xs leading-relaxed"
              />

              {/* Placeholder Warnings */}
              {placeholderWarnings.length > 0 && (
                <div className="space-y-1">
                  {placeholderWarnings.slice(0, 2).map((w, i) => (
                    <div key={i} className={cn("flex items-start gap-1.5 rounded-md px-2.5 py-1.5", w.type === "unknown" && "bg-info/5 text-info/70", w.type === "malformed" && "bg-warning/5 text-warning/70", w.type === "unsupported" && "bg-destructive/5 text-destructive/70")}>
                      <AlertTriangle className="size-2.5 shrink-0 mt-0.5" />
                      <span className="text-xxs leading-relaxed">{w.message}</span>
                    </div>
                  ))}
                  {placeholderWarnings.length > 2 && (
                    <p className="text-xxs text-muted-foreground/30 pl-1">+{placeholderWarnings.length - 2} more</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-border/20 px-4 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {selectedTemplate && (
                    <>
                      <Button variant="ghost" size="xs" onClick={() => handleDelete(selectedTemplate.id)} className="text-destructive/50 hover:text-destructive gap-1 h-7 text-xxs">
                        <Trash2 className="size-2.5" /> Delete
                      </Button>
                      {!selectedTemplate.isDefault && (
                        <Button variant="ghost" size="xs" onClick={() => handleSetDefault(selectedTemplate.id)} className="gap-1 h-7 text-muted-foreground/50 text-xxs">
                          <Star className="size-2.5" /> Default
                        </Button>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {hasUnsavedChanges && lastSavedRef.current.title && (
                    <Button variant="ghost" size="xs" onClick={handleReset} className="gap-1 h-7 text-muted-foreground/50 text-xxs">
                      <RotateCcw className="size-2.5" /> Reset
                    </Button>
                  )}
                  <Button variant="gradient" size="sm" disabled={!editTitle.trim() || !editContent.trim() || saving} onClick={handleSave} className="gap-1.5 h-8 text-xs">
                    {saving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
                    {saving ? "Saving..." : isNewTemplate ? "Create" : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Live Preview ── */}
          <div className="min-h-[200px]">
            <WhatsAppPreview
              title={editTitle || "WhatsApp Preview"}
              rawContent={editContent}
              renderedContent={renderSamplePreview(editContent, dateFormat)}
              contextLabel={`via ${contextInfo.label}`}
              hasUnsaved={hasUnsavedChanges}
            />
          </div>
        </div>
      ) : (
        /* ═══ Desktop Three-Column Layout ═════════════════════════════ */
        <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 2fr 2fr", minHeight: "calc(100vh - 260px)" }}>
          {/* ─── LEFT COLUMN: Template List + Placeholders ─────────── */}
          <div className="min-w-0 flex flex-col gap-3">
            <div className="rounded-xl border border-border/30 bg-card/50 p-0 overflow-hidden">
              <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="size-3 text-muted-foreground/40" />
                  <span className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground/50">Saved Templates</span>
                </div>
                <span className="inline-flex items-center justify-center rounded-full bg-muted/50 px-2 py-0.5 text-nano font-medium text-muted-foreground/50 tabular-nums ring-1 ring-border/10">
                  {templatesForContext.length}
                </span>
              </div>
              <div className="space-y-px px-2.5 pb-2.5">
                {templatesForContext.length === 0 && !isNewTemplate ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="flex size-8 items-center justify-center rounded-full bg-muted/30 border border-border/10">
                      <FileText className="size-3 text-muted-foreground/30" />
                    </div>
                    <p className="mt-2 text-xxs text-muted-foreground/40">No templates yet</p>
                    <Button variant="ghost" size="xs" onClick={startNewTemplate} className="mt-2 gap-1 h-6 text-xxs rounded-md">
                      <Plus className="size-2.5" /> Create your first template
                    </Button>
                  </div>
                ) : (
                  <>
                    {templatesForContext.map((tpl) => (
                      <TemplateListItem
                        key={tpl.id}
                        template={tpl}
                        isSelected={tpl.id === selectedTemplateId}
                        onSelect={() => selectTemplate(tpl)}
                        onDuplicate={() => handleDuplicate(tpl)}
                        onSetDefault={() => handleSetDefault(tpl.id)}
                        onRename={() => handleRenameClick(tpl)}
                        onDelete={() => handleDelete(tpl.id)}
                      />
                    ))}
                    {!isNewTemplate && (
                      <button type="button" onClick={startNewTemplate} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/20 py-2.5 text-xxs text-muted-foreground/40 transition-all hover:border-primary/30 hover:bg-primary/[0.02] hover:text-primary/60 mt-1">
                        <Plus className="size-3" />
                        <span>New Template</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 rounded-xl border border-border/30 bg-card/30 p-3 pt-2.5 overflow-hidden flex flex-col min-h-0">
              <div className="h-px bg-border/10 -mx-3 mb-3" />
              <PlaceholderChips groups={groups} onInsert={insertPlaceholder} />
            </div>
          </div>

          {/* ─── MIDDLE COLUMN: Editor ─────────────────────────────── */}
          <div className="min-w-0 flex flex-col">
            <div className="flex flex-col h-full rounded-xl border border-border/30 bg-card/50 overflow-hidden">
              <div className="border-b border-border/20 px-4 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xxs font-semibold uppercase tracking-wider text-foreground/60">
                    Template Title <span className="text-destructive">*</span>
                  </label>
                  {editTitle.length > 60 && (
                    <span className={cn("text-nano tabular-nums", editTitle.length > 75 ? "text-destructive/70" : "text-muted-foreground/40")}>
                      {editTitle.length}/80
                    </span>
                  )}
                </div>
                <Input ref={titleInputRef} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Example: Order Confirmation" className="h-9 text-sm font-medium" maxLength={80} />
              </div>

              <div className="flex-1 flex flex-col px-4 py-3 gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xxs font-semibold uppercase tracking-wider text-foreground/60">
                    Message Content <span className="text-destructive">*</span>
                  </label>
                  <span className="text-nano text-muted-foreground/35 tabular-nums">{editContent.length} chars</span>
                </div>
                <Textarea ref={textareaRef} value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder="Type your message here... Use {{placeholders}} to insert dynamic content." className="flex-1 min-h-[300px] resize-y font-mono text-xs leading-relaxed" />

                {placeholderWarnings.length > 0 && (
                  <div className="space-y-1">
                    {placeholderWarnings.slice(0, 3).map((w, i) => (
                      <div key={i} className={cn("flex items-start gap-1.5 rounded-md px-2.5 py-1.5", w.type === "unknown" && "bg-info/5 text-info/70", w.type === "malformed" && "bg-warning/5 text-warning/70", w.type === "unsupported" && "bg-destructive/5 text-destructive/70")}>
                        <AlertTriangle className="size-2.5 shrink-0 mt-0.5" />
                        <span className="text-xxs leading-relaxed">{w.message}</span>
                      </div>
                    ))}
                    {placeholderWarnings.length > 3 && (
                      <p className="text-xxs text-muted-foreground/30 pl-1">+{placeholderWarnings.length - 3} more warning{placeholderWarnings.length - 3 > 1 ? "s" : ""}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-border/20 px-4 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {selectedTemplate && (
                      <>
                        <Button variant="ghost" size="xs" onClick={() => handleDelete(selectedTemplate.id)} className="text-destructive/50 hover:text-destructive gap-1 h-7 text-xxs">
                          <Trash2 className="size-2.5" /> Delete
                        </Button>
                        {!selectedTemplate.isDefault && (
                          <Button variant="ghost" size="xs" onClick={() => handleSetDefault(selectedTemplate.id)} className="gap-1 h-7 text-muted-foreground/50 text-xxs">
                            <Star className="size-2.5" /> Default
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {hasUnsavedChanges && lastSavedRef.current.title && (
                      <Button variant="ghost" size="xs" onClick={handleReset} className="gap-1 h-7 text-muted-foreground/50 text-xxs">
                        <RotateCcw className="size-2.5" /> Reset
                      </Button>
                    )}
                    <Button variant="gradient" size="sm" disabled={!editTitle.trim() || !editContent.trim() || saving} onClick={handleSave} className="gap-1.5 h-8 text-xs">
                      {saving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
                      {saving ? "Saving..." : isNewTemplate ? "Create" : "Save"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: Live Preview ────────────────────────── */}
          <div className="min-w-0">
            <WhatsAppPreview
              title={editTitle || "WhatsApp Preview"}
              rawContent={editContent}
              renderedContent={renderSamplePreview(editContent, dateFormat)}
              contextLabel={`via ${contextInfo.label}`}
              hasUnsaved={hasUnsavedChanges}
            />
          </div>
        </div>
      )}

      {/* ═══ Delete Confirmation Dialog ════════════════════════════ */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Template"
        description="Are you sure you want to delete this template? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />

      {/* ═══ Rename Dialog ══════════════════════════════════════════ */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Rename Template</DialogTitle>
            <DialogDescription>
              Enter a new name for this template.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              ref={renameInputRef}
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              placeholder="Template title"
              maxLength={80}
              className="h-9 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); confirmRename(); }
                if (e.key === "Escape") setRenameDialogOpen(false);
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={confirmRename}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
