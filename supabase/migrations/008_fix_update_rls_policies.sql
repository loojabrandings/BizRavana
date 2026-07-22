-- =============================================
-- Fix UPDATE RLS policies — add explicit WITH CHECK clauses
-- Migration 008: Ensure soft-delete (SET deleted_at) works via UPDATE
-- =============================================
--
-- The error "new row violates row-level security policy" occurs because
-- the original UPDATE policies only had USING clauses. While PostgreSQL
-- defaults WITH CHECK to the USING expression, the Supabase REST API
-- (PostgREST) can fail when validating bulk updates. Adding explicit
-- WITH CHECK clauses resolves this.

-- Products
DROP POLICY IF EXISTS "business_update_own" ON products;
CREATE POLICY "business_update_own" ON products
  FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());

-- Price snapshots
DROP POLICY IF EXISTS "business_update_own" ON price_snapshots;
CREATE POLICY "business_update_own" ON price_snapshots
  FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());

-- Inventory items
DROP POLICY IF EXISTS "business_update_own" ON inventory_items;
CREATE POLICY "business_update_own" ON inventory_items
  FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());

-- Inventory transactions
DROP POLICY IF EXISTS "business_update_own" ON inventory_transactions;
CREATE POLICY "business_update_own" ON inventory_transactions
  FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());

-- Customers
DROP POLICY IF EXISTS "business_update_own" ON customers;
CREATE POLICY "business_update_own" ON customers
  FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());

-- Orders
DROP POLICY IF EXISTS "business_update_own" ON orders;
CREATE POLICY "business_update_own" ON orders
  FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());

-- Order items
DROP POLICY IF EXISTS "business_update_own" ON order_items;
CREATE POLICY "business_update_own" ON order_items
  FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());

-- Order status history
DROP POLICY IF EXISTS "business_update_own" ON order_status_history;
CREATE POLICY "business_update_own" ON order_status_history
  FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());

-- Quotations
DROP POLICY IF EXISTS "business_update_own" ON quotations;
CREATE POLICY "business_update_own" ON quotations
  FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());

-- Quotation items
DROP POLICY IF EXISTS "business_update_own" ON quotation_items;
CREATE POLICY "business_update_own" ON quotation_items
  FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());

-- Expenses
DROP POLICY IF EXISTS "business_update_own" ON expenses;
CREATE POLICY "business_update_own" ON expenses
  FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());

-- Deliveries
DROP POLICY IF EXISTS "business_update_own" ON deliveries;
CREATE POLICY "business_update_own" ON deliveries
  FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());

-- Notifications
DROP POLICY IF EXISTS "business_update_own" ON notifications;
CREATE POLICY "business_update_own" ON notifications
  FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());

-- Business settings
DROP POLICY IF EXISTS "business_update_own" ON business_settings;
CREATE POLICY "business_update_own" ON business_settings
  FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());

-- Tasks
DROP POLICY IF EXISTS "business_update_own" ON tasks;
CREATE POLICY "business_update_own" ON tasks
  FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());

-- Payment proofs
DROP POLICY IF EXISTS "business_update_own" ON payment_proofs;
CREATE POLICY "business_update_own" ON payment_proofs
  FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());

-- Categories (added in migration 007)
DROP POLICY IF EXISTS "business_update_own" ON categories;
CREATE POLICY "business_update_own" ON categories
  FOR UPDATE
  USING (business_id = get_user_business_id())
  WITH CHECK (business_id = get_user_business_id());
