-- =============================================
-- Explicitly purge every business-owned table
-- Migration 030
-- =============================================

CREATE OR REPLACE FUNCTION public.purge_business_data(
  p_business_id UUID,
  p_delete_root BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count INTEGER;
  v_counts JSONB := '{}'::JSONB;
BEGIN
  -- Delete dependent/detail rows before their parent rows. This deliberately
  -- does not rely on foreign-key cascade configuration in the deployed schema.

  DELETE FROM public.notification_recipients WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('notification_recipients', v_count);

  DELETE FROM public.team_invitations WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('team_invitations', v_count);

  DELETE FROM public.message_templates WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('message_templates', v_count);

  DELETE FROM public.manual_waybills WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('manual_waybills', v_count);

  DELETE FROM public.tasks WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('tasks', v_count);

  DELETE FROM public.business_settings WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('business_settings', v_count);

  DELETE FROM public.notifications WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('notifications', v_count);

  DELETE FROM public.deliveries WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('deliveries', v_count);

  DELETE FROM public.order_status_history WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('order_status_history', v_count);

  DELETE FROM public.order_items WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('order_items', v_count);

  DELETE FROM public.quotation_items WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('quotation_items', v_count);

  DELETE FROM public.price_snapshots WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('price_snapshots', v_count);

  DELETE FROM public.inventory_transactions WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('inventory_transactions', v_count);

  DELETE FROM public.payment_proofs WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('payment_proofs', v_count);

  DELETE FROM public.expenses WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('expenses', v_count);

  DELETE FROM public.quotations WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('quotations', v_count);

  DELETE FROM public.orders WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('orders', v_count);

  DELETE FROM public.customers WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('customers', v_count);

  DELETE FROM public.products WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('products', v_count);

  DELETE FROM public.inventory_items WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('inventory_items', v_count);

  DELETE FROM public.categories WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('categories', v_count);

  DELETE FROM public.inventory_categories WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('inventory_categories', v_count);

  DELETE FROM public.expense_categories WHERE business_id = p_business_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_counts := v_counts || jsonb_build_object('expense_categories', v_count);

  IF p_delete_root THEN
    DELETE FROM public.profiles WHERE business_id = p_business_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('profiles', v_count);

    DELETE FROM public.businesses WHERE id = p_business_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    v_counts := v_counts || jsonb_build_object('businesses', v_count);
  END IF;

  RETURN jsonb_build_object(
    'business_id', p_business_id,
    'root_deleted', p_delete_root,
    'deleted_counts', v_counts
  );
END;
$$;

REVOKE ALL ON FUNCTION public.purge_business_data(UUID, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.purge_business_data(UUID, BOOLEAN) FROM anon;
REVOKE ALL ON FUNCTION public.purge_business_data(UUID, BOOLEAN) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.purge_business_data(UUID, BOOLEAN) TO service_role;
