// client/src/hooks/queries/useOrdersQuery.js
"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { setOrder } from "@/store/orderSlice";
import { isLoggedIn } from "@/utils/guestCartUtils";

export const ORDERS_QUERY_KEY = ["orders"];

export function useOrdersQuery({
  enabled = true,
  syncToRedux = false,
  ...queryOptions
} = {}) {
  const dispatch = useDispatch();

  const queryResult = useQuery({
    queryKey: ORDERS_QUERY_KEY,
    enabled: enabled && isLoggedIn(),
    queryFn: async () => {
      const response = await Axios(SummaryApi.getOrderItems);
      if (response?.data?.success) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return [];
    },
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

  useEffect(() => {
    if (!syncToRedux) return;
    if (Array.isArray(queryResult.data)) {
      dispatch(setOrder(queryResult.data));
    }
  }, [dispatch, queryResult.data, syncToRedux]);

  return queryResult;
}