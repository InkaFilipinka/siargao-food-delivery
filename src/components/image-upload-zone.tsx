"use client";

import { useCallback, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";

interface ImageUploadZoneProps {
  slug: string;
  onUploaded: (url: string) => void;
  getAuthHeaders: () => Record<string, string>;
  disabled?: boolean;
  /** "logo" for logo upload (saved as slug-logo.ext, upserts). Default: food images. */
  type?: "food" | "logo";
}

export function ImageUploadZone({
  slug,
  onUploaded,
  getAuthHeaders,
  disabled,
  type = "food",
}: ImageUploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please drop an image file (jpg, png, webp, gif)");
        return;
      }
      setUploading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("slug", slug);
        if (type === "logo") formData.append("type", "logo");

        const res = await fetch("/api/admin/upload-restaurant-image", {
          method: "POST",
          headers: getAuthHeaders(),
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Upload failed");
        if (data.url) onUploaded(data.url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [slug, onUploaded, getAuthHeaders, type]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled || uploading) return;
      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile, disabled, uploading]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      e.target.value = "";
    },
    [uploadFile]
  );

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragging ? "border-primary bg-primary/5" : "border-slate-300 dark:border-slate-600"}
          ${disabled || uploading ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"}
        `}
      >
        <input
          id={`image-upload-${slug}-${type}`}
          name="restaurantImage"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileInput}
          disabled={disabled || uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={`Upload ${type === "logo" ? "logo" : "food"} image for ${slug}`}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-slate-600 dark:text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">Uploading…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-600 dark:text-slate-400">
            <Upload className="w-8 h-8" />
            <span className="text-sm font-medium">Drag image here or click to browse</span>
            <span className="text-xs">jpg, png, webp, gif (max 5MB)</span>
            <span className="text-xs text-slate-500">
              {type === "logo" ? `Saved as ${slug}-logo` : `Saved as ${slug}-1, ${slug}-2, …`}
            </span>
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <X className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
