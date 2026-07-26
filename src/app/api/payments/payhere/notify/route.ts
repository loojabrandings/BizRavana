import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  createPayHereNotificationSignature,
  getPayHereConfig,
  signaturesMatch,
} from "@/lib/payhere";
import type { Json } from "@/types/database";

export const runtime = "nodejs";

type PayHereNonSuccessStatus =
  | "pending"
  | "canceled"
  | "failed"
  | "chargedback";

const STATUS_MAP: Record<number, PayHereNonSuccessStatus> = {
  0: "pending",
  [-1]: "canceled",
  [-2]: "failed",
  [-3]: "chargedback",
};

function textResponse(message: string, status: number) {
  return new NextResponse(message, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function safePayload(values: {
  merchantId: string;
  orderId: string;
  payherePaymentId: string;
  amount: string;
  currency: string;
  statusCode: string;
  statusMessage: string;
  method: string;
  cardHolderName: string;
  cardNo: string;
  cardExpiry: string;
  custom1: string;
  custom2: string;
}): Json {
  return {
    merchant_id: values.merchantId,
    order_id: values.orderId,
    payment_id: values.payherePaymentId,
    payhere_amount: values.amount,
    payhere_currency: values.currency,
    status_code: values.statusCode,
    status_message: values.statusMessage,
    method: values.method,
    card_holder_name: values.cardHolderName,
    card_no: values.cardNo,
    card_expiry: values.cardExpiry,
    custom_1: values.custom1,
    custom_2: values.custom2,
  };
}

export async function POST(request: Request) {
  let config;
  try {
    config = getPayHereConfig();
  } catch (error) {
    console.error("PayHere configuration error:", error);
    return textResponse("Configuration error", 503);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return textResponse("Invalid notification", 400);
  }

  const values = {
    merchantId: formValue(formData, "merchant_id"),
    orderId: formValue(formData, "order_id"),
    payherePaymentId: formValue(formData, "payment_id"),
    amount: formValue(formData, "payhere_amount"),
    currency: formValue(formData, "payhere_currency"),
    statusCode: formValue(formData, "status_code"),
    statusMessage: formValue(formData, "status_message"),
    method: formValue(formData, "method"),
    cardHolderName: formValue(formData, "card_holder_name"),
    cardNo: formValue(formData, "card_no"),
    cardExpiry: formValue(formData, "card_expiry"),
    custom1: formValue(formData, "custom_1"),
    custom2: formValue(formData, "custom_2"),
  };
  const receivedSignature = formValue(formData, "md5sig");

  if (
    !values.merchantId ||
    !values.orderId ||
    !values.amount ||
    !values.currency ||
    !values.statusCode ||
    !receivedSignature
  ) {
    return textResponse("Missing notification fields", 400);
  }

  const admin = getAdminClient();
  const { data: payment, error: paymentError } = await admin
    .from("payhere_payments")
    .select(
      "id, business_id, plan_id, merchant_id, amount, currency, status, activated_at",
    )
    .eq("order_id", values.orderId)
    .maybeSingle();

  if (paymentError) {
    console.error("Could not load PayHere payment:", paymentError);
    return textResponse("Temporary error", 500);
  }
  if (!payment) return textResponse("Unknown order", 404);

  const expectedSignature = createPayHereNotificationSignature({
    merchantId: values.merchantId,
    merchantSecret: config.merchantSecret,
    orderId: values.orderId,
    amount: values.amount,
    currency: values.currency,
    statusCode: values.statusCode,
  });
  const callbackAmount = Number(values.amount);
  const expectedAmount = Number(payment.amount);
  const merchantMatches =
    values.merchantId === config.merchantId &&
    values.merchantId === payment.merchant_id;
  const amountMatches =
    Number.isFinite(callbackAmount) &&
    callbackAmount.toFixed(2) === expectedAmount.toFixed(2);
  const currencyMatches =
    values.currency === payment.currency && values.currency === "LKR";
  const signatureMatches = signaturesMatch(
    receivedSignature,
    expectedSignature,
  );

  if (
    !merchantMatches ||
    !amountMatches ||
    !currencyMatches ||
    !signatureMatches
  ) {
    const rejectionDetails: Json = {
      payment_id: payment.id,
      order_id: values.orderId,
      business_id: payment.business_id,
      merchant_matches: merchantMatches,
      amount_matches: amountMatches,
      currency_matches: currencyMatches,
      signature_matches: signatureMatches,
      received_amount: values.amount,
      received_currency: values.currency,
    };

    const { error: logError } = await admin
      .from("admin_activity_log")
      .insert({
        admin_id: null,
        action: "payhere_notification_rejected",
        target_type: "payhere_payment",
        target_id: payment.id,
        details: rejectionDetails,
      });

    if (logError) {
      console.error("Could not record rejected PayHere notification:", logError);
    }

    if (!payment.activated_at) {
      const { error: invalidUpdateError } = await admin
        .from("payhere_payments")
        .update({
          status: "invalid",
          status_message: "Rejected callback validation",
          last_notified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      if (invalidUpdateError) {
        console.error(
          "Could not mark PayHere notification invalid:",
          invalidUpdateError,
        );
      }
    }

    return textResponse("Invalid notification", 400);
  }

  const statusCode = Number(values.statusCode);
  const notificationPayload = safePayload(values);

  if (statusCode === 2) {
    if (!values.payherePaymentId) {
      return textResponse("Missing payment ID", 400);
    }

    const { data, error } = await admin.rpc("complete_payhere_payment", {
      p_order_id: values.orderId,
      p_payhere_payment_id: values.payherePaymentId,
      p_status_message: values.statusMessage,
      p_payment_method: values.method,
      p_card_holder_name: values.cardHolderName,
      p_card_no: values.cardNo,
      p_card_expiry: values.cardExpiry,
      p_notification_payload: notificationPayload,
    });

    if (error) {
      console.error("PayHere subscription activation failed:", error);
      return textResponse("Temporary error", 500);
    }

    return textResponse(data ? "OK" : "Temporary error", data ? 200 : 500);
  }

  const mappedStatus = STATUS_MAP[statusCode];
  if (!mappedStatus) {
    return textResponse("Unsupported status", 400);
  }

  const shouldApplyStatus =
    !payment.activated_at || mappedStatus === "chargedback";
  const now = new Date().toISOString();

  if (shouldApplyStatus) {
    const { error: updateError } = await admin
      .from("payhere_payments")
      .update({
        status: mappedStatus,
        payhere_payment_id: values.payherePaymentId || null,
        payment_method: values.method || null,
        status_code: statusCode,
        status_message: values.statusMessage || null,
        card_holder_name: values.cardHolderName || null,
        card_no: values.cardNo || null,
        card_expiry: values.cardExpiry || null,
        signature_verified: true,
        notification_payload: notificationPayload,
        last_notified_at: now,
        updated_at: now,
      })
      .eq("id", payment.id);

    if (updateError) {
      console.error("Could not update PayHere payment status:", updateError);
      return textResponse("Temporary error", 500);
    }
  }

  const { error: activityError } = await admin
    .from("admin_activity_log")
    .insert({
      admin_id: null,
      action:
        mappedStatus === "chargedback"
          ? "payhere_payment_chargedback"
          : "payhere_payment_status_updated",
      target_type: "payhere_payment",
      target_id: payment.id,
      details: {
        payment_id: payment.id,
        order_id: values.orderId,
        business_id: payment.business_id,
        plan_id: payment.plan_id,
        status: mappedStatus,
        status_code: statusCode,
        status_message: values.statusMessage,
        status_applied: shouldApplyStatus,
      },
    });

  if (activityError) {
    console.error("Could not record PayHere status activity:", activityError);
  }

  return textResponse("OK", 200);
}
