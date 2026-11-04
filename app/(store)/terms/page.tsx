import type { Metadata } from "next";
import { LegalPage } from "@/components/store/legal-page";
import { fullAddress, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for using the Sagacious Footies website and ordering via WhatsApp.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="November 2026">
      <p>
        By using this website you agree to these terms. Please read them
        alongside our privacy policy.
      </p>
      <h2>Ordering</h2>
      <ul>
        <li>
          This website is a catalogue. Building a selection and opening WhatsApp
          does not place an order or reserve stock.
        </li>
        <li>
          An order is only confirmed once we reply on WhatsApp to confirm
          availability, the final price, payment and delivery details.
        </li>
        <li>
          Prices are shown in Nigerian Naira (₦) and checked live, but may change
          before an order is confirmed. Delivery charges, where applicable, are
          agreed on WhatsApp.
        </li>
      </ul>
      <h2>Products</h2>
      <p>
        Our sandals are handcrafted, so small variations in colour, texture and
        finish are a natural part of each pair. Photos are representative of the
        design.
      </p>
      <h2>Returns & exchanges</h2>
      <p>
        Please discuss sizing with us before ordering. Any exchange or return
        arrangement is agreed with you on WhatsApp at the time of your order.
      </p>
      <h2>Website content</h2>
      <p>
        All content on this site, including the {siteConfig.name} name and
        emblem, belongs to {siteConfig.name} and may not be reused without
        permission.
      </p>
      <h2>Contact</h2>
      <p>
        {siteConfig.name}, {fullAddress}. WhatsApp: {siteConfig.phoneDisplay}.
      </p>
    </LegalPage>
  );
}
