import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/admin-authorization";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const authorization = await requireSuperAdmin();
  if (!authorization.ok) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status },
    );
  }

  const paymentId = z.string().uuid().safeParse((await params).id);
  if (!paymentId.success) {
    return NextResponse.json({ error: "Invalid payment ID." }, { status: 400 });
  }

  const admin = getAdminClient();
  const { data: payment, error } = await admin
    .from("payment_proofs")
    .select("proof_image_path, proof_image_url")
    .eq("id", paymentId.data)
    .single();

  if (error || !payment) {
    return NextResponse.json({ error: "Payment receipt not found." }, { status: 404 });
  }

  if (payment.proof_image_path) {
    const { data, error: signedUrlError } = await admin.storage
      .from("payment-proofs")
      .createSignedUrl(payment.proof_image_path, 300);

    if (signedUrlError || !data?.signedUrl) {
      return NextResponse.json({ error: "Receipt could not be opened." }, { status: 500 });
    }

    return NextResponse.json({ url: data.signedUrl });
  }

  if (payment.proof_image_url) {
    return NextResponse.json({ url: payment.proof_image_url });
  }

  return NextResponse.json({ error: "No receipt is attached to this payment." }, { status: 404 });
}
