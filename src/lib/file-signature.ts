import "server-only";

export type SupportedFileMime =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif"
  | "image/avif"
  | "application/pdf";

const EXTENSIONS: Record<SupportedFileMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "application/pdf": "pdf",
};

function startsWith(bytes: Uint8Array, signature: number[], offset = 0) {
  return signature.every((value, index) => bytes[offset + index] === value);
}

function ascii(bytes: Uint8Array, offset: number, length: number) {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

export function detectFileMime(bytes: Uint8Array): SupportedFileMime | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") {
    return "image/webp";
  }
  if (["GIF87a", "GIF89a"].includes(ascii(bytes, 0, 6))) return "image/gif";
  if (ascii(bytes, 0, 5) === "%PDF-") return "application/pdf";

  if (ascii(bytes, 4, 4) === "ftyp") {
    const brands = ascii(bytes, 8, Math.min(24, Math.max(0, bytes.length - 8)));
    if (brands.includes("avif") || brands.includes("avis")) return "image/avif";
  }

  return null;
}

export async function validateUploadedFile(
  file: File,
  allowedMimes: readonly SupportedFileMime[],
  maxSize: number,
) {
  if (file.size <= 0 || file.size > maxSize) {
    throw new Error(`File must be smaller than ${Math.floor(maxSize / 1024 / 1024)} MB.`);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detectedMime = detectFileMime(bytes);
  if (!detectedMime || !allowedMimes.includes(detectedMime)) {
    throw new Error("The file contents do not match an allowed file type.");
  }
  if (file.type !== detectedMime) {
    throw new Error("The file contents do not match the selected file type.");
  }

  return {
    bytes,
    mime: detectedMime,
    extension: EXTENSIONS[detectedMime],
  };
}
