"use client";

import Image from "next/image";
import Link from "next/link";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { cn } from "@/lib/utils";

export function LogoMark({
  className,
  priority,
}: {
  className?: string;
  priority?: boolean;
}) {
  const { logoUrl } = useStoreSettings();
  return (
    <Image
      src={logoUrl ?? "/logo.jpg"}
      alt=""
      width={500}
      height={167}
      loading={priority ? "eager" : undefined}
      className={cn("size-10 object-contain", className)}
    />
  );
}

export function Logo({
  className,
  showTagline = false,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex shrink-0 flex-col items-start rounded-md outline-offset-4",
        className,
      )}
      aria-label="Sagacious Footies — home"
    >
      {/* The wordmark artwork already carries the business name. */}
      <LogoMark
        priority
        className="h-11 w-auto max-w-[44vw] transition-opacity duration-300 group-hover:opacity-85 sm:h-14 sm:max-w-none"
      />
      {showTagline && (
        <span className="mt-1.5 text-[0.6rem] tracking-[0.32em] text-muted-foreground uppercase">
          Step in Style
        </span>
      )}
    </Link>
  );
}
