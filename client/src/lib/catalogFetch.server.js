import SummaryApi, { baseURL } from "@/backend/contracts/summaryApi";
import { localeRequestHeaders } from "@/lib/seo/serverFetch";

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

/** @param {string} [locale] */
export async function fetchAllCategories(locale = "en") {
  try {
    const res = await fetch(`${baseURL}${SummaryApi.getCategory.url}`, {
      method: SummaryApi.getCategory.method.toUpperCase(),
      headers: localeRequestHeaders(locale),
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const j = await res.json();
    return safeArray(j?.data || j);
  } catch {
    return [];
  }
}

/**
 * @param {string} categoryId
 */
export async function fetchSubCategoriesOfCategory(categoryId) {
  try {
    const res = await fetch(`${baseURL}${SummaryApi.getSubCategory.url}`, {
      method: SummaryApi.getSubCategory.method.toUpperCase(),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId }),
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const j = await res.json();
    return safeArray(j?.data || j).filter((s) =>
      safeArray(s?.category).some((c) => String(c?._id) === String(categoryId)),
    );
  } catch {
    return [];
  }
}
