-- Allow permanent business deletion to work across installations where some
-- optional business-owned tables have not been created.
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
  v_table TEXT;
  v_deleted_count INTEGER;
  v_deleted_counts JSONB := '{}'::JSONB;
  v_skipped_missing_tables TEXT[] := ARRAY[]::TEXT[];
  v_business_tables CONSTANT TEXT[] := ARRAY[
    'notification_recipients',
    'team_invitations',
    'message_templates',
    'manual_waybills',
    'tasks',
    'business_settings',
    'notifications',
    'deliveries',
    'order_status_history',
    'order_items',
    'quotation_items',
    'price_snapshots',
    'inventory_transactions',
    'payment_proofs',
    'expenses',
    'quotations',
    'orders',
    'customers',
    'products',
    'inventory_items',
    'categories',
    'inventory_categories',
    'expense_categories'
  ];
BEGIN
  FOREACH v_table IN ARRAY v_business_tables
  LOOP
    IF pg_catalog.to_regclass('public.' || v_table) IS NULL THEN
      v_deleted_counts :=
        v_deleted_counts || pg_catalog.jsonb_build_object(v_table, 0);
      v_skipped_missing_tables :=
        pg_catalog.array_append(v_skipped_missing_tables, v_table);
      CONTINUE;
    END IF;

    EXECUTE pg_catalog.format(
      'DELETE FROM public.%I WHERE business_id = $1',
      v_table
    )
    USING p_business_id;

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    v_deleted_counts :=
      v_deleted_counts ||
      pg_catalog.jsonb_build_object(v_table, v_deleted_count);
  END LOOP;

  IF p_delete_root THEN
    IF pg_catalog.to_regclass('public.profiles') IS NULL THEN
      v_deleted_counts :=
        v_deleted_counts || pg_catalog.jsonb_build_object('profiles', 0);
      v_skipped_missing_tables :=
        pg_catalog.array_append(v_skipped_missing_tables, 'profiles');
    ELSE
      DELETE FROM public.profiles
      WHERE business_id = p_business_id;

      GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
      v_deleted_counts :=
        v_deleted_counts ||
        pg_catalog.jsonb_build_object('profiles', v_deleted_count);
    END IF;

    IF pg_catalog.to_regclass('public.businesses') IS NULL THEN
      v_deleted_counts :=
        v_deleted_counts || pg_catalog.jsonb_build_object('businesses', 0);
      v_skipped_missing_tables :=
        pg_catalog.array_append(v_skipped_missing_tables, 'businesses');
    ELSE
      DELETE FROM public.businesses
      WHERE id = p_business_id;

      GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
      v_deleted_counts :=
        v_deleted_counts ||
        pg_catalog.jsonb_build_object('businesses', v_deleted_count);
    END IF;
  END IF;

  RETURN pg_catalog.jsonb_build_object(
    'business_id', p_business_id,
    'delete_root', p_delete_root,
    'deleted_counts', v_deleted_counts,
    'skipped_missing_tables', pg_catalog.to_jsonb(v_skipped_missing_tables)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.purge_business_data(UUID, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.purge_business_data(UUID, BOOLEAN) FROM anon;
REVOKE ALL ON FUNCTION public.purge_business_data(UUID, BOOLEAN) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.purge_business_data(UUID, BOOLEAN) TO service_role;
