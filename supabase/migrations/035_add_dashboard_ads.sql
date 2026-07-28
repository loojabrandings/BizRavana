CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 3 AND 150),
  description TEXT NOT NULL CHECK (char_length(trim(description)) BETWEEN 3 AND 1000),
  image_path TEXT,
  cta_text TEXT CHECK (cta_text IS NULL OR char_length(cta_text) <= 50),
  cta_url TEXT CHECK (cta_url IS NULL OR char_length(cta_url) <= 1000),
  target_plan_ids UUID[] NOT NULL DEFAULT '{}',
  website_target TEXT NOT NULL DEFAULT 'all'
    CHECK (website_target IN ('all', 'missing', 'present')),
  target_business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL DEFAULT 0 CHECK (priority BETWEEN 0 AND 100),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (starts_at IS NULL OR ends_at IS NULL OR ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS public.ad_dismissals (
  ad_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  dismissed_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (ad_id, user_id)
);

CREATE INDEX IF NOT EXISTS ad_campaigns_delivery_idx
  ON public.ad_campaigns (is_active, priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS ad_dismissals_user_idx
  ON public.ad_dismissals (user_id, dismissed_until);

ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_dismissals ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ad_campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.ad_dismissals TO authenticated;
GRANT ALL ON public.ad_campaigns, public.ad_dismissals TO service_role;

DROP POLICY IF EXISTS "super_admin_manage_ad_campaigns" ON public.ad_campaigns;
CREATE POLICY "super_admin_manage_ad_campaigns"
ON public.ad_campaigns FOR ALL TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "users_manage_own_ad_dismissals" ON public.ad_dismissals;
CREATE POLICY "users_manage_own_ad_dismissals"
ON public.ad_dismissals FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND business_id = public.get_user_business_id()
);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dashboard-ads',
  'dashboard-ads',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::TEXT[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::TEXT[];

DROP POLICY IF EXISTS "super_admin_manage_dashboard_ad_images" ON storage.objects;
CREATE POLICY "super_admin_manage_dashboard_ad_images"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'dashboard-ads'
  AND public.is_super_admin()
)
WITH CHECK (
  bucket_id = 'dashboard-ads'
  AND public.is_super_admin()
);
