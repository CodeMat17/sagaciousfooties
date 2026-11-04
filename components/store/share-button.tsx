"use client";

import { CheckIcon, Share2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Native Web Share where available, with a copy-link fallback. */
export function ShareButton({
  title,
  text,
  url,
  className,
}: {
  title: string;
  text?: string;
  url: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const data = { title, text, url };
    if (typeof navigator.share === "function" && navigator.canShare?.(data) !== false) {
      try {
        await navigator.share(data);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied", { description: "Paste it anywhere to share." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link", { description: url });
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="xl"
      onClick={share}
      className={className}
      aria-label={`Share ${title}`}
    >
      {copied ? <CheckIcon data-icon="inline-start" /> : <Share2Icon data-icon="inline-start" />}
      {copied ? "Copied" : "Share"}
    </Button>
  );
}
