import { ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { PageHeader } from "@/components/store/page-header";
import { WhatsAppChatButton } from "@/components/store/whatsapp-chat-button";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Our Craft",
  description:
    "Sagacious Footies handcrafts premium sandals for men, women and unisex wear in Ariaria International Market, Aba — Nigeria's home of shoemaking.",
  alternates: { canonical: "/about" },
};

const STEPS = [
  {
    n: "01",
    title: "Design",
    text: "Every silhouette starts with how it should feel on the foot — balanced, supportive and easy to wear all day.",
  },
  {
    n: "02",
    title: "Cut & stitch",
    text: "Straps and uppers are cut and stitched by hand, with attention on the edges and seams you notice up close.",
  },
  {
    n: "03",
    title: "Last & sole",
    text: "Each pair is shaped and fixed to a firm sole, then checked for fit, comfort and finish.",
  },
  {
    n: "04",
    title: "Finish",
    text: "Final polishing and inspection before a pair is ready to leave the workshop for its new owner.",
  },
];

export default function AboutPage() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <PageHeader
          crumbs={[{ label: "Home", href: "/" }, { label: "Our craft" }]}
          eyebrow="Our craft"
          title={
            <>
              Made in Aba. <em className="text-brand">Made to be worn.</em>
            </>
          }
          description="Sagacious Footies is a cordwainer's house in the heart of Ariaria International Market, Aba. We handcraft men's, women's and unisex sandals for people who value comfort, confidence and quiet elegance."
        />
      </div>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 sm:px-6 md:grid-cols-2 md:items-center lg:gap-20">
        <Reveal>
          <div className="grain relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-espresso">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(201,162,92,0.35),transparent_60%)]" />
            <Image
              src="/about.webp"
              alt="Sagacious Footies emblem"
              width={612}
              height={408}
              sizes="(min-width: 768px) 30vw, 70vw"
              preload
              className="relative w-[58%] drop-shadow-[0_25px_45px_rgba(0,0,0,0.5)]"
            />
          </div>
        </Reveal>
        <Reveal className="space-y-5 text-lg leading-relaxed text-muted-foreground">
          <h2 className="text-4xl text-foreground sm:text-5xl">A tradition we&apos;re proud of</h2>
          <p>
            Aba has long been known as the home of Nigerian shoemaking. Its
            markets and workshops are full of craftspeople whose skill is passed
            from hand to hand.
          </p>
          <p>
            Sagacious Footies carries that tradition forward. Our name is a
            promise: footwear made with good judgement — practical, well-made,
            and stylish enough to make every step count.
          </p>
          <p className="font-display text-2xl text-foreground italic">
            &ldquo;Step in Style&rdquo; isn&apos;t a slogan. It&apos;s how every pair is made.
          </p>
        </Reveal>
      </section>

      <section aria-labelledby="process-heading" className="border-y bg-surface/70 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow">The process</p>
          <h2 id="process-heading" className="mt-2 text-4xl sm:text-5xl">
            How a pair is made
          </h2>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <Reveal
                as="li"
                key={step.n}
                delay={i * 0.06}
                className="space-y-3 border-t border-foreground/15 pt-6"
              >
                <span className="font-display text-5xl text-brand">{step.n}</span>
                <h3 className="text-2xl">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h2 className="text-4xl text-balance sm:text-5xl">Find the pair that fits your step</h2>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Browse the collection online, or chat with us for sizing help and
          enquiries.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/shop" className={buttonVariants({ size: "xl" })}>
            Explore Collection
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
          <WhatsAppChatButton variant="outline" />
        </div>
      </section>
    </>
  );
}
