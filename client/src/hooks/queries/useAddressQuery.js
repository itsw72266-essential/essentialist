// client/src/hooks/queries/useAddressQuery.js
"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { handleAddAddress } from "@/store/addressSlice";
import { isLoggedIn } from "@/utils/guestCartUtils";

export const ADDRESS_QUERY_KEY = ["addresses"];

export function useAddressesQuery({
  enabled = true,
  syncToRedux = true,
  ...queryOptions
} = {}) {
  const dispatch = useDispatch();

  const queryResult = useQuery({
    queryKey: ADDRESS_QUERY_KEY,
    enabled: enabled && isLoggedIn(),
    queryFn: async () => {
      const response = await Axios(SummaryApi.getAddress);
      return Array.isArray(response?.data?.data) ? response.data.data : [];
    },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

  useEffect(() => {
    if (!syncToRedux) return;
    if (Array.isArray(queryResult.data)) {
      dispatch(handleAddAddress(queryResult.data));
    }
  }, [dispatch, queryResult.data, syncToRedux]);

  return queryResult;
}