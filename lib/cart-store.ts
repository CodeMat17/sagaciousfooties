"use client";

import { useSyncExternalStore } from "react";
import { CART_STORAGE_KEY } from "./constants";

/** Only the minimum is stored; names, prices and availability come live from Convex. */
export type CartLine = {
  productId: string;
  slug: string;
  size: number;
  quantity: number;
};

const EMPTY: CartLine[] = [];
const MAX_LINES = 50;
const MAX_QTY = 999;

let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** localStorage is untrusted: keep only well-formed lines. */
function parse(raw: string | null): CartLine[] {
  if (!raw) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || !Array.isArray(data.lines)) return EMPTY;
    const out: CartLine[] = [];
    for (const item of data.lines) {
      if (!isRecord(item)) continue;
      const { productId, slug, size, quantity } = item;
      if (
        typeof productId === "string" &&
        productId.length > 0 &&
        productId.length < 64 &&
        typeof slug === "string" &&
        slug.length < 120 &&
        typeof size === "number" &&
        Number.isFinite(size) &&
        typeof quantity === "number" &&
        Number.isInteger(quantity) &&
        quantity >= 1
      ) {
        out.push({ productId, slug, size, quantity: Math.min(quantity, MAX_QTY) });
      }
    }
    return out.slice(0, MAX_LINES);
  } catch {
    return EMPTY;
  }
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    lines = parse(window.localStorage.getItem(CART_STORAGE_KEY));
  } catch {
    lines = EMPTY;
  }
  window.addEventListener("storage", (event) => {
    if (event.key === CART_STORAGE_KEY) {
      lines = parse(event.newValue);
      emit();
    }
  });
}

function emit() {
  for (const listener of listeners) listener();
}

function commit(next: CartLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ version: 1, lines: next }),
    );
  } catch {
    // Storage may be unavailable (private mode); keep in memory.
  }
  emit();
}

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => {
  load();
  return lines;
};
const getServerSnapshot = () => EMPTY;

export const lineKey = (line: Pick<CartLine, "productId" | "size">) =>
  `${line.productId}:${line.size}`;

export const cart = {
  add(line: CartLine) {
    const key = lineKey(line);
    const existing = lines.find((l) => lineKey(l) === key);
    if (existing) {
      commit(
        lines.map((l) =>
          lineKey(l) === key
            ? { ...l, quantity: Math.min(l.quantity + line.quantity, MAX_QTY) }
            : l,
        ),
      );
    } else {
      commit([...lines, line].slice(-MAX_LINES));
    }
  },
  setQuantity(key: string, quantity: number) {
    const q = Math.max(1, Math.min(Math.round(quantity), MAX_QTY));
    commit(lines.map((l) => (lineKey(l) === key ? { ...l, quantity: q } : l)));
  },
  /** Changes a line's size, merging into an existing line of that size. */
  changeSize(key: string, size: number) {
    const line = lines.find((l) => lineKey(l) === key);
    if (!line || line.size === size) return;
    const targetKey = lineKey({ productId: line.productId, size });
    const target = lines.find((l) => lineKey(l) === targetKey);
    if (target) {
      commit(
        lines
          .filter((l) => lineKey(l) !== key)
          .map((l) =>
            lineKey(l) === targetKey
              ? { ...l, quantity: Math.min(l.quantity + line.quantity, MAX_QTY) }
              : l,
          ),
      );
    } else {
      commit(lines.map((l) => (lineKey(l) === key ? { ...l, size } : l)));
    }
  },
  remove(key: string) {
    commit(lines.filter((l) => lineKey(l) !== key));
  },
  clear() {
    commit(EMPTY);
  },
};

export function useCartLines(): CartLine[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCartCount(): number {
  const current = useCartLines();
  return current.reduce((sum, l) => sum + l.quantity, 0);
}

/* ------- Selection sheet open state (shared by header, nav, buttons) ------ */

let sheetOpen = false;
const sheetListeners = new Set<() => void>();

export const selectionSheet = {
  open() {
    sheetOpen = true;
    sheetListeners.forEach((l) => l());
  },
  set(open: boolean) {
    sheetOpen = open;
    sheetListeners.forEach((l) => l());
  },
};

export function useSelectionSheetOpen(): boolean {
  return useSyncExternalStore(
    (l) => {
      sheetListeners.add(l);
      return () => sheetListeners.delete(l);
    },
    () => sheetOpen,
    () => false,
  );
}
