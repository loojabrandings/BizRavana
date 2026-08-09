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
if (stagingEnv.NEXT_PUBLIC_SUPABASE_URL !== expectedUrl) {
  throw new Error("Refusing to test broadcasts outside BizRavana Staging.");
}

const admin = createClient(
  stagingEnv.NEXT_PUBLIC_SUPABASE_URL,
  stagingEnv.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const runId = fixtures.STAGING_RUN_ID;
const createdBroadcastIds = [];
const results = [];

function check(name, condition) {
  if (!condition) throw new Error(`FAILED: ${name}`);
  results.push(name);
}

async function createBroadcast(overrides = {}) {
  const { data, error } = await admin
    .from("notification_broadcasts")
    .insert({
      title: `QA broadcast ${runId}`,
      message: "Disposable staging concurrency test",
      category: "announcement",
      priority: "normal",
      source: "admin",
      audience_type: "all",
      audience_config: {},
      status: "draft",
      created_by: fixtures.STAGING_SUPERADMIN_USER_ID,
      ...overrides,
    })
    .select("id")
    .single();
  if (error) throw error;
  createdBroadcastIds.push(data.id);
  return data.id;
}

async function broadcastState(id) {
  const { data, error } = await admin
    .from("notification_broadcasts")
    .select("status, recipient_count, sent_at")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

async function recipientCount(id) {
  const { count, error } = await admin
    .from("notification_recipients")
    .select("id", { count: "exact", head: true })
    .eq("broadcast_id", id);
  if (error) throw error;
  return count;
}

async function notificationCount(id) {
  const { count, error } = await admin
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("broadcast_id", id);
  if (error) throw error;
  return count;
}

try {
  const { count: eligibleBusinesses, error: businessCountError } = await admin
    .from("businesses")
    .select("id", { count: "exact", head: true })
    .is("deleted_at", null);
  if (businessCountError) throw businessCountError;
  check("staging has eligible businesses", eligibleBusinesses >= 2);

  const manualId = await createBroadcast();
  const manualAttempts = await Promise.all([
    admin.rpc("deliver_notification_broadcast", { p_broadcast_id: manualId }),
    admin.rpc("deliver_notification_broadcast", { p_broadcast_id: manualId }),
  ]);
  if (manualAttempts.some((attempt) => attempt.error)) {
    throw manualAttempts.find((attempt) => attempt.error).error;
  }
  const manualStatuses = manualAttempts.map((attempt) => attempt.data?.status);
  check(
    "concurrent manual delivery succeeds exactly once",
    manualStatuses.filter((status) => status === "delivered").length === 1,
  );
  check(
    "second manual delivery is rejected",
    manualStatuses.filter((status) => status === "conflict").length === 1,
  );
  const manualState = await broadcastState(manualId);
  check(
    "manual broadcast reaches sent state",
    manualState.status === "sent" && Boolean(manualState.sent_at),
  );
  check(
    "manual recipient total matches eligible businesses",
    manualState.recipient_count === eligibleBusinesses &&
      (await recipientCount(manualId)) === eligibleBusinesses,
  );
  check(
    "manual notification total has no duplicates",
    (await notificationCount(manualId)) === eligibleBusinesses,
  );

  const scheduledId = await createBroadcast({
    status: "scheduled",
    scheduled_at: new Date(Date.now() - 60_000).toISOString(),
  });
  const [manualRace, scheduledRace] = await Promise.all([
    admin.rpc("deliver_notification_broadcast", {
      p_broadcast_id: scheduledId,
    }),
    admin.rpc("deliver_scheduled_broadcasts"),
  ]);
  if (manualRace.error) throw manualRace.error;
  if (scheduledRace.error) throw scheduledRace.error;
  check(
    "manual side of scheduled race resolves safely",
    ["delivered", "conflict"].includes(manualRace.data?.status),
  );
  const scheduledState = await broadcastState(scheduledId);
  check(
    "scheduled/manual race reaches sent state",
    scheduledState.status === "sent" && Boolean(scheduledState.sent_at),
  );
  check(
    "scheduled/manual race has one recipient per business",
    scheduledState.recipient_count === eligibleBusinesses &&
      (await recipientCount(scheduledId)) === eligibleBusinesses,
  );
  check(
    "scheduled/manual race has no duplicate notifications",
    (await notificationCount(scheduledId)) === eligibleBusinesses,
  );

  const invalidId = await createBroadcast({
    audience_type: "selected",
    audience_config: {},
  });
  const invalidAttempt = await admin.rpc("deliver_notification_broadcast", {
    p_broadcast_id: invalidId,
  });
  if (invalidAttempt.error) throw invalidAttempt.error;
  check(
    "invalid selected audience is rejected",
    invalidAttempt.data?.status === "invalid_audience",
  );
  check(
    "invalid audience creates no recipients",
    (await recipientCount(invalidId)) === 0,
  );

  const emptyMatchId = await createBroadcast({
    audience_type: "selected",
    audience_config: { business_ids: [randomUUID()] },
  });
  const emptyMatchAttempt = await admin.rpc("deliver_notification_broadcast", {
    p_broadcast_id: emptyMatchId,
  });
  if (emptyMatchAttempt.error) throw emptyMatchAttempt.error;
  const emptyMatchState = await broadcastState(emptyMatchId);
  check(
    "valid zero-match audience completes with zero deliveries",
    emptyMatchAttempt.data?.status === "delivered" &&
      emptyMatchState.status === "sent" &&
      emptyMatchState.recipient_count === 0,
  );

  console.log(`Broadcast concurrency checks passed: ${results.length}`);
} finally {
  if (createdBroadcastIds.length > 0) {
    await admin.from("notifications").delete().in("broadcast_id", createdBroadcastIds);
    await admin
      .from("notification_broadcasts")
      .delete()
      .in("id", createdBroadcastIds);
  }
}
