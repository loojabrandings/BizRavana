-- =============================================
-- Add provider_id to manual_waybills for per-courier waybills
-- Migration 038
-- =============================================

-- 1. ADD PROVIDER_ID COLUMN
ALTER TABLE manual_waybills
  ADD COLUMN provider_id TEXT;

-- 2. INDEX FOR PROVIDER-BASED QUERIES
CREATE INDEX idx_manual_waybills_provider ON manual_waybills(business_id, provider_id)
  WHERE deleted_at IS NULL;

-- 3. UPDATE EXISTING UNIQUE CONSTRAINT TO INCLUDE PROVIDER
-- Remove old unique constraint (business_id, waybill_id)
ALTER TABLE manual_waybills
  DROP CONSTRAINT IF EXISTS manual_waybills_business_id_waybill_id_key;

-- Add new unique constraint including provider_id
ALTER TABLE manual_waybills
  ADD CONSTRAINT manual_waybills_business_id_provider_id_waybill_id_key
  UNIQUE(business_id, provider_id, waybill_id);

-- 4. COMMENTS
COMMENT ON COLUMN manual_waybills.provider_id IS 'Courier provider ID (e.g. "royal_express"). Null for backward compatibility with imported waybills.';
