"use server";

import { fetchAction, fetchMutation } from "convex/nextjs";
import { ConvexError } from "convex/values";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { ADMIN_SESSION_COOKIE } from "@/lib/constants";

export type SignInState = { error: string | null };

export async function signInAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const pin = String(formData.get("pin") ?? "").trim();
  if (!/^\d{6,12}$/.test(pin)) {
    return { error: "Enter your 6–12 digit PIN." };
  }
  const secret = process.env.ADMIN_SERVER_SECRET;
  if (!secret) {
    return { error: "Admin sign-in is not configured on this server." };
  }
  const h = await headers();
  const clientKey =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";

  try {
    const result = await fetchAction(api.adminAuth.signIn, {
      pin,
      clientKey,
      serverSecret: secret,
    });
    if (!result.ok) return { error: result.error };
    (await cookies()).set(ADMIN_SESSION_COOKIE, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/admin",
      expires: new Date(result.expiresAt),
    });
  } catch (error) {
    return {
      error:
        error instanceof ConvexError && typeof error.data === "string"
          ? error.data
          : "Sign-in failed. Please try again.",
    };
  }
  redirect("/admin");
}

export async function signOutAction(): Promise<void> {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (token) {
    try {
      await fetchMutation(api.adminAuth.signOut, { sessionToken: token });
    } catch {
      // Cookie is removed regardless.
    }
  }
  store.delete({ name: ADMIN_SESSION_COOKIE, path: "/admin" });
  redirect("/admin/login");
}
