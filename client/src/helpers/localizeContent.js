/**
 * Client-side merge when the API still returns raw documents with `translations.fr`.
 * Prefer localized API responses; use these helpers only as a fallback.
 */

import { normalizeLocale, DEFAULT_LOCALE } from "@/lib/i18n";

const isFilled = (value) => {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return value !== undefined && value !== null;
};

/**
 * @param {Record<string, unknown> | null | undefined} doc
 * @param {string} field
 * @param {string} [locale] - from i18n.language
 */
export function getLocalizedContent(doc, field, locale) {
  if (!doc) return "";
  const lang = normalizeLocale(locale);
  if (lang === DEFAULT_LOCALE) {
    return doc[field] ?? "";
  }
  const translated = doc.translations?.[lang]?.[field];
  if (isFilled(translated)) return translated;
  return doc[field] ?? "";
}

export function getLocalizedProductName(product, locale) {
  return getLocalizedContent(product, "name", locale);
}
