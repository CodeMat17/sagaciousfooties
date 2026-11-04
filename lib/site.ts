/** Central site configuration. The production domain comes from env. */
export const siteConfig = {
  name: "Sagacious Footies",
  shortName: "Sagacious",
  tagline: "Step in Style",
  title: "Sagacious Footies | Premium Handcrafted Sandals for Men, Women & Unisex",
  description:
    "Discover stylish handcrafted men's, women's and unisex sandals at Sagacious Footies. Explore unique designs, check available sizes and order conveniently through WhatsApp.",
  whatsappNumber: "2347044663337",
  phoneDisplay: "07044663337",
  address: {
    street: "Shop B7/7 Onyeahalanwaneeya Line, Shoe Plaza",
    market: "Ariaria International Market",
    city: "Aba",
    region: "Abia State",
    country: "Nigeria",
    countryCode: "NG",
  },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Shoe+Plaza+Ariaria+International+Market+Aba+Abia+State",
} as const;

export const fullAddress = [
  siteConfig.address.street,
  siteConfig.address.market,
  `${siteConfig.address.city}, ${siteConfig.address.region}`,
  siteConfig.address.country,
].join(", ");

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path = "/"): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
