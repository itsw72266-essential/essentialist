// // client\src\app\product\[slug]\page.jsx
// import { Suspense } from "react";
// import { notFound } from "next/navigation";
// import {
//   HydrationBoundary,
//   QueryClient,
//   dehydrate,
// } from "@tanstack/react-query";
// import ProductDisplayClient from "./ProductDisplayClient";
// import ProductRecommendations from "../../../components/ProductRecommendations";
// import { pricewithDiscount } from "../../../utils/PriceWithDiscount";
// import {
//   fetchProduct,
//   fetchRatings,
//   productQueryOptions,
//   ratingQueryOptions,
// } from "./queries";

// const DEFAULT_PRICE_VALIDITY_DAYS = 90;

// function extractProductId(slug) {
//   if (!slug) return null;
//   const parts = slug.split("-");
//   return parts.at(-1);
// }

// function stripHtml(html) {
//   if (!html) return "";
//   return html.replace(/<[^>]*>?/gm, "").trim();
// }

// function toNumber(value) {
//   const num = Number(value);
//   return Number.isFinite(num) ? num : 0;
// }

// function normalizePositiveNumber(value) {
//   const num = toNumber(value);
//   return num > 0 ? num : null;
// }

// function resolveOfferPrice(product) {
//   const basePrice =
//     normalizePositiveNumber(product?.price) ??
//     normalizePositiveNumber(product?.bulkPrice) ??
//     normalizePositiveNumber(product?.salePrice);

//   if (!basePrice) return null;

//   const discount = Math.min(Math.max(toNumber(product?.discount), 0), 100);
//   if (discount <= 0) return basePrice;

//   const discounted = pricewithDiscount(basePrice, discount);
//   const normalizedDiscount = normalizePositiveNumber(discounted);

//   return normalizedDiscount ?? basePrice;
// }

// function getPriceValidUntilDate(rawDate) {
//   if (rawDate) {
//     const parsed = new Date(rawDate);
//     if (!Number.isNaN(parsed.getTime())) {
//       return parsed.toISOString().split("T")[0];
//     }
//   }

//   return new Date(
//     Date.now() + DEFAULT_PRICE_VALIDITY_DAYS * 24 * 60 * 60 * 1000
//   )
//     .toISOString()
//     .split("T")[0];
// }

// function safeJsonLdString(data) {
//   return JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
// }

// function buildReviewEntries(product, aggregateRating, url) {
//   const productName = product?.name ?? "Product";
//   const sku = product?._id ?? product?.sku ?? undefined;
//   const fallbackRatingValue =
//     Number(aggregateRating?.ratingValue) > 0
//       ? aggregateRating.ratingValue
//       : "5";

//   const candidateReviews = Array.isArray(product?.reviews)
//     ? product.reviews
//     : Array.isArray(product?.recentReviews)
//     ? product.recentReviews
//     : [];

//   const normalizedReviews = candidateReviews
//     .filter(Boolean)
//     .slice(0, 3)
//     .map((review, index) => {
//       const body =
//         review.reviewBody ??
//         review.comment ??
//         review.text ??
//         review.body ??
//         "";
//       if (!body) return null;

//       const authorName =
//         review.author?.name ??
//         review.author?.fullName ??
//         review.author ??
//         review.user?.name ??
//         review.userName ??
//         "Verified Buyer";

//       const ratingValue =
//         normalizePositiveNumber(
//           review.rating ?? review.ratingValue ?? fallbackRatingValue
//         ) ?? Number(fallbackRatingValue);

//       const publishedDate = (() => {
//         const sourceDate =
//           review.datePublished ?? review.updatedAt ?? review.createdAt;
//         const parsed = sourceDate ? new Date(sourceDate) : new Date();
//         return Number.isNaN(parsed.getTime())
//           ? new Date().toISOString()
//           : parsed.toISOString();
//       })();

//       return {
//         "@type": "Review",
//         name: review.title ?? `${productName} review #${index + 1}`,
//         reviewBody: body,
//         datePublished: publishedDate,
//         author: {
//           "@type": "Person",
//           name: authorName,
//         },
//         itemReviewed: {
//           "@type": "Product",
//           name: productName,
//           sku,
//           url,
//         },
//         reviewRating: {
//           "@type": "Rating",
//           ratingValue: ratingValue.toFixed(1),
//           bestRating: "5",
//           worstRating: "1",
//         },
//       };
//     })
//     .filter(Boolean);

//   if (normalizedReviews.length) return normalizedReviews;

//   return [
//     {
//       "@type": "Review",
//       name: `${productName} authenticity & freshness check`,
//       reviewBody: `Essentialist Makeup Store’s in-house quality team has verified the authenticity, freshness, and packaging integrity of ${productName} before making it available online.`,
//       datePublished: new Date().toISOString().split("T")[0],
//       author: {
//         "@type": "Organization",
//         name: "Essentialist Makeup Store Quality Team",
//       },
//       reviewRating: {
//         "@type": "Rating",
//         ratingValue: fallbackRatingValue,
//         bestRating: "5",
//         worstRating: "1",
//       },
//       itemReviewed: {
//         "@type": "Product",
//         name: productName,
//         sku,
//         url,
//       },
//     },
//   ];
// }

// export async function generateMetadata({ params }) {
//   const resolvedParams = await params;
//   const slug = resolvedParams?.slug;
//   const productId = extractProductId(slug);

