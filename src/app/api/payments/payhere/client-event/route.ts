import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type CheckoutEvent = "dismissed" | "sdk_error";

function response(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return response({ error: "Please sign in to continue." }, 401);

  let body: {
    orderId?: string;
    event?: CheckoutEvent;
    message?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return response({ error: "Invalid checkout event." }, 400);
  }

  const orderId = String(body.orderId ?? "").trim();
  const event = body.event;
  const message = String(body.message ?? "").trim().slice(0, 500);

  if (!orderId || !event || !["dismissed", "sdk_error"].includes(event)) {
    return response({ error: "Invalid checkout event." }, 400);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile?.business_id) {
    return response({ error: "Your business account could not be found." }, 403);
  }

  const admin = getAdminClient();
  const status = event === "dismissed" ? "canceled" : "failed";
  const statusMessage =
    message ||
    (event === "dismissed"
      ? "Customer closed the PayHere checkout."
      : "PayHere SDK error.");
  const now = new Date().toISOString();

  // Only a checkout that has not received a gateway result can be changed by
  // a browser event. A verified PayHere callback always remains authoritative.
  const { data: updatedPayment, error: updateError } = await admin
    .from("payhere_payments")
    .update({
      status,
      status_message: statusMessage,
      updated_at: now,
    })
    .eq("order_id", orderId)
    .eq("business_id", profile.business_id)
    .eq("user_id", user.id)
    .eq("status", "created")
    .is("activated_at", null)
    .select("id, business_id, plan_id, status")
    .maybeSingle();

  if (updateError) {
    console.error("Could not record PayHere client event:", updateError);
    return response({ error: "Checkout status could not be updated." }, 500);
  }

  if (updatedPayment) {
    const { error: activityError } = await admin
      .from("admin_activity_log")
      .insert({
        admin_id: null,
        action:
          event === "dismissed"
            ? "payhere_checkout_dismissed"
            : "payhere_checkout_sdk_error",
        target_type: "payhere_payment",
        target_id: updatedPayment.id,
        details: {
          payment_id: updatedPayment.id,
          order_id: orderId,
          business_id: updatedPayment.business_id,
          plan_id: updatedPayment.plan_id,
          user_id: user.id,
          status: updatedPayment.status,
          message: statusMessage,
        },
      });

    if (activityError) {
      console.error("Could not record PayHere client activity:", activityError);
    }
  }

  return response({
    recorded: Boolean(updatedPayment),
    status: updatedPayment?.status ?? null,
  });
}
