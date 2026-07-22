"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { QuotationFormData, QuotationFormLineItem, QuotationFormCalculations } from "./types";

// Re-export types used by quotations page
export type { QuotationFormData, QuotationFormLineItem };
import { generateItemId, generateQuotationNumber, initializeQuotationSequence, rollbackQuotationSequence, calculateDefaultExpiryDate, todayStr } from "./utils";
import { QuotationCustomerSection } from "./quotation-customer-section";
import { QuotationItemsSection } from "./quotation-items-section";
import { QuotationFinancialSection } from "./quotation-financial-section";
import { useCourierLocations } from "@/hooks/use-courier-locations";
import { useIsMobile } from "@/hooks/use-media-query";
import { QuotationFormWizard } from "./quotation-form-wizard";

// ─── Props ─────────────────────────────────────────────────────────

export interface QuotationFormProps {
  onSubmit?: (data: QuotationFormData, preview: boolean) => Promise<void>;
  onCancel?: () => void;
  initialData?: QuotationFormData;
  isEditing?: boolean;
}

// ─── Default State ─────────────────────────────────────────────────

function createDefaultForm(): QuotationFormData {
  return {
    quotation_number: generateQuotationNumber(), // temporary — replaced after DB init
    created_date: todayStr(),
    customer_name: "",
    address: "",
    district: "",
    nearest_city: "",
    whatsapp: "",
    phone: "",
    email: "",
    items: [
      {
        id: generateItemId(),
        product_name: "",
        category: "",
        quantity: 1,
        unit_price: 0,
        notes: "",
      },
    ],
    expiry_date: calculateDefaultExpiryDate(),
    subtotal: 0,
    discount: 0,
    discount_type: "fixed",
    delivery_charge: 0,
    grand_total: 0,
    status: "draft",
    remarks: "",
  };
}

// ─── Main Component ───────────────────────────────────────────────

