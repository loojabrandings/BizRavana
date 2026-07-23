-- =============================================
-- Add automated subscription expiry via pg_cron
-- Migration 020: Cron job to transition expired
--   trials → trial_expired and expired
--   subscriptions → expired statuses.
-- =============================================
--
-- This migration adds:
--   1. A SECURITY DEFINER function `expire_subscriptions()`
--      that transitions accounts whose trial/subscription
--      end date has passed.
--   2. Scheduling via pg_cron to run daily at midnight.
--
-- The function is safe to run multiple times (idempotent).
--
-- Schedule command (executed below):
--   cron.schedule('expire-subscriptions', '0 0 * * *',
--     $$SELECT public.expire_subscriptions()$$);
--
-- To manually run:  SELECT public.expire_subscriptions();

-- ═══════════════════════════════════════════════════════════════
-- 1. ENABLE pg_cron EXTENSION
-- ═══════════════════════════════════════════════════════════════
-- pg_cron is pre-installed on Supabase but not enabled by default.
-- Note: This requires the database to be created with the pg_cron
-- extension available. On Supabase, this is available by default.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- ═══════════════════════════════════════════════════════════════
-- 2. CREATE EXPIRE SUBSCRIPTIONS FUNCTION
-- ═══════════════════════════════════════════════════════════════
-- This function handles two transitions:
--   a) trial → trial_expired  (when trial_ends_at < now())
--   b) active → expired       (when subscription_ends_at < now())
--
-- For trial → trial_expired:
--   - Sets data_delete_after to 14 days from now (retention window)
--   - (The read-only mode banner uses this date to show retention countdown)
--
-- For active → expired:
--   - Sets data_delete_after to 14 days from now
--   - (Same retention window for subscription expiry)

CREATE OR REPLACE FUNCTION public.expire_subscriptions()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_expired_trials      INT := 0;
  v_expired_subs        INT := 0;
  v_errors              TEXT[] := '{}';
  v_now                 TIMESTAMPTZ := now();
  v_retention_period    INTERVAL := INTERVAL '14 days';
  v_business            RECORD;
BEGIN
  -- ── a) Expire trials ────────────────────────────────────
  -- Transition accounts where trial_ends_at has passed
  -- but they haven't submitted a payment proof (still in 'trial' status).
  --
  -- If a user submitted a payment proof (account_status = 'pending_payment'),
  -- we don't touch them — they're already in the admin review flow.
  FOR v_business IN
    SELECT id, owner_id, name
    FROM public.businesses
    WHERE account_status = 'trial'
      AND trial_ends_at < v_now
      AND deleted_at IS NULL
      AND (data_delete_after IS NULL OR data_delete_after <= v_now)
    FOR UPDATE SKIP LOCKED
  LOOP
    BEGIN
      UPDATE public.businesses
      SET
        account_status = 'trial_expired',
        data_delete_after = v_now + v_retention_period,
        updated_at = v_now
      WHERE id = v_business.id;

      v_expired_trials := v_expired_trials + 1;
    EXCEPTION WHEN OTHERS THEN
      v_errors := array_append(v_errors,
        'Failed to expire trial for business ' || v_business.id || ': ' || SQLERRM);
    END;
  END LOOP;

  -- ── b) Expire subscriptions ─────────────────────────────
  -- Transition accounts where subscription_ends_at has passed
  -- and they are currently 'active'.
  FOR v_business IN
    SELECT id, owner_id, name
    FROM public.businesses
    WHERE account_status = 'active'
      AND subscription_ends_at < v_now
      AND deleted_at IS NULL
      AND (data_delete_after IS NULL OR data_delete_after <= v_now)
    FOR UPDATE SKIP LOCKED
  LOOP
    BEGIN
      UPDATE public.businesses
      SET
        account_status = 'expired',
        data_delete_after = v_now + v_retention_period,
        updated_at = v_now
      WHERE id = v_business.id;

      v_expired_subs := v_expired_subs + 1;
    EXCEPTION WHEN OTHERS THEN
      v_errors := array_append(v_errors,
        'Failed to expire subscription for business ' || v_business.id || ': ' || SQLERRM);
    END;
  END LOOP;

  -- ── Return summary ──────────────────────────────────────
  RETURN jsonb_build_object(
    'ok',                TRUE,
    'expired_trials',    v_expired_trials,
    'expired_subs',      v_expired_subs,
    'errors',            CASE WHEN array_length(v_errors, 1) > 0
                            THEN jsonb_build_array(v_errors)
                            ELSE '[]'::jsonb END
  );
END;
$$;

-- Revoke public access, grant to service_role only (for cron)
REVOKE ALL ON FUNCTION public.expire_subscriptions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_subscriptions() TO service_role;

-- ═══════════════════════════════════════════════════════════════
-- 3. SCHEDULE VIA pg_cron
-- ═══════════════════════════════════════════════════════════════
-- Runs every day at midnight (server timezone, typically UTC).
-- Safe to run multiple times — idempotent (uses FOR UPDATE SKIP LOCKED
-- to avoid processing the same business twice).

-- Wrap scheduling in a DO block so the migration won't fail
-- if pg_cron is not available on this particular instance.
-- Use $do$ delimiter to avoid conflict with inner $$ quoting.
DO $do$
BEGIN
  -- Remove any existing schedule with the same name (idempotent)
  PERFORM cron.unschedule('expire-subscriptions');

  -- Schedule the job
  PERFORM cron.schedule(
    'expire-subscriptions',  -- unique job name
    '0 0 * * *',            -- cron expression: every day at midnight
    $$SELECT public.expire_subscriptions()$$
  );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Could not schedule pg_cron job ''expire-subscriptions'': %', SQLERRM;
END;
$do$;

-- ═══════════════════════════════════════════════════════════════
-- 4. ADD INDEX FOR EFFICIENT LOOKUPS
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_businesses_expiry_lookup
  ON public.businesses (account_status, trial_ends_at, subscription_ends_at)
  WHERE deleted_at IS NULL;
