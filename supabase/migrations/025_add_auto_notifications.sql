-- =============================================
-- Bizravana - Automated Notification Delivery
-- Migration 025: Functions + Cron Jobs
-- =============================================

-- =============================================
-- 1. Helper: Insert notification for a business/user
-- =============================================
CREATE OR REPLACE FUNCTION create_business_notification(
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
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    business_id, user_id, type, title, message, category, priority, source,
    action_label, action_url, broadcast_id, data, created_at
  ) VALUES (
    p_business_id, p_user_id, p_type, p_title, p_message, p_category, p_priority, p_source,
    p_action_label, p_action_url, p_broadcast_id, p_data, now()
  ) RETURNING id INTO v_notification_id;

  -- Also record in notification_recipients
  INSERT INTO notification_recipients (
    broadcast_id, notification_id, business_id, user_id, delivered_at
  ) VALUES (
    p_broadcast_id, v_notification_id, p_business_id, p_user_id, now()
  );

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =============================================
-- 2. Helper: Check if a notification was already sent (dedup)
-- =============================================
CREATE OR REPLACE FUNCTION notification_already_sent(
  p_business_id UUID,
  p_type TEXT,
  p_since_hours INT DEFAULT 48
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM notifications
    WHERE business_id = p_business_id
      AND type = p_type
      AND created_at > now() - (p_since_hours || ' hours')::INTERVAL
  );
END;
$$ LANGUAGE plpgsql STABLE SET search_path = '';

-- =============================================
-- 3. Main Function: Send all automated notifications
-- =============================================
CREATE OR REPLACE FUNCTION process_auto_notifications()
RETURNS JSONB AS $$
DECLARE
  v_biz RECORD;
  v_profile RECORD;
  v_plan RECORD;
  v_notif_id UUID;
  v_result JSONB;
  v_sent_count INT := 0;
  v_rules_enabled BOOLEAN;
  v_days_until_trial_end INT;
  v_days_until_sub_end INT;
  v_usage_pct NUMERIC;
  v_storage_pct NUMERIC;
  v_storage_used_mb NUMERIC;
  v_storage_limit_mb INT;
  v_bucket_size NUMERIC;
