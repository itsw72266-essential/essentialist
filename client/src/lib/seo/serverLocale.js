import { headers } from "next/headers";

import { DEFAULT_LOCALE, normalizeLocale } from "@/fullstack/lib/localization";
import { getLocaleFromPathname } from "@/lib/seo/localePaths";

/** Locale for the current request (set by middleware on /fr/*). */
export async function getServerLocale() {
  const headerStore = await headers();
  const fromHeader = headerStore.get("x-locale");
  if (fromHeader) return normalizeLocale(fromHeader);

  const pathname =
    headerStore.get("x-pathname") || headerStore.get("x-invoke-path") || "/";
  return getLocaleFromPathname(pathname);
}

/** Original pathname including /fr when applicable. */
export async function getRequestPathname() {
  const headerStore = await headers();
  return headerStore.get("x-pathname") || "/";
}

export async function isFrenchRequest() {
  return (await getServerLocale()) !== DEFAULT_LOCALE;
}
