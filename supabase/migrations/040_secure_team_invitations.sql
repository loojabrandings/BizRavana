-- =============================================
-- BizRavana - Secure team invitation boundaries
-- Migration 040
-- =============================================

-- Pending invitations may only be discovered by the authenticated user who
-- owns the target email address. The function remains SECURITY DEFINER so a
-- not-yet-provisioned user can see their invitation without table-level RLS.
CREATE OR REPLACE FUNCTION public.get_pending_invitations(target_email TEXT)
RETURNS TABLE (
  id UUID,
  business_id UUID,
  business_name TEXT,
  role TEXT,
  token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  authenticated_email TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT LOWER(TRIM(au.email))
    INTO authenticated_email
  FROM auth.users AS au
  WHERE au.id = auth.uid();

  IF authenticated_email IS NULL
     OR authenticated_email <> LOWER(TRIM(target_email)) THEN
    RAISE EXCEPTION 'Invitation email does not match authenticated user';
  END IF;

  RETURN QUERY
  SELECT
    ti.id,
    ti.business_id,
    b.name,
    ti.role,
    ti.token,
    ti.expires_at,
    ti.created_at
  FROM public.team_invitations AS ti
  JOIN public.businesses AS b ON b.id = ti.business_id
  WHERE LOWER(TRIM(ti.email)) = authenticated_email
    AND ti.status = 'pending'
    AND ti.expires_at > NOW()
  ORDER BY ti.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_pending_invitations(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_pending_invitations(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_pending_invitations(TEXT) TO authenticated;

-- Invitation acceptance is tied to auth.uid() and the authenticated user's
-- email. Passing another user's UUID or using a token issued to another email
-- is rejected even when the caller knows a valid token.
CREATE OR REPLACE FUNCTION public.accept_invitation(
  invitation_token TEXT,
  accepting_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  invitation_record public.team_invitations%ROWTYPE;
  existing_profile public.profiles%ROWTYPE;
  authenticated_email TEXT;
  new_business_id UUID;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> accepting_user_id THEN
    RAISE EXCEPTION 'Authenticated user does not match accepting user';
  END IF;

  SELECT LOWER(TRIM(au.email))
    INTO authenticated_email
  FROM auth.users AS au
  WHERE au.id = auth.uid();

  SELECT *
    INTO invitation_record
  FROM public.team_invitations AS ti
  WHERE ti.token = invitation_token
    AND ti.status = 'pending'
    AND ti.expires_at > NOW()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation token';
  END IF;

  IF authenticated_email IS NULL
     OR LOWER(TRIM(invitation_record.email)) <> authenticated_email THEN
    RAISE EXCEPTION 'Invitation email does not match authenticated user';
  END IF;

  SELECT *
    INTO existing_profile
  FROM public.profiles AS p
  WHERE p.user_id = accepting_user_id
  LIMIT 1;

  IF FOUND THEN
    IF existing_profile.business_id IS NOT NULL
       AND existing_profile.business_id <> invitation_record.business_id THEN
      RAISE EXCEPTION 'User already belongs to another business';
    END IF;

    UPDATE public.profiles AS p
    SET business_id = invitation_record.business_id,
        role = CASE
          WHEN invitation_record.role = 'admin' THEN 'admin'
          ELSE 'member'
        END,
        updated_at = NOW()
    WHERE p.id = existing_profile.id
    RETURNING p.business_id INTO new_business_id;
  ELSE
    INSERT INTO public.profiles (
      user_id,
      business_id,
      full_name,
      phone,
      role
    )
    VALUES (
      accepting_user_id,
      invitation_record.business_id,
      COALESCE(
        (
          SELECT au.raw_user_meta_data ->> 'full_name'
          FROM auth.users AS au
          WHERE au.id = accepting_user_id
        ),
        'Team Member'
      ),
      (
        SELECT au.raw_user_meta_data ->> 'phone'
        FROM auth.users AS au
        WHERE au.id = accepting_user_id
      ),
      invitation_record.role
    )
    RETURNING business_id INTO new_business_id;
  END IF;

  UPDATE public.team_invitations AS ti
  SET status = 'accepted',
      accepted_at = NOW(),
      updated_at = NOW()
  WHERE ti.id = invitation_record.id;

  RETURN new_business_id;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_invitation(TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.accept_invitation(TEXT, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.accept_invitation(TEXT, UUID) TO authenticated;
