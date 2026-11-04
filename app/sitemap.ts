import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/convex-server";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories } = await getSitemapEntries();
  const staticRoutes = ["/", "/shop", "/categories", "/about", "/contact", "/privacy", "/terms"];
  return [
    ...staticRoutes.map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: path === "/" || path === "/shop" ? ("daily" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : path === "/shop" ? 0.9 : 0.5,
    })),
    ...categories.map((c) => ({
      url: absoluteUrl(`/categories/${c.slug}`),
      lastModified: new Date(c.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: absoluteUrl(`/shop/${p.slug}`),
      lastModified: new Date(p.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
