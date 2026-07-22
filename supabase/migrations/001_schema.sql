-- =============================================
-- Bizravana - Complete Database Schema
-- Migration 001: Schema + RLS + Seed Data
-- =============================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. SUBSCRIPTION PLANS
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  monthly_price DECIMAL(10,2) NOT NULL,
  order_limit INT NOT NULL,
  expense_limit INT NOT NULL,
  product_limit INT NOT NULL,
  storage_limit_mb INT DEFAULT 500,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. BUSINESSES (multi-tenant root)
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  phone TEXT,
  district TEXT,
  address TEXT,
  logo_url TEXT,
  theme_prefs JSONB DEFAULT '{"mode":"system","accent":"blue"}',
  plan_id UUID REFERENCES subscription_plans(id),
  account_status TEXT NOT NULL DEFAULT 'trial'
    CHECK (account_status IN ('trial','trial_expired','pending_payment','active','expired','suspended','archived','deleted')),
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  subscription_started_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  data_delete_after TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 3. PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'owner'
    CHECK (role IN ('owner','admin','member')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PAYMENT PROOFS
CREATE TABLE payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'bank_transfer',
  proof_image_url TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  admin_note TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PRODUCTS
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  size_variant TEXT,
  selling_price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2),
  profit_margin DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN cost_price IS NOT NULL AND cost_price > 0
         THEN ((selling_price - cost_price) / cost_price * 100)
         ELSE NULL END
  ) STORED,
  image_url TEXT,
  inventory_item_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 6. PRICE SNAPSHOTS
