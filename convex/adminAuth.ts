import { ConvexError, v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import {
  constantTimeEqual,
  hashPin,
  randomHex,
  sha256Hex,
} from "./lib/crypto";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES_PER_CLIENT = 5;
const CLIENT_LOCK_MS = 15 * 60 * 1000;
const GLOBAL_KEY = "__global__";
const MAX_FAILURES_GLOBAL = 50;
const GLOBAL_LOCK_MS = 30 * 60 * 1000;
const PIN_PATTERN = /^\d{6,12}$/;

type SignInResult =
  | { ok: true; token: string; expiresAt: number }
  | { ok: false; error: string };

function assertServerSecret(serverSecret: string) {
  const expected = process.env.ADMIN_SERVER_SECRET;
  if (!expected || expected.length < 16) {
    throw new ConvexError(
      "Admin sign-in is not configured. Set ADMIN_SERVER_SECRET on Convex.",
    );
  }
  if (!constantTimeEqual(serverSecret, expected)) {
    throw new ConvexError("Forbidden.");
  }
}

async function verifyPin(
  pin: string,
  credential: { pinHash: string; salt: string } | null,
): Promise<boolean> {
  if (credential) {
    const hash = await hashPin(pin, credential.salt);
    return constantTimeEqual(hash, credential.pinHash);
  }
  const initialPin = process.env.ADMIN_PIN;
  if (!initialPin || !PIN_PATTERN.test(initialPin)) {
    throw new ConvexError(
      "Admin PIN is not configured. Set ADMIN_PIN (6–12 digits) on Convex.",
    );
  }
  // Compare digests so timing does not depend on where the PINs differ.
  return constantTimeEqual(await sha256Hex(pin), await sha256Hex(initialPin));
}

/**
 * Called only by the Next.js server action (guarded by ADMIN_SERVER_SECRET),
 * which supplies the visitor's IP as clientKey for rate limiting.
 */
export const signIn = action({
  args: { pin: v.string(), clientKey: v.string(), serverSecret: v.string() },
  handler: async (ctx, { pin, clientKey, serverSecret }): Promise<SignInResult> => {
    assertServerSecret(serverSecret);
    const key = clientKey.slice(0, 100) || "unknown";

    const gate = await ctx.runMutation(internal.adminAuth.registerAttempt, {
      key,
    });
    if (!gate.allowed) {
      const minutes = Math.max(1, Math.ceil(gate.retryAfterMs / 60_000));
      return {
        ok: false,
        error: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      };
    }

    const credential = await ctx.runQuery(internal.adminAuth.getCredential, {});
    const valid = PIN_PATTERN.test(pin) && (await verifyPin(pin, credential));
    if (!valid) {
      return { ok: false, error: "That PIN is not correct." };
    }

    const token = randomHex(32);
    const expiresAt = Date.now() + SESSION_TTL_MS;
    await ctx.runMutation(internal.adminAuth.createSession, {
      tokenHash: await sha256Hex(token),
      expiresAt,
      clientKey: key,
    });
    return { ok: true, token, expiresAt };
  },
});

export const registerAttempt = internalMutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const now = Date.now();
    const check = async (
      k: string,
      maxFailures: number,
      lockMs: number,
    ): Promise<number> => {
      const row = await ctx.db
        .query("loginAttempts")
        .withIndex("by_key", (q) => q.eq("key", k))
        .unique();
      if (!row) {
        await ctx.db.insert("loginAttempts", {
          key: k,
          failures: 1,
          windowStart: now,
        });
        return 0;
      }
      if (row.lockedUntil && row.lockedUntil > now) {
        return row.lockedUntil - now;
      }
      const freshWindow = now - row.windowStart > WINDOW_MS;
      const failures = freshWindow ? 1 : row.failures + 1;
      const lockedUntil = failures > maxFailures ? now + lockMs : undefined;
      await ctx.db.patch(row._id, {
        failures,
        windowStart: freshWindow ? now : row.windowStart,
        lockedUntil,
      });
      return lockedUntil ? lockedUntil - now : 0;
    };

    const clientWait = await check(key, MAX_FAILURES_PER_CLIENT, CLIENT_LOCK_MS);
    const globalWait = await check(GLOBAL_KEY, MAX_FAILURES_GLOBAL, GLOBAL_LOCK_MS);
    const retryAfterMs = Math.max(clientWait, globalWait);
    return { allowed: retryAfterMs === 0, retryAfterMs };
  },
});

