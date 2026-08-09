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

const expectedSupabaseUrl = "https://eggskxdtvohxedkfobkt.supabase.co";
const expectedAppUrl = "http://localhost:3001";
if (
  stagingEnv.NEXT_PUBLIC_SUPABASE_URL !== expectedSupabaseUrl ||
  stagingEnv.NEXT_PUBLIC_APP_URL !== expectedAppUrl
) {
  throw new Error("Refusing to test templates outside BizRavana Staging.");
}

const admin = createClient(
  stagingEnv.NEXT_PUBLIC_SUPABASE_URL,
  stagingEnv.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function sessionFor(prefix) {
  const client = createClient(
    stagingEnv.NEXT_PUBLIC_SUPABASE_URL,
    stagingEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data, error } = await client.auth.signInWithPassword({
    email: fixtures[`STAGING_${prefix}_EMAIL`],
    password: fixtures[`STAGING_${prefix}_PASSWORD`],
  });
  if (error) throw error;
  if (!data.session) throw new Error(`No session for ${prefix}.`);
  return { client, session: data.session };
}

function cookieHeader(session) {
  const cookieName = "sb-eggskxdtvohxedkfobkt-auth-token";
  const encoded =
    "base64-" +
    Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const chunks = [];
  for (let offset = 0; offset < encoded.length; offset += 3180) {
    chunks.push(encoded.slice(offset, offset + 3180));
  }
  return chunks.length === 1
    ? `${cookieName}=${chunks[0]}`
    : chunks
        .map((value, index) => `${cookieName}.${index}=${value}`)
        .join("; ");
}

async function api(session, method, path = "", body) {
  const response = await fetch(`${expectedAppUrl}/api/message-templates${path}`, {
    method,
    headers: {
      Cookie: cookieHeader(session),
      "Content-Type": "application/json",
      Origin: expectedAppUrl,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: "manual",
  });
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}

const results = [];
const createdIds = [];
function check(name, condition) {
  if (!condition) throw new Error(`FAILED: ${name}`);
  results.push(name);
}

const owner = await sessionFor("OWNER");
const manager = await sessionFor("MANAGER");
const member = await sessionFor("MEMBER");
const foreignOwner = await sessionFor("FOREIGN_OWNER");
const suffix = fixtures.STAGING_RUN_ID;

try {
  const ownerCreate = await api(owner.session, "POST", "", {
    template_context: "order_table_whatsapp",
    title: `Owner order ${suffix}`,
    content: "Owner-created legacy order template",
  });
  check("owner can create a template", ownerCreate.status === 201);
  createdIds.push(ownerCreate.data.id);
  check("first order template becomes default", ownerCreate.data.is_default);

  const managerRead = await api(
    manager.session,
    "GET",
    "?context=order_whatsapp",
  );
  check(
    "manager can read same-business legacy template through unified context",
    managerRead.status === 200 &&
      managerRead.data.some((item) => item.id === ownerCreate.data.id),
  );

  const managerCreate = await api(manager.session, "POST", "", {
    template_context: "order_preview_whatsapp",
    title: `Manager order ${suffix}`,
    content: "Manager-created legacy order template",
  });
  check("manager can create a template", managerCreate.status === 201);
  createdIds.push(managerCreate.data.id);
  check("second grouped order template is not default", !managerCreate.data.is_default);

  const managerDefault = await api(manager.session, "PUT", "", {
    id: managerCreate.data.id,
  });
  check("manager can change the grouped order default", managerDefault.status === 200);

  const memberUpdate = await api(member.session, "PATCH", "", {
    id: managerCreate.data.id,
    content: "Member-updated order template",
  });
  check(
    "member can update a same-business template",
    memberUpdate.status === 200 &&
      memberUpdate.data.content === "Member-updated order template",
  );

  const memberCreate = await api(member.session, "POST", "", {
    template_context: "quotation_preview_whatsapp",
    title: `Member quotation ${suffix}`,
    content: "Member-created quotation template",
  });
  check("member can create a same-business template", memberCreate.status === 201);
  createdIds.push(memberCreate.data.id);
  check("first quotation template has its own default", memberCreate.data.is_default);

  const memberDelete = await api(
    member.session,
    "DELETE",
    `?id=${ownerCreate.data.id}`,
  );
  check("member can soft-delete a same-business template", memberDelete.status === 200);

  const ownerAfterDelete = await api(owner.session, "GET", "");
  check(
    "soft-deleted template is excluded from reads",
    ownerAfterDelete.status === 200 &&
      !ownerAfterDelete.data.some((item) => item.id === ownerCreate.data.id),
  );

  const foreignCreate = await api(foreignOwner.session, "POST", "", {
    template_context: "order_whatsapp",
    title: `Foreign order ${suffix}`,
    content: "Foreign-business order template",
  });
  check("foreign owner can create an own-business template", foreignCreate.status === 201);
  createdIds.push(foreignCreate.data.id);

  const ownerRead = await api(owner.session, "GET", "");
  const foreignRead = await api(foreignOwner.session, "GET", "");
  check(
    "primary business cannot read foreign template",
    ownerRead.status === 200 &&
      !ownerRead.data.some((item) => item.id === foreignCreate.data.id),
  );
  check(
    "foreign business cannot read primary templates",
    foreignRead.status === 200 &&
      !foreignRead.data.some((item) => item.id === managerCreate.data.id),
  );

  const foreignUpdate = await api(foreignOwner.session, "PATCH", "", {
    id: managerCreate.data.id,
    title: "Cross-tenant update attempt",
  });
  const foreignDelete = await api(
    foreignOwner.session,
    "DELETE",
    `?id=${managerCreate.data.id}`,
  );
  const foreignDefault = await api(foreignOwner.session, "PUT", "", {
    id: managerCreate.data.id,
  });
  check("cross-business update is hidden", foreignUpdate.status === 404);
  check("cross-business delete is hidden", foreignDelete.status === 404);
  check("cross-business default change is hidden", foreignDefault.status === 404);

  const { data: directForeignRead, error: directForeignError } =
    await foreignOwner.client
      .from("message_templates")
      .select("id")
      .eq("id", managerCreate.data.id);
  if (directForeignError) throw directForeignError;
  check("RLS hides primary template from foreign client", directForeignRead.length === 0);

  const unifiedCreate = await api(owner.session, "POST", "", {
    template_context: "order_whatsapp",
    title: `Unified order ${suffix}`,
    content: "Unified order template",
  });
  check("owner can create unified order template", unifiedCreate.status === 201);
  createdIds.push(unifiedCreate.data.id);

  const unifiedDefault = await api(owner.session, "PUT", "", {
    id: unifiedCreate.data.id,
  });
  check("unified order template can become default", unifiedDefault.status === 200);

  const { data: orderDefaults, error: defaultsError } = await admin
    .from("message_templates")
    .select("id, template_context, is_default")
    .eq("business_id", fixtures.STAGING_PRIMARY_BUSINESS_ID)
    .in("template_context", [
      "order_whatsapp",
      "order_table_whatsapp",
      "order_preview_whatsapp",
    ])
    .is("deleted_at", null);
  if (defaultsError) throw defaultsError;
  check(
    "unified and legacy order contexts have exactly one UI-level default",
    orderDefaults.filter((item) => item.is_default).length === 1 &&
      orderDefaults.find((item) => item.is_default)?.id === unifiedCreate.data.id,
  );

  const { data: quotationDefault, error: quotationError } = await admin
    .from("message_templates")
    .select("is_default")
    .eq("id", memberCreate.data.id)
    .single();
  if (quotationError) throw quotationError;
  check("quotation default remains independent", quotationDefault.is_default);

  console.log(`Message Template isolation checks passed: ${results.length}`);
} finally {
  if (createdIds.length > 0) {
    await admin.from("message_templates").delete().in("id", createdIds);
  }
}
