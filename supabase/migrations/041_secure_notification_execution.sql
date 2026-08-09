-- =============================================
-- BizRavana - Secure notification execution
-- Migration 041
-- =============================================

-- The original scheduled-delivery query did not group its expiry conditions.
-- Replace it so only due, scheduled broadcasts are selected. Row locks prevent
-- two cron workers from processing the same broadcast concurrently.
CREATE OR REPLACE FUNCTION public.deliver_scheduled_broadcasts()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  broadcast_record RECORD;
  business_record RECORD;
  plan_record RECORD;
  notification_id UUID;
  sent_count INT := 0;
  total_count INT := 0;
BEGIN
  FOR broadcast_record IN
    SELECT nb.*
    FROM public.notification_broadcasts AS nb
    WHERE nb.status = 'scheduled'
      AND nb.scheduled_at <= NOW()
      AND (nb.expires_at IS NULL OR nb.expires_at > NOW())
    ORDER BY nb.scheduled_at ASC
    LIMIT 10
    FOR UPDATE SKIP LOCKED
  LOOP
    FOR business_record IN
      SELECT
        b.id,
        b.name,
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
                COALESCE(
                  broadcast_record.audience_config -> 'business_ids',
                  '[]'::JSONB
                )
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
        'admin',
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
        updated_at = NOW()
    WHERE nb.id = broadcast_record.id;

    total_count := total_count + sent_count;
    sent_count := 0;
  END LOOP;

  RETURN jsonb_build_object(
    'delivered_broadcasts', total_count,
    'processed_at', NOW()
  );
END;
$$;

-- SECURITY DEFINER helpers and cron entry points are internal operations. The
-- function owner and service role retain access; browser roles do not.
REVOKE ALL ON FUNCTION public.create_business_notification(
  UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, JSONB
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_business_notification(
  UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, JSONB
) TO service_role;

REVOKE ALL ON FUNCTION public.notification_already_sent(UUID, TEXT, INT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.notification_already_sent(UUID, TEXT, INT)
  TO service_role;

REVOKE ALL ON FUNCTION public.process_auto_notifications()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_auto_notifications()
  TO service_role;

REVOKE ALL ON FUNCTION public.deliver_scheduled_broadcasts()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.deliver_scheduled_broadcasts()
  TO service_role;

-- This function performs its own Super Admin claim check. Keep it available to
-- verified authenticated sessions, but remove anonymous/default access.
REVOKE ALL ON FUNCTION public.get_user_emails(UUID[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_emails(UUID[]) TO authenticated;
