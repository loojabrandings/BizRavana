-- =============================================
-- Bizravana - Admin Settings Table
-- Migration 022: Add admin_settings table
-- =============================================

-- Create admin_settings table (no FK to businesses since these are platform-level)
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS: All authenticated users can read (bank details and support contact are public platform info)
CREATE POLICY "admin_settings_select" ON admin_settings
  FOR SELECT USING (is_super_admin() OR auth.role() = 'authenticated');

-- RLS: Only super admins can modify
CREATE POLICY "admin_settings_insert" ON admin_settings
  FOR INSERT WITH CHECK (is_super_admin());

CREATE POLICY "admin_settings_update" ON admin_settings
  FOR UPDATE USING (is_super_admin()) WITH CHECK (is_super_admin());

CREATE POLICY "admin_settings_delete" ON admin_settings
  FOR DELETE USING (is_super_admin());

-- Seed default settings
INSERT INTO admin_settings (key, value) VALUES
  ('admin_settings', jsonb_build_object(
    'company_name', 'BizRavana',
    'company_address', '',
    'company_phone', '',
    'support_email', '',
    'support_whatsapp', '94750350109',
    'bank_name', 'Commercial Bank of Ceylon',
    'bank_account_name', 'BizRavana Technologies',
    'bank_account_number', '1234567890',
    'bank_branch', 'Colombo 01',
    'trial_duration_days', 3,
    'payment_instructions', ''
  ))
  ON CONFLICT (key) DO NOTHING;
