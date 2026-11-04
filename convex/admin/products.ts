import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { requireAdmin } from "../lib/authorization";
import { isProductAvailable, resolveImages } from "../lib/present";
import {
  assertImageUpload,
  assertPrice,
  assertSize,
  assertSlug,
  cleanOptional,
  cleanText,
  ensureUniqueProductSlug,
} from "../lib/validation";
import {
  audienceValidator,
  availabilityValidator,
  productImageValidator,
  productSizeValidator,
} from "../schema";

const session = { sessionToken: v.string() };

export const list = query({
  args: session,
  handler: async (ctx, { sessionToken }) => {
    await requireAdmin(ctx, sessionToken);
    const [products, categories] = await Promise.all([
      ctx.db.query("products").withIndex("by_updated_at").order("desc").collect(),
      ctx.db.query("categories").collect(),
    ]);
    const categoryNames = new Map(categories.map((c) => [c._id, c.name]));
    return Promise.all(
      products.map(async (p) => ({
        _id: p._id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        audience: p.audience,
        categoryId: p.categoryId,
        categoryName: categoryNames.get(p.categoryId) ?? "Uncategorised",
        image: (await resolveImages(ctx, p.images, 1))[0] ?? null,
        sizes: p.sizes,
        available: isProductAvailable(p),
        featured: p.featured,
        isNewArrival: p.isNewArrival,
        published: p.published,
        updatedAt: p.updatedAt,
      })),
    );
  },
});

export const get = query({
  args: { ...session, id: v.id("products") },
  handler: async (ctx, { sessionToken, id }) => {
    await requireAdmin(ctx, sessionToken);
    const product = await ctx.db.get(id);
    if (!product) return null;
    const images = await Promise.all(
      product.images.map(async (image) => ({
        storageId: image.storageId,
        alt: image.alt,
        url: await ctx.storage.getUrl(image.storageId),
      })),
    );
    return { ...product, images };
  },
});

export const dashboard = query({
  args: session,
  handler: async (ctx, { sessionToken }) => {
    await requireAdmin(ctx, sessionToken);
    const products = await ctx.db
      .query("products")
      .withIndex("by_updated_at")
      .order("desc")
      .collect();
    const categories = await ctx.db.query("categories").collect();
    const enquiries = await ctx.db.query("enquiries").collect();
    const recent = await Promise.all(
      products.slice(0, 6).map(async (p) => ({
        _id: p._id,
        name: p.name,
        price: p.price,
        published: p.published,
        available: isProductAvailable(p),
        image: (await resolveImages(ctx, p.images, 1))[0] ?? null,
        updatedAt: p.updatedAt,
      })),
    );
    return {
      totals: {
        products: products.length,
        published: products.filter((p) => p.published).length,
        available: products.filter((p) => isProductAvailable(p)).length,
        soldOut: products.filter((p) => !isProductAvailable(p)).length,
        featured: products.filter((p) => p.featured).length,
        newArrivals: products.filter((p) => p.isNewArrival).length,
        categories: categories.length,
        openEnquiries: enquiries.filter(
          (e) => e.status === "new" || e.status === "contacted",
        ).length,
      },
      recent,
    };
  },
});

const productFields = {
  name: v.string(),
  slug: v.string(),
  description: v.string(),
  shortDescription: v.optional(v.string()),
  price: v.number(),
  categoryId: v.id("categories"),
  audience: audienceValidator,
  images: v.array(productImageValidator),
  sizes: v.array(productSizeValidator),
  featured: v.boolean(),
  isNewArrival: v.boolean(),
  published: v.boolean(),
};

type ProductInput = {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  sizes: Doc<"products">["sizes"];
  images: Doc<"products">["images"];
};

function cleanProduct(input: ProductInput) {
  const sizes = input.sizes.map((s) => ({
    size: assertSize(s.size),
    availability: s.availability,
  }));
  if (new Set(sizes.map((s) => s.size)).size !== sizes.length) {
    throw new ConvexError("Each size can only be listed once.");
  }
  if (input.images.length > 12) {
    throw new ConvexError("A product can have at most 12 images.");
  }
  return {
    name: cleanText(input.name, "Product name", { min: 2, max: 120 }),
    slug: assertSlug(input.slug),
    description: cleanText(input.description, "Description", { max: 5000 }),
    shortDescription: cleanOptional(
      input.shortDescription,
      "Short description",
      240,
    ),
    price: assertPrice(input.price),
    sizes: sizes.sort((a, b) => a.size - b.size),
    images: input.images.map((img) => ({
      storageId: img.storageId,
      alt: img.alt.trim().slice(0, 200),
    })),
  };
}

