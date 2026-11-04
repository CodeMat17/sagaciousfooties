import { ConvexError } from "convex/values";
import type { QueryCtx } from "../_generated/server";
import { sha256Hex } from "./crypto";

export const UNAUTHORIZED = "UNAUTHORIZED";

/**
 * Verifies an admin session token on the server. Every admin query and
 * mutation calls this first; nothing the browser claims is trusted.
 */
export async function requireAdmin(
  ctx: QueryCtx,
  sessionToken: string,
): Promise<void> {
  if (typeof sessionToken !== "string" || sessionToken.length < 32) {
    throw new ConvexError(UNAUTHORIZED);
  }
  const tokenHash = await sha256Hex(sessionToken);
  const session = await ctx.db
    .query("adminSessions")
    .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
    .unique();
  if (!session || session.expiresAt <= Date.now()) {
    throw new ConvexError(UNAUTHORIZED);
  }
}