//   if (!productId) {
//     return {
//       title: "Product not found",
//       description: "Invalid product URL.",
//       robots: { index: false, follow: false },
//     };
//   }

//   let product = null;
//   try {
//     product = await fetchProduct(productId);
//   } catch {
//     product = null;
//   }

//   if (!product) {
//     return {
//       title: "Product not found",
//       description: "Product could not be found.",
//       robots: { index: false, follow: true },
//     };
//   }

//   let rating = null;
//   try {
//     rating = await fetchRatings(productId);
//   } catch {
//     rating = null;
//   }

//   const safeRating = rating ?? { average: 0, count: 0 };
//   const name = product?.name ?? "Product";
//   const description =
//     stripHtml(product?.description) ||
//     `Buy ${name} at Essentialist Makeup Store.`;
//   const heroImage = Array.isArray(product?.image)
//     ? product.image[0]
//     : product?.image;
//   const canonical = `https://www.esmakeupstore.com/product/${slug}`;

//   return {
//     metadataBase: new URL("https://www.esmakeupstore.com"),
//     title: name,
//     description,
//     keywords: [
//       name,
//       "makeup",
//       "beauty",
//       "cosmetics",
//       "Essentialist Makeup Store",
//       "Cameroon makeup",
//       "Douala beauty",
//     ].filter(Boolean),
//     alternates: { canonical },
//     openGraph: {
//       type: "website",
//       siteName: "Essentialist Makeup Store",
//       url: canonical,
//       title: name,
//       description,
//       images: heroImage
//         ? [{ url: heroImage, width: 1200, height: 630, alt: name }]
//         : [],
//       locale: "en_US",
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: name,
//       description,
//       images: heroImage ? [heroImage] : [],
//     },
//     robots: { index: true, follow: true },
//     other: {
//       "x-aggregate-rating": safeRating.average ?? 0,
//       "x-rating-count": safeRating.count ?? 0,
//     },
//   };
// }

// const tabularStyles = `
//   .tabular-content {
//     white-space: pre-wrap;
//     font-family: 'Courier New', monospace;
//     line-height: 1.8;
//     background-color: #f8fafc;
//     padding: 12px;
//     border-radius: 0.375rem;
//     border: 1px solid #e2e8f0;
//     font-size: 14px;
//     tab-size: 4;
//     overflow-x: auto;
//     margin: 8px 0;
//   }
//   .tabular-content::selection { background-color: #bfdbfe; }
//   .product-description-content { line-height: 1.6; }
//   .product-description-content p { margin-bottom: 0.5rem; }
//   .product-description-content ul,
//   .product-description-content ol {
//     margin-left: 1.5rem;
//     margin-bottom: 0.5rem;
//   }
//   .product-description-content h1,
//   .product-description-content h2,
//   .product-description-content h3,
//   .product-description-content h4,
//   .product-description-content h5,
//   .product-description-content h6 {
//     font-weight: 600;
//     margin-bottom: 0.5rem;
//     margin-top: 1rem;
//   }
//   .zoomable { cursor: zoom-in; }
//   .zoomable:focus {
//     outline: 2px solid #38bdf8;
//     outline-offset: 2px;
//   }
//   .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
//   .scrollbar-none::-webkit-scrollbar { display: none; }
//   .thumb-item:focus-visible {
//     outline: 2px solid #4f46e5;
//     outline-offset: 3px;
//     border-radius: 6px;
//   }
// `;

// function ImageSkeleton() {
//   return <div className="aspect-square rounded-lg bg-slate-200 animate-pulse" />;
// }

// function TextSkeleton({ width = "100%", height = "h-4" }) {
//   return (
//     <div
//       className={`bg-slate-200/80 rounded ${height} animate-pulse`}
//       style={{ width }}
//     />
//   );
// }

// function RatingSkeleton() {
//   return (
//     <div className="mt-2 flex items-center gap-3">
//       <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
//       <div className="h-3 w-16 rounded bg-slate-200 animate-pulse" />
//     </div>
//   );
// }

// function RecommendationsSkeleton() {
//   return (
//     <section className="container mx-auto px-4 pb-10">
//       <TextSkeleton width="40%" height="h-6" />
//       <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
//         {[...Array(4)].map((_, idx) => (
//           <div key={idx} className="space-y-2">
//             <ImageSkeleton />
//             <TextSkeleton width="80%" />
//             <TextSkeleton width="60%" />
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

// function StructuredData({ product, slug, rating }) {
//   if (!product) return null;

//   const url = `https://www.esmakeupstore.com/product/${slug}`;
//   const images = Array.isArray(product.image)
//     ? product.image.filter(Boolean)
//     : [product.image].filter(Boolean);
//   const imageSet = images.length ? images : undefined;

//   const offerPriceNumber = resolveOfferPrice(product);
//   const finalPriceNumber = offerPriceNumber ?? 1;
//   const formattedPrice = finalPriceNumber.toFixed(2);
//   const priceValidUntil = getPriceValidUntilDate(product?.priceValidUntil);
//   const isInStock = Number(product?.stock ?? 0) > 0;
//   const description =
//     stripHtml(product.description) ||
//     `Shop ${product.name} online at Essentialist Makeup Store in Cameroon.`;

//   const ratingValue = normalizePositiveNumber(
//     rating?.average ?? product?.ratingAverage
//   );

