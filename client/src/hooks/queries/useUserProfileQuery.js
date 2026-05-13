// client/src/hooks/queries/useUserProfileQuery.js
"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

import fetchUserDetails from "@/utils/fetchUserDetails";
import { setUserDetails } from "@/store/userSlice";

export function useUserProfileQuery({
  enabled = true,
  syncToRedux = true,
  ...queryOptions
} = {}) {
  const dispatch = useDispatch();

  const queryResult = useQuery({
    queryKey: ["user-profile"],
    enabled,
    queryFn: async () => {
      const result = await fetchUserDetails();
      return result?.data ?? null;
    },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    ...queryOptions,
  });

  useEffect(() => {
    if (!syncToRedux) return;
    if (!queryResult.data?._id) return;
    dispatch(setUserDetails(queryResult.data));
  }, [dispatch, queryResult.data, syncToRedux]);

  return queryResult;
}
