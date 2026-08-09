import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const readProjectFile = (path) =>
  readFile(new URL(`../../${path}`, import.meta.url), "utf8");

async function filesUnder(directory) {
  const root = new URL(`../../${directory}/`, import.meta.url);
  const results = [];
  async function visit(url, relative = "") {
    for (const entry of await readdir(url, { withFileTypes: true })) {
      const path = `${relative}${entry.name}`;
      if (entry.isDirectory()) await visit(new URL(`${entry.name}/`, url), `${path}/`);
      else results.push({ path: `${directory}/${path}`, contents: await readFile(new URL(entry.name, url), "utf8") });
    }
  }
  await visit(root);
  return results;
}

test("all mutation methods pass through the same-origin Proxy guard", async () => {
  const proxy = await readProjectFile("src/proxy.ts");
  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    assert.ok(proxy.includes(`"${method}"`), `${method} is missing from the mutation guard.`);
  }
  assert.ok(proxy.includes('pathname.startsWith("/api/")'));
  assert.ok(proxy.includes('request.headers.get("origin")'));
  assert.ok(proxy.includes('"/api/payments/payhere/notify"'));
  assert.ok(proxy.includes('status: 403'));
});

test("user-supplied files cannot bypass server signature validation", async () => {
  const files = await filesUnder("src");
  const directUploads = files
    .filter(({ contents }) => contents.includes(".upload("))
    .map(({ path }) => path)
    .sort();
  assert.deepEqual(directUploads, [
    "src/app/api/bug-reports/route.ts",
    "src/app/api/payments/bank-transfer/route.ts",
    "src/app/api/uploads/route.ts",
    "src/components/settings/cloud-backup-settings.tsx",
  ]);

  const [uploadRoute, bankRoute, bugRoute, migration] = await Promise.all([
    readProjectFile("src/app/api/uploads/route.ts"),
    readProjectFile("src/app/api/payments/bank-transfer/route.ts"),
    readProjectFile("src/app/api/bug-reports/route.ts"),
    readProjectFile("supabase/migrations/051_secure_file_upload_boundaries.sql"),
  ]);
  for (const route of [uploadRoute, bankRoute, bugRoute]) {
    assert.ok(route.includes("validateUploadedFile"));
  }
  assert.ok(uploadRoute.includes('user.app_metadata?.is_super_admin !== true'));
  assert.ok(uploadRoute.includes('["owner", "admin"]'));
  assert.ok(migration.includes('DROP POLICY IF EXISTS "authenticated_upload_profile_images"'));
  assert.ok(migration.includes('DROP POLICY IF EXISTS "authenticated_upload_order_images"'));
  assert.ok(migration.includes('DROP POLICY IF EXISTS "super_admin_manage_dashboard_ad_images"'));
  assert.match(migration, /SET public = false/);
  assert.ok(migration.includes("'application/pdf'"));
});

test("CI declares every repository quality gate", async () => {
  const workflow = await readProjectFile(".github/workflows/release-quality.yml");
  for (const command of [
    "npm ci",
    "npm run lint",
    "npm run typecheck",
    "npm test",
    "npm run build",
  ]) {
    assert.ok(workflow.includes(`run: ${command}`), `CI is missing: ${command}`);
  }
  assert.ok(workflow.includes("pull_request:"));
  assert.ok(workflow.includes("contents: read"));
});
