import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function response(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("orderId")?.trim();
  if (!orderId) return response({ error: "Order ID is required." }, 400);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return response({ error: "Please sign in to continue." }, 401);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile?.business_id) {
    return response({ error: "Your business account could not be found." }, 403);
  }

  const { data: payment, error: paymentError } = await supabase
    .from("payhere_payments")
    .select(
      "order_id, status, status_message, activated_at, paid_at, updated_at",
    )
    .eq("order_id", orderId)
    .eq("business_id", profile.business_id)
    .maybeSingle();

  if (paymentError) {
    console.error("Could not load PayHere payment status:", paymentError);
    return response({ error: "Payment status could not be checked." }, 500);
  }
  if (!payment) return response({ error: "Payment was not found." }, 404);

  return response({
    payment: {
      orderId: payment.order_id,
      status: payment.status,
      statusMessage: payment.status_message,
      activated: Boolean(payment.activated_at),
      paidAt: payment.paid_at,
      updatedAt: payment.updated_at,
    },
  });
}
