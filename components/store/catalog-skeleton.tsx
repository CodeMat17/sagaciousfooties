import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "./product-grid";

export function CatalogSkeleton() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 border-b py-3 lg:flex-row">
        <Skeleton className="h-10 w-full lg:w-72" />
        <Skeleton className="h-10 w-full lg:w-80" />
      </div>
      <Skeleton className="mb-6 h-4 w-24" />
      <ProductGridSkeleton />
    </div>
  );
}
