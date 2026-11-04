/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_categories from "../admin/categories.js";
import type * as admin_enquiries from "../admin/enquiries.js";
import type * as admin_files from "../admin/files.js";
import type * as admin_products from "../admin/products.js";
import type * as admin_settings from "../admin/settings.js";
import type * as adminAuth from "../adminAuth.js";
import type * as catalog from "../catalog.js";
import type * as lib_authorization from "../lib/authorization.js";
import type * as lib_crypto from "../lib/crypto.js";
import type * as lib_present from "../lib/present.js";
import type * as lib_validation from "../lib/validation.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/categories": typeof admin_categories;
  "admin/enquiries": typeof admin_enquiries;
  "admin/files": typeof admin_files;
  "admin/products": typeof admin_products;
  "admin/settings": typeof admin_settings;
  adminAuth: typeof adminAuth;
  catalog: typeof catalog;
  "lib/authorization": typeof lib_authorization;
  "lib/crypto": typeof lib_crypto;
  "lib/present": typeof lib_present;
  "lib/validation": typeof lib_validation;
  seed: typeof seed;
  settings: typeof settings;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
