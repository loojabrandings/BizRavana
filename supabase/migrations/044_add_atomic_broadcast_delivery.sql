-- =============================================
-- BizRavana - Atomic manual broadcast delivery
-- Migration 044
-- =============================================

-- Manual delivery previously checked for recipients and inserted them in
-- separate API queries. Two concurrent requests could both pass that check.
-- Serialize every delivery attempt on the broadcast row so manual delivery
-- also coordinates with the scheduled worker introduced in migration 041.
CREATE OR REPLACE FUNCTION public.deliver_notification_broadcast(
  p_broadcast_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  broadcast_record public.notification_broadcasts%ROWTYPE;
  business_record RECORD;
  plan_record RECORD;
  notification_id UUID;
  sent_count INT := 0;
BEGIN
  SELECT nb.*
    INTO broadcast_record
  FROM public.notification_broadcasts AS nb
  WHERE nb.id = p_broadcast_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;

  IF broadcast_record.status NOT IN ('draft', 'scheduled') THEN
    RETURN jsonb_build_object(
      'status', 'conflict',
      'broadcast_status', broadcast_record.status
    );
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.notification_recipients AS nr
    WHERE nr.broadcast_id = p_broadcast_id
  ) THEN
    RETURN jsonb_build_object('status', 'already_delivered');
  END IF;

  IF broadcast_record.audience_type = 'selected' THEN
    IF jsonb_typeof(
      broadcast_record.audience_config -> 'business_ids'
    ) IS DISTINCT FROM 'array' THEN
      RETURN jsonb_build_object('status', 'invalid_audience');
    END IF;

    IF jsonb_array_length(
      broadcast_record.audience_config -> 'business_ids'
    ) = 0 THEN
      RETURN jsonb_build_object('status', 'invalid_audience');
    END IF;
  END IF;

  FOR business_record IN
    SELECT
      b.id,
      b.owner_id,
      b.account_status,
      b.plan_id
    FROM public.businesses AS b
    WHERE b.deleted_at IS NULL
      AND (
        broadcast_record.audience_type = 'all'
        OR (
          broadcast_record.audience_type = 'active'
          AND b.account_status = 'active'
        )
        OR (
          broadcast_record.audience_type = 'trial'
          AND b.account_status = 'trial'
        )
        OR (
          broadcast_record.audience_type = 'expired'
          AND b.account_status IN ('expired', 'trial_expired')
        )
        OR (
          broadcast_record.audience_type = 'suspended'
          AND b.account_status = 'suspended'
        )
        OR (
          broadcast_record.audience_type LIKE '%_plan'
          AND b.plan_id IS NOT NULL
        )
        OR (
          broadcast_record.audience_type = 'selected'
          AND EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text(
              broadcast_record.audience_config -> 'business_ids'
            ) AS selected_business(id)
            WHERE selected_business.id = b.id::TEXT
          )
        )
      )
  LOOP
    IF broadcast_record.audience_type IN (
      'basic_plan',
      'standard_plan',
      'premium_plan',
      'enterprise_plan'
    ) THEN
      SELECT sp.*
        INTO plan_record
      FROM public.subscription_plans AS sp
      WHERE sp.id = business_record.plan_id;

      CONTINUE WHEN plan_record.name IS NULL
        OR LOWER(plan_record.name) <> REPLACE(
          broadcast_record.audience_type,
          '_plan',
          ''
        );
    END IF;

    SELECT public.create_business_notification(
      business_record.id,
      business_record.owner_id,
      'admin_broadcast',
      broadcast_record.title,
      broadcast_record.message,
      broadcast_record.category,
      broadcast_record.priority,
      broadcast_record.source,
      broadcast_record.action_label,
      broadcast_record.action_url,
      broadcast_record.id
    )
      INTO notification_id;

    sent_count := sent_count + 1;
  END LOOP;

  UPDATE public.notification_broadcasts AS nb
  SET status = 'sent',
      sent_at = NOW(),
      recipient_count = sent_count,
      read_count = 0,
      updated_at = NOW()
  WHERE nb.id = p_broadcast_id;

  RETURN jsonb_build_object(
    'status', 'delivered',
    'delivered', sent_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.deliver_notification_broadcast(UUID)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.deliver_notification_broadcast(UUID)
  TO service_role;
