import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  const { data: report } = await admin
    .from("bug_reports")
    .select("user_id, screenshot_path")
    .eq("id", id)
    .maybeSingle();

  if (!report?.screenshot_path) {
    return NextResponse.json({ error: "Screenshot not found." }, { status: 404 });
  }
  if (report.user_id !== user.id && user.app_metadata?.is_super_admin !== true) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await admin.storage
    .from("bug-report-screenshots")
    .createSignedUrl(report.screenshot_path, 300);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Screenshot could not be opened." }, { status: 500 });
  }
  return NextResponse.json({ url: data.signedUrl });
}

