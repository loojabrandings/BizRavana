-- =============================================
-- Add DELETE RLS policies for all business-scoped tables
-- Migration 005: Fix delete operations blocked by RLS
-- =============================================

-- Products
CREATE POLICY "business_delete_own" ON products
  FOR DELETE USING (business_id = get_user_business_id());

-- Price snapshots
CREATE POLICY "business_delete_own" ON price_snapshots
  FOR DELETE USING (business_id = get_user_business_id());

-- Inventory items
CREATE POLICY "business_delete_own" ON inventory_items
  FOR DELETE USING (business_id = get_user_business_id());

-- Inventory transactions
CREATE POLICY "business_delete_own" ON inventory_transactions
  FOR DELETE USING (business_id = get_user_business_id());

-- Customers
CREATE POLICY "business_delete_own" ON customers
  FOR DELETE USING (business_id = get_user_business_id());

-- Orders (needed for delete functionality)
CREATE POLICY "business_delete_own" ON orders
  FOR DELETE USING (business_id = get_user_business_id());

-- Order items (needed for delete functionality)
CREATE POLICY "business_delete_own" ON order_items
  FOR DELETE USING (business_id = get_user_business_id());

-- Order status history
CREATE POLICY "business_delete_own" ON order_status_history
  FOR DELETE USING (business_id = get_user_business_id());

-- Quotations
CREATE POLICY "business_delete_own" ON quotations
  FOR DELETE USING (business_id = get_user_business_id());

-- Quotation items
CREATE POLICY "business_delete_own" ON quotation_items
  FOR DELETE USING (business_id = get_user_business_id());

-- Expenses
CREATE POLICY "business_delete_own" ON expenses
  FOR DELETE USING (business_id = get_user_business_id());

-- Deliveries
CREATE POLICY "business_delete_own" ON deliveries
  FOR DELETE USING (business_id = get_user_business_id());

-- Notifications
CREATE POLICY "business_delete_own" ON notifications
  FOR DELETE USING (business_id = get_user_business_id());

-- Business settings
CREATE POLICY "business_delete_own" ON business_settings
  FOR DELETE USING (business_id = get_user_business_id());

-- Tasks
CREATE POLICY "business_delete_own" ON tasks
  FOR DELETE USING (business_id = get_user_business_id());

-- Payment proofs
CREATE POLICY "business_delete_own" ON payment_proofs
  FOR DELETE USING (business_id = get_user_business_id());
