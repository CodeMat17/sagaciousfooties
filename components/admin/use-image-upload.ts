"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAdminToken } from "./admin-session";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_INPUT_BYTES = 25 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_DIMENSION = 2000;

export const IMAGE_ACCEPT = ACCEPTED.join(",");

/**
 * Downscales large phone photos in the browser before upload, so pages stay
 * fast and uploads work on slow mobile data.
 */
async function prepare(file: File): Promise<Blob> {
  if (!ACCEPTED.includes(file.type)) {
    throw new Error("Please choose a JPEG, PNG, WebP or AVIF image.");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("That image is too large (over 25 MB).");
  }
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= 1.5 * 1024 * 1024) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.86),
  );
  return blob ?? file;
}

export function useImageUpload() {
  const token = useAdminToken();
  const generateUploadUrl = useMutation(api.admin.files.generateUploadUrl);
  const [uploading, setUploading] = useState(0);

  async function upload(file: File): Promise<Id<"_storage">> {
    setUploading((n) => n + 1);
    try {
      const blob = await prepare(file);
      if (blob.size > MAX_UPLOAD_BYTES) {
        throw new Error("That image is still over 8 MB after compression.");
      }
      const url = await generateUploadUrl({ sessionToken: token });
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": blob.type || file.type },
        body: blob,
      });
      if (!response.ok) throw new Error("Upload failed. Please try again.");
      const json: unknown = await response.json();
      if (
        typeof json !== "object" ||
        json === null ||
        !("storageId" in json) ||
        typeof json.storageId !== "string"
      ) {
        throw new Error("Upload failed. Please try again.");
      }
      return json.storageId as Id<"_storage">;
    } finally {
      setUploading((n) => n - 1);
    }
  }

  return { upload, uploading: uploading > 0 };
}
