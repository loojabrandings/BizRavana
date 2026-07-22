-- =============================================
-- Migration 013: Extend storage RLS to allow logos/ path
-- =============================================
-- The original storage policies only allowed avatars/{userId}/ paths.
-- Logo uploads use logos/{businessId}/ paths, which were rejected.
-- This migration drops and recreates the INSERT/UPDATE/DELETE policies
-- to also allow the logos/ path, using get_user_business_id() to
-- verify the authenticated user owns the business.

-- 1. Drop old avatar-only policies
DROP POLICY IF EXISTS "authenticated_upload_profile_images" ON storage.objects;
DROP POLICY IF EXISTS "own_update_profile_images" ON storage.objects;
DROP POLICY IF EXISTS "own_delete_profile_images" ON storage.objects;

-- 2. Recreate INSERT policy — allows both avatars/{userId} and logos/{businessId}
CREATE POLICY "authenticated_upload_profile_images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-images'
    AND (
      -- Avatar upload: avatars/{userId}/...
      ((storage.foldername(name))[1] = 'avatars'
        AND (storage.foldername(name))[2] = auth.uid()::text)
      OR
      -- Logo upload: logos/{businessId}/... (must own the business)
      ((storage.foldername(name))[1] = 'logos'
        AND (storage.foldername(name))[2] = get_user_business_id()::text)
    )
  );

-- 3. Recreate UPDATE policy — allows both avatars/{userId} and logos/{businessId}
CREATE POLICY "own_update_profile_images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND (
      ((storage.foldername(name))[1] = 'avatars'
        AND (storage.foldername(name))[2] = auth.uid()::text)
      OR
      ((storage.foldername(name))[1] = 'logos'
        AND (storage.foldername(name))[2] = get_user_business_id()::text)
    )
  );

-- 4. Recreate DELETE policy — allows both avatars/{userId} and logos/{businessId}
CREATE POLICY "own_delete_profile_images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND (
      ((storage.foldername(name))[1] = 'avatars'
        AND (storage.foldername(name))[2] = auth.uid()::text)
      OR
      ((storage.foldername(name))[1] = 'logos'
        AND (storage.foldername(name))[2] = get_user_business_id()::text)
    )
  );
