"use client";

import { ConvexError } from "convex/values";
import { createContext, useContext, type ReactNode } from "react";

const AdminSessionContext = createContext<string | null>(null);

export function AdminSessionProvider({
  token,
  children,
}: {
  token: string;
  children: ReactNode;
}) {
  return (
    <AdminSessionContext.Provider value={token}>{children}</AdminSessionContext.Provider>
  );
}

/** The session token passed to every admin Convex call (verified server-side). */
export function useAdminToken(): string {
  const token = useContext(AdminSessionContext);
  if (!token) throw new Error("useAdminToken must be used inside the admin panel.");
  return token;
}

export function errorMessage(error: unknown): string {
  if (error instanceof ConvexError) {
    if (error.data === "UNAUTHORIZED") return "Your session has expired. Please sign in again.";
    if (typeof error.data === "string") return error.data;
  }
  return "Something went wrong. Please try again.";
}

export function isUnauthorized(error: unknown): boolean {
  return (
    (error instanceof ConvexError && error.data === "UNAUTHORIZED") ||
    (error instanceof Error && error.message.includes("UNAUTHORIZED"))
  );
}
