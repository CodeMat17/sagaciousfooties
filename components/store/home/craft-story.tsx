import { ArrowRightIcon, HammerIcon, RulerIcon, SparklesIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { WhatsAppChatButton } from "../whatsapp-chat-button";

const PILLARS = [
  {
    icon: HammerIcon,
    title: "Made by hand",
    text: "Every pair is cut, stitched and finished by skilled cordwainers in our Aba workshop.",
  },
  {
    icon: RulerIcon,
    title: "Sized with care",
    text: "Each design lists its own sizes and live availability, so you always see what's ready.",
  },
  {
    icon: SparklesIcon,
    title: "Finished to last",
    text: "Clean edges, firm soles and details that look as good on day one hundred as on day one.",
  },
];

export function CraftStory() {
  return (
    <section aria-labelledby="craft-heading" className="bg-espresso text-ivory">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-[1fr_1.1fr] md:items-center md:py-28 lg:gap-20">
        <Reveal className="relative mx-auto w-full max-w-md">
          <div className="grain relative flex aspect-square items-center justify-center rounded-full border border-tan/30">
            <div className="absolute inset-6 rounded-full border border-tan/15" />
            <Image
              src="/about.webp"
              alt=""
              width={612}
              height={408}
              sizes="(min-width: 768px) 25vw, 60vw"
              className="w-[62%] drop-shadow-[0_25px_45px_rgba(0,0,0,0.5)]"
            />
          </div>
        </Reveal>
        <div className="space-y-8">
          <Reveal>
            <p className="text-[0.7rem] font-medium tracking-[0.28em] text-tan uppercase">
              Our craft
            </p>
            <h2 id="craft-heading" className="mt-3 text-4xl leading-tight sm:text-5xl lg:text-6xl">
              From the heart of Ariaria, <em className="text-tan">one pair at a time.</em>
            </h2>
            <p className="mt-5 max-w-lg leading-relaxed text-ivory/75">
              Aba is Nigeria&apos;s home of shoemaking, and Sagacious Footies is
              proudly part of that tradition. We design and handcraft sandals
              that pair everyday comfort with quiet confidence.
            </p>
          </Reveal>
          <ul className="grid gap-6 sm:grid-cols-3">
            {PILLARS.map((pillar, i) => (
              <Reveal
                as="li"
                key={pillar.title}
                delay={i * 0.08}
                className="space-y-2.5 border-t border-ivory/15 pt-5"
              >
                <pillar.icon className="size-5 text-tan" aria-hidden="true" />
                <h3 className="text-xl">{pillar.title}</h3>
                <p className="text-sm leading-relaxed text-ivory/65">{pillar.text}</p>
              </Reveal>
            ))}
          </ul>
          <Link
            href="/about"
            className="group inline-flex items-center gap-2 text-sm font-medium text-tan"
          >
            <span className="underline-offset-4 group-hover:underline">Read our story</span>
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function WhatsAppCta() {
  return (
    <section aria-labelledby="cta-heading" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24">
      <Reveal className="grain relative overflow-hidden rounded-xl border bg-card px-6 py-14 text-center sm:px-12 sm:py-20">
        <p className="eyebrow">Personal service</p>
        <h2 id="cta-heading" className="mx-auto mt-3 max-w-2xl text-4xl text-balance sm:text-5xl">
          Need help choosing a size or design?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Chat with us directly on WhatsApp. We&apos;ll help with sizing,
          availability and delivery arrangements.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <WhatsAppChatButton />
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-lg px-6 text-[0.95rem] font-medium underline-offset-4 hover:underline"
          >
            Visit the shop in Aba
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
