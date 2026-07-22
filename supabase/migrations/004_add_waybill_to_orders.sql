-- =============================================
-- Add waybill_id column to orders table
-- Migration 004
-- =============================================

ALTER TABLE orders
  ADD COLUMN waybill_id TEXT;

-- Index for fast lookup by waybill
CREATE INDEX idx_orders_waybill ON orders(business_id, waybill_id);
