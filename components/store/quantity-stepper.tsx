"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  label = "Quantity",
  size = "default",
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  size?: "default" | "sm";
  className?: string;
}) {
  const small = size === "sm";
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex items-center rounded-md border border-input bg-card",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size={small ? "icon-sm" : "icon-lg"}
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        <MinusIcon />
      </Button>
      <output
        aria-live="polite"
        aria-label={`${label}: ${value}`}
        className={cn(
          "min-w-9 text-center font-medium lining-nums tabular-nums",
          small ? "text-sm" : "text-base",
        )}
      >
        {value}
      </output>
      <Button
        type="button"
        variant="ghost"
        size={small ? "icon-sm" : "icon-lg"}
        onClick={() => onChange(Math.min(999, value + 1))}
        aria-label="Increase quantity"
      >
        <PlusIcon />
      </Button>
    </div>
  );
}
