-- =============================================
-- Add manual_waybills table and waybill_method setting
-- Migration 017
-- =============================================

-- 1. MANUAL WAYBILLS TABLE
CREATE TABLE manual_waybills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  waybill_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'assigned', 'used', 'invalid')),
  assigned_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  UNIQUE(business_id, waybill_id)
);

-- Indexes
CREATE INDEX idx_manual_waybills_business ON manual_waybills(business_id, deleted_at);
CREATE INDEX idx_manual_waybills_status ON manual_waybills(business_id, status);
CREATE INDEX idx_manual_waybills_assigned ON manual_waybills(assigned_order_id);
CREATE INDEX idx_manual_waybills_search ON manual_waybills(business_id, waybill_id text_pattern_ops);

-- Comments
COMMENT ON TABLE manual_waybills IS 'Manual waybill IDs managed by the business for courier dispatch.';
COMMENT ON COLUMN manual_waybills.status IS 'available = can be assigned, assigned = linked to order, used = consumed, invalid = flagged as invalid';
COMMENT ON COLUMN manual_waybills.assigned_order_id IS 'Order this waybill is assigned to, if any.';

-- 2. ROW LEVEL SECURITY
ALTER TABLE manual_waybills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "business_select_own" ON manual_waybills
  FOR SELECT USING (business_id = get_user_business_id() OR is_super_admin());

CREATE POLICY "business_insert_own" ON manual_waybills
  FOR INSERT WITH CHECK (business_id = get_user_business_id());

CREATE POLICY "business_update_own" ON manual_waybills
  FOR UPDATE USING (business_id = get_user_business_id());

CREATE POLICY "business_delete_own" ON manual_waybills
  FOR DELETE USING (business_id = get_user_business_id() AND deleted_at IS NULL);
