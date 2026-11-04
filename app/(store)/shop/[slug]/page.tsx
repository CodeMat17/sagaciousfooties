import { preloadedQueryResult, preloadQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JsonLd } from "@/components/store/json-ld";
import { ProductDetail } from "@/components/store/product-detail";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { getProductForMeta } from "@/lib/convex-server";
import { absoluteUrl, siteConfig } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductForMeta(slug);
  if (!product) {
    return { title: "Design not found", robots: { index: false } };
  }
  const description =
    product.shortDescription ??
    product.description.slice(0, 155).replace(/\s+\S*$/, "…");
  const image = product.images[0];
  return {
    title: product.name,
    description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} | ${siteConfig.name}`,
      description,
      url: `/shop/${product.slug}`,
      images: image ? [{ url: image.url, alt: image.alt || product.name }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: product.name,
      description,
      images: image ? [image.url] : undefined,
    },
  };
}

export default function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductLoader params={params} />
      </Suspense>
    </div>
  );
}

async function ProductLoader({ params }: Pick<PageProps<"/shop/[slug]">, "params">) {
  const { slug } = await params;
  const preloaded = await preloadQuery(api.catalog.getBySlug, { slug });
  const product = preloadedQueryResult(preloaded);
  if (!product) notFound();

  const url = absoluteUrl(`/shop/${product.slug}`);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.shortDescription ?? product.description,
          image: product.images.map((i) => i.url),
          url,
          sku: product.slug,
          brand: { "@type": "Brand", name: siteConfig.name },
          category: product.category?.name,
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: "NGN",
            price: product.price,
            availability: product.available
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            seller: { "@type": "Organization", name: siteConfig.name },
          },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Shop", item: absoluteUrl("/shop") },
            { "@type": "ListItem", position: 3, name: product.name, item: url },
          ],
        }}
      />
      <ProductDetail preloaded={preloaded} />
    </>
  );
}

function ProductSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading product">
      <Skeleton className="mb-6 h-4 w-56" />
      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <Skeleton className="aspect-4/5 w-full rounded-lg" />
        <div className="space-y-5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-10 w-40" />
          <div className="flex gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-11 w-12" />
            ))}
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
