CREATE TABLE IF NOT EXISTS public.bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 3 AND 150),
  description TEXT NOT NULL CHECK (char_length(trim(description)) BETWEEN 10 AND 5000),
  expected_result TEXT CHECK (expected_result IS NULL OR char_length(expected_result) <= 3000),
  page_url TEXT CHECK (page_url IS NULL OR char_length(page_url) <= 1000),
  browser_info TEXT CHECK (browser_info IS NULL OR char_length(browser_info) <= 1000),
  screenshot_path TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewing', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT CHECK (admin_notes IS NULL OR char_length(admin_notes) <= 5000),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bug_reports_user_created_idx
  ON public.bug_reports (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS bug_reports_status_created_idx
  ON public.bug_reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS bug_reports_business_idx
  ON public.bug_reports (business_id);

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE ON public.bug_reports TO authenticated;
GRANT ALL ON public.bug_reports TO service_role;

DROP POLICY IF EXISTS "users_read_own_bug_reports" ON public.bug_reports;
CREATE POLICY "users_read_own_bug_reports"
ON public.bug_reports FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "super_admin_manage_bug_reports" ON public.bug_reports;
CREATE POLICY "super_admin_manage_bug_reports"
ON public.bug_reports FOR ALL TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bug-report-screenshots',
  'bug-report-screenshots',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::TEXT[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::TEXT[];

DROP POLICY IF EXISTS "super_admin_read_bug_report_screenshots" ON storage.objects;
CREATE POLICY "super_admin_read_bug_report_screenshots"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'bug-report-screenshots'
  AND public.is_super_admin()
);
