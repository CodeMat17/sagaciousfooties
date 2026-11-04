"use client";

import { usePreloadedQuery, type Preloaded } from "convex/react";
import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { ProductGrid } from "./product-grid";

const SORTS = {
  newest: "Newest",
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
} as const;
type SortKey = keyof typeof SORTS;

const AUDIENCES = [
  { value: "all", label: "All" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
] as const;
type AudienceFilter = (typeof AUDIENCES)[number]["value"];

const PAGE_SIZE = 24;

function isSort(value: string | null): value is SortKey {
  return value !== null && value in SORTS;
}
function isAudience(value: string | null): value is AudienceFilter {
  return AUDIENCES.some((a) => a.value === value);
}

export function Catalog({
  preloadedProducts,
  preloadedCategories,
  lockedCategory,
}: {
  preloadedProducts: Preloaded<typeof api.catalog.listPublished>;
  preloadedCategories: Preloaded<typeof api.catalog.listCategories>;
  /** When set (category pages), the category filter is fixed. */
  lockedCategory?: string;
}) {
  const products = usePreloadedQuery(preloadedProducts);
  const categories = usePreloadedQuery(preloadedCategories);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const [query, setQuery] = useState(params.get("q") ?? "");
  const deferredQuery = useDeferredValue(query);
  const sortParam = params.get("sort");
  const sort: SortKey = isSort(sortParam) ? sortParam : "newest";
  const forParam = params.get("for");
  const audience: AudienceFilter = isAudience(forParam) ? forParam : "all";
  const category = lockedCategory ?? params.get("cat") ?? "all";
  const onlyNew = params.get("filter") === "new";
  const onlyAvailable = params.get("avail") === "1";
  const [limit, setLimit] = useState(PAGE_SIZE);

  function update(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "" || value === "all") sp.delete(key);
      else sp.set(key, value);
    }
    const qs = sp.toString();
    setLimit(PAGE_SIZE);
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      if (q && !`${p.name} ${p.shortDescription ?? ""} ${p.category?.name ?? ""}`.toLowerCase().includes(q)) {
        return false;
      }
      if (audience !== "all" && p.audience !== audience && p.audience !== "unisex") return false;
      if (category !== "all" && p.category?.slug !== category) return false;
      if (onlyNew && !p.isNewArrival) return false;
      if (onlyAvailable && !p.available) return false;
      return true;
    });
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "featured")
      sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || b.createdAt - a.createdAt);
    else sorted.sort((a, b) => b.createdAt - a.createdAt);
    // Keep sold-out designs visible, but after available ones.
    return sorted.sort((a, b) => Number(b.available) - Number(a.available));
  }, [products, deferredQuery, audience, category, onlyNew, onlyAvailable, sort]);

  const activeFilters =
    (audience !== "all" ? 1 : 0) +
    (!lockedCategory && category !== "all" ? 1 : 0) +
    (onlyNew ? 1 : 0) +
    (onlyAvailable ? 1 : 0) +
    (query ? 1 : 0);

  const categoryItems: Record<string, string> = {
    all: "All categories",
    ...Object.fromEntries(categories.map((c) => [c.slug, c.name])),
  };

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-4 mb-8 border-b bg-background/92 px-4 py-3 backdrop-blur-md sm:top-[calc(4.5rem+1.75rem)] sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1 lg:max-w-xs">
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => update({ q: query.trim() || null })}
              onKeyDown={(e) => {
                if (e.key === "Enter") update({ q: query.trim() || null });
              }}
              placeholder="Search designs"
              aria-label="Search products by name"
              className="h-10 bg-card pl-9"
            />
          </div>

          <div className="scrollbar-none -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div role="group" aria-label="Filter by who it's for" className="flex shrink-0 rounded-md border bg-card p-0.5">
              {AUDIENCES.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  aria-pressed={audience === a.value}
                  onClick={() => update({ for: a.value })}
                  className={cn(
                    "h-8 rounded-[5px] px-3 text-sm font-medium transition-colors",
                    audience === a.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {a.label}
                </button>
              ))}
            </div>
            <ToggleChip pressed={onlyNew} onClick={() => update({ filter: onlyNew ? null : "new" })}>
              New
            </ToggleChip>
            <ToggleChip pressed={onlyAvailable} onClick={() => update({ avail: onlyAvailable ? null : "1" })}>
              Available now
            </ToggleChip>
          </div>

          <div className="flex items-center gap-2 lg:ml-auto">
            {!lockedCategory && (
              <Select
                items={categoryItems}
                value={category}
                onValueChange={(value) => update({ cat: value ?? null })}
              >
                <SelectTrigger aria-label="Filter by category" className="h-10 flex-1 bg-card lg:w-48 lg:flex-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryItems).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select
              items={SORTS}
              value={sort}
              onValueChange={(value) => update({ sort: value === "newest" ? null : value })}
            >
              <SelectTrigger aria-label="Sort products" className="h-10 flex-1 bg-card lg:w-52 lg:flex-none">
                <SlidersHorizontalIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SORTS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <p aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "design" : "designs"}
        </p>
        {activeFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              update({ q: null, for: null, cat: null, filter: null, avail: null });
            }}
          >
            <XIcon data-icon="inline-start" />
            Clear filters
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed px-6 py-20 text-center">
          <p className="font-display text-3xl">No designs match</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {products.length === 0
              ? "New handcrafted designs are on the way. Check back soon."
              : "Try a different search or clear your filters to see the full collection."}
          </p>
          {activeFilters > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                update({ q: null, for: null, cat: null, filter: null, avail: null });
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Keeps heading levels sequential: product cards use <h3>. */}
          <h2 className="sr-only">Designs</h2>
          <ProductGrid products={filtered.slice(0, limit)} priorityCount={4} />
          {filtered.length > limit && (
            <div className="mt-12 flex justify-center">
              <Button size="xl" variant="outline" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
                Show more designs ({filtered.length - limit} more)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ToggleChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "h-9 shrink-0 rounded-md border px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
        pressed
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
