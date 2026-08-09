import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

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

const stagingEnv = parseEnv(
  await readFile(new URL("../../.env.staging.local", import.meta.url), "utf8"),
);
const fixtures = parseEnv(
  await readFile(new URL("../../.env.staging.test.local", import.meta.url), "utf8"),
);

const expectedUrl = "https://eggskxdtvohxedkfobkt.supabase.co";
const expectedAppUrl = "http://localhost:3001";
if (
  stagingEnv.NEXT_PUBLIC_SUPABASE_URL !== expectedUrl ||
  stagingEnv.NEXT_PUBLIC_APP_URL !== expectedAppUrl
) {
  throw new Error("Refusing to test admin APIs outside BizRavana Staging.");
}

const memberClient = createClient(
  stagingEnv.NEXT_PUBLIC_SUPABASE_URL,
  stagingEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
const { data: signInData, error: signInError } =
  await memberClient.auth.signInWithPassword({
    email: fixtures.STAGING_MEMBER_EMAIL,
    password: fixtures.STAGING_MEMBER_PASSWORD,
  });
if (signInError) throw signInError;
if (!signInData.session) throw new Error("Member session was not created.");

const cookieName = "sb-eggskxdtvohxedkfobkt-auth-token";
const encodedSession =
  "base64-" +
  Buffer.from(JSON.stringify(signInData.session), "utf8").toString("base64url");
const cookieChunks = [];
for (let offset = 0; offset < encodedSession.length; offset += 3180) {
  cookieChunks.push(encodedSession.slice(offset, offset + 3180));
}
const cookieHeader =
  cookieChunks.length === 1
    ? `${cookieName}=${cookieChunks[0]}`
    : cookieChunks
        .map((value, index) => `${cookieName}.${index}=${value}`)
        .join("; ");

const fakeId = randomUUID();
const checks = [
  {
    name: "deliver broadcast",
    path: "/api/admin/deliver-broadcast",
    init: { method: "POST", body: JSON.stringify({ broadcastId: fakeId }) },
  },
  {
    name: "read user emails",
    path: "/api/admin/user-emails",
    init: {
      method: "POST",
      body: JSON.stringify({ userIds: [fixtures.STAGING_MEMBER_USER_ID] }),
    },
  },
  {
    name: "download payment receipt",
    path: `/api/admin/payments/${fakeId}/receipt`,
    init: { method: "GET" },
  },
  {
    name: "review payment",
    path: `/api/admin/payments/${fakeId}/review`,
    init: { method: "POST", body: JSON.stringify({ action: "approve" }) },
  },
  {
    name: "permanently delete business",
    path: `/api/admin/businesses/${fixtures.STAGING_FOREIGN_BUSINESS_ID}/permanent-delete`,
    init: { method: "DELETE" },
  },
];

for (const check of checks) {
  const response = await fetch(`${expectedAppUrl}${check.path}`, {
    ...check.init,
    headers: {
      Cookie: cookieHeader,
      "Content-Type": "application/json",
      Origin: expectedAppUrl,
    },
    redirect: "manual",
  });
  if (response.status !== 403) {
    throw new Error(
      `FAILED: ${check.name} returned ${response.status}, expected 403.`,
    );
  }
}

console.log(`Authenticated non-admin API checks passed: ${checks.length}`);
