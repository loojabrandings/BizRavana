-- =============================================
-- Add order_source column to orders table
-- Migration 006
-- =============================================

ALTER TABLE orders
  ADD COLUMN order_source TEXT DEFAULT 'ad';

-- Index for filtering/sorting by source
CREATE INDEX idx_orders_source ON orders(business_id, order_source);
