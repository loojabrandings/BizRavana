-- =============================================
-- Migration 026: Add DELETE policy for profiles
-- =============================================
--
-- The Data & Security → Danger Zone "Reset All Data" action
-- now deletes user profiles associated with the business.
-- Previously, the profiles table only had SELECT, INSERT,
-- and UPDATE policies — no DELETE policy existed, so the
-- reset's delete call was silently blocked by RLS.
--
-- The policy uses the same business-scoped pattern as other
-- tables: users can delete profiles that belong to their
-- own business. The client-side code additionally excludes
-- the current user's own profile (.neq("user_id", userId))
-- to prevent the user from deleting themselves.

CREATE POLICY "business_delete_own" ON profiles
  FOR DELETE USING (business_id = get_user_business_id());
