"use client";

import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ImagePlusIcon,
  Loader2Icon,
  PlusIcon,
  StarIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AUDIENCE_LABEL, type Audience } from "@/lib/constants";
import { formatNaira } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { errorMessage, useAdminToken } from "./admin-session";
import { IMAGE_ACCEPT, useImageUpload } from "./use-image-upload";

type Availability = "available" | "sold_out";
type FormImage = { publicId: string; alt: string; url: string | null };
type FormSize = { size: number; availability: Availability };

export type ProductFormValues = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: string;
  categoryId: Id<"categories"> | "";
  audience: Audience;
  images: FormImage[];
  sizes: FormSize[];
  featured: boolean;
  isNewArrival: boolean;
  published: boolean;
};

const EMPTY: ProductFormValues = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  price: "",
  categoryId: "",
  audience: "men",
  images: [],
  sizes: [],
  featured: false,
  isNewArrival: true,
  published: true,
};

const PRESETS: Record<Audience, [number, number]> = {
  men: [39, 46],
  women: [36, 42],
  unisex: [37, 45],
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function ProductForm({
  productId,
  initial,
}: {
  productId?: Id<"products">;
  initial?: ProductFormValues;
}) {
  const token = useAdminToken();
  const router = useRouter();
  const categories = useQuery(api.admin.categories.list, { sessionToken: token });
  const create = useMutation(api.admin.products.create);
  const update = useMutation(api.admin.products.update);
  const discard = useMutation(api.admin.files.discardUpload);
  const { upload, uploading } = useImageUpload();
  const fileInput = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<ProductFormValues>(initial ?? EMPTY);
  // Slug is generated from the name for new products and frozen once saved,
  // so existing store links never break.
  const slugLocked = Boolean(initial);
  const [newSize, setNewSize] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({});
  const uploadedThisSession = useRef<Set<string>>(new Set());

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  // Default category once loaded.
  if (!values.categoryId && categories && categories.length > 0 && !initial) {
    setValues((v) => ({ ...v, categoryId: categories[0]._id }));
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files).slice(0, 12 - values.images.length);
    for (const file of list) {
      try {
        const publicId = await upload(file);
        uploadedThisSession.current.add(publicId);
        const url = URL.createObjectURL(file);
        setValues((v) => ({
          ...v,
          images: [...v.images, { publicId, alt: v.name, url }],
        }));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      }
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  function moveImage(index: number, delta: number) {
    setValues((v) => {
      const images = [...v.images];
      const target = index + delta;
      if (target < 0 || target >= images.length) return v;
      [images[index], images[target]] = [images[target], images[index]];
      return { ...v, images };
    });
  }

  function removeImage(index: number) {
    const image = values.images[index];
    setValues((v) => ({ ...v, images: v.images.filter((_, i) => i !== index) }));
    if (uploadedThisSession.current.has(image.publicId)) {
      void discard({ sessionToken: token, publicId: image.publicId });
    }
  }

  function addSizes(sizes: number[]) {
    setValues((v) => {
      const existing = new Set(v.sizes.map((s) => s.size));
      const next = [...v.sizes];
      for (const size of sizes) {
        if (!existing.has(size)) next.push({ size, availability: "available" });
      }
      return { ...v, sizes: next.sort((a, b) => a.size - b.size) };
    });
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (values.name.trim().length < 2) next.name = "Enter a product name.";
    if (slugify(values.slug).length < 2) next.slug = "The name needs letters or numbers to generate a URL.";
    const price = Number(values.price.replace(/[,\s₦]/g, ""));
    if (!Number.isInteger(price) || price <= 0)
      next.price = "Enter a whole naira amount, e.g. 18000.";
    if (!values.categoryId) next.categoryId = "Choose a category.";
    if (values.published && values.sizes.length === 0)
      next.sizes = "Add at least one size before publishing.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return false;
    }
    return true;
  }

  async function save() {
    if (!validate() || !values.categoryId) return;
    setSaving(true);
    const payload = {
      sessionToken: token,
      name: values.name,
      slug: slugify(values.slug),
      description: values.description,
      shortDescription: values.shortDescription || undefined,
      price: Number(values.price.replace(/[,\s₦]/g, "")),
      categoryId: values.categoryId,
      audience: values.audience,
      images: values.images.map((i) => ({
        publicId: i.publicId,
        alt: i.alt.trim() || values.name,
      })),
      sizes: values.sizes,
      featured: values.featured,
      isNewArrival: values.isNewArrival,
      published: values.published,
    };
    try {
      if (productId) {
        await update({ ...payload, id: productId });
        toast.success("Saved — live on the store now.");
      } else {
        const id = await create(payload);
        toast.success(`“${values.name.trim()}” created.`, {
          action: { label: "Edit", onClick: () => router.push(`/admin/products/${id}`) },
        });
        // Start a fresh form for the next product, keeping the chosen category.
        for (const image of values.images) {
          if (image.url?.startsWith("blob:")) URL.revokeObjectURL(image.url);
        }
        setValues({ ...EMPTY, categoryId: values.categoryId });
        setErrors({});
        setNewSize("");
        if (fileInput.current) fileInput.current.value = "";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      uploadedThisSession.current.clear();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  const categoryItems = Object.fromEntries((categories ?? []).map((c) => [c._id, c.name]));
  const pricePreview = Number(values.price.replace(/[,\s₦]/g, ""));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
      className="pb-28"
      noValidate
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" /> Products
        </Link>
        {productId && values.published && (
          <a
            href={`/shop/${slugify(values.slug)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            View on store ↗
          </a>
        )}
      </div>
      <h1 className="mb-8 text-4xl sm:text-5xl">
        {productId ? values.name || "Edit product" : "New product"}
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Panel title="Details">
            <Field label="Product name" error={errors.name} htmlFor="name">
              <Input
                id="name"
                value={values.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setValues((v) => ({ ...v, name, slug: slugLocked ? v.slug : slugify(name) }));
                }}
                placeholder="e.g. The Aba Classic"
                aria-invalid={!!errors.name || undefined}
                className="h-11 bg-background"
              />
            </Field>
            <Field
              label="URL slug"
              htmlFor="slug"
              error={errors.slug}
              hint={
                slugLocked
                  ? `sagaciousfooties…/shop/${values.slug} · fixed after creation so links keep working`
                  : `Generated from the name · sagaciousfooties…/shop/${values.slug || "your-design"}`
              }
            >
              <output
                id="slug"
                data-invalid={!!errors.slug || undefined}
                className="flex h-11 w-full select-all items-center truncate rounded-lg border border-dashed border-input bg-muted/60 px-2.5 font-mono text-sm text-muted-foreground data-invalid:border-destructive"
              >
                {values.slug || "your-design"}
              </output>
            </Field>
            <Field label="Short description" htmlFor="short" hint="One line shown on cards and in shared links.">
              <Input
                id="short"
                value={values.shortDescription}
                maxLength={240}
                onChange={(e) => set("shortDescription", e.target.value)}
                placeholder="Twin-strap leather sandal with a buckled finish."
                className="h-11 bg-background"
              />
            </Field>
            <Field label="Full description" htmlFor="description" hint="Leave a blank line between paragraphs.">
              <Textarea
                id="description"
                value={values.description}
                maxLength={5000}
                onChange={(e) => set("description", e.target.value)}
                rows={6}
                className="bg-background"
              />
            </Field>
          </Panel>

          <Panel
            title="Photos"
            description="The first photo is the main image. Large photos are compressed automatically."
          >
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {values.images.map((image, index) => (
                <li key={image.publicId} className="overflow-hidden rounded-md border bg-background">
                  <div className="relative aspect-4/5 bg-muted">
                    {image.url && (
                      <Image src={image.url} alt="" fill sizes="200px" className="object-cover" unoptimized={image.url.startsWith("blob:")} />
                    )}
                    {index === 0 && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-sm bg-espresso px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-ivory uppercase">
                        <StarIcon className="size-3" aria-hidden="true" /> Main
                      </span>
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2"
                      aria-label={`Remove photo ${index + 1}`}
                    >
                      <XIcon />
                    </Button>
                  </div>
                  <div className="space-y-2 p-2">
                    <Input
                      value={image.alt}
                      onChange={(e) =>
                        setValues((v) => ({
                          ...v,
                          images: v.images.map((img, i) => (i === index ? { ...img, alt: e.target.value } : img)),
                        }))
                      }
                      placeholder="Describe the photo"
                      aria-label={`Alt text for photo ${index + 1}`}
                      className="h-8 text-xs"
                    />
                    <div className="flex items-center justify-between gap-1">
                      <Button type="button" variant="ghost" size="icon-sm" onClick={() => moveImage(index, -1)} disabled={index === 0} aria-label="Move photo earlier">
                        <ArrowLeftIcon />
                      </Button>
                      {index !== 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() =>
                            setValues((v) => {
                              const images = [...v.images];
                              const [picked] = images.splice(index, 1);
                              return { ...v, images: [picked, ...images] };
                            })
                          }
                        >
                          Make main
                        </Button>
                      )}
                      <Button type="button" variant="ghost" size="icon-sm" onClick={() => moveImage(index, 1)} disabled={index === values.images.length - 1} aria-label="Move photo later">
                        <ArrowRightIcon />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
              {values.images.length < 12 && (
                <li>
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    disabled={uploading}
                    className="flex aspect-4/5 w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed text-sm text-muted-foreground transition-colors hover:border-brand hover:text-foreground disabled:opacity-60"
                  >
                    {uploading ? (
                      <Loader2Icon className="size-6 animate-spin" aria-hidden="true" />
                    ) : (
                      <ImagePlusIcon className="size-6" aria-hidden="true" />
                    )}
                    {uploading ? "Uploading…" : "Add photos"}
                  </button>
                </li>
              )}
            </ul>
            <input
              ref={fileInput}
              type="file"
              accept={IMAGE_ACCEPT}
              multiple
              className="sr-only"
              onChange={(e) => void handleFiles(e.target.files)}
              aria-label="Upload product photos"
            />
          </Panel>

          <Panel
            title="Sizes & availability"
            description="Tap a size to toggle between available and sold out."
          >
            <div className="flex flex-wrap gap-2">
              {values.sizes.map((s) => {
                const available = s.availability === "available";
                return (
                  <div
                    key={s.size}
                    className={cn(
                      "flex items-center overflow-hidden rounded-md border",
                      available ? "border-success/40 bg-success/10" : "border-dashed bg-background",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setValues((v) => ({
                          ...v,
                          sizes: v.sizes.map((x) =>
                            x.size === s.size
                              ? { ...x, availability: available ? "sold_out" : "available" }
                              : x,
                          ),
                        }))
                      }
                      aria-pressed={available}
                      aria-label={`Size ${s.size}, ${available ? "available" : "sold out"}. Toggle.`}
                      className="flex flex-col items-center px-3 py-1.5"
                    >
                      <span className={cn("font-semibold lining-nums tabular-nums", !available && "text-muted-foreground line-through")}>
                        {s.size}
                      </span>
                      <span className="text-[0.6rem] tracking-wide text-muted-foreground uppercase">
                        {available ? "Available" : "Sold out"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setValues((v) => ({ ...v, sizes: v.sizes.filter((x) => x.size !== s.size) }))}
                      className="self-stretch border-l px-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove size ${s.size}`}
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </div>
                );
              })}
              {values.sizes.length === 0 && (
                <p className="text-sm text-muted-foreground">No sizes yet — add a range below.</p>
              )}
            </div>
            {errors.sizes && <p className="text-sm text-destructive">{errors.sizes}</p>}
            <div className="flex flex-wrap items-end gap-2 border-t pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-size" className="text-xs">Add size</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-size"
                    inputMode="decimal"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const n = Number(newSize);
                        if (n >= 10 && n <= 60) {
                          addSizes([n]);
                          setNewSize("");
                        }
                      }
                    }}
                    placeholder="e.g. 43"
                    className="h-9 w-24 bg-background"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const n = Number(newSize);
                      if (n >= 10 && n <= 60 && Math.round(n * 2) === n * 2) {
                        addSizes([n]);
                        setNewSize("");
                      } else toast.error("Enter a size between 10 and 60.");
                    }}
                    className="h-9"
                  >
                    <PlusIcon data-icon="inline-start" /> Add
                  </Button>
                </div>
              </div>
              {(Object.keys(PRESETS) as Audience[]).map((a) => {
                const [from, to] = PRESETS[a];
                return (
                  <Button
                    key={a}
                    type="button"
                    variant="ghost"
                    className="h-9"
                    onClick={() => addSizes(Array.from({ length: to - from + 1 }, (_, i) => from + i))}
                  >
                    + {AUDIENCE_LABEL[a]} {from}–{to}
                  </Button>
                );
              })}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Price">
            <Field label="Price (₦)" htmlFor="price" error={errors.price} hint={pricePreview > 0 ? formatNaira(pricePreview) : "Whole naira, no kobo."}>
              <Input
                id="price"
                inputMode="numeric"
                value={values.price}
                onChange={(e) => set("price", e.target.value.replace(/[^\d]/g, ""))}
                placeholder="18000"
                aria-invalid={!!errors.price || undefined}
                className="h-11 bg-background text-lg lining-nums tabular-nums"
              />
            </Field>
          </Panel>

          <Panel title="Organisation">
            <Field label="Category" error={errors.categoryId}>
              <Select
                items={categoryItems}
                value={values.categoryId || null}
                onValueChange={(v) => v && set("categoryId", v as Id<"categories">)}
              >
                <SelectTrigger className="h-11 w-full bg-background" aria-label="Category">
                  <SelectValue placeholder={categories ? "Choose category" : "Loading…"} />
                </SelectTrigger>
                <SelectContent>
                  {(categories ?? []).map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categories && categories.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  <Link href="/admin/categories" className="underline">Create a category</Link> first.
                </p>
              )}
            </Field>
            <Field label="Made for">
              <Select
                items={AUDIENCE_LABEL}
                value={values.audience}
                onValueChange={(v) => v && set("audience", v as Audience)}
              >
                <SelectTrigger className="h-11 w-full bg-background" aria-label="Made for">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(AUDIENCE_LABEL) as Audience[]).map((a) => (
                    <SelectItem key={a} value={a}>
                      {AUDIENCE_LABEL[a]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </Panel>

          <Panel title="Visibility">
            <Toggle
              label="Published"
              description="Visible on the store"
              checked={values.published}
              onChange={(v) => set("published", v)}
            />
            <Toggle
              label="Featured"
              description="Shown in Featured designs"
              checked={values.featured}
              onChange={(v) => set("featured", v)}
            />
            <Toggle
              label="New arrival"
              description="Shown in New arrivals"
              checked={values.isNewArrival}
              onChange={(v) => set("isNewArrival", v)}
            />
          </Panel>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur-md md:left-(--sidebar-width)">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin/products" className={buttonVariants({ variant: "ghost", size: "lg" })}>
            Cancel
          </Link>
          <Button type="submit" size="lg" disabled={saving || uploading} className="min-w-32">
            {saving && <Loader2Icon className="animate-spin" data-icon="inline-start" />}
            {saving ? "Saving…" : productId ? "Save changes" : "Create product"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border bg-card p-5 sm:p-6">
      <div>
        <h2 className="font-sans text-sm font-semibold tracking-[0.14em] uppercase">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      ) : hint ? (
        <p className="truncate text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
