"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Settings2, X, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dropdown } from "@/components/ui/dropdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CategoryManager, type Category } from "@/components/products/category-manager";
import { useIsMobile } from "@/hooks/use-media-query";

// ─── Types ─────────────────────────────────────────────────────────

export interface ProductFormData {
  name: string;
  category: string;
  size_variant: string;
  selling_price: number;
  cost_price: number;
  add_to_inventory: boolean;
  is_active: boolean;
}

export interface ProductFormCalculations {
  profit_amount: number;
  profit_margin: number | null;
}

// ─── Helpers ───────────────────────────────────────────────────────

import { formatCurrency } from "@/lib/formatters";

// ─── Props ─────────────────────────────────────────────────────────

export interface ProductFormProps {
  onSubmit?: (data: ProductFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: ProductFormData;
  isEditing?: boolean;
  categories?: Category[];
  onCategoriesChange?: () => void;
  businessId?: string | null;
}

// ─── Default State ─────────────────────────────────────────────────

function createDefaultForm(): ProductFormData {
  return {
    name: "",
    category: "",
    size_variant: "",
    selling_price: 0,
    cost_price: 0,
    add_to_inventory: false,
    is_active: true,
  };
}

// ─── Main Component ───────────────────────────────────────────────

export function ProductForm({ onSubmit, onCancel, initialData, isEditing, categories = [], onCategoriesChange, businessId }: ProductFormProps) {
  const isMobile = useIsMobile();
  const [form, setForm] = useState<ProductFormData>(() => initialData || createDefaultForm());
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // Re-initialize form when initialData changes
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      setErrors({});
      setIsDirty(false);
    }
  }, [initialData]);

  // ─── Form helpers ─────────────────────────────────────────────
  const updateForm = useCallback(<K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  // ─── Auto-calculations ────────────────────────────────────────
  const calculations: ProductFormCalculations = useMemo(() => {
    const profitAmount = form.selling_price - form.cost_price;
    if (form.cost_price > 0 && form.selling_price > 0) {
      const margin = ((form.selling_price - form.cost_price) / form.cost_price) * 100;
      return { profit_amount: profitAmount, profit_margin: Math.round(margin * 100) / 100 };
    }
    return { profit_amount: profitAmount, profit_margin: null };
  }, [form.cost_price, form.selling_price]);

  // ─── Validation ───────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) errs["name"] = "Required";
    if (!form.category.trim()) errs["category"] = "Required";
    if (!form.size_variant.trim()) errs["size_variant"] = "Required";
    if (form.selling_price <= 0) errs["selling_price"] = "Must be greater than 0";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

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
      toast.error("Failed to save product");
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

  // ─── Render ───────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col rounded-2xl glass-card"
    >
      {/* ═══════ Header ════════════════════════════════════════════ */}
      <div className={isMobile ? "flex items-start justify-between px-4 pt-4 pb-3" : "flex items-start justify-between px-8 pt-7 pb-5"}>
        <div>
          <h1 className={isMobile ? "text-lg font-semibold tracking-tight" : "text-xl font-semibold tracking-tight"}>
            {initialData ? "Edit Product" : "New Product"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {initialData ? `Editing "${initialData.name}"` : "Add a new product to your catalog."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <Separator />

      {/* ═══════ Content ════════════════════════════════════════════ */}
      {isMobile ? (
        /* ─── Mobile: Stacked sections ─────────────────────────── */
        <div
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{ paddingBottom: "calc(40px + env(safe-area-inset-bottom))" }}
        >
          <div className="space-y-8">
            {/* ─── Section 1: Product Identity ──────────────────── */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
                Product Identity
              </h2>

              <div className="space-y-1.5">
                <Label>
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Premium Photo Frame"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  className={errors.name ? "border-destructive h-9" : "h-9"}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
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

            {/* ─── Section 2: Pricing ──────────────────────────── */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
                Pricing
              </h2>

              <div className="space-y-1.5">
                <Label>
                  Selling Price (Rs.) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0.00"
                  value={form.selling_price || ""}
                  onChange={(e) => updateForm("selling_price", Math.max(0, Number(e.target.value) || 0))}
                  className={errors.selling_price ? "border-destructive h-9" : "h-9"}
                />
                {errors.selling_price && <p className="text-sm text-destructive">{errors.selling_price}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Cost Price (Rs.)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0.00"
                  value={form.cost_price || ""}
                  onChange={(e) => updateForm("cost_price", Math.max(0, Number(e.target.value) || 0))}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Profit</Label>
                <div className="flex h-9 items-center rounded-lg border border-border/50 bg-muted/20 px-3 text-sm font-semibold tabular-nums gap-2">
                  {calculations.profit_margin !== null ? (
                    <>
                      <span className="text-foreground">{formatCurrency(calculations.profit_amount)}</span>
                      <span className="text-muted-foreground/40">|</span>
                      <span className={calculations.profit_margin >= 0 ? "text-success" : "text-destructive"}>
                        {calculations.profit_margin >= 0 ? "+" : ""}
                        {calculations.profit_margin.toFixed(2)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground/60">—</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Profit = Selling Price − Cost Price &nbsp;|&nbsp; Margin = (Profit ÷ Cost Price) × 100
                </p>
              </div>
            </div>

            <Separator />

            {/* ─── Section 3: Settings ─────────────────────────── */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
                Settings
              </h2>

              <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/30 px-5 py-3.5">
                <Checkbox
                  id="add_to_inventory"
                  checked={form.add_to_inventory}
                  onCheckedChange={(checked) => updateForm("add_to_inventory", checked === true)}
                />
                <Label htmlFor="add_to_inventory" className="text-sm font-medium text-foreground cursor-pointer">
                  Link product as inventory item
                </Label>
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.is_active ? "active" : "inactive"}
                  onValueChange={(v) => updateForm("is_active", v === "active")}
                >
                  <SelectTrigger className="w-full h-9!">
                    <SelectValue>
                      {form.is_active ? "Active" : "Inactive"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ─── Desktop: 3-column layout ─────────────────────────── */
        <div className="flex flex-1 overflow-hidden" style={{ maxHeight: "calc(100vh - 280px)" }}>
          {/* Column 1: Product Identity (34%) */}
          <div className="w-[34%] shrink-0 overflow-y-auto border-r border-border/50 px-8 py-6">
            <div className="space-y-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
                Product Identity
              </h2>

              <div className="space-y-1.5">
                <Label>
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Premium Photo Frame"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  className={errors.name ? "border-destructive h-9" : "h-9"}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
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
          </div>

          {/* Column 2: Pricing (33%) */}
          <div className="w-[33%] shrink-0 overflow-y-auto border-r border-border/50 px-8 py-6">
            <div className="space-y-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
                Pricing
              </h2>

              <div className="space-y-1.5">
                <Label>
                  Selling Price (Rs.) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0.00"
                  value={form.selling_price || ""}
                  onChange={(e) => updateForm("selling_price", Math.max(0, Number(e.target.value) || 0))}
                  className={errors.selling_price ? "border-destructive h-9" : "h-9"}
                />
                {errors.selling_price && <p className="text-sm text-destructive">{errors.selling_price}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Cost Price (Rs.)</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0.00"
                  value={form.cost_price || ""}
                  onChange={(e) => updateForm("cost_price", Math.max(0, Number(e.target.value) || 0))}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Profit</Label>
                <div className="flex h-9 items-center rounded-lg border border-border/50 bg-muted/20 px-3 text-sm font-semibold tabular-nums gap-2">
                  {calculations.profit_margin !== null ? (
                    <>
                      <span className="text-foreground">{formatCurrency(calculations.profit_amount)}</span>
                      <span className="text-muted-foreground/40">|</span>
                      <span className={calculations.profit_margin >= 0 ? "text-success" : "text-destructive"}>
                        {calculations.profit_margin >= 0 ? "+" : ""}
                        {calculations.profit_margin.toFixed(2)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground/60">—</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Profit = Selling Price − Cost Price &nbsp;|&nbsp; Margin = (Profit ÷ Cost Price) × 100
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Settings (33%) */}
          <div className="w-[33%] shrink-0 overflow-y-auto px-8 py-6">
            <div className="space-y-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
                Settings
              </h2>

              <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/30 px-5 py-3.5">
                <Checkbox
                  id="add_to_inventory"
                  checked={form.add_to_inventory}
                  onCheckedChange={(checked) => updateForm("add_to_inventory", checked === true)}
                />
                <Label htmlFor="add_to_inventory" className="text-sm font-medium text-foreground cursor-pointer">
                  Link product as inventory item
                </Label>
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.is_active ? "active" : "inactive"}
                  onValueChange={(v) => updateForm("is_active", v === "active")}
                >
                  <SelectTrigger className="w-full h-9!">
                    <SelectValue>
                      {form.is_active ? "Active" : "Inactive"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* ═══════ Sticky Action Bar ════════════════════════════════ */}
      <div className={isMobile ? "sticky bottom-0 border-t border-border/40 bg-background/95 backdrop-blur-md px-4 py-3 safe-bottom" : "flex items-center justify-between px-8 py-4"}>
        {isMobile ? (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="lg"
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 gap-1.5 text-sm font-medium h-11"
            >
              <ArrowLeft className="size-4" />
              Cancel
            </Button>
            <Button
              variant="gradient"
              size="lg"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 text-sm font-medium h-11"
            >
              {saving ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Product" : "Create Product"}
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={saving}
              className="text-sm"
            >
              Cancel
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant="gradient"
                onClick={handleSave}
                disabled={saving}
                className="min-w-[130px] text-sm"
              >
                {saving ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </>
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
