import { preloadedQueryResult, preloadQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Catalog } from "@/components/store/catalog";
import { CatalogSkeleton } from "@/components/store/catalog-skeleton";
import { LiveErrorBoundary } from "@/components/store/error-boundary";
import { PageHeader } from "@/components/store/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { getCategoryForMeta } from "@/lib/convex-server";

export async function generateMetadata({
  params,
}: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryForMeta(slug);
  if (!category) return { title: "Category not found", robots: { index: false } };
  const description =
    category.description ??
    `Shop ${category.name} from Sagacious Footies — handcrafted in Aba and ordered easily on WhatsApp.`;
  return {
    title: category.name,
    description,
    alternates: { canonical: `/categories/${category.slug}` },
    openGraph: {
      title: category.name,
      description,
      url: `/categories/${category.slug}`,
      images: category.imageUrl ? [{ url: category.imageUrl }] : undefined,
    },
  };
}

export default function CategoryPage({ params }: PageProps<"/categories/[slug]">) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <LiveErrorBoundary title="We couldn't load this category.">
        <Suspense
          fallback={
            <>
              <div className="space-y-4 pt-10 pb-12">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-14 w-80" />
                <Skeleton className="h-5 w-96 max-w-full" />
              </div>
              <CatalogSkeleton />
            </>
          }
        >
          <CategoryContent params={params} />
        </Suspense>
      </LiveErrorBoundary>
    </div>
  );
}

async function CategoryContent({
  params,
}: Pick<PageProps<"/categories/[slug]">, "params">) {
  const { slug } = await params;
  const [categoryPreload, products, categories] = await Promise.all([
    preloadQuery(api.catalog.getCategoryBySlug, { slug }),
    preloadQuery(api.catalog.listPublished, {}),
    preloadQuery(api.catalog.listCategories, {}),
  ]);
  const category = preloadedQueryResult(categoryPreload);
  if (!category) notFound();

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
        eyebrow="Category"
        title={category.name}
        description={category.description ?? undefined}
      />
      <Catalog
        preloadedProducts={products}
        preloadedCategories={categories}
        lockedCategory={category.slug}
      />
    </>
  );
}
