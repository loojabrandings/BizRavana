import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/admin-authorization";
import { createClient } from "@/lib/supabase/server";

const reviewSchema = z
  .object({
    action: z.enum(["approve", "reject"]),
    adminNote: z.string().max(1000).optional(),
  })
  .strict();

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteParams) {
  const authorization = await requireSuperAdmin();
  if (!authorization.ok) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status },
    );
  }

  const supabase = await createClient();

  const paymentId = z.string().uuid().safeParse((await params).id);
  if (!paymentId.success) {
    return NextResponse.json({ error: "Invalid payment ID." }, { status: 400 });
  }

  const body = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid payment review." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("review_bank_transfer_payment", {
    p_payment_id: paymentId.data,
    p_action: body.data.action,
    p_admin_note: body.data.adminNote?.trim() || null,
  });

  if (error) {
    const conflict = error.message.includes("already been reviewed");
    return NextResponse.json(
      { error: conflict ? "This payment has already been reviewed." : error.message },
      { status: conflict ? 409 : 400 },
    );
  }

  return NextResponse.json({ data });
}
