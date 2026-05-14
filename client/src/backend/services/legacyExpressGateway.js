/**
 * Optional ops: server-side `fetch` to a **separate** Express process (`server/`).
 * Not used for storefront API traffic (that goes to `/api/next/*` on this app).
 *
 * @see docs/next-fullstack-migration.txt
 */

import { getLegacyExpressOrigin } from "../config/upstreamOrigin.js";

export const LEGACY_EXPRESS_ENTRY = "server/index.js";

/**
 * Builds an absolute URL to the legacy Express app. Returns `null` if no base
 * origin is configured (`API_URL` or `NEXT_PUBLIC_API_URL`).
 *
 * @param {string} pathname - Must be like `/health` or `/api/user/login`
 */
export function getLegacyExpressFetchUrl(pathname) {
  const base = getLegacyExpressOrigin();
  if (!base) return null;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

/**
 * `fetch` against the Express origin. Server-only (Route Handlers, `serverComponents`).
 * Returns `null` if the upstream origin is missing.
 *
 * @param {string} pathname
 * @param {RequestInit} [init]
 * @returns {Promise<Response | null>}
 */
export function fetchLegacyExpress(pathname, init = {}) {
  const url = getLegacyExpressFetchUrl(pathname);
  if (!url) return Promise.resolve(null);
  return fetch(url, { cache: "no-store", ...init });
}
