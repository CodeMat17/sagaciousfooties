"use client";

import { EyeIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AUDIENCE_LABEL } from "@/lib/constants";
import { formatNaira } from "@/lib/currency";
import { displayImages } from "@/lib/stock-images";
import type { ProductCardData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductImage } from "./product-image";

// Dialog/drawer + purchase panel code loads only when a quick view is opened.
const QuickView = dynamic(() => import("./quick-view").then((m) => m.QuickView), {
  ssr: false,
});

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [primary, secondary] = displayImages(product);
  const descriptor = product.category?.name ?? AUDIENCE_LABEL[product.audience];
  const href = `/shop/${product.slug}`;
  const availableSizes = product.sizes.filter(
    (s) => s.availability === "available",
  ).length;

  return (
    <article className="group/card relative flex w-full flex-col">
      <div className="relative">
        <Link
          href={href}
          className="relative block overflow-hidden rounded-md"
          aria-label={`${product.name}, ${formatNaira(product.price)}${product.available ? "" : ", sold out"}`}
        >
          <ProductImage
            image={primary}
            name={product.name}
            priority={priority}
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"
            className="aspect-4/5 rounded-md"
            imageClassName={cn(
              "transition-[transform,opacity] duration-700 ease-(--ease-luxe) group-hover/card:scale-[1.035]",
              secondary && "group-hover/card:opacity-0",
              !product.available && "grayscale-[35%]",
            )}
          />
          {secondary && (
            <Image
              src={secondary.url}
              alt=""
              fill
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"
              className="rounded-md object-cover opacity-0 transition-opacity duration-700 ease-(--ease-luxe) group-hover/card:opacity-100"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5">
          {!product.available && <CardTag tone="muted">Sold out</CardTag>}
          {product.available && product.isNewArrival && (
            <CardTag tone="light">New</CardTag>
          )}
          {product.featured && <CardTag tone="dark">Featured</CardTag>}
        </div>

        <button
          type="button"
          onClick={() => setQuickViewOpen(true)}
          className={cn(
            "absolute right-2.5 bottom-2.5 inline-flex h-9 items-center gap-1.5 rounded-md bg-background/90 px-3 text-xs font-medium tracking-wide text-foreground shadow-sm backdrop-blur transition-all duration-300 hover:bg-background",
            "md:translate-y-2 md:opacity-0 md:group-hover/card:translate-y-0 md:group-hover/card:opacity-100 md:focus-visible:translate-y-0 md:focus-visible:opacity-100",
          )}
          aria-label={`Quick view ${product.name}`}
        >
          <EyeIcon className="size-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Quick view</span>
        </button>
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1 px-0.5">
        <p className="text-[0.65rem] tracking-[0.22em] text-muted-foreground uppercase">
          {descriptor}
        </p>
        <h3 className="font-display text-lg leading-snug font-semibold sm:text-xl">
          <Link href={href} className="hover:text-brand focus-visible:text-brand">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-0.5">
          <p className="text-[0.95rem] font-medium lining-nums tabular-nums">
            {formatNaira(product.price)}
          </p>
          {product.available && (
            <p className="text-[0.7rem] text-muted-foreground">
              {availableSizes} {availableSizes === 1 ? "size" : "sizes"}
            </p>
          )}
        </div>
      </div>

      {quickViewOpen && (
        <QuickView product={product} open={quickViewOpen} onOpenChange={setQuickViewOpen} />
      )}
    </article>
  );
}

function CardTag({
  children,
  tone,
}: {
  children: string;
  tone: "light" | "dark" | "muted";
}) {
  return (
    <span
      className={cn(
        "rounded-sm px-2 py-1 text-[0.6rem] font-semibold tracking-[0.18em] uppercase shadow-sm",
        tone === "light" && "bg-ivory text-espresso",
        tone === "dark" && "bg-espresso text-ivory",
        tone === "muted" && "bg-background/90 text-foreground",
      )}
    >
      {children}
    </span>
  );
}
