/**
 * Central place for public / server-side URL env reads used by the HTTP layer.
 * Does not duplicate SummaryApi URL resolution; use alongside SummaryApi exports.
 */

export function getPublicApiBaseUrl() {
  return typeof process.env.NEXT_PUBLIC_API_URL === "string"
    ? process.env.NEXT_PUBLIC_API_URL.trim()
    : "";
}

export function getServerApiBaseUrl() {
  return typeof process.env.API_URL === "string" ? process.env.API_URL.trim() : "";
}

export function getPublicSiteUrl() {
  return typeof process.env.NEXT_PUBLIC_SITE_URL === "string"
    ? process.env.NEXT_PUBLIC_SITE_URL.trim()
    : "";
}
