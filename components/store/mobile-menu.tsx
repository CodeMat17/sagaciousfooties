"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NAV_LINKS } from "@/lib/nav";
import { ThemeToggle } from "./theme-toggle";
import { WhatsAppChatButton } from "./whatsapp-chat-button";

/** Slide-out menu for phones/tablets. Loaded on demand by the site header. */
export function MobileMenu({
  open,
  onOpenChange,
  pathname,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[85%] bg-background sm:max-w-sm">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
          <Logo showTagline />
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col px-6">
          {[{ href: "/", label: "Home" }, ...NAV_LINKS].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => onOpenChange(false)}
              aria-current={pathname === link.href ? "page" : undefined}
              className="border-b py-4 font-display text-2xl aria-[current=page]:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-4 px-6 pb-8">
          <WhatsAppChatButton className="w-full" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
