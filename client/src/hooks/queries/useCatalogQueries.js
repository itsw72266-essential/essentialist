// client/src/hooks/queries/useCatalogQueries.js
"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";

import Axios from "@/backend/http/legacyClient";
import SummaryApi from "@/backend/contracts/summaryApi";
import {
  setAllBrands,
  setAllCategory,
  setAllSubCategory,
} from "@/store/productSlice";

const normaliseList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.docs)) return payload.docs;
  return [];
};

export function useCategoriesQuery({
  enabled = true,
  initialData,
  syncToRedux = true,
  ...queryOptions
} = {}) {
  const dispatch = useDispatch();

  // Empty initialData would mark the query "fresh" for staleTime and skip the
  // network fetch — bad when parent passes [] as placeholder. Only seed cache
  // when we actually have rows.
  const seededInitialData =
    Array.isArray(initialData) && initialData.length > 0 ? initialData : undefined;

  const queryResult = useQuery({
    queryKey: ["categories"],
    enabled,
    initialData: seededInitialData,
    queryFn: async () => {
      const response = await Axios(SummaryApi.getCategory);
      return normaliseList(response?.data);
    },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

  useEffect(() => {
    if (!syncToRedux) return;
    if (Array.isArray(queryResult.data)) {
      dispatch(setAllCategory(queryResult.data));
    }
  }, [dispatch, queryResult.data, syncToRedux]);

  return queryResult;
}

export function useSubCategoriesQuery({
  enabled = true,
  initialData,
  syncToRedux = true,
  ...queryOptions
} = {}) {
  const dispatch = useDispatch();

  const seededInitialData =
    Array.isArray(initialData) && initialData.length > 0 ? initialData : undefined;

  const queryResult = useQuery({
    queryKey: ["sub-categories"],
    enabled,
    initialData: seededInitialData,
    queryFn: async () => {
      const response = await Axios({
        ...SummaryApi.getSubCategory,
        data: {},
      });
      return normaliseList(response?.data);
    },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

  useEffect(() => {
    if (!syncToRedux) return;
    if (Array.isArray(queryResult.data)) {
      dispatch(setAllSubCategory(queryResult.data));
    }
  }, [dispatch, queryResult.data, syncToRedux]);

  return queryResult;
}

export function useBrandsQuery({
  enabled = true,
  syncToRedux = true,
  ...queryOptions
} = {}) {
  const dispatch = useDispatch();

  const queryResult = useQuery({
    queryKey: ["brands"],
    enabled,
    queryFn: async () => {
      const response = await Axios(SummaryApi.getBrands);
      const data = response?.data;
      if (Array.isArray(data?.items)) return data.items;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

  useEffect(() => {
    if (!syncToRedux) return;
    if (Array.isArray(queryResult.data)) {
      dispatch(setAllBrands(queryResult.data));
    }
  }, [dispatch, queryResult.data, syncToRedux]);

  return queryResult;
}