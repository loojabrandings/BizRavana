import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const stagingEnvPath = new URL("../../.env.staging.local", import.meta.url);
const credentialsPath = new URL("../../.env.staging.test.local", import.meta.url);

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

function password() {
  return `${randomBytes(18).toString("base64url")}Aa1!`;
}

const stagingEnv = parseEnv(await readFile(stagingEnvPath, "utf8"));
const expectedUrl = "https://eggskxdtvohxedkfobkt.supabase.co";

if (stagingEnv.NEXT_PUBLIC_SUPABASE_URL !== expectedUrl) {
  throw new Error("Refusing to create fixtures outside BizRavana Staging.");
}

if (!stagingEnv.SUPABASE_SERVICE_ROLE_KEY?.startsWith("sb_secret_")) {
  throw new Error("A staging Supabase secret key is required.");
}

const admin = createClient(
  stagingEnv.NEXT_PUBLIC_SUPABASE_URL,
  stagingEnv.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const runId = Date.now().toString(36);
const accountSpecs = [
  { key: "SUPERADMIN", label: "QA Super Admin", superAdmin: true },
  { key: "OWNER", label: "QA Business Owner" },
  { key: "MANAGER", label: "QA Business Manager" },
  { key: "MEMBER", label: "QA Team Member" },
  { key: "INVITEE", label: "QA Invitation Target" },
  { key: "FOREIGN_OWNER", label: "QA Foreign Business Owner" },
];

const accounts = {};
const createdUserIds = [];

try {
  for (const spec of accountSpecs) {
    const email = `bizravana.qa.${spec.key.toLowerCase()}.${runId}@example.com`;
    const userPassword = password();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: userPassword,
      email_confirm: true,
      app_metadata: spec.superAdmin ? { is_super_admin: true } : {},
      user_metadata: { full_name: spec.label },
    });

    if (error || !data.user) {
      throw error ?? new Error(`Could not create ${spec.key}.`);
    }

    createdUserIds.push(data.user.id);
    accounts[spec.key] = {
      email,
      password: userPassword,
      userId: data.user.id,
      label: spec.label,
    };
  }

  const { data: businesses, error: businessError } = await admin
    .from("businesses")
    .insert([
      {
        owner_id: accounts.OWNER.userId,
        name: `QA Primary Business ${runId}`,
        type: "staging_test",
        account_status: "active",
      },
      {
        owner_id: accounts.FOREIGN_OWNER.userId,
        name: `QA Foreign Business ${runId}`,
        type: "staging_test",
        account_status: "active",
      },
    ])
    .select("id, owner_id");

  if (businessError || !businesses || businesses.length !== 2) {
    throw businessError ?? new Error("Could not create staging businesses.");
  }

  const primaryBusiness = businesses.find(
    (business) => business.owner_id === accounts.OWNER.userId,
  );
  const foreignBusiness = businesses.find(
    (business) => business.owner_id === accounts.FOREIGN_OWNER.userId,
  );

  if (!primaryBusiness || !foreignBusiness) {
    throw new Error("Could not resolve staging businesses.");
  }

  const { error: profileError } = await admin.from("profiles").insert([
    {
      user_id: accounts.OWNER.userId,
      business_id: primaryBusiness.id,
      full_name: accounts.OWNER.label,
      role: "owner",
    },
    {
      user_id: accounts.MANAGER.userId,
      business_id: primaryBusiness.id,
      full_name: accounts.MANAGER.label,
      role: "admin",
    },
    {
      user_id: accounts.MEMBER.userId,
      business_id: primaryBusiness.id,
      full_name: accounts.MEMBER.label,
      role: "member",
    },
    {
      user_id: accounts.FOREIGN_OWNER.userId,
      business_id: foreignBusiness.id,
      full_name: accounts.FOREIGN_OWNER.label,
      role: "owner",
    },
  ]);

  if (profileError) throw profileError;

  const credentialLines = [
    "# Disposable BizRavana staging fixtures — never commit",
    `STAGING_RUN_ID=${runId}`,
    `STAGING_PRIMARY_BUSINESS_ID=${primaryBusiness.id}`,
    `STAGING_FOREIGN_BUSINESS_ID=${foreignBusiness.id}`,
  ];

  for (const spec of accountSpecs) {
    const account = accounts[spec.key];
    credentialLines.push(
      `STAGING_${spec.key}_USER_ID=${account.userId}`,
      `STAGING_${spec.key}_EMAIL=${account.email}`,
      `STAGING_${spec.key}_PASSWORD=${account.password}`,
    );
  }

  credentialLines.push("");
  await writeFile(credentialsPath, credentialLines.join("\n"), {
    encoding: "utf8",
    mode: 0o600,
  });

  console.log("Created disposable staging fixtures and stored credentials locally.");
} catch (error) {
  for (const userId of createdUserIds.reverse()) {
    await admin.auth.admin.deleteUser(userId).catch(() => undefined);
  }
  throw error;
}
