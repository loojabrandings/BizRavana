-- =============================================
-- Fix recursive profile RLS helper functions
-- Migration 003
-- =============================================

-- This helper must bypass profiles RLS. Otherwise the profiles SELECT policy
-- calls the helper, which queries profiles, which evaluates the policy again.
CREATE OR REPLACE FUNCTION public.get_user_business_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT business_id
  FROM public.profiles
  WHERE user_id = auth.uid();
$$;

-- Business-level "admin" is not a platform super-admin. Read the platform
-- privilege from protected app_metadata instead of profiles, avoiding both
-- recursion and cross-tenant access for ordinary business admins.
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::BOOLEAN,
    FALSE
  );
$$;

REVOKE ALL ON FUNCTION public.get_user_business_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_business_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
