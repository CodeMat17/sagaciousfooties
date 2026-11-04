"use client";

import { useMutation } from "convex/react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { errorMessage, useAdminToken } from "./admin-session";

/** Quick per-size availability toggles — the most common daily task. */
export function SizeAvailabilityDialog({
  product,
  open,
  onOpenChange,
}: {
  product: {
    _id: Id<"products">;
    name: string;
    sizes: Array<{ size: number; availability: "available" | "sold_out" }>;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const token = useAdminToken();
  const setAvailability = useMutation(api.admin.products.setSizeAvailability);
  const sizes = [...product.sizes].sort((a, b) => a.size - b.size);

  async function toggle(size: number, current: "available" | "sold_out") {
    const availability = current === "available" ? "sold_out" : "available";
    try {
      await setAvailability({ sessionToken: token, id: product._id, size, availability });
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{product.name}</DialogTitle>
          <DialogDescription>
            Tap a size to mark it available or sold out. The store updates instantly.
          </DialogDescription>
        </DialogHeader>
        {sizes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No sizes yet.{" "}
            <Link href={`/admin/products/${product._id}`} className="underline">
              Add sizes in the editor
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {sizes.map((s) => {
              const available = s.availability === "available";
              return (
                <button
                  key={s.size}
                  type="button"
                  onClick={() => toggle(s.size, s.availability)}
                  aria-pressed={available}
                  aria-label={`Size ${s.size}: ${available ? "available" : "sold out"}. Toggle.`}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center rounded-md border text-base font-semibold lining-nums tabular-nums transition-colors",
                    available
                      ? "border-success/40 bg-success/10 text-foreground"
                      : "border-dashed text-muted-foreground line-through",
                  )}
                >
                  {s.size}
                  <span className="text-[0.6rem] font-medium tracking-wide uppercase no-underline">
                    {available ? "In" : "Out"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
