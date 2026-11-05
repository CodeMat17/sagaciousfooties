import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { cloudinaryUrl } from "./cloudinary";

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

/** Hero photo public IDs in display order. */
export function heroImageIds(
  settings: Pick<Doc<"settings">, "heroImagePublicIds"> | null,
): string[] {
  return settings?.heroImagePublicIds ?? [];
}

export function isProductAvailable(product: Pick<Doc<"products">, "sizes">) {
  return product.sizes.some((s) => s.availability === "available");
}

export function resolveImages(
  images: Doc<"products">["images"],
  limit?: number,
) {
  const subset = limit === undefined ? images : images.slice(0, limit);
  const resolved = subset.map((image) => {
    const url = cloudinaryUrl(image.publicId);
    return url ? { url, alt: image.alt } : null;
  });
  return resolved.filter(
    (image): image is { url: string; alt: string } => image !== null,
  );
}

export function presentProductCard(
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
    images: resolveImages(product.images, 2),
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
