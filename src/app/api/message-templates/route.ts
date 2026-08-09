import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessUser } from "@/lib/business-authorization";

const templateContextSchema = z.enum([
  "order_whatsapp",
  "order_table_whatsapp",
  "order_preview_whatsapp",
  "quotation_preview_whatsapp",
]);

const createSchema = z
  .object({
    template_context: templateContextSchema,
    title: z.string().trim().min(1).max(120),
    content: z.string().min(1).max(20_000),
  })
  .strict();

const updateSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().trim().min(1).max(120).optional(),
    content: z.string().min(1).max(20_000).optional(),
  })
  .strict()
  .refine((value) => value.title !== undefined || value.content !== undefined);

const defaultSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();

type TemplateContext = z.infer<typeof templateContextSchema>;

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function contextGroup(context: TemplateContext): TemplateContext[] {
  if (context.startsWith("order")) {
    return [
      "order_whatsapp",
      "order_table_whatsapp",
      "order_preview_whatsapp",
    ];
  }

  return [context];
}

function databaseErrorResponse(error: { code?: string; message: string }) {
  if (error.code === "23505") {
    return errorResponse("A template with this title or default already exists.", 409);
  }

  console.error("Message Template database error:", error);
  return errorResponse("The template operation could not be completed.", 500);
}

export async function GET(request: NextRequest) {
  const authorization = await requireBusinessUser();
  if (!authorization.ok) {
    return errorResponse(authorization.error, authorization.status);
  }

  const rawContext = request.nextUrl.searchParams.get("context");
  const context = rawContext
    ? templateContextSchema.safeParse(rawContext)
    : null;
  if (context && !context.success) {
    return errorResponse("Invalid template context.", 400);
  }

  let query = authorization.supabase
    .from("message_templates")
    .select("*")
    .eq("business_id", authorization.businessId)
    .is("deleted_at", null)
    .order("is_default", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (context?.success) {
    query = query.in("template_context", contextGroup(context.data));
  }

  const { data, error } = await query;
  if (error) return databaseErrorResponse(error);

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const authorization = await requireBusinessUser();
  if (!authorization.ok) {
    return errorResponse(authorization.error, authorization.status);
  }

  const body = createSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return errorResponse("Invalid template details.", 400);
  }

  const { count, error: countError } = await authorization.supabase
    .from("message_templates")
    .select("id", { count: "exact", head: true })
    .eq("business_id", authorization.businessId)
    .in("template_context", contextGroup(body.data.template_context))
    .is("deleted_at", null);

  if (countError) return databaseErrorResponse(countError);

  const { data, error } = await authorization.supabase
    .from("message_templates")
    .insert({
      business_id: authorization.businessId,
      template_context: body.data.template_context,
      title: body.data.title,
      content: body.data.content,
      is_default: count === 0,
      created_by: authorization.userId,
    })
    .select()
    .single();

  if (error) return databaseErrorResponse(error);
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const authorization = await requireBusinessUser();
  if (!authorization.ok) {
    return errorResponse(authorization.error, authorization.status);
  }

  const body = updateSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return errorResponse("Invalid template update.", 400);
  }

  const update: {
    title?: string;
    content?: string;
    updated_by: string;
    updated_at: string;
  } = {
    updated_by: authorization.userId,
    updated_at: new Date().toISOString(),
  };
  if (body.data.title !== undefined) update.title = body.data.title;
  if (body.data.content !== undefined) update.content = body.data.content;

  const { data, error } = await authorization.supabase
    .from("message_templates")
    .update(update)
    .eq("id", body.data.id)
    .eq("business_id", authorization.businessId)
    .is("deleted_at", null)
    .select()
    .maybeSingle();

  if (error) return databaseErrorResponse(error);
  if (!data) return errorResponse("Template not found.", 404);

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const authorization = await requireBusinessUser();
  if (!authorization.ok) {
    return errorResponse(authorization.error, authorization.status);
  }

  const templateId = z
    .string()
    .uuid()
    .safeParse(request.nextUrl.searchParams.get("id"));
  if (!templateId.success) {
    return errorResponse("Invalid template ID.", 400);
  }

  const { data: deleted, error } = await authorization.supabase.rpc(
    "soft_delete_message_template",
    { p_template_id: templateId.data },
  );

  if (error) return databaseErrorResponse(error);
  if (!deleted) return errorResponse("Template not found.", 404);

  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  const authorization = await requireBusinessUser();
  if (!authorization.ok) {
    return errorResponse(authorization.error, authorization.status);
  }

  const body = defaultSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return errorResponse("Invalid default template request.", 400);
  }

  const { data: target, error: targetError } = await authorization.supabase
    .from("message_templates")
    .select("id, template_context")
    .eq("id", body.data.id)
    .eq("business_id", authorization.businessId)
    .is("deleted_at", null)
    .maybeSingle();

  if (targetError) return databaseErrorResponse(targetError);
  if (!target) return errorResponse("Template not found.", 404);

  const targetContext = templateContextSchema.safeParse(target.template_context);
  if (!targetContext.success) {
    return errorResponse("Template has an unsupported context.", 409);
  }

  const now = new Date().toISOString();
  const { error: clearError } = await authorization.supabase
    .from("message_templates")
    .update({
      is_default: false,
      updated_by: authorization.userId,
      updated_at: now,
    })
    .eq("business_id", authorization.businessId)
    .in("template_context", contextGroup(targetContext.data))
    .eq("is_default", true)
    .is("deleted_at", null);

  if (clearError) return databaseErrorResponse(clearError);

  const { data, error } = await authorization.supabase
    .from("message_templates")
    .update({
      is_default: true,
      updated_by: authorization.userId,
      updated_at: now,
    })
    .eq("id", target.id)
    .eq("business_id", authorization.businessId)
    .eq("template_context", target.template_context)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) return databaseErrorResponse(error);
  if (!data) return errorResponse("Template not found.", 404);

  return NextResponse.json({ success: true });
}
