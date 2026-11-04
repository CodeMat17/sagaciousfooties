import { internalMutation } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { DEFAULT_SETTINGS } from "./lib/present";

type Size = Doc<"products">["sizes"][number];

const sizes = (from: number, to: number, soldOut: number[] = []): Size[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i).map((size) => ({
    size,
    availability: soldOut.includes(size) ? "sold_out" : "available",
  }));

/**
 * Seeds starter categories, settings and SAMPLE products so the storefront
 * has content on day one. Sample products have no photos; replace or delete
 * them from /admin/products. Safe to run more than once.
 *
 *   npx convex run seed:run
 */
export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    if (!(await ctx.db.query("settings").first())) {
      await ctx.db.insert("settings", {
        businessName: DEFAULT_SETTINGS.businessName,
        tagline: DEFAULT_SETTINGS.tagline,
        whatsappNumber: DEFAULT_SETTINGS.whatsappNumber,
        address: DEFAULT_SETTINGS.address,
        deliveryInformation: DEFAULT_SETTINGS.deliveryInformation,
        seoTitle: DEFAULT_SETTINGS.seoTitle,
        seoDescription: DEFAULT_SETTINGS.seoDescription,
        updatedAt: now,
      });
    }

    const categorySeeds = [
      {
        name: "Men's Sandals",
        slug: "mens-sandals",
        description:
          "Bold, structured sandals hand-finished for the modern gentleman.",
      },
      {
        name: "Women's Sandals",
        slug: "womens-sandals",
        description:
          "Graceful silhouettes and soft straps, crafted for all-day elegance.",
      },
      {
        name: "Unisex Designs",
        slug: "unisex-designs",
        description: "Easy, versatile pairs designed to be worn by anyone.",
      },
    ];

    const categoryIds: Record<string, Doc<"categories">["_id"]> = {};
    for (const [index, seed] of categorySeeds.entries()) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", seed.slug))
        .first();
      categoryIds[seed.slug] =
        existing?._id ??
        (await ctx.db.insert("categories", {
          ...seed,
          sortOrder: index + 1,
          published: true,
          createdAt: now,
          updatedAt: now,
        }));
    }

    if (await ctx.db.query("products").first()) {
      return "Settings and categories ensured; products already exist.";
    }

    const products: Array<
      Omit<Doc<"products">, "_id" | "_creationTime" | "createdAt" | "updatedAt"> & {
        age: number;
      }
    > = [
      {
        name: "Sample — The Aba Classic",
        slug: "the-aba-classic",
        shortDescription: "Twin-strap leather sandal with a buckled finish.",
        description:
          "A sample listing to show how products appear. Replace it with your own photos, description and price from the admin dashboard.\n\nTwin straps, an adjustable brass-tone buckle and a cushioned footbed make this an everyday essential.",
        price: 25000,
        categoryId: categoryIds["mens-sandals"],
        audience: "men",
        images: [],
        sizes: sizes(39, 46, [46]),
        featured: true,
        isNewArrival: false,
        published: true,
        age: 9,
      },
      {
        name: "Sample — Heritage Cross Strap",
        slug: "heritage-cross-strap",
        shortDescription: "Crossed straps with hand-stitched edges.",
        description:
          "A sample listing. Crossed straps and hand-stitched edges give this pair a confident, tailored look for weekends and occasions.",
        price: 28000,
        categoryId: categoryIds["mens-sandals"],
        audience: "men",
        images: [],
        sizes: sizes(40, 45),
        featured: true,
        isNewArrival: true,
        published: true,
        age: 2,
      },
      {
        name: "Sample — Executive Slide",
        slug: "executive-slide",
        shortDescription: "A clean, broad-strap slide.",
        description:
          "A sample listing. A clean single-band slide with a firm sole, made to pair with native wear or casual looks.",
        price: 18000,
        categoryId: categoryIds["mens-sandals"],
        audience: "men",
        images: [],
        sizes: sizes(39, 46, [39, 40]),
        featured: false,
        isNewArrival: true,
        published: true,
        age: 1,
      },
      {
        name: "Sample — Amara Woven Sandal",
        slug: "amara-woven-sandal",
        shortDescription: "Woven straps with a soft, flexible sole.",
        description:
          "A sample listing. Woven straps and a soft, flexible sole for light, elegant days out.",
        price: 22000,
        categoryId: categoryIds["womens-sandals"],
        audience: "women",
        images: [],
        sizes: sizes(36, 42),
        featured: true,
        isNewArrival: true,
        published: true,
        age: 3,
      },
      {
        name: "Sample — Adaeze Ankle Strap",
        slug: "adaeze-ankle-strap",
        shortDescription: "A refined ankle-strap flat.",
        description:
          "A sample listing. A refined ankle strap and slim sole for dinners, church and celebrations.",
        price: 24000,
        categoryId: categoryIds["womens-sandals"],
        audience: "women",
        images: [],
        sizes: sizes(36, 41, [36]),
        featured: false,
        isNewArrival: false,
        published: true,
        age: 12,
      },
      {
        name: "Sample — Ivory Minimal Slide",
        slug: "ivory-minimal-slide",
        shortDescription: "A soft, minimal slide.",
        description:
          "A sample listing. Minimal lines and a comfortable footbed make this an easy everyday slide.",
        price: 16500,
        categoryId: categoryIds["womens-sandals"],
        audience: "women",
        images: [],
        sizes: sizes(36, 42, [36, 37, 38, 39, 40, 41, 42]),
        featured: false,
        isNewArrival: false,
        published: true,
        age: 20,
      },
      {
        name: "Sample — Artisan Everyday",
        slug: "artisan-everyday",
        shortDescription: "A versatile unisex sandal.",
        description:
          "A sample listing. A versatile, easy-going sandal that works for everyone.",
        price: 20000,
        categoryId: categoryIds["unisex-designs"],
        audience: "unisex",
        images: [],
        sizes: sizes(37, 45),
        featured: true,
        isNewArrival: false,
        published: true,
        age: 6,
      },
    ];

    const day = 24 * 60 * 60 * 1000;
    for (const { age, ...product } of products) {
      await ctx.db.insert("products", {
        ...product,
        createdAt: now - age * day,
        updatedAt: now - age * day,
      });
    }
    return `Seeded ${products.length} sample products.`;
  },
});

/**
 * Refreshes SEO copy on the settings row to include the unisex collection,
 * only if the owner hasn't customised it.  npx convex run seed:refreshSeoCopy
 */
export const refreshSeoCopy = internalMutation({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    if (!settings) return "No settings row.";
    const patch: { seoTitle?: string; seoDescription?: string } = {};
    if (settings.seoTitle?.endsWith("for Men & Women")) patch.seoTitle = DEFAULT_SETTINGS.seoTitle;
    if (settings.seoDescription?.includes("sandals for men and women at Sagacious Footies")) {
      patch.seoDescription = DEFAULT_SETTINGS.seoDescription;
    }
    if (Object.keys(patch).length === 0) return "Nothing to update.";
    await ctx.db.patch(settings._id, { ...patch, updatedAt: Date.now() });
    return "SEO copy updated.";
  },
});
