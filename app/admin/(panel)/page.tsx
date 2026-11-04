"use client";

import { useQuery } from "convex/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  CheckCircle2Icon,
  EyeIcon,
  FolderTreeIcon,
  InboxIcon,
  PackageIcon,
  PlusIcon,
  SparklesIcon,
  StarIcon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useAdminToken } from "@/components/admin/admin-session";
import { StatCard } from "@/components/admin/stat-card";
import { ProductImage } from "@/components/store/product-image";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { formatNaira } from "@/lib/currency";

dayjs.extend(relativeTime);

export default function AdminDashboardPage() {
  const token = useAdminToken();
  const data = useQuery(api.admin.products.dashboard, { sessionToken: token });

  return (
    <>
      <AdminPageHeader
        title="Overview"
        description="Your catalogue at a glance. Changes appear on the store instantly."
        actions={
          <>
            <Link href="/admin/categories" className={buttonVariants({ variant: "outline", size: "lg" })}>
              <FolderTreeIcon data-icon="inline-start" />
              Categories
            </Link>
            <Link href="/admin/products/new" className={buttonVariants({ size: "lg" })}>
              <PlusIcon data-icon="inline-start" />
              Add product
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {data ? (
          <>
            <StatCard label="Products" value={data.totals.products} icon={PackageIcon} href="/admin/products" tone="brand" />
            <StatCard label="Published" value={data.totals.published} icon={EyeIcon} href="/admin/products?status=published" />
            <StatCard label="Available" value={data.totals.available} icon={CheckCircle2Icon} href="/admin/products?status=available" />
            <StatCard label="Sold out" value={data.totals.soldOut} icon={XCircleIcon} href="/admin/products?status=sold_out" />
            <StatCard label="Featured" value={data.totals.featured} icon={StarIcon} href="/admin/products?status=featured" />
            <StatCard label="New arrivals" value={data.totals.newArrivals} icon={SparklesIcon} href="/admin/products?status=new" />
            <StatCard label="Categories" value={data.totals.categories} icon={FolderTreeIcon} href="/admin/categories" />
            <StatCard label="Open enquiries" value={data.totals.openEnquiries} icon={InboxIcon} href="/admin/enquiries" tone="brand" />
          </>
        ) : (
          Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-[6.75rem] rounded-lg" />)
        )}
      </div>

      <section className="mt-10" aria-labelledby="recent-heading">
        <div className="mb-4 flex items-end justify-between">
          <h2 id="recent-heading" className="text-3xl">
            Recently updated
          </h2>
          <Link href="/admin/products" className="text-sm font-medium underline-offset-4 hover:underline">
            All products
          </Link>
        </div>
        <div className="divide-y rounded-lg border bg-card">
          {data === undefined &&
            Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="size-14 rounded-md" />
                <Skeleton className="h-5 flex-1" />
              </div>
            ))}
          {data?.recent.length === 0 && (
            <div className="p-10 text-center">
              <p className="font-display text-2xl">No products yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Add your first design to open the store.</p>
              <Link href="/admin/products/new" className={buttonVariants({ className: "mt-4" })}>
                <PlusIcon data-icon="inline-start" /> Add product
              </Link>
            </div>
          )}
          {data?.recent.map((p) => (
            <Link
              key={p._id}
              href={`/admin/products/${p._id}`}
              className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
            >
              <ProductImage
                image={p.image}
                name={p.name}
                sizes="56px"
                className="size-14 shrink-0 rounded-md"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatNaira(p.price)} · updated {dayjs(p.updatedAt).fromNow()}
                </p>
              </div>
              <div className="hidden gap-1.5 sm:flex">
                <Badge variant={p.published ? "default" : "outline"}>
                  {p.published ? "Published" : "Draft"}
                </Badge>
                {!p.available && <Badge variant="destructive">Sold out</Badge>}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
