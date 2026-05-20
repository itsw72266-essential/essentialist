/** MongoDB ObjectId (24 hex). */
export const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;

/** Top-level segments that must not be used as category slugs. */
export const RESERVED_CATALOG_SLUGS = new Set([
  "product",
  "products",
  "brands",
  "brand",
  "blog",
  "contact",
  "search",
  "cart",
  "checkout",
  "orders",
  "user",
  "login",
  "register",
  "dashboard",
  "api",
  "fr",
  "en",
]);

/**
 * URL-safe slug from display name (matches legacy valideURLConvert behavior).
 * @param {string} [input]
 */
export function slugifyName(input = "") {
  return String(input)
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * @param {string} base
 * @param {Set<string>} taken
 */
export function ensureUniqueSlug(base, taken) {
  const root = base || "item";
  let slug = root;
  let n = 2;
  while (taken.has(slug) || RESERVED_CATALOG_SLUGS.has(slug)) {
    slug = `${root}-${n}`;
    n += 1;
  }
  taken.add(slug);
  return slug;
}

/**
 * @param {string} [param]
 * @returns {string | null}
 */
export function extractLegacyObjectId(param) {
  if (!param) return null;
  const value = String(param);
  if (OBJECT_ID_REGEX.test(value)) return value;
  const parts = value.split("-");
  const last = parts[parts.length - 1];
  return OBJECT_ID_REGEX.test(last) ? last : null;
}

/**
 * @param {string} [param]
 */
export function stripLegacyIdSuffix(param) {
  if (!param) return "";
  const id = extractLegacyObjectId(param);
  if (!id || param === id) return param;
  const suffix = `-${id}`;
  return param.endsWith(suffix) ? param.slice(0, -suffix.length) : param;
}

/**
 * @param {{ slug?: string, name?: string, _id?: string }} entity
 */
export function getProductSlug(entity) {
  if (entity?.slug) return String(entity.slug);
  const base = slugifyName(entity?.name || "");
  if (entity?._id) return `${base}-${entity._id}`;
  return base;
}

/**
 * @param {{ slug?: string, name?: string, _id?: string }} entity
 */
export function getCategorySlug(entity) {
  if (entity?.slug) return String(entity.slug);
  const base = slugifyName(entity?.name || "");
  if (entity?._id) return `${base}-${entity._id}`;
  return base;
}

/**
 * @param {{ slug?: string, name?: string, _id?: string }} entity
 */
export function getSubCategorySlug(entity) {
  if (entity?.slug) return String(entity.slug);
  const base = slugifyName(entity?.name || "");
  if (entity?._id) return `${base}-${entity._id}`;
  return base;
}

/** @param {{ slug?: string, name?: string, _id?: string }} product */
export function buildProductPath(product) {
  return `/product/${getProductSlug(product)}`;
}

/** @param {{ slug?: string, name?: string, _id?: string }} category */
export function buildCategoryPath(category) {
  return `/${getCategorySlug(category)}`;
}

/**
 * @param {{ slug?: string, name?: string, _id?: string }} category
 * @param {{ slug?: string, name?: string, _id?: string }} subCategory
 */
export function buildSubCategoryPath(category, subCategory) {
  return `${buildCategoryPath(category)}/${getSubCategorySlug(subCategory)}`;
}

/** True when URL still uses legacy `name-{objectId}` form. */
export function isLegacySlugParam(param) {
  const id = extractLegacyObjectId(param);
  return Boolean(id && param !== id && param.endsWith(`-${id}`));
}

/**
 * @param {Array<{ _id?: string, slug?: string, name?: string }>} categories
 * @param {string} param
 */
export function findCategoryByParam(categories, param) {
  if (!param || !Array.isArray(categories)) return null;
  const bySlug = categories.find((c) => c?.slug && c.slug === param);
  if (bySlug) return bySlug;

  const legacyId = extractLegacyObjectId(param);
  if (legacyId) {
    return categories.find((c) => String(c?._id) === String(legacyId)) || null;
  }

  return null;
}

/**
 * @param {Array<{ _id?: string, slug?: string, name?: string }>} subcategories
 * @param {string} param
 */
export function findSubCategoryByParam(subcategories, param) {
  if (!param || !Array.isArray(subcategories)) return null;
  const bySlug = subcategories.find((s) => s?.slug && s.slug === param);
  if (bySlug) return bySlug;

  const legacyId = extractLegacyObjectId(param);
  if (legacyId) {
    return (
      subcategories.find((s) => String(s?._id) === String(legacyId)) || null
    );
  }

  return null;
}

/**
 * @param {{ slug?: string, name?: string, _id?: string }} entity
 * @param {string} urlParam
 */
export function shouldRedirectCatalogParam(entity, urlParam) {
  if (!entity?.slug || !urlParam) return false;
  return isLegacySlugParam(urlParam) && urlParam !== entity.slug;
}