//   const ratingCount = Math.max(
//     0,
//     Math.round(toNumber(rating?.count ?? product?.ratingCount))
//   );

//   const aggregateRating = {
//     "@type": "AggregateRating",
//     ratingValue: (ratingValue ?? 0).toFixed(2),
//     reviewCount: String(ratingCount),
//     bestRating: "5",
//     worstRating: "1",
//   };

//   const reviews = buildReviewEntries(product, aggregateRating, url);

//   const offers = {
//     "@type": "Offer",
//     priceCurrency: "XAF",
//     price: formattedPrice,
//     priceValidUntil,
//     availability: isInStock
//       ? "https://schema.org/InStock"
//       : "https://schema.org/OutOfStock",
//     url,
//     itemCondition: "https://schema.org/NewCondition",
//     seller: {
//       "@type": "Organization",
//       name: "Essentialist Makeup Store",
//       url: "https://www.esmakeupstore.com",
//       telephone: "+237655225569",
//       address: {
//         "@type": "PostalAddress",
//         streetAddress: "Bonamoussadi, Carrefour Maçon",
//         addressLocality: "Douala",
//         addressRegion: "Littoral",
//         postalCode: "00237",
//         addressCountry: "CM",
//       },
//     },
//     priceSpecification: {
//       "@type": "PriceSpecification",
//       priceCurrency: "XAF",
//       price: formattedPrice,
//     },
//     inventoryLevel: {
//       "@type": "QuantitativeValue",
//       value: Math.max(Number(product?.stock ?? 0), 0),
//     },
//   };

//   const productJsonLd = {
//     "@context": "https://schema.org",
//     "@type": "Product",
//     name: product.name,
//     description,
//     image: imageSet,
//     sku: product._id ?? product.sku,
//     brand: product.brand
//       ? { "@type": "Brand", name: product.brand }
//       : undefined,
//     offers,
//     aggregateRating,
//     review: reviews,
//   };

//   const breadcrumbJsonLd = {
//     "@context": "https://schema.org",
//     "@type": "BreadcrumbList",
//     itemListElement: [
//       {
//         "@type": "ListItem",
//         position: 1,
//         name: "Home",
//         item: "https://www.esmakeupstore.com/",
//       },
//       {
//         "@type": "ListItem",
//         position: 2,
//         name: "Products",
//         item: "https://www.esmakeupstore.com/product",
//       },
//       {
//         "@type": "ListItem",
//         position: 3,
//         name: product.name,
//         item: url,
//       },
//     ],
//   };

//   const websiteJsonLd = {
//     "@context": "https://schema.org",
//     "@type": "WebSite",
//     name: "Essentialist Makeup Store",
//     url: "https://www.esmakeupstore.com/",
//     potentialAction: {
//       "@type": "SearchAction",
//       target:
//         "https://www.esmakeupstore.com/search?q={search_term_string}",
//       "query-input": "required name=search_term_string",
//     },
//   };

//   const organizationJsonLd = {
//     "@context": "https://schema.org",
//     "@type": "Organization",
//     name: "Essentialist Makeup Store",
//     url: "https://www.esmakeupstore.com/",
//     sameAs: [
//       "https://www.facebook.com/Essentialistmakeupstore",
//       "https://www.tiktok.com/@essentialistmakeupstore",
//       "https://www.instagram.com/Essentialistmakeupstore",
//     ],
//     address: {
//       "@type": "PostalAddress",
//       streetAddress: "Bonamoussadi, Carrefour Maçon",
//       addressLocality: "Douala",
//       addressRegion: "Littoral",
//       postalCode: "00237",
//       addressCountry: "CM",
//     },
//     contactPoint: {
//       "@type": "ContactPoint",
//       telephone: "+237655225569",
//       contactType: "customer service",
//       availableLanguage: ["en", "fr"],
//     },
//   };

//   const payload = [
//     productJsonLd,
//     breadcrumbJsonLd,
//     websiteJsonLd,
//     organizationJsonLd,
//   ];

//   return (
//     <>
//       {payload.map((entry, idx) => (
//         <script
//           key={`ld-${idx}`}
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{ __html: safeJsonLdString(entry) }}
//         />
//       ))}
//     </>
//   );
// }

// export default async function ProductDisplayPage({ params }) {
//   const resolvedParams = await params;
//   const slug = resolvedParams?.slug;
//   const productId = extractProductId(slug);

//   if (!productId) return notFound();

//   const queryClient = new QueryClient();

//   let productData;
//   try {
//     productData = await queryClient.fetchQuery(
//       productQueryOptions(productId)
//     );
//   } catch (error) {
//     if (error?.status === 404) return notFound();
//     throw error;
//   }

//   const ratingSnapshot = await queryClient.fetchQuery(
//     ratingQueryOptions(productId)
//   );

//   const dehydratedState = dehydrate(queryClient);

//   return (
//     <>
//       <style dangerouslySetInnerHTML={{ __html: tabularStyles }} />
//       <StructuredData
//         product={productData}
//         slug={slug}
//         rating={ratingSnapshot}
//       />

//       <HydrationBoundary state={dehydratedState}>
//         <ProductDisplayClient productId={productId} />
//       </HydrationBoundary>

//       <Suspense fallback={<RecommendationsSkeleton />}>
//         <ProductRecommendations
//           currentProductId={productId}
//           currentProductData={productData}
//         />
//       </Suspense>
//     </>
//   );
// }










