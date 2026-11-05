import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "../lib/authorization";
import {
  assertPublicId,
  cloudinaryUrl,
  scheduleImageDeletion,
} from "../lib/cloudinary";
import {
  assertSlug,
  cleanOptional,
  cleanText,
  ensureUniqueCategorySlug,
} from "../lib/validation";

const session = { sessionToken: v.string() };

export const list = query({
  args: session,
  handler: async (ctx, { sessionToken }) => {
    await requireAdmin(ctx, sessionToken);
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_sort_order")
      .collect();
    const products = await ctx.db.query("products").collect();
    return Promise.all(
      categories.map(async (c) => ({
        _id: c._id,
        name: c.name,
        slug: c.slug,
        description: c.description ?? "",
        published: c.published,
        sortOrder: c.sortOrder,
        imagePublicId: c.imagePublicId ?? null,
        imageUrl: c.imagePublicId ? cloudinaryUrl(c.imagePublicId) : null,
        productCount: products.filter((p) => p.categoryId === c._id).length,
        updatedAt: c.updatedAt,
      })),
    );
  },
});

const fields = {
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  imagePublicId: v.optional(v.string()),
  published: v.boolean(),
};

export const create = mutation({
  args: { ...session, ...fields },
  handler: async (ctx, { sessionToken, ...input }) => {
    await requireAdmin(ctx, sessionToken);
    const slug = assertSlug(input.slug);
    await ensureUniqueCategorySlug(ctx, slug);
    if (input.imagePublicId) assertPublicId(input.imagePublicId);
    const last = await ctx.db
      .query("categories")
      .withIndex("by_sort_order")
      .order("desc")
      .first();
    const now = Date.now();
    return ctx.db.insert("categories", {
      name: cleanText(input.name, "Category name", { min: 2, max: 80 }),
      slug,
      description: cleanOptional(input.description, "Description", 500),
      imagePublicId: input.imagePublicId,
      published: input.published,
      sortOrder: (last?.sortOrder ?? 0) + 1,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: { ...session, id: v.id("categories"), ...fields },
  handler: async (ctx, { sessionToken, id, ...input }) => {
    await requireAdmin(ctx, sessionToken);
    const existing = await ctx.db.get(id);
    if (!existing) throw new ConvexError("This category no longer exists.");
    const slug = assertSlug(input.slug);
    await ensureUniqueCategorySlug(ctx, slug, id);
    if (input.imagePublicId) assertPublicId(input.imagePublicId);
    if (
      existing.imagePublicId &&
      existing.imagePublicId !== input.imagePublicId
    ) {
      await scheduleImageDeletion(ctx, [existing.imagePublicId]);
    }
    await ctx.db.patch(id, {
      name: cleanText(input.name, "Category name", { min: 2, max: 80 }),
      slug,
      description: cleanOptional(input.description, "Description", 500),
      imagePublicId: input.imagePublicId,
      published: input.published,
      updatedAt: Date.now(),
    });
  },
});

export const move = mutation({
  args: {
    ...session,
    id: v.id("categories"),
    direction: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, { sessionToken, id, direction }) => {
    await requireAdmin(ctx, sessionToken);
    const all = await ctx.db
      .query("categories")
      .withIndex("by_sort_order")
      .collect();
    const index = all.findIndex((c) => c._id === id);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapWith < 0 || swapWith >= all.length) return;
    const ordered = [...all];
    [ordered[index], ordered[swapWith]] = [ordered[swapWith], ordered[index]];
    await Promise.all(
      ordered.map((c, i) =>
        c.sortOrder === i + 1 ? null : ctx.db.patch(c._id, { sortOrder: i + 1 }),
      ),
    );
  },
});

/**
 * Deletes a category. If products still use it, the caller must pick a
 * category to move them to; nothing is orphaned silently.
 */
export const remove = mutation({
  args: {
    ...session,
    id: v.id("categories"),
    reassignTo: v.optional(v.id("categories")),
  },
  handler: async (ctx, { sessionToken, id, reassignTo }) => {
    await requireAdmin(ctx, sessionToken);
    const category = await ctx.db.get(id);
    if (!category) return;
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", id))
      .collect();
    if (products.length > 0) {
      if (!reassignTo || reassignTo === id) {
        throw new ConvexError(
          `${products.length} product(s) still use this category. Move them to another category first.`,
        );
      }
      if (!(await ctx.db.get(reassignTo))) {
        throw new ConvexError("The destination category no longer exists.");
      }
      const now = Date.now();
      for (const p of products) {
        await ctx.db.patch(p._id, { categoryId: reassignTo, updatedAt: now });
      }
    }
    if (category.imagePublicId) {
      await scheduleImageDeletion(ctx, [category.imagePublicId]);
    }
    await ctx.db.delete(id);
  },
});
