-- =============================================
-- BizRavana - Unified order message templates
-- Migration 042
-- =============================================

-- The current UI uses one order template across the order table and preview.
-- Preserve legacy contexts while explicitly allowing the unified context used
-- for newly created templates.
ALTER TABLE public.message_templates
  DROP CONSTRAINT IF EXISTS message_templates_template_context_check;

ALTER TABLE public.message_templates
  ADD CONSTRAINT message_templates_template_context_check
  CHECK (
    template_context IN (
      'order_whatsapp',
      'order_table_whatsapp',
      'order_preview_whatsapp',
      'quotation_preview_whatsapp'
    )
  );
