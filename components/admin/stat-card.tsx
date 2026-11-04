import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  tone = "default",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  tone?: "default" | "brand" | "muted";
}) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
          {label}
        </p>
        <Icon
          className={cn("size-4", tone === "brand" ? "text-brand" : "text-muted-foreground")}
          aria-hidden="true"
        />
      </div>
      <p className="mt-3 font-display text-4xl font-semibold lining-nums tabular-nums">{value}</p>
    </>
  );
  const className =
    "block rounded-lg border bg-card p-5 transition-colors hover:border-foreground/25";
  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
