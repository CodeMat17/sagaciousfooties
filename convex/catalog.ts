import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import {
  isProductAvailable,
  loadCategoryMap,
  presentProductCard,
  resolveImages,
} from "./lib/present";

/** All published products, newest first, as lightweight card data. */
export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const [products, categories] = await Promise.all([
      ctx.db
        .query("products")
        .withIndex("by_published", (q) => q.eq("published", true))
        .collect(),
      loadCategoryMap(ctx),
    ]);
    products.sort((a, b) => b.createdAt - a.createdAt);
    return Promise.all(
      products.map((p) => presentProductCard(ctx, p, categories)),
    );
  },
});

/** Full product detail for the public product page. */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!product || !product.published) return null;

    const category = await ctx.db.get(product.categoryId);
    return {
      _id: product._id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription ?? null,
      price: product.price,
      audience: product.audience,
      category:
        category && category.published
          ? { _id: category._id, name: category.name, slug: category.slug }
          : null,
      images: await resolveImages(ctx, product.images),
      sizes: [...product.sizes].sort((a, b) => a.size - b.size),
      available: isProductAvailable(product),
      featured: product.featured,
      isNewArrival: product.isNewArrival,
      updatedAt: product.updatedAt,
    };
  },
});

/** Related published products: same category first, then same audience. */
export const listRelated = query({
  args: { productId: v.id("products"), limit: v.optional(v.number()) },
  handler: async (ctx, { productId, limit }) => {
    const max = Math.min(Math.max(limit ?? 4, 1), 8);
    const product = await ctx.db.get(productId);
    if (!product) return [];
    const categories = await loadCategoryMap(ctx);

    const sameCategory = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", product.categoryId))
      .collect();
    let picks = sameCategory.filter(
      (p) => p.published && p._id !== product._id,
    );
    if (picks.length < max) {
      const rest = await ctx.db
        .query("products")
        .withIndex("by_published", (q) => q.eq("published", true))
        .collect();
      const seen = new Set(picks.map((p) => p._id));
      picks = picks.concat(
        rest.filter(
          (p) =>
            p._id !== product._id &&
            !seen.has(p._id) &&
            (p.audience === product.audience || p.audience === "unisex"),
        ),
      );
    }
    picks.sort(
      (a, b) =>
        Number(isProductAvailable(b)) - Number(isProductAvailable(a)) ||
        b.createdAt - a.createdAt,
    );
    return Promise.all(
      picks.slice(0, max).map((p) => presentProductCard(ctx, p, categories)),
    );
  },
});

/**
 * Current, authoritative data for the items in a customer's selection.
 * IDs come from localStorage and are therefore untrusted strings.
 */
export const getSelectionProducts = query({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, { ids }) => {
    const unique = Array.from(new Set(ids)).slice(0, 100);
    const results: Array<{
      requestedId: string;
      product: {
        _id: Id<"products">;
        name: string;
        slug: string;
        price: number;
        audience: Doc<"products">["audience"];
        image: { url: string; alt: string } | null;
        sizes: Doc<"products">["sizes"];
      } | null;
    }> = [];
    for (const requestedId of unique) {
      const id = ctx.db.normalizeId("products", requestedId);
      const product = id ? await ctx.db.get(id) : null;
      if (!product || !product.published) {
        results.push({ requestedId, product: null });
        continue;
      }
      const [image] = await resolveImages(ctx, product.images, 1);
      results.push({
        requestedId,
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          audience: product.audience,
          image: image ?? null,
          sizes: [...product.sizes].sort((a, b) => a.size - b.size),
        },
      });
    }
    return results;
  },
});

export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_sort_order")
      .collect();
    const published = categories.filter((c) => c.published);
    const products = await ctx.db
      .query("products")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    return Promise.all(
      published.map(async (category) => {
        const inCategory = products.filter(
          (p) => p.categoryId === category._id,
        );
        let imageUrl = category.imageStorageId
          ? await ctx.storage.getUrl(category.imageStorageId)
          : null;
        if (!imageUrl) {
          const withImage = inCategory.find((p) => p.images.length > 0);
          imageUrl = withImage
            ? await ctx.storage.getUrl(withImage.images[0].storageId)
            : null;
        }
        return {
          _id: category._id,
          name: category.name,
          slug: category.slug,
          description: category.description ?? null,
          imageUrl,
          productCount: inCategory.length,
        };
      }),
    );
  },
});

export const getCategoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!category || !category.published) return null;
    return {
      _id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? null,
      imageUrl: category.imageStorageId
        ? await ctx.storage.getUrl(category.imageStorageId)
        : null,
    };
  },
});

/** Minimal data for sitemap.xml. Published content only. */
export const sitemapEntries = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();
    const categories = (await ctx.db.query("categories").collect()).filter(
      (c) => c.published,
    );
    return {
      products: products.map((p) => ({ slug: p.slug, updatedAt: p.updatedAt })),
      categories: categories.map((c) => ({
        slug: c.slug,
        updatedAt: c.updatedAt,
      })),
    };
  },
});
