"use client";

import type { VariantProps } from "class-variance-authority";
import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";
import { buttonVariants } from "@/components/ui/button";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { cn } from "@/lib/utils";
import { directChatMessage, whatsappUrl } from "@/lib/whatsapp";

type Props = {
  label?: string;
  message?: string;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  iconOnly?: boolean;
};

/** Opens a direct WhatsApp chat. The customer still has to press Send. */
export function WhatsAppChatButton({
  label = "Chat on WhatsApp",
  message,
  className,
  variant = "whatsapp",
  size = "xl",
  iconOnly = false,
}: Props) {
  const settings = useStoreSettings();
  const href = whatsappUrl(
    message ?? directChatMessage(settings.businessName),
    settings.whatsappNumber,
  );
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant, size }), className)}
      aria-label={iconOnly ? `${label} (opens WhatsApp)` : undefined}
    >
      <WhatsAppIcon data-icon="inline-start" />
      {!iconOnly && <span>{label}</span>}
      {!iconOnly && <span className="sr-only"> (opens WhatsApp)</span>}
    </a>
  );
}
