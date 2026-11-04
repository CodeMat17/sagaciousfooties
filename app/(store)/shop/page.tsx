import { preloadQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Catalog } from "@/components/store/catalog";
import { LiveErrorBoundary } from "@/components/store/error-boundary";
import { PageHeader } from "@/components/store/page-header";
import { CatalogSkeleton } from "@/components/store/catalog-skeleton";
import { api } from "@/convex/_generated/api";

export const metadata: Metadata = {
  title: "Shop Handcrafted Sandals",
  description:
    "Browse the full Sagacious Footies collection of handcrafted men's, women's and unisex sandals. Filter by size availability, category and price, then order on WhatsApp.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
        eyebrow="The collection"
        title="All handcrafted sandals"
        description="Every pair is made by hand in Aba. Choose your design and size, then send your order to us on WhatsApp."
      />
      <LiveErrorBoundary title="We couldn't load the collection.">
        <Suspense fallback={<CatalogSkeleton />}>
          <LiveCatalog />
        </Suspense>
      </LiveErrorBoundary>
    </div>
  );
}

async function LiveCatalog() {
  // Live catalogue data: always read at request time, never baked into the build.
  await connection();
  const [products, categories] = await Promise.all([
    preloadQuery(api.catalog.listPublished, {}),
    preloadQuery(api.catalog.listCategories, {}),
  ]);
  return <Catalog preloadedProducts={products} preloadedCategories={categories} />;
}
