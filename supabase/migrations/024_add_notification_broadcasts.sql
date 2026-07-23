-- =============================================
-- Bizravana - Notification Broadcast System
-- Migration 024: Broadcasts, Recipients, Rules
-- =============================================

-- 1. NOTIFICATION BROADCASTS
-- Admin-created or system-generated notification broadcasts
CREATE TABLE notification_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'announcement'
    CHECK (category IN ('general','announcement','subscription','payment','maintenance','usage','storage','security','account')),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('normal','important','urgent')),
  source TEXT NOT NULL DEFAULT 'admin'
    CHECK (source IN ('admin','system')),
  audience_type TEXT NOT NULL DEFAULT 'all'
    CHECK (audience_type IN ('all','active','trial','expired','suspended','basic_plan','standard_plan','premium_plan','enterprise_plan','selected')),
  audience_config JSONB DEFAULT '{}',
  action_label TEXT,
  action_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','scheduled','sent','cancelled','archived')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  recipient_count INT DEFAULT 0,
  read_count INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. NOTIFICATION RECIPIENTS
-- Delivery tracking for each notification per business/user
CREATE TABLE notification_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID REFERENCES notification_broadcasts(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  read_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ DEFAULT now(),
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. NOTIFICATION RULES
-- Configuration for automated notifications
CREATE TABLE notification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'announcement'
    CHECK (category IN ('general','announcement','subscription','payment','maintenance','usage','storage','security','account')),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('normal','important','urgent')),
  trigger_config JSONB DEFAULT '{}',
  template_title TEXT NOT NULL,
  template_message TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  is_essential BOOLEAN DEFAULT false,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Add new columns to existing notifications table
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'system'
    CHECK (source IN ('admin','system')),
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal'
    CHECK (priority IN ('normal','important','urgent')),
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general'
    CHECK (category IN ('general','announcement','subscription','payment','maintenance','usage','storage','security','account')),
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS action_label TEXT,
  ADD COLUMN IF NOT EXISTS action_url TEXT,
  ADD COLUMN IF NOT EXISTS broadcast_id UUID REFERENCES notification_broadcasts(id) ON DELETE SET NULL;

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_notification_broadcasts_status ON notification_broadcasts(status, scheduled_at);
CREATE INDEX idx_notification_broadcasts_created ON notification_broadcasts(created_at DESC);
CREATE INDEX idx_notification_recipients_broadcast ON notification_recipients(broadcast_id);
CREATE INDEX idx_notification_recipients_business ON notification_recipients(business_id, read_at);
CREATE INDEX idx_notification_recipients_user ON notification_recipients(user_id, read_at);
CREATE INDEX idx_notification_rules_enabled ON notification_rules(is_enabled);
CREATE INDEX idx_notifications_business_unread ON notifications(business_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE notification_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;

-- Notification Broadcasts: super admin can manage, businesses can read theirs
CREATE POLICY "broadcasts_admin_all" ON notification_broadcasts
  FOR ALL USING (is_super_admin());

CREATE POLICY "broadcasts_business_select" ON notification_broadcasts
  FOR SELECT USING (
    status = 'sent' AND (
      audience_type = 'all' OR
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.user_id = auth.uid()
        AND p.business_id IS NOT NULL
        AND (
          audience_type = 'selected' AND audience_config->>'business_ids' LIKE '%' || p.business_id || '%'
        )
      )
    )
  );

-- Notification Recipients: business-scoped
CREATE POLICY "recipients_admin_all" ON notification_recipients
  FOR ALL USING (is_super_admin());

