import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { cloudinaryConfig, signParams } from "./lib/cloudinary";

/** Removes images from Cloudinary. Scheduled by mutations that drop images. */
export const destroy = internalAction({
  args: { publicIds: v.array(v.string()) },
  handler: async (_ctx, { publicIds }) => {
    const { cloudName, apiKey, apiSecret } = cloudinaryConfig();
    for (const publicId of publicIds) {
      const params = {
        invalidate: "true",
        public_id: publicId,
        timestamp: Math.floor(Date.now() / 1000),
      };
      const body = new URLSearchParams({
        ...params,
        timestamp: String(params.timestamp),
        api_key: apiKey,
        signature: await signParams(params, apiSecret),
      });
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
        { method: "POST", body },
      );
      const json = (await response.json().catch(() => null)) as {
        result?: string;
        error?: { message?: string };
      } | null;
      // "not found" means it is already gone, which is fine.
      if (!response.ok || (json?.result !== "ok" && json?.result !== "not found")) {
        console.error(
          `Cloudinary delete failed for ${publicId}:`,
          json?.error?.message ?? json?.result ?? response.status,
        );
      }
    }
  },
});
