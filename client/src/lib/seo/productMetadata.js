import { localizeDocument } from "@/fullstack/lib/localization";

import { buildCanonicalUrl, buildLanguageAlternates } from "@/lib/seo/localePaths";

const PRODUCT_FIELDS = ["name", "description"];

function trimMeta(text = "", max = 160) {
  const value = String(text || "").trim();
  if (value.length <= max) return value;
  return `${value.slice(0, max - 3)}...`;
}

export function getLocalizedProductFields(product, locale) {
  if (!product) return { name: "Product", description: "" };
  const localized = localizeDocument(product, PRODUCT_FIELDS, locale, {
    stripTranslations: true,
  });
  return {
    name: localized?.name ?? product.name ?? "Product",
    description: localized?.description ?? product.description ?? "",
  };
}

export function buildProductSeoCopy({
  product,
  locale,
  brandName,
  price,
  hasStock,
  businessName,
  city,
}) {
  const { name } = getLocalizedProductFields(product, locale);
  const priceStr = price ? price.toLocaleString("en-US") : null;
  const customTitle =
    (typeof product?.metaTitle === "string" && product.metaTitle.trim()) ||
    "";
  const customDescription =
    (typeof product?.metaDescription === "string" &&
      product.metaDescription.trim()) ||
    "";

  const stockLine = hasStock ? "In stock. " : "Check availability. ";
  const brandLabel = brandName || "makeup";

  if (locale === "fr") {
    const autoTitle =
      priceStr && brandName
        ? `${brandName} ${name} | ${priceStr} XAF | Douala, Cameroun`
        : `${name} | Maquillage authentique | Douala`;
    const autoDescription = `Achetez ${brandLabel} ${name} ${
      priceStr ? `à ${priceStr} XAF` : ""
    } chez ${businessName}. ${stockLine}Produit authentique. Livraison rapide à ${city} et partout au Cameroun.`;

    return {
      name,
      title: customTitle || autoTitle,
      description: trimMeta(customDescription || autoDescription),
      keywords: [
        ...(Array.isArray(product?.seoKeywords) ? product.seoKeywords : []),
        name,
        brandName,
        `${name} prix`,
        `${name} cameroun`,
        `acheter ${name} douala`,
        `${brandName} ${name}`.trim(),
        "maquillage",
        "cosmétiques",
        "boutique maquillage cameroun",
      ].filter(Boolean),
      openGraphLocale: "fr_CM",
      inLanguage: "fr-CM",
    };
  }

  const autoTitle =
    priceStr && brandName
      ? `${brandName} ${name} | ${priceStr} XAF | Buy in Douala, Cameroon`
      : `${name} | Authentic Makeup | Buy in Douala, Cameroon`;
  const autoDescription = `Buy authentic ${brandLabel} ${name} ${
    priceStr ? `at ${priceStr} XAF` : ""
  } at ${businessName}. ${stockLine}Fast delivery in ${city} & nationwide Cameroon. Money-back guarantee.`;

  return {
    name,
    title: customTitle || autoTitle,
    description: trimMeta(customDescription || autoDescription),
    keywords: [
      ...(Array.isArray(product?.seoKeywords) ? product.seoKeywords : []),
      name,
      brandName,
      `${name} price`,
      `${name} cameroon`,
      `buy ${name} cameroon`,
      `${name} douala`,
      `${brandName} ${name}`.trim(),
      "authentic makeup",
      "makeup store cameroon",
      "cosmetic shops in cameroon",
    ].filter(Boolean),
    openGraphLocale: "en_US",
    inLanguage: "en",
  };
}

export function buildProductAlternates(slug, locale) {
  const path = `/product/${slug}`;
  return {
    canonical: buildCanonicalUrl(path, locale),
    languages: buildLanguageAlternates(path),
  };
}
