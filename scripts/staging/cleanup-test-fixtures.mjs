import { readFile, unlink } from "node:fs/promises";
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

const stagingPath = new URL("../../.env.staging.local", import.meta.url);
const fixturePath = new URL("../../.env.staging.test.local", import.meta.url);
const stagingEnv = parseEnv(await readFile(stagingPath, "utf8"));
const fixtures = parseEnv(await readFile(fixturePath, "utf8"));

const expectedUrl = "https://eggskxdtvohxedkfobkt.supabase.co";
if (stagingEnv.NEXT_PUBLIC_SUPABASE_URL !== expectedUrl) {
  throw new Error("Refusing to clean fixtures outside BizRavana Staging.");
}

const admin = createClient(
  stagingEnv.NEXT_PUBLIC_SUPABASE_URL,
  stagingEnv.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const businessIds = [
  fixtures.STAGING_PRIMARY_BUSINESS_ID,
  fixtures.STAGING_FOREIGN_BUSINESS_ID,
];
const userIds = [
  "SUPERADMIN",
  "OWNER",
  "MANAGER",
  "MEMBER",
  "INVITEE",
  "FOREIGN_OWNER",
].map((key) => fixtures[`STAGING_${key}_USER_ID`]);

if ([...businessIds, ...userIds].some((id) => !id)) {
  throw new Error("Fixture manifest is incomplete; refusing partial cleanup.");
}

const { error: businessError } = await admin
  .from("businesses")
  .delete()
  .in("id", businessIds);
if (businessError) throw businessError;

for (const userId of userIds) {
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw error;
}

const { count: remainingBusinesses, error: verificationError } = await admin
  .from("businesses")
  .select("id", { count: "exact", head: true })
  .in("id", businessIds);
if (verificationError) throw verificationError;
if (remainingBusinesses !== 0) {
  throw new Error("Fixture business cleanup verification failed.");
}

await unlink(fixturePath);
console.log("Removed disposable staging fixtures and local test credentials.");
