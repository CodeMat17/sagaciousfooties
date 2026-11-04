import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

export function Crumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, i) => (
          <Fragment key={`${item.label}-${i}`}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink render={<Link href={item.href} />}>{item.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="max-w-[16rem] truncate">{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {i < items.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
  className,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  crumbs?: Crumb[];
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("pt-6 pb-8 sm:pt-10 sm:pb-12", className)}>
      {crumbs && <Crumbs items={crumbs} className="mb-6" />}
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="mt-2 text-5xl leading-[1.02] text-balance sm:text-6xl">{title}</h1>
      {description && (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
