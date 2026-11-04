"use client";

import { AlertTriangleIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { ProductImage } from "@/components/store/product-image";
import { QuantityStepper } from "@/components/store/quantity-stepper";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SelectionRow } from "@/hooks/use-validated-selection";
import { cart } from "@/lib/cart-store";
import { formatNaira } from "@/lib/currency";
import { stockProductImage } from "@/lib/stock-images";
import { cn } from "@/lib/utils";

const ISSUE_TEXT = {
  unavailable_product: "This design is no longer available.",
  size_sold_out: "This size has just sold out. Choose another size or remove it.",
  size_removed: "This size is no longer offered. Choose another size or remove it.",
} as const;

export function SelectionLine({
  row,
  onNavigate,
  dense = false,
}: {
  row: SelectionRow;
  onNavigate?: () => void;
  dense?: boolean;
}) {
  const { product, line, issue } = row;
  const name = product?.name ?? "Unavailable item";
  const availableSizes =
    product?.sizes.filter((s) => s.availability === "available") ?? [];
  const sizeItems = Object.fromEntries(
    (product?.sizes ?? []).map((s) => [String(s.size), `Size ${s.size}`]),
  );

  return (
    <li
      className={cn(
        "flex gap-4 py-5",
        issue && "rounded-md bg-destructive/5 px-3 ring-1 ring-destructive/25",
      )}
    >
      {product ? (
        <Link
          href={`/shop/${product.slug}`}
          onClick={onNavigate}
          className="shrink-0"
          tabIndex={-1}
          aria-hidden="true"
        >
          <ProductImage
            image={product.image ?? stockProductImage(product._id, product.audience)}
            name={product.name}
            sizes="96px"
            className={cn("aspect-4/5 rounded-md", dense ? "w-20" : "w-24")}
          />
        </Link>
      ) : (
        <div
          className={cn(
            "aspect-4/5 shrink-0 rounded-md bg-muted",
            dense ? "w-20" : "w-24",
          )}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {product ? (
              <Link
                href={`/shop/${product.slug}`}
                onClick={onNavigate}
                className="font-display text-lg leading-tight font-semibold hover:text-brand"
              >
                {name}
              </Link>
            ) : (
              <p className="font-display text-lg leading-tight font-semibold text-muted-foreground">
                {name}
              </p>
            )}
            {product && (
              <p className="mt-0.5 text-sm text-muted-foreground lining-nums tabular-nums">
                {formatNaira(product.price)} each
                {row.previousPrice !== null && (
                  <span className="ml-1.5 font-medium text-brand">
                    (was {formatNaira(row.previousPrice)})
                  </span>
                )}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => cart.remove(row.key)}
            aria-label={`Remove ${name}, size ${line.size}`}
          >
            <Trash2Icon />
          </Button>
        </div>

        {issue && (
          <p className="flex items-start gap-1.5 text-sm text-destructive">
            <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {ISSUE_TEXT[issue]}
          </p>
        )}

        {product && (
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Select
                items={sizeItems}
                value={String(line.size)}
                onValueChange={(value) => {
                  if (value) cart.changeSize(row.key, Number(value));
                }}
              >
                <SelectTrigger
                  size="sm"
                  aria-label={`Size for ${name}`}
                  className="h-9 min-w-26"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes.map((s) => (
                    <SelectItem
                      key={s.size}
                      value={String(s.size)}
                      disabled={s.availability === "sold_out"}
                    >
                      Size {s.size}
                      {s.availability === "sold_out" ? " — sold out" : ""}
                    </SelectItem>
                  ))}
                  {!product.sizes.some((s) => s.size === line.size) && (
                    <SelectItem value={String(line.size)} disabled>
                      Size {line.size} — unavailable
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {issue !== "unavailable_product" && (
                <QuantityStepper
                  size="sm"
                  value={line.quantity}
                  onChange={(q) => cart.setQuantity(row.key, q)}
                  label={`Quantity for ${name}`}
                />
              )}
            </div>
            {!issue && (
              <p className="font-medium lining-nums tabular-nums">{formatNaira(row.subtotal)}</p>
            )}
          </div>
        )}
        {product && issue && availableSizes.length === 0 && (
          <p className="text-xs text-muted-foreground">All sizes are currently sold out.</p>
        )}
      </div>
    </li>
  );
}
