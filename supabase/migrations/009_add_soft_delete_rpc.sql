-- =============================================
-- Add SECURITY DEFINER RPCs for soft-deleting products & inventory
-- Migration 009: Bypass RLS for soft deletes by using a
--   security definer function that explicitly checks ownership.
-- =============================================
--
-- Problem: The RLS UPDATE policy blocks .update({ deleted_at }) even
-- with explicit WITH CHECK. This RPC bypasses RLS entirely while
-- still enforcing business-scoped access via explicit SQL checks.
--
-- Usage:
--   SELECT soft_delete_products(ARRAY['uuid1','uuid2',...]);
--   SELECT soft_delete_inventory_items(ARRAY['uuid1','uuid2',...]);

-- ─── Products ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.soft_delete_products(p_ids UUID[])
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_business_id UUID;
  v_deleted     INT := 0;
  v_not_found   INT := 0;
  v_now         TIMESTAMPTZ := now();
BEGIN
  SELECT business_id INTO v_business_id
  FROM public.profiles
  WHERE user_id = auth.uid();

  IF v_business_id IS NULL THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'No business profile found for your account.');
  END IF;

  UPDATE public.products
  SET deleted_at = v_now, updated_at = v_now
  WHERE id = ANY(p_ids)
    AND business_id = v_business_id
    AND deleted_at IS NULL;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  v_not_found := array_length(p_ids, 1) - v_deleted;

  RETURN jsonb_build_object('ok', TRUE, 'deleted', v_deleted, 'not_found_or_unauthorized', v_not_found);
END;
$$;

REVOKE ALL ON FUNCTION public.soft_delete_products(UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.soft_delete_products(UUID[]) TO authenticated;

-- ─── Inventory Items ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.soft_delete_inventory_items(p_ids UUID[])
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_business_id UUID;
  v_deleted     INT := 0;
  v_not_found   INT := 0;
  v_now         TIMESTAMPTZ := now();
BEGIN
  SELECT business_id INTO v_business_id
  FROM public.profiles
  WHERE user_id = auth.uid();

  IF v_business_id IS NULL THEN
    RETURN jsonb_build_object('ok', FALSE, 'error', 'No business profile found for your account.');
  END IF;

  UPDATE public.inventory_items
  SET deleted_at = v_now, updated_at = v_now
  WHERE id = ANY(p_ids)
    AND business_id = v_business_id
    AND deleted_at IS NULL;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  v_not_found := array_length(p_ids, 1) - v_deleted;

  RETURN jsonb_build_object('ok', TRUE, 'deleted', v_deleted, 'not_found_or_unauthorized', v_not_found);
END;
$$;

REVOKE ALL ON FUNCTION public.soft_delete_inventory_items(UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.soft_delete_inventory_items(UUID[]) TO authenticated;
