/**
 * Resolves the legacy Express base origin for server-side Route Handlers (BFF).
 * Prefer private `API_URL` on the server; fall back to `NEXT_PUBLIC_API_URL`.
 */
export function getLegacyExpressOrigin() {
  const primary =
    typeof process.env.API_URL === "string" ? process.env.API_URL.trim() : "";
  const fallback =
    typeof process.env.NEXT_PUBLIC_API_URL === "string"
      ? process.env.NEXT_PUBLIC_API_URL.trim()
      : "";
  const raw = primary || fallback;
  return raw.replace(/\/+$/, "");
}
