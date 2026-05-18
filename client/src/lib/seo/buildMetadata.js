import {
  SITE_ORIGIN,
  buildCanonicalUrl,
  buildLanguageAlternates,
} from "@/lib/seo/localePaths";

const SITE_NAME = "Essentialist Makeup Store";
const DEFAULT_OG = `${SITE_ORIGIN}/assets/logo.jpg`;

/**
 * Standard Next.js Metadata for a public page (EN + FR hreflang).
 */
export function buildPageMetadata({
  path,
  locale = "en",
  title,
  description,
  keywords = [],
  ogImage = DEFAULT_OG,
  type = "website",
  robots,
  noindex = false,
}) {
  const desc = String(description || "").substring(0, 160);
  const alternates = {
    canonical: buildCanonicalUrl(path, locale),
    languages: buildLanguageAlternates(path),
  };

  const ogLocale = locale === "fr" ? "fr_CM" : "en_US";

  return {
    metadataBase: new URL(SITE_ORIGIN),
    title,
    description: desc,
    keywords: keywords.filter(Boolean).slice(0, 12),
    robots: noindex
      ? { index: false, follow: false }
      : robots || {
          index: true,
          follow: true,
          "max-snippet": -1,
          "max-image-preview": "large",
          "max-video-preview": -1,
        },
    alternates,
    openGraph: {
      type,
      url: alternates.canonical,
      siteName: SITE_NAME,
      title,
      description: desc,
      locale: ogLocale,
      alternateLocale: locale === "fr" ? ["en_US"] : ["fr_CM"],
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: ogImage ? [ogImage] : [],
      creator: "@essentialistmakeup",
    },
  };
}

export { SITE_NAME, DEFAULT_OG };
