import { Suspense } from "react";
import { SelectionSheet } from "@/components/cart/selection-sheet";
import { MobileBottomNav } from "@/components/store/mobile-bottom-nav";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      {/* Suspense boundaries let React hydrate these in separate,
          interruptible chunks instead of one long main-thread task. */}
      <Suspense>
        <SiteFooter />
      </Suspense>
      <Suspense>
        <MobileBottomNav />
      </Suspense>
      <Suspense>
        <SelectionSheet />
      </Suspense>
    </>
  );
}
