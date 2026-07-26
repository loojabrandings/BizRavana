import { createHash, timingSafeEqual } from "node:crypto";

export interface PayHereConfig {
  merchantId: string;
  merchantSecret: string;
  sandbox: boolean;
  appUrl: string;
}

function md5(value: string) {
  return createHash("md5").update(value, "utf8").digest("hex").toUpperCase();
}

export function getPayHereConfig(): PayHereConfig {
  const merchantId = process.env.PAYHERE_MERCHANT_ID?.trim();
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET?.trim();
  const appUrlValue = process.env.APP_URL?.trim();

  if (!merchantId || !merchantSecret || !appUrlValue) {
    throw new Error("Missing PayHere server configuration.");
  }

  let appUrl: URL;
  try {
    appUrl = new URL(appUrlValue);
  } catch {
    throw new Error("APP_URL must be a valid absolute URL.");
  }

  return {
    merchantId,
    merchantSecret,
    sandbox: process.env.PAYHERE_SANDBOX?.trim().toLowerCase() !== "false",
    appUrl: appUrl.origin,
  };
}

export function createPayHereCheckoutHash({
  merchantId,
  merchantSecret,
  orderId,
  amount,
  currency,
}: {
  merchantId: string;
  merchantSecret: string;
  orderId: string;
  amount: string;
  currency: string;
}) {
  return md5(
    `${merchantId}${orderId}${amount}${currency}${md5(merchantSecret)}`,
  );
}

export function createPayHereNotificationSignature({
  merchantId,
  merchantSecret,
  orderId,
  amount,
  currency,
  statusCode,
}: {
  merchantId: string;
  merchantSecret: string;
  orderId: string;
  amount: string;
  currency: string;
  statusCode: string;
}) {
  return md5(
    `${merchantId}${orderId}${amount}${currency}${statusCode}${md5(merchantSecret)}`,
  );
}

export function signaturesMatch(received: string, expected: string) {
  const receivedBuffer = Buffer.from(received.trim().toUpperCase(), "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}