// // client\src\app\product\[slug]\page.jsx
// import { Suspense } from "react";
// import { notFound } from "next/navigation";
// import {
//   HydrationBoundary,
//   QueryClient,
//   dehydrate,
// } from "@tanstack/react-query";
// import ProductDisplayClient from "./ProductDisplayClient";
// import ProductRecommendations from "../../../components/ProductRecommendations";
// import { pricewithDiscount } from "../../../utils/PriceWithDiscount";
// import {
//   fetchProduct,
//   fetchRatings,
//   productQueryOptions,
//   ratingQueryOptions,
// } from "./queries";

// const DEFAULT_PRICE_VALIDITY_DAYS = 90;

// function extractProductId(slug) {
//   if (!slug) return null;
//   const parts = slug.split("-");
//   return parts.at(-1);
// }

// function stripHtml(html) {
//   if (!html) return "";
//   return html.replace(/<[^>]*>?/gm, "").trim();
// }

// function toNumber(value) {
//   const num = Number(value);
//   return Number.isFinite(num) ? num : 0;
// }

// function normalizePositiveNumber(value) {
//   const num = toNumber(value);
//   return num > 0 ? num : null;
// }

// function resolveOfferPrice(product) {
//   const basePrice =
//     normalizePositiveNumber(product?.price) ??
//     normalizePositiveNumber(product?.bulkPrice) ??
//     normalizePositiveNumber(product?.salePrice);

//   if (!basePrice) return null;

//   const discount = Math.min(Math.max(toNumber(product?.discount), 0), 100);
//   if (discount <= 0) return basePrice;

//   const discounted = pricewithDiscount(basePrice, discount);
//   const normalizedDiscount = normalizePositiveNumber(discounted);

//   return normalizedDiscount ?? basePrice;
// }

// function getPriceValidUntilDate(rawDate) {
//   if (rawDate) {
//     const parsed = new Date(rawDate);
//     if (!Number.isNaN(parsed.getTime())) {
//       return parsed.toISOString().split("T")[0];
//     }
//   }

//   return new Date(
//     Date.now() + DEFAULT_PRICE_VALIDITY_DAYS * 24 * 60 * 60 * 1000
//   )
//     .toISOString()
//     .split("T")[0];
// }

// function safeJsonLdString(data) {
//   return JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
// }

// function buildReviewEntries(product, aggregateRating, url) {
//   const productName = product?.name ?? "Product";
//   const sku = product?._id ?? product?.sku ?? undefined;
//   const fallbackRatingValue =
//     Number(aggregateRating?.ratingValue) > 0
//       ? aggregateRating.ratingValue
//       : "5";

//   const candidateReviews = Array.isArray(product?.reviews)
//     ? product.reviews
//     : Array.isArray(product?.recentReviews)
//     ? product.recentReviews
//     : [];

//   const normalizedReviews = candidateReviews
//     .filter(Boolean)
//     .slice(0, 3)
//     .map((review, index) => {
//       const body = stripHtml(review.reviewBody ?? review.comment ?? review.text ?? review.body ?? "");
//       if (!body) return null;

//       const authorName = review.author?.name ?? review.user?.name ?? "Verified Buyer";
//       const ratingValue = normalizePositiveNumber(review.rating ?? review.ratingValue) ?? Number(fallbackRatingValue);

//       return {
//         "@type": "Review",
//         name: review.title ?? `${productName} review #${index + 1}`,
//         reviewBody: body,
//         datePublished: new Date(review.createdAt || Date.now()).toISOString(),
//         author: { "@type": "Person", name: authorName },
//         itemReviewed: { "@type": "Product", name: productName, sku, url },
//         reviewRating: {
//           "@type": "Rating",
//           ratingValue: ratingValue.toFixed(1),
//           bestRating: "5",
//           worstRating: "1",
//         },
//       };
//     })
//     .filter(Boolean);

//   if (normalizedReviews.length) return normalizedReviews;

//   return [
//     {
//       "@type": "Review",
//       name: `${productName} Quality Assurance`,
//       reviewBody: `Verified authentic ${productName}. Inspected for freshness and packaging integrity by the Essentialist Makeup Store team.`,
//       datePublished: new Date().toISOString().split("T")[0],
//       author: { "@type": "Organization", name: "Essentialist Quality Team" },
//       reviewRating: { "@type": "Rating", ratingValue: fallbackRatingValue, bestRating: "5", worstRating: "1" },
//       itemReviewed: { "@type": "Product", name: productName, sku, url },
//     },
//   ];
// }

// export async function generateMetadata({ params }) {
//   const resolvedParams = await params;
//   const slug = resolvedParams?.slug;
//   const productId = extractProductId(slug);

//   if (!productId) return { title: "Product Not Found" };

//   let product = null;
//   try { product = await fetchProduct(productId); } catch { product = null; }

//   if (!product) return { title: "Product Not Found", robots: { index: false } };

//   const name = product?.name ?? "Product";
//   const brandName = typeof product?.brand === 'object' ? product.brand?.name : product.brand;
//   const price = resolveOfferPrice(product);
//   const formattedPrice = price ? `${price.toLocaleString('en-US')} FCFA` : '';

