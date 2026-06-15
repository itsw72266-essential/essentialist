import { NextResponse } from "next/server";

const LOCALE_HEADER = "x-locale";
const PATHNAME_HEADER = "x-pathname";

const SKIP_LOCALE_PREFIX = [
  "/api",
  "/_next",
  "/favicon",
  "/assets",
  "/robots",
  "/sitemap",
];

function shouldSkipLocale(pathname) {
  return SKIP_LOCALE_PREFIX.some((prefix) => pathname.startsWith(prefix));
}

function normalizePathname(pathname) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.replace(/\/+$/, "") || "/";
  }
  return pathname;
}

export function middleware(request) {
  const pathname = normalizePathname(request.nextUrl.pathname);

  if (shouldSkipLocale(pathname)) {
    return NextResponse.next();
  }

  const isFrench =
    pathname === "/fr" || pathname.startsWith("/fr/");
  const locale = isFrench ? "fr" : "en";

  // Forward locale + original pathname on the REQUEST headers so Server
  // Components can read them via headers() (response headers are not visible
  // to RSC). This is what lets the initial HTML render in the right language.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);
  requestHeaders.set(PATHNAME_HEADER, pathname);

  if (!isFrench) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const stripped = pathname === "/fr" ? "/" : pathname.replace(/^\/fr/, "") || "/";

  if (stripped.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = stripped;
    return NextResponse.redirect(url);
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = stripped;

  return NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders },
  });
}

export const config = {
  // Exclude API routes from middleware entirely. The handler already no-ops on
  // `/api` (locale logic doesn't apply), so invoking middleware per API call was
  // pure overhead — every client fetch (cart, products, reviews-batch, …) paid a
  // needless function invocation that counts toward Fluid Active CPU.
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
