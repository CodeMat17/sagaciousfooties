import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getHeroImageUrls } from "@/lib/convex-server";
import { WhatsAppChatButton } from "../whatsapp-chat-button";
import { HeroVisual } from "./hero-visual";

/** Compact hero: text is static (instant), the visual is live from settings. */
export async function Hero() {
  const initialImageUrls = await getHeroImageUrls();
  // On lg+ the hero is sized to the viewport minus the sticky header
  // (announcement bar 1.75rem + nav 4.5rem) so it's fully visible without scrolling.
  return (
    <section className="relative overflow-hidden lg:h-[calc(100dvh-6.25rem)] lg:max-h-240 lg:min-h-136">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pt-6 pb-10 sm:px-6 md:grid-cols-[1.05fr_1fr] md:gap-12 md:pt-12 md:pb-16 lg:h-full lg:gap-20 lg:py-[clamp(1.5rem,4dvh,3rem)]">
        <div className="order-2 space-y-6 md:order-1 md:space-y-8 lg:space-y-[clamp(1rem,3.5dvh,2rem)]">
          <p className="eyebrow animate-in duration-700 fade-in slide-in-from-bottom-2">
            Handcrafted in Aba, Nigeria
          </p>
          <h1 className="text-[2.75rem] leading-[0.98] font-medium text-balance animate-in duration-700 fade-in slide-in-from-bottom-3 sm:text-6xl lg:text-[clamp(3.25rem,9dvh,5.25rem)]">
            Crafted to Make{" "}
            <em className="font-medium text-brand">Every Step</em> Count.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground animate-in delay-100 duration-700 fade-in fill-mode-both slide-in-from-bottom-3 sm:text-lg">
            Discover handcrafted footwear designed for comfort, confidence and
            everyday elegance.
          </p>
          <div className="flex flex-col gap-3 animate-in delay-200 duration-700 fade-in fill-mode-both slide-in-from-bottom-3 sm:flex-row">
            <Link href="/shop" className={buttonVariants({ size: "xl" })}>
              Explore Collection
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
            <WhatsAppChatButton variant="outline" />
          </div>
          <dl className="grid max-w-md grid-cols-3 gap-4 border-t pt-6 text-sm">
            {[
              ["Handmade", "by skilled cordwainers"],
              ["Sizes", "configured per design"],
              ["WhatsApp", "order in one message"],
            ].map(([title, text]) => (
              <div key={title}>
                <dt className="font-display text-xl font-semibold">{title}</dt>
                <dd className="mt-0.5 text-xs leading-snug text-muted-foreground">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="order-1 md:order-2 lg:h-full">
          <HeroVisual initialImageUrls={initialImageUrls} />
        </div>
      </div>
    </section>
  );
}
