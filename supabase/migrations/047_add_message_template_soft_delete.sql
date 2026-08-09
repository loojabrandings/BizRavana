-- =============================================
-- BizRavana - Tenant-bound Message Template soft delete
-- Migration 047
-- =============================================

-- The SELECT policy intentionally hides rows after deleted_at is set. A normal
-- PostgREST UPDATE therefore cannot return/count the newly hidden row. Keep
-- deleted rows private and perform the transition in a narrowly scoped RPC
-- that derives the tenant from auth.uid() instead of accepting a business ID.
CREATE OR REPLACE FUNCTION public.soft_delete_message_template(
  p_template_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  caller_business_id UUID;
BEGIN
  SELECT p.business_id
    INTO caller_business_id
  FROM public.profiles AS p
  WHERE p.user_id = auth.uid();

  IF caller_business_id IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE public.message_templates AS mt
  SET deleted_at = NOW(),
      deleted_by = auth.uid(),
      is_active = FALSE,
      is_default = FALSE,
      updated_by = auth.uid(),
      updated_at = NOW()
  WHERE mt.id = p_template_id
    AND mt.business_id = caller_business_id
    AND mt.deleted_at IS NULL;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.soft_delete_message_template(UUID)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.soft_delete_message_template(UUID)
  TO authenticated;
