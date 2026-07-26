-- =============================================
-- PayHere checkout, callback verification state,
-- and idempotent subscription activation
-- Migration 032
-- =============================================

CREATE TABLE public.payhere_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  order_id TEXT NOT NULL UNIQUE,
  merchant_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'LKR' CHECK (currency = 'LKR'),
  status TEXT NOT NULL DEFAULT 'created'
    CHECK (status IN (
      'created',
      'pending',
      'success',
      'canceled',
      'failed',
      'chargedback',
      'invalid'
    )),
  payhere_payment_id TEXT,
  payment_method TEXT,
  status_code INTEGER,
  status_message TEXT,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  customer_country TEXT NOT NULL,
  card_holder_name TEXT,
  card_no TEXT,
  card_expiry TEXT,
  signature_verified BOOLEAN NOT NULL DEFAULT FALSE,
  notification_payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  previous_plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  previous_account_status TEXT,
  previous_subscription_started_at TIMESTAMPTZ,
  previous_subscription_ends_at TIMESTAMPTZ,
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_notified_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX payhere_payments_business_created_idx
  ON public.payhere_payments (business_id, created_at DESC);

CREATE INDEX payhere_payments_status_idx
  ON public.payhere_payments (status);

CREATE UNIQUE INDEX payhere_payments_payhere_payment_id_idx
  ON public.payhere_payments (payhere_payment_id)
  WHERE payhere_payment_id IS NOT NULL;

ALTER TABLE public.payhere_payments ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.payhere_payments TO authenticated;
GRANT ALL ON public.payhere_payments TO service_role;

CREATE POLICY "business_read_own_payhere_payments"
ON public.payhere_payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.user_id = auth.uid()
      AND profiles.business_id = payhere_payments.business_id
  )
);

CREATE POLICY "super_admin_read_payhere_payments"
ON public.payhere_payments
FOR SELECT
TO authenticated
USING (public.is_super_admin());

-- Only the service-role API can create or mutate PayHere payment records.
-- This function is called after the notification endpoint has validated the
-- merchant, amount, currency, and PayHere signature.
CREATE OR REPLACE FUNCTION public.complete_payhere_payment(
  p_order_id TEXT,
  p_payhere_payment_id TEXT,
  p_status_message TEXT,
  p_payment_method TEXT,
  p_card_holder_name TEXT,
  p_card_no TEXT,
  p_card_expiry TEXT,
  p_notification_payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_payment public.payhere_payments%ROWTYPE;
  v_business public.businesses%ROWTYPE;
  v_now TIMESTAMPTZ := now();
  v_subscription_start TIMESTAMPTZ;
  v_subscription_end TIMESTAMPTZ;
  v_activation_kind TEXT;
BEGIN
  SELECT *
  INTO v_payment
  FROM public.payhere_payments
  WHERE order_id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PayHere payment not found';
  END IF;

  -- PayHere may retry notifications. Never extend the subscription twice.
  IF v_payment.activated_at IS NOT NULL THEN
    RETURN pg_catalog.jsonb_build_object(
      'payment_id', v_payment.id,
      'business_id', v_payment.business_id,
      'order_id', v_payment.order_id,
      'already_activated', true,
      'subscription_ends_at', (
        SELECT subscription_ends_at
        FROM public.businesses
        WHERE id = v_payment.business_id
      )
    );
  END IF;

  SELECT *
  INTO v_business
  FROM public.businesses
  WHERE id = v_payment.business_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Business not found';
  END IF;

  IF v_business.account_status = 'active'
    AND v_business.plan_id = v_payment.plan_id
    AND v_business.subscription_ends_at IS NOT NULL
    AND v_business.subscription_ends_at > v_now
  THEN
    v_activation_kind := 'renewal';
    v_subscription_start :=
      COALESCE(v_business.subscription_started_at, v_now);
    v_subscription_end :=
      v_business.subscription_ends_at + INTERVAL '30 days';
  ELSE
    v_activation_kind := CASE
      WHEN v_business.plan_id IS DISTINCT FROM v_payment.plan_id
        THEN 'plan_change'
      ELSE 'new_or_expired'
    END;
    v_subscription_start := v_now;
    v_subscription_end := v_now + INTERVAL '30 days';
  END IF;

  UPDATE public.payhere_payments
  SET status = 'success',
      payhere_payment_id = NULLIF(trim(p_payhere_payment_id), ''),
      payment_method = NULLIF(trim(p_payment_method), ''),
      status_code = 2,
      status_message = NULLIF(trim(p_status_message), ''),
      card_holder_name = NULLIF(trim(p_card_holder_name), ''),
      card_no = NULLIF(trim(p_card_no), ''),
      card_expiry = NULLIF(trim(p_card_expiry), ''),
      signature_verified = true,
      notification_payload = COALESCE(p_notification_payload, '{}'::JSONB),
      last_notified_at = v_now,
      paid_at = v_now,
      activated_at = v_now,
      updated_at = v_now
  WHERE id = v_payment.id;

  UPDATE public.businesses
  SET plan_id = v_payment.plan_id,
      account_status = 'active',
      subscription_started_at = v_subscription_start,
      subscription_ends_at = v_subscription_end,
      data_delete_after = NULL,
      updated_at = v_now
  WHERE id = v_payment.business_id;

  INSERT INTO public.admin_activity_log (
    admin_id,
    action,
    target_type,
    target_id,
    details
  )
  VALUES (
    NULL,
    'payhere_subscription_activated',
    'payhere_payment',
    v_payment.id,
    pg_catalog.jsonb_build_object(
      'payment_id', v_payment.id,
      'payhere_payment_id', NULLIF(trim(p_payhere_payment_id), ''),
      'order_id', v_payment.order_id,
      'business_id', v_payment.business_id,
      'plan_id', v_payment.plan_id,
      'amount', v_payment.amount,
      'currency', v_payment.currency,
      'activation_kind', v_activation_kind,
      'previous_plan_id', v_business.plan_id,
      'previous_account_status', v_business.account_status,
      'previous_subscription_ends_at', v_business.subscription_ends_at,
      'subscription_started_at', v_subscription_start,
      'subscription_ends_at', v_subscription_end
    )
  );

  INSERT INTO public.notifications (
    business_id,
    user_id,
    type,
    title,
    message,
    data
  )
  VALUES (
    v_payment.business_id,
    v_business.owner_id,
    'payment_approved',
    'Card payment successful',
    'Your PayHere payment was successful and your subscription is now active.',
    pg_catalog.jsonb_build_object(
      'payment_id', v_payment.id,
      'order_id', v_payment.order_id,
      'plan_id', v_payment.plan_id,
      'amount', v_payment.amount,
      'subscription_ends_at', v_subscription_end,
      'action_url', '/dashboard/subscription'
    )
  );

  RETURN pg_catalog.jsonb_build_object(
    'payment_id', v_payment.id,
    'business_id', v_payment.business_id,
    'order_id', v_payment.order_id,
    'already_activated', false,
    'activation_kind', v_activation_kind,
    'subscription_ends_at', v_subscription_end
  );
END;
$$;

REVOKE ALL ON FUNCTION public.complete_payhere_payment(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_payhere_payment(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB
) FROM anon;
REVOKE ALL ON FUNCTION public.complete_payhere_payment(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB
) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.complete_payhere_payment(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB
) TO service_role;

-- Keep PayHere rows covered by the schema-aware business purge used by the
-- super-admin permanent-delete feature.
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
    'payhere_payments',
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
