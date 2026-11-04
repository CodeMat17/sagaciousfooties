"use client";

import { MapPinIcon, PhoneIcon, MailIcon, ClockIcon } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { LogoMark } from "@/components/brand/logo";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { siteConfig } from "@/lib/site";
import { WhatsAppChatButton } from "./whatsapp-chat-button";

const noopSubscribe = () => () => {};

export function SiteFooter() {
  const settings = useStoreSettings();
  // Server/prerender uses a fixed year; the client corrects it after hydration.
  const year = useSyncExternalStore(
    noopSubscribe,
    () => new Date().getFullYear(),
    () => 2026,
  );
  const socials = [
    { label: "Instagram", href: settings.instagramUrl },
    { label: "Facebook", href: settings.facebookUrl },
    { label: "TikTok", href: settings.tiktokUrl },
  ].filter((s): s is { label: string; href: string } => !!s.href);

  return (
    <footer className="mt-auto bg-espresso text-ivory">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-28 sm:px-6 md:pb-12">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div className="space-y-5">
            <div className="space-y-3">
              <LogoMark className="h-16 w-auto rounded-lg sm:h-20" />
              <p className="sr-only">{settings.businessName}</p>
              <p className="text-[0.62rem] tracking-[0.32em] text-ivory/60 uppercase">
                {settings.tagline}
              </p>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-ivory/70">
              Handcrafted men&apos;s, women&apos;s and unisex sandals, made with care by skilled
              cordwainers in Aba.
            </p>
            <WhatsAppChatButton size="lg" className="h-10 px-4" />
          </div>

          <FooterColumn title="Shop">
            <FooterLink href="/shop">All sandals</FooterLink>
            <FooterLink href="/shop?for=men">Men</FooterLink>
            <FooterLink href="/shop?for=women">Women</FooterLink>
            <FooterLink href="/shop?for=unisex">Unisex</FooterLink>
            <FooterLink href="/categories">Categories</FooterLink>
            <FooterLink href="/selection">Your selection</FooterLink>
          </FooterColumn>

          <FooterColumn title="House">
            <FooterLink href="/about">Our craft</FooterLink>
            <FooterLink href="/contact">Contact &amp; visit</FooterLink>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ivory/75 transition-colors hover:text-tan"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </FooterColumn>

          <div className="space-y-4">
            <p className="text-[0.68rem] font-semibold tracking-[0.24em] text-tan uppercase">
              Visit the workshop
            </p>
            <address className="space-y-3 text-sm leading-relaxed text-ivory/75 not-italic">
              <p className="flex gap-2.5">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-tan" aria-hidden="true" />
                <a
                  href={siteConfig.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ivory"
                >
                  {settings.address}
                </a>
              </p>
              <p className="flex gap-2.5">
                <PhoneIcon className="mt-0.5 size-4 shrink-0 text-tan" aria-hidden="true" />
                <a href={`tel:+${siteConfig.whatsappNumber}`} className="hover:text-ivory">
                  {siteConfig.phoneDisplay}
                </a>
              </p>
              {settings.contactEmail && (
                <p className="flex gap-2.5">
                  <MailIcon className="mt-0.5 size-4 shrink-0 text-tan" aria-hidden="true" />
                  <a href={`mailto:${settings.contactEmail}`} className="hover:text-ivory">
                    {settings.contactEmail}
                  </a>
                </p>
              )}
              {settings.openingHours && (
                <p className="flex gap-2.5">
                  <ClockIcon className="mt-0.5 size-4 shrink-0 text-tan" aria-hidden="true" />
                  {settings.openingHours}
                </p>
              )}
            </address>
          </div>
        </div>

        <div className="hairline mt-14 opacity-40" />
        <div className="mt-6 flex flex-col gap-2 text-xs text-ivory/55 sm:flex-row sm:justify-between">
          <p>
            © {year} {settings.businessName}. All rights reserved.
          </p>
          <p>Prices in Nigerian Naira (₦). Orders are confirmed on WhatsApp.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-[0.68rem] font-semibold tracking-[0.24em] text-tan uppercase">
        {title}
      </p>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-ivory/75 transition-colors hover:text-tan">
        {children}
      </Link>
    </li>
  );
}
