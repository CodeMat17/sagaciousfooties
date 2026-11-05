import { ConvexError } from "convex/values";
import { internal } from "../_generated/api";
import type { MutationCtx } from "../_generated/server";
import { sha1Hex } from "./crypto";

/** Cloudinary folder every upload from the admin goes into. */
export const CLOUDINARY_FOLDER = "sagacious-footies";
/** Enforced by Cloudinary because it is part of the signed upload params. */
export const CLOUDINARY_ALLOWED_FORMATS = "avif,jpg,png,webp";

const PUBLIC_ID = /^[A-Za-z0-9_\-/]{1,255}$/;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new ConvexError(
      `Image uploads are not configured: set ${name} on Convex (npx convex env set ${name} …).`,
    );
  }
  return value;
}

export function cloudinaryConfig() {
  return {
    cloudName: requireEnv("CLOUDINARY_CLOUD_NAME"),
    apiKey: requireEnv("CLOUDINARY_API_KEY"),
    apiSecret: requireEnv("CLOUDINARY_API_SECRET"),
  };
}

/**
 * Cloudinary API signature: params sorted by key, joined as k=v&k=v, with the
 * API secret appended, then SHA-1. (file, api_key, resource_type excluded.)
 */
export function signParams(
  params: Record<string, string | number>,
  apiSecret: string,
): Promise<string> {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return sha1Hex(toSign + apiSecret);
}

/**
 * Public delivery URL for an uploaded image. Returns null when the cloud name
 * is not configured so public pages degrade to placeholders instead of erroring.
 */
export function cloudinaryUrl(publicId: string): string | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return null;
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${publicId}`;
}

/** Rejects anything that is not a plain Cloudinary public ID. */
export function assertPublicId(publicId: string): string {
  if (!PUBLIC_ID.test(publicId) || publicId.includes("..")) {
    throw new ConvexError("That image reference is not valid. Please re-upload it.");
  }
  return publicId;
}

/** Deletes images from Cloudinary after the current mutation commits. */
export async function scheduleImageDeletion(
  ctx: MutationCtx,
  publicIds: Iterable<string>,
): Promise<void> {
  const unique = [...new Set(publicIds)];
  if (unique.length === 0) return;
  await ctx.scheduler.runAfter(0, internal.cloudinary.destroy, {
    publicIds: unique,
  });
}
