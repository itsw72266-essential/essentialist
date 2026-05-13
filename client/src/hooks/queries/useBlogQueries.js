// client/src/hooks/queries/useBlogsQuery.js
"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";

import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { setAllBlogs } from "@/store/blogSlice";

export const BLOGS_QUERY_KEY = ["blogs"];

export function useBlogsQuery({
  enabled = true,
  initialData,
  syncToRedux = true,
  ...queryOptions
} = {}) {
  const dispatch = useDispatch();

  const queryResult = useQuery({
    queryKey: BLOGS_QUERY_KEY,
    enabled,
    initialData,
    queryFn: async () => {
      const blogEndpoint = SummaryApi.getBlogs ?? SummaryApi.blogList;
      const response = await Axios(blogEndpoint);

      if (Array.isArray(response?.data?.data)) return response.data.data;
      if (Array.isArray(response?.data)) return response.data;
      return [];
    },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

  useEffect(() => {
    if (!syncToRedux) return;
    if (Array.isArray(queryResult.data)) {
      dispatch(setAllBlogs(queryResult.data));
    }
  }, [dispatch, queryResult.data, syncToRedux]);

  return queryResult;
}