//   // Optimized Meta Description for Click-Through Rate
//   const description = `Shop authentic ${brandName || ''} ${name} ${formattedPrice ? `at ${formattedPrice}` : ''} at Essentialist Makeup Store. Authentic cosmetics with fast delivery in Douala & nationwide Cameroon.`;
  
//   const heroImage = Array.isArray(product?.image) ? product.image[0] : product?.image;
//   const canonical = `https://www.esmakeupstore.com/product/${slug}`;

//   return {
//     metadataBase: new URL("https://www.esmakeupstore.com"),
//     title: `${name} | Buy Online in Cameroon`,
//     description: description.substring(0, 160),
//     keywords: [name, brandName, "makeup", "Cameroon", "Douala", "cosmetics", "buy online"].filter(Boolean),
//     alternates: { canonical },
//     openGraph: {
//       type: "website",
//       siteName: "Essentialist Makeup Store",
//       url: canonical,
//       title: `${name} | Authentic Makeup Cameroon`,
//       description,
//       images: heroImage ? [{ url: heroImage, width: 1200, height: 630, alt: name }] : [],
//       locale: "en_US",
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: name,
//       description,
//       images: heroImage ? [heroImage] : [],
//     },
//     robots: { index: true, follow: true },
//   };
// }

// const tabularStyles = `
//   .tabular-content {
//     white-space: pre-wrap;
//     font-family: inherit;
//     line-height: 1.8;
//     background-color: #fff;
//     padding: 0;
//     margin: 8px 0;
//   }
// `;

// function RecommendationsSkeleton() {
//   return (
//     <section className="container mx-auto px-4 pb-10 mt-12 border-t pt-10">
//       <div className="h-8 w-64 bg-slate-100 rounded animate-pulse mb-8" />
//       <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
//         {[...Array(4)].map((_, idx) => (
//           <div key={idx} className="space-y-3">
//             <div className="aspect-square rounded-xl bg-slate-100 animate-pulse" />
//             <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
//             <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

// function StructuredData({ product, slug, rating }) {
//   if (!product) return null;

//   const url = `https://www.esmakeupstore.com/product/${slug}`;
//   const images = Array.isArray(product.image) ? product.image.filter(Boolean) : [product.image].filter(Boolean);
  
//   const offerPriceNumber = resolveOfferPrice(product);
//   const priceValidUntil = getPriceValidUntilDate(product?.priceValidUntil);
//   const isInStock = Number(product?.stock ?? 0) > 0;
//   const brandName = typeof product.brand === 'object' ? product.brand?.name : product.brand;

//   const aggregateRating = {
//     "@type": "AggregateRating",
//     ratingValue: (normalizePositiveNumber(rating?.average ?? product?.ratingAverage) ?? 5).toFixed(1),
//     reviewCount: String(Math.max(1, toNumber(rating?.count ?? product?.ratingCount))),
//     bestRating: "5",
//     worstRating: "1",
//   };

//   const productJsonLd = {
//     "@context": "https://schema.org",
//     "@type": "Product",
//     name: product.name,
//     description: stripHtml(product.description).substring(0, 250),
//     image: images,
//     sku: product._id ?? product.sku,
//     brand: { "@type": "Brand", name: brandName || "Essentialist" },
//     offers: {
//       "@type": "Offer",
//       priceCurrency: "XAF",
//       price: offerPriceNumber ? offerPriceNumber.toFixed(0) : "0",
//       priceValidUntil,
//       availability: isInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
//       url,
//       itemCondition: "https://schema.org/NewCondition",
//       seller: { "@type": "Organization", name: "Essentialist Makeup Store" },
//     },
//     aggregateRating,
//     review: buildReviewEntries(product, aggregateRating, url),
//   };

//   const breadcrumbJsonLd = {
//     "@context": "https://schema.org",
//     "@type": "BreadcrumbList",
//     itemListElement: [
//       { "@type": "ListItem", position: 1, name: "Home", item: "https://www.esmakeupstore.com/" },
//       { "@type": "ListItem", position: 2, name: "Products", item: "https://www.esmakeupstore.com/product" },
//       { "@type": "ListItem", position: 3, name: product.name, item: url },
//     ],
//   };

//   return (
//     <>
//       <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLdString(productJsonLd) }} />
//       <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLdString(breadcrumbJsonLd) }} />
//     </>
//   );
// }

// export default async function ProductDisplayPage({ params }) {
//   const resolvedParams = await params;
//   const slug = resolvedParams?.slug;
//   const productId = extractProductId(slug);

//   if (!productId) return notFound();

//   const queryClient = new QueryClient();

//   let productData;
//   try {
//     productData = await queryClient.fetchQuery(productQueryOptions(productId));
//   } catch (error) {
//     if (error?.status === 404) return notFound();
//     throw error;
//   }

//   const ratingSnapshot = await queryClient.fetchQuery(ratingQueryOptions(productId));
//   const dehydratedState = dehydrate(queryClient);

//   return (
//     <>
//       <style dangerouslySetInnerHTML={{ __html: tabularStyles }} />
//       <StructuredData product={productData} slug={slug} rating={ratingSnapshot} />

//       <HydrationBoundary state={dehydratedState}>
//         <ProductDisplayClient productId={productId} />
//       </HydrationBoundary>

//       <Suspense fallback={<RecommendationsSkeleton />}>
//         <ProductRecommendations
//           currentProductId={productId}
//           currentProductData={productData}
//         />
//       </Suspense>
//     </>
//   );
// }




