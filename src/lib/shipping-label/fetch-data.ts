// ─── Shipping Label Data Fetching ──────────────────────────────────
// Queries the order snapshot and business profile from Supabase
// to generate the A5 shipping label.

import { createClient } from "@/lib/supabase/client";
import { usePreferences } from "@/stores/preferences-store";
import type {
  ShippingLabelData,
  SenderInfo,
  ReceiverInfo,
  HandlingInstruction,
} from "./types";

// ─── SETTINGS KEYS (mirrors courier-settings.tsx) ────────────────
const SETTINGS_KEYS = {
  selected_courier: "courier_selected_provider",
  shipping_label_handling: "shipping_label_handling",
  shipping_label_optional_note: "shipping_label_optional_note",
} as const;

// ─── Fetch Result ─────────────────────────────────────────────────

export interface FetchLabelDataResult {
  data: ShippingLabelData | null;
  error: string | null;
}

// ─── Fetch Label Data ─────────────────────────────────────────────
// Queries the order and business data needed for label generation.
// Returns null + error message if anything goes wrong.

export async function fetchLabelData(
  orderId: string,
): Promise<FetchLabelDataResult> {
  try {
    const supabase = createClient();

    // --- Get the current session to identify the user ---
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return { data: null, error: "You must be logged in." };
    }

    // --- Get the user's profile to find their business_id ---
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id")
      .eq("user_id", session.user.id)
      .single();

    const businessId = (profile as { business_id: string | null } | null)
      ?.business_id;
    if (!businessId) {
      return { data: null, error: "No business found for your account." };
    }

    // --- Fetch the order ---
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "order_number, waybill_id, customer_name, customer_address, customer_phone, customer_whatsapp, total, advance_paid, created_at",
      )
      .eq("id", orderId)
      .eq("business_id", businessId)
      .single();

    if (orderError || !order) {
      return {
        data: null,
        error: orderError
          ? `Failed to fetch order: ${orderError.message}`
          : "Order not found.",
      };
    }

    // --- Fetch the business profile (sender info + logo) ---
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("name, phone, address, logo_url")
      .eq("id", businessId)
      .single();

    if (businessError || !business) {
      return {
        data: null,
        error: businessError
          ? `Failed to fetch business profile: ${businessError.message}`
          : "Business profile not found.",
      };
    }

    // --- Fetch business_settings for courier name + label defaults ---
    const { data: settings } = await supabase
      .from("business_settings")
      .select("key, value")
      .eq("business_id", businessId);

    const settingsMap: Record<string, string> = {};
    if (settings) {
      settings.forEach((s) => {
        settingsMap[s.key] = String(s.value);
      });
    }

    // --- Resolve courier name ---
    const providerSlug = settingsMap[SETTINGS_KEYS.selected_courier] || "";
    const PROVIDER_LABELS: Record<string, string> = {
      royal_express: "Royal Express",
    };
    const courierName = providerSlug
      ? PROVIDER_LABELS[providerSlug] || providerSlug
      : "";

    // --- Resolve handling instructions ---
    const handlingRaw = settingsMap[SETTINGS_KEYS.shipping_label_handling];
    let handlingInstructions: HandlingInstruction[] = [];
    if (handlingRaw) {
      try {
        const parsed = JSON.parse(handlingRaw);
        if (Array.isArray(parsed)) {
          handlingInstructions = parsed.filter(
            (h): h is HandlingInstruction =>
              ["fragile", "keep_dry", "this_side_up", "glass", "do_not_bend"].includes(h),
          );
        }
      } catch {
        // ignore parse errors, default to empty
      }
    }

    // --- Resolve optional note ---
    const optionalNote = settingsMap[SETTINGS_KEYS.shipping_label_optional_note] || "";

    // --- Resolve date option ---
    const dateOption = settingsMap["shipping_label_date_option"] || "dispatch";

    // --- Calculate COD value ---
    const total = Number(order.total || 0);
    const advancePaid = Number(order.advance_paid || 0);
    const codAmount = Math.max(0, total - advancePaid);

    // --- Get currency code from preferences ---
    const currencyCode = usePreferences.getState().currency || "LKR";

    // --- Determine label date based on user preference ---
    // "dispatch" = use order's created_at, "generated" = use current date
    const labelDate =
      dateOption === "generated"
        ? new Date().toISOString().slice(0, 10)
        : order.created_at
          ? String(order.created_at).slice(0, 10)
          : new Date().toISOString().slice(0, 10);

    // --- Build the sender info ---
    const sender: SenderInfo = {
      businessName: String(business.name || ""),
      businessPhone: String(business.phone || ""),
      businessAddress: String(business.address || ""),
      businessLogoUrl: business.logo_url ? String(business.logo_url) : null,
    };

    // --- Build the receiver info ---
    const receiver: ReceiverInfo = {
      customerName: String(order.customer_name || ""),
      address: String(order.customer_address || ""),
      phone: order.customer_phone || null,
      whatsapp: order.customer_whatsapp || null,
      codAmount,
    };

    // --- Build the full label data ---
    const labelData: ShippingLabelData = {
      waybillId: String(order.waybill_id || ""),
      sender,
      receiver,
      orderNumber: String(order.order_number || ""),
      orderId,
      currencyCode,
      contactNumber: order.customer_phone || order.customer_whatsapp || null,
      courierName,
      handlingInstructions,
      optionalNote,
      labelDate,
    };

    return { data: labelData, error: null };
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    console.error("fetchLabelData error:", err);
    return { data: null, error: msg };
  }
}

// ─── Fetch Business Sender Info Only ──────────────────────────────
// Lightweight fetch for reprint validation or label preview.
// Returns sender info without requiring an order context.

export async function fetchSenderInfo(): Promise<{
  data: SenderInfo | null;
  error: string | null;
}> {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return { data: null, error: "You must be logged in." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id")
      .eq("user_id", session.user.id)
      .single();

    const businessId = (profile as { business_id: string | null } | null)
      ?.business_id;
    if (!businessId) {
      return { data: null, error: "No business found." };
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("name, phone, address, logo_url")
      .eq("id", businessId)
      .single();

    if (!business) {
      return { data: null, error: "Business profile not found." };
    }

    return {
      data: {
        businessName: String(business.name || ""),
        businessPhone: String(business.phone || ""),
        businessAddress: String(business.address || ""),
        businessLogoUrl: business.logo_url ? String(business.logo_url) : null,
      },
      error: null,
    };
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "An unexpected error occurred.";
    return { data: null, error: msg };
  }
}
