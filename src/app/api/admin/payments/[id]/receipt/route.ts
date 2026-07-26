import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    return NextResponse.json({ error: "Super admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const admin = getAdminClient();
  const { data: payment, error } = await admin
    .from("payment_proofs")
    .select("proof_image_path, proof_image_url")
    .eq("id", id)
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
