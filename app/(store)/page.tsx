import { preloadQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { CraftStory, WhatsAppCta } from "@/components/store/home/craft-story";
import { Hero } from "@/components/store/home/hero";
import { HomeCollections } from "@/components/store/home/home-collections";
import { ProductGridSkeleton } from "@/components/store/product-grid";
import { LiveErrorBoundary } from "@/components/store/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { JsonLd } from "@/components/store/json-ld";
import { absoluteUrl, fullAddress, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ShoeStore",
          name: siteConfig.name,
          slogan: siteConfig.tagline,
          url: absoluteUrl("/"),
          logo: absoluteUrl("/icons/icon-512.png"),
          image: absoluteUrl("/icons/icon-512.png"),
          telephone: `+${siteConfig.whatsappNumber}`,
          priceRange: "₦₦",
          currenciesAccepted: "NGN",
          address: {
            "@type": "PostalAddress",
            streetAddress: `${siteConfig.address.street}, ${siteConfig.address.market}`,
            addressLocality: siteConfig.address.city,
            addressRegion: siteConfig.address.region,
            addressCountry: siteConfig.address.countryCode,
          },
          description: `${siteConfig.description} Visit us at ${fullAddress}.`,
        }}
      />
      <Hero />
      <LiveErrorBoundary title="We couldn't load the collection.">
        <Suspense fallback={<HomeCollectionsSkeleton />}>
          <LiveCollections />
        </Suspense>
      </LiveErrorBoundary>
      <Suspense>
        <CraftStory />
      </Suspense>
      <Suspense>
        <WhatsAppCta />
      </Suspense>
    </>
  );
}

async function LiveCollections() {
  // Live catalogue data: always read at request time, never baked into the build.
  await connection();
  const preloaded = await preloadQuery(api.catalog.listPublished, {});
  return <HomeCollections preloaded={preloaded} />;
}

function HomeCollectionsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        <Skeleton className="aspect-[4/3] rounded-lg sm:aspect-[16/9]" />
        <Skeleton className="aspect-[4/3] rounded-lg sm:aspect-[16/9]" />
      </div>
      <div className="py-16 sm:py-20">
        <Skeleton className="mb-3 h-3 w-32" />
        <Skeleton className="mb-10 h-10 w-72" />
        <ProductGridSkeleton count={4} />
      </div>
    </div>
  );
}
