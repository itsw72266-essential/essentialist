export function getProductIdFromSlug(slugAndId) {
  if (!slugAndId) return "";
  // Handles slugs like "my-product-name-6832336ee1f06493c6738d98"
  return slugAndId.split("-").slice(-1)[0];
}