BEGIN
  -- Only proceed if rules are globally enabled (check by counting enabled rules)
  SELECT EXISTS (SELECT 1 FROM notification_rules WHERE is_enabled = true) INTO v_rules_enabled;
  IF NOT v_rules_enabled THEN
    RETURN jsonb_build_object('skipped', true, 'reason', 'no_rules_enabled');
  END IF;

  -- ── A. Trial Ending: 1 day before ──────────────────
  IF EXISTS (SELECT 1 FROM notification_rules WHERE rule_key = 'trial_ending_1d' AND is_enabled = true) THEN
    FOR v_biz IN
      SELECT b.id, b.name, b.owner_id, b.trial_ends_at,
             (EXTRACT(EPOCH FROM (b.trial_ends_at - now())) / 86400)::INT AS days_until_end
      FROM businesses b
      WHERE b.account_status = 'trial'
        AND b.trial_ends_at IS NOT NULL
        AND b.deleted_at IS NULL
        AND b.trial_ends_at BETWEEN now() AND now() + INTERVAL '2 days'
        AND NOT notification_already_sent(b.id, 'trial_ending_1d')
    LOOP
      SELECT user_id, full_name INTO v_profile FROM profiles WHERE business_id = v_biz.id LIMIT 1;
      IF FOUND THEN
        SELECT id INTO v_notif_id FROM create_business_notification(
          v_biz.id, v_profile.user_id, 'trial_ending_1d',
          'Your trial ends tomorrow',
          'Your ' || v_biz.name || ' trial plan will expire tomorrow. Upgrade to a paid plan to keep using BizRavana without interruption.',
          'subscription', 'important', 'system',
          'View Plans', '/dashboard/subscription'
        );
        v_sent_count := v_sent_count + 1;
      END IF;
    END LOOP;
  END IF;

  -- ── B. Trial Expired ──────────────────────────────
  IF EXISTS (SELECT 1 FROM notification_rules WHERE rule_key = 'trial_expired' AND is_enabled = true) THEN
    FOR v_biz IN
      SELECT b.id, b.name, b.owner_id
      FROM businesses b
      WHERE b.account_status = 'trial_expired'
        AND b.deleted_at IS NULL
        AND b.updated_at > now() - INTERVAL '24 hours'
        AND NOT notification_already_sent(b.id, 'trial_expired')
    LOOP
      SELECT user_id, full_name INTO v_profile FROM profiles WHERE business_id = v_biz.id LIMIT 1;
      IF FOUND THEN
        SELECT id INTO v_notif_id FROM create_business_notification(
          v_biz.id, v_profile.user_id, 'trial_expired',
          'Your trial has ended',
          'Your ' || v_biz.name || ' trial has expired. Your dashboard is now in read-only mode. Please upgrade to continue using all features.',
          'subscription', 'important', 'system',
          'Upgrade Now', '/dashboard/subscription'
        );
        v_sent_count := v_sent_count + 1;
      END IF;
    END LOOP;
  END IF;

  -- ── C. Subscription Expiring (7d, 3d, 1d) ─────────
  IF EXISTS (SELECT 1 FROM notification_rules WHERE rule_key IN ('subscription_expiring_7d','subscription_expiring_3d','subscription_expiring_1d') AND is_enabled = true) THEN
    FOR v_biz IN
      SELECT b.id, b.name, b.owner_id, b.subscription_ends_at,
             (EXTRACT(EPOCH FROM (b.subscription_ends_at - now())) / 86400)::INT AS days_left
      FROM businesses b
      WHERE b.account_status = 'active'
        AND b.subscription_ends_at IS NOT NULL
        AND b.deleted_at IS NULL
        AND b.subscription_ends_at BETWEEN now() AND now() + INTERVAL '8 days'
    LOOP
      IF v_biz.days_left <= 1 AND EXISTS (SELECT 1 FROM notification_rules WHERE rule_key = 'subscription_expiring_1d' AND is_enabled = true)
         AND NOT notification_already_sent(v_biz.id, 'subscription_expiring_1d') THEN
        SELECT id INTO v_notif_id FROM create_business_notification(
          v_biz.id, NULL, 'subscription_expiring_1d',
          'Subscription expires tomorrow',
          'Your ' || v_biz.name || ' subscription expires tomorrow. Renew now to avoid read-only mode.',
          'subscription', 'important', 'system',
          'Renew Now', '/dashboard/subscription'
        );
        v_sent_count := v_sent_count + 1;
      ELSIF v_biz.days_left <= 3 AND v_biz.days_left > 1
         AND EXISTS (SELECT 1 FROM notification_rules WHERE rule_key = 'subscription_expiring_3d' AND is_enabled = true)
         AND NOT notification_already_sent(v_biz.id, 'subscription_expiring_3d') THEN
        SELECT id INTO v_notif_id FROM create_business_notification(
          v_biz.id, NULL, 'subscription_expiring_3d',
          'Subscription expiring in 3 days',
          'Your ' || v_biz.name || ' subscription will expire in ' || v_biz.days_left || ' days. Please renew to keep your account active.',
          'subscription', 'important', 'system',
          'View Plans', '/dashboard/subscription'
        );
        v_sent_count := v_sent_count + 1;
      ELSIF v_biz.days_left <= 7 AND v_biz.days_left > 3
         AND EXISTS (SELECT 1 FROM notification_rules WHERE rule_key = 'subscription_expiring_7d' AND is_enabled = true)
         AND NOT notification_already_sent(v_biz.id, 'subscription_expiring_7d') THEN
        SELECT id INTO v_notif_id FROM create_business_notification(
          v_biz.id, NULL, 'subscription_expiring_7d',
          'Subscription expiring soon',
          'Your ' || v_biz.name || ' subscription will expire in ' || v_biz.days_left || ' days. Renew now to avoid service interruption.',
          'subscription', 'normal', 'system',
          'View Plans', '/dashboard/subscription'
        );
        v_sent_count := v_sent_count + 1;
      END IF;
    END LOOP;
  END IF;

  -- ── D. Subscription Expired ───────────────────────
  IF EXISTS (SELECT 1 FROM notification_rules WHERE rule_key = 'subscription_expired' AND is_enabled = true) THEN
    FOR v_biz IN
      SELECT b.id, b.name, b.owner_id
      FROM businesses b
      WHERE b.account_status = 'expired'
        AND b.deleted_at IS NULL
        AND b.updated_at > now() - INTERVAL '24 hours'
        AND NOT notification_already_sent(b.id, 'subscription_expired')
    LOOP
      SELECT user_id INTO v_profile FROM profiles WHERE business_id = v_biz.id LIMIT 1;
      IF FOUND THEN
        SELECT id INTO v_notif_id FROM create_business_notification(
          v_biz.id, v_profile.user_id, 'subscription_expired',
          'Subscription expired',
          'Your ' || v_biz.name || ' subscription has expired. Your account is now in read-only mode. Renew to restore full access.',
          'subscription', 'urgent', 'system',
          'Renew Now', '/dashboard/subscription'
        );
        v_sent_count := v_sent_count + 1;
      END IF;
    END LOOP;
  END IF;

  -- ── E. Deletion Scheduled ─────────────────────────
  IF EXISTS (SELECT 1 FROM notification_rules WHERE rule_key = 'deletion_scheduled' AND is_enabled = true) THEN
    FOR v_biz IN
      SELECT b.id, b.name, b.owner_id, b.data_delete_after
      FROM businesses b
      WHERE b.data_delete_after IS NOT NULL
        AND b.deleted_at IS NULL
        AND b.data_delete_after BETWEEN now() AND now() + INTERVAL '2 days'
        AND NOT notification_already_sent(b.id, 'deletion_scheduled')
    LOOP
      SELECT user_id INTO v_profile FROM profiles WHERE business_id = v_biz.id LIMIT 1;
      IF FOUND THEN
        SELECT id INTO v_notif_id FROM create_business_notification(
          v_biz.id, v_profile.user_id, 'deletion_scheduled',
          'Account scheduled for deletion',
          'Your account is scheduled for permanent deletion on ' || to_char(v_biz.data_delete_after, 'YYYY-MM-DD') || '. Contact support to restore access.',
          'account', 'urgent', 'system',
          'Contact Support', '/dashboard/settings'
        );
        v_sent_count := v_sent_count + 1;
      END IF;
    END LOOP;
  END IF;

  -- ── F. Usage/Storage Monitoring ───────────────────
  IF EXISTS (SELECT 1 FROM notification_rules WHERE rule_key IN ('usage_80_pct','usage_100_pct','storage_80_pct','storage_100_pct') AND is_enabled = true) THEN
    FOR v_biz IN
      SELECT b.id, b.name, b.owner_id, b.plan_id
      FROM businesses b
      WHERE b.account_status IN ('active', 'trial')
        AND b.deleted_at IS NULL
        AND b.plan_id IS NOT NULL
    LOOP
      SELECT * INTO v_plan FROM subscription_plans WHERE id = v_biz.plan_id;

      -- Orders usage
      SELECT COUNT(*)::INT INTO v_usage_pct FROM orders WHERE business_id = v_biz.id AND deleted_at IS NULL;
      IF v_plan.order_limit > 0 THEN
        v_usage_pct := (v_usage_pct / v_plan.order_limit::NUMERIC) * 100;
        IF v_usage_pct >= 100 AND EXISTS (SELECT 1 FROM notification_rules WHERE rule_key = 'usage_100_pct' AND is_enabled = true)
           AND NOT notification_already_sent(v_biz.id, 'usage_100_pct_orders', 168) THEN
          SELECT user_id INTO v_profile FROM profiles WHERE business_id = v_biz.id LIMIT 1;
          IF FOUND THEN
            SELECT id INTO v_notif_id FROM create_business_notification(v_biz.id, v_profile.user_id,
              'usage_100_pct_orders', 'Order limit reached',
              'You have reached your order limit. Please upgrade your plan to continue creating orders.',
              'usage', 'important', 'system', 'Upgrade Plan', '/dashboard/subscription');
            v_sent_count := v_sent_count + 1;
          END IF;
        ELSIF v_usage_pct >= 80 AND v_usage_pct < 100
           AND EXISTS (SELECT 1 FROM notification_rules WHERE rule_key = 'usage_80_pct' AND is_enabled = true)
           AND NOT notification_already_sent(v_biz.id, 'usage_80_pct_orders', 168) THEN
          SELECT user_id INTO v_profile FROM profiles WHERE business_id = v_biz.id LIMIT 1;
          IF FOUND THEN
            SELECT id INTO v_notif_id FROM create_business_notification(v_biz.id, v_profile.user_id,
              'usage_80_pct_orders', 'Order limit at 80%',
              'Your order usage has reached 80% of your plan limit. Consider upgrading.',
              'usage', 'normal', 'system', 'View Plans', '/dashboard/subscription');
            v_sent_count := v_sent_count + 1;
          END IF;
        END IF;
      END IF;

      -- Storage usage
      v_storage_used_mb := 0;
      BEGIN
        SELECT COALESCE(SUM(size), 0) INTO v_storage_used_mb
        FROM (
          SELECT (metadata->>'size')::NUMERIC / (1024*1024) AS size
          FROM storage.objects
          WHERE bucket_id IN ('payment-proofs', 'profile-images', 'order-images')
            AND (path_tokens[1] = v_biz.id::TEXT OR path_tokens[1] = 'proofs' AND path_tokens[2] = v_biz.id::TEXT
                 OR path_tokens[1] = 'logos' AND path_tokens[2] = v_biz.id::TEXT)
        ) s;
      EXCEPTION WHEN OTHERS THEN v_storage_used_mb := 0;
      END;

      v_storage_limit_mb := v_plan.storage_limit_mb;
      IF v_storage_limit_mb > 0 AND v_storage_used_mb > 0 THEN
        v_storage_pct := (v_storage_used_mb / v_storage_limit_mb::NUMERIC) * 100;
        IF v_storage_pct >= 100 AND EXISTS (SELECT 1 FROM notification_rules WHERE rule_key = 'storage_100_pct' AND is_enabled = true)
           AND NOT notification_already_sent(v_biz.id, 'storage_100_pct', 168) THEN
          SELECT user_id INTO v_profile FROM profiles WHERE business_id = v_biz.id LIMIT 1;
          IF FOUND THEN
            SELECT id INTO v_notif_id FROM create_business_notification(v_biz.id, v_profile.user_id,
              'storage_100_pct', 'Storage full',
              'Your storage is full (' || ROUND(v_storage_used_mb::NUMERIC, 1) || ' MB / ' || v_storage_limit_mb || ' MB). Free up space or upgrade.',
              'storage', 'important', 'system', 'Manage Storage', '/dashboard/settings');
            v_sent_count := v_sent_count + 1;
          END IF;
        ELSIF v_storage_pct >= 80 AND v_storage_pct < 100
           AND EXISTS (SELECT 1 FROM notification_rules WHERE rule_key = 'storage_80_pct' AND is_enabled = true)
           AND NOT notification_already_sent(v_biz.id, 'storage_80_pct', 168) THEN
          SELECT user_id INTO v_profile FROM profiles WHERE business_id = v_biz.id LIMIT 1;
          IF FOUND THEN
            SELECT id INTO v_notif_id FROM create_business_notification(v_biz.id, v_profile.user_id,
              'storage_80_pct', 'Storage nearly full',
              'Your storage usage has reached ' || ROUND(v_storage_pct, 0) || '% (' || ROUND(v_storage_used_mb::NUMERIC, 1) || ' MB / ' || v_storage_limit_mb || ' MB). Clean up or upgrade.',
              'storage', 'normal', 'system', 'Manage Storage', '/dashboard/settings');
            v_sent_count := v_sent_count + 1;
          END IF;
        END IF;
      END IF;
    END LOOP;
  END IF;

  v_result := jsonb_build_object('sent_count', v_sent_count, 'processed_at', now());
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =============================================
-- 4. Function: Deliver scheduled broadcasts
-- =============================================
CREATE OR REPLACE FUNCTION deliver_scheduled_broadcasts()
RETURNS JSONB AS $$
DECLARE
  v_broadcast RECORD;
  v_biz RECORD;
  v_profile RECORD;
  v_plan RECORD;
  v_notif_id UUID;
  v_sent_count INT := 0;
  v_total_count INT := 0;
