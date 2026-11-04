"use client";

import { ExpandIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ImagePlaceholder, type ProductImageData } from "./product-image";

export function ProductGallery({
  images,
  name,
}: {
  images: ProductImageData[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const current = Math.min(active, Math.max(images.length - 1, 0));

  if (images.length === 0) {
    return (
      <div className="relative aspect-4/5 overflow-hidden rounded-lg">
        <ImagePlaceholder name={name} />
      </div>
    );
  }

  function goTo(index: number) {
    setActive(index);
    const el = scroller.current;
    if (el) el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row md:gap-4">
      {images.length > 1 && (
        <div
          role="tablist"
          aria-label="Product photos"
          className="scrollbar-none flex gap-2 overflow-x-auto md:max-h-[42rem] md:w-20 md:shrink-0 md:flex-col md:overflow-y-auto"
        >
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              role="tab"
              aria-selected={index === current}
              aria-label={`Show photo ${index + 1} of ${images.length}`}
              onClick={() => goTo(index)}
              className={cn(
                "relative aspect-4/5 w-16 shrink-0 overflow-hidden rounded-md border-2 transition md:w-full",
                index === current
                  ? "border-brand"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1">
        <div
          ref={scroller}
          onScroll={(e) => {
            const el = e.currentTarget;
            const index = Math.round(el.scrollLeft / el.clientWidth);
            if (index !== current) setActive(index);
          }}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto rounded-lg md:overflow-hidden"
        >
          {images.map((image, index) => (
            <div
              key={image.url}
              className="relative aspect-4/5 w-full shrink-0 snap-center bg-surface"
              aria-hidden={index !== current}
            >
              <Image
                src={image.url}
                alt={image.alt || `${name} — photo ${index + 1}`}
                fill
                preload={index === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="absolute right-3 bottom-3 flex size-10 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition hover:bg-background"
          aria-label="View photo full screen"
        >
          <ExpandIcon className="size-4" aria-hidden="true" />
        </button>
        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5 md:hidden" aria-hidden="true">
            {images.map((image, index) => (
              <span
                key={image.url}
                className={cn(
                  "h-1.5 rounded-full bg-ivory/90 shadow transition-all",
                  index === current ? "w-5" : "w-1.5 opacity-60",
                )}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-h-[94dvh] w-auto max-w-[94vw] bg-background p-2 sm:max-w-[min(94vw,64rem)]">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <div className="relative h-[85dvh] w-[90vw] max-w-5xl">
            <Image
              src={images[current].url}
              alt={images[current].alt || name}
              fill
              sizes="94vw"
              className="object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
