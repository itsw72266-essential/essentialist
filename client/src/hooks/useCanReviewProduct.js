"use client";

import { useMemo } from "react";
import { useOrdersQuery } from "./queries/useOrdersQuery";
import { isLoggedIn } from "@/utils/guestCartUtils";

function isOrderDelivered(order) {
  const fulfillment = (
    order?.fulfillment_status ??
    order?.fulfillmentStatus ??
    ""
  )
    .toString()
    .toLowerCase();
  return Boolean(order?.deliveredAt) || fulfillment === "delivered";
}

function orderContainsProduct(order, productId) {
  const products = Array.isArray(order?.products) ? order.products : [order];

  return products.some((product) => {
    const candidateId =
      product?.productId ??
      product?.product_details?._id ??
      product?.productDetails?._id ??
      product?._id;
    return String(candidateId ?? "") === String(productId ?? "");
  });
}

/**
 * A shopper may only leave a product review once they've actually received
 * it: a paid order, or a Cash-on-Delivery order marked delivered.
 */
export default function useCanReviewProduct(productId) {
  const loggedIn = isLoggedIn();

  const { data: orders = [], isLoading, isFetched } = useOrdersQuery({
    enabled: loggedIn,
  });

  const canReview = useMemo(() => {
    if (!loggedIn || !productId) return false;
    return orders.some(
      (order) => orderContainsProduct(order, productId) && isOrderDelivered(order)
    );
  }, [orders, loggedIn, productId]);

  return {
    canReview,
    isLoggedIn: loggedIn,
    isLoading: loggedIn && !isFetched && isLoading,
  };
}
