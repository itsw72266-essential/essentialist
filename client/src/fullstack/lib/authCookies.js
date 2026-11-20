/**
 * HttpOnly auth cookies.
 *
 * SameSite=Lax everywhere: these cookies are only ever read by this same
 * Next.js app's own `/api/next/*` routes (same origin as the pages that
 * set them — there is no separate API domain, and no cross-site CORS is
 * configured for them). SameSite=Lax still covers subdomains of the same
 * registrable domain (e.g. www vs apex), since the SameSite attribute is
 * scoped to the whole site, not a single origin. Using SameSite=None here
 * would needlessly expose every state-changing route to CSRF from any
 * third-party page, with no corresponding benefit.
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
    sameSite: "lax",
    secure: prod,
  };
}

/** Remove JWT fields from JSON so clients rely on httpOnly cookies only. */
export function stripAuthSecretsFromBodyForClient(body) {
  if (!body || typeof body !== "object" || !body.data || typeof body.data !== "object") {
    return body;
  }
  const { accessToken, refreshToken, ...rest } = body.data;
  return { ...body, data: rest };
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
