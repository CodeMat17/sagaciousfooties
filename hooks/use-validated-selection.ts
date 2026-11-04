"use client";

import { useConvexConnectionState, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import { lineKey, useCartLines, type CartLine } from "@/lib/cart-store";
import type { Audience } from "@/lib/constants";

export type SelectionIssue =
  | "unavailable_product"
  | "size_sold_out"
  | "size_removed";

export type SelectionRow = {
  key: string;
  line: CartLine;
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    audience: Audience;
    image: { url: string; alt: string } | null;
    sizes: Array<{ size: number; availability: "available" | "sold_out" }>;
  } | null;
  issue: SelectionIssue | null;
  /** Price the customer saw when this page first loaded, if it changed since. */
  previousPrice: number | null;
  subtotal: number;
};

/**
 * Joins the untrusted local selection with live, authoritative Convex data.
 * Prices, names and availability always come from the server.
 */
export function useValidatedSelection() {
  const lines = useCartLines();
  const ids = useMemo(
    () => Array.from(new Set(lines.map((l) => l.productId))),
    [lines],
  );
  const data = useQuery(
    api.catalog.getSelectionProducts,
    ids.length > 0 ? { ids } : "skip",
  );
  const connection = useConvexConnectionState();

  // Prices acknowledged by the customer; changes after that are surfaced.
  const [acknowledged, setAcknowledged] = useState<Record<string, number>>({});
  // Record first-seen prices during render (no effect needed).
  if (data) {
    const unseen = data.flatMap((entry) =>
      entry.product && acknowledged[entry.requestedId] === undefined
        ? [[entry.requestedId, entry.product.price] as const]
        : [],
    );
    if (unseen.length > 0) {
      setAcknowledged((prev) => ({ ...prev, ...Object.fromEntries(unseen) }));
    }
  }

  const rows: SelectionRow[] = useMemo(() => {
    const byId = new Map((data ?? []).map((d) => [d.requestedId, d.product]));
    return lines.map((line) => {
      const product = byId.get(line.productId) ?? null;
      let issue: SelectionIssue | null = null;
      if (!product) {
        issue = "unavailable_product";
      } else {
        const option = product.sizes.find((s) => s.size === line.size);
        if (!option) issue = "size_removed";
        else if (option.availability === "sold_out") issue = "size_sold_out";
      }
      const ack = acknowledged[line.productId];
      const previousPrice =
        product && ack !== undefined && ack !== product.price ? ack : null;
      return {
        key: lineKey(line),
        line,
        product,
        issue,
        previousPrice,
        subtotal: product && !issue ? product.price * line.quantity : 0,
      };
    });
  }, [lines, data, acknowledged]);

  const validRows = rows.filter((r) => !r.issue && r.product);
  const total = validRows.reduce((sum, r) => sum + r.subtotal, 0);
  const issues = rows.filter((r) => r.issue).length;
  const priceChanges = rows.filter((r) => r.previousPrice !== null).length;

  function acceptPriceChanges() {
    setAcknowledged(() => {
      const next: Record<string, number> = {};
      for (const entry of data ?? []) {
        if (entry.product) next[entry.requestedId] = entry.product.price;
      }
      return next;
    });
  }

  return {
    lines,
    rows,
    validRows,
    total,
    issues,
    priceChanges,
    acceptPriceChanges,
    isEmpty: lines.length === 0,
    isLoading: lines.length > 0 && data === undefined,
    isLive: connection.isWebSocketConnected,
  };
}
