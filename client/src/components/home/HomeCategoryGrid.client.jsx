"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import "@/lib/i18n";
import CategoryCircleGrid from "@/components/catalog/CategoryCircleGrid.client";
import {
  useCategoriesQuery,
  useSubCategoriesQuery,
} from "@/hooks/queries/useCatalogQueries";
import { getLocalizedContent } from "@/helpers/localizeContent";
import {
  buildCategoryPath,
  buildSubCategoryPath,
} from "@/lib/catalogSlugs";
import { useLocalizedHref } from "@/hooks/useLocalizedHref";

function buildCategoryUrl(category, subCategory) {
  if (!category?._id) return "#";
  if (subCategory?._id) return buildSubCategoryPath(category, subCategory);
  return buildCategoryPath(category);
}

function subcategoryBelongsToCategory(sub, categoryId) {
  return sub.category?.some(
    (c) => String(c?._id ?? c) === String(categoryId),
  );
}

export default function HomeCategoryGrid({
  initialCategories,
  initialSubCategories,
}) {
  const { i18n } = useTranslation();
  const localizedHref = useLocalizedHref();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategoriesQuery({
      syncToRedux: false,
      initialData: initialCategories,
    });
  const { data: subCategories = [] } = useSubCategoriesQuery({
    syncToRedux: false,
    initialData: initialSubCategories,
  });

  const items = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories
      .slice(0, 16)
      .map((cat) => {
        if (!cat?._id) return null;
        const displayName = getLocalizedContent(cat, "name", i18n.language);
        const subcategory = subCategories?.find((sub) =>
          subcategoryBelongsToCategory(sub, cat._id),
        );
        return {
          id: String(cat._id),
          href: localizedHref(buildCategoryUrl(cat, subcategory)),
          image: cat.image,
          displayName,
        };
      })
      .filter(Boolean);
  }, [categories, subCategories, i18n.language, localizedHref]);

  return (
    <CategoryCircleGrid items={items} isLoading={categoriesLoading} />
  );
}
