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

export const metadata = {
  title: "Authentic Customer Reviews | Essentialist Makeup Store ",
  description:
    "Read and share verified experiences about Essentialist products, shipping, support, and more.",
  alternates: {
    canonical: "/review",
  },
  openGraph: {
    title: "Essentialist Reviews Hub",
    description:
      "Browse real customer stories, filter by subject, and publish your own Essentialist review.",
    url: "/review",
    type: "website",
  },
};

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