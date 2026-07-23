-- =============================================
-- Migration 019: Create payment-proofs storage bucket & RLS
-- =============================================

-- 1. CREATE STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  true,                           -- public bucket (proof images need to be accessible via URL)
  5242880,                        -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- 2. STORAGE RLS POLICIES
-- Allow anyone to view payment proofs (they're public URLs)
CREATE POLICY "public_read_payment_proofs"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'payment-proofs');

-- Allow authenticated users to upload payment proofs
-- Path format: proofs/{businessId}/{filename}
CREATE POLICY "authenticated_upload_payment_proofs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND (
      (storage.foldername(name))[1] = 'proofs'
    )
  );

-- Allow authenticated users to update their own payment proofs
CREATE POLICY "authenticated_update_payment_proofs"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'payment-proofs');

-- Allow authenticated users to delete their own payment proofs
CREATE POLICY "authenticated_delete_payment_proofs"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'payment-proofs');