CREATE TABLE price_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  selling_price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2),
  effective_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. INVENTORY ITEMS
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  size_variant TEXT,
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_cost DECIMAL(10,2),
  supplier TEXT,
  reorder_level DECIMAL(10,2) DEFAULT 0,
  last_restocked_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 8. INVENTORY TRANSACTIONS
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('stock_in','stock_out','adjustment')),
  quantity DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(10,2),
  reference_type TEXT,
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. CUSTOMERS
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  district TEXT,
  nearest_city TEXT,
  lifetime_spend DECIMAL(12,2) DEFAULT 0,
  total_orders INT DEFAULT 0,
  pending_balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 10. ORDERS
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  customer_district TEXT,
  customer_city TEXT,
  customer_whatsapp TEXT,
  customer_email TEXT,
  expected_delivery_date DATE,
  dispatched_date TIMESTAMPTZ,
  delivery_charge DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(12,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  discount_type TEXT CHECK (discount_type IN ('percentage','fixed')),
  advance_paid DECIMAL(10,2) DEFAULT 0,
  balance_remaining DECIMAL(12,2) GENERATED ALWAYS AS (
    subtotal - COALESCE(discount,0) + COALESCE(delivery_charge,0) - COALESCE(advance_paid,0)
  ) STORED,
  total DECIMAL(12,2) GENERATED ALWAYS AS (
    subtotal - COALESCE(discount,0) + COALESCE(delivery_charge,0)
  ) STORED,
  payment_method TEXT CHECK (payment_method IN ('cod','bank_transfer','cash','other')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','advanced','paid')),
  status TEXT DEFAULT 'new_order' CHECK (status IN ('new_order','ready','packed','dispatched','delivered','cancelled','returned')),
  remarks TEXT,
  images JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 11. ORDER ITEMS
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  category TEXT,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) GENERATED ALWAYS AS (unit_price * quantity) STORED,
  notes TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. ORDER STATUS HISTORY
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. QUOTATIONS
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  quotation_number TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  customer_whatsapp TEXT,
  customer_email TEXT,
  expiry_date DATE,
  expected_delivery_date DATE,
  subtotal DECIMAL(12,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  discount_type TEXT CHECK (discount_type IN ('percentage','fixed')),
  delivery_charge DECIMAL(10,2) DEFAULT 0,
  grand_total DECIMAL(12,2) GENERATED ALWAYS AS (
    subtotal - COALESCE(discount,0) + COALESCE(delivery_charge,0)
  ) STORED,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','rejected','converted','expired')),
  remarks TEXT,
  converted_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 14. QUOTATION ITEMS
CREATE TABLE quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  category TEXT,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) GENERATED ALWAYS AS (unit_price * quantity) STORED,
  notes TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. EXPENSES
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  expense_number TEXT,
  expense_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('inventory','other')),
  supplier TEXT,
  item_name TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  payment_method TEXT CHECK (payment_method IN ('cash','bank_transfer','card','online')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid')),
  add_to_inventory BOOLEAN DEFAULT false,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  remarks TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 16. DELIVERIES
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  waybill_id TEXT,
  courier TEXT,
  courier_charge DECIMAL(10,2),
  status TEXT DEFAULT 'confirmed'
    CHECK (status IN ('confirmed','to_dispatch','in_branch','assigned_to_rider','delivered','cancelled','returned')),
  tracking_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 17. NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 18. BUSINESS SETTINGS
CREATE TABLE business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  UNIQUE(business_id, key),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 19. TASKS
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  reference_type TEXT CHECK (reference_type IN ('order','expense','inventory','quotation','general')),
  reference_id UUID,
  title TEXT NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  is_completed BOOLEAN DEFAULT false,
  due_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 20. ADMIN ACTIVITY LOG
CREATE TABLE admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_orders_business_status ON orders(business_id, status);
CREATE INDEX idx_orders_business_date ON orders(business_id, created_at DESC);
CREATE INDEX idx_orders_customer ON orders(business_id, customer_id);
CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_customers_business ON customers(business_id);
CREATE INDEX idx_expenses_business_date ON expenses(business_id, expense_date DESC);
CREATE INDEX idx_inventory_business ON inventory_items(business_id);
CREATE INDEX idx_quotations_business ON quotations(business_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_tasks_business ON tasks(business_id, reference_type);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX idx_deliveries_order ON deliveries(order_id);
CREATE INDEX idx_business_settings_key ON business_settings(business_id, key);
CREATE INDEX idx_payment_proofs_business ON payment_proofs(business_id, status);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Helper functions
CREATE OR REPLACE FUNCTION get_user_business_id()
RETURNS UUID AS $$
  SELECT business_id
  FROM public.profiles
  WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::BOOLEAN,
    FALSE
  );
$$ LANGUAGE sql STABLE SET search_path = '';

-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Businesses RLS
CREATE POLICY "users_view_own_business" ON businesses
  FOR SELECT USING (owner_id = auth.uid() OR is_super_admin());
CREATE POLICY "users_update_own_business" ON businesses
  FOR UPDATE USING (owner_id = auth.uid() OR is_super_admin());

-- Profiles RLS
CREATE POLICY "users_view_own_profile" ON profiles
  FOR SELECT USING (user_id = auth.uid() OR business_id = get_user_business_id() OR is_super_admin());
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Generic business-scoped RLS (applied to all business tables)
CREATE POLICY "business_select_own" ON products
  FOR SELECT USING (business_id = get_user_business_id() AND deleted_at IS NULL OR is_super_admin());
CREATE POLICY "business_insert_own" ON products
  FOR INSERT WITH CHECK (business_id = get_user_business_id());
CREATE POLICY "business_update_own" ON products
  FOR UPDATE USING (business_id = get_user_business_id());

CREATE POLICY "business_select_own" ON inventory_items
  FOR SELECT USING (business_id = get_user_business_id() AND deleted_at IS NULL OR is_super_admin());
CREATE POLICY "business_insert_own" ON inventory_items
  FOR INSERT WITH CHECK (business_id = get_user_business_id());
CREATE POLICY "business_update_own" ON inventory_items
  FOR UPDATE USING (business_id = get_user_business_id());

CREATE POLICY "business_select_own" ON inventory_transactions
  FOR SELECT USING (business_id = get_user_business_id() OR is_super_admin());
CREATE POLICY "business_insert_own" ON inventory_transactions
  FOR INSERT WITH CHECK (business_id = get_user_business_id());
CREATE POLICY "business_update_own" ON inventory_transactions
  FOR UPDATE USING (business_id = get_user_business_id());

CREATE POLICY "business_select_own" ON customers
  FOR SELECT USING (business_id = get_user_business_id() AND deleted_at IS NULL OR is_super_admin());
CREATE POLICY "business_insert_own" ON customers
  FOR INSERT WITH CHECK (business_id = get_user_business_id());
CREATE POLICY "business_update_own" ON customers
  FOR UPDATE USING (business_id = get_user_business_id());

CREATE POLICY "business_select_own" ON orders
  FOR SELECT USING (business_id = get_user_business_id() AND deleted_at IS NULL OR is_super_admin());
CREATE POLICY "business_insert_own" ON orders
  FOR INSERT WITH CHECK (business_id = get_user_business_id());
CREATE POLICY "business_update_own" ON orders
  FOR UPDATE USING (business_id = get_user_business_id());

CREATE POLICY "business_select_own" ON order_items
  FOR SELECT USING (business_id = get_user_business_id() OR is_super_admin());
CREATE POLICY "business_insert_own" ON order_items
  FOR INSERT WITH CHECK (business_id = get_user_business_id());
CREATE POLICY "business_update_own" ON order_items
  FOR UPDATE USING (business_id = get_user_business_id());

CREATE POLICY "business_select_own" ON order_status_history
  FOR SELECT USING (business_id = get_user_business_id() OR is_super_admin());
CREATE POLICY "business_insert_own" ON order_status_history
  FOR INSERT WITH CHECK (business_id = get_user_business_id());
CREATE POLICY "business_update_own" ON order_status_history
  FOR UPDATE USING (business_id = get_user_business_id());

CREATE POLICY "business_select_own" ON quotations
  FOR SELECT USING (business_id = get_user_business_id() AND deleted_at IS NULL OR is_super_admin());
CREATE POLICY "business_insert_own" ON quotations
  FOR INSERT WITH CHECK (business_id = get_user_business_id());
CREATE POLICY "business_update_own" ON quotations
  FOR UPDATE USING (business_id = get_user_business_id());

CREATE POLICY "business_select_own" ON quotation_items
  FOR SELECT USING (business_id = get_user_business_id() OR is_super_admin());
CREATE POLICY "business_insert_own" ON quotation_items
  FOR INSERT WITH CHECK (business_id = get_user_business_id());
CREATE POLICY "business_update_own" ON quotation_items
  FOR UPDATE USING (business_id = get_user_business_id());

CREATE POLICY "business_select_own" ON expenses
  FOR SELECT USING (business_id = get_user_business_id() AND deleted_at IS NULL OR is_super_admin());
CREATE POLICY "business_insert_own" ON expenses
  FOR INSERT WITH CHECK (business_id = get_user_business_id());
CREATE POLICY "business_update_own" ON expenses
  FOR UPDATE USING (business_id = get_user_business_id());

CREATE POLICY "business_select_own" ON deliveries
  FOR SELECT USING (business_id = get_user_business_id() OR is_super_admin());
CREATE POLICY "business_insert_own" ON deliveries
  FOR INSERT WITH CHECK (business_id = get_user_business_id());
CREATE POLICY "business_update_own" ON deliveries
  FOR UPDATE USING (business_id = get_user_business_id());

CREATE POLICY "business_select_own" ON notifications
  FOR SELECT USING (business_id = get_user_business_id() OR is_super_admin());
CREATE POLICY "business_insert_own" ON notifications
  FOR INSERT WITH CHECK (business_id = get_user_business_id());
CREATE POLICY "business_update_own" ON notifications
  FOR UPDATE USING (business_id = get_user_business_id());

CREATE POLICY "business_select_own" ON business_settings
  FOR SELECT USING (business_id = get_user_business_id() OR is_super_admin());
CREATE POLICY "business_insert_own" ON business_settings
  FOR INSERT WITH CHECK (business_id = get_user_business_id());
CREATE POLICY "business_update_own" ON business_settings
  FOR UPDATE USING (business_id = get_user_business_id());

CREATE POLICY "business_select_own" ON tasks
  FOR SELECT USING (business_id = get_user_business_id() AND deleted_at IS NULL OR is_super_admin());
CREATE POLICY "business_insert_own" ON tasks
  FOR INSERT WITH CHECK (business_id = get_user_business_id());
CREATE POLICY "business_update_own" ON tasks
  FOR UPDATE USING (business_id = get_user_business_id());

CREATE POLICY "business_select_own" ON price_snapshots
  FOR SELECT USING (business_id = get_user_business_id() OR is_super_admin());
CREATE POLICY "business_insert_own" ON price_snapshots
  FOR INSERT WITH CHECK (business_id = get_user_business_id());
CREATE POLICY "business_update_own" ON price_snapshots
  FOR UPDATE USING (business_id = get_user_business_id());

CREATE POLICY "business_select_own" ON payment_proofs
  FOR SELECT USING (business_id = get_user_business_id() OR is_super_admin());
CREATE POLICY "business_insert_own" ON payment_proofs
  FOR INSERT WITH CHECK (business_id = get_user_business_id());
CREATE POLICY "business_update_own" ON payment_proofs
  FOR UPDATE USING (business_id = get_user_business_id());

-- Subscription plans: viewable by all authenticated users
CREATE POLICY "anyone_view_active_plans" ON subscription_plans
  FOR SELECT USING (is_active = true OR is_super_admin());

-- Admin activity log: super admin only
CREATE POLICY "admin_select_log" ON admin_activity_log
  FOR SELECT USING (is_super_admin());
CREATE POLICY "admin_insert_log" ON admin_activity_log
  FOR INSERT WITH CHECK (is_super_admin());

-- =============================================
-- SEED DATA
-- =============================================
INSERT INTO subscription_plans (name, monthly_price, order_limit, expense_limit, product_limit, features, sort_order) VALUES
  ('Basic', 450.00, 90, 90, 10, '["Core Features"]', 1),
  ('Standard', 950.00, 200, 200, 20, '["Core Features"]', 2),
  ('Premium', 1950.00, 500, 500, 999999, '["Core Features", "Unlimited Products"]', 3),
  ('Enterprise', 0, 999999, 999999, 999999, '["Unlimited Operations", "Team Management", "AI Assistant", "Automations", "Activity Log"]', 4)
  ON CONFLICT DO NOTHING;
