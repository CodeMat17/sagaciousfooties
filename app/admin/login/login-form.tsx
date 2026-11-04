"use client";

import { EyeIcon, EyeOffIcon, LockKeyholeIcon } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction, type SignInState } from "../actions";

const initial: SignInState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initial);
  const [visible, setVisible] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="pin">Admin PIN</Label>
        <div className="relative">
          <LockKeyholeIcon
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="pin"
            name="pin"
            type={visible ? "text" : "password"}
            inputMode="numeric"
            pattern="\d{6,12}"
            minLength={6}
            maxLength={12}
            autoComplete="current-password"
            autoFocus
            required
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? "pin-error" : undefined}
            className="h-14 bg-card pr-12 pl-10 text-center font-mono text-2xl tracking-[0.5em]"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-2 -translate-y-1/2"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide PIN" : "Show PIN"}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </Button>
        </div>
        {state.error && (
          <p id="pin-error" role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
      </div>
      <Button type="submit" size="xl" className="w-full" disabled={pending}>
        {pending ? "Checking…" : "Sign in"}
      </Button>
    </form>
  );
}
