import type { User } from "@supabase/supabase-js";
import type { createClient } from "./client";

type BrowserClient = ReturnType<typeof createClient>;

export async function provisionUser(
  supabase: BrowserClient,
  user: User,
): Promise<string | null> {
  const { data: existingProfile, error: profileLookupError } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileLookupError) return profileLookupError.message;
  if (existingProfile?.business_id) return null;

  const metadata = user.user_metadata;
  const businessName = String(metadata.business_name || "").trim();
  const fullName = String(metadata.full_name || "").trim();

  if (!businessName || !fullName) {
    return "The account is missing registration details.";
  }

  const { data: existingBusiness, error: businessLookupError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessLookupError) return businessLookupError.message;

  let businessId = existingBusiness?.id;

  if (!businessId) {
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .insert({
        owner_id: user.id,
        name: businessName,
        type: metadata.business_type || null,
        phone: metadata.business_phone || null,
        district: metadata.district || null,
        address: metadata.address || null,
        account_status: "trial",
        trial_started_at: new Date().toISOString(),
        trial_ends_at: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      })
      .select("id")
      .single();

    if (businessError) return businessError.message;
    businessId = business.id;
  }

  if (existingProfile) {
    const { error } = await supabase
      .from("profiles")
      .update({ business_id: businessId })
      .eq("user_id", user.id);
    return error?.message || null;
  }

  const { error } = await supabase.from("profiles").insert({
    user_id: user.id,
    business_id: businessId,
    full_name: fullName,
    phone: metadata.phone || null,
    role: "owner",
  });

  return error?.message || null;
}
