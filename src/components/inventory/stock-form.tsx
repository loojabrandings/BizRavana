"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Settings2, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dropdown } from "@/components/ui/dropdown";
import { useIsMobile } from "@/hooks/use-media-query";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CategoryManager, type Category } from "@/components/products/category-manager";
import { formatCurrency } from "./utils";
import type { StockFormData, StockFormCalculations } from "./types";

// ─── Props ─────────────────────────────────────────────────────────

interface StockFormProps {
  onSubmit?: (data: StockFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: StockFormData;
  isEditing?: boolean;
  currentStock?: number;
  categories?: Category[];
  onCategoriesChange?: () => void;
  businessId?: string | null;
}

// ─── Default State ─────────────────────────────────────────────────

function createDefaultForm(): StockFormData {
  return {
    item_name: "",
    category: "",
    size_variant: "",
    quantity: 0,
    unit_cost: 0,
    supplier: "",
    reorder_level: 0,
    type: "stock_in",
    notes: "",
  };
}

// ─── Main Component ───────────────────────────────────────────────

export function StockForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing,
  currentStock = 0,
  categories = [],
  onCategoriesChange,
  businessId,
}: StockFormProps) {
  const isMobile = useIsMobile();
  const [form, setForm] = useState<StockFormData>(() => initialData || createDefaultForm());
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // Re-initialize when initialData changes
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      setErrors({});
      setIsDirty(false);
    }
  }, [initialData]);

  // ─── Form helpers ─────────────────────────────────────────────
  const updateForm = useCallback(<K extends keyof StockFormData>(
    key: K,
    value: StockFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  // ─── Auto-calculations ────────────────────────────────────────
  const calculations: StockFormCalculations = useMemo(() => {
    const sign = form.type === "stock_in" ? 1 : -1;
    const stockAfter = currentStock + sign * form.quantity;
    const stockValueChange = form.quantity * form.unit_cost;
    return {
      stock_after: Math.max(0, stockAfter),
      stock_value_change: stockValueChange,
    };
  }, [form.type, form.quantity, form.unit_cost, currentStock]);

  // ─── Validation ───────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};

    if (!form.item_name.trim()) errs["item_name"] = "Required";
    if (!form.category.trim()) errs["category"] = "Required";
    if (!form.size_variant.trim()) errs["size_variant"] = "Required";
    if (form.quantity <= 0) errs["quantity"] = "Must be greater than 0";
    if (form.type === "stock_out" && form.quantity > currentStock) {
      errs["quantity"] = `Cannot exceed current stock (${currentStock})`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form, currentStock]);

  // ─── Cancel with unsaved changes check ───────────────────────
  const handleCancel = useCallback(() => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      onCancel?.();
    }
  }, [isDirty, onCancel]);

  // ─── Submit ───────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!validate()) {
      toast.error("Please fix the form errors");
      return;
    }
    setSaving(true);
    try {
      await onSubmit?.(form);
      setIsDirty(false);
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Failed to save stock change", {
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setSaving(false);
    }
  }, [form, onSubmit, validate]);

  // ─── Keyboard shortcuts ─────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (isDirty) {
          setShowUnsavedDialog(true);
        } else {
          onCancel?.();
        }
        return;
      }

      if (e.key === "Enter" && !saving) {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isDirty, onCancel, saving, handleSave]);

  // ─── Stock type label ────────────────────────────────────────
  const isStockIn = form.type === "stock_in";
  const prefix = isStockIn ? "Stock In" : "Stock Out";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col rounded-2xl glass-card"
    >
      {/* ═══════ Header ════════════════════════════════════════════ */}
      <div className={isMobile ? "px-4 pt-4 pb-3" : "flex items-start justify-between px-8 pt-7 pb-5"}>
        {isMobile ? (
          <div>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold tracking-tight text-foreground leading-tight">
                  {isEditing ? `Edit ${prefix}` : `New ${prefix}`}
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground/70">
                  {isEditing
                    ? `Updating "${initialData?.item_name}"`
                    : "Add or remove stock from your inventory."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                title="Close"
              >
                <X className="size-4.5" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                {isEditing ? `Edit ${prefix}` : `New ${prefix}`}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isEditing
                  ? `Updating "${initialData?.item_name}"`
                  : "Add or remove stock from your inventory."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </>
        )}
      </div>

      <Separator />

      {/* ═══════ Scrollable Content ═══════════════════════════════ */}
      {isMobile ? (
        <div
          className="flex-1 overflow-y-auto px-4"
          style={{ maxHeight: "calc(100dvh - 320px)" }}
        >
          <div className="py-4 pb-[calc(88px+env(safe-area-inset-bottom))] space-y-6">
            {/* ─── Item Identity ──────────────────────────────── */}
            <div className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Item Identity
              </h2>

              <div className="space-y-1.5">
                <Label>
                  Item Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Premium Photo Frame 8x10"
                  value={form.item_name}
                  onChange={(e) => updateForm("item_name", e.target.value)}
                  className={errors.item_name ? "border-destructive h-9" : "h-9"}
                />
                {errors.item_name && <p className="text-sm text-destructive">{errors.item_name}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setShowCategoryManager(true)}
                    title="Manage categories"
                  >
                    <Settings2 className="size-3.5" />
                  </Button>
                </div>
                <Dropdown
                  value={form.category}
                  onChange={(v) => v && updateForm("category", v)}
                  options={categories.map((c) => ({ value: c.name, label: c.name }))}
                  placeholder="Select or type a category..."
                  size="default"
                  className={errors.category ? "border-destructive w-full h-9" : "w-full h-9"}
                />
                {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>
                  Size / Variant <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. 8x10, A4, 16x20"
                  value={form.size_variant}
                  onChange={(e) => updateForm("size_variant", e.target.value)}
                  className={errors.size_variant ? "border-destructive h-9" : "h-9"}
                />
                {errors.size_variant && <p className="text-sm text-destructive">{errors.size_variant}</p>}
              </div>
            </div>

            <Separator />

            {/* ─── Stock Details ──────────────────────────────── */}
            <div className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Stock Details
              </h2>

              <div className="space-y-1.5">
                <Label>Transaction Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["stock_in", "stock_out"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateForm("type", type)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                        form.type === type
                          ? type === "stock_in"
                            ? "border-success/40 bg-success/5 text-success shadow-sm"
                            : "border-destructive/40 bg-destructive/5 text-destructive shadow-sm"
                          : "border-border bg-muted/20 text-muted-foreground hover:border-border/80 hover:text-foreground"
                      }`}
                    >
                      {type === "stock_in" ? "Stock In" : "Stock Out"}
                    </button>
                  ))}
                </div>
              </div>

              {isEditing && (
                <div className="space-y-1.5">
                  <Label>Current Stock</Label>
                  <div className="flex h-9 items-center rounded-lg border border-border/50 bg-muted/20 px-3 text-sm font-semibold tabular-nums text-foreground">
                    {currentStock}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>
                  Quantity <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.quantity || ""}
                  onChange={(e) => updateForm("quantity", Math.max(0, Number(e.target.value) || 0))}
                  className={errors.quantity ? "border-destructive h-9" : "h-9"}
                />
                {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
                {isEditing && form.quantity > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {isStockIn ? "New stock level:" : "Remaining stock:"}{" "}
                    <span className={`font-semibold tabular-nums ${calculations.stock_after < 0 ? "text-destructive" : "text-foreground"}`}>
                      {calculations.stock_after}
                    </span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Unit Cost (Rs.)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0.00"
                  value={form.unit_cost || ""}
                  onChange={(e) => updateForm("unit_cost", Math.max(0, Number(e.target.value) || 0))}
                  className="h-9"
                />
              </div>

              {form.quantity > 0 && form.unit_cost > 0 && (
                <div className="space-y-1.5">
                  <Label>Stock Value Change</Label>
                  <div className="flex h-9 items-center rounded-lg border border-border/50 bg-muted/20 px-3 text-sm font-semibold tabular-nums text-foreground">
                    {isStockIn ? "+" : "-"} {formatCurrency(calculations.stock_value_change)}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* ─── Supplier & Alerts ────────────────────────────── */}
            <div className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Supplier & Alerts
              </h2>

              <div className="space-y-1.5">
                <Label>Supplier</Label>
                <Input
                  type="text"
                  placeholder="e.g. Frames Wholesale Co."
                  value={form.supplier}
                  onChange={(e) => updateForm("supplier", e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Reorder Level</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.reorder_level || ""}
                  onChange={(e) => updateForm("reorder_level", Math.max(0, Number(e.target.value) || 0))}
                  className="h-9"
                />
                <p className="text-xs text-muted-foreground">
                  When stock drops to this level, the item will show a low stock warning.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <textarea
                  placeholder="Optional notes about this transaction..."
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-ring focus:ring-[3px] focus:ring-ring/50 resize-y"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden" style={{ maxHeight: "calc(100vh - 280px)" }}>
          {/* ─── Column 1: Item Identity (34%) ────────────────── */}
          <div className="w-[34%] shrink-0 overflow-y-auto border-r border-border/50 px-8 py-6">
            <div className="space-y-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">Item Identity</h2>

              <div className="space-y-1.5">
                <Label>Item Name <span className="text-destructive">*</span></Label>
                <Input type="text" placeholder="e.g. Premium Photo Frame 8x10"
                  value={form.item_name} onChange={(e) => updateForm("item_name", e.target.value)}
                  className={errors.item_name ? "border-destructive h-9" : "h-9"} />
                {errors.item_name && <p className="text-sm text-destructive">{errors.item_name}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Category <span className="text-destructive">*</span></Label>
                  <Button variant="ghost" size="icon-xs" onClick={() => setShowCategoryManager(true)} title="Manage categories">
                    <Settings2 className="size-3.5" />
                  </Button>
                </div>
                <Dropdown value={form.category} onChange={(v) => v && updateForm("category", v)}
                  options={categories.map((c) => ({ value: c.name, label: c.name }))}
                  placeholder="Select or type a category..." size="default"
                  className={errors.category ? "border-destructive w-full h-9" : "w-full h-9"} />
                {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Size / Variant <span className="text-destructive">*</span></Label>
                <Input type="text" placeholder="e.g. 8x10, A4, 16x20"
                  value={form.size_variant} onChange={(e) => updateForm("size_variant", e.target.value)}
                  className={errors.size_variant ? "border-destructive h-9" : "h-9"} />
                {errors.size_variant && <p className="text-sm text-destructive">{errors.size_variant}</p>}
              </div>
            </div>
          </div>

          {/* ─── Column 2: Stock Details (33%) ────────────────── */}
          <div className="w-[33%] shrink-0 overflow-y-auto border-r border-border/50 px-8 py-6">
            <div className="space-y-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">Stock Details</h2>

              <div className="space-y-1.5">
                <Label>Transaction Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["stock_in", "stock_out"] as const).map((type) => (
                    <button key={type} type="button" onClick={() => updateForm("type", type)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                        form.type === type
                          ? type === "stock_in"
                            ? "border-success/40 bg-success/5 text-success shadow-sm"
                            : "border-destructive/40 bg-destructive/5 text-destructive shadow-sm"
                          : "border-border bg-muted/20 text-muted-foreground hover:border-border/80 hover:text-foreground"
                      }`}>
                      {type === "stock_in" ? "Stock In" : "Stock Out"}
                    </button>
                  ))}
                </div>
              </div>

              {isEditing && (
                <div className="space-y-1.5">
                  <Label>Current Stock</Label>
                  <div className="flex h-9 items-center rounded-lg border border-border/50 bg-muted/20 px-3 text-sm font-semibold tabular-nums text-foreground">{currentStock}</div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Quantity <span className="text-destructive">*</span></Label>
                <Input type="number" min={0} placeholder="0" value={form.quantity || ""}
                  onChange={(e) => updateForm("quantity", Math.max(0, Number(e.target.value) || 0))}
                  className={errors.quantity ? "border-destructive h-9" : "h-9"} />
                {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
                {isEditing && form.quantity > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {isStockIn ? "New stock level:" : "Remaining stock:"}{" "}
                    <span className={`font-semibold tabular-nums ${calculations.stock_after < 0 ? "text-destructive" : "text-foreground"}`}>{calculations.stock_after}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Unit Cost (Rs.)</Label>
                <Input type="number" min={0} placeholder="0.00" value={form.unit_cost || ""}
                  onChange={(e) => updateForm("unit_cost", Math.max(0, Number(e.target.value) || 0))}
                  className="h-9" />
              </div>

              {form.quantity > 0 && form.unit_cost > 0 && (
                <div className="space-y-1.5">
                  <Label>Stock Value Change</Label>
                  <div className="flex h-9 items-center rounded-lg border border-border/50 bg-muted/20 px-3 text-sm font-semibold tabular-nums text-foreground">
                    {isStockIn ? "+" : "-"} {formatCurrency(calculations.stock_value_change)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Column 3: Supplier & Alerts (33%) ────────────── */}
          <div className="w-[33%] shrink-0 overflow-y-auto px-8 py-6">
            <div className="space-y-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">Supplier & Alerts</h2>

              <div className="space-y-1.5">
                <Label>Supplier</Label>
                <Input type="text" placeholder="e.g. Frames Wholesale Co."
                  value={form.supplier} onChange={(e) => updateForm("supplier", e.target.value)}
                  className="h-9" />
              </div>

              <div className="space-y-1.5">
                <Label>Reorder Level</Label>
                <Input type="number" min={0} placeholder="0" value={form.reorder_level || ""}
                  onChange={(e) => updateForm("reorder_level", Math.max(0, Number(e.target.value) || 0))}
                  className="h-9" />
                <p className="text-xs text-muted-foreground">When stock drops to this level, the item will show a low stock warning.</p>
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <textarea placeholder="Optional notes about this transaction..."
                  value={form.notes} onChange={(e) => updateForm("notes", e.target.value)}
                  className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-ring focus:ring-[3px] focus:ring-ring/50 resize-y" />
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* ═══════ Action Bar ════════════════════════════════════════ */}
      <div className={isMobile ? "sticky bottom-0 border-t border-border/40 bg-background/95 backdrop-blur-md px-4 py-3" : "flex items-center justify-between px-8 py-4"}>
        {isMobile ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 gap-1.5 text-sm font-medium h-10"
            >
              <ArrowLeft className="size-3.5" />
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 text-sm font-medium h-10"
            >
              {saving
                ? "Saving..."
                : isEditing
                  ? `Save ${prefix}`
                  : `Create ${prefix}`}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" onClick={handleCancel} disabled={saving} className="text-sm">
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleSave} disabled={saving} className="min-w-[160px] text-sm">
              {saving ? "Saving..." : isEditing ? `Save ${prefix}` : `Create ${prefix}`}
            </Button>
          </div>
        )}
      </div>

      {/* ─── Unsaved Changes Dialog ──────────────────────────── */}
      <ConfirmDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        title="Unsaved changes"
        description="You have unsaved changes. Are you sure you want to leave?"
        confirmLabel="Leave"
        variant="destructive"
        onConfirm={() => {
          setShowUnsavedDialog(false);
          onCancel?.();
        }}
      />

      {/* ─── Category Manager ────────────────────────────────── */}
      <CategoryManager
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
        onCategoriesChange={onCategoriesChange || (() => {})}
        businessId={businessId}
      />
    </motion.div>
  );
}
