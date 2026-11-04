"use client";

import {
  ClockIcon,
  ExternalLinkIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TruckIcon,
} from "lucide-react";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { siteConfig } from "@/lib/site";
import { WhatsAppChatButton } from "./whatsapp-chat-button";

export function ContactDetails() {
  const settings = useStoreSettings();
  const phoneDisplay = settings.whatsappNumber.startsWith("234")
    ? `0${settings.whatsappNumber.slice(3)}`
    : settings.whatsappNumber;
  const mapQuery = encodeURIComponent(
    "Shoe Plaza, Ariaria International Market, Aba, Abia State, Nigeria",
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
      <div className="space-y-6">
        <div className="grain rounded-lg bg-espresso p-8 text-ivory">
          <p className="text-[0.68rem] tracking-[0.28em] text-tan uppercase">
            Fastest response
          </p>
          <h2 className="mt-2 text-4xl">Chat on WhatsApp</h2>
          <p className="mt-3 text-sm leading-relaxed text-ivory/75">
            Ask about sizes, availability or an order. WhatsApp opens with a
            short greeting — you choose when to send it.
          </p>
          <WhatsAppChatButton className="mt-6 w-full sm:w-auto" />
        </div>

        <dl className="divide-y rounded-lg border bg-card">
          <Row icon={MapPinIcon} label="Shop address">
            <address className="not-italic">{settings.address}</address>
            <a
              href={siteConfig.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand underline-offset-4 hover:underline"
            >
              Get directions <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
            </a>
          </Row>
          <Row icon={PhoneIcon} label="Phone & WhatsApp">
            <a href={`tel:+${settings.whatsappNumber}`} className="hover:text-brand">
              {phoneDisplay}
            </a>
          </Row>
          {settings.contactEmail && (
            <Row icon={MailIcon} label="Email">
              <a href={`mailto:${settings.contactEmail}`} className="hover:text-brand">
                {settings.contactEmail}
              </a>
            </Row>
          )}
          {settings.openingHours && (
            <Row icon={ClockIcon} label="Opening hours">
              {settings.openingHours}
            </Row>
          )}
          <Row icon={TruckIcon} label="Delivery">
            {settings.deliveryInformation}
          </Row>
        </dl>
      </div>

      <div className="overflow-hidden rounded-lg border bg-surface">
        <iframe
          title="Map showing Shoe Plaza, Ariaria International Market, Aba"
          src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-[22rem] w-full border-0 lg:h-full lg:min-h-[32rem]"
        />
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPinIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    // A <dl> may only group <dt>/<dd> in a plain <div>, so the icon lives
    // inside the <dt> and is positioned into the left gutter.
    <div className="relative min-w-0 py-5 pr-5 pl-14">
      <dt className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        <Icon className="absolute top-5.5 left-5 size-5 text-brand" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 leading-relaxed">{children}</dd>
    </div>
  );
}
