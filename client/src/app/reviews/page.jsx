import ReviewClient from "../../components/reviews/ReviewClient";
import Script from "next/script";
// import ReviewClient from "../../../ReviewClient";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Essentialist Experience Hub",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "320",
  },
};

import { getStaticPageMetadata } from "@/lib/seo/staticPages";
import { getServerLocale } from "@/lib/seo/serverLocale";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return getStaticPageMetadata("reviews", locale);
}

export default function ReviewPage() {
  return (
    <>
      <Script
        id="review-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReviewClient />
    </>
  );
}