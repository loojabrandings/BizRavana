import { randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  createPayHereCheckoutHash,
  getPayHereConfig,
} from "@/lib/payhere";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

interface CustomerInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

interface InitiateRequest {
  planId?: string;
  customer?: CustomerInput;
}

const FIELD_LIMITS: Record<keyof Required<CustomerInput>, number> = {
  firstName: 100,
  lastName: 100,
  email: 254,
  phone: 30,
  address: 300,
  city: 100,
  country: 100,
};

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function normalizeCustomer(input: CustomerInput | undefined) {
  const customer = Object.fromEntries(
    (Object.keys(FIELD_LIMITS) as Array<keyof Required<CustomerInput>>).map(
      (field) => [
        field,
        String(input?.[field] ?? "")
          .trim()
          .slice(0, FIELD_LIMITS[field]),
      ],
    ),
  ) as Required<CustomerInput>;

  if (Object.values(customer).some((value) => !value)) {
    throw new Error("Please complete all customer details.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    throw new Error("Please enter a valid email address.");
  }

  const phoneDigits = customer.phone.replace(/\D/g, "");
  if (phoneDigits.length < 9 || phoneDigits.length > 15) {
    throw new Error("Please enter a valid phone number.");
  }

  return customer;
}

function createOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = randomBytes(5).toString("hex").toUpperCase();
  return `BZR-${timestamp}-${suffix}`;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return errorResponse("Please sign in to continue.", 401);

  let body: InitiateRequest;
  try {
    body = (await request.json()) as InitiateRequest;
  } catch {
    return errorResponse("Invalid payment request.", 400);
  }

  const planId = String(body.planId ?? "").trim();
  if (!planId) return errorResponse("Please select a subscription plan.", 400);

  let customer: Required<CustomerInput>;
  try {
    customer = normalizeCustomer(body.customer);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Invalid customer details.",
      400,
    );
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
    return errorResponse(
      "Only a business owner or Business Manager can make this payment.",
      403,
    );
  }

  let config;
  try {
    config = getPayHereConfig();
  } catch (error) {
    console.error("PayHere configuration error:", error);
    return errorResponse("Card payments are temporarily unavailable.", 503);
  }

  const admin = getAdminClient();
  const [{ data: business }, { data: plan }] = await Promise.all([
    admin
      .from("businesses")
      .select(
        "id, plan_id, account_status, subscription_started_at, subscription_ends_at, deleted_at",
      )
      .eq("id", profile.business_id)
      .single(),
    admin
      .from("subscription_plans")
      .select("id, name, monthly_price, is_active")
      .eq("id", planId)
      .single(),
  ]);

  if (!business || business.deleted_at) {
    return errorResponse(
      "Your business account is not available for checkout.",
      403,
    );
  }
  if (["suspended", "archived", "deleted"].includes(business.account_status)) {
    return errorResponse(
      "This account is not eligible for a subscription payment.",
      403,
    );
  }
  if (
    !plan ||
    !plan.is_active ||
    plan.monthly_price <= 0 ||
    ["trial", "enterprise"].includes(plan.name.toLowerCase())
  ) {
    return errorResponse("This plan is not available for card payment.", 400);
  }

  const paymentId = randomUUID();
  const orderId = createOrderId();
  const amount = Number(plan.monthly_price).toFixed(2);
  const currency = "LKR";
  const itemName = `${plan.name} Plan - 30 Days`;
  const returnUrl = `${config.appUrl}/dashboard/subscription/payment?payhere=return&order_id=${encodeURIComponent(orderId)}`;
  const cancelUrl = `${config.appUrl}/dashboard/subscription/payment?payhere=cancel&order_id=${encodeURIComponent(orderId)}`;
  const notifyUrl = `${config.appUrl}/api/payments/payhere/notify`;

  const { error: insertError } = await admin.from("payhere_payments").insert({
    id: paymentId,
    business_id: business.id,
    user_id: user.id,
    plan_id: plan.id,
    order_id: orderId,
    merchant_id: config.merchantId,
    item_name: itemName,
    amount: Number(amount),
    currency,
    customer_first_name: customer.firstName,
    customer_last_name: customer.lastName,
    customer_email: customer.email,
    customer_phone: customer.phone,
    customer_address: customer.address,
    customer_city: customer.city,
    customer_country: customer.country,
    previous_plan_id: business.plan_id,
    previous_account_status: business.account_status,
    previous_subscription_started_at: business.subscription_started_at,
    previous_subscription_ends_at: business.subscription_ends_at,
  });

  if (insertError) {
    console.error("Could not create PayHere payment:", insertError);
    return errorResponse(
      "The card payment could not be prepared. Please try again.",
      500,
    );
  }

  const { error: activityError } = await admin
    .from("admin_activity_log")
    .insert({
      admin_id: null,
      action: "payhere_payment_initiated",
      target_type: "payhere_payment",
      target_id: paymentId,
      details: {
        payment_id: paymentId,
        order_id: orderId,
        business_id: business.id,
        user_id: user.id,
        plan_id: plan.id,
        plan_name: plan.name,
        amount: Number(amount),
        currency,
        sandbox: config.sandbox,
      },
    });

  if (activityError) {
    console.error("Could not record PayHere initiation activity:", activityError);
  }

  const hash = createPayHereCheckoutHash({
    merchantId: config.merchantId,
    merchantSecret: config.merchantSecret,
    orderId,
    amount,
    currency,
  });

  return NextResponse.json(
    {
      payment: {
        sandbox: config.sandbox,
        merchant_id: config.merchantId,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        notify_url: notifyUrl,
        order_id: orderId,
        items: itemName,
        amount,
        currency,
        first_name: customer.firstName,
        last_name: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        country: customer.country,
        custom_1: paymentId,
        custom_2: business.id,
        hash,
      },
    },
    {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
