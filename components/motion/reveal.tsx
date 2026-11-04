import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Restrained fade-up as the element scrolls into view.
 *
 * Pure CSS (scroll-driven animation, see `.reveal` in globals.css): no JS,
 * no hydration cost, and nothing is hidden before scripts load. Browsers
 * without `animation-timeline` support, and reduced-motion users, simply see
 * the content without the effect.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  y = 18,
  as: Tag = "div",
}: {
  children: ReactNode;
  /** Stagger, in seconds (kept for API compatibility; mapped to scroll range). */
  delay?: number;
  className?: string;
  y?: number;
  as?: "div" | "li";
}) {
  return (
    <Tag
      className={cn("reveal", className)}
      style={
        {
          "--reveal-y": `${y}px`,
          "--reveal-offset": `${Math.round(delay * 100)}%`,
        } as CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
