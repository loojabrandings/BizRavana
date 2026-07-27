-- =============================================
-- Migration 037: Create cloud-backups storage bucket & RLS
-- =============================================

-- 1. CREATE STORAGE BUCKET (private — backups contain sensitive data)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cloud-backups',
  'cloud-backups',
  false,                          -- private bucket (access via RLS only)
  104857600,                      -- 100MB file size limit
  ARRAY['application/gzip', 'application/x-gzip', 'application/x-sql', 'application/json', 'text/csv', 'application/zip', 'application/x-sqlite3', 'application/octet-stream']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- 2. STORAGE RLS POLICIES
-- Drop existing policies first to allow re-running the migration
DROP POLICY IF EXISTS "business_read_own_backups" ON storage.objects;
DROP POLICY IF EXISTS "business_insert_own_backups" ON storage.objects;
DROP POLICY IF EXISTS "business_update_own_backups" ON storage.objects;
DROP POLICY IF EXISTS "business_delete_own_backups" ON storage.objects;

-- Business users can read only their own backups
-- Path format: {businessId}/{fileName} (e.g., "abc-123/backup-2026-07-27.json")
CREATE POLICY "business_read_own_backups"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'cloud-backups'
    AND (
      public.is_super_admin()
      OR (storage.foldername(name))[1] = public.get_user_business_id()::text
    )
  );

-- Business users can upload backups to their own folder
CREATE POLICY "business_insert_own_backups"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'cloud-backups'
    AND (storage.foldername(name))[1] = public.get_user_business_id()::text
  );

-- Business users can update their own backups
CREATE POLICY "business_update_own_backups"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'cloud-backups'
    AND (
      public.is_super_admin()
      OR (storage.foldername(name))[1] = public.get_user_business_id()::text
    )
  );

-- Business users can delete their own backups
CREATE POLICY "business_delete_own_backups"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'cloud-backups'
    AND (
      public.is_super_admin()
      OR (storage.foldername(name))[1] = public.get_user_business_id()::text
    )
  );