// client\src\app\product\[slug]\page.jsx
/**
 * 2026 SEO/GEO/AEO Optimized Product Detail Page
 * Optimized for: Google Shopping, Answer Engines, Rich Results
 * Target: Individual product pages with comprehensive schema
 * 
 * FIXED: OpenGraph type validation error (use 'website' not 'og:product')
 */

import { notFound } from "next/navigation"
import { unstable_cache } from "next/cache"
import ProductDisplayClient from "./ProductDisplayClient"
import ProductRecommendationsLazy from "./ProductRecommendationsLazy.client"
import { pricewithDiscount } from "../../../utils/PriceWithDiscount"
import { fetchProduct, fetchReviewStats } from "./queries"

// --- Configuration ---
const DEFAULT_PRICE_VALIDITY_DAYS = 90
const BUSINESS_CONFIG = {
  name: "Essentialist Makeup Store",
  url: "https://www.esmakeupstore.com",
  phone: "+237655225569",
  currency: "XAF",
  country: "CM",
  city: "Douala",
  region: "Littoral",
}

// --- Utility Functions ---
function extractProductId(slug) {
  if (!slug) return null
  const parts = slug.split("-")
  return parts.at(-1)
}

function stripHtml(html) {
  if (!html) return ""
  return html.replace(/<[^>]*>?/gm, "").trim()
}

function toNumber(value) {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

function normalizePositiveNumber(value) {
  const num = toNumber(value)
  return num > 0 ? num : null
}

function resolveOfferPrice(product) {
  const basePrice =
    normalizePositiveNumber(product?.price) ??
    normalizePositiveNumber(product?.bulkPrice) ??
    normalizePositiveNumber(product?.salePrice)

  if (!basePrice) return null

  const discount = Math.min(Math.max(toNumber(product?.discount), 0), 100)
  if (discount <= 0) return basePrice

  const discounted = pricewithDiscount(basePrice, discount)
  const normalizedDiscount = normalizePositiveNumber(discounted)

  return normalizedDiscount ?? basePrice
}

function getPriceValidUntilDate(rawDate) {
  if (rawDate) {
    const parsed = new Date(rawDate)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0]
    }
  }

  return new Date(
    Date.now() + DEFAULT_PRICE_VALIDITY_DAYS * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .split("T")[0]
}

function safeJsonLdString(data) {
  return JSON.stringify(data, null, 2).replace(/</g, "\\u003c")
}

/**
 * Build detailed review entries with proper schema
 * Supports both user reviews and fallback verification
 */
/** Rich-result review snippets only when the product payload embeds real review text. */
function buildReviewEntries(product, url) {
  const productName = product?.name ?? "Product"
  const sku = product?._id ?? product?.sku ?? undefined

  const candidateReviews = Array.isArray(product?.reviews)
    ? product.reviews
    : Array.isArray(product?.recentReviews)
      ? product.recentReviews
      : []

  return candidateReviews
    .filter(Boolean)
    .slice(0, 5)
    .map((review, index) => {
      const body = stripHtml(
        review.reviewBody ??
          review.comment ??
          review.text ??
          review.body ??
          ""
      )
      if (!body) return null

      const authorName =
        review.author?.name ?? review.user?.name ?? "Verified Buyer"
      const ratingValue = normalizePositiveNumber(
        review.rating ?? review.ratingValue
      )
      if (!ratingValue) return null

      return {
        "@type": "Review",
        "@context": "https://schema.org",
        name: review.title ?? `${productName} review by ${authorName}`,
        reviewBody: body.substring(0, 500),
        datePublished: new Date(review.createdAt || Date.now())
          .toISOString()
          .split("T")[0],
        author: {
          "@type": "Person",
          name: authorName,
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: ratingValue.toFixed(1),
          bestRating: "5",
          worstRating: "1",
        },
        itemReviewed: {
          "@type": "Product",
          name: productName,
          sku,
          url,
        },
      }
    })
    .filter(Boolean)
}

/**
 * Generate FAQ Schema for common product questions
 * Critical for AEO (Answer Engine Optimization)
 */
