"use client";

import { ArrowRightIcon, ShoppingBagIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { cart, selectionSheet } from "@/lib/cart-store";
import { formatNaira } from "@/lib/currency";
import { absoluteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import { buildProductEnquiry, whatsappUrl } from "@/lib/whatsapp";
import { QuantityStepper } from "./quantity-stepper";
import { ShareButton } from "./share-button";
import { SizeSelector, type SizeOption } from "./size-selector";

export type PurchasableProduct = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  sizes: SizeOption[];
  available: boolean;
  shortDescription: string | null;
};

export function PurchasePanel({
  product,
  onAdded,
  compact = false,
}: {
  product: PurchasableProduct;
  onAdded?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const settings = useStoreSettings();
  const [size, setSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeHint, setShowSizeHint] = useState(false);

  // If the chosen size sells out while the page is open, clear it.
  const chosen = product.sizes.find((s) => s.size === size);
  const effectiveSize = chosen && chosen.availability === "available" ? size : null;
  const url = absoluteUrl(`/shop/${product.slug}`);

  function addToSelection(): boolean {
    if (!product.available) return false;
    if (effectiveSize === null) {
      setShowSizeHint(true);
      document.getElementById(`size-heading-${product._id}`)?.focus();
      return false;
    }
    cart.add({
      productId: product._id,
      slug: product.slug,
      size: effectiveSize,
      quantity,
    });
    return true;
  }

  function handleAdd() {
    if (!addToSelection()) return;
    toast.success(`${product.name} added`, {
      description: `Size ${effectiveSize} · Qty ${quantity}`,
      action: { label: "View selection", onClick: () => selectionSheet.open() },
    });
    setQuantity(1);
    onAdded?.();
  }

  function handleOrderNow() {
    if (!addToSelection()) return;
    onAdded?.();
    router.push("/selection");
  }

  const enquiryHref = whatsappUrl(
    buildProductEnquiry({
      businessName: settings.businessName,
      name: product.name,
      url,
      price: product.price,
      size: effectiveSize,
      quantity,
    }),
    settings.whatsappNumber,
  );

  return (
    <div className={cn("flex flex-col", compact ? "gap-5" : "gap-7")}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-3xl font-semibold lining-nums tabular-nums sm:text-4xl">
          {formatNaira(product.price)}
        </p>
        <AvailabilityLabel available={product.available} />
      </div>

      <section aria-labelledby={`size-heading-${product._id}`} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            id={`size-heading-${product._id}`}
            tabIndex={-1}
            className="font-sans text-xs font-semibold tracking-[0.2em] uppercase outline-none"
          >
            Size <span className="font-normal text-muted-foreground">(EU)</span>
          </h2>
          {effectiveSize !== null && (
            <span className="text-sm text-muted-foreground">Selected: {effectiveSize}</span>
          )}
        </div>
        <SizeSelector
          name={`size-${product._id}`}
          sizes={product.sizes}
          value={effectiveSize}
          onChange={(s) => {
            setSize(s);
            setShowSizeHint(false);
          }}
        />
        <p
          role="status"
          className={cn(
            "text-sm text-destructive",
            showSizeHint && effectiveSize === null ? "block" : "sr-only",
          )}
        >
          {showSizeHint && effectiveSize === null ? "Please choose an available size first." : ""}
        </p>
      </section>

      {product.available && (
        <section className="space-y-3">
          <h2 className="font-sans text-xs font-semibold tracking-[0.2em] uppercase">
            Quantity
          </h2>
          <QuantityStepper value={quantity} onChange={setQuantity} />
        </section>
      )}

      <div className="grid gap-3">
        {product.available ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Button size="xl" variant="outline" onClick={handleAdd}>
              <ShoppingBagIcon data-icon="inline-start" />
              Add to Selection
            </Button>
            <Button size="xl" onClick={handleOrderNow}>
              Order Now
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
        ) : (
          <Button size="xl" disabled>
            Sold out
          </Button>
        )}
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <a
            href={enquiryHref}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "whatsapp", size: "xl" })}
          >
            <WhatsAppIcon data-icon="inline-start" />
            {product.available ? "Ask about this design" : "Ask when it's back"}
            <span className="sr-only"> (opens WhatsApp)</span>
          </a>
          <ShareButton
            title={product.name}
            text={product.shortDescription ?? `${product.name} — handcrafted by Sagacious Footies`}
            url={url}
          />
        </div>
      </div>
    </div>
  );
}

export function AvailabilityLabel({ available }: { available: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase",
        available ? "text-success" : "text-muted-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          available ? "bg-success" : "bg-muted-foreground",
        )}
      />
      {available ? "Available" : "Sold out"}
    </span>
  );
}
