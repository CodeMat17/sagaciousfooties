import type { Metadata } from "next";
import { ContactDetails } from "@/components/store/contact-details";
import { PageHeader } from "@/components/store/page-header";
import { fullAddress } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & Visit",
  description: `Chat with Sagacious Footies on WhatsApp (07044663337) or visit our shop: ${fullAddress}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        eyebrow="We'd love to hear from you"
        title="Contact & visit"
        description="The fastest way to reach us is WhatsApp. You're also welcome to visit the shop in Ariaria International Market."
      />
      <ContactDetails />
    </div>
  );
}
