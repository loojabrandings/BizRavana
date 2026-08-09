-- =============================================
-- BizRavana - Repair automatic notification worker schema resolution
-- Migration 046
-- =============================================

-- Migration 025 used an empty search_path but left application relations and
-- helper calls unqualified. Preserve the hardened search path and explicitly
-- resolve all application objects.

CREATE OR REPLACE FUNCTION public.process_auto_notifications()
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
  SELECT EXISTS (SELECT 1 FROM public.notification_rules WHERE is_enabled = true) INTO v_rules_enabled;
  IF NOT v_rules_enabled THEN
    RETURN jsonb_build_object('skipped', true, 'reason', 'no_rules_enabled');
  END IF;

  -- â”€â”€ A. Trial Ending: 1 day before â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  IF EXISTS (SELECT 1 FROM public.notification_rules WHERE rule_key = 'trial_ending_1d' AND is_enabled = true) THEN
    FOR v_biz IN
      SELECT b.id, b.name, b.owner_id, b.trial_ends_at,
             (EXTRACT(EPOCH FROM (b.trial_ends_at - now())) / 86400)::INT AS days_until_end
      FROM public.businesses AS b
      WHERE b.account_status = 'trial'
        AND b.trial_ends_at IS NOT NULL
        AND b.deleted_at IS NULL
        AND b.trial_ends_at BETWEEN now() AND now() + INTERVAL '2 days'
        AND NOT public.notification_already_sent(b.id, 'trial_ending_1d')
    LOOP
      SELECT user_id, full_name INTO v_profile FROM public.profiles WHERE business_id = v_biz.id LIMIT 1;
      IF FOUND THEN
        SELECT id INTO v_notif_id FROM public.create_business_notification(
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

  -- â”€â”€ B. Trial Expired â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  IF EXISTS (SELECT 1 FROM public.notification_rules WHERE rule_key = 'trial_expired' AND is_enabled = true) THEN
    FOR v_biz IN
      SELECT b.id, b.name, b.owner_id
      FROM public.businesses AS b
      WHERE b.account_status = 'trial_expired'
        AND b.deleted_at IS NULL
        AND b.updated_at > now() - INTERVAL '24 hours'
        AND NOT public.notification_already_sent(b.id, 'trial_expired')
    LOOP
      SELECT user_id, full_name INTO v_profile FROM public.profiles WHERE business_id = v_biz.id LIMIT 1;
      IF FOUND THEN
        SELECT id INTO v_notif_id FROM public.create_business_notification(
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

  -- â”€â”€ C. Subscription Expiring (7d, 3d, 1d) â”€â”€â”€â”€â”€â”€â”€â”€â”€
  IF EXISTS (SELECT 1 FROM public.notification_rules WHERE rule_key IN ('subscription_expiring_7d','subscription_expiring_3d','subscription_expiring_1d') AND is_enabled = true) THEN
    FOR v_biz IN
      SELECT b.id, b.name, b.owner_id, b.subscription_ends_at,
             (EXTRACT(EPOCH FROM (b.subscription_ends_at - now())) / 86400)::INT AS days_left
      FROM public.businesses AS b
      WHERE b.account_status = 'active'
        AND b.subscription_ends_at IS NOT NULL
        AND b.deleted_at IS NULL
        AND b.subscription_ends_at BETWEEN now() AND now() + INTERVAL '8 days'
    LOOP
      IF v_biz.days_left <= 1 AND EXISTS (SELECT 1 FROM public.notification_rules WHERE rule_key = 'subscription_expiring_1d' AND is_enabled = true)
         AND NOT public.notification_already_sent(v_biz.id, 'subscription_expiring_1d') THEN
        SELECT id INTO v_notif_id FROM public.create_business_notification(
          v_biz.id, NULL, 'subscription_expiring_1d',
          'Subscription expires tomorrow',
          'Your ' || v_biz.name || ' subscription expires tomorrow. Renew now to avoid read-only mode.',
          'subscription', 'important', 'system',
          'Renew Now', '/dashboard/subscription'
        );
        v_sent_count := v_sent_count + 1;
      ELSIF v_biz.days_left <= 3 AND v_biz.days_left > 1
         AND EXISTS (SELECT 1 FROM public.notification_rules WHERE rule_key = 'subscription_expiring_3d' AND is_enabled = true)
         AND NOT public.notification_already_sent(v_biz.id, 'subscription_expiring_3d') THEN
        SELECT id INTO v_notif_id FROM public.create_business_notification(
          v_biz.id, NULL, 'subscription_expiring_3d',
          'Subscription expiring in 3 days',
          'Your ' || v_biz.name || ' subscription will expire in ' || v_biz.days_left || ' days. Please renew to keep your account active.',
          'subscription', 'important', 'system',
          'View Plans', '/dashboard/subscription'
        );
        v_sent_count := v_sent_count + 1;
      ELSIF v_biz.days_left <= 7 AND v_biz.days_left > 3
         AND EXISTS (SELECT 1 FROM public.notification_rules WHERE rule_key = 'subscription_expiring_7d' AND is_enabled = true)
         AND NOT public.notification_already_sent(v_biz.id, 'subscription_expiring_7d') THEN
        SELECT id INTO v_notif_id FROM public.create_business_notification(
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

  -- â”€â”€ D. Subscription Expired â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  IF EXISTS (SELECT 1 FROM public.notification_rules WHERE rule_key = 'subscription_expired' AND is_enabled = true) THEN
    FOR v_biz IN
      SELECT b.id, b.name, b.owner_id
      FROM public.businesses AS b
      WHERE b.account_status = 'expired'
        AND b.deleted_at IS NULL
        AND b.updated_at > now() - INTERVAL '24 hours'
        AND NOT public.notification_already_sent(b.id, 'subscription_expired')
    LOOP
      SELECT user_id INTO v_profile FROM public.profiles WHERE business_id = v_biz.id LIMIT 1;
      IF FOUND THEN
        SELECT id INTO v_notif_id FROM public.create_business_notification(
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

  -- â”€â”€ E. Deletion Scheduled â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  IF EXISTS (SELECT 1 FROM public.notification_rules WHERE rule_key = 'deletion_scheduled' AND is_enabled = true) THEN
    FOR v_biz IN
      SELECT b.id, b.name, b.owner_id, b.data_delete_after
      FROM public.businesses AS b
      WHERE b.data_delete_after IS NOT NULL
        AND b.deleted_at IS NULL
        AND b.data_delete_after BETWEEN now() AND now() + INTERVAL '2 days'
        AND NOT public.notification_already_sent(b.id, 'deletion_scheduled')
    LOOP
      SELECT user_id INTO v_profile FROM public.profiles WHERE business_id = v_biz.id LIMIT 1;
      IF FOUND THEN
        SELECT id INTO v_notif_id FROM public.create_business_notification(
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

  -- â”€â”€ F. Usage/Storage Monitoring â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  IF EXISTS (SELECT 1 FROM public.notification_rules WHERE rule_key IN ('usage_80_pct','usage_100_pct','storage_80_pct','storage_100_pct') AND is_enabled = true) THEN
    FOR v_biz IN
      SELECT b.id, b.name, b.owner_id, b.plan_id
      FROM public.businesses AS b
      WHERE b.account_status IN ('active', 'trial')
        AND b.deleted_at IS NULL
        AND b.plan_id IS NOT NULL
    LOOP
      SELECT * INTO v_plan FROM public.subscription_plans WHERE id = v_biz.plan_id;

      -- Orders usage
      SELECT COUNT(*)::INT INTO v_usage_pct FROM public.orders WHERE business_id = v_biz.id AND deleted_at IS NULL;
      IF v_plan.order_limit > 0 THEN
        v_usage_pct := (v_usage_pct / v_plan.order_limit::NUMERIC) * 100;
        IF v_usage_pct >= 100 AND EXISTS (SELECT 1 FROM public.notification_rules WHERE rule_key = 'usage_100_pct' AND is_enabled = true)
           AND NOT public.notification_already_sent(v_biz.id, 'usage_100_pct_orders', 168) THEN
          SELECT user_id INTO v_profile FROM public.profiles WHERE business_id = v_biz.id LIMIT 1;
          IF FOUND THEN
            SELECT id INTO v_notif_id FROM public.create_business_notification(v_biz.id, v_profile.user_id,
              'usage_100_pct_orders', 'Order limit reached',
              'You have reached your order limit. Please upgrade your plan to continue creating orders.',
              'usage', 'important', 'system', 'Upgrade Plan', '/dashboard/subscription');
            v_sent_count := v_sent_count + 1;
          END IF;
        ELSIF v_usage_pct >= 80 AND v_usage_pct < 100
           AND EXISTS (SELECT 1 FROM public.notification_rules WHERE rule_key = 'usage_80_pct' AND is_enabled = true)
           AND NOT public.notification_already_sent(v_biz.id, 'usage_80_pct_orders', 168) THEN
          SELECT user_id INTO v_profile FROM public.profiles WHERE business_id = v_biz.id LIMIT 1;
          IF FOUND THEN
            SELECT id INTO v_notif_id FROM public.create_business_notification(v_biz.id, v_profile.user_id,
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
        IF v_storage_pct >= 100 AND EXISTS (SELECT 1 FROM public.notification_rules WHERE rule_key = 'storage_100_pct' AND is_enabled = true)
           AND NOT public.notification_already_sent(v_biz.id, 'storage_100_pct', 168) THEN
          SELECT user_id INTO v_profile FROM public.profiles WHERE business_id = v_biz.id LIMIT 1;
          IF FOUND THEN
            SELECT id INTO v_notif_id FROM public.create_business_notification(v_biz.id, v_profile.user_id,
              'storage_100_pct', 'Storage full',
              'Your storage is full (' || ROUND(v_storage_used_mb::NUMERIC, 1) || ' MB / ' || v_storage_limit_mb || ' MB). Free up space or upgrade.',
              'storage', 'important', 'system', 'Manage Storage', '/dashboard/settings');
            v_sent_count := v_sent_count + 1;
          END IF;
        ELSIF v_storage_pct >= 80 AND v_storage_pct < 100
           AND EXISTS (SELECT 1 FROM public.notification_rules WHERE rule_key = 'storage_80_pct' AND is_enabled = true)
           AND NOT public.notification_already_sent(v_biz.id, 'storage_80_pct', 168) THEN
          SELECT user_id INTO v_profile FROM public.profiles WHERE business_id = v_biz.id LIMIT 1;
          IF FOUND THEN
            SELECT id INTO v_notif_id FROM public.create_business_notification(v_biz.id, v_profile.user_id,
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

REVOKE ALL ON FUNCTION public.process_auto_notifications()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_auto_notifications()
  TO service_role;

