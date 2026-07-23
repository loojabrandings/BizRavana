-- =============================================
-- Migration 023: Add get_user_emails RPC function
-- Allows super admins to fetch user emails from auth.users
-- =============================================

-- SECURITY DEFINER function that reads from auth.users
-- Only super admins can call this (checked inside the function)
CREATE OR REPLACE FUNCTION get_user_emails(user_ids UUID[])
RETURNS TABLE(user_id UUID, email TEXT)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only super admins can call this
  IF NOT (SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::BOOLEAN,
    FALSE
  )) THEN
    RAISE EXCEPTION 'Only super admins can access user emails';
  END IF;

  RETURN QUERY
  SELECT au.id, au.email::TEXT
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$$;

-- Grant execute to authenticated users (the function itself enforces super_admin check)
GRANT EXECUTE ON FUNCTION get_user_emails(UUID[]) TO authenticated;
