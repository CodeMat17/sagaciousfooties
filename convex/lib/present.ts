import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export const DEFAULT_SETTINGS = {
  businessName: "Sagacious Footies",
  tagline: "Step in Style",
  whatsappNumber: "2347044663337",
  address:
    "Shop B7/7 Onyeahalanwaneeya Line, Shoe Plaza, Ariaria International Market, Aba, Abia State, Nigeria",
  deliveryInformation:
    "Delivery arrangements and any applicable delivery charges are confirmed with you on WhatsApp after you send your order.",
  seoTitle: "Sagacious Footies | Premium Handcrafted Sandals for Men, Women & Unisex",
  seoDescription:
    "Discover stylish handcrafted men's, women's and unisex sandals at Sagacious Footies. Explore unique designs, check available sizes and order conveniently through WhatsApp.",
} as const;

export const HERO_IMAGE_LIMIT = 5;

/** Hero photo ids in display order, including the legacy single-photo field. */
export function heroImageIds(
  settings: Pick<Doc<"settings">, "heroImageStorageId" | "heroImageStorageIds"> | null,
) {
  if (!settings) return [];
  if (settings.heroImageStorageIds) return settings.heroImageStorageIds;
  return settings.heroImageStorageId ? [settings.heroImageStorageId] : [];
}

export function isProductAvailable(product: Pick<Doc<"products">, "sizes">) {
  return product.sizes.some((s) => s.availability === "available");
}

export async function resolveImages(
  ctx: QueryCtx,
  images: Doc<"products">["images"],
  limit?: number,
) {
  const subset = limit === undefined ? images : images.slice(0, limit);
  const resolved = await Promise.all(
    subset.map(async (image) => {
      const url = await ctx.storage.getUrl(image.storageId);
      return url ? { url, alt: image.alt } : null;
    }),
  );
  return resolved.filter(
    (image): image is { url: string; alt: string } => image !== null,
  );
}

export async function presentProductCard(
  ctx: QueryCtx,
  product: Doc<"products">,
  categories: Map<string, Doc<"categories">>,
) {
  const category = categories.get(product.categoryId);
  return {
    _id: product._id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription ?? null,
    price: product.price,
    audience: product.audience,
    category:
      category && category.published
        ? { name: category.name, slug: category.slug }
        : null,
    images: await resolveImages(ctx, product.images, 2),
    sizes: product.sizes,
    available: isProductAvailable(product),
    featured: product.featured,
    isNewArrival: product.isNewArrival,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export async function loadCategoryMap(ctx: QueryCtx) {
  const categories = await ctx.db.query("categories").collect();
  return new Map(categories.map((c) => [c._id as string, c]));
}
