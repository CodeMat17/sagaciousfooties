"use client";

import { usePreloadedQuery, type Preloaded } from "convex/react";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import type { api } from "@/convex/_generated/api";
import { ProductImage } from "./product-image";

export function CategoryList({
  preloaded,
}: {
  preloaded: Preloaded<typeof api.catalog.listCategories>;
}) {
  const categories = usePreloadedQuery(preloaded);
  if (categories.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-6 py-16 text-center text-muted-foreground">
        Categories will appear here soon.
      </p>
    );
  }
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category, i) => (
        <li key={category._id}>
          <Reveal delay={i * 0.05}>
            <Link
              href={`/categories/${category.slug}`}
              className="group relative block overflow-hidden rounded-lg"
            >
              <ProductImage
                image={category.imageUrl ? { url: category.imageUrl, alt: category.name } : null}
                name={category.name}
                sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
                className="aspect-[4/3]"
                showPlaceholderLabel={false}
                imageClassName="transition-transform duration-1000 ease-(--ease-luxe) group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-ivory">
                <div>
                  <p className="text-[0.65rem] tracking-[0.3em] text-ivory/75 uppercase">
                    {category.productCount} {category.productCount === 1 ? "design" : "designs"}
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl">{category.name}</h2>
                  {category.description && (
                    <p className="mt-1 line-clamp-2 max-w-xs text-sm text-ivory/80">
                      {category.description}
                    </p>
                  )}
                </div>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-ivory/50 transition-colors group-hover:bg-ivory group-hover:text-espresso">
                  <ArrowRightIcon className="size-4" aria-hidden="true" />
                </span>
              </div>
            </Link>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
