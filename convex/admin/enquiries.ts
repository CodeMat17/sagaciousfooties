import { ConvexError, v, type Infer } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireAdmin } from "../lib/authorization";
import {
  assertPrice,
  assertQuantity,
  assertSize,
  cleanOptional,
  cleanText,
} from "../lib/validation";
import { enquiryItemValidator, enquiryStatusValidator } from "../schema";

const session = { sessionToken: v.string() };

export const list = query({
  args: { ...session, status: v.optional(enquiryStatusValidator) },
  handler: async (ctx, { sessionToken, status }) => {
    await requireAdmin(ctx, sessionToken);
    if (status) {
      const rows = await ctx.db
        .query("enquiries")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
      return rows.sort((a, b) => b.createdAt - a.createdAt);
    }
    return ctx.db
      .query("enquiries")
      .withIndex("by_created_at")
      .order("desc")
      .collect();
  },
});

const fields = {
  customerName: v.optional(v.string()),
  customerPhone: v.optional(v.string()),
  items: v.array(enquiryItemValidator),
  status: enquiryStatusValidator,
  notes: v.optional(v.string()),
};

type ItemInput = Infer<typeof enquiryItemValidator>;

function cleanItems(items: ItemInput[]) {
  if (items.length === 0) {
    throw new ConvexError("Add at least one product to the enquiry.");
  }
  if (items.length > 50) throw new ConvexError("Too many line items.");
  const clean = items.map((item) => ({
    productId: item.productId,
    productName: cleanText(item.productName, "Product name", { min: 1, max: 120 }),
    size: assertSize(item.size),
    quantity: assertQuantity(item.quantity),
    unitPrice: assertPrice(item.unitPrice),
  }));
  const totalAmount = clean.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  return { items: clean, totalAmount };
}

export const create = mutation({
  args: { ...session, ...fields },
  handler: async (ctx, { sessionToken, ...input }) => {
    await requireAdmin(ctx, sessionToken);
    const { items, totalAmount } = cleanItems(input.items);
    const now = Date.now();
    return ctx.db.insert("enquiries", {
      customerName: cleanOptional(input.customerName, "Customer name", 120),
      customerPhone: cleanOptional(input.customerPhone, "Customer phone", 30),
      notes: cleanOptional(input.notes, "Notes", 2000),
      status: input.status,
      items,
      totalAmount,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: { ...session, id: v.id("enquiries"), ...fields },
  handler: async (ctx, { sessionToken, id, ...input }) => {
    await requireAdmin(ctx, sessionToken);
    if (!(await ctx.db.get(id))) {
      throw new ConvexError("This enquiry no longer exists.");
    }
    const { items, totalAmount } = cleanItems(input.items);
    await ctx.db.patch(id, {
      customerName: cleanOptional(input.customerName, "Customer name", 120),
      customerPhone: cleanOptional(input.customerPhone, "Customer phone", 30),
      notes: cleanOptional(input.notes, "Notes", 2000),
      status: input.status,
      items,
      totalAmount,
      updatedAt: Date.now(),
    });
  },
});

export const setStatus = mutation({
  args: { ...session, id: v.id("enquiries"), status: enquiryStatusValidator },
  handler: async (ctx, { sessionToken, id, status }) => {
    await requireAdmin(ctx, sessionToken);
    if (!(await ctx.db.get(id))) {
      throw new ConvexError("This enquiry no longer exists.");
    }
    await ctx.db.patch(id, { status, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { ...session, id: v.id("enquiries") },
  handler: async (ctx, { sessionToken, id }) => {
    await requireAdmin(ctx, sessionToken);
    if (await ctx.db.get(id)) await ctx.db.delete(id);
  },
});
