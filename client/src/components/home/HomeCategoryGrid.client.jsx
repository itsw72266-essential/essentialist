"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import "@/lib/i18n";
import {
  useCategoriesQuery,
  useSubCategoriesQuery,
} from "@/hooks/queries/useCatalogQueries";
import { getLocalizedContent } from "@/helpers/localizeContent";
import { getAdaptiveTextClasses } from "@/lib/localeTypography";
import { valideURLConvert } from "@/utils/valideURLConvert";

function buildCategoryUrl(catId, catName, subCategory) {
  if (!catId || !catName || !subCategory) return "#";
  return `/${valideURLConvert(catName)}-${catId}/${valideURLConvert(subCategory.name)}-${subCategory._id}`;
}

export default function HomeCategoryGrid() {
  const { i18n } = useTranslation();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategoriesQuery({ syncToRedux: true });
  const { data: subCategories = [] } = useSubCategoriesQuery({ syncToRedux: true });

  const items = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories
      .slice(0, 16)
      .map((cat) => {
        if (!cat?._id) return null;
        const displayName = getLocalizedContent(cat, "name", i18n.language);
        const subcategory = subCategories?.find((sub) =>
          sub.category?.some((c) => c._id === cat._id),
        );
        return {
          id: cat._id,
          href: buildCategoryUrl(cat._id, cat.name, subcategory),
          image: cat.image,
          displayName,
        };
      })
      .filter(Boolean);
  }, [categories, subCategories, i18n.language]);

  if (categoriesLoading) {
    return (
      <div className="container mx-auto px-4 my-8 grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse text-center">
            <div className="aspect-square w-full rounded-full bg-gray-200" />
            <div className="h-3 bg-gray-200 rounded mt-2 mx-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 my-8 grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
      {items.map((cat) => (
        <Link
          key={cat.id}
          href={cat.href}
          className="block w-full text-center transition-transform hover:scale-105"
        >
          <div className="relative aspect-square w-full rounded-full bg-gray-100 overflow-hidden shadow-sm ring-2 ring-gray-200/75">
            <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3">
              <Image
                src={cat.image || "/placeholder.png"}
                alt={cat.displayName}
                width={256}
                height={256}
                unoptimized
                sizes="(max-width: 640px) 22vw, 12vw"
                className="max-h-full max-w-full w-auto h-auto object-contain object-center"
              />
            </div>
          </div>
          <div
            className={getAdaptiveTextClasses(
              cat.displayName,
              "categoryCircle",
              i18n.language,
            )}
          >
            {cat.displayName}
          </div>
        </Link>
      ))}
    </div>
  );
}
