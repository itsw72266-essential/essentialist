"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { normalizeLocale } from "@/lib/i18n";
import { getLocaleFromPathname, localizePath } from "@/lib/seo/localePaths";

/**
 * Active locale for links: /fr in URL, or i18n preference when still on an unprefixed path.
 */
export function useActiveLocale() {
  const pathname = usePathname();
  const { i18n } = useTranslation();
  const pathLocale = getLocaleFromPathname(pathname);
  const i18nLocale = normalizeLocale(i18n.resolvedLanguage || i18n.language);
  if (pathLocale === "fr") return "fr";
  if (i18nLocale === "fr") return "fr";
  return "en";
}

/** @returns {(path: string) => string} */
export function useLocalizedHref() {
  const locale = useActiveLocale();
  return useCallback((path) => localizePath(path, locale), [locale]);
}
