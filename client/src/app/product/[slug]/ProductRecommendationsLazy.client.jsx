"use client";

import dynamic from "next/dynamic";

const ProductRecommendations = dynamic(
  () => import("@/components/ProductRecommendations"),
  { loading: () => null, ssr: false }
);

export default function ProductRecommendationsLazy(props) {
  return <ProductRecommendations {...props} />;
}
