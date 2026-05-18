import { localizeDocument } from "@/fullstack/lib/localization";

import { buildCanonicalUrl, buildLanguageAlternates } from "@/lib/seo/localePaths";

const PRODUCT_FIELDS = ["name", "description"];

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

  if (locale === "fr") {
    return {
      name,
      title:
        priceStr && brandName
          ? `${brandName} ${name} | ${priceStr} XAF | Achat au Cameroun`
          : `${name} | Maquillage authentique au Cameroun`,
      description: `Achetez ${brandName || "du maquillage"} ${name} ${
        priceStr ? `à ${priceStr} XAF` : ""
      } chez ${businessName}. ${
        hasStock ? "En stock. " : "Vérifiez la disponibilité. "
      }Livraison rapide à ${city} et partout au Cameroun.`,
      keywords: [
        name,
        brandName,
        "maquillage",
        "cosmétiques",
        `${name} prix`,
        `${name} cameroun`,
        `acheter ${name}`,
        `${name} douala`,
        "boutique maquillage cameroun",
      ],
      openGraphLocale: "fr_CM",
      inLanguage: "fr-CM",
    };
  }

  return {
    name,
    title:
      priceStr && brandName
        ? `${brandName} ${name} | ${priceStr} XAF | Buy in Cameroon`
        : `${name} | Authentic Makeup in Cameroon`,
    description: `Buy authentic ${brandName || "makeup"} ${name} ${
      priceStr ? `at ${priceStr} XAF` : ""
    } at ${businessName}. ${
      hasStock ? "In stock. " : "Check availability. "
    }Fast delivery in ${city} & nationwide. Money-back guarantee.`,
    keywords: [
      name,
      brandName,
      "makeup",
      "cosmetics",
      `${name} price`,
      `${name} cameroon`,
      `buy ${name} cameroon`,
      `${name} douala`,
      "authentic makeup",
      "makeup store cameroon",
    ],
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
