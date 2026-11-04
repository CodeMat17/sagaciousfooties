"use client";

import { MenuIcon, ShoppingBagIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { selectionSheet, useCartCount } from "@/lib/cart-store";
import { NAV_LINKS } from "@/lib/nav";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

// Closed on first paint: its code loads the first time the menu opens.
const MobileMenu = dynamic(() => import("./mobile-menu").then((m) => m.MobileMenu), {
  ssr: false,
});

/** Pathname is request data, so it streams in; the fallback renders the same header. */
export function SiteHeader() {
  return (
    <Suspense fallback={<HeaderView pathname="" />}>
      <HeaderWithPath />
    </Suspense>
  );
}

function HeaderWithPath() {
  return <HeaderView pathname={usePathname()} />;
}

function HeaderView({ pathname }: { pathname: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Stays mounted after the first open so the close animation still plays.
  const [menuUsed, setMenuUsed] = useState(false);
  if (menuOpen && !menuUsed) setMenuUsed(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "border-b bg-background/85 shadow-[0_8px_30px_-20px_rgba(48,39,31,0.35)] backdrop-blur-md"
          : "border-b border-transparent bg-background",
      )}
    >
      <div className="hidden bg-espresso text-ivory sm:block">
        <p className="mx-auto max-w-7xl px-4 py-1.5 text-center text-[0.68rem] tracking-[0.24em] uppercase sm:px-6">
          Handcrafted in Aba · Order easily on WhatsApp · {siteConfig.phoneDisplay}
        </p>
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6">
        <div className="flex items-center gap-1 lg:hidden">
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="-ml-2"
          >
            <MenuIcon className="size-6" />
          </Button>
        </div>

        <Logo className="lg:mr-auto" />

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative px-4 py-2 text-[0.95rem] font-medium tracking-wide transition-colors hover:text-brand",
                  "after:absolute after:inset-x-4 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-brand after:transition-transform after:duration-300 hover:after:scale-x-100",
                  active && "text-brand after:scale-x-100",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 lg:ml-6">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <SelectionButton />
        </div>
      </div>

      {menuUsed && (
        <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} pathname={pathname} />
      )}
    </header>
  );
}

function SelectionButton() {
  const count = useCartCount();
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      className="relative -mr-2 sm:mr-0"
      onClick={() => selectionSheet.open()}
      aria-label={`Open your selection, ${count} ${count === 1 ? "item" : "items"}`}
    >
      <ShoppingBagIcon />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-brand px-1 text-[0.62rem] font-semibold text-brand-foreground lining-nums tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Button>
  );
}
