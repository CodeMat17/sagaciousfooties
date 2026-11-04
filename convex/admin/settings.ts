import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "../lib/authorization";
import { DEFAULT_SETTINGS, HERO_IMAGE_LIMIT, heroImageIds } from "../lib/present";
import {
  assertImageUpload,
  cleanOptional,
  cleanText,
  cleanUrl,
  normalizeWhatsappNumber,
} from "../lib/validation";

const session = { sessionToken: v.string() };

export const get = query({
  args: session,
  handler: async (ctx, { sessionToken }) => {
    await requireAdmin(ctx, sessionToken);
    const s = await ctx.db.query("settings").first();
    return {
      businessName: s?.businessName ?? DEFAULT_SETTINGS.businessName,
      tagline: s?.tagline ?? DEFAULT_SETTINGS.tagline,
      whatsappNumber: s?.whatsappNumber ?? DEFAULT_SETTINGS.whatsappNumber,
      contactEmail: s?.contactEmail ?? "",
      address: s?.address ?? DEFAULT_SETTINGS.address,
      openingHours: s?.openingHours ?? "",
      instagramUrl: s?.instagramUrl ?? "",
      facebookUrl: s?.facebookUrl ?? "",
      tiktokUrl: s?.tiktokUrl ?? "",
      deliveryInformation:
        s?.deliveryInformation ?? DEFAULT_SETTINGS.deliveryInformation,
      seoTitle: s?.seoTitle ?? DEFAULT_SETTINGS.seoTitle,
      seoDescription: s?.seoDescription ?? DEFAULT_SETTINGS.seoDescription,
      logoStorageId: s?.logoStorageId ?? null,
      logoUrl: s?.logoStorageId ? await ctx.storage.getUrl(s.logoStorageId) : null,
      heroImages: await Promise.all(
        heroImageIds(s).map(async (storageId) => ({
          storageId,
          url: await ctx.storage.getUrl(storageId),
        })),
      ),
      updatedAt: s?.updatedAt ?? null,
    };
  },
});

export const update = mutation({
  args: {
    ...session,
    businessName: v.string(),
    tagline: v.string(),
    whatsappNumber: v.string(),
    contactEmail: v.optional(v.string()),
    address: v.optional(v.string()),
    openingHours: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    facebookUrl: v.optional(v.string()),
    tiktokUrl: v.optional(v.string()),
    deliveryInformation: v.optional(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    heroImageStorageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, { sessionToken, ...input }) => {
    await requireAdmin(ctx, sessionToken);
    const existing = await ctx.db.query("settings").first();

    if (input.logoStorageId && input.logoStorageId !== existing?.logoStorageId) {
      await assertImageUpload(ctx, input.logoStorageId);
    }

    const heroIds = [...new Set(input.heroImageStorageIds)];
    if (heroIds.length > HERO_IMAGE_LIMIT) {
      throw new ConvexError(`Add at most ${HERO_IMAGE_LIMIT} hero photos.`);
    }
    const previousHeroIds = heroImageIds(existing);
    for (const id of heroIds) {
      if (!previousHeroIds.includes(id)) await assertImageUpload(ctx, id);
    }

    // Delete replaced files only after every new upload has been validated.
    if (existing?.logoStorageId && existing.logoStorageId !== input.logoStorageId) {
      await ctx.storage.delete(existing.logoStorageId);
    }
    for (const id of previousHeroIds) {
      if (!heroIds.includes(id)) await ctx.storage.delete(id);
    }

    const email = cleanOptional(input.contactEmail, "Contact email", 120);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ConvexError("Contact email is not valid.");
    }

    const doc = {
      businessName: cleanText(input.businessName, "Business name", {
        min: 2,
        max: 80,
      }),
      tagline: cleanText(input.tagline, "Tagline", { min: 2, max: 120 }),
      whatsappNumber: normalizeWhatsappNumber(input.whatsappNumber),
      contactEmail: email,
      address: cleanOptional(input.address, "Address", 300),
      openingHours: cleanOptional(input.openingHours, "Opening hours", 200),
      instagramUrl: cleanUrl(input.instagramUrl, "Instagram URL"),
      facebookUrl: cleanUrl(input.facebookUrl, "Facebook URL"),
      tiktokUrl: cleanUrl(input.tiktokUrl, "TikTok URL"),
      deliveryInformation: cleanOptional(
        input.deliveryInformation,
        "Delivery information",
        1000,
      ),
      seoTitle: cleanOptional(input.seoTitle, "SEO title", 120),
      seoDescription: cleanOptional(input.seoDescription, "SEO description", 300),
      logoStorageId: input.logoStorageId,
      heroImageStorageIds: heroIds,
      updatedAt: Date.now(),
    };
    if (existing) {
      await ctx.db.replace(existing._id, doc);
    } else {
      await ctx.db.insert("settings", doc);
    }
  },
});
