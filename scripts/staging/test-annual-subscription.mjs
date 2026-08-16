import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const stagingEnvPath = new URL("../../.env.staging.local", import.meta.url);
const expectedSupabaseUrl = "https://eggskxdtvohxedkfobkt.supabase.co";

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

const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("The staging anon key is required to act as a super admin.");
}

const anon = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const runId = Date.now().toString(36);
const email = `bizravana.qa.annual.${runId}@example.com`;
let userId;
let businessId;
let superAdminId;
let passed = 0;

function pass(message) {
  passed += 1;
  console.log(`PASS ${passed}: ${message}`);
}

function daysBetween(a, b) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

async function activatePayHere(orderId, billingPeriod) {
  const { data, error } = await admin.rpc("complete_payhere_payment", {
    p_order_id: orderId,
    p_payhere_payment_id: `QA-ANNUAL-${orderId}-${randomUUID()}`,
    p_status_message: "Synthetic annual staging payment",
    p_payment_method: "VISA",
    p_card_holder_name: "QA USER",
    p_card_no: "************1292",
    p_card_expiry: "12/30",
    p_notification_payload: { synthetic: true },
    p_billing_period: billingPeriod,
  });
  if (error) throw error;
  return data;
}

try {
  const { data: plans, error: planError } = await admin
    .from("subscription_plans")
    .select("id, name, monthly_price, yearly_price")
    .eq("is_active", true)
    .gt("monthly_price", 0);
  if (planError) throw planError;
  const plan = plans?.find(
    (candidate) => !["trial", "enterprise"].includes(candidate.name.toLowerCase()),
  );
  assert(plan, "No paid staging subscription plan is available.");
  assert(
    plan.yearly_price > 0,
    `Plan ${plan.name} has no yearly price configured.`,
  );
  pass(
    `yearly price present on ${plan.name} (monthly ${plan.monthly_price}, yearly ${plan.yearly_price})`,
  );

  const { data: createdUser, error: userError } = await admin.auth.admin.createUser({
    email,
    password: `${randomUUID()}Aa1!`,
    email_confirm: true,
    user_metadata: { full_name: "QA Annual Subscription User" },
  });
  if (userError || !createdUser.user) throw userError ?? new Error("Could not create QA user.");
  userId = createdUser.user.id;

  const { data: business, error: businessError } = await admin
    .from("businesses")
    .insert({
      owner_id: userId,
      name: `QA Annual Business ${runId}`,
      type: "staging_test",
      account_status: "trial",
    })
    .select("id")
    .single();
  if (businessError || !business) throw businessError ?? new Error("Could not create QA business.");
  businessId = business.id;

  // Super admin for the bank-transfer review RPC (it enforces auth.uid()
  // through is_super_admin(), which a service-role JWT cannot satisfy).
  const superAdminPassword = `${randomUUID()}Aa1!`;
  const { data: superAdmin, error: superAdminError } =
    await admin.auth.admin.createUser({
      email: `bizravana.qa.superadmin.${runId}@example.com`,
      password: superAdminPassword,
      email_confirm: true,
      app_metadata: { is_super_admin: true },
      user_metadata: { full_name: "QA Annual Super Admin" },
    });
  if (superAdminError || !superAdmin.user) {
    throw superAdminError ?? new Error("Could not create QA super admin.");
  }
  superAdminId = superAdmin.user.id;
  const { error: signInError } = await anon.auth.signInWithPassword({
    email: `bizravana.qa.superadmin.${runId}@example.com`,
    password: superAdminPassword,
  });
  if (signInError) throw signInError;

  // ── 1. First payment: monthly → fresh 30-day term ──────────────────────
  const monthlyOrder = `BZR-ANNUAL-M-${runId.toUpperCase()}`;
  const monthlyAmount = Number(plan.monthly_price).toFixed(2);
  const { data: monthlyPayment, error: monthlyInsertError } = await admin
    .from("payhere_payments")
    .insert({
      business_id: businessId,
      user_id: userId,
      plan_id: plan.id,
      order_id: monthlyOrder,
      merchant_id: env.PAYHERE_MERCHANT_ID || "qa-merchant",
      item_name: `${plan.name} Plan - 30 Days`,
      amount: Number(monthlyAmount),
      currency: "LKR",
      customer_first_name: "QA",
      customer_last_name: "User",
      customer_email: email,
      customer_phone: "0771234567",
      customer_address: "Staging only",
      customer_city: "Colombo",
      customer_country: "Sri Lanka",
      billing_period: "monthly",
    })
    .select("id")
    .single();
  if (monthlyInsertError || !monthlyPayment) {
    throw monthlyInsertError ?? new Error("Could not create monthly payment.");
  }

  const monthlyActivation = await activatePayHere(monthlyOrder, "monthly");
  assert(monthlyActivation.activation_kind === "new_or_expired", "First monthly payment should start a fresh term.");
  const { data: monthlyBusiness } = await admin
    .from("businesses")
    .select("billing_period, subscription_started_at, subscription_ends_at")
    .eq("id", businessId)
    .single();
  assert(monthlyBusiness.billing_period === "monthly", "Business billing period should be monthly.");
  assert(
    daysBetween(monthlyBusiness.subscription_started_at, monthlyBusiness.subscription_ends_at) === 30,
    "Monthly term should be 30 days.",
  );
  pass("monthly payment activates a fresh 30-day term with billing_period=monthly");

  // ── 2. Switch monthly → yearly: fresh 1-year term ──────────────────────
  const yearlySwitchOrder = `BZR-ANNUAL-S-${runId.toUpperCase()}`;
  const yearlyAmount = Number(plan.yearly_price).toFixed(2);
  const { data: yearlySwitchPayment, error: yearlySwitchInsertError } = await admin
    .from("payhere_payments")
    .insert({
      business_id: businessId,
      user_id: userId,
      plan_id: plan.id,
      order_id: yearlySwitchOrder,
      merchant_id: env.PAYHERE_MERCHANT_ID || "qa-merchant",
      item_name: `${plan.name} Plan - 1 Year`,
      amount: Number(yearlyAmount),
      currency: "LKR",
      customer_first_name: "QA",
      customer_last_name: "User",
      customer_email: email,
      customer_phone: "0771234567",
      customer_address: "Staging only",
      customer_city: "Colombo",
      customer_country: "Sri Lanka",
      billing_period: "yearly",
    })
    .select("id")
    .single();
  if (yearlySwitchInsertError || !yearlySwitchPayment) {
    throw yearlySwitchInsertError ?? new Error("Could not create yearly switch payment.");
  }

  const yearlySwitchActivation = await activatePayHere(
    yearlySwitchOrder,
    "yearly",
  );
  assert(
    yearlySwitchActivation.activation_kind === "billing_period_change",
    "Switching monthly → yearly should start a fresh term (billing_period_change).",
  );
  const { data: switchedBusiness } = await admin
    .from("businesses")
    .select("billing_period, subscription_started_at, subscription_ends_at")
    .eq("id", businessId)
    .single();
  assert(switchedBusiness.billing_period === "yearly", "Business billing period should now be yearly.");
  assert(
    daysBetween(switchedBusiness.subscription_started_at, switchedBusiness.subscription_ends_at) >= 365,
    "Yearly term should be ~1 year, not stacked on the monthly remainder.",
  );
  pass("switching monthly → yearly starts a fresh 1-year term (no stacking)");

  // ── 3. Yearly renewal: stacks +1 year from the current end ─────────────
  const firstYearEnd = switchedBusiness.subscription_ends_at;
  const yearlyRenewalOrder = `BZR-ANNUAL-R-${runId.toUpperCase()}`;
  const { data: yearlyRenewalPayment, error: yearlyRenewalInsertError } = await admin
    .from("payhere_payments")
    .insert({
      business_id: businessId,
      user_id: userId,
      plan_id: plan.id,
      order_id: yearlyRenewalOrder,
      merchant_id: env.PAYHERE_MERCHANT_ID || "qa-merchant",
      item_name: `${plan.name} Plan - 1 Year`,
      amount: Number(yearlyAmount),
      currency: "LKR",
      customer_first_name: "QA",
      customer_last_name: "User",
      customer_email: email,
      customer_phone: "0771234567",
      customer_address: "Staging only",
      customer_city: "Colombo",
      customer_country: "Sri Lanka",
      billing_period: "yearly",
    })
    .select("id")
    .single();
  if (yearlyRenewalInsertError || !yearlyRenewalPayment) {
    throw yearlyRenewalInsertError ?? new Error("Could not create yearly renewal payment.");
  }

  const yearlyRenewalActivation = await activatePayHere(
    yearlyRenewalOrder,
    "yearly",
  );
  assert(
    yearlyRenewalActivation.activation_kind === "renewal",
    "Yearly renewal on an active yearly subscription should stack.",
  );
  const { data: renewedBusiness } = await admin
    .from("businesses")
    .select("billing_period, subscription_ends_at")
    .eq("id", businessId)
    .single();
  assert(
    daysBetween(firstYearEnd, renewedBusiness.subscription_ends_at) >= 365,
    "Yearly renewal should extend the end date by ~1 year.",
  );
  pass("yearly renewal extends an active yearly subscription by 1 year (stacking)");

  // ── 4. Bank transfer yearly: correct amount charged + 1-year term ──────
  const { data: bankPaymentId, error: bankPaymentError } = await admin.rpc(
    "create_bank_transfer_payment",
    {
      p_business_id: businessId,
      p_plan_id: plan.id,
      p_proof_image_path: `proofs/${businessId}/qa-annual-receipt.png`,
      p_notes: "QA annual bank transfer",
      p_submitted_by: userId,
      p_billing_period: "yearly",
    },
  );
  if (bankPaymentError || !bankPaymentId) {
    throw bankPaymentError ?? new Error("Could not create bank transfer payment.");
  }

  const { data: bankProof } = await admin
    .from("payment_proofs")
    .select("amount, billing_period, status")
    .eq("id", bankPaymentId)
    .single();
  assert(
    Number(bankProof.amount).toFixed(2) === yearlyAmount,
    `Bank-transfer amount should be the yearly price (${yearlyAmount}), got ${bankProof.amount}.`,
  );
  assert(bankProof.billing_period === "yearly", "Bank-transfer receipt should record billing_period=yearly.");
  pass("yearly bank-transfer receipt charges the yearly price and records the period");

  const { error: reviewError } = await anon.rpc("review_bank_transfer_payment", {
    p_payment_id: bankPaymentId,
    p_action: "approve",
    p_admin_note: "QA annual approval",
  });
  if (reviewError) throw reviewError;
  const { data: approvedBusiness } = await admin
    .from("businesses")
    .select("billing_period, subscription_ends_at")
    .eq("id", businessId)
    .single();
  assert(
    daysBetween(renewedBusiness.subscription_ends_at, approvedBusiness.subscription_ends_at) >= 365,
    "Approving a yearly bank transfer should extend by ~1 year.",
  );
  pass("approved yearly bank transfer stacks a 1-year term");

  console.log(`Annual subscription matrix passed ${passed} checks.`);
} finally {
  if (businessId) {
    await admin.from("businesses").delete().eq("id", businessId);
  }
  if (userId) {
    await admin.auth.admin.deleteUser(userId);
  }
  if (superAdminId) {
    await admin.auth.admin.deleteUser(superAdminId);
  }
  console.log("Disposable annual-subscription staging fixtures cleaned up.");
}
