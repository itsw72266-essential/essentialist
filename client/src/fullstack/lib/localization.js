export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["en", "fr"];

const LOCALE_ALIASES = {
  english: "en",
  eng: "en",
  french: "fr",
  francais: "fr",
  français: "fr",
  fra: "fr",
};

export const normalizeLocale = (value) => {
  if (!value || typeof value !== "string") return DEFAULT_LOCALE;

  const first = value.split(",")[0]?.trim().toLowerCase();
  const code = first?.split(";")[0]?.split("-")[0]?.trim();
  const normalized = LOCALE_ALIASES[code] || code;

  return SUPPORTED_LOCALES.includes(normalized) ? normalized : DEFAULT_LOCALE;
};

export const getRequestLocale = (request) =>
  normalizeLocale(
    request.query?.lang ||
      request.query?.locale ||
      request.body?.lang ||
      request.body?.locale ||
      request.headers?.["x-locale"] ||
      request.headers?.["x-language"] ||
      request.headers?.["accept-language"]
  );

export const buildVaryHeader = (existing = "") => {
  const values = new Set(
    String(existing)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  );

  ["Authorization", "Cookie", "Accept-Language", "X-Locale", "X-Language"].forEach(
    (item) => values.add(item)
  );

  return Array.from(values).join(", ");
};

const isFilled = (value) => {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return value !== undefined && value !== null;
};

export const sanitizeTranslations = (translations = {}, allowedFields = []) => {
  if (!translations || typeof translations !== "object") return {};

  return SUPPORTED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE).reduce(
    (acc, locale) => {
      const source = translations[locale];
      if (!source || typeof source !== "object") return acc;

      const cleaned = {};
      allowedFields.forEach((field) => {
        if (isFilled(source[field])) cleaned[field] = source[field];
      });

      if (Object.keys(cleaned).length) acc[locale] = cleaned;
      return acc;
    },
    {}
  );
};

/**
 * Merge translations.fr.* over English fields for the requested locale.
 * By default strips the nested `translations` object from API payloads (Educaire-style).
 */
export const localizeDocument = (
  document,
  fields = [],
  locale = DEFAULT_LOCALE,
  { stripTranslations = true } = {},
) => {
  if (!document || typeof document !== "object") return document;

  const output = { ...document };
  const normalizedLocale = normalizeLocale(locale);
  const translation = output.translations?.[normalizedLocale];

  if (normalizedLocale !== DEFAULT_LOCALE && translation && typeof translation === "object") {
    fields.forEach((field) => {
      if (isFilled(translation[field])) {
        output[field] = translation[field];
      }
    });
  }

  if (stripTranslations) {
    delete output.translations;
  }

  output._locale = normalizedLocale;
  return output;
};

export const localizeDocuments = (documents, fields = [], locale = DEFAULT_LOCALE) => {
  if (!Array.isArray(documents)) return localizeDocument(documents, fields, locale);
  return documents.map((document) => localizeDocument(document, fields, locale));
};

const CATEGORY_FIELDS = ["name"];
const SUBCATEGORY_FIELDS = ["name"];
const BRAND_FIELDS = ["name", "description"];
const PRODUCT_FIELDS = ["name", "unit", "description", "specifications", "more_details"];

export const localizeProduct = (product, locale = DEFAULT_LOCALE) => {
  if (!product || typeof product !== "object") return product;

  const output = localizeDocument(product, PRODUCT_FIELDS, locale);
  output.category = localizeDocuments(output.category, CATEGORY_FIELDS, locale);
  output.subCategory = localizeDocuments(output.subCategory, SUBCATEGORY_FIELDS, locale);
  output.brand = localizeDocument(output.brand, BRAND_FIELDS, locale);

  return output;
};

export const localizeProducts = (products, locale = DEFAULT_LOCALE) => {
  if (!Array.isArray(products)) return localizeProduct(products, locale);
  return products.map((product) => localizeProduct(product, locale));
};

export const localizeBlog = (blog, locale = DEFAULT_LOCALE) =>
  localizeDocument(
    blog,
    ["title", "excerpt", "content", "tags", "metaTitle", "metaDescription"],
    locale
  );
