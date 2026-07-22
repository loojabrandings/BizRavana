"use client";

import { useRef } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── ImageItem type ──────────────────────────────────────────
export interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  uploadedUrl?: string;
  uploading?: boolean;
}

const MAX_IMAGE_DIMENSION = 1200;
const JPEG_QUALITY = 0.8;

export function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > MAX_IMAGE_DIMENSION) {
          height = (height / width) * MAX_IMAGE_DIMENSION;
          width = MAX_IMAGE_DIMENSION;
        } else if (height > MAX_IMAGE_DIMENSION) {
          width = (width / height) * MAX_IMAGE_DIMENSION;
          height = MAX_IMAGE_DIMENSION;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Could not get canvas context")); return; }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => { if (blob) resolve(blob); else reject(new Error("Canvas toBlob failed")); },
          "image/jpeg", JPEG_QUALITY,
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// ─── Props ──────────────────────────────────────────────────
interface ImageUploadProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  businessId?: string | null;
  orderId?: string | null;
  disabled?: boolean;
}

// ─── Component ──────────────────────────────────────────────
export function ImageUpload({
  images,
  onChange,
  disabled,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((f) =>
      ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(f.type),
    );
    if (validFiles.length !== files.length) {
      toast.error("Some files were skipped (only images are accepted)");
    }

    const newItems: ImageItem[] = validFiles.map((file) => ({
      id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    onChange([...images, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = (id: string) => {
    const item = images.find((i) => i.id === id);
    if (item?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl);
    onChange(images.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-secondary-foreground">Images</p>
        <p className="text-xs text-muted-foreground">
          {images.length} file{images.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((item) => (
            <div key={item.id} className="group relative size-20 overflow-hidden rounded-xl border border-border/60 bg-muted/30">
              <img src={item.previewUrl} alt="" className="size-full object-cover" />
              {item.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
              {!item.uploading && (
                <button type="button" onClick={() => handleRemove(item.id)} disabled={disabled}
                  className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── Label triggers the internal hidden file input ─── */}
      {/* ─── Label wraps the hidden file input (most reliable trigger) ─── */}
      <label
        className={cn(
          "flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 text-sm font-medium text-muted-foreground transition-all",
          "hover:border-primary/40 hover:text-primary hover:bg-primary/5",
          disabled && "pointer-events-none cursor-not-allowed opacity-50",
        )}
      >
        <Upload className="size-4" />
        Add images
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      <p className="text-xs text-muted-foreground/60">
        Images are compressed to max {MAX_IMAGE_DIMENSION}px and saved as JPEG.
      </p>
    </div>
  );
}
