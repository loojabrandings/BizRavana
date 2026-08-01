-- =============================================
-- Add courier_provider to orders for per-courier filtering
-- Migration 039
-- =============================================

-- 1. ADD COURIER_PROVIDER COLUMN
ALTER TABLE orders
  ADD COLUMN courier_provider TEXT;

-- 2. INDEX FOR COURIER-BASED QUERIES
CREATE INDEX idx_orders_courier_provider ON orders(business_id, courier_provider)
  WHERE courier_provider IS NOT NULL;

-- 3. BACKFILL: Set courier_provider for existing dispatched orders
-- by matching waybill_id against existing delivery records.
-- This is a best-effort backfill; orders without matching delivery
-- records will remain NULL and be handled by the next dispatch.
UPDATE orders o
  SET courier_provider = d.courier
  FROM deliveries d
  WHERE d.order_id = o.id
    AND o.waybill_id IS NOT NULL
    AND o.courier_provider IS NULL;

-- 4. COMMENTS
COMMENT ON COLUMN orders.courier_provider IS 'Courier provider ID used when dispatching (e.g. "royal_express", "koombiyo"). NULL for orders dispatched before this column existed.';
