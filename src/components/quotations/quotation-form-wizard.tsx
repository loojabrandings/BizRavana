"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { QuotationCustomerSection } from "./quotation-customer-section";
import { QuotationItemsSection } from "./quotation-items-section";
import { QuotationFinancialSection } from "./quotation-financial-section";
import { QuotationFormReviewStep } from "./quotation-form-review-step";
import type {
  QuotationFormData,
  QuotationFormLineItem,
  QuotationFormCalculations,
} from "./types";
import type { ProductResult } from "@/components/orders/product-search-popover";
import type { CourierLocations } from "@/lib/delivery/courier-utils";

// ─── Constants ─────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Customer", shortLabel: "Customer" },
  { id: 2, label: "Items", shortLabel: "Items" },
  { id: 3, label: "Financial", shortLabel: "Financial" },
  { id: 4, label: "Review", shortLabel: "Review" },
] as const;

// ─── Props ─────────────────────────────────────────────────────────

interface QuotationFormWizardProps {
  form: QuotationFormData;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  calculations: QuotationFormCalculations;
  categories: string[];
  businessId: string | null;
  saving: boolean;
  isEditing?: boolean;
  isDirty: boolean;
  courierLocations: CourierLocations | null;
  updateForm: <K extends keyof QuotationFormData>(
    key: K,
    value: QuotationFormData[K],
  ) => void;
  handleAddItem: () => void;
  handleUpdateItem: (index: number, updates: Partial<QuotationFormLineItem>) => void;
  handleRemoveItem: (index: number) => void;
  handleProductSelect: (product: ProductResult) => void;
  handleSave: (preview: boolean) => Promise<void>;
  handleCancel: () => void;
}

// ─── Step Validation ───────────────────────────────────────────────

function validateStep(
  step: number,
  form: QuotationFormData,
  setErrors: (errors: Record<string, string>) => void,
): boolean {
  const errs: Record<string, string> = {};

  if (step === 1) {
    if (!form.customer_name.trim()) errs["customer_name"] = "Required";
    if (!form.address.trim()) errs["address"] = "Required";
    if (!form.phone.trim()) errs["phone"] = "Required";
  } else if (step === 2) {
    if (form.items.length === 0) {
      errs["items"] = "Add at least one item";
    } else {
      form.items.forEach((item, i) => {
        if (!item.product_name.trim())
          errs[`items.${i}.product_name`] = "Required";
        if (item.quantity < 1) errs[`items.${i}.quantity`] = "Min 1";
      });
    }
  } else if (step === 3) {
    if (!form.status) errs["status"] = "Required";
  }

  setErrors(errs);
  return Object.keys(errs).length === 0;
}

// ─── Progress Indicator ────────────────────────────────────────────

