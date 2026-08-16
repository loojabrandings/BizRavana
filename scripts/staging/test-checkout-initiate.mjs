import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const stagingEnvPath = new URL("../../.env.staging.local", import.meta.url);
const expectedSupabaseUrl = "https://eggskxdtvohxedkfobkt.supabase.co";
const appUrl = "http://localhost:3001";

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
if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("The staging anon key is required.");
}

const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
const anon = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const health = await fetch(appUrl).catch(() => null);
if (!health?.ok) {
  throw new Error("Start the staging server first with: npm run staging:start");
}

const runId = Date.now().toString(36);
const email = `bizravana.qa.checkout.${runId}@example.com`;
const password = `${randomUUID()}Aa1!`;
const authCookieName = "sb-eggskxdtvohxedkfobkt-auth-token";
let userId;
let businessId;
let authCookie = "";
let passed = 0;

/** Serialize a Supabase session into the SSR auth cookie (base64- prefix,
    base64url body, chunked like @supabase/ssr does for large sessions). */
function sessionCookie(session) {
  const encoded = `base64-${Buffer.from(JSON.stringify(session), "utf8").toString("base64url")}`;
  const chunks = [];
  for (let offset = 0; offset < encoded.length; offset += 3180) {
    chunks.push(encoded.slice(offset, offset + 3180));
  }
  return chunks.length === 1
    ? `${authCookieName}=${chunks[0]}`
    : chunks.map((value, index) => `${authCookieName}.${index}=${value}`).join("; ");
}

function pass(message) {
  passed += 1;
  console.log(`PASS ${passed}: ${message}`);
}

const customer = {
  firstName: "QA",
  lastName: "Checkout",
  email,
  phone: "0771234567",
  address: "Staging only",
  city: "Colombo",
  country: "Sri Lanka",
};

async function initiate(planId, billingPeriod) {
  const response = await fetch(`${appUrl}/api/payments/payhere/initiate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // The server proxy rejects cross-origin mutations unless the Origin
      // matches the app URL (same rule a real browser checkout obeys).
      Origin: appUrl,
      // sessionCookie() already includes the cookie name; passing it
      // verbatim avoids a double name=name= prefix.
      Cookie: authCookie,
    },
    body: JSON.stringify({ planId, billingPeriod, customer }),
  });
  const body = await response.json();
  return { status: response.status, body };
}

try {
  const { data: plan, error: planError } = await admin
    .from("subscription_plans")
    .select("id, name, monthly_price, yearly_price")
    .eq("is_active", true)
    .gt("monthly_price", 0)
    .order("sort_order")
    .limit(1)
    .single();
  if (planError) throw planError;

  const { data: user, error: userError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "QA Checkout User" },
  });
  if (userError || !user.user) throw userError ?? new Error("Could not create QA user.");
  userId = user.user.id;

  const { data: business, error: businessError } = await admin
    .from("businesses")
    .insert({
      owner_id: userId,
      name: `QA Checkout Business ${runId}`,
      type: "staging_test",
      account_status: "trial",
    })
    .select("id")
    .single();
  if (businessError || !business) throw businessError ?? new Error("Could not create QA business.");
  businessId = business.id;

  const { error: profileError } = await admin.from("profiles").insert({
    user_id: userId,
    business_id: businessId,
    full_name: "QA Checkout User",
    role: "owner",
  });
  if (profileError) throw profileError;

  const { data: signInData, error: signInError } =
    await anon.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;
  const session = signInData.session;
  if (!session) throw new Error("No session after sign-in.");
  authCookie = sessionCookie(session);

  // ── Yearly checkout ────────────────────────────────────────────────
  const yearly = await initiate(plan.id, "yearly");
  assert(yearly.status === 201, `Yearly initiate should succeed, got ${yearly.status}: ${JSON.stringify(yearly.body)}`);
  assert(
    yearly.body.payment?.items === `${plan.name} Plan - 1 Year`,
    `Yearly item should be "${plan.name} Plan - 1 Year", got "${yearly.body.payment?.items}".`,
  );
  assert(
    yearly.body.payment?.amount === Number(plan.yearly_price).toFixed(2),
    `Yearly amount should be ${Number(plan.yearly_price).toFixed(2)}, got ${yearly.body.payment?.amount}.`,
  );
  assert(
    yearly.body.payment?.billing_period === "yearly",
    "Yearly response should carry billing_period=yearly.",
  );
  pass("yearly checkout charges the yearly price with a 1 Year item");

  // ── Monthly checkout (unchanged behaviour) ─────────────────────────
  const monthly = await initiate(plan.id, "monthly");
  assert(monthly.status === 201, `Monthly initiate should succeed, got ${monthly.status}.`);
  assert(
    monthly.body.payment?.items === `${plan.name} Plan - 30 Days`,
    `Monthly item should be "${plan.name} Plan - 30 Days", got "${monthly.body.payment?.items}".`,
  );
  assert(
    monthly.body.payment?.amount === Number(plan.monthly_price).toFixed(2),
    `Monthly amount should be ${Number(plan.monthly_price).toFixed(2)}, got ${monthly.body.payment?.amount}.`,
  );
  assert(
    monthly.body.payment?.billing_period === "monthly",
    "Monthly response should carry billing_period=monthly.",
  );
  pass("monthly checkout charges the monthly price with a 30 Days item");

  // ── Unknown billing period defaults to monthly ─────────────────────
  const unknown = await initiate(plan.id, "quarterly");
  assert(unknown.status === 201, "Unknown billing period should fall back to monthly.");
  assert(
    unknown.body.payment?.billing_period === "monthly" &&
      unknown.body.payment?.amount === Number(plan.monthly_price).toFixed(2),
    "Unknown billing period should behave exactly like monthly.",
  );
  pass("unknown billing period defaults to the monthly checkout");

  // ── Stored rows carry the period ───────────────────────────────────
  const { data: stored, error: storedError } = await admin
    .from("payhere_payments")
    .select("order_id, amount, item_name, billing_period")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(3);
  if (storedError) throw storedError;
  const storedYearly = stored.find((row) => row.billing_period === "yearly");
  const storedMonthly = stored.find((row) => row.billing_period === "monthly");
  assert(
    storedYearly && Number(storedYearly.amount).toFixed(2) === Number(plan.yearly_price).toFixed(2),
    "Stored yearly payment row should record the yearly amount and period.",
  );
  assert(
    storedMonthly && Number(storedMonthly.amount).toFixed(2) === Number(plan.monthly_price).toFixed(2),
    "Stored monthly payment row should record the monthly amount and period.",
  );
  pass("payhere_payments rows store the correct amount and billing period");

  console.log(`Checkout initiate matrix passed ${passed} checks.`);
} finally {
  if (businessId) {
    await admin.from("businesses").delete().eq("id", businessId);
  }
  if (userId) {
    await admin.auth.admin.deleteUser(userId);
  }
  console.log("Disposable checkout fixtures cleaned up.");
}
