-- =============================================
-- Migration 018: Update Subscription Plans
-- Adds new limit/feature columns + updated pricing
-- =============================================

-- 1. Add new columns to subscription_plans
ALTER TABLE subscription_plans
  ADD COLUMN IF NOT EXISTS quotation_limit INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS inventory_limit INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS courier_accounts INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS whatsapp_templates INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS team_members INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS bulk_import BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS activity_log BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS smart_automation BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_assistant BOOLEAN NOT NULL DEFAULT false;

-- 2. Remove old seed data and insert updated plans
DELETE FROM subscription_plans;

INSERT INTO subscription_plans
  (name, monthly_price, order_limit, expense_limit, product_limit,
   quotation_limit, inventory_limit, storage_limit_mb,
   courier_accounts, whatsapp_templates, team_members,
   bulk_import, activity_log, smart_automation, ai_assistant,
   features, is_active, sort_order)
VALUES
  ('Basic',    1250.00, 100,  100,  10,  100,  100,  5,    1, 1, 1, false, false, false, false,
   '["Dashboard","Orders","Products","Expenses","Inventory","Quotations","Reports","Customers","Custom Branding","Shipping Labels","WhatsApp Templates (1)","Courier Integration","Image Upload","Bank Transfer Payments"]',
   true, 1),

  ('Standard', 2450.00, 200,  200,  50,  200,  200,  250,  3, 3, 1, true,  false, false, false,
   '["Everything in Basic","Image Upload for Orders","Bulk XLSX & CSV Import","WhatsApp Templates (3)","Advanced Reports"]',
   true, 2),

  ('Premium',  4450.00, 500,  500,  100, 500,  500,  1024, 999999, 999999, 5, true, true,  false, false,
   '["Everything in Standard","Advanced Analytics","Custom Branding","Multiple Team Members (5)","Activity Log","WhatsApp Templates (Unlimited)"]',
   true, 3),

  ('Enterprise', 0,      999999, 999999, 999999, 999999, 999999, 999999, 999999, 999999, 999999, true, true, true, true,
   '["Everything in Premium","Dedicated Support","Custom Integrations","API Access","Dedicated Environment","Unlimited Users","AI Assistant","Smart Automation"]',
   true, 4),

  ('Trial', 0, 20, 10, 10, 5, 5, 5, 1, 1, 1, false, false, false, false,
   '["Full Feature Access with Trial Limits","3-Day Free Trial"]',
   true, 0)
ON CONFLICT DO NOTHING;