export const create = mutation({
  args: { ...session, ...productFields },
  handler: async (ctx, { sessionToken, ...input }) => {
    await requireAdmin(ctx, sessionToken);
    const clean = cleanProduct(input);
    await ensureUniqueProductSlug(ctx, clean.slug);
    if (!(await ctx.db.get(input.categoryId))) {
      throw new ConvexError("Choose a valid category.");
    }
    for (const image of clean.images) {
      await assertImageUpload(ctx, image.storageId);
    }
    if (input.published && clean.sizes.length === 0) {
      throw new ConvexError("Add at least one size before publishing.");
    }
    const now = Date.now();
    return ctx.db.insert("products", {
      ...clean,
      categoryId: input.categoryId,
      audience: input.audience,
      featured: input.featured,
      isNewArrival: input.isNewArrival,
      published: input.published,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: { ...session, id: v.id("products"), ...productFields },
  handler: async (ctx, { sessionToken, id, ...input }) => {
    await requireAdmin(ctx, sessionToken);
    const existing = await ctx.db.get(id);
    if (!existing) throw new ConvexError("This product no longer exists.");
    const clean = cleanProduct(input);
    await ensureUniqueProductSlug(ctx, clean.slug, id);
    if (!(await ctx.db.get(input.categoryId))) {
      throw new ConvexError("Choose a valid category.");
    }
    const previous = new Set(existing.images.map((i) => i.storageId));
    for (const image of clean.images) {
      if (!previous.has(image.storageId)) {
        await assertImageUpload(ctx, image.storageId);
      }
    }
    if (input.published && clean.sizes.length === 0) {
      throw new ConvexError("Add at least one size before publishing.");
    }
    // Delete files that were removed from the product.
    const kept = new Set(clean.images.map((i) => i.storageId));
    for (const image of existing.images) {
      if (!kept.has(image.storageId)) await ctx.storage.delete(image.storageId);
    }
    await ctx.db.patch(id, {
      ...clean,
      categoryId: input.categoryId,
      audience: input.audience,
      featured: input.featured,
      isNewArrival: input.isNewArrival,
      published: input.published,
      updatedAt: Date.now(),
    });
  },
});

export const setFlag = mutation({
  args: {
    ...session,
    id: v.id("products"),
    flag: v.union(
      v.literal("published"),
      v.literal("featured"),
      v.literal("isNewArrival"),
    ),
    value: v.boolean(),
  },
  handler: async (ctx, { sessionToken, id, flag, value }) => {
    await requireAdmin(ctx, sessionToken);
    const product = await ctx.db.get(id);
    if (!product) throw new ConvexError("This product no longer exists.");
    if (flag === "published" && value && product.sizes.length === 0) {
      throw new ConvexError("Add at least one size before publishing.");
    }
    await ctx.db.patch(id, { [flag]: value, updatedAt: Date.now() });
  },
});

export const setSizeAvailability = mutation({
  args: {
    ...session,
    id: v.id("products"),
    size: v.number(),
    availability: availabilityValidator,
  },
  handler: async (ctx, { sessionToken, id, size, availability }) => {
    await requireAdmin(ctx, sessionToken);
    const product = await ctx.db.get(id);
    if (!product) throw new ConvexError("This product no longer exists.");
    if (!product.sizes.some((s) => s.size === size)) {
      throw new ConvexError(`Size ${size} is not configured for this product.`);
    }
    await ctx.db.patch(id, {
      sizes: product.sizes.map((s) =>
        s.size === size ? { ...s, availability } : s,
      ),
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { ...session, id: v.id("products") },
  handler: async (ctx, { sessionToken, id }) => {
    await requireAdmin(ctx, sessionToken);
    const product = await ctx.db.get(id);
    if (!product) return;
    for (const image of product.images) {
      await ctx.storage.delete(image.storageId);
    }
    await ctx.db.delete(id);
  },
});
