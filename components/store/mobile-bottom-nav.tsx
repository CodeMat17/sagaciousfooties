"use client";

import {
  HomeIcon,
  LayoutGridIcon,
  MessageCircleIcon,
  ShoppingBagIcon,
  StoreIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { selectionSheet, useCartCount } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/shop", label: "Shop", icon: StoreIcon },
  { href: "/categories", label: "Categories", icon: LayoutGridIcon },
  { href: "/contact", label: "Contact", icon: MessageCircleIcon },
] as const;

/** Fixed bottom navigation for phones. Pages reserve space via pb-20. */
export function MobileBottomNav() {
  return (
    <Suspense fallback={<BottomNavView pathname="" />}>
      <BottomNavWithPath />
    </Suspense>
  );
}

function BottomNavWithPath() {
  return <BottomNavView pathname={usePathname()} />;
}

function BottomNavView({ pathname }: { pathname: string }) {
  const count = useCartCount();

  const itemClass =
    "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[0.65rem] font-medium tracking-wide";

  return (
    <nav
      aria-label="Quick navigation"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-background/92 backdrop-blur-md md:hidden"
    >
      <div className="flex h-16 items-stretch">
        {ITEMS.slice(0, 2).map((item) => (
          <NavItem key={item.href} {...item} pathname={pathname} className={itemClass} />
        ))}
        <button
          type="button"
          onClick={() => selectionSheet.open()}
          className={cn(itemClass, "relative")}
          aria-label={`Selection, ${count} ${count === 1 ? "item" : "items"}`}
        >
          <span className="relative">
            <ShoppingBagIcon className="size-5" aria-hidden="true" />
            {count > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[0.58rem] font-semibold text-brand-foreground"
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </span>
          Selection
        </button>
        {ITEMS.slice(2).map((item) => (
          <NavItem key={item.href} {...item} pathname={pathname} className={itemClass} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  pathname,
  className,
}: {
  href: string;
  label: string;
  icon: typeof HomeIcon;
  pathname: string;
  className: string;
}) {
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(className, active ? "text-brand" : "text-muted-foreground")}
    >
      <Icon className="size-5" aria-hidden="true" />
      {label}
    </Link>
  );
}
