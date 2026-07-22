"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";
import { SRI_LANKA_DISTRICTS } from "@/constants/districts";
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
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
          Customer Details
        </h2>

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
    </>
  );
}


