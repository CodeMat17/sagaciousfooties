import type { ReactNode } from "react";
import { PageHeader } from "./page-header";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
      <PageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: title }]}
        eyebrow={`Last updated ${updated}`}
        title={title}
      />
      <div className="space-y-6 leading-relaxed text-muted-foreground [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground [&_ul]:space-y-2">
        {children}
      </div>
    </div>
  );
}
