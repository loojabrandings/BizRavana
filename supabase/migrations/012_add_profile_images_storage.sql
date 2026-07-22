-- =============================================
-- Migration 012: Create profile-images storage bucket & RLS
-- =============================================

-- 1. CREATE STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,                           -- public bucket (avatars need to be accessible via URL)
  2097152,                        -- 2MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- 2. STORAGE RLS POLICIES
-- Allow anyone to view profile images (they're public URLs)
CREATE POLICY "public_read_profile_images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile-images');

-- Allow authenticated users to upload profile images
-- Path format: avatars/{userId}/{filename}
CREATE POLICY "authenticated_upload_profile_images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow users to update their own profile images
CREATE POLICY "own_update_profile_images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow users to delete their own profile images
CREATE POLICY "own_delete_profile_images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = 'avatars'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