function buildProductFAQSchema(product) {
  const productName = product?.name ?? "Product"
  const brandName =
    typeof product?.brand === "object" ? product.brand?.name : product.brand
  const price = resolveOfferPrice(product)
  const hasStock = Number(product?.stock ?? 0) > 0

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Is ${productName} authentic?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes, ${BUSINESS_CONFIG.name} guarantees 100% authentic products. All items are sourced directly from manufacturers and authorized distributors. We offer a money-back guarantee if the product is not authentic.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the price of ${productName} in Cameroon?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${productName} is priced at ${price ? `${price.toLocaleString("en-US")} ${BUSINESS_CONFIG.currency}` : "contact for current pricing"}. Prices may vary based on promotions and availability.`,
        },
      },
      {
        "@type": "Question",
        name: `Is ${productName} in stock?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: hasStock
            ? `Yes, ${productName} is currently in stock. Order now for fast delivery to ${BUSINESS_CONFIG.city} (1-2 days) or other cities nationwide (2-5 days).`
            : `${productName} is currently out of stock. Please check back soon or contact us for availability.`,
        },
      },
      {
        "@type": "Question",
        name: `How long does delivery take for ${productName} in Cameroon?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Delivery times: ${BUSINESS_CONFIG.city} - 1-2 business days, Other cities - 2-5 business days. Expedited delivery available upon request.`,
        },
      },
      {
        "@type": "Question",
        name: `Can I return ${productName} if unsatisfied?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes, we offer returns within 30 days of purchase if the product is unopened and in original packaging. For damaged items, we provide immediate replacement or refund.`,
        },
      },
      {
        "@type": "Question",
        name: `What payment methods do you accept for ${productName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `We accept cash on delivery, mobile money transfers, and bank transfers. All transactions are secure and encrypted.`,
        },
      },
    ],
  }
}

/**
 * Next.js Data Cache (server): repeat requests skip your API for the TTL.
 * Redis on the API still speeds first hits / cache misses.
 */
const getCachedProduct = unstable_cache(
  async (productId) => fetchProduct(productId),
  ["product-detail"],
  { revalidate: 60 },
)

const getCachedReviewStats = unstable_cache(
  async (productId) => fetchReviewStats(productId),
  ["product-review-stats"],
  { revalidate: 30 },
)

/**
 * Export optimized metadata for SEO
 */
export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const slug = resolvedParams?.slug
  const productId = extractProductId(slug)

  if (!productId)
    return {
      title: "Product Not Found",
      robots: { index: false },
    }

  let product = null
  try {
    product = await getCachedProduct(productId)
  } catch {
    product = null
  }

  if (!product)
    return {
      title: "Product Not Found",
      robots: { index: false },
    }

  // --- Metadata Extraction ---
  const name = product?.name ?? "Product"
  const brandName =
    typeof product?.brand === "object" ? product.brand?.name : product.brand
  const price = resolveOfferPrice(product)
  const description = stripHtml(product?.description ?? "").substring(0, 160)
  const hasStock = Number(product?.stock ?? 0) > 0

  // --- SEO-Optimized Title (< 60 chars) ---
  const title =
    price && brandName
      ? `${brandName} ${name} | ${price.toLocaleString("en-US")} XAF | Buy in Cameroon`
      : `${name} | Authentic Makeup in Cameroon`

  // --- SEO-Optimized Description ---
  const metaDescription = `Buy authentic ${brandName || "makeup"} ${name} ${
    price ? `at ${price.toLocaleString("en-US")} XAF` : ""
  } at ${BUSINESS_CONFIG.name}. ${
    hasStock ? "In stock. " : "Check availability. "
  }Fast delivery in ${BUSINESS_CONFIG.city} & nationwide. Money-back guarantee.`

  const heroImage = Array.isArray(product?.image)
    ? product.image[0]
    : product?.image
  const canonical = `https://www.esmakeupstore.com/product/${slug}`

  return {
    metadataBase: new URL("https://www.esmakeupstore.com"),
    title: title,
    description: metaDescription.substring(0, 160),
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
    ]
      .filter(Boolean)
      .slice(0, 10),

    // --- Robots & Crawling ---
    robots: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },

    // --- Canonical & Alternates ---
    alternates: {
      canonical: canonical,
    },

    // --- OpenGraph (Social + AEO) ---
    // NOTE: Using 'website' type (valid Next.js type)
    // Product-specific metadata goes in 'other' field below
    openGraph: {
      type: "website",
      url: canonical,
      siteName: BUSINESS_CONFIG.name,
      title: name,
      description: metaDescription,
      images: heroImage
        ? [
            {
              url: heroImage,
              width: 1200,
              height: 630,
              alt: name,
              type: "image/jpeg",
            },
          ]
        : [],
      locale: "en_US",
    },

    // --- Twitter Card ---
    twitter: {
      card: "summary_large_image",
      title: name,
      description: metaDescription,
      images: heroImage ? [heroImage] : [],
      creator: "@essentialistmakeup",
    },

    // --- Additional SEO Meta Tags (Product-Specific OpenGraph goes here) ---
    other: {
      // Product OpenGraph (Facebook/Social)
      "og:type": "product",
      "product:price:amount": price?.toString() || "0",
      "product:price:currency": BUSINESS_CONFIG.currency,
      "product:availability": hasStock ? "in_stock" : "out_of_stock",
      
      // Geographic Meta Tags (GEO)
      "geo:placename": BUSINESS_CONFIG.city,
      "geo:region": `${BUSINESS_CONFIG.country}-${BUSINESS_CONFIG.region}`,
      
      // Product Category
      "product:category": product?.category?.name || "Makeup",
    },
  }
}

// --- CSS Styles ---
const tabularStyles = `
  .tabular-content {
    white-space: pre-wrap;
    font-family: inherit;
    line-height: 1.8;
    background-color: #fff;
    padding: 0;
    margin: 8px 0;
  }

  .product-price-highlight {
    font-size: 1.5rem;
    font-weight: bold;
    color: #ec4899;
    display: inline-block;
  }

  .product-stock-indicator {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .stock-available {
    background-color: #dcfce7;
    color: #166534;
  }

  .stock-low {
    background-color: #fef3c7;
    color: #92400e;
  }

  .stock-unavailable {
    background-color: #fee2e2;
    color: #991b1b;
  }
`

/**
 * Skeleton Loader for Product Recommendations
 */
