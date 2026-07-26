-- =============================================
-- Allow Auth users to be deleted without losing platform audit/history rows
-- Migration 029
-- =============================================

-- Historical admin actions must remain after the actor's Auth account is
-- deleted. The API snapshots the actor email into details before deletion.
ALTER TABLE public.admin_activity_log
  DROP CONSTRAINT IF EXISTS admin_activity_log_admin_id_fkey;

ALTER TABLE public.admin_activity_log
  ADD CONSTRAINT admin_activity_log_admin_id_fkey
  FOREIGN KEY (admin_id)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

-- Keep historical payment reviews even when a former admin account is removed.
ALTER TABLE public.payment_proofs
  DROP CONSTRAINT IF EXISTS payment_proofs_approved_by_fkey;

ALTER TABLE public.payment_proofs
  ADD CONSTRAINT payment_proofs_approved_by_fkey
  FOREIGN KEY (approved_by)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

ALTER TABLE public.payment_proofs
  DROP CONSTRAINT IF EXISTS payment_proofs_submitted_by_fkey;

ALTER TABLE public.payment_proofs
  ADD CONSTRAINT payment_proofs_submitted_by_fkey
  FOREIGN KEY (submitted_by)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

-- Platform broadcasts are historical content and should not block deletion of
-- the admin account that originally created them.
ALTER TABLE public.notification_broadcasts
  DROP CONSTRAINT IF EXISTS notification_broadcasts_created_by_fkey;

ALTER TABLE public.notification_broadcasts
  ADD CONSTRAINT notification_broadcasts_created_by_fkey
  FOREIGN KEY (created_by)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;
