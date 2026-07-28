ALTER TABLE public.ad_campaigns
  ADD COLUMN IF NOT EXISTS label TEXT NOT NULL DEFAULT 'Special Offer'
    CHECK (label IN ('Special Offer', 'Announcement', 'New Feature', 'Upgrade', 'Recommended for You')),
  ADD COLUMN IF NOT EXISTS image_fit TEXT NOT NULL DEFAULT 'cover'
    CHECK (image_fit IN ('cover', 'contain'));
