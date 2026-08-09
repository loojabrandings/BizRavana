-- ================================================================
-- BizRavana - Preserve existing team privilege during invitation acceptance
-- Migration 043
-- ================================================================

-- Migration 040 binds invitation acceptance to the authenticated user's ID
-- and email. Preserve that security boundary while preventing a same-business
-- invitation from downgrading an existing Owner or Business Manager profile.
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
          -- A detached profile adopts the invited role.
          WHEN existing_profile.business_id IS NULL
            THEN invitation_record.role
          -- Same-business invitations may promote, but never downgrade.
          WHEN existing_profile.role = 'owner' THEN 'owner'
          WHEN existing_profile.role = 'admin' THEN 'admin'
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
