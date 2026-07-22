-- =============================================
-- Add courier_shipment_metadata to orders table
-- Migration 016
-- =============================================
-- Stores the courier API response snapshot so shipping labels
-- can be reprinted without re-calling the courier API.
-- Also stores the waybill label PDF for reprint/download.

ALTER TABLE orders
  ADD COLUMN courier_shipment_metadata JSONB;

COMMENT ON COLUMN orders.courier_shipment_metadata IS
  'Snapshot of courier API response data for shipping label reprints. Stores provider, waybill, shippedAt, and raw response.';
