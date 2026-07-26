-- =============================================
-- Secure the manual bank-transfer payment flow
-- Migration 028
-- =============================================

-- Keep receipt object paths instead of permanent public URLs and preserve
-- enough state to restore an account when a payment is rejected.
ALTER TABLE public.payment_proofs
  ADD COLUMN IF NOT EXISTS proof_image_path TEXT,
  ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS previous_account_status TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE public.payment_proofs
  DROP CONSTRAINT IF EXISTS payment_proofs_previous_account_status_check;

ALTER TABLE public.payment_proofs
  ADD CONSTRAINT payment_proofs_previous_account_status_check
  CHECK (
    previous_account_status IS NULL
    OR previous_account_status IN (
      'trial',
      'trial_expired',
      'pending_payment',
      'active',
      'expired',
      'suspended',
      'archived',
      'deleted'
    )
  );

-- Preserve access to receipts uploaded before this migration after the bucket
-- is made private.
UPDATE public.payment_proofs
SET proof_image_path = split_part(proof_image_url, '/payment-proofs/', 2)
WHERE proof_image_path IS NULL
  AND proof_image_url LIKE '%/payment-proofs/%';

-- Receipt files contain financial information and must not be public.
UPDATE storage.buckets
SET public = false
WHERE id = 'payment-proofs';

DROP POLICY IF EXISTS "public_read_payment_proofs" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_upload_payment_proofs" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_update_payment_proofs" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete_payment_proofs" ON storage.objects;
DROP POLICY IF EXISTS "super_admin_read_payment_proofs" ON storage.objects;

CREATE POLICY "super_admin_read_payment_proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND public.is_super_admin()
);

-- Receipt uploads go through an authenticated server route. Super admins can
-- still list receipts for the existing storage-management screens.

-- Customers may read their own payment history, but all writes must go through
-- the secured server routes / database functions.
DROP POLICY IF EXISTS "business_insert_own" ON public.payment_proofs;
DROP POLICY IF EXISTS "business_update_own" ON public.payment_proofs;
DROP POLICY IF EXISTS "business_delete_own" ON public.payment_proofs;

CREATE OR REPLACE FUNCTION public.prevent_business_billing_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.role() <> 'service_role'
    AND NOT public.is_super_admin()
    AND (
      NEW.plan_id IS DISTINCT FROM OLD.plan_id
      OR NEW.account_status IS DISTINCT FROM OLD.account_status
      OR NEW.trial_started_at IS DISTINCT FROM OLD.trial_started_at
      OR NEW.trial_ends_at IS DISTINCT FROM OLD.trial_ends_at
      OR NEW.subscription_started_at IS DISTINCT FROM OLD.subscription_started_at
      OR NEW.subscription_ends_at IS DISTINCT FROM OLD.subscription_ends_at
      OR NEW.data_delete_after IS DISTINCT FROM OLD.data_delete_after
      OR NEW.deleted_at IS DISTINCT FROM OLD.deleted_at
    )
  THEN
    RAISE EXCEPTION 'Subscription fields can only be changed by an authorized server operation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_business_billing_fields ON public.businesses;
CREATE TRIGGER protect_business_billing_fields
BEFORE UPDATE ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION public.prevent_business_billing_changes();

-- Called only by the authenticated server route after it has verified the
-- current user, business membership, and uploaded receipt.
CREATE OR REPLACE FUNCTION public.create_bank_transfer_payment(
  p_business_id UUID,
  p_plan_id UUID,
  p_proof_image_path TEXT,
  p_notes TEXT,
  p_submitted_by UUID
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
BEGIN
  SELECT *
  INTO v_plan
  FROM public.subscription_plans
  WHERE id = p_plan_id
    AND is_active = true
    AND monthly_price > 0;

  IF NOT FOUND OR lower(v_plan.name) IN ('trial', 'enterprise') THEN
    RAISE EXCEPTION 'This plan is not available for bank-transfer checkout';
  END IF;

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
    previous_account_status
  )
  VALUES (
    p_business_id,
    p_plan_id,
    v_plan.monthly_price,
    'bank_transfer',
    p_proof_image_path,
    NULLIF(trim(p_notes), ''),
    'pending',
    p_submitted_by,
    v_business.account_status
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

REVOKE ALL ON FUNCTION public.create_bank_transfer_payment(UUID, UUID, TEXT, TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_bank_transfer_payment(UUID, UUID, TEXT, TEXT, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.create_bank_transfer_payment(UUID, UUID, TEXT, TEXT, UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_bank_transfer_payment(UUID, UUID, TEXT, TEXT, UUID) TO service_role;

-- Review and subscription activation happen in one locked transaction. A
-- duplicate approval/rejection cannot extend or mutate the subscription twice.
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
    v_subscription_start := CASE
      WHEN v_business.account_status = 'active'
        AND v_business.subscription_started_at IS NOT NULL
      THEN v_business.subscription_started_at
      ELSE v_now
    END;

    v_subscription_end := GREATEST(
      v_now,
      COALESCE(v_business.subscription_ends_at, v_now)
    ) + INTERVAL '30 days';

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
