"use client";

import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { displayImages } from "@/lib/stock-images";
import type { ProductCardData } from "@/lib/types";
import { ProductImage } from "./product-image";
import { PurchasePanel } from "./purchase-panel";

export function QuickView({
  product,
  open,
  onOpenChange,
}: {
  product: ProductCardData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  if (!open) return null;

  const body = (
    <PurchasePanel
      compact
      product={{
        _id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        sizes: [...product.sizes].sort((a, b) => a.size - b.size),
        available: product.available,
        shortDescription: product.shortDescription,
      }}
      onAdded={() => onOpenChange(false)}
    />
  );
  const detailsLink = (
    <Link
      href={`/shop/${product.slug}`}
      className="inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
      onClick={() => onOpenChange(false)}
    >
      View full details <ArrowUpRightIcon className="size-4" aria-hidden="true" />
    </Link>
  );
  const eyebrow = product.category?.name ?? "Handcrafted";
  const summary = product.shortDescription ?? "Handcrafted in Aba.";

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
        <DrawerContent>
          <div className="overflow-y-auto px-5 pt-2 pb-8">
            <div className="mb-5 flex gap-4">
              <ProductImage
                image={displayImages(product)[0]}
                name={product.name}
                sizes="96px"
                className="aspect-4/5 w-24 shrink-0 rounded-md"
              />
              <div className="min-w-0 space-y-1.5">
                <p className="eyebrow">{eyebrow}</p>
                <DrawerTitle className="font-display text-2xl leading-tight font-semibold">
                  {product.name}
                </DrawerTitle>
                <DrawerDescription className="line-clamp-2 text-sm text-muted-foreground">
                  {summary}
                </DrawerDescription>
              </div>
            </div>
            {body}
            <div className="mt-6 text-center">{detailsLink}</div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] gap-0 overflow-hidden bg-background p-0 sm:max-w-4xl">
        <div className="grid max-h-[90dvh] md:grid-cols-2">
          <ProductImage
            image={displayImages(product)[0]}
            name={product.name}
            sizes="(min-width: 768px) 448px, 100vw"
            className="aspect-4/5 md:aspect-auto md:h-full md:min-h-[32rem]"
          />
          <div className="flex flex-col gap-6 overflow-y-auto p-8">
            <div className="space-y-2">
              <p className="eyebrow">{eyebrow}</p>
              <DialogTitle className="font-display text-3xl leading-tight font-semibold">
                {product.name}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {summary}
              </DialogDescription>
            </div>
            {body}
            <div>{detailsLink}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