BEGIN
  FOR v_broadcast IN
    SELECT * FROM notification_broadcasts
    WHERE status = 'scheduled'
      AND scheduled_at <= now()
      AND expires_at IS NULL OR expires_at > now()
    LIMIT 10
  LOOP
    -- Determine target businesses
    FOR v_biz IN
      SELECT b.id, b.name, b.owner_id, b.account_status, b.plan_id
      FROM businesses b
      WHERE b.deleted_at IS NULL
        AND (
          (v_broadcast.audience_type = 'all') OR
          (v_broadcast.audience_type = 'active' AND b.account_status = 'active') OR
          (v_broadcast.audience_type = 'trial' AND b.account_status = 'trial') OR
          (v_broadcast.audience_type = 'expired' AND b.account_status IN ('expired', 'trial_expired')) OR
          (v_broadcast.audience_type = 'suspended' AND b.account_status = 'suspended') OR
          (v_broadcast.audience_type LIKE '%_plan' AND b.plan_id IS NOT NULL) OR
          (v_broadcast.audience_type = 'selected' AND
           v_broadcast.audience_config->>'business_ids' LIKE '%' || b.id || '%')
        )
    LOOP
      -- Filter by plan if applicable
      IF v_broadcast.audience_type IN ('basic_plan','standard_plan','premium_plan','enterprise_plan') THEN
        SELECT * INTO v_plan FROM subscription_plans WHERE id = v_biz.plan_id;
        CONTINUE WHEN v_plan.name IS NULL OR LOWER(v_plan.name) != REPLACE(v_broadcast.audience_type, '_plan', '');
      END IF;

      SELECT user_id INTO v_profile FROM profiles WHERE business_id = v_biz.id LIMIT 1;
      IF FOUND THEN
        SELECT id INTO v_notif_id FROM create_business_notification(
          v_biz.id, v_profile.user_id, 'admin_broadcast',
          v_broadcast.title, v_broadcast.message,
          v_broadcast.category, v_broadcast.priority, 'admin',
          v_broadcast.action_label, v_broadcast.action_url,
          v_broadcast.id
        );
        v_sent_count := v_sent_count + 1;
      END IF;
    END LOOP;

    -- Update broadcast status
    UPDATE notification_broadcasts
    SET status = 'sent', sent_at = now(), recipient_count = v_sent_count, updated_at = now()
    WHERE id = v_broadcast.id;

    v_total_count := v_total_count + v_sent_count;
    v_sent_count := 0;
  END LOOP;

  RETURN jsonb_build_object('delivered_broadcasts', v_total_count, 'processed_at', now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =============================================
-- 5. Schedule Cron Job (hourly)
-- =============================================
SELECT cron.schedule(
  'process-auto-notifications',
  '0 * * * *',
  $$SELECT process_auto_notifications()$$
);

SELECT cron.schedule(
  'deliver-scheduled-broadcasts',
  '*/15 * * * *',
  $$SELECT deliver_scheduled_broadcasts()$$
);
