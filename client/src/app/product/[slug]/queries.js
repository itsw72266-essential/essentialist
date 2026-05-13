// client\src\app\product\[slug]\queries.js
import { cache } from "react";
import SummaryApi, { apiFetch } from "../../../common/SummaryApi";

export const productQueryKey = (productId) => ["product-details", productId];
export const ratingQueryKey = (productId) => ["product-ratings", productId];

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

async function fetchRatingsImpl(productId) {
  if (!productId) {
    return {
      average: 0,
      count: 0,
      myRating: null,
    };
  }

  const response = await apiFetch(SummaryApi.ratingsGet.url(productId), {
    method: SummaryApi.ratingsGet.method.toUpperCase(),
  });

  return (
    response?.data ?? {
      average: 0,
      count: 0,
      myRating: null,
    }
  );
}

/** Dedupe within one RSC request (generateMetadata + page both need the same rows). */
export const fetchProduct = cache(fetchProductImpl);
export const fetchRatings = cache(fetchRatingsImpl);

export function productQueryOptions(productId) {
  return {
    queryKey: productQueryKey(productId),
    queryFn: () => fetchProduct(productId),
    staleTime: 60_000,
    retry: 1,
  };
}

export function ratingQueryOptions(productId) {
  return {
    queryKey: ratingQueryKey(productId),
    queryFn: () => fetchRatings(productId),
    staleTime: 30_000,
    retry: 1,
  };
}