"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
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

/**
 * Uploads straight from the browser to Cloudinary using parameters signed by
 * Convex. Resolves to the Cloudinary public ID, which is what gets persisted.
 */
export function useImageUpload() {
  const token = useAdminToken();
  const signUpload = useMutation(api.admin.files.signUpload);
  const [uploading, setUploading] = useState(0);

  async function upload(file: File): Promise<string> {
    setUploading((n) => n + 1);
    try {
      const blob = await prepare(file);
      if (blob.size > MAX_UPLOAD_BYTES) {
        throw new Error("That image is still over 8 MB after compression.");
      }
      const signed = await signUpload({ sessionToken: token });
      const form = new FormData();
      form.append("file", blob);
      form.append("api_key", signed.apiKey);
      form.append("timestamp", String(signed.timestamp));
      form.append("signature", signed.signature);
      form.append("folder", signed.folder);
      form.append("allowed_formats", signed.allowed_formats);
      const response = await fetch(signed.uploadUrl, { method: "POST", body: form });
      const json: unknown = await response.json().catch(() => null);
      if (
        !response.ok ||
        typeof json !== "object" ||
        json === null ||
        !("public_id" in json) ||
        typeof json.public_id !== "string"
      ) {
        const message =
          typeof json === "object" &&
          json !== null &&
          "error" in json &&
          typeof json.error === "object" &&
          json.error !== null &&
          "message" in json.error &&
          typeof json.error.message === "string"
            ? json.error.message
            : null;
        throw new Error(message ? `Upload failed: ${message}` : "Upload failed. Please try again.");
      }
      return json.public_id;
    } finally {
      setUploading((n) => n - 1);
    }
  }

  return { upload, uploading: uploading > 0 };
}
