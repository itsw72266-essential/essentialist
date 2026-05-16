/** React Query keys that depend on Accept-Language / locale headers. */

const LOCALE_QUERY_ROOTS = new Set([
  "categories",
  "sub-categories",
  "category-client-block",
  "products-infinite",
  "product-catalog",
  "brand-products",
  "product-details",
  "blogs",
]);

export function isLocaleSensitiveQuery(query) {
  const root = query?.queryKey?.[0];
  if (root == null) return false;
  const key = String(root);
  return LOCALE_QUERY_ROOTS.has(key);
}
