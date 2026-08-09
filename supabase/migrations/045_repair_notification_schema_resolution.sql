-- =============================================
-- BizRavana - Repair notification schema resolution
-- Migration 045
-- =============================================

-- Migration 025 hardened these functions with an empty search_path but left
-- their table references unqualified. That makes delivery fail at runtime
-- with `relation "notifications" does not exist`. Keep the hardened search
-- path and explicitly resolve every application object through public.
CREATE OR REPLACE FUNCTION public.create_business_notification(
  p_business_id UUID,
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_category TEXT DEFAULT 'general',
  p_priority TEXT DEFAULT 'normal',
  p_source TEXT DEFAULT 'system',
  p_action_label TEXT DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_broadcast_id UUID DEFAULT NULL,
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    business_id,
    user_id,
    type,
    title,
    message,
    category,
    priority,
    source,
    action_label,
    action_url,
    broadcast_id,
    data,
    created_at
  ) VALUES (
    p_business_id,
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_category,
    p_priority,
    p_source,
    p_action_label,
    p_action_url,
    p_broadcast_id,
    p_data,
    NOW()
  )
  RETURNING id INTO notification_id;

  INSERT INTO public.notification_recipients (
    broadcast_id,
    notification_id,
    business_id,
    user_id,
    delivered_at
  ) VALUES (
    p_broadcast_id,
    notification_id,
    p_business_id,
    p_user_id,
    NOW()
  );

  RETURN notification_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.notification_already_sent(
  p_business_id UUID,
  p_type TEXT,
  p_since_hours INT DEFAULT 48
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.notifications AS n
    WHERE n.business_id = p_business_id
      AND n.type = p_type
      AND n.created_at > NOW() - (p_since_hours || ' hours')::INTERVAL
  );
END;
$$;

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
