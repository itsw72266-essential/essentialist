"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import SummaryApi, { callSummaryApi } from "@/backend/contracts/summaryApi";

const PAGE_SIZE = 24;
// Keep in sync with SECTION_PAGE_SIZE / NEW_WITHIN_DAYS in app/new-arrival/page.jsx
const SECTION_PAGE_SIZE = 12;
const NEW_WITHIN_DAYS = 90;

const LIST_PROJECTION = {
  name: 1,
  slug: 1,
  image: 1,
  price: 1,
  discount: 1,
  brand: 1,
  isHot: 1,
  createdAt: 1,
};

const DEFAULT_FILTERS = {
  q: "",
  brand: "",
  min: "",
  max: "",
  sort: "newest",
};

function formatPriceXAF(value) {
  if (value == null || value === "") return "";
  try {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      maximumFractionDigits: 0,
    }).format(Number(value));
  } catch {
    return `${Number(value).toLocaleString()} FCFA`;
  }
}

function getDiscountedPrice(price, discount) {
  if (!price) return null;
  const parsedPrice = Number(price);
  const parsedDiscount = Number(discount);
  if (!parsedDiscount || parsedDiscount <= 0) return parsedPrice;
  const clamped = Math.min(100, Math.max(0, parsedDiscount));
  return Math.round(parsedPrice - (parsedPrice * clamped) / 100);
}

function ProductCard({ product }) {
  const mainImage = Array.isArray(product?.image) ? product.image[0] : product?.image;
  const discountedPrice = getDiscountedPrice(product?.price, product?.discount);
  const hasDiscount =
    discountedPrice != null && Number(discountedPrice) !== Number(product?.price);

  return (
    <a
      href={`/product/${product?._id}`}
      className="group border rounded-lg p-3 bg-white hover:shadow-md transition"
      title={product?.name || "Produit"}
    >
      <div className="w-full aspect-[4/5] bg-white rounded overflow-hidden flex items-center justify-center">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product?.name || "Produit"}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-semibold line-clamp-2">{product?.name}</h3>
        {product?.brand ? (
          <p className="text-xs text-gray-500 mt-1 uppercase">{product.brand}</p>
        ) : null}
        <div className="mt-2 flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-pink-700 font-bold">{formatPriceXAF(discountedPrice)}</span>
              <span className="text-gray-400 line-through text-sm">
                {formatPriceXAF(product?.price)}
              </span>
              {product?.discount ? (
                <span className="text-xs text-white bg-pink-600 px-2 py-0.5 rounded">
                  -{Number(product.discount)}%
                </span>
              ) : null}
            </>
          ) : (
            <span className="text-neutral-900 font-bold">
              {formatPriceXAF(product?.price)}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

function normalizeProduct(product) {
  if (!product || typeof product !== "object") return product;
  const brandData = product.brand;
  const brandName = typeof brandData === "string" ? brandData : (brandData?.name || "");
  return {
    ...product,
    brand: brandName,
    image: Array.isArray(product.image) ? product.image : (product.image ? [product.image] : []),
  };
}

function PaginatedProductsSection({ title, initialProducts, initialTotalCount, filterKind, emptyMessage }) {
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState(initialProducts);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [loading, setLoading] = useState(false);
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / SECTION_PAGE_SIZE));

  const fetchPage = useCallback(
    async (nextPage) => {
      if (nextPage === page || loading) return;

      if (nextPage === 1) {
        setProducts(initialProducts);
        setTotalCount(initialTotalCount);
        setPage(1);
        return;
      }

      setLoading(true);
      try {
        const filters =
          filterKind === "new" ? { newWithinDays: NEW_WITHIN_DAYS } : { isHot: true };
        const res = await callSummaryApi(SummaryApi.getProduct, {
          payload: {
            limit: SECTION_PAGE_SIZE,
            page: nextPage,
            sortBy: "createdAt",
            sortOrder: "desc",
            onlyActive: true,
            projection: LIST_PROJECTION,
            filters,
          },
        });
        const list = res?.data || res?.products || [];
        setProducts(list.map(normalizeProduct));
        setTotalCount(Number(res?.totalCount) || totalCount);
        setPage(nextPage);
      } catch (error) {
        console.error("Failed to load page", error);
      } finally {
        setLoading(false);
      }
    },
    [filterKind, initialProducts, initialTotalCount, loading, page, totalCount],
  );

  return (
    <section className="w-full px-4 mt-10">
      <h2 className="text-xl font-bold text-neutral-800 mb-4">{title}</h2>
      {products.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <p className="font-semibold text-neutral-700">{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div
            className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 ${
              loading ? "opacity-50" : ""
            }`}
          >
            {products.map((product) => (
              <ProductCard key={product?._id} product={product} />
            ))}
          </div>
          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => fetchPage(page - 1)}
                className="px-4 py-2 rounded border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-pink-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => fetchPage(page + 1)}
                className="px-4 py-2 rounded border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-pink-50"
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

export default function NewArrivalContent({
  hero,
  feedProducts,
  newCategoryProducts,
  hotCategoryProducts,
  newCategoryTotalCount = 0,
  hotCategoryTotalCount = 0,
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-pink-50 to-white pb-16">
      <div className="w-full px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-pink-700 tracking-tight mb-4">
          {hero.title}
        </h1>
        <h2 className="text-lg md:text-2xl text-gray-700 font-semibold mb-3">
          {hero.subtitle}
        </h2>
        <p className="text-pink-600 max-w-3xl mx-auto font-medium leading-relaxed">
          {hero.description}
        </p>
      </div>

      <section className="w-full px-4">
        <h2 className="text-xl font-bold text-neutral-800 mb-4">All New Arrivals</h2>
        {feedProducts.length === 0 ? (
          <div className="bg-white border rounded-lg p-8 text-center">
            <p className="font-semibold text-neutral-700">
              No products in this category yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {feedProducts.map((product) => (
              <ProductCard key={product?._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {newCategoryProducts.length > 0 || hotCategoryProducts.length > 0 ? (
        <>
          <PaginatedProductsSection
            title="New Makeup Arrivals in Cameroon"
            initialProducts={newCategoryProducts}
            initialTotalCount={newCategoryTotalCount}
            filterKind="new"
            emptyMessage="No new arrivals yet. Check back soon!"
          />
          <PaginatedProductsSection
            title="Hot Makeup Brands in Cameroon"
            initialProducts={hotCategoryProducts}
            initialTotalCount={hotCategoryTotalCount}
            filterKind="hot"
            emptyMessage="No hot picks right now. Check back soon!"
          />
        </>
      ) : null}
    </div>
  );
}