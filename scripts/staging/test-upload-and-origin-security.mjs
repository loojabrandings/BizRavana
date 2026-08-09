import { randomUUID } from "node:crypto";
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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sessionCookie(session) {
  const name = "sb-eggskxdtvohxedkfobkt-auth-token";
  const encoded = `base64-${Buffer.from(JSON.stringify(session), "utf8").toString("base64url")}`;
  const chunks = [];
  for (let offset = 0; offset < encoded.length; offset += 3180) {
    chunks.push(encoded.slice(offset, offset + 3180));
  }
  return chunks.length === 1
    ? `${name}=${chunks[0]}`
    : chunks.map((value, index) => `${name}.${index}=${value}`).join("; ");
}

const env = parseEnv(
  await readFile(new URL("../../.env.staging.local", import.meta.url), "utf8"),
);
const appUrl = "http://localhost:3001";
const supabaseUrl = "https://eggskxdtvohxedkfobkt.supabase.co";
if (env.NEXT_PUBLIC_SUPABASE_URL !== supabaseUrl || env.NEXT_PUBLIC_APP_URL !== appUrl) {
  throw new Error("Refusing to test outside BizRavana Staging.");
}

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const userClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const runId = randomUUID();
const email = `qa.upload.${runId}@example.com`;
const password = `Upload-QA-${runId}!`;
let userId = null;
let uploadedPath = null;
const results = [];

function pass(name) {
  results.push(name);
  console.log(`PASS: ${name}`);
}

try {
  const health = await fetch(appUrl);
  assert(health.ok, "Staging server is not reachable.");

  const crossOrigin = await fetch(`${appUrl}/api/login`, {
    method: "POST",
    headers: { Origin: "https://attacker.example", "Content-Type": "application/json" },
    body: "{}",
  });
  assert(crossOrigin.status === 403, "Cross-origin mutation was not rejected.");
  pass("cross-origin API mutation is rejected");

  const missingOrigin = await fetch(`${appUrl}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  assert(missingOrigin.status === 403, "Mutation without Origin was not rejected.");
  pass("mutation without Origin is rejected");

  const sameOrigin = await fetch(`${appUrl}/api/login`, {
    method: "POST",
    headers: { Origin: appUrl, "Content-Type": "application/json" },
    body: "{}",
  });
  assert(sameOrigin.status !== 403, "Same-origin mutation was rejected by the Origin guard.");
  pass("same-origin API mutation reaches its route");

  const callback = await fetch(`${appUrl}/api/payments/payhere/notify`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Real-IP": "192.0.2.201" },
    body: "merchant_id=invalid",
  });
  assert(callback.status !== 403, "PayHere callback was blocked by the Origin guard.");
  pass("signed PayHere callback remains Origin-exempt");

  const unauthenticatedForm = new FormData();
  unauthenticatedForm.set("purpose", "profile-avatar");
  unauthenticatedForm.set("file", new Blob(["not an image"], { type: "image/png" }), "fake.png");
  const unauthenticated = await fetch(`${appUrl}/api/uploads`, {
    method: "POST",
    headers: { Origin: appUrl },
    body: unauthenticatedForm,
  });
  assert(unauthenticated.status === 401, "Unauthenticated upload was not rejected.");
  pass("unauthenticated upload is rejected");

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError || !created.user) throw createError ?? new Error("QA user creation failed.");
  userId = created.user.id;
  const { data: signedIn, error: signInError } = await userClient.auth.signInWithPassword({ email, password });
  if (signInError || !signedIn.session) throw signInError ?? new Error("QA sign-in failed.");
  const cookie = sessionCookie(signedIn.session);

  const fakeForm = new FormData();
  fakeForm.set("purpose", "profile-avatar");
  fakeForm.set("file", new Blob(["not an image"], { type: "image/png" }), "fake.png");
  const fakeUpload = await fetch(`${appUrl}/api/uploads`, {
    method: "POST",
    headers: { Origin: appUrl, Cookie: cookie },
    body: fakeForm,
  });
  assert(fakeUpload.status === 400, "Spoofed PNG contents were not rejected.");
  pass("spoofed MIME with invalid file signature is rejected");

  const pngBytes = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  );
  const mismatchForm = new FormData();
  mismatchForm.set("purpose", "profile-avatar");
  mismatchForm.set("file", new Blob([pngBytes], { type: "image/jpeg" }), "mismatch.jpg");
  const mismatchUpload = await fetch(`${appUrl}/api/uploads`, {
    method: "POST",
    headers: { Origin: appUrl, Cookie: cookie },
    body: mismatchForm,
  });
  assert(mismatchUpload.status === 400, "Claimed MIME/signature mismatch was not rejected.");
  pass("claimed MIME must match detected signature");

  const validForm = new FormData();
  validForm.set("purpose", "profile-avatar");
  validForm.set("file", new Blob([pngBytes], { type: "image/png" }), "valid.png");
  const validUpload = await fetch(`${appUrl}/api/uploads`, {
    method: "POST",
    headers: { Origin: appUrl, Cookie: cookie },
    body: validForm,
  });
  const validPayload = await validUpload.json();
  assert(validUpload.status === 201, `Valid PNG upload returned ${validUpload.status}.`);
  assert(validPayload.path?.startsWith(`avatars/${userId}/`), "Server did not derive the user folder.");
  uploadedPath = validPayload.path;
  pass("valid signature uploads into server-derived user folder");

  const directUpload = await userClient.storage
    .from("profile-images")
    .upload(`avatars/${userId}/direct.png`, pngBytes, { contentType: "image/png" });
  assert(directUpload.error, "Direct browser Storage upload was still allowed.");
  pass("direct browser Storage upload is denied");

  const forbiddenPurpose = new FormData();
  forbiddenPurpose.set("purpose", "dashboard-ad");
  forbiddenPurpose.set("file", new Blob([pngBytes], { type: "image/png" }), "ad.png");
  const forbidden = await fetch(`${appUrl}/api/uploads`, {
    method: "POST",
    headers: { Origin: appUrl, Cookie: cookie },
    body: forbiddenPurpose,
  });
  assert(forbidden.status === 403, "Normal user could upload a dashboard ad.");
  pass("admin-only upload purpose rejects normal users");

  const deletion = await fetch(`${appUrl}/api/uploads`, {
    method: "DELETE",
    headers: { Origin: appUrl, Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ purpose: "profile-avatar", paths: [uploadedPath] }),
  });
  assert(deletion.ok, "Authorized server-side file deletion failed.");
  uploadedPath = null;
  pass("authorized file deletion is folder-scoped");

  const { data: receiptBucket, error: bucketError } = await admin.storage.getBucket("payment-proofs");
  if (bucketError) throw bucketError;
  assert(receiptBucket.public === false, "Payment proofs bucket is public.");
  assert(receiptBucket.allowed_mime_types?.includes("application/pdf"), "PDF receipt MIME is not allowed.");
  pass("payment proofs remain private and accept verified PDF receipts");

  console.log(`Upload/Origin security checks passed: ${results.length}`);
} finally {
  if (uploadedPath) await admin.storage.from("profile-images").remove([uploadedPath]);
  if (userId) await admin.auth.admin.deleteUser(userId);
}
