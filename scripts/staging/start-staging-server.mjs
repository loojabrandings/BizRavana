import { spawn } from "node:child_process";
import { openSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const projectDirectory = fileURLToPath(new URL("../../", import.meta.url));
const envPath = new URL("../../.env.staging.local", import.meta.url);

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

const stagingEnv = parseEnv(readFileSync(envPath, "utf8"));
const expectedUrl = "https://eggskxdtvohxedkfobkt.supabase.co";

if (stagingEnv.NEXT_PUBLIC_SUPABASE_URL !== expectedUrl) {
  throw new Error("Refusing to start with a non-staging Supabase project.");
}

const stdout = openSync(`${projectDirectory}staging-callback-server.log`, "a");
const stderr = openSync(`${projectDirectory}staging-callback-server.err.log`, "a");
const nextCli = fileURLToPath(
  new URL("../../node_modules/next/dist/bin/next", import.meta.url),
);
const child = spawn(
  process.execPath,
  [nextCli, "dev", "--webpack", "-p", "3001"],
  {
  cwd: projectDirectory,
  detached: true,
  env: { ...process.env, ...stagingEnv },
  stdio: ["ignore", stdout, stderr],
  windowsHide: true,
  },
);

child.unref();
console.log(`Started staging server process ${child.pid}.`);
