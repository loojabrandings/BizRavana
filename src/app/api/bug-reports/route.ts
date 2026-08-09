import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { validateUploadedFile } from "@/lib/file-signature";
import { getAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const BUCKET = "bug-report-screenshots";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

function json(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Please sign in." }, 401);

  const { data, error } = await supabase
    .from("bug_reports")
    .select("id, title, description, expected_result, status, admin_notes, screenshot_path, page_url, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return json({ error: "Bug reports could not be loaded." }, 500);
  return json({ reports: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Please sign in." }, 401);

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("user_id", user.id)
    .single();
  if (!profile?.business_id) {
    return json({ error: "Your business account could not be found." }, 403);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Invalid bug report." }, 400);
  }

  const title = String(form.get("title") ?? "").trim().slice(0, 150);
  const description = String(form.get("description") ?? "").trim().slice(0, 5000);
  const expectedResult = String(form.get("expectedResult") ?? "").trim().slice(0, 3000);
  const pageUrl = String(form.get("pageUrl") ?? "").trim().slice(0, 1000);
  const browserInfo = String(form.get("browserInfo") ?? "").trim().slice(0, 1000);
  const screenshot = form.get("screenshot");

  if (title.length < 3 || description.length < 10) {
    return json({ error: "Add a title and describe what happened." }, 400);
  }

  const admin = getAdminClient();
  const reportId = randomUUID();
  let screenshotPath: string | null = null;

  if (screenshot instanceof File && screenshot.size > 0) {
    let validatedScreenshot: Awaited<ReturnType<typeof validateUploadedFile>>;
    try {
      validatedScreenshot = await validateUploadedFile(
        screenshot,
        ALLOWED_TYPES,
        5 * 1024 * 1024,
      );
    } catch (error) {
      return json(
        { error: error instanceof Error ? error.message : "Invalid screenshot file." },
        400,
      );
    }
    screenshotPath = `${profile.business_id}/${user.id}/${reportId}.${validatedScreenshot.extension}`;
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(screenshotPath, validatedScreenshot.bytes, {
        contentType: validatedScreenshot.mime,
        upsert: false,
      });
    if (uploadError) return json({ error: "Screenshot upload failed." }, 500);
  }

  const { data, error } = await admin
    .from("bug_reports")
    .insert({
      id: reportId,
      business_id: profile.business_id,
      user_id: user.id,
      title,
      description,
      expected_result: expectedResult || null,
      page_url: pageUrl || null,
      browser_info: browserInfo || null,
      screenshot_path: screenshotPath,
    })
    .select("id, title, status, created_at")
    .single();

  if (error) {
    if (screenshotPath) await admin.storage.from(BUCKET).remove([screenshotPath]);
    console.error("Bug report creation failed:", error);
    return json({ error: "Bug report could not be submitted." }, 500);
  }

  return json({ report: data }, 201);
}
