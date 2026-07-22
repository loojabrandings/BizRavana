-- 015: Add message_templates table for WhatsApp Template Management
-- Supports three contexts: order_table_whatsapp, order_preview_whatsapp, quotation_preview_whatsapp
-- Each business can have multiple templates per context with one default per context.

-- ─── Tables ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS message_templates (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     UUID        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  template_context TEXT       NOT NULL CHECK (template_context IN (
    'order_table_whatsapp',
    'order_preview_whatsapp',
    'quotation_preview_whatsapp'
  )),
  title           TEXT        NOT NULL,
  channel         TEXT        NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp')),
  content         TEXT        NOT NULL,
  is_default      BOOLEAN     NOT NULL DEFAULT false,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  sort_order      INT         NOT NULL DEFAULT 0,
  created_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,
  deleted_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ─── Constraints ────────────────────────────────────────────────────

-- Unique active title within business + context (soft-deleted records excluded)
CREATE UNIQUE INDEX IF NOT EXISTS idx_message_templates_unique_title
  ON message_templates (business_id, template_context, LOWER(title))
  WHERE deleted_at IS NULL;

-- Only one default per business + context (soft-deleted records excluded)
CREATE UNIQUE INDEX IF NOT EXISTS idx_message_templates_unique_default
  ON message_templates (business_id, template_context)
  WHERE is_default = true AND deleted_at IS NULL;

-- ─── Indexes ───────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_message_templates_business
  ON message_templates (business_id);

CREATE INDEX IF NOT EXISTS idx_message_templates_context
  ON message_templates (template_context);

CREATE INDEX IF NOT EXISTS idx_message_templates_active
  ON message_templates (is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_message_templates_default
  ON message_templates (is_default) WHERE is_default = true;

-- ─── RLS ───────────────────────────────────────────────────────────

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Uses the existing get_user_business_id() function from 001_schema.sql
-- (public.profiles with SET search_path, proven to work across all tables)

-- Drop existing policies so this migration is idempotent
DROP POLICY IF EXISTS "view_own_business_templates" ON message_templates;
DROP POLICY IF EXISTS "insert_own_business_templates" ON message_templates;
DROP POLICY IF EXISTS "update_own_business_templates" ON message_templates;
DROP POLICY IF EXISTS "delete_own_business_templates" ON message_templates;

-- SELECT: only active (non-deleted) templates belonging to the user's business
CREATE POLICY "view_own_business_templates"
  ON message_templates
  FOR SELECT
  USING (
    business_id = get_user_business_id()
    AND deleted_at IS NULL
  );

-- INSERT: templates must belong to the user's business
CREATE POLICY "insert_own_business_templates"
  ON message_templates
  FOR INSERT
  WITH CHECK (
    business_id = get_user_business_id()
  );

-- UPDATE: only update templates belonging to the user's business
CREATE POLICY "update_own_business_templates"
  ON message_templates
  FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());

-- DELETE: only delete templates belonging to the user's business
CREATE POLICY "delete_own_business_templates"
  ON message_templates
  FOR DELETE
  USING (business_id = get_user_business_id());
