import { ConvexError } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function cleanText(
  value: string,
  field: string,
  { min = 0, max }: { min?: number; max: number },
): string {
  const trimmed = value.trim();
  if (trimmed.length < min) {
    throw new ConvexError(`${field} is required.`);
  }
  if (trimmed.length > max) {
    throw new ConvexError(`${field} must be at most ${max} characters.`);
  }
  return trimmed;
}

export function cleanOptional(
  value: string | undefined,
  field: string,
  max: number,
): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  if (trimmed.length > max) {
    throw new ConvexError(`${field} must be at most ${max} characters.`);
  }
  return trimmed;
}

export function cleanUrl(
  value: string | undefined,
  field: string,
): string | undefined {
  const trimmed = cleanOptional(value, field, 300);
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
    return url.toString();
  } catch {
    throw new ConvexError(`${field} must be a valid web address.`);
  }
}

export function assertSlug(slug: string): string {
  const clean = slugify(slug);
  if (clean.length < 2) {
    throw new ConvexError("Slug must contain at least two letters or numbers.");
  }
  return clean;
}

export function assertPrice(price: number): number {
  if (!Number.isInteger(price) || price <= 0 || price > 100_000_000) {
    throw new ConvexError("Price must be a positive whole number of naira.");
  }
  return price;
}

export function assertQuantity(quantity: number): number {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10_000) {
    throw new ConvexError("Quantity must be a whole number of at least 1.");
  }
  return quantity;
}

export function assertSize(size: number): number {
  if (!Number.isFinite(size) || size < 10 || size > 60) {
    throw new ConvexError("Sizes must be between 10 and 60.");
  }
  // Allow half sizes only.
  if (Math.round(size * 2) !== size * 2) {
    throw new ConvexError("Sizes may only use whole or half numbers.");
  }
  return size;
}

export function normalizeWhatsappNumber(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11) {
    digits = `234${digits.slice(1)}`;
  }
  if (digits.length < 10 || digits.length > 15) {
    throw new ConvexError(
      "WhatsApp number must be a valid phone number, e.g. 2347044663337.",
    );
  }
  return digits;
}

/** Verifies an uploaded file is a reasonably sized image. */
export async function assertImageUpload(
  ctx: MutationCtx,
  storageId: Id<"_storage">,
): Promise<void> {
  const meta = await ctx.db.system.get(storageId);
  if (!meta) {
    throw new ConvexError("Uploaded image could not be found. Please retry.");
  }
  if (!meta.contentType || !ALLOWED_IMAGE_TYPES.includes(meta.contentType)) {
    await ctx.storage.delete(storageId);
    throw new ConvexError("Images must be JPEG, PNG, WebP or AVIF.");
  }
  if (meta.size > MAX_IMAGE_BYTES) {
    await ctx.storage.delete(storageId);
    throw new ConvexError("Images must be 8 MB or smaller.");
  }
}

export async function ensureUniqueProductSlug(
  ctx: QueryCtx,
  slug: string,
  ignoreId?: Id<"products">,
): Promise<void> {
  const existing = await ctx.db
    .query("products")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
  if (existing && existing._id !== ignoreId) {
    throw new ConvexError(`Another product already uses the slug "${slug}".`);
  }
}

export async function ensureUniqueCategorySlug(
  ctx: QueryCtx,
  slug: string,
  ignoreId?: Id<"categories">,
): Promise<void> {
  const existing = await ctx.db
    .query("categories")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
  if (existing && existing._id !== ignoreId) {
    throw new ConvexError(`Another category already uses the slug "${slug}".`);
  }
}
