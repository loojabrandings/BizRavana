-- =============================================
-- Migration 007: Add categories table
-- =============================================

-- 1. CATEGORIES TABLE
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by business
CREATE INDEX idx_categories_business ON categories(business_id);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS policies (matching existing patterns)
CREATE POLICY "business_select_own" ON categories
  FOR SELECT USING (business_id = get_user_business_id() OR is_super_admin());

CREATE POLICY "business_insert_own" ON categories
  FOR INSERT WITH CHECK (business_id = get_user_business_id());

CREATE POLICY "business_update_own" ON categories
  FOR UPDATE USING (business_id = get_user_business_id());

CREATE POLICY "business_delete_own" ON categories
  FOR DELETE USING (business_id = get_user_business_id());
