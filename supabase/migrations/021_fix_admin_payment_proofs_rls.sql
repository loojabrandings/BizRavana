-- =============================================
-- Fix RLS policies for payment_proofs to allow
-- super admin update/delete
-- Migration 021: Add is_super_admin() check to
--   payment_proofs policies
-- =============================================
--
-- The existing UPDATE and DELETE policies for
-- payment_proofs only allow the business owner to
-- modify their own records. Super admins (who
-- approve/reject payments in the Admin Panel) need
-- to be able to update and delete payment proofs.

-- ─── UPDATE policy ─────────────────────────────────────────
DROP POLICY IF EXISTS "business_update_own" ON payment_proofs;
CREATE POLICY "business_update_own" ON payment_proofs
  FOR UPDATE
  USING (business_id = get_user_business_id() OR is_super_admin())
  WITH CHECK (business_id = get_user_business_id() OR is_super_admin());

-- ─── DELETE policy ─────────────────────────────────────────
DROP POLICY IF EXISTS "business_delete_own" ON payment_proofs;
CREATE POLICY "business_delete_own" ON payment_proofs
  FOR DELETE
  USING (business_id = get_user_business_id() OR is_super_admin());
