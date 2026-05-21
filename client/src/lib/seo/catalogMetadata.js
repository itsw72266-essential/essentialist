import { localizeDocument } from "@/fullstack/lib/localization";

import { buildPageMetadata } from "@/lib/seo/buildMetadata";
import {
  formatBrandProductTypes,
  getBrandQueryPhrases,
} from "@/lib/seo/gscCatalogTitles";

export function getLocalizedField(doc, field, locale) {
  if (!doc) return "";
  const localized = localizeDocument(doc, [field], locale, {
    stripTranslations: true,
  });
  return localized?.[field] ?? doc[field] ?? "";
}

export function buildCategoryMetadata({
  categoryName,
  categorySlug,
  locale,
  primarySeo,
}) {
  const path = `/${categorySlug}`;
  const label = primarySeo || categoryName;

  if (locale === "fr") {
    return buildPageMetadata({
      path,
      locale,
      title: `${label} | Maquillage au Cameroun | Essentialist`,
      description: `Achetez des produits ${categoryName} authentiques au Cameroun. Prix en FCFA, paiement sécurisé, livraison à Douala, Yaoundé et partout au pays.`,
      keywords: [
        categoryName,
        label,
        "maquillage Cameroun",
        "cosmétiques Douala",
        "Essentialist",
      ],
    });
  }

  return buildPageMetadata({
    path,
    locale,
    title: `${label} | Essentialist Makeup Store Cameroon`,
    description: `Shop authentic ${categoryName} products in Cameroon. Best FCFA prices, secure payment, and fast delivery to Douala, Yaoundé, and nationwide.`,
    keywords: [
      categoryName,
      label,
      "makeup Cameroon",
      "cosmetics Douala",
      "Essentialist Makeup Store",
    ],
  });
}

export function buildSubCategoryMetadata({
  subCategoryName,
  categorySlug,
  subCategorySlug,
  locale,
  commercialTitle,
  page = 1,
}) {
  const path = `/${categorySlug}/${subCategorySlug}`;
  const queryPath = page > 1 ? `${path}?page=${page}` : path;
  const titleLabel = commercialTitle || subCategoryName;

  if (locale === "fr") {
    return buildPageMetadata({
      path: queryPath.split("?")[0],
      locale,
      title: `${titleLabel} | Achat au Cameroun | Essentialist`,
      description: `Achetez ${subCategoryName} authentique au Cameroun. Prix FCFA transparents. Livraison rapide à Douala, Yaoundé et partout au pays.`,
      keywords: [
        titleLabel,
        subCategoryName,
        "maquillage Cameroun",
        "cosmétiques Douala",
        "Essentialist",
      ],
    });
  }

  return buildPageMetadata({
    path: queryPath.split("?")[0],
    locale,
    title: `${titleLabel} | Buy in Cameroon | Essentialist`,
    description: `Shop authentic ${subCategoryName} in Cameroon at Essentialist. Transparent FCFA pricing. Fast delivery nationwide.`,
    keywords: [
      titleLabel,
      subCategoryName,
      "makeup Cameroon",
      "cosmetics Douala",
      "Essentialist Makeup Store",
    ],
  });
}

export function buildBrandDirectoryMetadata({
  locale,
  title,
  description,
  keywords = [],
}) {
  return buildPageMetadata({
    path: "/brands",
    locale,
    title,
    description,
    keywords,
  });
}

export function buildBrandPageMetadata({
  brand,
  brandSlug,
  locale,
  metrics = {},
}) {
  const path = `/brands/${brandSlug}`;
  const name = getLocalizedField(brand, "name", locale) || brand?.name || "Brand";
  const plainDesc = getLocalizedField(brand, "description", locale);
  const shortDesc =
    plainDesc.length > 60 ? `${plainDesc.substring(0, 60)}...` : plainDesc;
  const total = metrics.totalProducts ?? 0;
  const productTypes = formatBrandProductTypes(metrics.subCategories);
  const queryPhrases = getBrandQueryPhrases(brandSlug, name);
  const typeSegment = productTypes ? `${productTypes} | ` : "";

  if (locale === "fr") {
    const description = shortDesc
      ? `${shortDesc} Achetez ${name} authentique (${total} produits). Prix XAF. Livraison Douala & Cameroun.`
      : `Achetez ${name} authentique — ${productTypes || "maquillage"}. ${total} produits. Livraison à Douala et partout au Cameroun.`;

    return buildPageMetadata({
      path,
      locale,
      title: `${name} ${typeSegment}Prix XAF | Douala | Essentialist`,
      description,
      keywords: [
        name,
        ...queryPhrases,
        `${name} maquillage Cameroun`,
        `${name} prix cameroun`,
        `acheter ${name} Douala`,
        "cosmétiques authentiques",
      ],
      ogImage:
        brand.ogImage ||
        brand.banner ||
        brand.coverImage ||
        undefined,
    });
  }

  const description = shortDesc
    ? `${shortDesc} Shop authentic ${name} (${total} products). XAF prices. Fast delivery Douala & Cameroon.`
    : `Shop authentic ${name} ${productTypes || "makeup"} at Essentialist. ${total} products with XAF pricing. Fast delivery in Douala & nationwide.`;

  return buildPageMetadata({
    path,
    locale,
    title: `${name} ${typeSegment}XAF Prices | Douala | Essentialist`,
    description,
    keywords: [
      name,
      ...queryPhrases,
      `${name} makeup Cameroon`,
      `${name} price cameroon`,
      `buy ${name} Douala`,
      "authentic cosmetics",
    ],
    ogImage:
      brand.ogImage || brand.banner || brand.coverImage || undefined,
  });
}

export function buildBlogArticleMetadata({ blog, slug, locale }) {
  const path = `/blog/${slug}`;
  const title =
    getLocalizedField(blog, "metaTitle", locale) ||
    getLocalizedField(blog, "title", locale) ||
    blog.title;
  const description =
    getLocalizedField(blog, "metaDescription", locale) ||
    getLocalizedField(blog, "excerpt", locale) ||
    blog.excerpt ||
    "";
  const cover = blog.coverImage;

  const meta = buildPageMetadata({
    path,
    locale,
    title: `${title} | Essentialist Makeup Store`,
    description,
    keywords: [...(blog.tags || []), "makeup", "beauty", "cameroon"],
    ogImage: cover,
    type: "article",
  });

  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: blog.publishedAt || blog.createdAt,
      authors: ["Essentialist Makeup Store"],
      tags: blog.tags || [],
    },
  };
}
