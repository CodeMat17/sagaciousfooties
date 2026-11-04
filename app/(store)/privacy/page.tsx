import type { Metadata } from "next";
import { LegalPage } from "@/components/store/legal-page";
import { fullAddress, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Sagacious Footies handles your information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 2026">
      <p>
        {siteConfig.name} respects your privacy. This policy explains what
        information is involved when you use this website and how we use it.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Your selection.</strong> Products, sizes and quantities you
          choose are stored only in your own browser (local storage) so your
          selection survives page refreshes. We do not receive it until you
          choose to send it.
        </li>
        <li>
          <strong>WhatsApp messages.</strong> When you tap a WhatsApp button,
          WhatsApp opens with a pre-written message. Nothing is sent until you
          press Send. Messages you send are handled by WhatsApp under its own
          privacy policy, and we use them only to respond to your enquiry and
          fulfil your order.
        </li>
        <li>
          <strong>Order records.</strong> We may keep a simple record of
          enquiries (such as your name, phone number and the items requested) to
          manage your order and provide after-sales support.
        </li>
      </ul>
      <h2>What we don&apos;t do</h2>
      <ul>
        <li>We don&apos;t require you to create an account.</li>
        <li>We don&apos;t take payments on this website.</li>
        <li>We don&apos;t sell your personal information.</li>
      </ul>
      <h2>Your choices</h2>
      <p>
        You can clear your selection at any time from the selection page, or by
        clearing your browser&apos;s site data. To ask about or remove an enquiry
        record we hold, contact us on WhatsApp at {siteConfig.phoneDisplay}.
      </p>
      <h2>Contact</h2>
      <p>
        {siteConfig.name}, {fullAddress}.
      </p>
    </LegalPage>
  );
}
