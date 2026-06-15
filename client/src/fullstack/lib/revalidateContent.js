import { revalidateTag } from "next/cache";

/**
 * Bust the Next.js cache tags used by the cached content-page renders
 * (src/app: product/[slug], [category], blog, blog/[slug], new-arrival, and the
 * home/category catalog in src/server/catalog.js). Called from admin mutation
 * controllers so edits show immediately instead of after the cacheLife window.
 *
 * Each call is guarded: a revalidation failure must never break the mutation.
 */
function bust(tag) {
  if (!tag) return;
  try {
    revalidateTag(tag);
  } catch (error) {
    console.error("revalidateTag failed:", tag, error);
  }
}

/** Normalize an id / doc / array-of-(id|doc) into a deduped list of id strings. */
const toIdList = (value) => {
  if (value === undefined || value === null) return [];
  const arr = Array.isArray(value) ? value : [value];
  return [
    ...new Set(
      arr
        .map((v) => {
          if (!v) return null;
          if (typeof v === "object") return String(v._id ?? v.id ?? "");
          return String(v);
        })
        .filter(Boolean),
    ),
  ];
};

/** Product create/update/delete → product page, its categories, new arrivals. */
export function revalidateProductTags({ productId, categoryIds } = {}) {
  if (productId) bust(`product-${productId}`);
  for (const id of toIdList(categoryIds)) {
    bust(`category-${id}`);
    bust(`products-${id}`); // home-page catalog bundle (src/server/catalog.js)
  }
  bust("new-arrival");
}

/** Category create/update/delete → nav, the category page, home catalog. */
export function revalidateCategoryTags({ categoryId } = {}) {
  bust("categories");
  bust("subcategories");
  for (const id of toIdList(categoryId)) {
    bust(`category-${id}`);
    bust(`products-${id}`);
  }
}

/** Subcategory create/update/delete → nav + parent category pages. */
export function revalidateSubCategoryTags({ categoryIds } = {}) {
  bust("subcategories");
  for (const id of toIdList(categoryIds)) {
    bust(`category-${id}`);
  }
}

/** Blog create/update/delete → the post + the listing. */
export function revalidateBlogTags({ slug } = {}) {
  bust("blog-list");
  if (slug) bust(`blog-${slug}`);
}
