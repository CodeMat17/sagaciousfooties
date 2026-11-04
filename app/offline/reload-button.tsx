"use client";

import { RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReloadButton() {
  return (
    <Button size="xl" onClick={() => window.location.reload()}>
      <RotateCcwIcon data-icon="inline-start" />
      Try again
    </Button>
  );
}
