"use client";

import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ImagePlusIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { errorMessage, useAdminToken } from "@/components/admin/admin-session";
import { IMAGE_ACCEPT, useImageUpload } from "@/components/admin/use-image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Category = FunctionReturnType<typeof api.admin.categories.list>[number];

const slugify = (v: string) =>
  v
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export default function AdminCategoriesPage() {
  const token = useAdminToken();
  const categories = useQuery(api.admin.categories.list, { sessionToken: token });
  const move = useMutation(api.admin.categories.move);
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="Group your designs. Order here controls the order on the store."
        actions={
          <Button size="lg" onClick={() => setEditing("new")}>
            <PlusIcon data-icon="inline-start" /> New category
          </Button>
        }
      />
      <div className="divide-y rounded-lg border bg-card">
        {categories === undefined &&
          Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="size-14 rounded-md" />
              <Skeleton className="h-5 flex-1" />
            </div>
          ))}
        {categories?.length === 0 && (
          <p className="p-10 text-center text-muted-foreground">No categories yet.</p>
        )}
        {categories?.map((c, index) => (
          <div key={c._id} className="flex items-center gap-4 p-4">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
              {c.imageUrl && (
                <Image src={c.imageUrl} alt="" fill sizes="56px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{c.name}</p>
              <p className="text-sm text-muted-foreground">
                /{c.slug} · {c.productCount} {c.productCount === 1 ? "product" : "products"}
              </p>
            </div>
            <Badge variant={c.published ? "default" : "outline"} className="hidden sm:inline-flex">
              {c.published ? "Published" : "Hidden"}
            </Badge>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                disabled={index === 0}
                aria-label={`Move ${c.name} up`}
                onClick={() => move({ sessionToken: token, id: c._id, direction: "up" })}
              >
                <ArrowUpIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={index === categories.length - 1}
                aria-label={`Move ${c.name} down`}
                onClick={() => move({ sessionToken: token, id: c._id, direction: "down" })}
              >
                <ArrowDownIcon />
              </Button>
              <Button variant="ghost" size="icon" aria-label={`Edit ${c.name}`} onClick={() => setEditing(c)}>
                <PencilIcon />
              </Button>
              <Button variant="ghost" size="icon" aria-label={`Delete ${c.name}`} onClick={() => setDeleting(c)}>
                <Trash2Icon />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <CategoryDialog
          category={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && categories && (
        <DeleteCategoryDialog
          category={deleting}
          others={categories.filter((c) => c._id !== deleting._id)}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}

function CategoryDialog({ category, onClose }: { category: Category | null; onClose: () => void }) {
  const token = useAdminToken();
  const create = useMutation(api.admin.categories.create);
  const update = useMutation(api.admin.categories.update);
  const { upload, uploading } = useImageUpload();
  const file = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(category));
  const [description, setDescription] = useState(category?.description ?? "");
  const [published, setPublished] = useState(category?.published ?? true);
  const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | null>(category?.imageStorageId ?? null);
  const [preview, setPreview] = useState<string | null>(category?.imageUrl ?? null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const payload = {
      sessionToken: token,
      name,
      slug: slugify(slug),
      description: description || undefined,
      published,
      imageStorageId: imageStorageId ?? undefined,
    };
    try {
      if (category) await update({ ...payload, id: category._id });
      else await create(payload);
      toast.success(category ? "Category updated" : "Category created");
      onClose();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {category ? "Edit category" : "New category"}
          </DialogTitle>
          <DialogDescription>Shown on the store under Categories.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              value={name}
              required
              onChange={(e) => {
                setName(e.target.value);
                if (!slugEdited) setSlug(slugify(e.target.value));
              }}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-slug">Slug</Label>
            <Input
              id="cat-slug"
              value={slug}
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(e.target.value);
              }}
              onBlur={() => setSlug(slugify(slug))}
              className="h-10 font-mono text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea id="cat-desc" value={description} maxLength={500} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-md border bg-muted">
              {preview && <Image src={preview} alt="" fill sizes="80px" className="object-cover" unoptimized={preview.startsWith("blob:")} />}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" disabled={uploading} onClick={() => file.current?.click()}>
                {uploading ? <Loader2Icon className="animate-spin" data-icon="inline-start" /> : <ImagePlusIcon data-icon="inline-start" />}
                {preview ? "Replace image" : "Add image"}
              </Button>
              {preview && (
                <Button type="button" variant="ghost" onClick={() => { setImageStorageId(null); setPreview(null); }}>
                  Remove
                </Button>
              )}
              <p className="w-full text-xs text-muted-foreground">Optional. Otherwise a product photo is used.</p>
            </div>
            <input
              ref={file}
              type="file"
              accept={IMAGE_ACCEPT}
              className="sr-only"
              aria-label="Upload category image"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  setImageStorageId(await upload(f));
                  setPreview(URL.createObjectURL(f));
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Upload failed");
                }
              }}
            />
          </div>
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium">Published</span>
            <Switch checked={published} onCheckedChange={setPublished} />
          </label>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCategoryDialog({
  category,
  others,
  onClose,
}: {
  category: Category;
  others: Category[];
  onClose: () => void;
}) {
  const token = useAdminToken();
  const remove = useMutation(api.admin.categories.remove);
  const [target, setTarget] = useState<string | null>(others[0]?._id ?? null);
  const needsReassign = category.productCount > 0;

  async function confirm() {
    try {
      await remove({
        sessionToken: token,
        id: category._id,
        reassignTo: needsReassign && target ? (target as Id<"categories">) : undefined,
      });
      toast.success(`Deleted ${category.name}`);
      onClose();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Delete {category.name}?</DialogTitle>
          <DialogDescription>
            {needsReassign
              ? `${category.productCount} product(s) use this category. Choose where to move them first.`
              : "This category has no products and can be safely deleted."}
          </DialogDescription>
        </DialogHeader>
        {needsReassign &&
          (others.length === 0 ? (
            <p className="text-sm text-destructive">
              Create another category first, so these products have somewhere to go.
            </p>
          ) : (
            <Select
              items={Object.fromEntries(others.map((c) => [c._id, c.name]))}
              value={target}
              onValueChange={(v) => setTarget(v)}
            >
              <SelectTrigger className="h-10 w-full" aria-label="Move products to">
                <SelectValue placeholder="Move products to…" />
              </SelectTrigger>
              <SelectContent>
                {others.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={confirm}
            disabled={needsReassign && (!target || others.length === 0)}
          >
            {needsReassign ? "Move products & delete" : "Delete category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
