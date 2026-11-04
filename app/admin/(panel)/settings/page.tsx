"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ArrowLeftIcon, ArrowRightIcon, ImagePlusIcon, KeyRoundIcon, Loader2Icon, XIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { errorMessage, useAdminToken } from "@/components/admin/admin-session";
import { IMAGE_ACCEPT, useImageUpload } from "@/components/admin/use-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Settings = FunctionReturnType<typeof api.admin.settings.get>;
type HeroImage = Settings["heroImages"][number];

/** Keep in sync with HERO_IMAGE_LIMIT in convex/lib/present.ts. */
const HERO_IMAGE_LIMIT = 5;

export default function AdminSettingsPage() {
  const token = useAdminToken();
  const settings = useQuery(api.admin.settings.get, { sessionToken: token });
  return (
    <>
      <AdminPageHeader
        title="Store settings"
        description="Business details, contact links and SEO. Changes go live immediately."
      />
      {settings ? (
        <SettingsForm key={settings.updatedAt ?? 0} initial={settings} />
      ) : (
        <div className="space-y-6">
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-56 rounded-lg" />
        </div>
      )}
      <ChangePin />
    </>
  );
}

type TextKey =
  | "businessName"
  | "tagline"
  | "whatsappNumber"
  | "contactEmail"
  | "address"
  | "openingHours"
  | "instagramUrl"
  | "facebookUrl"
  | "tiktokUrl"
  | "deliveryInformation"
  | "seoTitle"
  | "seoDescription";

