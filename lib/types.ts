import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";

export type ProductCardData = FunctionReturnType<
  typeof api.catalog.listPublished
>[number];

export type ProductDetailData = NonNullable<
  FunctionReturnType<typeof api.catalog.getBySlug>
>;

export type CategorySummary = FunctionReturnType<
  typeof api.catalog.listCategories
>[number];
