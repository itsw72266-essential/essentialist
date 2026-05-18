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

  if (!isFrench) {
    const response = NextResponse.next();
    response.headers.set(LOCALE_HEADER, "en");
    response.headers.set(PATHNAME_HEADER, pathname);
    return response;
  }

  const stripped = pathname === "/fr" ? "/" : pathname.replace(/^\/fr/, "") || "/";

  if (stripped.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = stripped;
    return NextResponse.redirect(url);
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = stripped;

  const response = NextResponse.rewrite(rewriteUrl);
  response.headers.set(LOCALE_HEADER, "fr");
  response.headers.set(PATHNAME_HEADER, pathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
