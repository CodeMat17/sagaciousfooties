import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { ServiceWorkerRegistrar } from "@/components/providers/service-worker";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getSiteUrl, siteConfig } from "@/lib/site";
import "./globals.css";

const display = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  // `SOFT` axis dropped: it alone added ~120 KB of font data on every page.
  axes: ["opsz"],
  display: "swap",
});

const sans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "handcrafted sandals",
    "leather sandals Nigeria",
    "men's sandals",
    "women's sandals",
    "Aba shoes",
    "Ariaria market",
    "Sagacious Footies",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: "/",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  appleWebApp: {
    capable: true,
    title: siteConfig.shortName,
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3ebdd" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1611" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-NG"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
          <Toaster position="top-center" richColors={false} closeButton />
        </ThemeProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
