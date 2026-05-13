/**
 * Base URL for server-side fetch() to this app's `/api/next/*` Route Handlers.
 * On Vercel, prefer `API_URL` or `VERCEL_URL` over `NEXT_PUBLIC_API_URL` when the
 * public URL points at a marketing domain that does not serve the Next API.
 */

function stripTrailingSlashes(input) {
  if (!input || typeof input !== "string") return "";
  return input.trim().replace(/\/+$/, "");
}

export function getServerSideApiBaseUrl() {
  const apiUrl = stripTrailingSlashes(process.env.API_URL);
  if (apiUrl) return apiUrl;

  const vercel = stripTrailingSlashes(process.env.VERCEL_URL);
  if (vercel) {
    if (/^https?:\/\//i.test(vercel)) return vercel;
    return stripTrailingSlashes(`https://${vercel}`);
  }

  const branch = stripTrailingSlashes(process.env.VERCEL_BRANCH_URL);
  if (branch) {
    if (/^https?:\/\//i.test(branch)) return branch;
    return stripTrailingSlashes(`https://${branch}`);
  }

  return stripTrailingSlashes(process.env.NEXT_PUBLIC_API_URL || "");
}