export function QuotationForm({ onSubmit, onCancel, initialData, isEditing }: QuotationFormProps) {
  const [form, setForm] = useState<QuotationFormData>(() => initialData || createDefaultForm());
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  // ─── Courier Locations ──────────────────────────────────────
  const { locations: courierLocations } = useCourierLocations();

  // ─── Categories & Business ID ────────────────────────────────
  const [categories, setCategories] = useState<string[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("user_id", session.user.id)
        .single();
      const bizId = (profile as { business_id: string | null } | null)?.business_id;
      if (!bizId) return;
      setBusinessId(bizId);

      const { data: catData } = await supabase
        .from("categories")
        .select("name")
        .eq("business_id", bizId)
        .order("name", { ascending: true });

      setCategories((catData || []).map((c: { name: string }) => String(c.name)));

      // Initialize quotation sequence from DB so the form shows the next
      // available number after the last created quotation
      // NOTE: skip when editing — quotation numbers must stay unchanged
      if (bizId && !isEditing) {
        // Rollback the temporary generateQuotationNumber() call from
        // createDefaultForm() so initialize can set the correct counter
        rollbackQuotationSequence();
        await initializeQuotationSequence(bizId);
        const nextNumber = generateQuotationNumber();
        setForm((prev) => ({
          ...prev,
          quotation_number: nextNumber,
        }));
      }
    };
    fetchData();
  }, []);

  // Re-initialize form when initialData changes
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      setErrors({});
      setIsDirty(false);
    }
  }, [initialData]);

  // ─── Form helpers ─────────────────────────────────────────────
  const updateForm = useCallback(<K extends keyof QuotationFormData>(
    key: K,
    value: QuotationFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  // ─── Auto-calculations ────────────────────────────────────────
  const calculations: QuotationFormCalculations = useMemo(() => {
    const subtotal = form.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    );
    const discountVal =
      form.discount_type === "percentage"
        ? subtotal * (Math.min(form.discount, 100) / 100)
        : form.discount;
    const deliveryCharge = form.delivery_charge;
    const grandTotal = Math.max(0, subtotal - discountVal + deliveryCharge);
    return { subtotal, discountVal, grandTotal };
  }, [
    form.items,
    form.discount,
    form.discount_type,
    form.delivery_charge,
  ]);

  // Sync auto-calculated fields
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      subtotal: calculations.subtotal,
      grand_total: calculations.grandTotal,
    }));
  }, [calculations]);

  // ─── Items ────────────────────────────────────────────────────
  const handleAddItem = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: generateItemId(),
          product_name: "",
          category: "",
          quantity: 1,
          unit_price: 0,
          notes: "",
        },
      ],
    }));
    setIsDirty(true);
  }, []);

  const handleUpdateItem = useCallback(
    (index: number, updates: Partial<QuotationFormLineItem>) => {
      setForm((prev) => ({
        ...prev,
        items: prev.items.map((item, i) =>
          i === index ? { ...item, ...updates } : item,
        ),
      }));
      setIsDirty(true);
    },
    [],
  );

  const handleRemoveItem = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    setIsDirty(true);
  }, []);

  // ─── Product Select (from search popover) ────────────────────
  const handleProductSelect = useCallback((product: { name: string; category: string | null; selling_price: number }) => {
    setForm((prev) => {
      const emptyIndex = prev.items.findIndex((item) => !item.product_name.trim());
      if (emptyIndex !== -1) {
        const updated = [...prev.items];
        updated[emptyIndex] = {
          ...updated[emptyIndex],
          product_name: product.name,
          category: product.category || "",
          unit_price: product.selling_price,
        };
        return { ...prev, items: updated };
      }
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            id: generateItemId(),
            product_name: product.name,
            category: product.category || "",
            quantity: 1,
            unit_price: product.selling_price,
            notes: "",
          },
        ],
      };
    });
    setIsDirty(true);
  }, []);

  // ─── Validation ───────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};

    if (!form.customer_name.trim()) errs["customer_name"] = "Required";
    if (!form.address.trim()) errs["address"] = "Required";
    if (!form.phone.trim()) errs["phone"] = "Required";
    if (!form.status) errs["status"] = "Required";
    if (form.items.length === 0) errs["items"] = "Add at least one item";
    else {
      form.items.forEach((item, i) => {
        if (!item.product_name.trim())
          errs[`items.${i}.product_name`] = "Required";
        if (item.quantity < 1) errs[`items.${i}.quantity`] = "Min 1";
      });
    }

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
  const handleSave = useCallback(
    async (preview: boolean) => {
      if (!validate()) {
        toast.error("Please fix the form errors");
        return;
      }
      setSaving(true);
      try {
        await onSubmit?.(form, preview);
        setIsDirty(false);
      } catch (err) {
        console.error("Submit error:", err);
        toast.error("Failed to save quotation");
      } finally {
        setSaving(false);
      }
    },
    [form, onSubmit, validate],
  );

  // ─── Mobile detection ──────────────────────────────────────
  const isMobile = useIsMobile();

  // ─── Keyboard shortcuts (skip on mobile — wizard handles its own) ─
  useEffect(() => {
    if (isMobile) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isTextarea = tag === "TEXTAREA";

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
        if (isTextarea) return;
        e.preventDefault();
        const preview = e.ctrlKey || e.metaKey;
        handleSave(preview);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isDirty, onCancel, saving, handleSave, isMobile]);

  // ─── Render ───────────────────────────────────────────────────
  if (isMobile) {
    return (
      <QuotationFormWizard
        form={form}
        errors={errors}
        setErrors={setErrors}
        calculations={calculations}
        categories={categories}
        businessId={businessId}
        saving={saving}
        isEditing={isEditing}
        isDirty={isDirty}
        courierLocations={courierLocations}
        updateForm={updateForm}
        handleAddItem={handleAddItem}
        handleUpdateItem={handleUpdateItem}
        handleRemoveItem={handleRemoveItem}
        handleProductSelect={handleProductSelect}
        handleSave={handleSave}
        handleCancel={handleCancel}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col rounded-2xl glass-card"
    >
      {/* ═══════ Header ════════════════════════════════════════════ */}
      <div className="flex items-start justify-between px-8 pt-7 pb-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {initialData ? "Edit Quotation" : "New Quotation"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {initialData ? `Editing #${initialData.quotation_number}` : "Create a new quotation for your customer."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <Separator />

      {/* ═══════ Scrollable 3-Column Content ══════════════════════ */}
      <div className="flex flex-1 overflow-hidden" style={{ maxHeight: "calc(100vh - 280px)" }}>
        {/* ─── Column 1: Customer Details (34%) ───────────────── */}
        <div className="w-[34%] shrink-0 overflow-y-auto border-r border-border/50 px-8 py-6">
          <div className="space-y-8">
            <QuotationCustomerSection
              form={form}
              errors={errors}
              updateForm={updateForm}
              courierStates={courierLocations?.states}
              courierCities={courierLocations?.cities}
            />
          </div>
        </div>

        {/* ─── Column 2: Quotation Items (33%) ──────────────────── */}
        <div className="w-[33%] shrink-0 overflow-y-auto border-r border-border/50 px-8 py-6">
          <div className="space-y-5">
            <QuotationItemsSection
              items={form.items}
              errors={errors}
              expiryDate={form.expiry_date}
              onUpdateExpiryDate={(date) => updateForm("expiry_date", date)}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onRemoveItem={handleRemoveItem}
              categories={categories}
              businessId={businessId}
              onProductSelect={handleProductSelect}
            />
          </div>
        </div>

        {/* ─── Column 3: Financial Details + Status (33%) ──────── */}
        <div className="w-[33%] shrink-0 overflow-y-auto px-8 py-6">
          <div className="space-y-5">
            <QuotationFinancialSection
              form={{
                discount: form.discount,
                discount_type: form.discount_type,
                delivery_charge: form.delivery_charge,
                status: form.status,
              }}
              calculations={calculations}
              errors={errors}
              updateForm={updateForm}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* ═══════ Sticky Action Bar ════════════════════════════════ */}
      <div className="flex items-center justify-between px-8 py-4">
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
            variant="outline"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="text-sm"
          >
            {saving ? "Saving..." : "Save & Preview"}
          </Button>
          <Button
            variant="gradient"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="min-w-[130px] text-sm"
          >
            {saving ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Quotation" : "Create Quotation"}
          </Button>
        </div>
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
    </motion.div>
  );
}
