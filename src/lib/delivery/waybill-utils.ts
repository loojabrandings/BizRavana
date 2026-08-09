import { createClient } from "@/lib/supabase/client";

// ─── Types ──────────────────────────────────────────────────────────

export type WaybillStatus = "available" | "assigned" | "used" | "invalid";

export interface ManualWaybill {
  id: string;
  business_id: string;
  waybill_id: string;
  provider_id: string | null;
  status: WaybillStatus;
  assigned_order_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  used_at: string | null;
  deleted_at: string | null;
  /** Joined from orders table for display */
  assigned_order_number?: string | null;
}

export interface WaybillSummary {
  total: number;
  available: number;
  assigned: number;
  used: number;
  invalid: number;
}

export interface AddWaybillResult {
  inserted: number;
  duplicates: number;
  invalid: number;
  errors: string[];
}

interface ManualWaybillRow {
  id: string;
  business_id: string;
  waybill_id: string;
  provider_id: string | null;
  status: WaybillStatus;
  assigned_order_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  used_at: string | null;
  deleted_at: string | null;
}

interface ManualWaybillQueryRow extends ManualWaybillRow {
  assigned_order_number?: { order_number: string | null } | null;
}

interface ManualWaybillUpdate {
  status: WaybillStatus;
  updated_at: string;
  used_at?: string | null;
  assigned_order_id?: null;
}

// ─── Constants ─────────────────────────────────────────────────────

const SETTINGS_KEY_WAYBILL_METHOD = "waybill_method";

// ─── Settings ───────────────────────────────────────────────────────

export async function getWaybillMethod(
  businessId: string,
): Promise<"manual" | "auto"> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("business_settings")
      .select("value")
      .eq("business_id", businessId)
      .eq("key", SETTINGS_KEY_WAYBILL_METHOD)
      .maybeSingle();

    if (data?.value === "auto") return "auto";
    return "manual";
  } catch {
    return "manual";
  }
}

export async function setWaybillMethod(
  businessId: string,
  method: "manual" | "auto",
): Promise<void> {
  const supabase = createClient();
  await supabase.from("business_settings").upsert(
    {
      business_id: businessId,
      key: SETTINGS_KEY_WAYBILL_METHOD,
      value: method,
    },
    { onConflict: "business_id, key" },
  );
}

// ─── CRUD ───────────────────────────────────────────────────────────

/** Fetch all manual waybills for a business, optionally filtering by status, search, and provider. */
export async function fetchManualWaybills(
  businessId: string,
  options?: {
    status?: WaybillStatus | "all";
    search?: string;
    providerId?: string | null;
    limit?: number;
    offset?: number;
    /** Sort column and direction. Defaults to ["waybill_id", "asc"]. */
    sortBy?: [string, "asc" | "desc"];
  },
): Promise<{ waybills: ManualWaybill[]; total: number }> {
  const supabase = createClient();
  const {
    status,
    search,
    providerId,
    limit = 100,
    offset = 0,
    sortBy = ["waybill_id", "asc"],
  } = options || {};

  let query = supabase
    .from("manual_waybills")
    .select("*, assigned_order_number:orders!assigned_order_id(order_number)", { count: "exact" })
    .eq("business_id", businessId)
    .is("deleted_at", null);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (providerId !== undefined) {
    if (providerId === null) {
      query = query.is("provider_id", null);
    } else {
      query = query.eq("provider_id", providerId);
    }
  }

  if (search && search.trim()) {
    query = query.ilike("waybill_id", `%${search.trim()}%`);
  }

  query = query.order(sortBy[0], { ascending: sortBy[1] === "asc" })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Failed to fetch manual waybills:", error);
    return { waybills: [], total: 0 };
  }

  const waybills: ManualWaybill[] = (data || []).map((row: ManualWaybillQueryRow) => ({
    id: row.id,
    business_id: row.business_id,
    waybill_id: row.waybill_id,
    provider_id: row.provider_id ?? null,
    status: row.status as WaybillStatus,
    assigned_order_id: row.assigned_order_id,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    used_at: row.used_at,
    deleted_at: row.deleted_at,
    assigned_order_number: row.assigned_order_number?.order_number || null,
  }));

  return { waybills, total: count || 0 };
}

