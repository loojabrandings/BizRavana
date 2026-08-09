export type UploadPurpose =
  | "profile-avatar"
  | "business-logo"
  | "order-image"
  | "admin-avatar"
  | "dashboard-ad";

export async function uploadFile(purpose: UploadPurpose, file: Blob) {
  const form = new FormData();
  form.set("purpose", purpose);
  form.set("file", file, file instanceof File ? file.name : "upload");
  const response = await fetch("/api/uploads", { method: "POST", body: form });
  const payload = await response.json().catch(() => ({})) as {
    error?: string;
    path?: string;
    publicUrl?: string;
  };
  if (!response.ok || !payload.path || !payload.publicUrl) {
    throw new Error(payload.error || "The file could not be uploaded.");
  }
  return { path: payload.path, publicUrl: payload.publicUrl };
}

export async function deleteUploadedFiles(
  purpose: UploadPurpose,
  paths: string[],
) {
  const response = await fetch("/api/uploads", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ purpose, paths }),
  });
  const payload = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new Error(payload.error || "The file could not be removed.");
}

export function storagePathFromPublicUrl(url: string, bucket: string) {
  try {
    const pathname = new URL(url).pathname;
    const marker = `/storage/v1/object/public/${bucket}/`;
    const index = pathname.indexOf(marker);
    return index >= 0 ? decodeURIComponent(pathname.slice(index + marker.length)) : null;
  } catch {
    return null;
  }
}
