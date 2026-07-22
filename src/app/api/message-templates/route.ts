import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";

// ─── Helper: Verify user has access to the business ────────────────

async function getUserBusinessId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("user_id", session.user.id)
    .single();

  return data?.business_id ?? null;
}

// ─── GET /api/message-templates ───────────────────────────────────

export async function GET(req: NextRequest) {
  const businessId = await getUserBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const context = searchParams.get("context");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin: any = getAdminClient();
  let query = admin
    .from("message_templates")
    .select("*")
    .eq("business_id", businessId)
    .is("deleted_at", null)
    .order("is_default", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (context) {
    query = query.eq("template_context", context);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ─── POST /api/message-templates ──────────────────────────────────

export async function POST(req: NextRequest) {
  const businessId = await getUserBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id ?? null;

  const body = await req.json();
  const { template_context, title, content } = body;

  if (!template_context || !title || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin: any = getAdminClient();

  // Check if this is the first template (auto-set as default)
  const { count } = await admin
    .from("message_templates")
    .select("*", { count: "exact", head: true })
    .eq("business_id", businessId)
    .eq("template_context", template_context)
    .is("deleted_at", null);

  const isDefault = count === 0;

  const { data, error } = await admin
    .from("message_templates")
    .insert({
      business_id: businessId,
      template_context,
      title: title.trim(),
      content,
      is_default: isDefault,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// ─── PATCH /api/message-templates ─────────────────────────────────

export async function PATCH(req: NextRequest) {
  const businessId = await getUserBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id ?? null;

  const body = await req.json();
  const { id, title, content } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing template id" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin: any = getAdminClient();
  const { data, error } = await admin
    .from("message_templates")
    .update({
      title: title?.trim(),
      content,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("business_id", businessId)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ─── DELETE /api/message-templates ────────────────────────────────

export async function DELETE(req: NextRequest) {
  const businessId = await getUserBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id ?? null;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing template id" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin: any = getAdminClient();
  const { error } = await admin
    .from("message_templates")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: userId,
      is_active: false,
    })
    .eq("id", id)
    .eq("business_id", businessId)
    .is("deleted_at", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// ─── PUT /api/message-templates/default ───────────────────────────

export async function PUT(req: NextRequest) {
  const businessId = await getUserBusinessId();
  if (!businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id ?? null;

  const body = await req.json();
  const { id, template_context } = body;

  if (!id || !template_context) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin: any = getAdminClient();

  // Clear current default
  const { error: clearError } = await admin
    .from("message_templates")
    .update({
      is_default: false,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("business_id", businessId)
    .eq("template_context", template_context)
    .eq("is_default", true)
    .is("deleted_at", null);

  if (clearError) {
    return NextResponse.json({ error: clearError.message }, { status: 500 });
  }

  // Set new default
  const { error: setError } = await admin
    .from("message_templates")
    .update({
      is_default: true,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (setError) {
    return NextResponse.json({ error: setError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
