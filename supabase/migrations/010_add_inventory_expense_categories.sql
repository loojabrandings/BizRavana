-- =============================================
-- Migration 010: Add inventory & expense categories tables
-- These are separate from the product "categories" table.
-- =============================================

-- 1. INVENTORY CATEGORIES TABLE
CREATE TABLE inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_inventory_categories_business ON inventory_categories(business_id);

ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "business_select_own" ON inventory_categories
  FOR SELECT USING (business_id = get_user_business_id() OR is_super_admin());

CREATE POLICY "business_insert_own" ON inventory_categories
  FOR INSERT WITH CHECK (business_id = get_user_business_id());

CREATE POLICY "business_update_own" ON inventory_categories
  FOR UPDATE USING (business_id = get_user_business_id());

CREATE POLICY "business_delete_own" ON inventory_categories
  FOR DELETE USING (business_id = get_user_business_id());

-- 2. EXPENSE CATEGORIES TABLE
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_expense_categories_business ON expense_categories(business_id);

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "business_select_own" ON expense_categories
  FOR SELECT USING (business_id = get_user_business_id() OR is_super_admin());

CREATE POLICY "business_insert_own" ON expense_categories
  FOR INSERT WITH CHECK (business_id = get_user_business_id());

CREATE POLICY "business_update_own" ON expense_categories
  FOR UPDATE USING (business_id = get_user_business_id());

CREATE POLICY "business_delete_own" ON expense_categories
  FOR DELETE USING (business_id = get_user_business_id());
