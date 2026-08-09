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
const fixtures = parseEnv(
  await readFile(new URL("../../.env.staging.test.local", import.meta.url), "utf8"),
);

const expectedUrl = "https://eggskxdtvohxedkfobkt.supabase.co";
if (stagingEnv.NEXT_PUBLIC_SUPABASE_URL !== expectedUrl) {
  throw new Error("Refusing to test invitations outside BizRavana Staging.");
}

const admin = createClient(
  stagingEnv.NEXT_PUBLIC_SUPABASE_URL,
  stagingEnv.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

function publicClient() {
  return createClient(
    stagingEnv.NEXT_PUBLIC_SUPABASE_URL,
    stagingEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

async function authenticatedClient(prefix) {
  const client = publicClient();
  const { error } = await client.auth.signInWithPassword({
    email: fixtures[`STAGING_${prefix}_EMAIL`],
    password: fixtures[`STAGING_${prefix}_PASSWORD`],
  });
  if (error) throw error;
  return client;
}

async function createInvitation(email, role = "member") {
  const { data, error } = await admin
    .from("team_invitations")
    .insert({
      business_id: fixtures.STAGING_PRIMARY_BUSINESS_ID,
      email,
      role,
      invited_by: fixtures.STAGING_OWNER_USER_ID,
    })
    .select("id, token")
    .single();
  if (error) throw error;
  return data;
}

async function roleFor(userId) {
  const { data, error } = await admin
    .from("profiles")
    .select("role, business_id")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
}

const results = [];
function check(name, condition) {
  if (!condition) throw new Error(`FAILED: ${name}`);
  results.push(name);
}

const anonymous = publicClient();
const invitee = await authenticatedClient("INVITEE");
const member = await authenticatedClient("MEMBER");
const manager = await authenticatedClient("MANAGER");
const owner = await authenticatedClient("OWNER");
const foreignOwner = await authenticatedClient("FOREIGN_OWNER");

const discoveryInvitation = await createInvitation(
  fixtures.STAGING_INVITEE_EMAIL,
  "member",
);

const anonymousDiscovery = await anonymous.rpc("get_pending_invitations", {
  target_email: fixtures.STAGING_INVITEE_EMAIL,
});
check("anonymous invitation discovery is blocked", Boolean(anonymousDiscovery.error));

const mismatchedDiscovery = await invitee.rpc("get_pending_invitations", {
  target_email: fixtures.STAGING_OWNER_EMAIL,
});
check("authenticated discovery cannot request another email", Boolean(mismatchedDiscovery.error));

const ownDiscovery = await invitee.rpc("get_pending_invitations", {
  target_email: fixtures.STAGING_INVITEE_EMAIL,
});
check(
  "authenticated user can discover own invitation",
  !ownDiscovery.error && ownDiscovery.data.some((row) => row.id === discoveryInvitation.id),
);

const mismatchedAcceptance = await member.rpc("accept_invitation", {
  invitation_token: discoveryInvitation.token,
  accepting_user_id: fixtures.STAGING_MEMBER_USER_ID,
});
check("another authenticated user cannot accept a token", Boolean(mismatchedAcceptance.error));

const acceptedInvitation = await invitee.rpc("accept_invitation", {
  invitation_token: discoveryInvitation.token,
  accepting_user_id: fixtures.STAGING_INVITEE_USER_ID,
});
check("new user can accept a member invitation", !acceptedInvitation.error);
const inviteeProfile = await roleFor(fixtures.STAGING_INVITEE_USER_ID);
check(
  "accepted user joins the intended business as member",
  inviteeProfile.business_id === fixtures.STAGING_PRIMARY_BUSINESS_ID &&
    inviteeProfile.role === "member",
);

const foreignInvitation = await createInvitation(
  fixtures.STAGING_FOREIGN_OWNER_EMAIL,
  "admin",
);
const foreignAcceptance = await foreignOwner.rpc("accept_invitation", {
  invitation_token: foreignInvitation.token,
  accepting_user_id: fixtures.STAGING_FOREIGN_OWNER_USER_ID,
});
check("cross-business membership transfer is blocked", Boolean(foreignAcceptance.error));

for (const [prefix, client, expectedRole] of [
  ["OWNER", owner, "owner"],
  ["MANAGER", manager, "admin"],
  ["MEMBER", member, "member"],
]) {
  const invitation = await createInvitation(fixtures[`STAGING_${prefix}_EMAIL`], "member");
  const acceptance = await client.rpc("accept_invitation", {
    invitation_token: invitation.token,
    accepting_user_id: fixtures[`STAGING_${prefix}_USER_ID`],
  });
  check(`${prefix.toLowerCase()} can accept redundant same-business invitation`, !acceptance.error);
  const profile = await roleFor(fixtures[`STAGING_${prefix}_USER_ID`]);
  check(`${prefix.toLowerCase()} role is not downgraded`, profile.role === expectedRole);
}

const promotionInvitation = await createInvitation(
  fixtures.STAGING_MEMBER_EMAIL,
  "admin",
);
const promotion = await member.rpc("accept_invitation", {
  invitation_token: promotionInvitation.token,
  accepting_user_id: fixtures.STAGING_MEMBER_USER_ID,
});
check("member can accept a manager invitation", !promotion.error);
check(
  "member is promoted to business manager",
  (await roleFor(fixtures.STAGING_MEMBER_USER_ID)).role === "admin",
);

const concurrentInvitation = await createInvitation(
  fixtures.STAGING_INVITEE_EMAIL,
  "member",
);
const concurrentAttempts = await Promise.all([
  invitee.rpc("accept_invitation", {
    invitation_token: concurrentInvitation.token,
    accepting_user_id: fixtures.STAGING_INVITEE_USER_ID,
  }),
  invitee.rpc("accept_invitation", {
    invitation_token: concurrentInvitation.token,
    accepting_user_id: fixtures.STAGING_INVITEE_USER_ID,
  }),
]);
check(
  "concurrent acceptance succeeds exactly once",
  concurrentAttempts.filter((attempt) => !attempt.error).length === 1,
);

const { data: concurrentRow, error: concurrentRowError } = await admin
  .from("team_invitations")
  .select("status, accepted_at")
  .eq("id", concurrentInvitation.id)
  .single();
if (concurrentRowError) throw concurrentRowError;
check(
  "concurrent invitation has one accepted final state",
  concurrentRow.status === "accepted" && Boolean(concurrentRow.accepted_at),
);

console.log(`Invitation security checks passed: ${results.length}`);
