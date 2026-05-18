import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  normalizeLocale,
} from "@/fullstack/lib/localization";

export const SITE_ORIGIN =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://www.esmakeupstore.com").replace(
    /\/+$/,
    "",
  );

/** URL segments reserved for locale routing — not category slugs. */
export const LOCALE_PATH_PREFIXES = ["fr", "en"];

/** @param {string} [segment] */
export function isLocalePathPrefix(segment) {
  return LOCALE_PATH_PREFIXES.includes(String(segment || "").toLowerCase());
}

/** @param {string} [pathname] */
export function stripLocalePrefix(pathname = "/") {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (path === "/fr") return "/";
  if (path.startsWith("/fr/")) return path.slice(3) || "/";
  return path;
}

/** @param {string} [pathname] */
export function getLocaleFromPathname(pathname = "/") {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (path === "/fr" || path.startsWith("/fr/")) return "fr";
  return DEFAULT_LOCALE;
}

/**
 * @param {string} path - path without locale prefix
 * @param {string} [locale]
 */
export function localizePath(path, locale = DEFAULT_LOCALE) {
  const lang = normalizeLocale(locale);
  const base = stripLocalePrefix(path || "/");
  if (lang === "fr") return base === "/" ? "/fr" : `/fr${base}`;
  return base;
}

/** @param {string} path - with or without /fr prefix */
export function toAbsoluteUrl(path) {
  const localized =
    path.startsWith("http") ? path : localizePath(stripLocalePrefix(path), getLocaleFromPathname(path));
  if (localized.startsWith("http")) return localized;
  return `${SITE_ORIGIN}${localized.startsWith("/") ? "" : "/"}${localized}`;
}

/**
 * hreflang map for Next.js metadata.alternates.languages
 * @param {string} path - locale-neutral path (e.g. /product/foo-123)
 */
export function buildLanguageAlternates(path) {
  const base = stripLocalePrefix(path || "/");
  const enPath = base === "/" ? "/" : base;
  const frPath = localizePath(base, "fr");

  return {
    en: `${SITE_ORIGIN}${enPath}`,
    "en-US": `${SITE_ORIGIN}${enPath}`,
    fr: `${SITE_ORIGIN}${frPath}`,
    "fr-CM": `${SITE_ORIGIN}${frPath}`,
    "x-default": `${SITE_ORIGIN}${enPath}`,
  };
}

export function buildCanonicalUrl(path, locale = DEFAULT_LOCALE) {
  const lang = normalizeLocale(locale);
  const localized = localizePath(stripLocalePrefix(path || "/"), lang);
  return `${SITE_ORIGIN}${localized}`;
}

export { SUPPORTED_LOCALES, DEFAULT_LOCALE, normalizeLocale };
