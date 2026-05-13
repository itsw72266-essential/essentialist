"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import AxiosToastError from "@/utils/AxiosToastError";
import {
  adminCreateReview,
  adminDeleteComment,
  adminDeleteReview,
  adminListReviews,
  adminUpdateReview,
  createReviewComment,
  deleteReviewComment,
  fetchPublicReviews,
  fetchReviewComments,
  removeReviewById,
  upsertReview,
} from "@/services/reviewApi";

export const usePublicReviews = (query) =>
  useInfiniteQuery({
    queryKey: ["reviews", query],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1, signal }) =>
      fetchPublicReviews({ query, page: pageParam, signal }),
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      if (lastPage.page < lastPage.pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });

export const useReviewComments = (reviewId, enabled = false) =>
  useQuery({
    queryKey: ["review-comments", reviewId],
    queryFn: ({ signal }) => fetchReviewComments({ reviewId, signal }),
    enabled: Boolean(reviewId) && Boolean(enabled),
  });

export const useUpsertReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: upsertReview,
    onSuccess: (res) => {
      toast.success(res?.message || "Review saved");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: AxiosToastError,
  });
};

export const useDeleteReviewById = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeReviewById,
    onSuccess: (res) => {
      toast.success(res?.message || "Review deleted");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: AxiosToastError,
  });
};

export const useCreateReviewComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReviewComment,
    onSuccess: (res, variables) => {
      const reviewId = variables?.reviewId;
      toast.success(res?.message || "Comment added");
      if (reviewId) {
        queryClient.invalidateQueries({
          queryKey: ["review-comments", reviewId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: AxiosToastError,
  });
};

export const useDeleteReviewComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReviewComment,
    onSuccess: (res, variables) => {
      const reviewId = variables?.reviewId;
      toast.success(res?.message || "Comment deleted");
      if (reviewId) {
        queryClient.invalidateQueries({
          queryKey: ["review-comments", reviewId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: AxiosToastError,
  });
};

export const useAdminReviews = (filters) =>
  useQuery({
    queryKey: ["admin-reviews", filters],
    queryFn: ({ signal }) => adminListReviews({ query: filters, signal }),
  });

export const useAdminCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminCreateReview,
    onSuccess: (res) => {
      toast.success(res?.message || "Review created");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: AxiosToastError,
  });
};

export const useAdminUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminUpdateReview,
    onSuccess: (res) => {
      toast.success(res?.message || "Review updated");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: AxiosToastError,
  });
};

export const useAdminDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminDeleteReview,
    onSuccess: (res) => {
      toast.success(res?.message || "Review deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: AxiosToastError,
  });
};

export const useAdminDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminDeleteComment,
    onSuccess: (res) => {
      toast.success(res?.message || "Comment removed");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: AxiosToastError,
  });
};