CREATE POLICY "recipients_business_select" ON notification_recipients
  FOR SELECT USING (
    business_id IN (
      SELECT p.business_id FROM profiles p WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "recipients_business_update" ON notification_recipients
  FOR UPDATE USING (
    business_id IN (
      SELECT p.business_id FROM profiles p WHERE p.user_id = auth.uid()
    )
  );

-- Notification Rules: super admin only
CREATE POLICY "rules_admin_all" ON notification_rules
  FOR ALL USING (is_super_admin());

CREATE POLICY "rules_admin_select" ON notification_rules
  FOR SELECT USING (is_super_admin());

-- =============================================
-- SEED: Default Notification Rules
-- =============================================

INSERT INTO notification_rules (rule_key, name, description, category, priority, template_title, template_message, is_enabled, is_essential) VALUES
  ('trial_ending_1d', 'Trial Ending Soon (1 day)', 'Sent 1 day before trial expires', 'subscription', 'important',
   'Your trial ends tomorrow',
   'Your {business_name} trial plan will expire tomorrow. Upgrade to a paid plan to keep using BizRavana without interruption.',
   true, false),
  ('trial_expired', 'Trial Expired', 'Sent immediately when trial expires', 'subscription', 'important',
   'Your trial has ended',
   'Your {business_name} trial has expired. Your dashboard is now in read-only mode. Please upgrade to continue using all features.',
   true, true),
  ('subscription_expiring_7d', 'Subscription Expiring (7 days)', 'Sent 7 days before subscription ends', 'subscription', 'normal',
   'Subscription expiring soon',
   'Your {business_name} subscription will expire in 7 days. Renew now to avoid service interruption.',
   true, false),
  ('subscription_expiring_3d', 'Subscription Expiring (3 days)', 'Sent 3 days before subscription ends', 'subscription', 'important',
   'Subscription expiring in 3 days',
   'Your {business_name} subscription will expire in 3 days. Please renew to keep your account active.',
   true, false),
  ('subscription_expiring_1d', 'Subscription Expiring (1 day)', 'Sent 1 day before subscription ends', 'subscription', 'important',
   'Subscription expires tomorrow',
   'Your {business_name} subscription expires tomorrow. Renew now to avoid read-only mode.',
   true, true),
  ('subscription_expired', 'Subscription Expired', 'Sent immediately when subscription expires', 'subscription', 'urgent',
   'Subscription expired',
   'Your {business_name} subscription has expired. Your account is now in read-only mode. Renew to restore full access.',
   true, true),
  ('payment_received', 'Payment Proof Submitted', 'Sent when a payment proof is uploaded', 'payment', 'normal',
   'Payment proof received',
   'Your payment of Rs. {amount} for {plan_name} has been received. The admin will review it shortly.',
   true, false),
  ('payment_approved', 'Payment Approved', 'Sent when admin approves payment', 'payment', 'normal',
   'Payment approved',
   'Your payment of Rs. {amount} has been approved. Your {plan_name} plan is now active. Thank you!',
   true, false),
  ('payment_rejected', 'Payment Rejected', 'Sent when admin rejects payment', 'payment', 'urgent',
   'Payment needs attention',
   'Your payment of Rs. {amount} was not approved. Reason: {admin_note}. Please upload a new payment proof.',
   true, false),
  ('deletion_scheduled', 'Account Scheduled for Deletion', 'Sent when data_delete_after is set', 'account', 'urgent',
   'Account scheduled for deletion',
   'Your account is scheduled for permanent deletion on {deletion_date}. Contact support to restore access.',
   true, true),
  ('usage_80_pct', 'Usage Limit at 80%', 'Sent when any usage metric reaches 80%', 'usage', 'normal',
   'Approaching usage limit',
   'Your {metric_name} usage has reached 80% of your {plan_name} plan limit ({used}/{limit}). Consider upgrading your plan.',
   true, false),
  ('usage_100_pct', 'Usage Limit Reached', 'Sent when any usage metric reaches 100%', 'usage', 'important',
   'Usage limit reached',
   'You have reached your {metric_name} limit ({used}/{limit}). Create no longer possible. Please upgrade your plan.',
   true, false),
  ('storage_80_pct', 'Storage at 80%', 'Sent when storage reaches 80%', 'storage', 'normal',
   'Storage nearly full',
   'Your storage usage has reached 80% ({used} MB / {limit} MB). Clean up or upgrade to avoid issues.',
   true, false),
  ('storage_100_pct', 'Storage Full', 'Sent when storage reaches 100%', 'storage', 'important',
   'Storage full',
   'Your storage is full ({used} MB / {limit} MB). Some uploads may fail. Free up space or upgrade your plan.',
   true, false)
ON CONFLICT (rule_key) DO NOTHING;
