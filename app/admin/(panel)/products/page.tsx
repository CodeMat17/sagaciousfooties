"use client";

import { useMutation, useQuery } from "convex/react";
import {
  ExternalLinkIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  RulerIcon,
  SearchIcon,
  SparklesIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { errorMessage, useAdminToken } from "@/components/admin/admin-session";
import { SizeAvailabilityDialog } from "@/components/admin/size-availability-dialog";
import { ProductImage } from "@/components/store/product-image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { FunctionReturnType } from "convex/server";
import { formatNaira } from "@/lib/currency";
import { cn } from "@/lib/utils";

type AdminProduct = FunctionReturnType<typeof api.admin.products.list>[number];

const STATUS = {
  all: "All products",
  published: "Published",
  draft: "Drafts",
  available: "Available",
  sold_out: "Sold out",
  featured: "Featured",
  new: "New arrivals",
} as const;
type Status = keyof typeof STATUS;

export default function AdminProductsPage() {
  const token = useAdminToken();
  const products = useQuery(api.admin.products.list, { sessionToken: token });
  const setFlag = useMutation(api.admin.products.setFlag);
  const remove = useMutation(api.admin.products.remove);
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [sizesFor, setSizesFor] = useState<Id<"products"> | null>(null);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);

  const statusParam = params.get("status");
  const status: Status = statusParam && statusParam in STATUS ? (statusParam as Status) : "all";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (products ?? []).filter((p) => {
      if (q && !`${p.name} ${p.slug} ${p.categoryName}`.toLowerCase().includes(q)) return false;
      switch (status) {
        case "published":
          return p.published;
        case "draft":
          return !p.published;
        case "available":
          return p.available;
        case "sold_out":
          return !p.available;
        case "featured":
          return p.featured;
        case "new":
          return p.isNewArrival;
        default:
          return true;
      }
    });
  }, [products, search, status]);

  async function toggle(
    p: AdminProduct,
    flag: "published" | "featured" | "isNewArrival",
    value: boolean,
  ) {
    try {
      await setFlag({ sessionToken: token, id: p._id, flag, value });
      const label = { published: value ? "Published" : "Unpublished", featured: value ? "Featured" : "Removed from featured", isNewArrival: value ? "Marked as new" : "No longer marked new" }[flag];
      toast.success(`${label}: ${p.name}`);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    const name = deleting.name;
    try {
      await remove({ sessionToken: token, id: deleting._id });
      toast.success(`Deleted ${name}`);
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDeleting(null);
    }
  }

  const sizesProduct = products?.find((p) => p._id === sizesFor) ?? null;

  return (
    <>
      <AdminPageHeader
        title="Products"
        description={products ? `${products.length} designs in your catalogue` : "Loading catalogue…"}
        actions={
          <Link href="/admin/products/new" className={buttonVariants({ size: "lg" })}>
            <PlusIcon data-icon="inline-start" />
            Add product
          </Link>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, slug or category"
            aria-label="Search products"
            className="h-10 bg-card pl-9"
          />
        </div>
        <Select
          items={STATUS}
          value={status}
          onValueChange={(value) => {
            const sp = new URLSearchParams(params.toString());
            if (!value || value === "all") sp.delete("status");
            else sp.set("status", value);
            router.replace(sp.size ? `${pathname}?${sp}` : pathname);
          }}
        >
          <SelectTrigger aria-label="Filter products" className="h-10 bg-card sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="hidden grid-cols-[3.5rem_1fr_7rem_8rem_6rem_3rem] items-center gap-4 border-b bg-muted/40 px-4 py-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase md:grid">
          <span />
          <span>Product</span>
          <span>Price</span>
          <span>Sizes</span>
          <span>Published</span>
          <span className="sr-only">Actions</span>
        </div>

        {products === undefined &&
          Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 border-b p-4 last:border-0">
              <Skeleton className="size-14 rounded-md" />
              <Skeleton className="h-5 flex-1" />
            </div>
          ))}

        {products && filtered.length === 0 && (
          <div className="p-12 text-center">
            <p className="font-display text-2xl">
              {products.length === 0 ? "No products yet" : "No products match"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {products.length === 0
                ? "Add your first design to start selling."
                : "Try another search or filter."}
            </p>
          </div>
        )}

        <ul className="divide-y">
          {filtered.map((p) => {
            const soldOutCount = p.sizes.filter((s) => s.availability === "sold_out").length;
            return (
              <li
                key={p._id}
                className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-x-4 gap-y-3 p-4 md:grid-cols-[3.5rem_1fr_7rem_8rem_6rem_3rem]"
              >
                <Link href={`/admin/products/${p._id}`} tabIndex={-1} aria-hidden="true">
                  <ProductImage image={p.image} name={p.name} sizes="56px" className="size-14 rounded-md" />
                </Link>
                <div className="min-w-0">
                  <Link href={`/admin/products/${p._id}`} className="block truncate font-medium hover:text-brand">
                    {p.name}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{p.categoryName}</span>
                    {p.featured && <Badge variant="secondary"><StarIcon /> Featured</Badge>}
                    {p.isNewArrival && <Badge variant="secondary"><SparklesIcon /> New</Badge>}
                    {!p.available && <Badge variant="destructive">Sold out</Badge>}
                    <span className="md:hidden">· {formatNaira(p.price)}</span>
                  </div>
                </div>
                <span className="hidden font-medium lining-nums tabular-nums md:block">{formatNaira(p.price)}</span>
                <button
                  type="button"
                  onClick={() => setSizesFor(p._id)}
                  className="hidden items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-left text-xs hover:bg-muted md:inline-flex"
                >
                  <RulerIcon className="size-3.5" aria-hidden="true" />
                  {p.sizes.length === 0
                    ? "No sizes"
                    : `${p.sizes.length - soldOutCount}/${p.sizes.length} available`}
                </button>
                <div className="hidden md:block">
                  <Switch
                    checked={p.published}
                    onCheckedChange={(v) => toggle(p, "published", v)}
                    aria-label={`${p.published ? "Unpublish" : "Publish"} ${p.name}`}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon" aria-label={`Actions for ${p.name}`} />}
                  >
                    <MoreHorizontalIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem render={<Link href={`/admin/products/${p._id}`} />}>
                      <PencilIcon /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSizesFor(p._id)}>
                      <RulerIcon /> Sizes &amp; availability
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggle(p, "published", !p.published)}>
                      {p.published ? "Unpublish" : "Publish"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggle(p, "featured", !p.featured)}>
                      <StarIcon /> {p.featured ? "Unfeature" : "Feature"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggle(p, "isNewArrival", !p.isNewArrival)}>
                      <SparklesIcon /> {p.isNewArrival ? "Unmark new" : "Mark as new"}
                    </DropdownMenuItem>
                    {p.published && (
                      <DropdownMenuItem render={<a href={`/shop/${p.slug}`} target="_blank" rel="noopener noreferrer" />}>
                        <ExternalLinkIcon /> View on store
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => setDeleting(p)}>
                      <Trash2Icon /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className={cn("col-span-3 flex items-center justify-between gap-3 md:hidden")}>
                  <button
                    type="button"
                    onClick={() => setSizesFor(p._id)}
                    className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs"
                  >
                    <RulerIcon className="size-3.5" aria-hidden="true" />
                    {p.sizes.length - soldOutCount}/{p.sizes.length} sizes available
                  </button>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    Published
                    <Switch
                      checked={p.published}
                      onCheckedChange={(v) => toggle(p, "published", v)}
                    />
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {sizesProduct && (
        <SizeAvailabilityDialog
          product={sizesProduct}
          open
          onOpenChange={(open) => !open && setSizesFor(null)}
        />
      )}

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the product and its photos. Customers who
              saved it in their selection will see it as unavailable. To hide it
              temporarily, unpublish it instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
