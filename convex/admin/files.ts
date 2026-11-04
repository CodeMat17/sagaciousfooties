import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireAdmin } from "../lib/authorization";
import { heroImageIds } from "../lib/present";

/** Short-lived upload URL. The resulting storageId is what gets persisted. */
export const generateUploadUrl = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    await requireAdmin(ctx, sessionToken);
    return ctx.storage.generateUploadUrl();
  },
});

/** Discards an upload that was never attached to a document. */
export const discardUpload = mutation({
  args: { sessionToken: v.string(), storageId: v.id("_storage") },
  handler: async (ctx, { sessionToken, storageId }) => {
    await requireAdmin(ctx, sessionToken);
    const [product, category, settings] = await Promise.all([
      ctx.db.query("products").collect(),
      ctx.db.query("categories").collect(),
      ctx.db.query("settings").first(),
    ]);
    const inUse =
      product.some((p) => p.images.some((i) => i.storageId === storageId)) ||
      category.some((c) => c.imageStorageId === storageId) ||
      settings?.logoStorageId === storageId ||
      heroImageIds(settings).includes(storageId);
    if (!inUse && (await ctx.db.system.get(storageId))) {
      await ctx.storage.delete(storageId);
    }
  },
});
