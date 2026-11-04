"use client";

import { cn } from "@/lib/utils";

export type SizeOption = { size: number; availability: "available" | "sold_out" };

/**
 * Accessible radio group of sizes. Sold-out sizes are disabled and struck
 * through, so availability is never conveyed by colour alone.
 */
export function SizeSelector({
  sizes,
  value,
  onChange,
  name = "size",
}: {
  sizes: SizeOption[];
  value: number | null;
  onChange: (size: number) => void;
  name?: string;
}) {
  if (sizes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sizes for this design are not listed yet. Ask us on WhatsApp.
      </p>
    );
  }
  return (
    <fieldset>
      <legend className="sr-only">Choose a size (EU)</legend>
      <div className="flex flex-wrap gap-2">
        {sizes.map((option) => {
          const soldOut = option.availability === "sold_out";
          const selected = value === option.size;
          const id = `${name}-${option.size}`;
          return (
            <label
              key={option.size}
              htmlFor={id}
              className={cn(
                "relative flex h-11 min-w-12 cursor-pointer items-center justify-center rounded-md border px-3 text-sm font-medium lining-nums tabular-nums transition-colors select-none",
                "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-card hover:border-foreground/60",
                soldOut &&
                  "cursor-not-allowed border-dashed bg-transparent text-muted-foreground/70 line-through decoration-1 hover:border-input",
              )}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={option.size}
                checked={selected}
                disabled={soldOut}
                onChange={() => onChange(option.size)}
                className="sr-only"
              />
              {option.size}
              {soldOut && <span className="sr-only"> (sold out)</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
