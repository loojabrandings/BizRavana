import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function json(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Please sign in." }, 401);

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("user_id", user.id)
    .single();
  if (!profile?.business_id) return json({ ad: null });

  const admin = getAdminClient();
  const now = new Date().toISOString();
  const [{ data: business }, { data: websiteSetting }, { data: dismissals }, { data: ads }] =
    await Promise.all([
      admin
        .from("businesses")
        .select("id, plan_id")
        .eq("id", profile.business_id)
        .is("deleted_at", null)
        .single(),
      admin
        .from("business_settings")
        .select("value")
        .eq("business_id", profile.business_id)
        .eq("key", "website")
        .maybeSingle(),
      admin
        .from("ad_dismissals")
        .select("ad_id")
        .eq("user_id", user.id)
        .gt("dismissed_until", now),
      admin
        .from("ad_campaigns")
        .select("*")
        .eq("is_active", true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gt.${now}`)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);

  if (!business) return json({ ad: null });

  const website = typeof websiteSetting?.value === "string"
    ? websiteSetting.value.trim()
    : "";
  const dismissedIds = new Set((dismissals ?? []).map((item) => item.ad_id));
  const matched = (ads ?? []).find((ad) => {
    if (dismissedIds.has(ad.id)) return false;
    if (ad.target_business_id && ad.target_business_id !== business.id) return false;
    if (ad.target_plan_ids.length > 0 && (!business.plan_id || !ad.target_plan_ids.includes(business.plan_id))) {
      return false;
    }
    if (ad.website_target === "missing" && website) return false;
    if (ad.website_target === "present" && !website) return false;
    return true;
  });

  if (!matched) return json({ ad: null });

  const imageUrl = matched.image_path
    ? admin.storage.from("dashboard-ads").getPublicUrl(matched.image_path).data.publicUrl
    : null;

  return json({
    ad: {
      id: matched.id,
      label: matched.label,
      title: matched.title,
      description: matched.description,
      image_url: imageUrl,
      image_fit: matched.image_fit,
      cta_text: matched.cta_text,
      cta_url: matched.cta_url,
    },
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Please sign in." }, 401);

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("user_id", user.id)
    .single();
  if (!profile?.business_id) return json({ error: "Business not found." }, 403);

  const body = await request.json().catch(() => null) as { adId?: string } | null;
  if (!body?.adId) return json({ error: "Ad ID is required." }, 400);

  const dismissedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const admin = getAdminClient();
  const { error } = await admin.from("ad_dismissals").upsert({
    ad_id: body.adId,
    user_id: user.id,
    business_id: profile.business_id,
    dismissed_until: dismissedUntil,
  }, { onConflict: "ad_id,user_id" });

  if (error) return json({ error: "Ad could not be dismissed." }, 500);
  return json({ dismissed_until: dismissedUntil });
}
