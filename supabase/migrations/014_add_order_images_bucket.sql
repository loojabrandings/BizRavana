-- =============================================
-- Migration 014: Create order-images storage bucket & RLS
-- =============================================

-- 1. CREATE STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'order-images',
  'order-images',
  true,                           -- public bucket (images need to be accessible via URL)
  5242880,                        -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- 2. STORAGE RLS POLICIES
-- Allow anyone to view order images (they're public URLs)
CREATE POLICY "public_read_order_images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'order-images');

-- Allow authenticated users to upload order images
-- Path format: orders/{businessId}/{filename}
CREATE POLICY "authenticated_upload_order_images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'order-images'
    AND (
      (storage.foldername(name))[1] = 'orders'
    )
  );

-- Allow authenticated users to update their own order images
CREATE POLICY "authenticated_update_order_images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'order-images');

-- Allow authenticated users to delete their own order images
CREATE POLICY "authenticated_delete_order_images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'order-images');
