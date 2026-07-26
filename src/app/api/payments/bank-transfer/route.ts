import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_RECEIPT_SIZE = 5 * 1024 * 1024;
const RECEIPT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return errorResponse("Please sign in to submit a payment.", 401);

  const formData = await request.formData();
  const planId = String(formData.get("planId") || "").trim();
  const notes = String(formData.get("notes") || "").trim().slice(0, 500);
  const receipt = formData.get("receipt");

  if (!planId) return errorResponse("Please select a subscription plan.", 400);
  if (!(receipt instanceof File)) {
    return errorResponse("Please attach your bank-transfer receipt.", 400);
  }

  const extension = RECEIPT_TYPES[receipt.type];
  if (!extension) {
    return errorResponse("Receipt must be a JPG, PNG, WEBP, or PDF file.", 400);
  }
  if (receipt.size <= 0 || receipt.size > MAX_RECEIPT_SIZE) {
    return errorResponse("Receipt must be smaller than 5 MB.", 400);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("business_id, role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile?.business_id) {
    return errorResponse("Your business account could not be found.", 403);
  }
  if (!["owner", "admin"].includes(profile.role)) {
    return errorResponse("Only a business owner or admin can submit payments.", 403);
  }

  const admin = getAdminClient();
  const [{ data: business }, { data: plan }] = await Promise.all([
    admin
      .from("businesses")
      .select("id, account_status, deleted_at")
      .eq("id", profile.business_id)
      .single(),
    admin
      .from("subscription_plans")
      .select("id, name, monthly_price, is_active")
      .eq("id", planId)
      .single(),
  ]);

  if (!business || business.deleted_at) {
    return errorResponse("Your business account is not available for checkout.", 403);
  }
  if (["suspended", "archived", "deleted"].includes(business.account_status)) {
    return errorResponse("This account is not eligible to submit a subscription payment.", 403);
  }
  if (
    !plan ||
    !plan.is_active ||
    plan.monthly_price <= 0 ||
    ["trial", "enterprise"].includes(plan.name.toLowerCase())
  ) {
    return errorResponse("This plan is not available for bank transfer.", 400);
  }

  const { data: pendingPayment } = await admin
    .from("payment_proofs")
    .select("id")
    .eq("business_id", business.id)
    .eq("status", "pending")
    .maybeSingle();

  if (pendingPayment) {
    return errorResponse("You already have a payment waiting for review.", 409);
  }

  const receiptPath = `proofs/${business.id}/${crypto.randomUUID()}.${extension}`;
  const receiptBytes = Buffer.from(await receipt.arrayBuffer());
  const { error: uploadError } = await admin.storage
    .from("payment-proofs")
    .upload(receiptPath, receiptBytes, {
      contentType: receipt.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return errorResponse("The receipt could not be uploaded. Please try again.", 500);
  }

  const { data: paymentId, error: paymentError } = await admin.rpc(
    "create_bank_transfer_payment",
    {
      p_business_id: business.id,
      p_plan_id: plan.id,
      p_proof_image_path: receiptPath,
      p_notes: notes,
      p_submitted_by: user.id,
    },
  );

  if (paymentError || !paymentId) {
    await admin.storage.from("payment-proofs").remove([receiptPath]);
    const duplicate = paymentError?.message.includes("already waiting for review");
    return errorResponse(
      duplicate
        ? "You already have a payment waiting for review."
        : "The payment could not be submitted. Please try again.",
      duplicate ? 409 : 500,
    );
  }

  return NextResponse.json(
    {
      payment: {
        id: paymentId,
        planName: plan.name,
        amount: plan.monthly_price,
        status: "pending",
      },
    },
    { status: 201 },
  );
}
