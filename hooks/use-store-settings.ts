"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { fullAddress, siteConfig } from "@/lib/site";
import type { FunctionReturnType } from "convex/server";

export type StoreSettings = FunctionReturnType<typeof api.settings.getPublic>;

export const FALLBACK_SETTINGS: StoreSettings = {
  businessName: siteConfig.name,
  tagline: siteConfig.tagline,
  whatsappNumber: siteConfig.whatsappNumber,
  contactEmail: null,
  address: fullAddress,
  openingHours: null,
  instagramUrl: null,
  facebookUrl: null,
  tiktokUrl: null,
  deliveryInformation:
    "Delivery arrangements and any applicable delivery charges are confirmed with you on WhatsApp after you send your order.",
  seoTitle: siteConfig.title,
  seoDescription: siteConfig.description,
  logoUrl: null,
  heroImageUrls: [],
};

/** Live public settings with a sensible fallback while loading. */
export function useStoreSettings(): StoreSettings & { loaded: boolean } {
  const settings = useQuery(api.settings.getPublic);
  return { ...(settings ?? FALLBACK_SETTINGS), loaded: settings !== undefined };
}
