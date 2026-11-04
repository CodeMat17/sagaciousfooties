"use client";

import { usePreloadedQuery, type Preloaded } from "convex/react";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import type { api } from "@/convex/_generated/api";
import { STOCK_IMAGES } from "@/lib/stock-images";
import type { ProductCardData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductCard } from "../product-card";
import { ProductImage } from "../product-image";
import { ProductGrid } from "../product-grid";

/**
 * All live product sections on the homepage share one Convex subscription,
 * server-preloaded for a fast first paint and then kept live.
 */
export function HomeCollections({
  preloaded,
}: {
  preloaded: Preloaded<typeof api.catalog.listPublished>;
}) {
  const products = usePreloadedQuery(preloaded);
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const arrivals = products.filter((p) => p.isNewArrival).slice(0, 8);

  if (products.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
        <p className="eyebrow">The collection</p>
        <h2 className="mt-3 text-4xl">New designs are on the way</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Our latest handcrafted pairs will appear here shortly. Chat with us on
          WhatsApp to ask about what&apos;s on the workbench.
        </p>
      </section>
    );
  }

  return (
    <>
      <AudienceShortcuts products={products} />

      {featured.length > 0 && (
        <Section
          eyebrow="Featured designs"
          title="The house favourites"
          href="/shop?sort=featured"
          linkLabel="View all"
        >
          <ProductGrid products={featured} />
        </Section>
      )}

      {arrivals.length > 0 && (
        <section className="border-y bg-surface/70 py-16 sm:py-20" aria-labelledby="arrivals-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading
              id="arrivals-heading"
              eyebrow="Just off the workbench"
              title="New arrivals"
              href="/shop?filter=new"
              linkLabel="Shop new"
            />
          </div>
          <ul className="scrollbar-none mx-auto flex max-w-7xl snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:gap-6 sm:px-6">
            {arrivals.map((product) => (
              <li
                key={product._id}
                className="flex w-[64%] shrink-0 snap-start sm:w-[40%] md:w-[30%] lg:w-[23%]"
              >
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <Section
        eyebrow="The collection"
        title="Made for every occasion"
        href="/shop"
        linkLabel={`Browse all ${products.length}`}
      >
        <ProductGrid products={products.slice(0, 8)} />
        <div className="mt-12 flex justify-center">
          <Link href="/shop" className={buttonVariants({ size: "xl", variant: "outline" })}>
            Explore the full collection
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </div>
      </Section>
    </>
  );
}

function AudienceShortcuts({ products }: { products: ProductCardData[] }) {
  // Real product photo when one exists; otherwise a stand-in sandal photo.
  const pick = (audience: "men" | "women" | "unisex") =>
    products.find((p) => p.audience === audience && p.images.length > 0)?.images[0] ??
    STOCK_IMAGES[audience];
  // Men's and women's filters also include unisex designs, matching the shop.
  const tiles = [
    {
      href: "/shop?for=men",
      title: "Men",
      text: "Bold straps, confident lines",
      image: pick("men"),
      count: products.filter((p) => p.audience === "men" || p.audience === "unisex").length,
    },
    {
      href: "/shop?for=women",
      title: "Women",
      text: "Graceful, all-day elegance",
      image: pick("women"),
      count: products.filter((p) => p.audience === "women" || p.audience === "unisex").length,
    },
    {
      href: "/shop?for=unisex",
      title: "Unisex",
      text: "Versatile pairs made for everyone",
      image: pick("unisex"),
      count: products.filter((p) => p.audience === "unisex").length,
    },
  ];
  return (
    <section aria-label="Shop by collection" className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {tiles.map((tile, i) => (
          <Reveal
            key={tile.href}
            delay={i * 0.08}
            className={i === 2 ? "col-span-2 lg:col-span-1" : undefined}
          >
            <Link
              href={tile.href}
              className="group relative block overflow-hidden rounded-lg"
            >
              <ProductImage
                image={tile.image}
                name={`${tile.title} sandals`}
                sizes="(min-width: 1024px) 31vw, (min-width: 768px) 45vw, 48vw"
                className={
                  i === 2
                    ? "aspect-[21/9] sm:aspect-[32/9] lg:aspect-[4/3]"
                    : "aspect-[4/3] sm:aspect-[16/9] lg:aspect-[4/3]"
                }
                showPlaceholderLabel={false}
                imageClassName="transition-transform duration-1000 ease-(--ease-luxe) group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-ivory sm:p-7">
                <div>
                  <p className="text-[0.6rem] tracking-[0.3em] text-ivory/75 uppercase sm:text-xs">
                    {tile.count} designs
                  </p>
                  <h2 className="font-display text-3xl leading-none sm:text-5xl">
                    {tile.title}
                  </h2>
                  <p className="mt-1.5 hidden text-sm text-ivory/80 sm:block">{tile.text}</p>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-ivory/50 transition-colors group-hover:bg-ivory group-hover:text-espresso sm:size-11">
                  <ArrowRightIcon className="size-4" aria-hidden="true" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Section({
  eyebrow,
  title,
  href,
  linkLabel,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
  className?: string;
}) {
  const id = `${title.toLowerCase().replace(/\W+/g, "-")}-heading`;
  return (
    <section aria-labelledby={id} className={cn("mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20", className)}>
      <SectionHeading id={id} eyebrow={eyebrow} title={title} href={href} linkLabel={linkLabel} />
      {children}
    </section>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  id: string;
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <Reveal className="mb-8 flex items-end justify-between gap-6 sm:mb-10">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="mt-2 text-4xl sm:text-5xl">
          {title}
        </h2>
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1.5 pb-1.5 text-sm font-medium"
        >
          <span className="underline-offset-4 group-hover:underline">{linkLabel}</span>
          <ArrowRightIcon
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      )}
    </Reveal>
  );
}
