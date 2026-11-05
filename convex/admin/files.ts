import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireAdmin } from "../lib/authorization";
import {
  CLOUDINARY_ALLOWED_FORMATS,
  CLOUDINARY_FOLDER,
  assertPublicId,
  cloudinaryConfig,
  scheduleImageDeletion,
  signParams,
} from "../lib/cloudinary";
import { heroImageIds } from "../lib/present";

/**
 * Short-lived signed parameters so the admin's browser can upload straight to
 * Cloudinary. The API secret never leaves Convex.
 */
export const signUpload = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    await requireAdmin(ctx, sessionToken);
    const { cloudName, apiKey, apiSecret } = cloudinaryConfig();
    const params = {
      allowed_formats: CLOUDINARY_ALLOWED_FORMATS,
      folder: CLOUDINARY_FOLDER,
      timestamp: Math.floor(Date.now() / 1000),
    };
    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      apiKey,
      ...params,
      signature: await signParams(params, apiSecret),
    };
  },
});

/** Discards an upload that was never attached to a document. */
export const discardUpload = mutation({
  args: { sessionToken: v.string(), publicId: v.string() },
  handler: async (ctx, { sessionToken, publicId }) => {
    await requireAdmin(ctx, sessionToken);
    assertPublicId(publicId);
    const [product, category, settings] = await Promise.all([
      ctx.db.query("products").collect(),
      ctx.db.query("categories").collect(),
      ctx.db.query("settings").first(),
    ]);
    const inUse =
      product.some((p) => p.images.some((i) => i.publicId === publicId)) ||
      category.some((c) => c.imagePublicId === publicId) ||
      settings?.logoPublicId === publicId ||
      heroImageIds(settings).includes(publicId);
    if (!inUse) await scheduleImageDeletion(ctx, [publicId]);
  },
});
