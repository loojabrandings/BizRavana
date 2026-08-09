import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const stagingEnvPath = new URL("../../.env.staging.local", import.meta.url);
const expectedSupabaseUrl = "https://eggskxdtvohxedkfobkt.supabase.co";
const expectedCallbackUrl = "http://localhost:3001/api/payments/payhere/notify";

function parseEnv(contents) {
  return Object.fromEntries(
    contents
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

function md5(value) {
  return createHash("md5").update(value, "utf8").digest("hex").toUpperCase();
}

function sha256(value) {
  return createHash("sha256")
    .update(value.trim().toLowerCase(), "utf8")
    .digest("hex");
}

function signature({ merchantId, merchantSecret, orderId, amount, currency, statusCode }) {
  return md5(
    `${merchantId}${orderId}${amount}${currency}${statusCode}${md5(merchantSecret)}`,
  );
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const env = parseEnv(await readFile(stagingEnvPath, "utf8"));

if (env.NEXT_PUBLIC_SUPABASE_URL !== expectedSupabaseUrl) {
  throw new Error("Refusing to test outside BizRavana Staging.");
}
if (!env.SUPABASE_SERVICE_ROLE_KEY?.startsWith("sb_secret_")) {
  throw new Error("A staging Supabase secret key is required.");
}
if (!env.PAYHERE_MERCHANT_ID || !env.PAYHERE_MERCHANT_SECRET) {
  throw new Error("Staging-only PayHere callback credentials are required.");
}
if (env.PAYHERE_SANDBOX?.toLowerCase() !== "true") {
  throw new Error("Refusing to run unless PayHere sandbox mode is enabled.");
}
if (env.APP_URL !== "http://localhost:3001") {
  throw new Error("Refusing to call a non-local PayHere callback URL.");
}

const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const runId = Date.now().toString(36);
const email = `bizravana.qa.payhere.${runId}@example.com`;
const orderId = `BZR-QA-${runId.toUpperCase()}`;
const payherePaymentId = `QA-PAYHERE-${runId.toUpperCase()}`;
const callbackClientAddress = `192.0.2.${Number.parseInt(runId.slice(-4), 36) % 200 + 1}`;
const amount = "100.00";
const currency = "LKR";
const statusCode = "2";
let userId;
let businessId;
let paymentId;
let passed = 0;

function pass(message) {
  passed += 1;
  console.log(`PASS ${passed}: ${message}`);
}

async function callback(overrides = {}) {
  const values = {
    merchant_id: env.PAYHERE_MERCHANT_ID,
    order_id: orderId,
    payment_id: payherePaymentId,
    payhere_amount: amount,
    payhere_currency: currency,
    status_code: statusCode,
    status_message: "Synthetic staging payment approved",
    method: "VISA",
    card_holder_name: "QA USER",
    card_no: "************1292",
    card_expiry: "12/30",
    custom_1: "staging-callback-security-test",
    custom_2: "disposable-fixture",
    ...overrides,
  };

  values.md5sig = overrides.md5sig ?? signature({
    merchantId: values.merchant_id,
    merchantSecret: env.PAYHERE_MERCHANT_SECRET,
    orderId: values.order_id,
    amount: values.payhere_amount,
    currency: values.payhere_currency,
    statusCode: values.status_code,
  });

  const response = await fetch(expectedCallbackUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Real-IP": callbackClientAddress,
    },
    body: new URLSearchParams(values),
  });

  return { status: response.status, body: await response.text() };
}

async function paymentState() {
  const { data, error } = await admin
    .from("payhere_payments")
    .select("status, signature_verified, activated_at, payhere_payment_id, updated_at")
    .eq("id", paymentId)
    .single();
  if (error) throw error;
  return data;
}

async function relatedCounts() {
  const [{ count: activityCount, error: activityError }, { count: notificationCount, error: notificationError }] =
    await Promise.all([
      admin
        .from("admin_activity_log")
        .select("id", { count: "exact", head: true })
        .eq("target_type", "payhere_payment")
        .eq("target_id", paymentId),
      admin
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .eq("type", "payment_approved"),
    ]);

  if (activityError) throw activityError;
  if (notificationError) throw notificationError;
  return { activityCount, notificationCount };
}

try {
  const health = await fetch("http://localhost:3001");
  assert(health.ok, "The staging server is not available on port 3001.");
  pass("staging server is reachable");

  const { data: plans, error: planError } = await admin
    .from("subscription_plans")
    .select("id, name")
    .eq("is_active", true)
    .gt("monthly_price", 0);
  if (planError) throw planError;
  const plan = plans?.find(
    (candidate) => !["trial", "enterprise"].includes(candidate.name.toLowerCase()),
  );
  assert(plan, "No paid staging subscription plan is available.");

  const { data: createdUser, error: userError } = await admin.auth.admin.createUser({
    email,
    password: `${randomUUID()}Aa1!`,
    email_confirm: true,
    user_metadata: { full_name: "QA PayHere Callback User" },
  });
  if (userError || !createdUser.user) throw userError ?? new Error("Could not create QA user.");
  userId = createdUser.user.id;

  const { data: business, error: businessError } = await admin
    .from("businesses")
    .insert({
      owner_id: userId,
      name: `QA PayHere Business ${runId}`,
      type: "staging_test",
      account_status: "trial",
    })
    .select("id")
    .single();
  if (businessError || !business) throw businessError ?? new Error("Could not create QA business.");
  businessId = business.id;

  const { data: payment, error: paymentError } = await admin
    .from("payhere_payments")
    .insert({
      business_id: businessId,
      user_id: userId,
      plan_id: plan.id,
      order_id: orderId,
      merchant_id: env.PAYHERE_MERCHANT_ID,
      item_name: `${plan.name} Plan - QA`,
      amount: Number(amount),
      currency,
      customer_first_name: "QA",
      customer_last_name: "User",
      customer_email: email,
      customer_phone: "0771234567",
      customer_address: "Staging only",
      customer_city: "Colombo",
      customer_country: "Sri Lanka",
      previous_account_status: "trial",
    })
    .select("id")
    .single();
  if (paymentError || !payment) throw paymentError ?? new Error("Could not create QA payment.");
  paymentId = payment.id;
  pass("disposable payment fixture created in staging");

  const initialState = await paymentState();
  const initialCounts = await relatedCounts();

  const invalidSignature = await callback({ md5sig: "0".repeat(32) });
  assert(invalidSignature.status === 400, "Invalid signature was not rejected.");
  assert(JSON.stringify(await paymentState()) === JSON.stringify(initialState), "Invalid signature mutated payment state.");
  assert(JSON.stringify(await relatedCounts()) === JSON.stringify(initialCounts), "Invalid signature created audit state.");
  pass("invalid signature rejected without mutation");

  const amountMismatch = await callback({ payhere_amount: "101.00" });
  assert(amountMismatch.status === 400, "Amount mismatch was not rejected.");
  assert(JSON.stringify(await paymentState()) === JSON.stringify(initialState), "Amount mismatch mutated payment state.");
  pass("signed amount mismatch rejected without mutation");

  const currencyMismatch = await callback({ payhere_currency: "USD" });
  assert(currencyMismatch.status === 400, "Currency mismatch was not rejected.");
  assert(JSON.stringify(await paymentState()) === JSON.stringify(initialState), "Currency mismatch mutated payment state.");
  pass("signed currency mismatch rejected without mutation");

  const merchantMismatch = await callback({ merchant_id: "wrong-staging-merchant" });
  assert(merchantMismatch.status === 400, "Merchant mismatch was not rejected.");
  assert(JSON.stringify(await paymentState()) === JSON.stringify(initialState), "Merchant mismatch mutated payment state.");
  pass("signed merchant mismatch rejected without mutation");

  const unknownOrder = await callback({ order_id: `${orderId}-UNKNOWN` });
  assert(unknownOrder.status === 404, "Unknown order was not rejected.");
  pass("unknown order rejected");

  const missingPaymentId = await callback({ payment_id: "" });
  assert(missingPaymentId.status === 400, "Successful callback without payment ID was not rejected.");
  assert(JSON.stringify(await paymentState()) === JSON.stringify(initialState), "Missing payment ID mutated payment state.");
  pass("successful callback without payment ID rejected without mutation");

  const concurrentResponses = await Promise.all(
    Array.from({ length: 5 }, () => callback()),
  );
  assert(
    concurrentResponses.every((response) => response.status === 200 && response.body === "OK"),
    "One or more concurrent valid callbacks failed.",
  );
  pass("five concurrent correctly signed callbacks accepted");

  const completedPayment = await paymentState();
  assert(completedPayment.status === "success", "Payment was not marked successful.");
  assert(completedPayment.signature_verified === true, "Signature verification was not recorded.");
  assert(completedPayment.payhere_payment_id === payherePaymentId, "PayHere payment ID was not stored.");
  assert(completedPayment.activated_at, "Payment activation timestamp was not recorded.");
  pass("verified payment stored as successful");

  const { data: activatedBusiness, error: activatedBusinessError } = await admin
    .from("businesses")
    .select("plan_id, account_status, subscription_started_at, subscription_ends_at")
    .eq("id", businessId)
    .single();
  if (activatedBusinessError) throw activatedBusinessError;
  assert(activatedBusiness.plan_id === plan.id, "Business plan was not activated.");
  assert(activatedBusiness.account_status === "active", "Business was not activated.");
  assert(activatedBusiness.subscription_started_at && activatedBusiness.subscription_ends_at, "Subscription dates were not set.");
  pass("subscription activated once for the expected plan");

  const completedCounts = await relatedCounts();
  assert(completedCounts.activityCount === 1, `Expected one activation audit row, found ${completedCounts.activityCount}.`);
  assert(completedCounts.notificationCount === 1, `Expected one payment notification, found ${completedCounts.notificationCount}.`);
  pass("concurrent callbacks created one audit row and one notification");

  const replay = await callback();
  assert(replay.status === 200 && replay.body === "OK", "Valid replay was not handled successfully.");
  const { data: replayedBusiness, error: replayedBusinessError } = await admin
    .from("businesses")
    .select("subscription_started_at, subscription_ends_at")
    .eq("id", businessId)
    .single();
  if (replayedBusinessError) throw replayedBusinessError;
  assert(
    replayedBusiness.subscription_started_at === activatedBusiness.subscription_started_at &&
      replayedBusiness.subscription_ends_at === activatedBusiness.subscription_ends_at,
    "Replay changed the subscription period.",
  );
  assert(JSON.stringify(await relatedCounts()) === JSON.stringify(completedCounts), "Replay created duplicate side effects.");
  pass("replay handled idempotently without extending the subscription");

  console.log(`PayHere callback security matrix passed ${passed} checks.`);
} finally {
  await admin
    .from("request_rate_limits")
    .delete()
    .eq("scope", "payhere-callback-ip")
    .in("key_hash", [sha256(callbackClientAddress), sha256("unknown")]);
  if (paymentId) {
    await admin
      .from("admin_activity_log")
      .delete()
      .eq("target_type", "payhere_payment")
      .eq("target_id", paymentId);
  }
  if (businessId) {
    await admin.from("businesses").delete().eq("id", businessId);
  }
  if (userId) {
    await admin.auth.admin.deleteUser(userId);
  }
  console.log("Disposable PayHere staging fixtures cleaned up.");
}
