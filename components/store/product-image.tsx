import Image from "next/image";
import { cn } from "@/lib/utils";

export type ProductImageData = { url: string; alt: string };

/** Product photo, or an intentional branded placeholder when none exists. */
export function ProductImage({
  image,
  name,
  sizes,
  priority,
  className,
  imageClassName,
  showPlaceholderLabel = true,
}: {
  image: ProductImageData | null | undefined;
  name: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  showPlaceholderLabel?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-surface", className)}>
      {image ? (
        <Image
          src={image.url}
          alt={image.alt || name}
          fill
          sizes={sizes}
          preload={priority}
          className={cn("object-cover", imageClassName)}
        />
      ) : (
        <ImagePlaceholder name={name} showLabel={showPlaceholderLabel} />
      )}
    </div>
  );
}

export function ImagePlaceholder({
  name,
  showLabel = true,
}: {
  name: string;
  showLabel?: boolean;
}) {
  return (
    <div
      role="img"
      aria-label={`${name} — photo coming soon`}
      className="grain absolute inset-0 flex flex-col items-center justify-center bg-[#e9dcc6] dark:bg-[#2a2119]"
    >
      <Image
        src="/logo.jpg"
        alt=""
        width={160}
        height={160}
        className="size-[34%] max-w-28 object-contain opacity-80 drop-shadow-[0_8px_18px_rgba(48,39,31,0.25)]"
      />
      {showLabel && (
      <span className="mt-3 text-[0.6rem] tracking-[0.3em] text-muted-foreground uppercase">
        Photo coming soon
      </span>
      )}
    </div>
  );
}
