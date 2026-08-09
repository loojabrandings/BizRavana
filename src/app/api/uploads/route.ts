import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  validateUploadedFile,
  type SupportedFileMime,
} from "@/lib/file-signature";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Purpose =
  | "profile-avatar"
  | "business-logo"
  | "order-image"
  | "admin-avatar"
  | "dashboard-ad";

type UploadRule = {
  bucket: "profile-images" | "order-images" | "dashboard-ads";
  maxSize: number;
  mimes: readonly SupportedFileMime[];
};

const IMAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

const RULES: Record<Purpose, UploadRule> = {
  "profile-avatar": { bucket: "profile-images", maxSize: 2 * 1024 * 1024, mimes: IMAGE_MIMES },
  "business-logo": {
    bucket: "profile-images",
    maxSize: 2 * 1024 * 1024,
    mimes: ["image/jpeg", "image/png", "image/webp"],
  },
  "order-image": { bucket: "order-images", maxSize: 5 * 1024 * 1024, mimes: ["image/jpeg"] },
  "admin-avatar": { bucket: "profile-images", maxSize: 2 * 1024 * 1024, mimes: IMAGE_MIMES },
  "dashboard-ad": {
    bucket: "dashboard-ads",
    maxSize: 5 * 1024 * 1024,
    mimes: ["image/jpeg", "image/png", "image/webp"],
  },
};

function json(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function isPurpose(value: string): value is Purpose {
  return Object.hasOwn(RULES, value);
}

async function authorize(purpose: Purpose) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: json({ error: "Please sign in." }, 401) } as const;

  const isAdminPurpose = purpose === "admin-avatar" || purpose === "dashboard-ad";
  if (isAdminPurpose && user.app_metadata?.is_super_admin !== true) {
    return { error: json({ error: "Super admin access required." }, 403) } as const;
  }

  let businessId: string | null = null;
  if (purpose === "business-logo" || purpose === "order-image") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id, role")
      .eq("user_id", user.id)
      .maybeSingle();
    businessId = profile?.business_id ?? null;
    if (!businessId) {
      return { error: json({ error: "Business access required." }, 403) } as const;
    }
    if (purpose === "business-logo" && !["owner", "admin"].includes(profile?.role ?? "")) {
      return { error: json({ error: "Owner or Business Manager access required." }, 403) } as const;
    }
  }

  return { userId: user.id, businessId } as const;
}

function folderFor(purpose: Purpose, userId: string, businessId: string | null) {
  switch (purpose) {
    case "profile-avatar": return `avatars/${userId}`;
    case "admin-avatar": return `avatars/${userId}`;
    case "business-logo": return `logos/${businessId}`;
    case "order-image": return `orders/${businessId}`;
    case "dashboard-ad": return "";
  }
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Invalid upload request." }, 400);
  }

  const purposeValue = String(form.get("purpose") ?? "");
  const file = form.get("file");
  if (!isPurpose(purposeValue) || !(file instanceof File)) {
    return json({ error: "Upload purpose and file are required." }, 400);
  }

  const authorization = await authorize(purposeValue);
  if ("error" in authorization) return authorization.error;

  const rule = RULES[purposeValue];
  let validated: Awaited<ReturnType<typeof validateUploadedFile>>;
  try {
    validated = await validateUploadedFile(file, rule.mimes, rule.maxSize);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Invalid file." }, 400);
  }

  const folder = folderFor(
    purposeValue,
    authorization.userId,
    authorization.businessId,
  );
  const prefix = purposeValue === "admin-avatar" ? "admin-avatar" : purposeValue;
  const filename = `${prefix}-${crypto.randomUUID()}.${validated.extension}`;
  const path = folder ? `${folder}/${filename}` : filename;
  const admin = getAdminClient();

  const { error: uploadError } = await admin.storage.from(rule.bucket).upload(
    path,
    validated.bytes,
    { contentType: validated.mime, cacheControl: "3600", upsert: false },
  );
  if (uploadError) return json({ error: "The file could not be uploaded." }, 500);

  if (["profile-avatar", "admin-avatar", "business-logo"].includes(purposeValue)) {
    const { data: existing } = await admin.storage.from(rule.bucket).list(folder, { limit: 100 });
    const oldPaths = (existing ?? [])
      .map((item) => `${folder}/${item.name}`)
      .filter((existingPath) => existingPath !== path);
    if (oldPaths.length > 0) await admin.storage.from(rule.bucket).remove(oldPaths);
  }

  const publicUrl = admin.storage.from(rule.bucket).getPublicUrl(path).data.publicUrl;
  return json({ path, publicUrl }, 201);
}

export async function DELETE(request: Request) {
  let body: { purpose?: string; paths?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid delete request." }, 400);
  }

  if (!body.purpose || !isPurpose(body.purpose)) {
    return json({ error: "A valid upload purpose is required." }, 400);
  }
  const authorization = await authorize(body.purpose);
  if ("error" in authorization) return authorization.error;

  const rule = RULES[body.purpose];
  const folder = folderFor(body.purpose, authorization.userId, authorization.businessId);
  const requestedPaths = Array.isArray(body.paths)
    ? body.paths.filter((path): path is string => typeof path === "string")
    : [];
  const paths = requestedPaths.filter((path) =>
    folder ? path.startsWith(`${folder}/`) : !path.includes("/"),
  );
  if (paths.length === 0 || paths.length !== requestedPaths.length || paths.length > 100) {
    return json({ error: "No valid file paths were provided." }, 400);
  }

  const { error } = await getAdminClient().storage.from(rule.bucket).remove(paths);
  if (error) return json({ error: "The file could not be removed." }, 500);
  return json({ removed: paths.length });
}
