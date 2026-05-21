"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import "@/lib/i18n";
import CategoryCircleGrid from "@/components/catalog/CategoryCircleGrid.client";
import CategoryWiseProductDisplay from "@/components/CategoryWiseProductDisplay";
import { getLocalizedContent } from "@/helpers/localizeContent";
import { useAdaptiveTextClasses } from "@/hooks/useAdaptiveTextClasses";
import { buildSubCategoryPath } from "@/lib/catalogSlugs";

const DESKTOP_BANNER =
  "/assets/fbb4343f-2d39-4c25-ac2f-1ab5037f50da.avif";
const MOBILE_BANNER =
  "/assets/cosmetics-beauty-products-for-make-up-sale-banner-vector-25170220.avif";

function capitalize(s = "") {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function CategoryPageContent({
  category,
  subcats = [],
  products = [],
  primarySeo = "",
  categoryName = "Category",
  totalCount = 0,
  hasMore = false,
  nextHref = "",
}) {
  const { i18n } = useTranslation();
  const displayCategoryName =
    getLocalizedContent(category, "name", i18n.language) || categoryName;
  const heroTitle = capitalize(primarySeo || displayCategoryName);
  const heroTitleClasses = useAdaptiveTextClasses(heroTitle, "heroTitle");
  const heroSubtitleClasses = useAdaptiveTextClasses(
    `Shop authentic ${displayCategoryName} in Cameroon.`,
    "heroSubtitle",
  );
  const sectionHeadingClasses = useAdaptiveTextClasses(
    `Explore ${displayCategoryName}`,
    "sectionHeading",
  );

  const bannerSrc = category?.image || null;

  const subcategoryItems = useMemo(() => {
    if (!category?._id || !Array.isArray(subcats)) return [];
    return subcats.map((sub) => ({
      id: String(sub._id),
      href: buildSubCategoryPath(category, sub),
      image: sub.image,
      displayName:
        getLocalizedContent(sub, "name", i18n.language) || sub.name || "",
    }));
  }, [category, subcats, i18n.language]);

  return (
    <section className="bg-white pb-20">
      <div className="container mx-auto px-4 pt-4">
        <div className="w-full h-full min-h-48 rounded overflow-hidden">
          {bannerSrc ? (
            <Image
              src={bannerSrc}
              width={1200}
              height={500}
              alt={displayCategoryName}
              priority
              unoptimized
              className="w-full h-auto max-h-[280px] object-cover object-center"
              sizes="100vw"
            />
          ) : (
            <>
              <div className="hidden lg:block">
                <Image
                  src={DESKTOP_BANNER}
                  width={1200}
                  height={500}
                  alt={displayCategoryName}
                  priority
                  unoptimized
                  className="w-full h-auto"
                  sizes="100vw"
                />
              </div>
              <div className="lg:hidden">
                <Image
                  src={MOBILE_BANNER}
                  width={400}
                  height={250}
                  alt={displayCategoryName}
                  priority
                  unoptimized
                  className="w-full h-auto"
                  sizes="100vw"
                />
              </div>
            </>
          )}
        </div>

        <div className="max-w-4xl mx-auto mt-6 mb-4 px-4 flex flex-col items-center text-center">
          <h1 className={heroTitleClasses}>
            <span className="text-pink-600">{displayCategoryName}</span>
            {heroTitle &&
            heroTitle.toLowerCase() !== displayCategoryName.toLowerCase() ? (
              <> — {heroTitle}</>
            ) : null}
          </h1>
          <p className={heroSubtitleClasses}>
            Shop authentic <strong>{displayCategoryName}</strong> in Cameroon.
            Secure FCFA payments and fast delivery to Douala and Yaoundé.
          </p>
        </div>
      </div>

      {subcategoryItems.length > 0 && (
        <div className="mt-2">
          <h2
            className={`${sectionHeadingClasses} container mx-auto px-4 text-center md:text-left`}
          >
            Explore {displayCategoryName} Collections
          </h2>
          <CategoryCircleGrid items={subcategoryItems} />
        </div>
      )}

      {products.length > 0 ? (
        <>
          <CategoryWiseProductDisplay
            id={category._id}
            name={category.name}
            categoryLabel={displayCategoryName}
            products={products}
            subCategories={subcats}
          />
          {hasMore && nextHref ? (
            <div className="container mx-auto px-4 mt-8 text-center">
              <Link
                href={nextHref}
                className="inline-flex items-center px-10 py-4 rounded-full bg-pink-600 text-white font-bold hover:bg-pink-700 transition-all shadow-lg hover:shadow-pink-200"
              >
                Load More {displayCategoryName}
              </Link>
              <p className="text-sm text-gray-500 mt-3">
                {totalCount} items in this collection
              </p>
            </div>
          ) : null}
        </>
      ) : (
        <div className="container mx-auto px-4 py-16 text-center text-gray-500">
          <p>More {displayCategoryName} products arriving soon!</p>
        </div>
      )}
    </section>
  );
}
