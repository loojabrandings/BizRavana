"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { OrderFormData, OrderFormLineItem, OrderFormCalculations } from "./types";

// Re-export types used by orders page
export type { OrderFormData, OrderFormLineItem };
import {
  generateItemId,
  generateOrderNumber,
  initializeOrderSequence,
  rollbackOrderSequence,
  todayStr,
} from "./utils";
import { CustomerDetailsSection } from "./customer-details-section";
import { OrderItemsSection } from "./order-items-section";
import { PaymentSection } from "./payment-section";
import { OrderManagementSection } from "./order-management-section";
import { compressImage } from "./image-upload";
import { useCourierLocations } from "@/hooks/use-courier-locations";
import { useOrdersSettings } from "@/stores/orders-settings-store";
import { useIsMobile } from "@/hooks/use-media-query";
import { OrderFormWizard } from "./order-form-wizard";
// ─── Props ─────────────────────────────────────────────────────────

export interface OrderFormProps {
  onSubmit?: (data: OrderFormData, preview: boolean) => Promise<void>;
  onCancel?: () => void;
  initialData?: OrderFormData;
  isEditing?: boolean;
}

// ─── Default State ─────────────────────────────────────────────────

function createDefaultForm(): OrderFormData {
  return {
    id: "",
    order_number: generateOrderNumber(), // temporary — replaced after DB init
    created_date: todayStr(),
    dispatched_date: "",
    customer_name: "",
    address: "",
    district: "",
    nearest_city: "",
    whatsapp: "",
    phone: "",
    email: "",
    remarks: "",
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
    expected_delivery_date: "",
    status: "new_order",
    payment_status: "pending",
    waybill_id: "",
    order_source: "ad",
    subtotal: 0,
    discount: 0,
    discount_type: "fixed",
    delivery_charge: 0, // Default overridden in component via useOrdersSettings
    advance_paid: 0,
    payment_method: "cash",
    total: 0,
    balance_remaining: 0,
    images: [],
  };
}

// ─── Main Component ───────────────────────────────────────────────

