import type { User } from "@supabase/supabase-js";
import type { createClient } from "./client";

type BrowserClient = ReturnType<typeof createClient>;

/**
 * Check for and accept any pending team invitations for this user's email.
 * Returns the business_id if an invitation was accepted, or null.
 */
async function acceptPendingInvitations(
  supabase: BrowserClient,
  user: User,
): Promise<string | null> {
  const email = user.email?.toLowerCase().trim();
  if (!email) return null;

  try {
    // Use the SECURITY DEFINER RPC to bypass RLS — a non-member user
    // cannot query team_invitations directly (RLS requires owner/admin role).
    const { data: invitations, error } = await supabase.rpc(
      "get_pending_invitations",
      { target_email: email },
    );

    if (error || !invitations || invitations.length === 0) return null;

    const invitation = invitations[0];

    // Call the accept_invitation RPC via the API to bypass RLS
    const response = await fetch("/api/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: invitation.token }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Failed to accept invitation:", err.error);
      return null;
    }

    const { data } = await response.json();
    return data?.business_id || null;
  } catch (err) {
    console.error("Error checking invitations:", err);
    return null;
  }
}

export async function provisionUser(
  supabase: BrowserClient,
  user: User,
): Promise<string | null> {
  const { data: existingProfile, error: profileLookupError } = await supabase
    .from("profiles")
    .select("business_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileLookupError) return profileLookupError.message;
  
  // If user already has a business, check for pending invitations
  // (they might have been invited to another business after sign-up)
  if (existingProfile?.business_id) {
    // Still check for pending invitations — they might accept another one later
    // For now, skip since the user is already provisioned
    return null;
  }

  // ── Check for pending team invitations first ──
  const invitedBusinessId = await acceptPendingInvitations(supabase, user);
  if (invitedBusinessId) {
    // Invitation accepted — profile was created by the RPC
    return null;
  }

  // ── No invitation — proceed with normal provision (new business) ──
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

