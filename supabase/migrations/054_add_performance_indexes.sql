-- Migration 054: Add Composite Performance Indexes for Fast Query Execution
-- Accelerates dashboard filtering, order listing, inventory checks, and reports.

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_biz_created ON orders (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_biz_status ON orders (business_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_biz_payment ON orders (business_id, payment_status);

-- Expenses table indexes
CREATE INDEX IF NOT EXISTS idx_expenses_biz_date ON expenses (business_id, expense_date DESC);

-- Inventory items table indexes
CREATE INDEX IF NOT EXISTS idx_inventory_biz_deleted ON inventory_items (business_id, deleted_at);

-- Order items table indexes
CREATE INDEX IF NOT EXISTS idx_order_items_biz ON order_items (business_id);

-- Deliveries table indexes
CREATE INDEX IF NOT EXISTS idx_deliveries_biz_status ON deliveries (business_id, status);
