import { cache } from "react";
import SummaryApi, { apiFetch } from "@/backend/contracts/summaryApi";
import { getCurrentLocale } from "@/lib/i18n";
import { OBJECT_ID_REGEX } from "@/lib/catalogSlugs";

export const productQueryKey = (productKey, locale) => [
  "product-details",
  productKey,
  locale || (typeof window !== "undefined" ? getCurrentLocale() : "en"),
];
export const reviewStatsQueryKey = (productId) => ["product-review-stats", productId];

function buildProductDetailsBody(productKey) {
  if (!productKey) return null;
  const key = String(productKey);
  if (OBJECT_ID_REGEX.test(key) && key.length === 24) {
    return { productId: key };
  }
  return { slug: key };
}

async function fetchProductImpl(productKey, locale = "en") {
  const body = buildProductDetailsBody(productKey);
  if (!body) {
    const error = new Error("Missing product identifier");
    error.status = 400;
    throw error;
  }

  const response = await apiFetch(SummaryApi.getProductDetails.url, {
    method: SummaryApi.getProductDetails.method.toUpperCase(),
    body,
    locale,
  });

  if (!response?.data) {
    const error = new Error("Product not found");
    error.status = 404;
    throw error;
  }

  return response.data;
}

async function fetchReviewStatsImpl(productId) {
  if (!productId) {
    return { average: 0, count: 0 };
  }

  const endpoint = SummaryApi.reviews.listByProduct(productId);
  const response = await apiFetch(endpoint.url, {
    method: endpoint.method.toUpperCase(),
    params: { page: 1, limit: 1 },
    credentials: "omit",
  });

  const stats = response?.data?.stats ?? { average: 0, count: 0 };
  return {
    average: Number(stats.average) || 0,
    count: Number(stats.count) || 0,
  };
}

/** Dedupe within one RSC request (generateMetadata + page both need the same rows). */
export const fetchProduct = cache((productKey, locale = "en") =>
  fetchProductImpl(productKey, locale),
);
export const fetchReviewStats = cache(fetchReviewStatsImpl);

export function productQueryOptions(productKey, locale) {
  const resolvedLocale =
    locale || (typeof window !== "undefined" ? getCurrentLocale() : "en");
  return {
    queryKey: productQueryKey(productKey, resolvedLocale),
    queryFn: () => fetchProduct(productKey, resolvedLocale),
    staleTime: 60_000,
    retry: 1,
  };
}

export function reviewStatsQueryOptions(productId) {
  return {
    queryKey: reviewStatsQueryKey(productId),
    queryFn: () => fetchReviewStats(productId),
    staleTime: 30_000,
    retry: 1,
  };
}
