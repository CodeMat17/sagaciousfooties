import { formatNaira } from "./currency";
import { siteConfig } from "./site";

export type WhatsappOrderLine = {
  name: string;
  size: number;
  quantity: number;
  unitPrice: number;
};

function cleanNumber(number: string | undefined): string {
  const digits = (number ?? "").replace(/\D/g, "");
  return digits.length >= 10 ? digits : siteConfig.whatsappNumber;
}

export function whatsappUrl(message: string, number?: string): string {
  return `https://wa.me/${cleanNumber(number)}?text=${encodeURIComponent(message)}`;
}

export function directChatMessage(businessName: string = siteConfig.name): string {
  return `Hello ${businessName}, I'd like to make an enquiry about your sandals.`;
}

/** Builds the multi-product order enquiry from validated, current data. */
export function buildOrderMessage(
  lines: WhatsappOrderLine[],
  businessName: string = siteConfig.name,
): string {
  const body = lines
    .map((line, index) =>
      [
        `${index + 1}. ${line.name}`,
        `   Size: ${line.size}`,
        `   Quantity: ${line.quantity}`,
        `   Unit price: ${formatNaira(line.unitPrice)}`,
        `   Subtotal: ${formatNaira(line.unitPrice * line.quantity)}`,
      ].join("\n"),
    )
    .join("\n\n");
  const total = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  return [
    `Hello ${businessName},`,
    "",
    "I would like to make an order enquiry for the following:",
    "",
    body,
    "",
    `Total: ${formatNaira(total)}`,
    "",
    "Please confirm availability and provide payment and delivery details.",
    "",
    "Thank you.",
  ].join("\n");
}

export function buildProductEnquiry(opts: {
  businessName?: string;
  name: string;
  url: string;
  price: number;
  size?: number | null;
  quantity?: number;
}): string {
  const lines = [
    `Hello ${opts.businessName ?? siteConfig.name},`,
    "",
    `I'm interested in the ${opts.name} (${formatNaira(opts.price)}).`,
  ];
  if (opts.size) lines.push(`Size: ${opts.size}`);
  if (opts.size && opts.quantity) lines.push(`Quantity: ${opts.quantity}`);
  lines.push("", opts.url, "", "Is it available?");
  return lines.join("\n");
}
