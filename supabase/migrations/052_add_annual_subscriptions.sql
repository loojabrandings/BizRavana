-- =============================================
-- Annual subscription support
-- Migration 052
--
-- Adds yearly pricing to subscription_plans and a billing_period to the
-- businesses / payment records so the checkout and the activation functions
-- can issue 30-day or 1-year terms. Monthly behaviour is preserved: monthly
-- payments keep stacking 30 days on top of the current term.
-- =============================================

-- 1. Yearly price per plan (0 = not offered). Values mirror the marketing
--    site pricing page (2 months free on the annual commitment):
--      Basic    12,000 LKR/year  (equiv 1,000/month)
--      Standard 23,400 LKR/year  (equiv 1,950/month)
--      Premium  42,000 LKR/year  (equiv 3,500/month)
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS yearly_price DECIMAL(10, 2) NOT NULL DEFAULT 0;

UPDATE public.subscription_plans
SET yearly_price = CASE lower(name)
    WHEN 'basic'    THEN 12000.00
    WHEN 'standard' THEN 23400.00
    WHEN 'premium'  THEN 42000.00
    ELSE 0
  END,
  updated_at = now()
WHERE yearly_price = 0;

-- 2. Track the billing period of the current subscription on the business so
--    renewal stacking knows whether a new payment continues the same term or
--    starts a fresh one. NULL means "no paid term yet" and is treated as
--    monthly everywhere it matters.
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS billing_period TEXT
  CHECK (billing_period IS NULL OR billing_period IN ('monthly', 'yearly'));

UPDATE public.businesses
SET billing_period = 'monthly'
WHERE billing_period IS NULL
  AND account_status = 'active'
  AND plan_id IS NOT NULL
  AND subscription_ends_at IS NOT NULL;

-- 3. Record which period each payment paid for. Existing rows predate annual
--    subscriptions, so they default to monthly.
ALTER TABLE public.payhere_payments
  ADD COLUMN IF NOT EXISTS billing_period TEXT NOT NULL DEFAULT 'monthly'
  CHECK (billing_period IN ('monthly', 'yearly'));

ALTER TABLE public.payment_proofs
  ADD COLUMN IF NOT EXISTS billing_period TEXT NOT NULL DEFAULT 'monthly'
  CHECK (billing_period IN ('monthly', 'yearly'));

