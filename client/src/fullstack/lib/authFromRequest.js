import { parse as parseCookie } from "cookie";

/** @param {Request} request */
export function getBearerToken(request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}

/** Cookie first, then Bearer — matches Express `auth` middleware. */
export function getAccessTokenFromRequest(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = parseCookie(cookieHeader);
  if (cookies.accessToken) return String(cookies.accessToken).trim() || null;
  return getBearerToken(request);
}
