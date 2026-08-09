-- Route user-supplied files through the authenticated application endpoint so
-- their contents can be signature-checked before service-role upload.

DROP POLICY IF EXISTS "authenticated_upload_profile_images" ON storage.objects;
DROP POLICY IF EXISTS "own_update_profile_images" ON storage.objects;
DROP POLICY IF EXISTS "own_delete_profile_images" ON storage.objects;

DROP POLICY IF EXISTS "authenticated_upload_order_images" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_update_order_images" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete_order_images" ON storage.objects;

DROP POLICY IF EXISTS "super_admin_manage_dashboard_ad_images" ON storage.objects;

-- Migration 028 made receipts private. Keep that boundary while aligning the
-- bucket MIME allowlist with the server route's supported receipt formats.
UPDATE storage.buckets
SET public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY[
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ]::TEXT[]
WHERE id = 'payment-proofs';