export function OrderForm({ onSubmit, onCancel, initialData, isEditing }: OrderFormProps) {
  const ordersSettings = useOrdersSettings();
  const [form, setForm] = useState<OrderFormData>(() => {
    if (initialData) {
      // Map existing image URLs from itemImagesMap to each item's preview
      const itemImagesMap = initialData.itemImagesMap || {};
      const updatedItems = initialData.items.map((item) => {
        const urls = itemImagesMap[item.id];
        if (urls && urls.length > 0 && !item.imagePreviewUrl) {
          return { ...item, imagePreviewUrl: urls[0] };
        }
        return item;
      });
      return { ...initialData, items: updatedItems };
    }
    const defaults = createDefaultForm();
    defaults.delivery_charge = ordersSettings.courierCharge;
    defaults.payment_method = ordersSettings.defaultPaymentMethod as "cod" | "bank_transfer" | "cash" | "other";
    return defaults;
  });
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

      // Initialize order sequence from DB so the form shows the next
      // available number after the last created order
      // NOTE: skip when editing — order numbers must stay unchanged
      if (bizId && !isEditing) {
        // Rollback the temporary generateOrderNumber() call from
        // createDefaultForm() so initialize can set the correct counter
        rollbackOrderSequence();
        await initializeOrderSequence(bizId);
        const nextNumber = generateOrderNumber();
        setForm((prev) => ({
          ...prev,
          order_number: nextNumber,
        }));
      }
    };
    fetchData();
  }, []);

  // Re-initialize form when initialData changes (e.g., editing a different order)
  useEffect(() => {
    if (initialData) {
      // Map existing image URLs from itemImagesMap to each item's preview
      const itemImagesMap = initialData.itemImagesMap || {};
      const updatedItems = initialData.items.map((item) => {
        const urls = itemImagesMap[item.id];
        if (urls && urls.length > 0 && !item.imagePreviewUrl) {
          return { ...item, imagePreviewUrl: urls[0] };
        }
        return item;
      });
      setForm({ ...initialData, items: updatedItems });
      setErrors({});
      setIsDirty(false);
    }
  }, [initialData]);

  // ─── Form helpers ─────────────────────────────────────────────
  const updateForm = useCallback(<K extends keyof OrderFormData>(
    key: K,
    value: OrderFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  // ─── Auto-calculations ────────────────────────────────────────
  const calculations: OrderFormCalculations = useMemo(() => {
    const subtotal = form.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    );
    const discountVal =
      form.discount_type === "percentage"
        ? subtotal * (Math.min(form.discount, 100) / 100)
        : form.discount;
    const deliveryCharge = form.delivery_charge;
    const total = Math.max(0, subtotal - discountVal + deliveryCharge);
    const balanceRemaining = Math.max(0, total - form.advance_paid);
    return { subtotal, discountVal, total, balanceRemaining };
  }, [
    form.items,
    form.discount,
    form.discount_type,
    form.delivery_charge,
    form.advance_paid,
  ]);

  // Sync auto-calculated fields
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      subtotal: calculations.subtotal,
      total: calculations.total,
      balance_remaining: calculations.balanceRemaining,
    }));
  }, [calculations]);

  // Auto-set payment status to "advanced" when advance payment is entered
  useEffect(() => {
    if (form.advance_paid > 0 && form.payment_status !== "advanced") {
      setForm((prev) => ({ ...prev, payment_status: "advanced" }));
    }
  }, [form.advance_paid, form.payment_status]);

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
    (index: number, updates: Partial<OrderFormLineItem>) => {
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
    setForm((prev) => {
      // Revoke blob URL to prevent memory leak
      const removed = prev.items[index];
      if (removed?.imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(removed.imagePreviewUrl);
      }
      return {
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      };
    });
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
    if (!form.payment_status) errs["payment_status"] = "Required";
    if (!form.order_source) errs["order_source"] = "Required";
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

  // ─── Reset Customer Details ─────────────────────────────────
  const handleReset = useCallback(() => {
    updateForm("customer_name", "");
    updateForm("phone", "");
    updateForm("address", "");
    updateForm("district", "");
    updateForm("nearest_city", "");
    updateForm("whatsapp", "");
    updateForm("email", "");
    updateForm("remarks", "");
    toast.success("Customer details cleared");
  }, [updateForm]);

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
        let updatedForm = { ...form };
        const uploadedUrls: string[] = [...(form.images || []).filter(Boolean)];
        // Build per-item image mapping
        const itemImagesMap: Record<string, string[]> = {};

        // Upload per-item images — use index-based keys so the map survives DB round-trip
        if (businessId) {
          const supabase = createClient();
          for (const [index, item] of form.items.entries()) {
            if (item.imageFile) {
              try {
                const compressed = await compressImage(item.imageFile);
                const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}.jpg`;
                const filePath = `orders/${businessId}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                  .from("order-images")
                  .upload(filePath, compressed, {
                    contentType: "image/jpeg",
                    upsert: false,
                  });

                if (uploadError) {
                  throw new Error(uploadError.message);
                }

                const { data: { publicUrl } } = supabase.storage
                  .from("order-images")
                  .getPublicUrl(filePath);

                uploadedUrls.push(publicUrl);
                // Track which item this image belongs to (use index for stable key across DB round-trip)
                const mapKey = `item_${index}`;
                if (!itemImagesMap[mapKey]) itemImagesMap[mapKey] = [];
                itemImagesMap[mapKey].push(publicUrl);
              } catch (err) {
                const msg = err instanceof Error ? err.message : "Upload failed";
                toast.error(`Image upload failed for item "${item.product_name}": ${msg}`);
              }
            }
          }
        }

        if (uploadedUrls.length > 0) {
          updatedForm.images = uploadedUrls;
          updatedForm.itemImagesMap = itemImagesMap;
        }

        await onSubmit?.(updatedForm, preview);
        setIsDirty(false);
      } catch (err) {
        toast.error("Failed to save order");
      } finally {
        setSaving(false);
      }
    },
    [form, onSubmit, validate, businessId],
  );

  // ─── Mobile detection ──────────────────────────────────────
  const isMobile = useIsMobile();

  // ─── Keyboard shortcuts (skip on mobile — wizard handles its own) ─
  useEffect(() => {
    if (isMobile) return;

    const onKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in a textarea
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
        if (isTextarea) return; // allow newlines in textarea
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
      <OrderFormWizard
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
        paymentMethods={ordersSettings.orderPaymentMethods.map((m) => ({
          value: m,
          label:
            m === "bank_transfer"
              ? "Bank Transfer"
              : m.charAt(0).toUpperCase() + m.slice(1).replace(/_/g, " "),
        }))}
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
            {initialData ? "Edit Order" : "New Order"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {initialData ? `Editing #${initialData.order_number}` : "Create a new customer order."}
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
            <CustomerDetailsSection
              form={form}
              errors={errors}
              updateForm={updateForm}
              courierStates={courierLocations?.states}
              courierCities={courierLocations?.cities}
            />
          </div>
        </div>

        {/* ─── Column 2: Order Items (33%) ──────────────────── */}
        <div className="w-[33%] shrink-0 overflow-y-auto border-r border-border/50 px-8 py-6">
          <div className="space-y-5">
            <OrderItemsSection
              items={form.items}
              errors={errors}
              expectedDeliveryDate={form.expected_delivery_date}
              onUpdateDeliveryDate={(date) =>
                updateForm("expected_delivery_date", date)
              }
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onRemoveItem={handleRemoveItem}
              categories={categories}
              businessId={businessId}
              onProductSelect={handleProductSelect}
            />
          </div>
        </div>

        {/* ─── Column 3: Payment Details (33%) ───────────────── */}
        <div className="w-[33%] shrink-0 overflow-y-auto px-8 py-6">
          <div className="space-y-5">
            <PaymentSection
              form={{
                discount: form.discount,
                discount_type: form.discount_type,
                delivery_charge: form.delivery_charge,
                advance_paid: form.advance_paid,
                payment_method: form.payment_method,
              }}
              calculations={calculations}
              updateForm={updateForm}
              paymentMethods={ordersSettings.orderPaymentMethods.map((m) => ({
                value: m,
                label:
                  m === "bank_transfer"
                    ? "Bank Transfer"
                    : m.charAt(0).toUpperCase() + m.slice(1).replace(/_/g, " "),
              }))}
            />
            <OrderManagementSection
              form={{
                status: form.status,
                payment_status: form.payment_status,
                order_source: form.order_source,
                waybill_id: form.waybill_id,
              }}
              errors={errors}
              updateForm={updateForm}
              businessId={businessId}
            />


          </div>
        </div>
      </div>

      <Separator />

      {/* ═══════ Sticky Action Bar ════════════════════════════════ */}
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={saving}
            className="text-sm gap-1.5 text-muted-foreground/60 hover:text-destructive"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={saving}
            className="text-sm"
          >
            Cancel
          </Button>
        </div>
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
            {saving ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Order" : "Create Order"}
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