/** Get summary counts for manual waybills, optionally filtered by provider. */
export async function getWaybillSummary(
  businessId: string,
  providerId?: string | null,
): Promise<WaybillSummary> {
  const supabase = createClient();

  let query = supabase
    .from("manual_waybills")
    .select("status, provider_id")
    .eq("business_id", businessId)
    .is("deleted_at", null);

  if (providerId !== undefined) {
    if (providerId === null) {
      query = query.is("provider_id", null);
    } else {
      query = query.eq("provider_id", providerId);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to get waybill summary:", error);
    return { total: 0, available: 0, assigned: 0, used: 0, invalid: 0 };
  }

  const total = data?.length || 0;
  const rows = (data || []) as Pick<ManualWaybillRow, "status">[];
  const available = rows.filter((waybill) => waybill.status === "available").length;
  const assigned = rows.filter((waybill) => waybill.status === "assigned").length;
  const used = rows.filter((waybill) => waybill.status === "used").length;
  const invalid = rows.filter((waybill) => waybill.status === "invalid").length;

  return { total, available, assigned, used, invalid };
}

/** Add a single manual waybill ID. */
export async function addManualWaybill(
  businessId: string,
  waybillId: string,
  userId?: string | null,
  providerId?: string | null,
): Promise<{ success: boolean; error?: string }> {
  const trimmed = waybillId.trim();
  if (!trimmed) {
    return { success: false, error: "Waybill ID is required." };
  }

  const supabase = createClient();

  // Check for existing (including soft-deleted) — match by business + provider + waybill_id
  let existingQuery = supabase
    .from("manual_waybills")
    .select("id, deleted_at")
    .eq("business_id", businessId)
    .eq("waybill_id", trimmed);

  if (providerId !== undefined) {
    if (providerId === null) {
      existingQuery = existingQuery.is("provider_id", null);
    } else {
      existingQuery = existingQuery.eq("provider_id", providerId);
    }
  }

  const { data: existing } = await existingQuery.maybeSingle();

  if (existing) {
    if (existing.deleted_at) {
      // Restore soft-deleted
      await supabase
        .from("manual_waybills")
        .update({ deleted_at: null, status: "available", updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      return { success: true };
    }
    return { success: false, error: "This waybill ID already exists for this courier." };
  }

  const { error } = await supabase.from("manual_waybills").insert({
    business_id: businessId,
    waybill_id: trimmed,
    provider_id: providerId ?? null,
    status: "available",
    created_by: userId || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "This waybill ID already exists for this courier." };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}

/** Add multiple waybill IDs from a text input (newline or comma separated). */
export async function addMultipleWaybills(
  businessId: string,
  input: string,
  userId?: string | null,
  providerId?: string | null,
): Promise<AddWaybillResult> {
  // Parse input: split by newlines or commas
  const rawIds = input
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const result: AddWaybillResult = {
    inserted: 0,
    duplicates: 0,
    invalid: 0,
    errors: [],
  };

  // Check for duplicates within the input itself
  const seen = new Set<string>();
  const uniqueIds = rawIds.filter((id) => {
    const lower = id.toLowerCase();
    if (seen.has(lower)) {
      result.duplicates++;
      return false;
    }
    seen.add(lower);
    return true;
  });

  if (uniqueIds.length === 0) {
    return result;
  }

  // Check existing IDs in DB
  const supabase = createClient();
  let existingQuery = supabase
    .from("manual_waybills")
    .select("waybill_id, deleted_at")
    .eq("business_id", businessId)
    .in("waybill_id", uniqueIds);

  if (providerId !== undefined) {
    if (providerId === null) {
      existingQuery = existingQuery.is("provider_id", null);
    } else {
      existingQuery = existingQuery.eq("provider_id", providerId);
    }
  }

  const { data: existingRows } = await existingQuery;

  const existingMap = new Map<string, boolean>();
  if (existingRows) {
    for (const row of existingRows) {
      existingMap.set(row.waybill_id.toLowerCase(), !row.deleted_at);
    }
  }

  const toInsert = uniqueIds.filter((id) => {
    const lower = id.toLowerCase();
    if (existingMap.has(lower)) {
      if (existingMap.get(lower)) {
        // Active duplicate
        result.duplicates++;
      }
      return false;
    }
    return true;
  });

  if (toInsert.length === 0) {
    return result;
  }

  // Batch insert — include provider_id
  const insertData = toInsert.map((id) => ({
    business_id: businessId,
    waybill_id: id,
    provider_id: providerId ?? null,
    status: "available" as const,
    created_by: userId || null,
  }));

  const { error } = await supabase.from("manual_waybills").insert(insertData);

  if (error) {
    result.errors.push(error.message);
  } else {
    result.inserted = toInsert.length;
  }

  return result;
}

/** Soft-delete a manual waybill (any status). */
export async function deleteManualWaybill(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("manual_waybills")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Clear assignment when deleting
      assigned_order_id: null,
      used_at: null,
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/** Manually update a waybill's status. */
export async function updateWaybillStatus(
  id: string,
  newStatus: WaybillStatus,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const updateData: ManualWaybillUpdate = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  // If marking as used, set used_at
  if (newStatus === "used") {
    updateData.used_at = new Date().toISOString();
  }

  // If marking as available, clear assignment
  if (newStatus === "available") {
    updateData.assigned_order_id = null;
    updateData.used_at = null;
  }

  const { error } = await supabase
    .from("manual_waybills")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/** Mark a waybill as assigned to an order. Also validates provider match if specified. */
export async function assignWaybillToOrder(
  waybillId: string,
  orderId: string,
  providerId?: string | null,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  let query = supabase
    .from("manual_waybills")
    .select("id, status, provider_id")
    .eq("waybill_id", waybillId)
    .eq("status", "available")
    .is("deleted_at", null);

  if (providerId !== undefined) {
    if (providerId === null) {
      query = query.is("provider_id", null);
    } else {
      query = query.eq("provider_id", providerId);
    }
  }

  const { data: waybill } = await query.single();

  if (!waybill) {
    return { success: false, error: "Waybill not available for this courier." };
  }

  const { error } = await supabase
    .from("manual_waybills")
    .update({
      status: "assigned",
      assigned_order_id: orderId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", waybill.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/** Mark a waybill as used (finalized). */
export async function markWaybillAsUsed(
  waybillId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("manual_waybills")
    .update({
      status: "used",
      used_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("waybill_id", waybillId)
    .is("deleted_at", null);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ─── Range Generation ────────────────────────────────────────────

/** Maximum number of waybill IDs per range generation. */
const MAX_RANGE_BATCH = 5000;

export interface GenerateRangeResult {
  requested: number;
  inserted: number;
  duplicates: number;
  invalid: number;
  errors: string[];
}

/**
 * Generate waybill IDs from a numeric range and insert them.
 *
 * @param businessId - Business to add waybills for
 * @param from - Starting number (inclusive)
 * @param to - Ending number (inclusive)
 * @param prefix - Optional fixed prefix (e.g. "RA")
 * @param userId - Optional user ID for created_by tracking
 * @param providerId - Optional courier provider ID to associate these waybills with
 * @returns Summary of the operation
 */
export async function generateWaybillRange(
  businessId: string,
  from: string,
  to: string,
  prefix?: string,
  userId?: string | null,
  providerId?: string | null,
): Promise<GenerateRangeResult> {
  const result: GenerateRangeResult = {
    requested: 0,
    inserted: 0,
    duplicates: 0,
    invalid: 0,
    errors: [],
  };

  const fromStr = from.trim();
  const toStr = to.trim();
  const prefixStr = prefix?.trim() || "";

  // ── Validate ─────────────────────────────────────────────────
  if (!fromStr || !toStr) {
    result.errors.push("Both From and To values are required.");
    return result;
  }

  // Extract numeric parts (strip prefix if included in the value)
  const fromNumeric = fromStr.replace(/^[A-Za-z]*/, "");
  const toNumeric = toStr.replace(/^[A-Za-z]*/, "");

  // Check for leading zeros preservation
  const leadingZerosMatch = fromNumeric.match(/^(0+)/);
  const padLength = leadingZerosMatch ? fromNumeric.length : 0;

  const fromNum = parseInt(fromNumeric, 10);
  const toNum = parseInt(toNumeric, 10);

  if (isNaN(fromNum) || isNaN(toNum)) {
    result.errors.push("From and To must be valid numbers.");
    return result;
  }

  if (fromNum > toNum) {
    result.errors.push("From value must be less than or equal to To value.");
    return result;
  }

  // Check same digit length when leading zeros are used
  if (padLength > 0 && fromNumeric.length !== toNumeric.length) {
    result.errors.push(
      "From and To must contain the same number of digits when leading zeros are used.",
    );
    return result;
  }

  const count = toNum - fromNum + 1;
  result.requested = count;

  if (count > MAX_RANGE_BATCH) {
    result.errors.push(
      `Range exceeds maximum batch size of ${MAX_RANGE_BATCH}. ` +
      `Requested ${count} IDs. Please use a smaller range.`,
    );
    return result;
  }

  // ── Generate IDs ─────────────────────────────────────────────
  const generatedIds: string[] = [];
  for (let i = fromNum; i <= toNum; i++) {
    let numStr = String(i);
    if (padLength > 0) {
      numStr = numStr.padStart(padLength, "0");
    }
    generatedIds.push(prefixStr + numStr);
  }

  // ── Check existing ───────────────────────────────────────────
  const supabase = createClient();
  let existingQuery = supabase
    .from("manual_waybills")
    .select("waybill_id, deleted_at")
    .eq("business_id", businessId)
    .in("waybill_id", generatedIds);

  if (providerId !== undefined) {
    if (providerId === null) {
      existingQuery = existingQuery.is("provider_id", null);
    } else {
      existingQuery = existingQuery.eq("provider_id", providerId);
    }
  }

  const { data: existingRows } = await existingQuery;

  const existingMap = new Map<string, boolean>();
  if (existingRows) {
    for (const row of existingRows) {
      existingMap.set(row.waybill_id.toLowerCase(), !row.deleted_at);
    }
  }

  const toInsert = generatedIds.filter((id) => {
    const lower = id.toLowerCase();
    if (existingMap.has(lower)) {
      if (existingMap.get(lower)) {
        result.duplicates++;
      }
      return false;
    }
    return true;
  });

  if (toInsert.length === 0) {
    return result;
  }

  // ── Batch insert ─────────────────────────────────────────────
  const insertData = toInsert.map((id) => ({
    business_id: businessId,
    waybill_id: id,
    provider_id: providerId ?? null,
    status: "available" as const,
    created_by: userId || null,
  }));

  const { error } = await supabase.from("manual_waybills").insert(insertData);

  if (error) {
    result.errors.push(error.message);
  } else {
    result.inserted = toInsert.length;
  }

  return result;
}

/** Bulk update status for multiple waybills. */
export async function bulkUpdateWaybillStatus(
  ids: string[],
  newStatus: WaybillStatus,
): Promise<{ success: boolean; updated: number; errors: string[] }> {
  if (ids.length === 0) return { success: true, updated: 0, errors: [] };

  const supabase = createClient();
  const now = new Date().toISOString();

  const updateData: ManualWaybillUpdate = {
    status: newStatus,
    updated_at: now,
  };

  if (newStatus === "used") {
    updateData.used_at = now;
  }

  if (newStatus === "available") {
    updateData.assigned_order_id = null;
    updateData.used_at = null;
  }

  const { error } = await supabase
    .from("manual_waybills")
    .update(updateData)
    .in("id", ids);

  if (error) {
    return { success: false, updated: 0, errors: [error.message] };
  }

  return { success: true, updated: ids.length, errors: [] };
}

/** Bulk soft-delete multiple waybills. */
export async function bulkDeleteWaybills(
  ids: string[],
): Promise<{ success: boolean; deleted: number; errors: string[] }> {
  if (ids.length === 0) return { success: true, deleted: 0, errors: [] };

  const supabase = createClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("manual_waybills")
    .update({
      deleted_at: now,
      updated_at: now,
      assigned_order_id: null,
      used_at: null,
    })
    .in("id", ids);

  if (error) {
    return { success: false, deleted: 0, errors: [error.message] };
  }

  return { success: true, deleted: ids.length, errors: [] };
}

/** Get available manual waybills for suggestion, optionally filtered by provider. */
export async function getAvailableWaybills(
  businessId: string,
  searchQuery?: string,
  providerId?: string | null,
): Promise<ManualWaybill[]> {
  const supabase = createClient();

  let query = supabase
    .from("manual_waybills")
    .select("*")
    .eq("business_id", businessId)
    .eq("status", "available")
    .is("deleted_at", null)
    .order("waybill_id", { ascending: true })
    .limit(20);

  if (providerId !== undefined) {
    if (providerId === null) {
      query = query.is("provider_id", null);
    } else {
      query = query.eq("provider_id", providerId);
    }
  }

  if (searchQuery && searchQuery.trim()) {
    query = query.ilike("waybill_id", `%${searchQuery.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch available waybills:", error);
    return [];
  }

  return (data || []).map((row: ManualWaybillRow) => ({
    id: row.id,
    business_id: row.business_id,
    waybill_id: row.waybill_id,
    provider_id: row.provider_id ?? null,
    status: row.status as WaybillStatus,
    assigned_order_id: row.assigned_order_id,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    used_at: row.used_at,
    deleted_at: row.deleted_at,
  }));
}
