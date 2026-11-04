import type { Metadata } from "next";
import { SelectionReview } from "@/components/cart/selection-review";
import { PageHeader } from "@/components/store/page-header";

export const metadata: Metadata = {
  title: "Your Selection",
  description: "Review your selected sandals and send your order to us on WhatsApp.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/selection" },
};

export default function SelectionPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Your selection" }]}
        eyebrow="Review"
        title="Your selection"
        description="Check your sizes and quantities. Prices and availability are confirmed live before you continue to WhatsApp."
      />
      <SelectionReview />
    </div>
  );
}
