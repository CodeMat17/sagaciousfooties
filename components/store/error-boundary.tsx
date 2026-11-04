"use client";

import { RotateCcwIcon } from "lucide-react";
import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = { children: ReactNode; title?: string };
type State = { error: Error | null; attempt: number };

/** Error state with retry for live Convex sections. */
export class LiveErrorBoundary extends Component<Props, State> {
  state: State = { error: null, attempt: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="flex flex-col items-center gap-4 rounded-md border border-dashed px-6 py-14 text-center"
        >
          <p className="font-display text-2xl">
            {this.props.title ?? "We couldn't load this right now."}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Please check your connection and try again.
          </p>
          <Button
            variant="outline"
            onClick={() =>
              this.setState((s) => ({ error: null, attempt: s.attempt + 1 }))
            }
          >
            <RotateCcwIcon data-icon="inline-start" />
            Try again
          </Button>
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
