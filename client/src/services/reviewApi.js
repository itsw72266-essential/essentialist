import Axios from "@/utils/Axios";

const REVIEW_TOKEN_HEADER = "x-review-token";
const SUBJECT_TYPES = [
  "product",
  "customer_service",
  "environment",
  "shipping",
  "website",
  "other",
];

const pruneParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );

const normalisePayload = (payload = {}) => ({
  items: payload.items ?? [],
  total:
    payload.total ??
    (Array.isArray(payload.items) ? payload.items.length : 0),
  page: payload.page ?? 1,
  pages: payload.pages ?? 1,
  stats: payload.stats ?? { average: 0, count: 0 },
});

async function requestPublicReviews({ params, signal }) {
  const response = await Axios.get("/api/reviews/public", {
    params,
    signal,
  });
  return normalisePayload(response?.data?.data);
}

export const fetchPublicReviews = async ({
  query = {},
  page = 1,
  signal,
} = {}) => {
  const { subjectType, ...rest } = query ?? {};
  const baseParams = pruneParams({
    ...rest,
    limit: rest.limit ?? 6,
  });

  if (subjectType && subjectType !== "all") {
    return requestPublicReviews({
      params: { ...baseParams, subjectType, page },
      signal,
    });
  }

  if (!subjectType) {
    return requestPublicReviews({
      params: { ...baseParams, page },
      signal,
    });
  }

  // subjectType === "all" => aggregate every subject
  const aggregatorBaseParams = {
    ...baseParams,
    limit: Math.max(baseParams.limit ?? 6, 20),
  };
  const dedupe = new Map();
  let combinedCount = 0;
  let weightedSum = 0;

  for (const subject of SUBJECT_TYPES) {
    if (signal?.aborted) break;

    let currentPage = 1;
    let totalPages = 1;

    do {
      if (signal?.aborted) break;

      const params = pruneParams({
        ...aggregatorBaseParams,
        subjectType: subject,
        page: currentPage,
      });

      const payload = await requestPublicReviews({ params, signal });

      payload.items.forEach((item) => {
        if (!dedupe.has(item._id)) {
          dedupe.set(item._id, item);
        }
      });

      if (currentPage === 1) {
        const stats = payload.stats ?? { average: 0, count: 0 };
        combinedCount += stats.count ?? 0;
        if (stats.count) {
          weightedSum += (stats.average ?? 0) * stats.count;
        }
      }

      totalPages = payload.pages ?? 1;
      currentPage += 1;
    } while (currentPage <= totalPages);
  }

  const items = Array.from(dedupe.values()).sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return bTime - aTime;
  });

  const aggregateAverage =
    combinedCount > 0 ? Number((weightedSum / combinedCount).toFixed(2)) : 0;

  return {
    items,
    total: items.length,
    page: 1,
    pages: 1,
    stats: {
      average: aggregateAverage,
      count: combinedCount,
    },
  };
};

export const upsertReview = async (payload = {}) => {
  const headers = {};
  if (payload?.guestToken) {
    headers[REVIEW_TOKEN_HEADER] = payload.guestToken;
  }

  const response = await Axios.post("/api/reviews", payload, {
    headers,
  });
  return response?.data;
};

export const removeReviewById = async ({ reviewId, guestToken }) => {
  const headers = {};
  if (guestToken) {
    headers[REVIEW_TOKEN_HEADER] = guestToken;
  }

  const response = await Axios.delete(`/api/reviews/id/${reviewId}`, {
    headers,
  });
  return response?.data;
};

export const deleteMyReview = async ({
    productId,
    subjectType = "product",
  }) => {
  const response = await Axios.delete(`/api/reviews/${productId}`, {
    params: { subjectType },
  });
  return response?.data;
};

export const fetchReviewComments = async ({ reviewId, signal }) => {
  const response = await Axios.get(`/api/reviews/${reviewId}/comments`, {
    signal,
  });
  return response?.data?.data?.items ?? [];
};

export const createReviewComment = async ({ reviewId, payload }) => {
  const headers = {};
  if (payload?.guestToken) {
    headers[REVIEW_TOKEN_HEADER] = payload.guestToken;
  }

  const response = await Axios.post(
    `/api/reviews/${reviewId}/comments`,
    payload,
    { headers }
  );
  return response?.data;
};

export const deleteReviewComment = async ({ commentId, guestToken }) => {
  const headers = {};
  if (guestToken) {
    headers[REVIEW_TOKEN_HEADER] = guestToken;
  }

  const response = await Axios.delete(`/api/reviews/comments/${commentId}`, {
    headers,
  });
  return response?.data;
};

export const adminListReviews = async ({ query = {}, signal } = {}) => {
  const response = await Axios.get("/api/reviews", {
    params: pruneParams(query),
    signal,
  });
  return response?.data?.data?.items ?? [];
};

export const adminCreateReview = async (payload) => {
  const response = await Axios.post("/api/reviews/admin", payload);
  return response?.data;
};

export const adminUpdateReview = async ({ reviewId, payload }) => {
  const response = await Axios.put(`/api/reviews/admin/${reviewId}`, payload);
  return response?.data;
};

export const adminDeleteReview = async (reviewId) => {
  const response = await Axios.delete(`/api/reviews/admin/${reviewId}`);
  return response?.data;
};

export const adminDeleteComment = async (commentId) => {
  const response = await Axios.delete(`/api/reviews/admin/comments/${commentId}`);
  return response?.data;
};