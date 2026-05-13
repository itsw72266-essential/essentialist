/**
 * HttpOnly auth cookies — parity with Express `user.controller` cookieConfig.
 * Dev (http): lax + non-secure so localhost works. Prod: SameSite=None + Secure for cross-subdomain if needed.
 */

const maxAgeSeconds = Math.floor(
  (Number(process.env.AUTH_COOKIE_MAX_AGE_MS) || 1000 * 60 * 60 * 24 * 365) / 1000,
);

function baseCookieOptions() {
  const prod = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    path: "/",
    maxAge: maxAgeSeconds,
    sameSite: prod ? "none" : "lax",
    secure: prod,
  };
}

/** @param {import("next/server").NextResponse} res */
export function applyAuthTokensToResponse(res, { accessToken, refreshToken }) {
  if (!accessToken || !refreshToken) return;
  const base = baseCookieOptions();
  res.cookies.set("accessToken", accessToken, base);
  res.cookies.set("refreshToken", refreshToken, base);
}

/** @param {import("next/server").NextResponse} res */
export function clearAuthCookiesOnResponse(res) {
  const base = baseCookieOptions();
  res.cookies.set("accessToken", "", { ...base, maxAge: 0 });
  res.cookies.set("refreshToken", "", { ...base, maxAge: 0 });
}
