import type { Audience } from "@/lib/constants";

/**
 * Stand-in sandal photos (Unsplash licence) shown until the owner uploads
 * their own from the admin dashboard. Each slot is replaced automatically:
 * - hero slideshow: Settings → "Homepage hero photos"
 * - collection tiles: the first product photo in that collection
 * - a product: as soon as that product has at least one photo
 *
 * To retire them, delete `public/images/stock/` and this file's usages.
 */
export type StockImage = { url: string; alt: string };

export const STOCK_IMAGES = {
  hero: {
    url: "/images/stock/hero.jpg",
    alt: "Black leather slides with a tan cross strap",
  },
  men: {
    url: "/images/stock/men.jpg",
    alt: "Man wearing black two-strap leather sandals",
  },
  women: {
    url: "/images/stock/women.jpg",
    alt: "Tan cross-strap leather sandals",
  },
  unisex: {
    url: "/images/stock/unisex.jpg",
    alt: "Black buckled leather sandals with cork soles",
  },
} as const satisfies Record<string, StockImage>;

/** Stand-in hero slideshow, shown until the owner uploads hero photos. */
export const STOCK_HERO_IMAGES: StockImage[] = [
  STOCK_IMAGES.hero,
  STOCK_IMAGES.women,
  STOCK_IMAGES.men,
  { url: "/images/stock/unisex-2.jpg", alt: "Tan suede two-buckle sandals" },
  { url: "/images/stock/women-3.jpg", alt: "Beige strappy heeled sandals" },
];

/** A few photos per audience, so a grid of photo-less products isn't uniform. */
const STOCK_PRODUCT_IMAGES: Record<Audience, StockImage[]> = {
  men: [
    STOCK_IMAGES.men,
    STOCK_IMAGES.hero,
    { url: "/images/stock/men-2.jpg", alt: "Brown leather T-strap sandals on a wooden floor" },
  ],
  women: [
    STOCK_IMAGES.women,
    { url: "/images/stock/women-2.jpg", alt: "Embellished tan flat sandals with toe rings" },
    { url: "/images/stock/women-3.jpg", alt: "Beige strappy heeled sandals" },
  ],
  unisex: [
    STOCK_IMAGES.unisex,
    { url: "/images/stock/unisex-2.jpg", alt: "Tan suede two-buckle sandals" },
    { url: "/images/stock/unisex-3.jpg", alt: "Black buckled cork-sole sandals on grass" },
  ],
};

/** Stable pick per product, so a product always shows the same stand-in. */
export function stockProductImage(id: string, audience: Audience): StockImage {
  const pool = STOCK_PRODUCT_IMAGES[audience] ?? STOCK_PRODUCT_IMAGES.unisex;
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return pool[hash % pool.length];
}

/** The product's own photos, or a single stand-in when it has none yet. */
export function displayImages<T extends StockImage>(product: {
  _id: string;
  audience: Audience;
  images: T[];
}): Array<T | StockImage> {
  return product.images.length > 0
    ? product.images
    : [stockProductImage(product._id, product.audience)];
}
