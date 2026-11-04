import "server-only";
import { fetchQuery } from "convex/nextjs";
import { cacheLife } from "next/cache";
import { api } from "@/convex/_generated/api";

/**
 * Short-lived cached reads used ONLY for metadata, JSON-LD and the sitemap.
 * Live UI always subscribes to Convex directly, so it never waits on these.
 */
export async function getProductForMeta(slug: string) {
  "use cache";
  cacheLife("minutes");
  try {
    return await fetchQuery(api.catalog.getBySlug, { slug });
  } catch {
    return null;
  }
}

export async function getCategoryForMeta(slug: string) {
  "use cache";
  cacheLife("minutes");
  try {
    return await fetchQuery(api.catalog.getCategoryBySlug, { slug });
  } catch {
    return null;
  }
}

/**
 * Hero photo URLs for the server-rendered first paint, so the LCP image is in
 * the initial HTML (and preloaded) instead of waiting for the Convex socket.
 * The client slideshow still subscribes live and takes over after hydration.
 */
export async function getHeroImageUrls(): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  try {
    const settings = await fetchQuery(api.settings.getPublic, {});
    return settings.heroImageUrls ?? [];
  } catch {
    return [];
  }
}

export async function getSitemapEntries() {
  "use cache";
  cacheLife("hours");
  try {
    return await fetchQuery(api.catalog.sitemapEntries, {});
  } catch {
    return { products: [], categories: [] };
  }
}
