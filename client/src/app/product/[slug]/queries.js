// client\src\app\product\[slug]\queries.js
import { cache } from "react";
import SummaryApi, { apiFetch } from "@/backend/contracts/summaryApi";

export const productQueryKey = (productId) => ["product-details", productId];
export const reviewStatsQueryKey = (productId) => ["product-review-stats", productId];

async function fetchProductImpl(productId) {
  if (!productId) {
    const error = new Error("Missing productId");
    error.status = 400;
    throw error;
  }

  const response = await apiFetch(SummaryApi.getProductDetails.url, {
    method: SummaryApi.getProductDetails.method.toUpperCase(),
    body: { productId },
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
export const fetchProduct = cache(fetchProductImpl);
export const fetchReviewStats = cache(fetchReviewStatsImpl);

export function productQueryOptions(productId) {
  return {
    queryKey: productQueryKey(productId),
    queryFn: () => fetchProduct(productId),
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