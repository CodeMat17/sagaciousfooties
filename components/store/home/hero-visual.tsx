"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { STOCK_HERO_IMAGES, type StockImage } from "@/lib/stock-images";
import { cn } from "@/lib/utils";

/** How long each photo stays on screen before crossfading to the next. */
const SLIDE_MS = 6000;

/**
 * Crossfading hero slideshow of the owner's hero photos (admin Settings),
 * or stand-in sandal photos until some are uploaded. Auto-advance pauses on
 * hover/focus and is off entirely for people who prefer reduced motion.
 *
 * `initialImageUrls` comes from the server so the first photo is in the
 * initial HTML (it's the page's LCP element); the live Convex subscription
 * takes over once it has loaded.
 */
export function HeroVisual({ initialImageUrls }: { initialImageUrls: string[] }) {
  const settings = useStoreSettings();
  // `?? []` guards against a Convex backend still serving the old shape
  // (e.g. right after a deploy, before functions are pushed).
  const heroImageUrls = settings.loaded ? (settings.heroImageUrls ?? []) : initialImageUrls;
  const slides: StockImage[] =
    heroImageUrls.length > 0
      ? heroImageUrls.map((url, i, all) => ({
          url,
          alt:
            all.length > 1
              ? `Handcrafted sandals by ${settings.businessName} (photo ${i + 1} of ${all.length})`
              : `Handcrafted sandals by ${settings.businessName}`,
        }))
      : STOCK_HERO_IMAGES;

  return (
    <div className="relative aspect-16/10 w-full overflow-hidden rounded-lg bg-espresso md:aspect-5/6 lg:aspect-auto lg:h-[88%]">
      <Slideshow key={slides.map((s) => s.url).join("|")} slides={slides} />
      <HeroBadge />
    </div>
  );
}

function Slideshow({ slides }: { slides: StockImage[] }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  // Only the first photo loads up front; the rest wait until the page has
  // finished loading so they never compete with it for bandwidth.
  const [warm, setWarm] = useState(false);
  const paused = hovered || focused;
  const multiple = slides.length > 1;

  useEffect(() => {
    if (!multiple) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const warmUp = () => {
      timer = setTimeout(() => setWarm(true), 1500);
    };
    if (document.readyState === "complete") warmUp();
    else window.addEventListener("load", warmUp, { once: true });
    return () => {
      window.removeEventListener("load", warmUp);
      clearTimeout(timer);
    };
  }, [multiple]);

  return (
    <div
      className="absolute inset-0"
      role={multiple ? "region" : undefined}
      aria-roledescription={multiple ? "carousel" : undefined}
      aria-label={multiple ? "Featured sandals" : undefined}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      {slides.map((slide, i) => {
        const isActive = i === active;
        return (
          <div
            key={slide.url}
            aria-hidden={!isActive}
            className={cn(
              "absolute inset-0 transition-opacity duration-1200 ease-in-out motion-reduce:duration-300",
              isActive ? "opacity-100" : "opacity-0",
            )}
          >
            {(i === 0 || isActive || warm) && (
              <Image
                src={slide.url}
                alt={isActive ? slide.alt : ""}
                fill
                preload={i === 0}
                sizes="(min-width: 768px) 48vw, 100vw"
                className={cn(
                  "object-cover transition-transform ease-out motion-reduce:transition-none",
                  // Slow push-in on the visible photo; reset while hidden.
                  isActive ? "scale-105 duration-7000" : "scale-100 duration-0",
                )}
              />
            )}
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-espresso/60 via-espresso/5 to-transparent" />

      {multiple && (
        <ul className="absolute inset-x-0 bottom-0 flex justify-center gap-2 p-3 sm:gap-2.5 sm:p-5 md:justify-start">
          {slides.map((slide, i) => {
            const isActive = i === active;
            return (
              <li key={slide.url}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show photo ${i + 1} of ${slides.length}`}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "relative block size-10 overflow-hidden rounded-md border-2 transition-[opacity,border-color,transform] duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ivory focus-visible:ring-offset-2 focus-visible:ring-offset-espresso sm:size-14",
                    isActive
                      ? "border-ivory opacity-100"
                      : "border-ivory/30 opacity-70 hover:-translate-y-0.5 hover:border-ivory/70 hover:opacity-100",
                  )}
                >
                  <Image src={slide.url} alt="" fill sizes="56px" className="object-cover" />
                  {isActive && (
                    // Progress bar doubles as the timer: when its animation ends
                    // we advance. Pausing the animation pauses the slideshow.
                    <span
                      aria-hidden="true"
                      onAnimationEnd={() => setActive((a) => (a + 1) % slides.length)}
                      className="absolute inset-x-0 bottom-0 h-0.75 origin-left bg-ivory motion-reduce:hidden"
                      style={{
                        animation: `hero-progress ${SLIDE_MS}ms linear forwards`,
                        animationPlayState: paused ? "paused" : "running",
                      }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function HeroBadge() {
  return (
    <div className="pointer-events-none absolute top-4 right-4 flex size-16 flex-col items-center justify-center rounded-full border border-ivory/40 bg-ivory/10 text-center text-ivory backdrop-blur-sm sm:top-5 sm:right-5 sm:size-24">
      <span className="font-display text-base leading-none italic sm:text-xl">Made</span>
      <span className="text-[0.55rem] tracking-[0.25em] uppercase">in Aba</span>
    </div>
  );
}
