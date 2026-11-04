"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAdminToken } from "@/components/admin/admin-session";
import { ProductForm } from "@/components/admin/product-form";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function EditProductPage() {
  const token = useAdminToken();
  const { id } = useParams<{ id: string }>();
  const product = useQuery(api.admin.products.get, {
    sessionToken: token,
    id: id as Id<"products">,
  });

  if (product === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-72" />
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <Skeleton className="h-96 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
      </div>
    );
  }
  if (product === null) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-4xl">Product not found</h1>
        <p className="mt-2 text-muted-foreground">It may have been deleted.</p>
        <Link href="/admin/products" className={buttonVariants({ className: "mt-6" })}>
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <ProductForm
      key={product._id}
      productId={product._id}
      initial={{
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription ?? "",
        description: product.description,
        price: String(product.price),
        categoryId: product.categoryId,
        audience: product.audience,
        images: product.images,
        sizes: product.sizes,
        featured: product.featured,
        isNewArrival: product.isNewArrival,
        published: product.published,
      }}
    />
  );
}
