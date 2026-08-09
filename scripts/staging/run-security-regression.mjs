import { spawnSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const projectDirectory = fileURLToPath(new URL("../../", import.meta.url));
const stagingEnvUrl = new URL("../../.env.staging.local", import.meta.url);
const fixtureEnvUrl = new URL("../../.env.staging.test.local", import.meta.url);
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

function run(script) {
  console.log(`\n=== ${script} ===`);
  const result = spawnSync(process.execPath, [`scripts/staging/${script}`], {
    cwd: projectDirectory,
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${script} failed with exit code ${result.status}.`);
}

const env = parseEnv(await readFile(stagingEnvUrl, "utf8"));
if (env.NEXT_PUBLIC_SUPABASE_URL !== expectedSupabaseUrl) {
  throw new Error("Refusing to run outside BizRavana Staging.");
}
if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("The staging service-role key is required.");
}

const health = await fetch(appUrl).catch(() => null);
if (!health?.ok) {
  throw new Error("Start the staging server first with: npm run staging:start");
}

try {
  await access(fixtureEnvUrl);
  throw new Error(
    "A staging fixture manifest already exists. Run cleanup-test-fixtures.mjs before retrying.",
  );
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

let fixturesCreated = false;
let primaryError = null;
try {
  run("create-test-fixtures.mjs");
  fixturesCreated = true;
  for (const script of [
    "test-invitation-security.mjs",
    "test-broadcast-concurrency.mjs",
    "test-admin-api-authorization.mjs",
    "test-auto-notification-worker.mjs",
    "test-message-template-isolation.mjs",
    "test-payhere-callback-security.mjs",
    "test-distributed-rate-limits.mjs",
    "test-upload-and-origin-security.mjs",
  ]) {
    run(script);
  }
} catch (error) {
  primaryError = error;
} finally {
  if (fixturesCreated) {
    try {
      run("cleanup-test-fixtures.mjs");
    } catch (cleanupError) {
      if (!primaryError) primaryError = cleanupError;
      else console.error("Fixture cleanup also failed:", cleanupError);
    }
  }
}

if (primaryError) throw primaryError;
console.log("\nFull BizRavana staging security regression suite passed.");
