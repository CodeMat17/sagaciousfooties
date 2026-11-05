import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const availabilityValidator = v.union(
  v.literal("available"),
  v.literal("sold_out"),
);

export const audienceValidator = v.union(
  v.literal("men"),
  v.literal("women"),
  v.literal("unisex"),
);

export const enquiryStatusValidator = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("confirmed"),
  v.literal("completed"),
  v.literal("cancelled"),
);

export const productImageValidator = v.object({
  /** Cloudinary public ID. */
  publicId: v.string(),
  alt: v.string(),
});

export const productSizeValidator = v.object({
  size: v.number(),
  availability: availabilityValidator,
});

export const enquiryItemValidator = v.object({
  productId: v.id("products"),
  productName: v.string(),
  size: v.number(),
  quantity: v.number(),
  unitPrice: v.number(),
});

export default defineSchema({
  products: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    shortDescription: v.optional(v.string()),
    /** Whole naira. Never a float. */
    price: v.number(),
    categoryId: v.id("categories"),
    audience: audienceValidator,
    /** First image is the primary image. */
    images: v.array(productImageValidator),
    sizes: v.array(productSizeValidator),
    featured: v.boolean(),
    isNewArrival: v.boolean(),
    published: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["categoryId"])
    .index("by_published", ["published"])
    .index("by_updated_at", ["updatedAt"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    /** Cloudinary public ID. */
    imagePublicId: v.optional(v.string()),
    sortOrder: v.number(),
    published: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_sort_order", ["sortOrder"]),

  enquiries: defineTable({
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    items: v.array(enquiryItemValidator),
    totalAmount: v.number(),
    status: enquiryStatusValidator,
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  settings: defineTable({
    businessName: v.string(),
    tagline: v.string(),
    whatsappNumber: v.string(),
    contactEmail: v.optional(v.string()),
    address: v.optional(v.string()),
    openingHours: v.optional(v.string()),
    /** Cloudinary public ID. */
    logoPublicId: v.optional(v.string()),
    /** Homepage hero slideshow (Cloudinary public IDs), in display order (max HERO_IMAGE_LIMIT). */
    heroImagePublicIds: v.optional(v.array(v.string())),
    instagramUrl: v.optional(v.string()),
    facebookUrl: v.optional(v.string()),
    tiktokUrl: v.optional(v.string()),
    deliveryInformation: v.optional(v.string()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    updatedAt: v.number(),
  }),

  /** Singleton holding the salted PIN hash once the owner changes the PIN. */
  adminCredentials: defineTable({
    pinHash: v.string(),
    salt: v.string(),
    updatedAt: v.number(),
  }),

  adminSessions: defineTable({
    tokenHash: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_token_hash", ["tokenHash"]),

  loginAttempts: defineTable({
    key: v.string(),
    failures: v.number(),
    windowStart: v.number(),
    lockedUntil: v.optional(v.number()),
  }).index("by_key", ["key"]),
});
