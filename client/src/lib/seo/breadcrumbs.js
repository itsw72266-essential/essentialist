import {
  buildCategoryPath,
  buildSubCategoryPath,
  getCategorySlug,
  getSubCategorySlug,
} from "@/lib/catalogSlugs";
import { buildCanonicalUrl } from "@/lib/seo/localePaths";

/**
 * @typedef {{ label: string, href?: string }} BreadcrumbItem
 */

/**
 * @param {BreadcrumbItem[]} items
 * @param {{ locale?: string }} [options]
 */
export function buildBreadcrumbJsonLd(items = [], { locale = "en" } = {}) {
  const withHref = items.filter((item) => item?.label);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: withHref.map((item, index) => {
      const position = index + 1;
      const entry = {
        "@type": "ListItem",
        position,
        name: item.label,
      };
      if (item.href) {
        entry.item = buildCanonicalUrl(item.href, locale);
      }
      return entry;
    }),
  };
}

/**
 * @param {string} [locale]
 */
export function homeBreadcrumbItem(locale = "en") {
  return {
    label: locale === "fr" ? "Accueil" : "Home",
    href: "/",
  };
}

/**
 * @param {object} product
 * @param {string} productName
 * @param {string} [locale]
 * @returns {BreadcrumbItem[]}
 */
export function buildProductBreadcrumbItems(product, productName, locale = "en") {
  const items = [homeBreadcrumbItem(locale)];

  const categories = Array.isArray(product?.category)
    ? product.category
    : product?.category
      ? [product.category]
      : [];
  const subCategories = Array.isArray(product?.subCategory)
    ? product.subCategory
    : product?.subCategory
      ? [product.subCategory]
      : [];

  const category = categories[0];
  const subCategory = subCategories[0];

  if (category?.name || category?._id) {
    const catSlug = category.slug || getCategorySlug(category);
    items.push({
      label: category.name || catSlug,
      href: buildCategoryPath({ ...category, slug: catSlug }),
    });
  }

  if (subCategory?.name || subCategory?._id) {
    const catForPath = category || { slug: "", name: "" };
    const subSlug = subCategory.slug || getSubCategorySlug(subCategory);
    items.push({
      label: subCategory.name || subSlug,
      href: buildSubCategoryPath(
        { ...catForPath, slug: catForPath.slug || getCategorySlug(catForPath) },
        { ...subCategory, slug: subSlug },
      ),
    });
  }

  const brand = product?.brand;
  if (brand && typeof brand === "object" && brand.name) {
    const brandSlug = brand.slug || String(brand.name).toLowerCase().replace(/\s+/g, "-");
    items.push({
      label: brand.name,
      href: `/brands/${brandSlug}`,
    });
  }

  items.push({ label: productName });
  return items;
}

/**
 * @param {string} label
 * @param {string} [locale]
 */
export function brandsIndexBreadcrumbItems(label, locale = "en") {
  return [
    homeBreadcrumbItem(locale),
    {
      label: locale === "fr" ? "Marques" : "Brands",
      href: "/brands",
    },
    { label },
  ];
}
