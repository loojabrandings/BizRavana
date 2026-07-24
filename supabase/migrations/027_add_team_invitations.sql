-- =============================================
-- Bizravana - Team Invitations
-- Migration 027: team_invitations table + RLS
-- =============================================

-- 1. TEAM INVITATIONS TABLE
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('admin', 'member')),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. INDEXES
CREATE INDEX idx_team_invitations_business ON team_invitations(business_id, status);
CREATE INDEX idx_team_invitations_email ON team_invitations(email, status);
CREATE INDEX idx_team_invitations_token ON team_invitations(token);
CREATE INDEX idx_team_invitations_expires ON team_invitations(expires_at) WHERE status = 'pending';

-- 3. ROW LEVEL SECURITY
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Owner and admin can view invitations for their business
CREATE POLICY "view_own_business_invitations" ON team_invitations
  FOR SELECT USING (
    business_id = get_user_business_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
        AND business_id = get_user_business_id()
        AND role IN ('owner', 'admin')
    )
    OR is_super_admin()
  );

-- Owner and admin can create invitations
CREATE POLICY "create_invitations" ON team_invitations
  FOR INSERT WITH CHECK (
    business_id = get_user_business_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
        AND business_id = get_user_business_id()
        AND role IN ('owner', 'admin')
    )
    AND invited_by = auth.uid()
    OR is_super_admin()
  );

-- Owner and admin can update invitations (cancel, etc.)
CREATE POLICY "update_own_business_invitations" ON team_invitations
  FOR UPDATE USING (
    business_id = get_user_business_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
        AND business_id = get_user_business_id()
        AND role IN ('owner', 'admin')
    )
    OR is_super_admin()
  );

-- Owner and admin can delete invitations
CREATE POLICY "delete_own_business_invitations" ON team_invitations
  FOR DELETE USING (
    business_id = get_user_business_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
        AND business_id = get_user_business_id()
        AND role IN ('owner', 'admin')
    )
    OR is_super_admin()
  );

-- 4. PROFILE POLICY: Allow owner/admin to update other team members' profiles
-- (remove from team, change role, etc.)
CREATE POLICY "owner_admin_update_team_members" ON profiles
  FOR UPDATE USING (
    business_id = get_user_business_id()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
        AND p.business_id = get_user_business_id()
        AND p.role IN ('owner', 'admin')
    )
    AND user_id != auth.uid()  -- not self
  );

-- 5. RPC to get pending invitations for a user by email
CREATE OR REPLACE FUNCTION get_pending_invitations(target_email TEXT)
RETURNS TABLE (
  id UUID,
  business_id UUID,
  business_name TEXT,
  role TEXT,
  token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT
    ti.id,
    ti.business_id,
    b.name,
    ti.role,
    ti.token,
    ti.expires_at,
    ti.created_at
  FROM team_invitations ti
  JOIN businesses b ON b.id = ti.business_id
  WHERE ti.email = target_email
    AND ti.status = 'pending'
    AND ti.expires_at > now()
  ORDER BY ti.created_at DESC;
$$;

-- 5. RPC to accept an invitation
CREATE OR REPLACE FUNCTION accept_invitation(invitation_token TEXT, accepting_user_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  inv_record team_invitations%ROWTYPE;
  existing_profile_id UUID;
  new_business_id UUID;
BEGIN
  -- Get the invitation
  SELECT * INTO inv_record
  FROM team_invitations
  WHERE token = invitation_token
    AND status = 'pending'
    AND expires_at > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation token';
  END IF;

  -- Check if user already has a profile in this business
  SELECT id INTO existing_profile_id
  FROM profiles
  WHERE user_id = accepting_user_id
    AND business_id = inv_record.business_id;

  IF FOUND THEN
    -- Already a member — just update the role if the invitation has a higher role
    UPDATE profiles
    SET role = CASE
        WHEN inv_record.role = 'admin' AND profiles.role = 'member' THEN 'admin'
        ELSE profiles.role
      END,
      updated_at = now()
    WHERE id = existing_profile_id
    RETURNING business_id INTO new_business_id;
  ELSE
    -- Create a new profile linked to the business
    INSERT INTO profiles (user_id, business_id, full_name, phone, role)
    VALUES (
      accepting_user_id,
      inv_record.business_id,
      COALESCE((SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = accepting_user_id), 'Team Member'),
      (SELECT raw_user_meta_data->>'phone' FROM auth.users WHERE id = accepting_user_id),
      inv_record.role
    )
    RETURNING business_id INTO new_business_id;
  END IF;

  -- Mark invitation as accepted
  UPDATE team_invitations
  SET status = 'accepted',
      accepted_at = now(),
      updated_at = now()
  WHERE id = inv_record.id;

  -- Return the business_id
  RETURN new_business_id;
END;
$$;
