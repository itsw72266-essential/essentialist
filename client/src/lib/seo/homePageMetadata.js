import { cacheLife } from "next/cache";

import { getCategories } from "@/server/catalog";
import { getHomeMetadata } from "@/lib/seo/homeMetadata";
import {
  buildCanonicalUrl,
  buildLanguageAlternates,
} from "@/lib/seo/localePaths";

const BUSINESS_CONFIG = {
  name: "Essentialist Makeup Store",
  url: "https://www.esmakeupstore.com",
  address: {
    city: "Douala",
    region: "Littoral",
    coordinates: { lat: 4.0511, lng: 9.7679 },
  },
};

const CONTENT_KEYWORDS = {
  primary: [
    "makeup store Cameroon",
    "cosmetic products Cameroon",
    "buy makeup online Douala",
    "professional makeup Cameroon",
  ],
  secondary: [
    "setting powder Cameroon",
    "foundation makeup Cameroon",
    "eyeshadow palette Douala",
    "lipstick Cameroon",
    "makeup kits Cameroon",
    "beauty products Douala",
  ],
};

const DEFAULT_TITLE =
  "Best Makeup Store in Cameroon | Essentialist — Shop NYX, Smashbox, Bobbi Brown in Douala";
const DEFAULT_DESC =
  "Shop authentic makeup and cosmetic products in Cameroon. Professional makeup, setting powders, foundations, and more. Fast delivery to Douala and nationwide. Premium brands at affordable prices.";
const OG_IMAGE = "https://www.esmakeupstore.com/assets/logo.jpg";

/**
 * Home page metadata. Locale must be resolved outside (e.g. getServerLocale in
 * generateMetadata) — do not call headers() here; "use cache" cannot read request data.
 * @param {'en' | 'fr'} locale
 */
export async function generateHomePageMetadata(locale) {
  "use cache";
  cacheLife("minutes", 5);

  const homeMeta = getHomeMetadata(locale);

  const categories = await getCategories();
  const categoryNames = Array.isArray(categories)
    ? categories
        .slice(0, 5)
        .map((c) => c?.name)
        .filter(Boolean)
    : [];

  const topCategories = categoryNames.join(", ");
  const dynTitle =
    locale === "fr"
      ? topCategories
        ? `Boutique maquillage Cameroun | ${topCategories} et plus | Essentialist Douala`
        : homeMeta.title
      : topCategories
        ? `Best Makeup Store in Cameroon | Shop ${topCategories} & More. Essentialist Douala`
        : DEFAULT_TITLE;

  const dynDesc =
    locale === "fr"
      ? topCategories
        ? `Découvrez ${topCategories.toLowerCase()} et plus chez ${BUSINESS_CONFIG.name}. ${homeMeta.description}`
        : homeMeta.description
      : topCategories
        ? `Discover premium ${topCategories.toLowerCase()} and more at ${BUSINESS_CONFIG.name}. ${DEFAULT_DESC}`
        : DEFAULT_DESC;

  const allKeywords = [
    ...CONTENT_KEYWORDS.primary,
    ...CONTENT_KEYWORDS.secondary.slice(0, 3),
  ];

  return {
    metadataBase: BUSINESS_CONFIG.url,
    title: dynTitle,
    description: dynDesc,
    keywords: allKeywords,
    robots: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
    alternates: {
      canonical: buildCanonicalUrl("/", locale),
      languages: buildLanguageAlternates("/"),
    },
    openGraph: {
      type: "website",
      siteName: BUSINESS_CONFIG.name,
      url: buildCanonicalUrl("/", locale),
      title: dynTitle,
      description: dynDesc,
      images: [
        { url: OG_IMAGE, width: 1200, height: 630, alt: BUSINESS_CONFIG.name },
      ],
      locale: homeMeta.openGraphLocale,
      alternateLocale: locale === "fr" ? ["en_US"] : ["fr_CM"],
    },
    twitter: {
      card: "summary_large_image",
      title: dynTitle,
      description: dynDesc,
      images: [OG_IMAGE],
      creator: "@essentialistmakeup",
    },
    other: {
      "geo:placename": BUSINESS_CONFIG.address.city,
      "geo:position": `${BUSINESS_CONFIG.address.coordinates.lat};${BUSINESS_CONFIG.address.coordinates.lng}`,
      "geo:region": `CM-${BUSINESS_CONFIG.address.region}`,
      "msvalidate.01": "1D7D3FCABB171743A8EB32440530AC76",
    },
  };
}
