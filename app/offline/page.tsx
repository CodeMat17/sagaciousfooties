import type { Metadata } from "next";
import Image from "next/image";
import { ReloadButton } from "./reload-button";

export const metadata: Metadata = {
  title: "You're offline",
  robots: { index: false },
};

/** Precached by the service worker and shown when navigation fails offline. */
export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <Image src="/logo-sm.webp" alt="" width={96} height={96} className="size-20" />
      <p className="eyebrow">No connection</p>
      <h1 className="text-5xl text-balance">You&apos;re offline</h1>
      <p className="max-w-md text-muted-foreground">
        Prices and size availability are always checked live, so we need a
        connection to show the collection. Your selection is saved on this
        device and will be waiting when you&apos;re back online.
      </p>
      <ReloadButton />
    </main>
  );
}
