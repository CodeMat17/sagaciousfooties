import { preloadQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { CategoryList } from "@/components/store/category-list";
import { LiveErrorBoundary } from "@/components/store/error-boundary";
import { PageHeader } from "@/components/store/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Explore Sagacious Footies sandals by category — men's, women's and unisex handcrafted designs.",
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Categories" }]}
        eyebrow="Browse"
        title="Shop by category"
      />
      <LiveErrorBoundary>
        <Suspense
          fallback={
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
              ))}
            </div>
          }
        >
          <LiveCategories />
        </Suspense>
      </LiveErrorBoundary>
    </div>
  );
}

async function LiveCategories() {
  // Live catalogue data: always read at request time, never baked into the build.
  await connection();
  const preloaded = await preloadQuery(api.catalog.listCategories, {});
  return <CategoryList preloaded={preloaded} />;
}
