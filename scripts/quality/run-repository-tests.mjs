import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const projectDirectory = fileURLToPath(new URL("../../", import.meta.url));
const testsDirectory = fileURLToPath(
  new URL("../../tests/repository/", import.meta.url),
);
const testFiles = readdirSync(testsDirectory)
  .filter((name) => name.endsWith(".test.mjs"))
  .sort()
  .map((name) => fileURLToPath(new URL(name, new URL("../../tests/repository/", import.meta.url))));

if (testFiles.length === 0) {
  throw new Error("No repository regression tests were found.");
}

const result = spawnSync(process.execPath, ["--test", ...testFiles], {
  cwd: projectDirectory,
  env: process.env,
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
