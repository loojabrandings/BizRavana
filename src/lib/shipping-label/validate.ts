// ─── Shipping Label Validation ────────────────────────────────────
// Validates that all required data is present for label generation.
// Handles phone/WhatsApp fallback logic and returns detailed error info.

import type {
  ShippingLabelData,
  LabelValidationResult,
  FormattedContact,
} from "./types";
import { formatPhoneNumber } from "@/lib/formatters";

// ─── Validation ───────────────────────────────────────────────────
// Checks every required field and returns:
// - valid: boolean — whether the label can be generated
// - missingFields: string[] — human-readable list of what's missing
// Also resolves the contact number (phone → WhatsApp fallback)

export function validateLabelData(
  data: ShippingLabelData,
): LabelValidationResult & { formattedContact?: FormattedContact } {
  const missingFields: string[] = [];

  // ── Waybill ID ──────────────────────────────────────────
  if (!data.waybillId || !data.waybillId.trim()) {
    missingFields.push("Waybill ID");
  }

  // ── Sender Info ─────────────────────────────────────────
  if (!data.sender.businessName || !data.sender.businessName.trim()) {
    missingFields.push("Business name");
  }

  if (!data.sender.businessPhone || !data.sender.businessPhone.trim()) {
    missingFields.push("Business phone number");
  }

  if (!data.sender.businessAddress || !data.sender.businessAddress.trim()) {
    missingFields.push("Business address");
  }

  // ── Receiver Info ───────────────────────────────────────
  if (!data.receiver.customerName || !data.receiver.customerName.trim()) {
    missingFields.push("Customer name");
  }

  if (!data.receiver.address || !data.receiver.address.trim()) {
    missingFields.push("Delivery address");
  }

  // Resolve contact number: prefer phone, fallback to WhatsApp
  const phone = data.receiver.phone?.trim();
  const whatsapp = data.receiver.whatsapp?.trim();
  const hasPhone = !!phone;
  const hasWhatsapp = !!whatsapp;

  if (!hasPhone && !hasWhatsapp) {
    missingFields.push("Customer contact number");
  }

  // ── COD Value ───────────────────────────────────────────
  if (data.receiver.codAmount < 0 || isNaN(data.receiver.codAmount)) {
    missingFields.push("COD value");
  }

  // ── Build result ───────────────────────────────────────
  const result: LabelValidationResult & {
    formattedContact?: FormattedContact;
  } = {
    valid: missingFields.length === 0,
    missingFields,
  };

  // Provide formatted contact info if at least one number exists
  if (hasPhone || hasWhatsapp) {
    const primary = phone || whatsapp!;
    result.formattedContact = {
      display: formatPhoneNumber(primary),
      isWhatsAppFallback: !hasPhone && hasWhatsapp,
    };

    // If both phone and WhatsApp exist, show both in a combined display
    if (hasPhone && hasWhatsapp && phone !== whatsapp) {
      result.formattedContact.display = `${formatPhoneNumber(phone)} / ${formatPhoneNumber(whatsapp)}`;
    }
  }

  return result;
}

// ─── Quick Validation Check ───────────────────────────────────────
// Returns true only if all required fields are present.
// Useful for gate checks before generating the label.

export function canGenerateLabel(data: ShippingLabelData): boolean {
  return (
    !!data.waybillId?.trim() &&
    !!data.sender.businessName?.trim() &&
    !!data.sender.businessPhone?.trim() &&
    !!data.sender.businessAddress?.trim() &&
    !!data.receiver.customerName?.trim() &&
    !!data.receiver.address?.trim() &&
    (!!data.receiver.phone?.trim() || !!data.receiver.whatsapp?.trim()) &&
    data.receiver.codAmount >= 0 &&
    !isNaN(data.receiver.codAmount)
  );
}
