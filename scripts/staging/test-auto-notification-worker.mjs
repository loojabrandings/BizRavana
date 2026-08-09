import { readFile } from "node:fs/promises";
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

const expectedUrl = "https://eggskxdtvohxedkfobkt.supabase.co";
if (stagingEnv.NEXT_PUBLIC_SUPABASE_URL !== expectedUrl) {
  throw new Error("Refusing to test workers outside BizRavana Staging.");
}

const admin = createClient(
  stagingEnv.NEXT_PUBLIC_SUPABASE_URL,
  stagingEnv.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const { data, error } = await admin.rpc("process_auto_notifications");
if (error) throw error;

const validResult =
  data &&
  (typeof data.sent_count === "number" ||
    (data.skipped === true && typeof data.reason === "string"));
if (!validResult) {
  throw new Error("Automatic notification worker returned an invalid result.");
}

console.log("Automatic notification worker check passed.");
