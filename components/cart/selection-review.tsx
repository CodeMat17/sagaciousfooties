"use client";

import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  InfoIcon,
  RefreshCwIcon,
  ShoppingBagIcon,
  WifiOffIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { useValidatedSelection } from "@/hooks/use-validated-selection";
import { cart } from "@/lib/cart-store";
import { formatNaira } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { buildOrderMessage, whatsappUrl } from "@/lib/whatsapp";
import { SelectionLine } from "./selection-line";

export function SelectionReview() {
  const settings = useStoreSettings();
  const {
    rows,
    validRows,
    total,
    issues,
    priceChanges,
    acceptPriceChanges,
    isEmpty,
    isLoading,
    isLive,
    lines,
  } = useValidatedSelection();
  const [opened, setOpened] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (isEmpty) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-20 text-center">
        <div className="grain flex size-24 items-center justify-center rounded-full bg-surface">
          <ShoppingBagIcon className="size-9 text-brand" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl">Your selection is empty</h2>
          <p className="text-muted-foreground">
            Browse our handcrafted designs, pick your size, and come back here to
            send your order on WhatsApp.
          </p>
        </div>
        <Link href="/shop" className={buttonVariants({ size: "xl" })}>
          Explore the collection
        </Link>
      </div>
    );
  }

  const message = buildOrderMessage(
    validRows.map((r) => ({
      name: r.product?.name ?? "",
      size: r.line.size,
      quantity: r.line.quantity,
      unitPrice: r.product?.price ?? 0,
    })),
    settings.businessName,
  );
  const blocked =
    isLoading || !isLive || issues > 0 || priceChanges > 0 || validRows.length === 0;
  const href = whatsappUrl(message, settings.whatsappNumber);
  const count = lines.reduce((s, l) => s + l.quantity, 0);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
      <section aria-labelledby="items-heading">
        <div className="flex items-end justify-between gap-4 border-b pb-4">
          <h2 id="items-heading" className="font-sans text-xs font-semibold tracking-[0.2em] uppercase">
            {count} {count === 1 ? "pair" : "pairs"} selected
          </h2>
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="ghost" size="sm" />}
            >
              Clear selection
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear your selection?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes every item from your selection on this device.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep items</AlertDialogCancel>
                <AlertDialogAction onClick={() => cart.clear()}>
                  Clear selection
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {priceChanges > 0 && (
          <div
            role="status"
            className="mt-5 flex flex-col gap-3 rounded-md border border-brand/40 bg-brand/8 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="flex items-start gap-2 text-sm">
              <RefreshCwIcon className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
              {priceChanges === 1 ? "A price has" : "Some prices have"} been updated
              since you opened this page. Please review the new amounts.
            </p>
            <Button size="sm" variant="outline" onClick={acceptPriceChanges}>
              I&apos;ve reviewed the prices
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6 py-6">
            {lines.map((l) => (
              <div key={`${l.productId}:${l.size}`} className="flex gap-4">
                <Skeleton className="aspect-4/5 w-24 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-9 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="divide-y">
            {rows.map((row) => (
              <SelectionLine key={row.key} row={row} />
            ))}
          </ul>
        )}

        <Link
          href="/shop"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Continue shopping
        </Link>
      </section>

      <aside aria-labelledby="summary-heading" className="lg:sticky lg:top-24 lg:self-start">
        <div className="grain rounded-lg border bg-card p-6 shadow-[0_1px_0_rgba(48,39,31,0.04),0_20px_40px_-24px_rgba(48,39,31,0.25)]">
          <h2 id="summary-heading" className="text-3xl">
            Order summary
          </h2>
          <dl className="mt-5 space-y-3 text-sm">
            {validRows.map((r) => (
              <div key={r.key} className="flex justify-between gap-4">
                <dt className="min-w-0 truncate text-muted-foreground">
                  {r.product?.name} · {r.line.size} × {r.line.quantity}
                </dt>
                <dd className="shrink-0 lining-nums tabular-nums">{formatNaira(r.subtotal)}</dd>
              </div>
            ))}
            <Separator className="my-4" />
            <div className="flex items-baseline justify-between">
              <dt className="font-medium">Total</dt>
              <dd className="font-display text-3xl font-semibold lining-nums tabular-nums">
                {formatNaira(total)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 flex gap-2 text-xs leading-relaxed text-muted-foreground">
            <InfoIcon className="size-4 shrink-0" aria-hidden="true" />
            {settings.deliveryInformation}
          </p>

          <div className="mt-6 space-y-3">
            {blocked ? (
              <Button size="xl" variant="whatsapp" className="w-full" disabled>
                <WhatsAppIcon data-icon="inline-start" />
                Proceed to WhatsApp
              </Button>
            ) : (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpened(true)}
                className={cn(buttonVariants({ variant: "whatsapp", size: "xl" }), "w-full")}
              >
                <WhatsAppIcon data-icon="inline-start" />
                Proceed to WhatsApp
                <span className="sr-only"> (opens WhatsApp with your order)</span>
              </a>
            )}
            <BlockReason
              isLoading={isLoading}
              isLive={isLive}
              issues={issues}
              priceChanges={priceChanges}
            />
            {opened && (
              <p
                role="status"
                className="flex items-start gap-2 rounded-md bg-success/10 p-3 text-sm text-foreground"
              >
                <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                WhatsApp has opened with your order. Remember to press <strong>Send</strong> in
                WhatsApp — we&apos;ll reply to confirm availability, payment and delivery.
              </p>
            )}
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              aria-expanded={showPreview}
              className="w-full text-center text-sm font-medium underline-offset-4 hover:underline"
            >
              {showPreview ? "Hide message preview" : "Preview the WhatsApp message"}
            </button>
            {showPreview && (
              <pre className="max-h-72 overflow-auto rounded-md bg-background p-4 font-sans text-xs leading-relaxed whitespace-pre-wrap">
                {message}
              </pre>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function BlockReason({
  isLoading,
  isLive,
  issues,
  priceChanges,
}: {
  isLoading: boolean;
  isLive: boolean;
  issues: number;
  priceChanges: number;
}) {
  let text: string | null = null;
  let offline = false;
  if (!isLive) {
    text = "Reconnecting to check current prices and sizes…";
    offline = true;
  } else if (isLoading) text = "Checking current prices and availability…";
  else if (issues > 0)
    text = "Update or remove the highlighted items to continue.";
  else if (priceChanges > 0) text = "Please confirm the updated prices above.";
  if (!text) {
    return (
      <p className="text-center text-xs text-muted-foreground">
        Prices and sizes verified live. You&apos;ll send the message yourself in WhatsApp.
      </p>
    );
  }
  return (
    <p role="status" className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
      {offline && <WifiOffIcon className="size-3.5" aria-hidden="true" />}
      {text}
    </p>
  );
}
