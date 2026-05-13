// client/src/app/[category]/CategoryClientBlock.jsx
"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";

import { valideURLConvert } from "@/utils/valideURLConvert";
import { useCategoryWithProductsQuery } from "@/hooks/queries/useCategoryWithProductsQuery";

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-pink-100 bg-white/90 shadow-sm overflow-hidden">
      <div className="aspect-[4/3] w-full animate-pulse bg-pink-50" />
      <div className="p-4 space-y-2">
        <div className="h-5 w-2/3 bg-pink-50 animate-pulse rounded" />
        <div className="h-4 w-1/2 bg-pink-50 animate-pulse rounded" />
        <div className="h-6 w-1/3 bg-pink-50 animate-pulse rounded" />
      </div>
    </div>
  );
}

function FCFA(amount) {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "-";
  return `${amount.toLocaleString()} FCFA`;
}

export default function CategoryClientBlock({
  categorySlug,
  fallbackTitle,
  fallbackDesc,
}) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useCategoryWithProductsQuery(categorySlug);

  const category = data?.category ?? null;
  const products = Array.isArray(data?.products) ? data.products : [];

  const fetchError = isError
    ? error?.message || "Unable to load category at the moment."
    : "";

  const title = category?.name || fallbackTitle;
  const description = category?.description || fallbackDesc;

  const brands = useMemo(() => {
    const setB = new Set();
    products.forEach((p) => {
      if (typeof p.brand === "string") setB.add(p.brand);
      else if (p.brand?.name) setB.add(p.brand.name);
    });
    return Array.from(setB);
  }, [products]);

  const avgPrice = useMemo(() => {
    const nums = products
      .map((p) => Number(p.price))
      .filter((n) => Number.isFinite(n));
    if (!nums.length) return 0;
    return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
  }, [products]);

  const jsonLd = useMemo(() => {
    if (!category) return null;

    const list = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${title} Products`,
      numberOfItems: products.length,
      itemListElement: products.slice(0, 24).map((product, idx) => {
        const firstImage = Array.isArray(product.image)
          ? product.image[0]
          : product.image;
        const brandName =
          typeof product.brand === "string"
            ? product.brand
            : product.brand?.name || undefined;
        const availability =
          Number(product?.stock) > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock";

        return {
          "@type": "ListItem",
          position: idx + 1,
          item: {
            "@type": "Product",
            name: product.name,
            image: firstImage,
            brand: brandName ? { "@type": "Brand", name: brandName } : undefined,
            category: categorySlug,
            offers: {
              "@type": "Offer",
              price: String(product?.price || 0),
              priceCurrency: "XAF",
              availability,
            },
          },
        };
      }),
    };

    const collection = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: `https://www.esmakeupstore.com/${categorySlug}`,
    };

    return [collection, list];
  }, [category, categorySlug, description, products, title]);

  if (isLoading) {
    return (
      <>
        <header className="text-center mb-8 bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-pink-200">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-pink-100 animate-pulse"></div>
          <div className="h-12 bg-pink-100 animate-pulse rounded-lg mb-4 max-w-md mx-auto"></div>
          <div className="h-6 bg-pink-100 animate-pulse rounded-lg mb-6 max-w-lg mx-auto"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-pink-200"
              >
                <div className="h-8 bg-pink-100 animate-pulse rounded mb-2"></div>
                <div className="h-4 bg-pink-100 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </header>

        <section className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-pink-200 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6">
            <div className="h-6 bg-pink-400 animate-pulse rounded mb-2 max-w-xs"></div>
            <div className="h-4 bg-pink-400 animate-pulse rounded max-w-md"></div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </section>
      </>
    );
  }

  if (fetchError) {
    return (
      <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-pink-200">
        <div className="text-6xl mb-4">😞</div>
        <h2 className="text-2xl	font-bold text-gray-800 mb-4">
          {fetchError === "Category not found"
            ? "Category Not Found"
            : "Unable to load category"}
        </h2>
        <p className="text-gray-600 mb-6">
          {fetchError === "Category not found"
            ? "This category doesn't exist in our store."
            : "We're having trouble loading this category right now."}
        </p>
        <button
          onClick={() => refetch()}
          className="bg-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-pink-700 transition-colors mr-4"
        >
          Try Again
        </button>
        <Link
          href="/category"
          className="bg-white text-pink-600 px-6 py-3 rounded-lg font-bold border-2 border-pink-600 hover:bg-pink-50 transition-colors"
        >
          Browse Categories
        </Link>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <>
      {jsonLd && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd[0]) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd[1]) }}
          />
        </Head>
      )}

      <header className="text-center mb-8 bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-pink-200">
        <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden shadow-lg border-4 border-pink-200">
          <Image
            src={category.image}
            alt={category.name}
            width={128}
            height={128}
            className="w-full h-full object-cover"
            priority
          />
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-pink-500 mb-4 tracking-tight">
          {category.name}
        </h1>

        <p className="text-lg md:text-2xl text-gray-700 font-semibold mb-6">
          Discover premium {category.name.toLowerCase()} products
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-pink-200">
            <p className="text-3xl font-bold text-pink-600">{products.length}</p>
            <p className="text-sm text-gray-600">Products Available</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-pink-200">
            <p className="text-3xl font-bold text-green-600">{FCFA(avgPrice)}</p>
            <p className="text-sm text-gray-600">Average Price</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-pink-200">
            <p className="text-3xl font-bold text-blue-600">{brands.length}</p>
            <p className="text-sm text-gray-600">Brands Available</p>
          </div>
        </div>

        {brands.length > 0 && (
          <p className="text-gray-600">
            Featured Brands: {brands.slice(0, 6).join(", ")}
            {brands.length > 6 ? "..." : ""}
          </p>
        )}
      </header>

      {products.length === 0 ? (
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-pink-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Products Found
          </h2>
          <p className="text-gray-600 mb-6">
            We're working on adding products to this category.
          </p>
          <Link
            href="/category"
            className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-pink-700 transition-colors"
          >
            Browse Other Categories
          </Link>
        </div>
      ) : (
        <section className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-pink-200 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6">
            <h2 className="text-2xl font-bold mb-2">{category.name} Products</h2>
            <p className="text-pink-100">
              All {products.length} {category.name.toLowerCase()} products with
              current pricing
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const firstImage = Array.isArray(product.image)
                  ? product.image[0]
                  : product.image;
                const brandName =
                  typeof product.brand === "string"
                    ? product.brand
                    : product.brand?.name;
                const inStock = product.stock > 0;
                const productURL = `/product/${valideURLConvert(
                  product.name
                )}-${product._id}`;

                return (
                  <Link
                    key={product._id}
                    href={productURL}
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-pink-100 hover:border-pink-300 transform hover:-translate-y-1"
                  >
                    <div className="relative aspect-square bg-pink-50 overflow-hidden">
                      {firstImage ? (
                        <Image
                          src={firstImage}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-6xl">📷</span>
                        </div>
                      )}

                      <div
                        className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${
                          inStock
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {inStock ? "In Stock" : "Out of Stock"}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                        {product.name}
                      </h3>

                      {brandName && (
                        <p className="text-sm text-gray-500 mb-3">{brandName}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-pink-600">
                          {FCFA(product.price)}
                        </span>

                        <button
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            inStock
                              ? "bg-pink-600 text-white hover:bg-pink-700"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                          disabled={!inStock}
                          type="button"
                        >
                          {inStock ? "Add to Cart" : "Out of Stock"}
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}