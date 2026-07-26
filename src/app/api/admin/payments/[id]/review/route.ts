import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteParams) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    return NextResponse.json({ error: "Super admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    action?: "approve" | "reject";
    adminNote?: string;
  };

  if (!body.action || !["approve", "reject"].includes(body.action)) {
    return NextResponse.json({ error: "Invalid review action." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("review_bank_transfer_payment", {
    p_payment_id: id,
    p_action: body.action,
    p_admin_note: body.adminNote?.trim().slice(0, 1000) || null,
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
