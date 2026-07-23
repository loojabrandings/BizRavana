"use client";

import { useState, useCallback } from "react";
import { AlertTriangle, ClipboardPaste } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SRI_LANKA_DISTRICTS } from "@/constants/districts";
import { parseCustomerText } from "@/lib/customer-parser";
import type { OrderFormData } from "./types";
import type { CourierState, CourierCity } from "@/lib/delivery/courier-utils";

interface CustomerDetailsSectionProps {
  form: OrderFormData;
  errors: Record<string, string>;
  updateForm: <K extends keyof OrderFormData>(
    key: K,
    value: OrderFormData[K],
  ) => void;
  /** Optional courier-synced states/districts — overrides static list when available */
  courierStates?: CourierState[];
  /** Optional courier-synced cities — enables city dropdown filtered by district */
  courierCities?: CourierCity[];
}

export function CustomerDetailsSection({
  form,
  errors,
  updateForm,
  courierStates,
  courierCities,
}: CustomerDetailsSectionProps) {
  // ─── Paste Dialog State ────────────────────────────────────────
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");

  // Build courier data for the parser (if available)
  const courierData = courierStates && courierCities && courierStates.length > 0
    ? {
        cities: courierCities,
        states: courierStates,
      }
    : undefined;

  // ─── Handle Parse & Fill ───────────────────────────────────────
  const handleParseFill = useCallback(() => {
    if (!pasteText.trim()) {
      toast.error("Paste customer details first");
      return;
    }

    const parsed = parseCustomerText(pasteText, {
      courierData,
      districts: courierStates && courierStates.length > 0
        ? courierStates.map((s) => s.name)
        : SRI_LANKA_DISTRICTS,
    });

    // Apply parsed fields to the form
    if (parsed.name) updateForm("customer_name", parsed.name);
    if (parsed.phone) updateForm("phone", parsed.phone);
    if (parsed.address) updateForm("address", parsed.address);
    if (parsed.district) updateForm("district", parsed.district);
    if (parsed.city) updateForm("nearest_city", parsed.city);

    setPasteOpen(false);
    setPasteText("");

    const fieldsFilled = [
      parsed.name && "Name",
      parsed.phone && "Phone",
      parsed.district && "District",
      parsed.city && "City",
    ].filter(Boolean);

    toast.success("Customer details parsed", {
      description: `Filled: ${fieldsFilled.join(", ")}`,
    });
  }, [pasteText, courierData, courierStates, updateForm]);

  // Use courier states when available, otherwise fall back to static districts
  const districtOptions = courierStates && courierStates.length > 0
    ? courierStates.map((s) => s.name)
    : SRI_LANKA_DISTRICTS;

  // Filter cities by selected district (state) using the state name
  const citiesForDistrict = courierCities && courierStates
    ? (() => {
        const selectedState = courierStates.find((s) => s.name === form.district);
        if (!selectedState) return [];
        return courierCities
          .filter((c) => c.state_id === selectedState.id)
          .map((c) => c.name)
          .sort();
      })()
    : [];

  const hasCourierCities = citiesForDistrict.length > 0;
  return (
    <>
      {/* ─── System Info Row ───────────────────────────────────── */}
      <div className="space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
          System Information
        </h2>

        <div className="flex items-center justify-between gap-5">
          <div className="flex-1 space-y-1.5">
            <span className="text-sm text-muted-foreground">Order Number</span>
            <Input
              type="text"
              value={form.order_number}
              readOnly
              className="bg-muted/40 h-9"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <span className="text-sm text-muted-foreground">Date</span>
            <Input
              type="date"
              value={form.created_date}
              readOnly
              className="bg-muted/40 h-9"
            />
          </div>
        </div>
      </div>

      {/* ─── Customer Details ──────────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
            Customer Details
          </h2>
          <button
            type="button"
            onClick={() => setPasteOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/[0.06] px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/[0.12] hover:border-primary/30"
          >
            <ClipboardPaste className="size-3" />
            Smart Parser
          </button>
        </div>

        {/* Customer Name */}
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">
            Customer Name <span className="text-destructive">*</span>
          </span>
          <Input
            type="text"
            placeholder="e.g. Kamal Perera"
            value={form.customer_name}
            onChange={(e) => updateForm("customer_name", e.target.value)}
            className={cn("h-9", errors.customer_name && "border-destructive")}
          />
          {errors.customer_name && (
            <p className="text-sm text-destructive">{errors.customer_name}</p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">
            Address <span className="text-destructive">*</span>
          </span>
          <Textarea
            placeholder="Delivery address"
            value={form.address}
            onChange={(e) => updateForm("address", e.target.value)}
            className={cn(
              "min-h-[76px]",
              errors.address && "border-destructive",
            )}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address}</p>
          )}
        </div>

        {/* WhatsApp + Phone */}
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <span className="text-sm text-muted-foreground">
              WhatsApp Number
            </span>
            <Input
              type="tel"
              placeholder="e.g. 077 123 4567"
              value={form.whatsapp}
              onChange={(e) => updateForm("whatsapp", e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-sm text-muted-foreground">
              Phone Number <span className="text-destructive">*</span>
            </span>
            <Input
              type="tel"
              placeholder="e.g. 077 123 4567"
              value={form.phone}
              onChange={(e) => updateForm("phone", e.target.value)}
              className={cn("h-9", errors.phone && "border-destructive")}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* District + Nearest City */}
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <span className="text-sm text-muted-foreground">District</span>
            <SearchableSelect
              value={form.district}
              onValueChange={(v) => {
                updateForm("district", v);
                // Reset city when district changes (if using courier cities)
                if (hasCourierCities) {
                  updateForm("nearest_city", "");
                }
              }}
              options={districtOptions}
              placeholder="Select district"
              searchPlaceholder="Search districts..."
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-sm text-muted-foreground">Nearest City</span>
            {hasCourierCities ? (
              <SearchableSelect
                value={form.nearest_city}
                onValueChange={(v) => updateForm("nearest_city", v)}
                options={citiesForDistrict}
                placeholder="Select city"
                searchPlaceholder="Search cities..."
              />
            ) : (
              <Input
                type="text"
                placeholder="e.g. Colombo 05"
                value={form.nearest_city}
                onChange={(e) => updateForm("nearest_city", e.target.value)}
                className="h-9"
              />
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <span className="text-sm text-muted-foreground">Email</span>            <Input
              type="email"
              placeholder="customer@example.com"
              value={form.email}
              onChange={(e) => updateForm("email", e.target.value)}
              className="h-9"
            />
        </div>
      </div>

      {/* ─── Logistics & Notes ─────────────────────────────────── */}
      <div className="space-y-1.5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
          Logistics &amp; Notes
        </h2>
        <Textarea
          placeholder="General order remarks, delivery instructions, etc."
          value={form.remarks}
          onChange={(e) => updateForm("remarks", e.target.value)}
          className="min-h-[90px]"
        />
      </div>

      {/* ═══════ Smart Parser Dialog ════════════════════════════ */}
      <Dialog open={pasteOpen} onOpenChange={setPasteOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
          <div className="px-6 pt-6 pb-5">
            <DialogHeader className="text-left">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
                  <ClipboardPaste className="size-4 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold">
                    Smart Parser
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground/70 mt-0.5">
                    Paste a WhatsApp message or any text with customer info.
                    Name, phone, district, and city will be auto-detected.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* ── Paste Button + Textarea ───────────────────── */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/60">
                  Paste customer message below
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text) {
                        setPasteText(text);
                        toast.success("Text pasted from clipboard");
                      }
                    } catch {
                      toast.error("Unable to read clipboard", {
                        description:
                          "Press Ctrl+V to paste, or grant clipboard permission.",
                      });
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/30 px-2 py-1 text-xs text-muted-foreground/70 transition-colors hover:bg-muted/60 hover:text-foreground"
                >
                  <ClipboardPaste className="size-3" />
                  Paste
                </button>
              </div>
              <Textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={`e.g. Kamal Perera\nNo 123, Galle Road\n077 123 4567\nColombo`}
                className="min-h-[140px] resize-none"
                autoFocus
              />
            </div>

            {/* ── Warning ───────────────────────────────────────── */}
            <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-warning/20 bg-warning/[0.06] px-3.5 py-2.5">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                Smart Parser results may occasionally be inaccurate. Please
                review all filled fields carefully before creating the order.
              </p>
            </div>
          </div>

          {/* ── Footer ────────────────────────────────────────── */}
          <div className="border-t border-border/10 px-6 py-3.5">
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setPasteOpen(false);
                  setPasteText("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                onClick={handleParseFill}
                className="gap-1.5"
              >
                <ClipboardPaste className="size-3.5" />
                Parse &amp; Fill
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
