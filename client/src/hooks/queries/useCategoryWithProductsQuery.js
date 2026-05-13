// client/src/hooks/queries/useCategoryWithProductsQuery.js
"use client";

import { useQuery } from "@tanstack/react-query";

import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";
import { valideURLConvert } from "@/utils/valideURLConvert";

const extractList = (response) => {
  if (!response) return [];
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export function useCategoryWithProductsQuery(slug) {
  return useQuery({
    queryKey: ["category-client-block", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const categoryResponse = await Axios(SummaryApi.getCategory);
      const categories = extractList(categoryResponse);

      const normalizedSlug = String(slug || "").toLowerCase();
      const matchedCategory = categories.find(
        (category) =>
          valideURLConvert(category?.name || "").toLowerCase() === normalizedSlug
      );

      if (!matchedCategory) {
        const error = new Error("Category not found");
        error.code = "CATEGORY_NOT_FOUND";
        throw error;
      }

      const productResponse = await Axios({
        ...SummaryApi.getProductByCategory,
        data: { id: matchedCategory._id },
      });

      const products = extractList(productResponse);

      return {
        category: matchedCategory,
        products,
      };
    },
    staleTime: 2 * 60_000,
    refetchOnWindowFocus: false,
  });
}