export const getCredential = internalQuery({
  args: {},
  handler: async (ctx) => {
    const credential = await ctx.db.query("adminCredentials").first();
    return credential
      ? { pinHash: credential.pinHash, salt: credential.salt }
      : null;
  },
});

export const createSession = internalMutation({
  args: { tokenHash: v.string(), expiresAt: v.number(), clientKey: v.string() },
  handler: async (ctx, { tokenHash, expiresAt, clientKey }) => {
    const now = Date.now();
    await ctx.db.insert("adminSessions", { tokenHash, createdAt: now, expiresAt });

    // A successful sign-in clears this client's failure counter.
    const attempts = await ctx.db
      .query("loginAttempts")
      .withIndex("by_key", (q) => q.eq("key", clientKey))
      .unique();
    if (attempts) await ctx.db.delete(attempts._id);

    // Housekeeping: drop expired sessions.
    const sessions = await ctx.db.query("adminSessions").collect();
    for (const s of sessions) {
      if (s.expiresAt <= now) await ctx.db.delete(s._id);
    }
  },
});

/** Used by the admin layout on the server to gate /admin routes. */
export const validateSession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    if (sessionToken.length < 32) return false;
    const tokenHash = await sha256Hex(sessionToken);
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    return !!session && session.expiresAt > Date.now();
  },
});

export const signOut = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    if (sessionToken.length < 32) return;
    const tokenHash = await sha256Hex(sessionToken);
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    if (session) await ctx.db.delete(session._id);
  },
});

export const sessionIsValid = internalQuery({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    if (sessionToken.length < 32) return false;
    const tokenHash = await sha256Hex(sessionToken);
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    return !!session && session.expiresAt > Date.now();
  },
});

export const storeCredential = internalMutation({
  args: { pinHash: v.string(), salt: v.string(), keepTokenHash: v.string() },
  handler: async (ctx, { pinHash, salt, keepTokenHash }) => {
    const existing = await ctx.db.query("adminCredentials").first();
    if (existing) {
      await ctx.db.patch(existing._id, { pinHash, salt, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("adminCredentials", {
        pinHash,
        salt,
        updatedAt: Date.now(),
      });
    }
    // Changing the PIN signs out every other device.
    const sessions = await ctx.db.query("adminSessions").collect();
    for (const s of sessions) {
      if (s.tokenHash !== keepTokenHash) await ctx.db.delete(s._id);
    }
  },
});

/** Lets the signed-in owner replace the PIN from the settings page. */
export const changePin = action({
  args: {
    sessionToken: v.string(),
    currentPin: v.string(),
    newPin: v.string(),
  },
  handler: async (ctx, { sessionToken, currentPin, newPin }) => {
    const valid = await ctx.runQuery(internal.adminAuth.sessionIsValid, {
      sessionToken,
    });
    if (!valid) throw new ConvexError("UNAUTHORIZED");

    if (!PIN_PATTERN.test(newPin)) {
      throw new ConvexError("New PIN must be 6 to 12 digits.");
    }
    if (/^(\d)\1+$/.test(newPin) || "0123456789012".includes(newPin)) {
      throw new ConvexError("Choose a PIN that is harder to guess.");
    }
    const gate = await ctx.runMutation(internal.adminAuth.registerAttempt, {
      key: `change-pin:${(await sha256Hex(sessionToken)).slice(0, 16)}`,
    });
    if (!gate.allowed) {
      throw new ConvexError("Too many attempts. Please wait and try again.");
    }
    const credential = await ctx.runQuery(internal.adminAuth.getCredential, {});
    if (!(await verifyPin(currentPin, credential))) {
      throw new ConvexError("Current PIN is not correct.");
    }
    const salt = randomHex(16);
    await ctx.runMutation(internal.adminAuth.storeCredential, {
      pinHash: await hashPin(newPin, salt),
      salt,
      keepTokenHash: await sha256Hex(sessionToken),
    });
    return { ok: true as const };
  },
});