function SettingsForm({ initial }: { initial: Settings }) {
  const token = useAdminToken();
  const save = useMutation(api.admin.settings.update);
  const [values, setValues] = useState<Record<TextKey, string>>({
    businessName: initial.businessName,
    tagline: initial.tagline,
    whatsappNumber: initial.whatsappNumber,
    contactEmail: initial.contactEmail,
    address: initial.address,
    openingHours: initial.openingHours,
    instagramUrl: initial.instagramUrl,
    facebookUrl: initial.facebookUrl,
    tiktokUrl: initial.tiktokUrl,
    deliveryInformation: initial.deliveryInformation,
    seoTitle: initial.seoTitle,
    seoDescription: initial.seoDescription,
  });
  const [logo, setLogo] = useState({ id: initial.logoStorageId, url: initial.logoUrl });
  const [heroImages, setHeroImages] = useState<HeroImage[]>(initial.heroImages);
  const [saving, setSaving] = useState(false);

  const field = (key: TextKey) => ({
    value: values[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value })),
  });

  async function submit() {
    setSaving(true);
    const opt = (k: TextKey) => values[k].trim() || undefined;
    try {
      await save({
        sessionToken: token,
        businessName: values.businessName,
        tagline: values.tagline,
        whatsappNumber: values.whatsappNumber,
        contactEmail: opt("contactEmail"),
        address: opt("address"),
        openingHours: opt("openingHours"),
        instagramUrl: opt("instagramUrl"),
        facebookUrl: opt("facebookUrl"),
        tiktokUrl: opt("tiktokUrl"),
        deliveryInformation: opt("deliveryInformation"),
        seoTitle: opt("seoTitle"),
        seoDescription: opt("seoDescription"),
        logoStorageId: logo.id ?? undefined,
        heroImageStorageIds: heroImages.map((i) => i.storageId),
      });
      toast.success("Settings saved — live on the store.");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <Section title="Business">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="businessName" label="Business name" {...field("businessName")} required />
          <TextField id="tagline" label="Tagline" {...field("tagline")} required />
          <TextField
            id="whatsappNumber"
            label="WhatsApp number"
            hint="International format without +, e.g. 2347044663337. Used by every WhatsApp button."
            inputMode="tel"
            {...field("whatsappNumber")}
            required
          />
          <TextField id="contactEmail" label="Contact email (optional)" type="email" {...field("contactEmail")} />
          <TextField id="openingHours" label="Opening hours (optional)" placeholder="Mon – Sat, 8am – 6pm" {...field("openingHours")} />
        </div>
        <AreaField id="address" label="Shop address" rows={2} {...field("address")} />
        <AreaField id="deliveryInformation" label="Delivery information" rows={3} hint="Shown on product pages and the selection summary." {...field("deliveryInformation")} />
      </Section>

      <Section title="Imagery">
        <HeroGalleryField images={heroImages} onChange={setHeroImages} />
        <div className="border-t pt-6">
          <ImageField
            label="Logo (optional)"
            hint="Replaces the emblem in the header and footer. Square, transparent PNG or WebP works best."
            value={logo}
            onChange={setLogo}
            aspect="aspect-square"
          />
        </div>
      </Section>

      <Section title="Social links">
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField id="instagramUrl" label="Instagram URL" placeholder="https://instagram.com/…" {...field("instagramUrl")} />
          <TextField id="facebookUrl" label="Facebook URL" placeholder="https://facebook.com/…" {...field("facebookUrl")} />
          <TextField id="tiktokUrl" label="TikTok URL" placeholder="https://tiktok.com/@…" {...field("tiktokUrl")} />
        </div>
      </Section>

      <Section title="Search engines">
        <TextField id="seoTitle" label="Default SEO title" {...field("seoTitle")} />
        <AreaField id="seoDescription" label="Default SEO description" rows={2} {...field("seoDescription")} />
      </Section>

      <div className="flex justify-end">
        <Button type="submit" size="xl" disabled={saving}>
          {saving && <Loader2Icon className="animate-spin" data-icon="inline-start" />}
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}

function HeroGalleryField({
  images,
  onChange,
}: {
  images: HeroImage[];
  onChange: React.Dispatch<React.SetStateAction<HeroImage[]>>;
}) {
  const token = useAdminToken();
  const discard = useMutation(api.admin.files.discardUpload);
  const { upload, uploading } = useImageUpload();
  const input = useRef<HTMLInputElement>(null);
  const uploadedThisSession = useRef<Set<string>>(new Set());

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const room = HERO_IMAGE_LIMIT - images.length;
    const list = Array.from(files).slice(0, room);
    if (files.length > room) {
      toast.info(`Only ${HERO_IMAGE_LIMIT} hero photos are allowed — extra files were skipped.`);
    }
    let added = 0;
    for (const file of list) {
      try {
        const storageId = await upload(file);
        uploadedThisSession.current.add(storageId);
        const url = URL.createObjectURL(file);
        onChange((current) => [...current, { storageId, url }]);
        added++;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      }
    }
    if (added > 0) toast.info("Uploaded — save settings to publish.");
    if (input.current) input.current.value = "";
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(index: number) {
    const image = images[index];
    onChange(images.filter((_, i) => i !== index));
    if (uploadedThisSession.current.has(image.storageId)) {
      void discard({ sessionToken: token, storageId: image.storageId });
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Homepage hero photos</p>
        <p className="text-xs text-muted-foreground">
          Up to {HERO_IMAGE_LIMIT} photos that crossfade on the homepage, in this order. Portrait or
          square lifestyle shots work best. Leave empty to show stand-in photos.
        </p>
      </div>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {images.map((image, index) => (
          <li key={image.storageId} className="overflow-hidden rounded-md border bg-background">
            <div className="relative aspect-4/5 bg-muted">
              {image.url && (
                <Image src={image.url} alt="" fill sizes="160px" className="object-cover" unoptimized={image.url.startsWith("blob:")} />
              )}
              <span className="absolute top-1.5 left-1.5 rounded-sm bg-espresso px-1.5 py-0.5 text-[0.65rem] font-semibold text-ivory tabular-nums">
                {index + 1}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                onClick={() => remove(index)}
                className="absolute top-1.5 right-1.5"
                aria-label={`Remove hero photo ${index + 1}`}
              >
                <XIcon />
              </Button>
            </div>
            <div className="flex items-center justify-between p-1">
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move hero photo ${index + 1} earlier`}>
                <ArrowLeftIcon />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => move(index, 1)} disabled={index === images.length - 1} aria-label={`Move hero photo ${index + 1} later`}>
                <ArrowRightIcon />
              </Button>
            </div>
          </li>
        ))}
        {images.length < HERO_IMAGE_LIMIT && (
          <li>
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={uploading}
              className="flex aspect-4/5 w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed text-xs text-muted-foreground transition-colors hover:border-brand hover:text-foreground disabled:opacity-60"
            >
              {uploading ? (
                <Loader2Icon className="size-5 animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlusIcon className="size-5" aria-hidden="true" />
              )}
              {uploading ? "Uploading…" : "Add photos"}
            </button>
          </li>
        )}
      </ul>
      <input
        ref={input}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        className="sr-only"
        aria-label="Upload homepage hero photos"
        onChange={(e) => void handleFiles(e.target.files)}
      />
    </div>
  );
}

function ImageField({
  label,
  hint,
  value,
  onChange,
  aspect,
}: {
  label: string;
  hint: string;
  value: { id: Id<"_storage"> | null; url: string | null };
  onChange: (v: { id: Id<"_storage"> | null; url: string | null }) => void;
  aspect: string;
}) {
  const { upload, uploading } = useImageUpload();
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="flex gap-4">
      <div className={`relative w-28 shrink-0 overflow-hidden rounded-md border bg-muted ${aspect}`}>
        {value.url && (
          <Image src={value.url} alt="" fill sizes="112px" className="object-cover" unoptimized={value.url.startsWith("blob:")} />
        )}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => input.current?.click()}>
            {uploading ? <Loader2Icon className="animate-spin" data-icon="inline-start" /> : <ImagePlusIcon data-icon="inline-start" />}
            {value.url ? "Replace" : "Upload"}
          </Button>
          {value.url && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ id: null, url: null })}>
              Remove
            </Button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept={IMAGE_ACCEPT}
          className="sr-only"
          aria-label={`Upload ${label}`}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const id = await upload(file);
              onChange({ id, url: URL.createObjectURL(file) });
              toast.info("Image uploaded — save settings to publish it.");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Upload failed");
            }
          }}
        />
      </div>
    </div>
  );
}

function ChangePin() {
  const token = useAdminToken();
  const changePin = useAction(api.adminAuth.changePin);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (newPin !== confirmPin) {
      toast.error("The new PINs don't match.");
      return;
    }
    setSaving(true);
    try {
      await changePin({ sessionToken: token, currentPin, newPin });
      toast.success("PIN changed. Other devices have been signed out.");
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  const pinProps = {
    type: "password",
    inputMode: "numeric" as const,
    maxLength: 12,
    className: "h-10 bg-background font-mono tracking-[0.3em]",
  };

  return (
    <form
      className="mt-10"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <Section title="Security">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <KeyRoundIcon className="size-4" aria-hidden="true" />
          Change the admin PIN (6–12 digits). Changing it signs out all other devices.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="current-pin">Current PIN</Label>
            <Input id="current-pin" autoComplete="current-password" value={currentPin} onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))} {...pinProps} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new-pin">New PIN</Label>
            <Input id="new-pin" autoComplete="new-password" value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} {...pinProps} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-pin">Confirm new PIN</Label>
            <Input id="confirm-pin" autoComplete="new-password" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))} {...pinProps} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="outline" disabled={saving || newPin.length < 6 || currentPin.length < 6}>
            {saving ? "Updating…" : "Change PIN"}
          </Button>
        </div>
      </Section>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-lg border bg-card p-5 sm:p-6">
      <h2 className="font-sans text-sm font-semibold tracking-[0.14em] uppercase">{title}</h2>
      {children}
    </section>
  );
}

function TextField({
  id,
  label,
  hint,
  ...props
}: { id: string; label: string; hint?: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} className="h-10 bg-background" {...props} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function AreaField({
  id,
  label,
  hint,
  ...props
}: { id: string; label: string; hint?: string } & React.ComponentProps<typeof Textarea>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} className="bg-background" {...props} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
