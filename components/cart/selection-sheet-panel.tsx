"use client";

import { ArrowRightIcon, ShoppingBagIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useValidatedSelection } from "@/hooks/use-validated-selection";
import { selectionSheet } from "@/lib/cart-store";
import { formatNaira } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { SelectionLine } from "./selection-line";

/** Loaded on demand by ./selection-sheet.tsx the first time it opens. */
export function SelectionSheetPanel({ open }: { open: boolean }) {
  return (
    <Sheet open={open} onOpenChange={(next) => selectionSheet.set(next)}>
      <SheetContent
        side="right"
        className="w-full gap-0 bg-background data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        {open && <SheetBody />}
      </SheetContent>
    </Sheet>
  );
}

function SheetBody() {
  const { rows, total, isEmpty, isLoading, issues, lines } = useValidatedSelection();
  const close = () => selectionSheet.set(false);
  const count = lines.reduce((s, l) => s + l.quantity, 0);

  return (
    <>
      <SheetHeader className="border-b px-6 py-5">
        <SheetTitle className="font-display text-2xl font-semibold">
          Your Selection
        </SheetTitle>
        <SheetDescription>
          {isEmpty
            ? "Nothing selected yet."
            : `${count} ${count === 1 ? "pair" : "pairs"} · prices checked live`}
        </SheetDescription>
      </SheetHeader>

      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
          <div className="grain flex size-20 items-center justify-center rounded-full bg-surface">
            <ShoppingBagIcon className="size-8 text-brand" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <p className="font-display text-2xl">Your selection is empty</p>
            <p className="text-sm text-muted-foreground">
              Choose a design and size, then send your order to us on WhatsApp.
            </p>
          </div>
          <Link
            href="/shop"
            onClick={close}
            className={buttonVariants({ size: "xl" })}
          >
            Explore the collection
          </Link>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-6">
            {isLoading ? (
              <div className="space-y-5 py-5">
                {lines.map((l) => (
                  <div key={`${l.productId}:${l.size}`} className="flex gap-4">
                    <Skeleton className="aspect-4/5 w-20 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="divide-y">
                {rows.map((row) => (
                  <SelectionLine key={row.key} row={row} onNavigate={close} dense />
                ))}
              </ul>
            )}
          </div>
          <div className="space-y-4 border-t bg-surface/60 px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <div className="flex items-baseline justify-between">
              <span className="text-sm tracking-wide text-muted-foreground uppercase">
                Total
              </span>
              <span className="font-display text-3xl font-semibold lining-nums tabular-nums">
                {formatNaira(total)}
              </span>
            </div>
            {issues > 0 && (
              <p className="text-sm text-destructive">
                {issues} {issues === 1 ? "item needs" : "items need"} your attention.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Delivery is arranged and confirmed on WhatsApp.
            </p>
            <Separator />
            <div className="grid gap-2.5">
              <Link
                href="/selection"
                onClick={close}
                className={cn(buttonVariants({ size: "xl" }), "w-full")}
              >
                Review &amp; order on WhatsApp
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
              <button
                type="button"
                onClick={close}
                className="h-10 text-sm font-medium underline-offset-4 hover:underline"
              >
                Continue shopping
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
