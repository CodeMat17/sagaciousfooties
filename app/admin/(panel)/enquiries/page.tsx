"use client";

import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import dayjs from "dayjs";
import { PencilIcon, PhoneIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { WhatsAppIcon } from "@/components/brand/whatsapp-icon";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { errorMessage, useAdminToken } from "@/components/admin/admin-session";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  ENQUIRY_STATUS_LABEL,
  ENQUIRY_STATUSES,
  type EnquiryStatus,
} from "@/lib/constants";
import { formatNaira } from "@/lib/currency";
import { cn } from "@/lib/utils";

type Enquiry = FunctionReturnType<typeof api.admin.enquiries.list>[number];
type Filter = EnquiryStatus | "all";

const STATUS_STYLE: Record<EnquiryStatus, string> = {
  new: "bg-brand/15 text-brand",
  contacted: "bg-chart-4/30 text-foreground",
  confirmed: "bg-success/15 text-success",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function AdminEnquiriesPage() {
  const token = useAdminToken();
  const [filter, setFilter] = useState<Filter>("all");
  const enquiries = useQuery(api.admin.enquiries.list, {
    sessionToken: token,
    status: filter === "all" ? undefined : filter,
  });
  const setStatus = useMutation(api.admin.enquiries.setStatus);
  const [editing, setEditing] = useState<Enquiry | "new" | null>(null);
  const [deleting, setDeleting] = useState<Enquiry | null>(null);
  const remove = useMutation(api.admin.enquiries.remove);

  return (
    <>
      <AdminPageHeader
        title="Enquiries"
        description="A simple log of orders you receive on WhatsApp. Recorded manually — nothing is imported automatically."
        actions={
          <Button size="lg" onClick={() => setEditing("new")}>
            <PlusIcon data-icon="inline-start" /> Record enquiry
          </Button>
        }
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="mb-5">
        <TabsList className="scrollbar-none w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          {ENQUIRY_STATUSES.map((s) => (
            <TabsTrigger key={s} value={s}>
              {ENQUIRY_STATUS_LABEL[s]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {enquiries === undefined &&
          Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        {enquiries?.length === 0 && (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="font-display text-2xl">No enquiries here yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              When a customer messages you on WhatsApp, record it here to keep track.
            </p>
          </div>
        )}
        {enquiries?.map((e) => (
          <article key={e._id} className="rounded-lg border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{e.customerName || "Unnamed customer"}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                  <span>{dayjs(e.createdAt).format("D MMM YYYY, h:mm a")}</span>
                  {e.customerPhone && (
                    <>
                      <a href={`tel:${e.customerPhone}`} className="inline-flex items-center gap-1 hover:text-foreground">
                        <PhoneIcon className="size-3.5" aria-hidden="true" /> {e.customerPhone}
                      </a>
                      <a
                        href={`https://wa.me/${e.customerPhone.replace(/\D/g, "").replace(/^0/, "234")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        <WhatsAppIcon className="size-3.5" /> Chat
                      </a>
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Select
                  items={ENQUIRY_STATUS_LABEL}
                  value={e.status}
                  onValueChange={async (v) => {
                    if (!v) return;
                    try {
                      await setStatus({ sessionToken: token, id: e._id, status: v as EnquiryStatus });
                    } catch (error) {
                      toast.error(errorMessage(error));
                    }
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    aria-label="Enquiry status"
                    className={cn("h-8 border-0", STATUS_STYLE[e.status])}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENQUIRY_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {ENQUIRY_STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" aria-label="Edit enquiry" onClick={() => setEditing(e)}>
                  <PencilIcon />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Delete enquiry" onClick={() => setDeleting(e)}>
                  <Trash2Icon />
                </Button>
              </div>
            </div>
            <ul className="mt-4 space-y-1.5 border-t pt-4 text-sm">
              {e.items.map((item, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span className="min-w-0 truncate">
                    {item.productName} · size {item.size} × {item.quantity}
                  </span>
                  <span className="shrink-0 lining-nums tabular-nums text-muted-foreground">
                    {formatNaira(item.unitPrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className="text-sm whitespace-pre-line text-muted-foreground">{e.notes}</p>
              <p className="shrink-0 font-display text-2xl font-semibold lining-nums tabular-nums">
                {formatNaira(e.totalAmount)}
              </p>
            </div>
          </article>
        ))}
      </div>

      {editing && (
        <EnquiryDialog enquiry={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this enquiry?</AlertDialogTitle>
            <AlertDialogDescription>This record will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async () => {
                if (!deleting) return;
                try {
                  await remove({ sessionToken: token, id: deleting._id });
                  toast.success("Enquiry deleted");
                } catch (error) {
                  toast.error(errorMessage(error));
                }
                setDeleting(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

type DraftItem = {
  productId: Id<"products"> | null;
  productName: string;
  size: string;
  quantity: string;
  unitPrice: string;
};

function EnquiryDialog({ enquiry, onClose }: { enquiry: Enquiry | null; onClose: () => void }) {
  const token = useAdminToken();
  const products = useQuery(api.admin.products.list, { sessionToken: token });
  const create = useMutation(api.admin.enquiries.create);
  const update = useMutation(api.admin.enquiries.update);
  const [customerName, setCustomerName] = useState(enquiry?.customerName ?? "");
  const [customerPhone, setCustomerPhone] = useState(enquiry?.customerPhone ?? "");
  const [status, setStatusValue] = useState<EnquiryStatus>(enquiry?.status ?? "new");
  const [notes, setNotes] = useState(enquiry?.notes ?? "");
  const [items, setItems] = useState<DraftItem[]>(
    enquiry?.items.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      size: String(i.size),
      quantity: String(i.quantity),
      unitPrice: String(i.unitPrice),
    })) ?? [{ productId: null, productName: "", size: "", quantity: "1", unitPrice: "" }],
  );
  const [saving, setSaving] = useState(false);

  const productItems = Object.fromEntries((products ?? []).map((p) => [p._id, p.name]));
  const total = items.reduce((s, i) => s + (Number(i.unitPrice) || 0) * (Number(i.quantity) || 0), 0);

  function patch(index: number, next: Partial<DraftItem>) {
    setItems((list) => list.map((item, i) => (i === index ? { ...item, ...next } : item)));
  }

  async function save() {
    const clean = items.filter((i) => i.productId);
    if (clean.length === 0) {
      toast.error("Add at least one product.");
      return;
    }
    setSaving(true);
    const payload = {
      sessionToken: token,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      status,
      notes: notes || undefined,
      items: clean.map((i) => ({
        productId: i.productId as Id<"products">,
        productName: i.productName,
        size: Number(i.size),
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
    };
    try {
      if (enquiry) await update({ ...payload, id: enquiry._id });
      else await create(payload);
      toast.success(enquiry ? "Enquiry updated" : "Enquiry recorded");
      onClose();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto bg-background sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {enquiry ? "Edit enquiry" : "Record an enquiry"}
          </DialogTitle>
          <DialogDescription>
            Unit prices are saved as they are now, so later price changes won&apos;t alter this record.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="enq-name">Customer name (optional)</Label>
            <Input id="enq-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="enq-phone">Customer phone (optional)</Label>
            <Input id="enq-phone" inputMode="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="h-10" />
          </div>
        </div>

        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm font-medium">Items</legend>
          {items.map((item, index) => {
            const product = products?.find((p) => p._id === item.productId);
            return (
              <div key={index} className="grid grid-cols-[1fr_auto] gap-2 rounded-md border bg-card p-3 sm:grid-cols-[1fr_5rem_4.5rem_7rem_auto]">
                <Select
                  items={productItems}
                  value={item.productId}
                  onValueChange={(v) => {
                    const p = products?.find((x) => x._id === v);
                    if (p) patch(index, { productId: p._id, productName: p.name, unitPrice: String(p.price), size: p.sizes[0] ? String(p.sizes[0].size) : "" });
                  }}
                >
                  <SelectTrigger className="h-9 w-full" aria-label="Product">
                    <SelectValue placeholder="Choose product" />
                  </SelectTrigger>
                  <SelectContent>
                    {(products ?? []).map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove item"
                  disabled={items.length === 1}
                  onClick={() => setItems((l) => l.filter((_, i) => i !== index))}
                  className="sm:order-last"
                >
                  <XIcon />
                </Button>
                <div className="col-span-2 grid grid-cols-3 gap-2 sm:col-span-1 sm:contents">
                  {product && product.sizes.length > 0 ? (
                    <Select
                      items={Object.fromEntries(product.sizes.map((s) => [String(s.size), String(s.size)]))}
                      value={item.size || null}
                      onValueChange={(v) => v && patch(index, { size: v })}
                    >
                      <SelectTrigger className="h-9 w-full" aria-label="Size">
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.sizes.map((s) => (
                          <SelectItem key={s.size} value={String(s.size)}>
                            {s.size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input aria-label="Size" placeholder="Size" inputMode="decimal" value={item.size} onChange={(e) => patch(index, { size: e.target.value })} className="h-9" />
                  )}
                  <Input aria-label="Quantity" inputMode="numeric" value={item.quantity} onChange={(e) => patch(index, { quantity: e.target.value.replace(/\D/g, "") })} className="h-9" />
                  <Input aria-label="Unit price (₦)" inputMode="numeric" value={item.unitPrice} onChange={(e) => patch(index, { unitPrice: e.target.value.replace(/\D/g, "") })} className="h-9" placeholder="₦" />
                </div>
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setItems((l) => [...l, { productId: null, productName: "", size: "", quantity: "1", unitPrice: "" }])}
          >
            <PlusIcon data-icon="inline-start" /> Add item
          </Button>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select items={ENQUIRY_STATUS_LABEL} value={status} onValueChange={(v) => v && setStatusValue(v as EnquiryStatus)}>
              <SelectTrigger className="h-10 w-full" aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENQUIRY_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {ENQUIRY_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="enq-notes">Notes</Label>
            <Textarea id="enq-notes" rows={2} value={notes} maxLength={2000} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery address, payment status…" />
          </div>
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <p className="font-display text-2xl font-semibold lining-nums tabular-nums">Total {formatNaira(total)}</p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save enquiry"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
