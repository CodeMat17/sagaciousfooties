"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useSelectionSheetOpen } from "@/lib/cart-store";

// The sheet (and its live-validation queries) is closed on first paint, so
// its code is fetched only when someone first opens it.
const SelectionSheetPanel = dynamic(
  () => import("./selection-sheet-panel").then((m) => m.SelectionSheetPanel),
  { ssr: false },
);

export function SelectionSheet() {
  const open = useSelectionSheetOpen();
  // Stays mounted after the first open so the close animation still plays.
  const [used, setUsed] = useState(false);
  if (open && !used) setUsed(true);
  return used ? <SelectionSheetPanel open={open} /> : null;
}