function RecommendationsSkeleton() {
  return (
    <section className="container mx-auto px-4 pb-4 mt-2 border-t border-slate-200 pt-4">
      <div className="h-8 w-64 bg-slate-100 rounded animate-pulse mb-8" />
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="space-y-3">
            <div className="aspect-square rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  )
}

/**
 * Comprehensive Structured Data for Product
 * Includes: Product, Breadcrumb, FAQ, Aggregate Rating, Reviews
 */
function StructuredData({ product, slug, reviewStats }) {
  if (!product) return null

  const url = `https://www.esmakeupstore.com/product/${slug}`
  const images = Array.isArray(product.image)
    ? product.image.filter(Boolean)
    : [product.image].filter(Boolean)

  const offerPriceNumber = resolveOfferPrice(product)
  const priceValidUntil = getPriceValidUntilDate(product?.priceValidUntil)
  const isInStock = Number(product?.stock ?? 0) > 0
  const brandName =
    typeof product.brand === "object" ? product.brand?.name : product.brand

  const reviewStatsCount = Math.max(
    0,
    Math.round(toNumber(reviewStats?.count ?? product?.reviewsCount)),
  )
  const reviewStatsAvg = normalizePositiveNumber(
    reviewStats?.average ?? product?.reviewsAverage,
  )
  const hasPublishedReviews = reviewStatsCount > 0 && reviewStatsAvg

  const embeddedReviewSnippets = hasPublishedReviews
    ? buildReviewEntries(product, url)
    : []

  // --- 1. Product Schema (Google Shopping + Rich Results) ---
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": url,
    name: product.name,
    description: stripHtml(product.description).substring(0, 500),
    image: images,
    sku: product._id ?? product.sku,
    brand: {
      "@type": "Brand",
      name: brandName || BUSINESS_CONFIG.name,
    },
    manufacturer: {
      "@type": "Organization",
      name: brandName || "Cosmetics Manufacturer",
    },
    offers: {
      "@type": "Offer",
      "@id": url,
      url: url,
      priceCurrency: BUSINESS_CONFIG.currency,
      price: offerPriceNumber ? offerPriceNumber.toFixed(0) : "0",
      priceValidUntil: priceValidUntil,
      availability: isInStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: BUSINESS_CONFIG.name,
        url: BUSINESS_CONFIG.url,
        telephone: BUSINESS_CONFIG.phone,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "PriceSpecification",
          priceCurrency: BUSINESS_CONFIG.currency,
          price: "0", // Free shipping (adjust if needed)
        },
        shippingDestination: [
          {
            "@type": "ShippingDeliveryTime",
            deliveryLocation: {
              "@type": "City",
              name: BUSINESS_CONFIG.city,
            },
            businessDays: "1-2",
          },
          {
            "@type": "ShippingDeliveryTime",
            deliveryLocation: {
              "@type": "Country",
              name: BUSINESS_CONFIG.country,
            },
            businessDays: "2-5",
          },
        ],
      },
    },
    ...(hasPublishedReviews
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviewStatsAvg.toFixed(1),
            reviewCount: String(reviewStatsCount),
            bestRating: "5",
            worstRating: "1",
          },
          ...(embeddedReviewSnippets.length > 0
            ? { review: embeddedReviewSnippets }
            : {}),
        }
      : {}),
    sku: product._id,
    mpn: product.sku || product._id,
    color: product.color || undefined,
    size: product.size || undefined,
    weight: product.weight
      ? {
          "@type": "QuantitativeValue",
          value: product.weight,
          unitCode: "GRM",
        }
      : undefined,
    material: product.material || undefined,
    category: product.category?.name || "Makeup",
    inLanguage: "en-US",
    potentialAction: {
      "@type": "BuyAction",
      target: url,
    },
  }

  // --- 2. Breadcrumb Schema (Navigation + SEO) ---
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BUSINESS_CONFIG.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${BUSINESS_CONFIG.url}/product`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.category?.name || "Category",
        item: `${BUSINESS_CONFIG.url}/${product.category?.slug || ""}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: url,
      },
    ],
  }

  // --- 3. FAQ Schema (AEO - Answer Engine Optimization) ---
  const faqJsonLd = buildProductFAQSchema(product)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdString(breadcrumbJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(faqJsonLd) }}
      />
    </>
  )
}

/**
 * Main Product Detail Page Component
 */
export default async function ProductDisplayPage({ params }) {
  const resolvedParams = await params
  const slug = resolvedParams?.slug
  const productId = extractProductId(slug)

  if (!productId) return notFound()

  let productData
  let reviewStatsSnapshot = { average: 0, count: 0 }
  try {
    productData = await getCachedProduct(productId)
  } catch (error) {
    const status = error?.status
    if (status === 404 || status === 400) return notFound()
    throw error
  }

  try {
    reviewStatsSnapshot = await getCachedReviewStats(productId)
  } catch {
    // Review stats are optional; do not fail the PDP if the route errors.
  }

  const dataUpdatedAt = Date.now()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: tabularStyles }} />

      {/* Structured Data */}
      <StructuredData
        product={productData}
        slug={slug}
        reviewStats={reviewStatsSnapshot}
      />

      {/* Main Product Display */}
      <ProductDisplayClient
        productId={productId}
        initialProduct={productData}
        initialReviewStats={reviewStatsSnapshot}
        initialDataUpdatedAt={dataUpdatedAt}
      />

      {/* Product Recommendations */}
      <ProductRecommendationsLazy
        currentProductId={productId}
        currentProductData={productData}
      />
    </>
  )
}