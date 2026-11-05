import { query } from "./_generated/server";
import { cloudinaryUrl } from "./lib/cloudinary";
import { DEFAULT_SETTINGS, heroImageIds } from "./lib/present";

/** Public store settings. Only fields intended for display are returned. */
export const getPublic = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    const logoUrl = settings?.logoPublicId
      ? cloudinaryUrl(settings.logoPublicId)
      : null;
    const heroImageUrls = heroImageIds(settings)
      .map((id) => cloudinaryUrl(id))
      .filter((url): url is string => url !== null);
    return {
      businessName: settings?.businessName ?? DEFAULT_SETTINGS.businessName,
      tagline: settings?.tagline ?? DEFAULT_SETTINGS.tagline,
      whatsappNumber:
        settings?.whatsappNumber ?? DEFAULT_SETTINGS.whatsappNumber,
      contactEmail: settings?.contactEmail ?? null,
      address: settings?.address ?? DEFAULT_SETTINGS.address,
      openingHours: settings?.openingHours ?? null,
      instagramUrl: settings?.instagramUrl ?? null,
      facebookUrl: settings?.facebookUrl ?? null,
      tiktokUrl: settings?.tiktokUrl ?? null,
      deliveryInformation:
        settings?.deliveryInformation ?? DEFAULT_SETTINGS.deliveryInformation,
      seoTitle: settings?.seoTitle ?? DEFAULT_SETTINGS.seoTitle,
      seoDescription: settings?.seoDescription ?? DEFAULT_SETTINGS.seoDescription,
      logoUrl,
      heroImageUrls,
    };
  },
});
