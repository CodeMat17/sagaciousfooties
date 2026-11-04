"use client";

import {
  usePreloadedQuery,
  useQuery,
  type Preloaded,
} from "convex/react";
import { HandHeartIcon, MessageCircleIcon, TruckIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { AUDIENCE_LABEL } from "@/lib/constants";
import { displayImages } from "@/lib/stock-images";
import { Crumbs } from "./page-header";
import { ProductGallery } from "./product-gallery";
import { ProductGrid, ProductGridSkeleton } from "./product-grid";
import { PurchasePanel } from "./purchase-panel";
import { SectionHeading } from "./home/home-collections";

export function ProductDetail({
  preloaded,
}: {
  preloaded: Preloaded<typeof api.catalog.getBySlug>;
}) {
  const product = usePreloadedQuery(preloaded);
  const settings = useStoreSettings();

  // Unpublished or deleted while the customer is viewing it.
  if (!product) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 py-24 text-center">
        <h1 className="text-4xl">This design is no longer available</h1>
        <p className="text-muted-foreground">
          It may have been retired or is being updated. Explore our other
          handcrafted designs.
        </p>
        <Link href="/shop" className={buttonVariants({ size: "xl" })}>
          Browse the collection
        </Link>
      </div>
    );
  }

  const paragraphs = product.description
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <Crumbs
        className="mb-6"
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          ...(product.category
            ? [{ label: product.category.name, href: `/categories/${product.category.slug}` }]
            : []),
          { label: product.name },
        ]}
      />
      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14 xl:gap-20">
        <ProductGallery images={displayImages(product)} name={product.name} />

        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="space-y-3">
            <p className="eyebrow">
              {product.category?.name ?? AUDIENCE_LABEL[product.audience]}
              {product.isNewArrival && " · New arrival"}
            </p>
            <h1 className="text-4xl leading-[1.05] sm:text-5xl">{product.name}</h1>
            {product.shortDescription && (
              <p className="text-lg leading-relaxed text-muted-foreground">
                {product.shortDescription}
              </p>
            )}
          </div>

          <div className="hairline my-7" />

          <PurchasePanel
            product={{
              _id: product._id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              sizes: product.sizes,
              available: product.available,
              shortDescription: product.shortDescription,
            }}
          />

          <ul className="mt-8 grid gap-4 border-t pt-7 text-sm">
            <li className="flex gap-3">
              <HandHeartIcon className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
              <span>
                <strong className="font-medium">Handcrafted in Aba.</strong>{" "}
                <span className="text-muted-foreground">Made by skilled cordwainers, finished by hand.</span>
              </span>
            </li>
            <li className="flex gap-3">
              <TruckIcon className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
              <span className="text-muted-foreground">{settings.deliveryInformation}</span>
            </li>
            <li className="flex gap-3">
              <MessageCircleIcon className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
              <span className="text-muted-foreground">
                Not sure about your size? Ask us on WhatsApp before you order.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {paragraphs.length > 0 && (
        <section aria-labelledby="details-heading" className="mt-16 grid gap-6 border-t pt-12 md:grid-cols-[16rem_1fr] lg:mt-24">
          <h2 id="details-heading" className="text-3xl">
            The details
          </h2>
          <div className="max-w-2xl space-y-4 leading-relaxed text-muted-foreground">
            {paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      <RelatedProducts productId={product._id} />
    </>
  );
}

function RelatedProducts({ productId }: { productId: Id<"products"> }) {
  const related = useQuery(api.catalog.listRelated, { productId, limit: 4 });
  if (related && related.length === 0) return null;
  return (
    <section aria-labelledby="related-heading" className="mt-20 border-t pt-14 lg:mt-28">
      <SectionHeading
        id="related-heading"
        eyebrow="You may also like"
        title="Complete the look"
        href="/shop"
        linkLabel="Shop all"
      />
      {related ? <ProductGrid products={related} /> : <ProductGridSkeleton count={4} />}
    </section>
  );
}
