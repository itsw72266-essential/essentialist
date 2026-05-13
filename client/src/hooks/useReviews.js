"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import AxiosToastError from "@/utils/AxiosToastError";

const reviewKeys = {
  all: ["reviews"],
  list: (params) => [...reviewKeys.all, "list", params],
  adminList: (filters) => [...reviewKeys.all, "admin", filters],
  comments: (reviewId) => [...reviewKeys.all, "comments", reviewId],
};

const getGuestToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("reviewGuestToken")
    : null;

const persistGuestToken = (token) => {
  if (typeof window !== "undefined" && token) {
    localStorage.setItem("reviewGuestToken", token);
  }
};

export const usePublicReviews = (params) => {
  const queryParams = useMemo(() => ({ ...params }), [params]);

  return useQuery({
    queryKey: reviewKeys.list(queryParams),
    queryFn: async () => {
      const { data } = await Axios({
        ...SummaryApi.reviews.publicList,
        params: queryParams,
      });
      return data?.data ?? { items: [], stats: { average: 0, count: 0 } };
    },
    keepPreviousData: true,
  });
};

export const useUpsertReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const headers = {};
      const token = getGuestToken();
      if (token) headers["x-review-token"] = token;

      const { data } = await Axios({
        ...SummaryApi.reviews.upsert,
        data: payload,
        headers,
      });
      return data;
    },
    onSuccess: (data, vars) => {
      toast.success(data?.message || "Review saved");
      if (data?.guestToken) persistGuestToken(data.guestToken);
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      if (vars?.onSuccess) vars.onSuccess();
    },
    onError: AxiosToastError,
  });
};

export const useDeleteReviewById = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, guest }) => {
      const headers = {};
      if (guest) {
        const token = getGuestToken();
        if (token) headers["x-review-token"] = token;
      }
      const { data } = await Axios({
        ...SummaryApi.reviews.deleteById(reviewId),
        headers,
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Review deleted");
      qc.invalidateQueries({ queryKey: reviewKeys.all });
    },
    onError: AxiosToastError,
  });
};

export const useAdminReviews = (filters) =>
  useQuery({
    queryKey: reviewKeys.adminList(filters),
    queryFn: async () => {
      const { data } = await Axios({
        ...SummaryApi.reviews.admin.list,
        params: filters,
      });
      return data?.data?.items ?? [];
    },
    refetchOnWindowFocus: false,
  });

export const useAdminUpdateReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, payload }) => {
      const { data } = await Axios({
        ...SummaryApi.reviews.admin.update(reviewId),
        data: payload,
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Review updated");
      qc.invalidateQueries({ predicate: (q) => q.queryKey.includes("admin") });
    },
    onError: AxiosToastError,
  });
};

export const useAdminDeleteReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId) => {
      const { data } = await Axios(
        SummaryApi.reviews.admin.delete(reviewId)
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Review removed");
      qc.invalidateQueries({ predicate: (q) => q.queryKey.includes("admin") });
    },
    onError: AxiosToastError,
  });
};