import { Skeleton } from "@/components/ui/skeleton";
import type { ProductCardData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";

export const gridClass =
  "grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4";

export function ProductGrid({
  products,
  className,
  priorityCount = 0,
}: {
  products: ProductCardData[];
  className?: string;
  priorityCount?: number;
}) {
  return (
    <ul className={cn(gridClass, className)}>
      {products.map((product, index) => (
        <li key={product._id} className="flex">
          <ProductCard product={product} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({
  count = 8,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(gridClass, className)}
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-4/5 w-full rounded-md" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
