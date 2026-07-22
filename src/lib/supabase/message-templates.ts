"use client";

// ─── Types ─────────────────────────────────────────────────────────

export type TemplateContext =
  | "order_table_whatsapp"
  | "order_preview_whatsapp"
  | "quotation_preview_whatsapp";

export interface MessageTemplate {
  id: string;
  business_id: string;
  template_context: TemplateContext;
  title: string;
  channel: string;
  content: string;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

// ─── Context Mapping ───────────────────────────────────────────────

/** Maps UI context to DB context (appends _whatsapp suffix) */
export function toDbContext(uiContext: string): TemplateContext {
  return `${uiContext}_whatsapp` as TemplateContext;
}

/** Maps DB context back to UI context */
export function toUiContext(dbContext: TemplateContext): string {
  return dbContext.replace("_whatsapp", "");
}

// ─── CRUD Operations via API Routes ────────────────────────────────

const API_BASE = "/api/message-templates";

async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  return res.json();
}

/**
 * Fetch all active (non-deleted) templates for a business, optionally filtered by context.
 * When context is omitted, returns templates for ALL contexts.
 */
export async function fetchTemplates(
  businessId: string,
  context?: TemplateContext,
): Promise<MessageTemplate[]> {
  const params = new URLSearchParams();
  if (context) params.set("context", context);
  return apiFetch<MessageTemplate[]>(`${API_BASE}?${params.toString()}`);
}

/**
 * Fetch all active templates for a business across all contexts.
 */
export async function fetchAllTemplates(businessId: string): Promise<MessageTemplate[]> {
  return fetchTemplates(businessId);
}

/**
 * Create a new template.
 */
export async function createTemplate(
  businessId: string,
  context: TemplateContext,
  title: string,
  content: string,
  userId?: string | null,
): Promise<MessageTemplate> {
  return apiFetch<MessageTemplate>(API_BASE, {
    method: "POST",
    body: JSON.stringify({
      template_context: context,
      title,
      content,
      userId,
    }),
  });
}

/**
 * Update a template's title and content.
 */
export async function updateTemplate(
  id: string,
  title: string,
  content: string,
  userId?: string | null,
): Promise<MessageTemplate> {
  return apiFetch<MessageTemplate>(API_BASE, {
    method: "PATCH",
    body: JSON.stringify({ id, title, content, userId }),
  });
}

/**
 * Set a template as the default for its business+context.
 */
export async function setDefaultTemplate(
  id: string,
  businessId: string,
  context: TemplateContext,
  userId?: string | null,
): Promise<void> {
  await apiFetch<void>(API_BASE, {
    method: "PUT",
    body: JSON.stringify({ id, template_context: context, userId }),
  });
}

/**
 * Soft-delete a template.
 */
export async function deleteTemplate(
  id: string,
  userId?: string | null,
): Promise<void> {
  const params = new URLSearchParams({ id });
  await apiFetch<void>(`${API_BASE}?${params.toString()}`, {
    method: "DELETE",
    body: JSON.stringify({ userId }),
  });
}

/**
 * Duplicate a template with "(Copy)" appended to the title.
 */
export async function duplicateTemplate(
  template: MessageTemplate,
  userId?: string | null,
): Promise<MessageTemplate> {
  return createTemplate(
    template.business_id,
    template.template_context,
    `${template.title} (Copy)`,
    template.content,
    userId,
  );
}

/**
 * Get the user's business_id from their profile.
 */
export async function getUserBusinessId(): Promise<string | null> {
  const { createClient } = await import("./client");
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("user_id", session.user.id)
    .single();

  return data?.business_id ?? null;
}

/**
 * Get the current user's ID from session.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { createClient } = await import("./client");
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}
