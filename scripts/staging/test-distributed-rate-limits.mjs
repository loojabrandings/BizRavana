import { createHash, randomUUID } from "node:crypto";
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

function hash(value) {
  return createHash("sha256")
    .update(value.trim().toLowerCase(), "utf8")
    .digest("hex");
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
const anonymous = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const runId = Date.now().toString(36);
const atomicScope = `qa-atomic-${runId}`;
const atomicKey = hash(`atomic-key-${runId}`);
const secondKey = hash(`second-key-${runId}`);
const secondScope = `qa-independent-${runId}`;
const loginEmail = `qa.rate.limit.${runId}@example.com`;
const loginIp = `198.51.100.${Number.parseInt(runId.slice(-2), 36) % 200 + 1}`;
const nativeEmail = `qa.native.limit.${runId}@example.com`;
const nativeIp = `203.0.113.${Number.parseInt(runId.slice(-3), 36) % 200 + 1}`;
const callbackIp = `192.0.2.${Number.parseInt(runId.slice(-4), 36) % 200 + 1}`;
const validLoginEmail = `qa.valid.login.${runId}@example.com`;
const validLoginPassword = `${randomUUID()}Aa1!`;
const validLoginIp = `198.18.0.${Number.parseInt(runId.slice(-5), 36) % 200 + 1}`;
const cleanupTargets = [
  { scope: atomicScope, key: atomicKey },
  { scope: atomicScope, key: secondKey },
  { scope: secondScope, key: atomicKey },
  { scope: "login-ip", key: hash(loginIp) },
  { scope: "login-account", key: hash(loginEmail) },
  { scope: "login-ip", key: hash(nativeIp) },
  { scope: "login-account", key: hash(nativeEmail) },
  { scope: "payhere-callback-ip", key: hash(callbackIp) },
  { scope: "login-ip", key: hash(validLoginIp) },
  { scope: "login-account", key: hash(validLoginEmail) },
];
let passed = 0;
let validLoginUserId;

function pass(message) {
  passed += 1;
  console.log(`PASS ${passed}: ${message}`);
}

async function consume(scope, keyHash, limit = 5, windowSeconds = 60) {
  const { data, error } = await admin.rpc("consume_request_rate_limit", {
    p_scope: scope,
    p_key_hash: keyHash,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error || !data?.[0]) throw error ?? new Error("No limiter result returned.");
  return data[0];
}

async function cleanup() {
  const failures = [];
  for (const target of cleanupTargets) {
    const { error } = await admin
      .from("request_rate_limits")
      .delete()
      .eq("scope", target.scope)
      .eq("key_hash", target.key);
    if (error) failures.push(error.message);
  }
  if (failures.length) {
    throw new Error(`Could not clean rate-limit fixtures: ${failures.join("; ")}`);
  }
}

try {
  const health = await fetch(appUrl);
  assert(health.ok, "The staging server is not available on port 3001.");
  pass("staging server is reachable");

  const concurrent = await Promise.all(
    Array.from({ length: 12 }, () => consume(atomicScope, atomicKey)),
  );
  assert(
    concurrent.filter((result) => result.allowed).length === 5,
    "Concurrent requests did not enforce the exact shared limit.",
  );
  assert(
    concurrent.filter((result) => !result.allowed).length === 7,
    "Concurrent overflow count was incorrect.",
  );
  pass("atomic shared limit allowed exactly five of twelve concurrent requests");

  const blocked = await consume(atomicScope, atomicKey);
  assert(!blocked.allowed && blocked.remaining === 0, "Exhausted key was not blocked.");
  assert(
    blocked.retry_after_seconds >= 1 && blocked.retry_after_seconds <= 60,
    "Blocked result returned an invalid retry interval.",
  );
  pass("blocked result exposes a bounded retry interval");

  const independentKey = await consume(atomicScope, secondKey);
  assert(independentKey.allowed, "Independent key was incorrectly blocked.");
  const independentScope = await consume(secondScope, atomicKey);
  assert(independentScope.allowed, "Independent scope was incorrectly blocked.");
  pass("keys and scopes remain isolated");

  const { error: anonymousRpcError } = await anonymous.rpc(
    "consume_request_rate_limit",
    {
      p_scope: atomicScope,
      p_key_hash: hash("anonymous-attempt"),
      p_limit: 5,
      p_window_seconds: 60,
    },
  );
  assert(anonymousRpcError, "Anonymous user executed the limiter RPC.");
  const { error: anonymousTableError } = await anonymous
    .from("request_rate_limits")
    .select("scope")
    .limit(1);
  assert(anonymousTableError, "Anonymous user read persisted limiter state.");
  pass("anonymous RPC execution and table reads are denied");

  const { data: validLoginUser, error: validLoginUserError } =
    await admin.auth.admin.createUser({
      email: validLoginEmail,
      password: validLoginPassword,
      email_confirm: true,
      user_metadata: { full_name: "QA Valid Login User" },
    });
  if (validLoginUserError || !validLoginUser.user) {
    throw validLoginUserError ?? new Error("Could not create valid login user.");
  }
  validLoginUserId = validLoginUser.user.id;

  const validLoginResponse = await fetch(`${appUrl}/api/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Real-IP": validLoginIp,
      Origin: appUrl,
    },
    body: JSON.stringify({
      email: validLoginEmail,
      password: validLoginPassword,
      redirect: "/dashboard/orders",
    }),
  });
  const validLoginBody = await validLoginResponse.json();
  assert(validLoginResponse.status === 200, "Valid JSON login was not accepted.");
  assert(
    validLoginBody.redirectTo === "/dashboard/orders",
    "Valid JSON login did not preserve its authorized redirect.",
  );
  assert(
    validLoginResponse.headers.get("set-cookie")?.includes("sb-"),
    "Valid JSON login did not set a Supabase session cookie.",
  );
  pass("valid JSON login returns an authorized redirect and session cookies");

  const loginResponses = [];
  for (let attempt = 0; attempt < 11; attempt += 1) {
    const response = await fetch(`${appUrl}/api/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Real-IP": loginIp,
        Origin: appUrl,
      },
      body: JSON.stringify({
        email: loginEmail,
        password: "Definitely-not-a-real-password",
      }),
    });
    loginResponses.push({
      status: response.status,
      retryAfter: response.headers.get("retry-after"),
      body: await response.json(),
    });
  }
  assert(
    loginResponses.slice(0, 10).every((response) => response.status === 401),
    "Login requests were blocked before the configured account threshold.",
  );
  const limitedLogin = loginResponses[10];
  assert(
    limitedLogin.status === 429 && limitedLogin.body.code === "rate_limited",
    "The eleventh login request did not return the expected 429 response.",
  );
  assert(Number(limitedLogin.retryAfter) > 0, "Login 429 omitted Retry-After.");
  pass("JSON login endpoint returns 429 after ten account attempts");

  const nativeBody = new URLSearchParams({
    email: nativeEmail,
    password: "Definitely-not-a-real-password",
    redirect: "/dashboard/orders",
  });
  const nativeResponse = await fetch(`${appUrl}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Real-IP": nativeIp,
      Origin: appUrl,
    },
    body: nativeBody,
    redirect: "manual",
  });
  assert(nativeResponse.status === 303, "Native login did not use a 303 redirect.");
  assert(
    nativeResponse.headers.get("location")?.includes("error=invalid_credentials"),
    "Native login did not return its stable error code.",
  );
  pass("native-form login fallback remains functional and uses 303");

  const oversizedResponse = await fetch(`${appUrl}/api/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Origin: appUrl,
    },
    body: JSON.stringify({
      email: loginEmail,
      password: "x",
      padding: "x".repeat(17 * 1024),
    }),
  });
  assert(oversizedResponse.status === 413, "Oversized login request was not rejected.");
  pass("oversized login request is rejected before parsing");

  const { error: seedError } = await admin.from("request_rate_limits").upsert({
    scope: "payhere-callback-ip",
    key_hash: hash(callbackIp),
    window_started_at: new Date().toISOString(),
    request_count: 120,
    updated_at: new Date().toISOString(),
  });
  if (seedError) throw seedError;

  const callbackResponse = await fetch(
    `${appUrl}/api/payments/payhere/notify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Real-IP": callbackIp,
      },
      body: new URLSearchParams({ invalid: "payload" }),
    },
  );
  assert(callbackResponse.status === 429, "PayHere callback limit did not return 429.");
  assert(
    Number(callbackResponse.headers.get("retry-after")) > 0,
    "PayHere callback 429 omitted Retry-After.",
  );
  pass("PayHere callback limiter rejects overflow before payload processing");

  console.log(`Distributed rate-limit matrix passed ${passed} checks.`);
} finally {
  const cleanupFailures = [];
  await cleanup().catch((error) => cleanupFailures.push(error));
  if (validLoginUserId) {
    const { error } = await admin.auth.admin.deleteUser(validLoginUserId);
    if (error) cleanupFailures.push(error);
  }
  if (cleanupFailures.length) {
    throw new AggregateError(cleanupFailures, "Staging fixture cleanup failed.");
  }
  console.log("Disposable rate-limit counters and Auth user cleaned up.");
}