-- =============================================
-- Activation helper: one locked source of truth for the term math.
-- Renewal stacking only happens when the business is active, is already on
-- the same plan, is still inside its term, AND the new payment uses the same
-- billing period (monthly → +30 days, yearly → +1 year). Any other case
-- (plan change, expired term, or switching monthly ↔ yearly) starts a fresh
-- term from now, per the annual-subscription spec.
-- =============================================
CREATE OR REPLACE FUNCTION public.plan_subscription_term(
  p_account_status TEXT,
  p_current_plan_id UUID,
  p_current_billing_period TEXT,
  p_subscription_started_at TIMESTAMPTZ,
  p_subscription_ends_at TIMESTAMPTZ,
  p_plan_id UUID,
  p_billing_period TEXT
)
RETURNS TABLE (
  activation_kind TEXT,
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_period_interval INTERVAL;
BEGIN
  v_period_interval := CASE p_billing_period
    WHEN 'yearly'  THEN INTERVAL '1 year'
    ELSE INTERVAL '30 days'
  END;

  IF p_account_status = 'active'
    AND p_current_plan_id = p_plan_id
    AND p_subscription_ends_at IS NOT NULL
    AND p_subscription_ends_at > v_now
    AND COALESCE(p_current_billing_period, 'monthly') = p_billing_period
  THEN
    activation_kind := 'renewal';
    subscription_start := COALESCE(p_subscription_started_at, v_now);
    subscription_end := p_subscription_ends_at + v_period_interval;
  ELSE
    activation_kind := CASE
      WHEN p_current_plan_id IS NULL THEN 'new_or_expired'
      WHEN p_current_plan_id IS DISTINCT FROM p_plan_id THEN 'plan_change'
      WHEN COALESCE(p_current_billing_period, 'monthly') IS DISTINCT FROM p_billing_period THEN 'billing_period_change'
      ELSE 'new_or_expired'
    END;
    subscription_start := v_now;
    subscription_end := v_now + v_period_interval;
  END IF;

  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.plan_subscription_term(
  TEXT, UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.plan_subscription_term(
  TEXT, UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT
) FROM anon;
REVOKE ALL ON FUNCTION public.plan_subscription_term(
  TEXT, UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT
) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.plan_subscription_term(
  TEXT, UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, UUID, TEXT
) TO service_role;

-- =============================================
-- PayHere activation: now billing-period aware. The pre-annual signature is
-- dropped so no caller can silently keep using the hardcoded 30-day logic.
-- =============================================
DROP FUNCTION IF EXISTS public.complete_payhere_payment(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB
);

CREATE OR REPLACE FUNCTION public.complete_payhere_payment(
  p_order_id TEXT,
  p_payhere_payment_id TEXT,
  p_status_message TEXT,
  p_payment_method TEXT,
  p_card_holder_name TEXT,
  p_card_no TEXT,
  p_card_expiry TEXT,
  p_notification_payload JSONB,
  p_billing_period TEXT DEFAULT 'monthly'
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
  v_term RECORD;
BEGIN
  IF p_billing_period NOT IN ('monthly', 'yearly') THEN
    RAISE EXCEPTION 'Invalid billing period';
  END IF;

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

  -- The term is derived from the payment record's billing period (set at
  -- checkout), never trusted from the callback payload.
  SELECT *
  INTO v_term
  FROM public.plan_subscription_term(
    v_business.account_status,
    v_business.plan_id,
    v_business.billing_period,
    v_business.subscription_started_at,
    v_business.subscription_ends_at,
    v_payment.plan_id,
    COALESCE(v_payment.billing_period, p_billing_period)
  );

  v_activation_kind := v_term.activation_kind;
  v_subscription_start := v_term.subscription_start;
  v_subscription_end := v_term.subscription_end;

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
      billing_period = COALESCE(v_payment.billing_period, p_billing_period),
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
      'billing_period', COALESCE(v_payment.billing_period, p_billing_period),
      'activation_kind', v_activation_kind,
      'previous_plan_id', v_business.plan_id,
      'previous_account_status', v_business.account_status,
      'previous_billing_period', v_business.billing_period,
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
      'billing_period', COALESCE(v_payment.billing_period, p_billing_period),
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
    'billing_period', COALESCE(v_payment.billing_period, p_billing_period),
    'subscription_ends_at', v_subscription_end
  );
END;
$$;

REVOKE ALL ON FUNCTION public.complete_payhere_payment(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_payhere_payment(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT
) FROM anon;
REVOKE ALL ON FUNCTION public.complete_payhere_payment(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT
) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.complete_payhere_payment(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT
) TO service_role;

-- =============================================
-- Bank-transfer submission: charge the right price per billing period and
-- remember which period the receipt covers. The pre-annual signature is
-- dropped for the same reason as complete_payhere_payment above.
-- =============================================
DROP FUNCTION IF EXISTS public.create_bank_transfer_payment(
  UUID, UUID, TEXT, TEXT, UUID
);

CREATE OR REPLACE FUNCTION public.create_bank_transfer_payment(
  p_business_id UUID,
  p_plan_id UUID,
  p_proof_image_path TEXT,
  p_notes TEXT,
  p_submitted_by UUID,
  p_billing_period TEXT DEFAULT 'monthly'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_plan public.subscription_plans%ROWTYPE;
  v_business public.businesses%ROWTYPE;
  v_payment_id UUID;
  v_amount DECIMAL(10, 2);
BEGIN
  IF p_billing_period NOT IN ('monthly', 'yearly') THEN
    RAISE EXCEPTION 'Invalid billing period';
  END IF;

  SELECT *
  INTO v_plan
  FROM public.subscription_plans
  WHERE id = p_plan_id
    AND is_active = true
    AND CASE
      WHEN p_billing_period = 'yearly' THEN yearly_price > 0
      ELSE monthly_price > 0
    END;

  IF NOT FOUND OR lower(v_plan.name) IN ('trial', 'enterprise') THEN
    RAISE EXCEPTION 'This plan is not available for bank-transfer checkout';
  END IF;

  v_amount := CASE
    WHEN p_billing_period = 'yearly' THEN v_plan.yearly_price
    ELSE v_plan.monthly_price
  END;

  SELECT *
  INTO v_business
  FROM public.businesses
  WHERE id = p_business_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Business not found';
  END IF;

  IF v_business.account_status IN ('suspended', 'archived', 'deleted') THEN
    RAISE EXCEPTION 'This business is not eligible to submit a subscription payment';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.payment_proofs
    WHERE business_id = p_business_id
      AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'A payment is already waiting for review';
  END IF;

  INSERT INTO public.payment_proofs (
    business_id,
    plan_id,
    amount,
    payment_method,
    proof_image_path,
    notes,
    status,
    submitted_by,
    previous_account_status,
    billing_period
  )
  VALUES (
    p_business_id,
    p_plan_id,
    v_amount,
    'bank_transfer',
    p_proof_image_path,
    NULLIF(trim(p_notes), ''),
    'pending',
    p_submitted_by,
    v_business.account_status,
    p_billing_period
  )
  RETURNING id INTO v_payment_id;

  IF v_business.account_status IN ('trial', 'trial_expired', 'expired') THEN
    UPDATE public.businesses
    SET account_status = 'pending_payment',
        updated_at = now()
    WHERE id = p_business_id;
  END IF;

  RETURN v_payment_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_bank_transfer_payment(
  UUID, UUID, TEXT, TEXT, UUID, TEXT
) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_bank_transfer_payment(
  UUID, UUID, TEXT, TEXT, UUID, TEXT
) FROM anon;
REVOKE ALL ON FUNCTION public.create_bank_transfer_payment(
  UUID, UUID, TEXT, TEXT, UUID, TEXT
) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_bank_transfer_payment(
  UUID, UUID, TEXT, TEXT, UUID, TEXT
) TO service_role;

-- =============================================
-- Bank-transfer review: same stacking rules as PayHere, driven by the
-- billing period recorded on the receipt.
-- =============================================
CREATE OR REPLACE FUNCTION public.review_bank_transfer_payment(
  p_payment_id UUID,
  p_action TEXT,
  p_admin_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_payment public.payment_proofs%ROWTYPE;
  v_business public.businesses%ROWTYPE;
  v_now TIMESTAMPTZ := now();
  v_subscription_start TIMESTAMPTZ;
  v_subscription_end TIMESTAMPTZ;
  v_activation_kind TEXT;
  v_term RECORD;
  v_admin_id UUID := auth.uid();
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Super admin access required';
  END IF;

  IF p_action NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'Invalid review action';
  END IF;

  SELECT *
  INTO v_payment
  FROM public.payment_proofs
  WHERE id = p_payment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found';
  END IF;

  IF v_payment.status <> 'pending' THEN
    RAISE EXCEPTION 'This payment has already been reviewed';
  END IF;

  SELECT *
  INTO v_business
  FROM public.businesses
  WHERE id = v_payment.business_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Business not found';
  END IF;

  IF p_action = 'approve' THEN
    SELECT *
    INTO v_term
    FROM public.plan_subscription_term(
      v_business.account_status,
      v_business.plan_id,
      v_business.billing_period,
      v_business.subscription_started_at,
      v_business.subscription_ends_at,
      v_payment.plan_id,
      COALESCE(v_payment.billing_period, 'monthly')
    );

    v_activation_kind := v_term.activation_kind;
    v_subscription_start := v_term.subscription_start;
    v_subscription_end := v_term.subscription_end;

    UPDATE public.payment_proofs
    SET status = 'approved',
        admin_note = NULLIF(trim(p_admin_note), ''),
        approved_by = v_admin_id,
        approved_at = v_now,
        reviewed_at = v_now
    WHERE id = p_payment_id;

    UPDATE public.businesses
    SET plan_id = v_payment.plan_id,
        account_status = 'active',
        billing_period = COALESCE(v_payment.billing_period, 'monthly'),
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
      v_admin_id,
      'payment_approved',
      'business',
      v_payment.business_id,
      jsonb_build_object(
        'payment_id', v_payment.id,
        'plan_id', v_payment.plan_id,
        'amount', v_payment.amount,
        'billing_period', COALESCE(v_payment.billing_period, 'monthly'),
        'activation_kind', v_activation_kind,
        'subscription_ends_at', v_subscription_end,
        'admin_note', NULLIF(trim(p_admin_note), '')
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
      'Payment approved',
      'Your bank transfer was approved and your subscription is now active.',
      jsonb_build_object(
        'payment_id', v_payment.id,
        'plan_id', v_payment.plan_id,
        'amount', v_payment.amount,
        'billing_period', COALESCE(v_payment.billing_period, 'monthly'),
        'subscription_ends_at', v_subscription_end,
        'action_url', '/dashboard/subscription'
      )
    );
  ELSE
    UPDATE public.payment_proofs
    SET status = 'rejected',
        admin_note = NULLIF(trim(p_admin_note), ''),
        approved_by = NULL,
        approved_at = NULL,
        reviewed_at = v_now
    WHERE id = p_payment_id;

    IF v_business.account_status = 'pending_payment' THEN
      UPDATE public.businesses
      SET account_status = COALESCE(
            v_payment.previous_account_status,
            CASE
              WHEN v_business.trial_ends_at IS NOT NULL
                AND v_business.trial_ends_at > v_now
              THEN 'trial'
              ELSE 'trial_expired'
            END
          ),
          updated_at = v_now
      WHERE id = v_payment.business_id;
    END IF;

    INSERT INTO public.admin_activity_log (
      admin_id,
      action,
      target_type,
      target_id,
      details
    )
    VALUES (
      v_admin_id,
      'payment_rejected',
      'business',
      v_payment.business_id,
      jsonb_build_object(
        'payment_id', v_payment.id,
        'plan_id', v_payment.plan_id,
        'amount', v_payment.amount,
        'billing_period', COALESCE(v_payment.billing_period, 'monthly'),
        'admin_note', NULLIF(trim(p_admin_note), '')
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
      'payment_rejected',
      'Payment needs attention',
      COALESCE(
        'Your bank transfer was not approved. ' || NULLIF(trim(p_admin_note), ''),
        'Your bank transfer was not approved. Please review the payment details and submit a new receipt.'
      ),
      jsonb_build_object(
        'payment_id', v_payment.id,
        'plan_id', v_payment.plan_id,
        'amount', v_payment.amount,
        'billing_period', COALESCE(v_payment.billing_period, 'monthly'),
        'action_url', '/dashboard/subscription'
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'payment_id', v_payment.id,
    'business_id', v_payment.business_id,
    'action', p_action,
    'subscription_ends_at',
      CASE WHEN p_action = 'approve' THEN v_subscription_end ELSE NULL END
  );
END;
$$;

REVOKE ALL ON FUNCTION public.review_bank_transfer_payment(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.review_bank_transfer_payment(UUID, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.review_bank_transfer_payment(UUID, TEXT, TEXT) TO authenticated;