function ProgressIndicator({
  currentStep,
  completedSteps,
  onStepClick,
  isValidating,
}: {
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
  isValidating: boolean;
}) {
  return (
    <nav aria-label="Quotation form steps" className="px-4 pt-4 pb-2">
      <ol className="flex items-center w-full">
        {STEPS.map((step, i) => {
          const isActive = step.id === currentStep;
          const isCompleted = completedSteps.has(step.id);
          const isFuture = step.id > currentStep;

          let stateClass = "";
          if (isActive) {
            stateClass = "text-primary border-primary";
          } else if (isCompleted) {
            stateClass = "text-primary border-primary/40 cursor-pointer";
          } else {
            stateClass = "text-muted-foreground/40 border-muted-foreground/20";
          }

          return (
            <li key={step.id} className="flex items-center flex-1">
              {/* Left spacer — invisible for first step, connector line otherwise */}
              <div
                className={cn(
                  "flex-1 transition-colors",
                  i > 0 && "h-px",
                  i > 0 && (
                    step.id - 1 < currentStep || completedSteps.has(step.id - 1)
                      ? "bg-primary/40"
                      : "bg-border/50"
                  ),
                )}
              />
              {/* Step button */}
              <button
                type="button"
                onClick={() => {
                  if (isValidating) return;
                  if (isCompleted || step.id < currentStep) {
                    onStepClick(step.id);
                  } else if (step.id === currentStep + 1) {
                    onStepClick(step.id);
                  }
                }}
                disabled={isFuture && !isCompleted}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "flex items-center gap-1.5 shrink-0 p-2.5 -m-2.5 transition-colors",
                  stateClass,
                  !isFuture && !isActive && "hover:text-primary/80",
                )}
              >
                {/* Step circle */}
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold leading-none transition-colors",
                    isActive && "border-primary bg-primary/10",
                    isCompleted && "border-primary bg-primary text-primary-foreground",
                    isFuture && "border-muted-foreground/20",
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-3" />
                  ) : (
                    step.id
                  )}
                </span>
                {/* Label */}
                <span
                  className={cn(
                    "text-[11px] font-medium truncate hidden sm:inline",
                    isActive && "text-foreground",
                    isCompleted && "text-primary",
                    isFuture && "text-muted-foreground/40",
                  )}
                >
                  {step.label}
                </span>
              </button>
              {/* Right spacer — invisible for last step, connector line otherwise */}
              <div
                className={cn(
                  "flex-1 transition-colors",
                  i < STEPS.length - 1 && "h-px",
                  i < STEPS.length - 1 && (
                    step.id < currentStep || completedSteps.has(step.id)
                      ? "bg-primary/40"
                      : "bg-border/50"
                  ),
                )}
              />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ─── Step Content ──────────────────────────────────────────────────

function StepContent({
  step,
  form,
  errors,
  calculations,
  categories,
  businessId,
  courierLocations,
  updateForm,
  handleAddItem,
  handleUpdateItem,
  handleRemoveItem,
  handleProductSelect,
  onEditStep,
}: {
  step: number;
  form: QuotationFormData;
  errors: Record<string, string>;
  calculations: QuotationFormCalculations;
  categories: string[];
  businessId: string | null;
  courierLocations: CourierLocations | null;
  updateForm: <K extends keyof QuotationFormData>(
    key: K,
    value: QuotationFormData[K],
  ) => void;
  handleAddItem: () => void;
  handleUpdateItem: (index: number, updates: Partial<QuotationFormLineItem>) => void;
  handleRemoveItem: (index: number) => void;
  handleProductSelect: (product: ProductResult) => void;
  onEditStep: (step: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to first error when validation fails
  useEffect(() => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0 || !containerRef.current) return;

    const firstErrorField = containerRef.current.querySelector(
      '[data-error="true"], .border-destructive, [aria-invalid="true"]',
    );
    if (firstErrorField) {
      firstErrorField.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      if (firstErrorField instanceof HTMLElement) {
        firstErrorField.focus({ preventScroll: true });
      }
    }
  }, [errors]);

  switch (step) {
    case 1:
      return (
        <div ref={containerRef} className="space-y-6">
          <QuotationCustomerSection
            form={form}
            errors={errors}
            updateForm={updateForm}
            courierStates={courierLocations?.states}
            courierCities={courierLocations?.cities}
          />
        </div>
      );

    case 2:
      return (
        <div ref={containerRef} className="space-y-5">
          <QuotationItemsSection
            items={form.items}
            errors={errors}
            expiryDate={form.expiry_date}
            onUpdateExpiryDate={(date) =>
              updateForm("expiry_date", date)
            }
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
            categories={categories}
            businessId={businessId}
            onProductSelect={handleProductSelect}
          />
        </div>
      );

    case 3:
      return (
        <div ref={containerRef} className="space-y-6">
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
      );

    case 4:
      return (
        <QuotationFormReviewStep
          form={form}
          calculations={calculations}
          onEditStep={onEditStep}
        />
      );

    default:
      return null;
  }
}

// ─── Main Wizard Component ────────────────────────────────────────

export function QuotationFormWizard({
  form,
  errors,
  setErrors,
  calculations,
  categories,
  businessId,
  saving,
  isEditing,
  isDirty,
  courierLocations,
  updateForm,
  handleAddItem,
  handleUpdateItem,
  handleRemoveItem,
  handleProductSelect,
  handleSave,
  handleCancel,
}: QuotationFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    new Set(),
  );
  const [isNavigating, setIsNavigating] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Scroll to top on step change
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentStep]);

  // ─── Handle validation on step change ─────────────────────────

  const canGoNext = useCallback((): boolean => {
    return validateStep(currentStep, form, setErrors);
  }, [currentStep, form, setErrors]);

  const handleNext = useCallback(() => {
    setIsNavigating(true);
    if (!canGoNext()) {
      setIsNavigating(false);
      return;
    }

    // Mark current step as completed
    setCompletedSteps((prev) => new Set(prev).add(currentStep));

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
    setIsNavigating(false);
  }, [currentStep, canGoNext]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleStepClick = useCallback(
    (step: number) => {
      if (step === currentStep) return;

      if (step < currentStep) {
        // Going backward — always allowed
        setCurrentStep(step);
        return;
      }

      // Going forward — validate intermediate steps
      if (step === currentStep + 1) {
        if (canGoNext()) {
          setCompletedSteps((prev) => new Set(prev).add(currentStep));
          setCurrentStep(step);
        }
        return;
      }

      // Jumping forward multiple steps — validate all intermediate
      for (let s = currentStep; s < step; s++) {
        if (!validateStep(s, form, setErrors)) {
          setCurrentStep(s);
          return;
        }
      }
      setCurrentStep(step);
    },
    [currentStep, form, setErrors, canGoNext],
  );

  // ─── Keyboard: Enter to go next, Escape to cancel ────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isTextarea = tag === "TEXTAREA";

      if (e.key === "Escape") {
        e.preventDefault();
        if (isDirty) {
          setShowUnsavedDialog(true);
        } else {
          handleCancel();
        }
        return;
      }

      if (e.key === "Enter" && !saving && currentStep < 4) {
        if (isTextarea) return;
        e.preventDefault();
        handleNext();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [currentStep, saving, isDirty, handleCancel, handleNext]);

  return (
    <>
      <div className="flex min-h-dvh flex-col glass-card rounded-2xl border-0" ref={topRef}>
        {/* ═══════ Header ════════════════════════════════════════ */}
        <div className="flex items-start justify-between px-4 pt-4 pb-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold tracking-tight">
              {isEditing ? "Edit Quotation" : "New Quotation"}: #{form.quotation_number}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.label}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (isDirty) {
                setShowUnsavedDialog(true);
              } else {
                handleCancel();
              }
            }}
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* ═══════ Progress Indicator ═══════════════════════════ */}
        <ProgressIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
          isValidating={isNavigating}
        />

        <div className="border-t border-border/40 mt-1" />

        {/* ═══════ Scrollable Step Content ═══════════════════════ */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{ paddingBottom: "calc(40px + env(safe-area-inset-bottom))" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <StepContent
                step={currentStep}
                form={form}
                errors={errors}
                calculations={calculations}
                categories={categories}
                businessId={businessId}
                courierLocations={courierLocations}
                updateForm={updateForm}
                handleAddItem={handleAddItem}
                handleUpdateItem={handleUpdateItem}
                handleRemoveItem={handleRemoveItem}
                handleProductSelect={handleProductSelect}
                onEditStep={(step) => {
                  setCurrentStep(step);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ═══════ Sticky Bottom Navigation ═════════════════════ */}
        <div className="sticky bottom-0 border-t border-border/40 bg-background/95 backdrop-blur-md px-4 py-2.5 safe-bottom">
          <div className="flex items-center gap-3">
            {/* Back button */}
            {currentStep > 1 && (
              <Button
                variant="ghost"
                size="lg"
                onClick={handleBack}
                disabled={saving}
                className="flex-1 gap-1.5 text-sm font-medium h-11"
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
            )}

            {/* Spacer when no back */}
            {currentStep === 1 && <div className="flex-1" />}

            {/* Next / Create Quotation */}
            {currentStep < 4 ? (
              <Button
                variant="gradient"
                size="lg"
                onClick={handleNext}
                disabled={saving}
                className="flex-1 text-sm font-medium h-11"
              >
                Next
              </Button>
            ) : (
              <Button
                variant="gradient"
                size="lg"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="flex-1 text-sm font-medium h-11"
              >
                {saving
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                    ? "Update Quotation"
                    : "Create Quotation"}
              </Button>
            )}
          </div>
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
          handleCancel();
        }}
      />
    </>
  );
}
