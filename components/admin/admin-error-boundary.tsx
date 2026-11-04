"use client";

import { LogInIcon, RotateCcwIcon } from "lucide-react";
import Link from "next/link";
import { Component, type ReactNode } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { errorMessage, isUnauthorized } from "./admin-session";

type State = { error: unknown; attempt: number };

export class AdminErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null, attempt: 0 };

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (error) {
      const expired = isUnauthorized(error);
      return (
        <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
          <h1 className="text-4xl">{expired ? "Session expired" : "Something went wrong"}</h1>
          <p className="text-muted-foreground">
            {expired
              ? "For your security, please sign in again to continue."
              : errorMessage(error)}
          </p>
          {expired ? (
            <Link href="/admin/login" className={buttonVariants({ size: "xl" })}>
              <LogInIcon data-icon="inline-start" />
              Sign in again
            </Link>
          ) : (
            <Button
              size="xl"
              variant="outline"
              onClick={() => this.setState((s) => ({ error: null, attempt: s.attempt + 1 }))}
            >
              <RotateCcwIcon data-icon="inline-start" />
              Try again
            </Button>
          )}
        </div>
      );
    }
    return (
      <div key={this.state.attempt} className="contents">
        {this.props.children}
      </div>
    );
  }
}
