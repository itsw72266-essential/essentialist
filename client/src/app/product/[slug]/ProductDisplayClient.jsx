// //client\src\app\product\[slug]\ProductDisplayClient.jsx
// "use client";

// import { useMemo } from "react";
// import Image from "next/image";
// import { useQuery } from "@tanstack/react-query";
// import dynamic from "next/dynamic";

// import Divider from "../../../components/Divider";
// import AddToCartButton from "../../../components/AddToCartButton";
// import { DisplayPriceInRupees } from "../../../utils/DisplayPriceInRupees";
// import { pricewithDiscount } from "../../../utils/PriceWithDiscount";
// import { productQueryOptions, ratingQueryOptions } from "./queries";
// import ProductGallery from "./ProductGallery.client";

// const RatingBlock = dynamic(() => import("./RatingBlock.client"), {
//   loading: () => <RatingSkeleton />,
// });

// export default function ProductDisplayClient({ productId }) {
//   const {
//     data: productData,
//     isLoading: isProductLoading,
//     isError: isProductError,
//   } = useQuery({
//     ...productQueryOptions(productId),
//   });

//   const { data: ratingSnapshot, isLoading: isRatingLoading } = useQuery({
//     ...ratingQueryOptions(productId),
//   });

//   if (isProductLoading) return <PageSkeleton />;

//   if (isProductError || !productData) {
//     return (
//       <section className="container mx-auto p-6 text-center">
//         <p className="text-lg font-semibold text-rose-600">Unable to load product. Please refresh.</p>
//       </section>
//     );
//   }

//   const images = useMemo(() => {
//     if (Array.isArray(productData.image)) return productData.image.filter(Boolean);
//     return [productData.image].filter(Boolean);
//   }, [productData.image]);

//   return (
//     <main className="container mx-auto p-4 text-slate-900 font-medium">
//       {/* UBUY BREADCRUMBS */}
//       <nav className="mb-4 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 uppercase">
//         <span className="cursor-pointer hover:text-amber-600">
//           {typeof productData.brand === 'object' ? productData.brand?.name : productData.brand}
//         </span>
//         <span>/</span>
//         <span className="cursor-pointer hover:text-amber-600">
//           {typeof productData.category === 'object' ? productData.category?.name : productData.category}
//         </span>
//         <span>/</span>
//         <span className="font-bold text-slate-900">
//           {productData.name?.substring(0, 30)}...
//         </span>
//       </nav>

//       {/* TOP SECTION: 2-Column Layout for Image and Info */}
//       <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        
//         {/* LEFT: Image Gallery with Bestseller Badge */}
//         <div className="relative min-w-0">
//           <div className="absolute left-2 top-2 z-10">
//             <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase">
//               Bestseller
//             </span>
//           </div>
//           <ProductGallery images={images} productName={productData.name} />
//         </div>

//         {/* RIGHT: Product Sidebar */}
//         <aside className="space-y-6">
//           <Badge />
//           <header>
//             <h1 className="text-xl font-bold lg:text-3xl leading-tight">{productData.name}</h1>
//           </header>

//           <RatingSummary
//             ratingSnapshot={isRatingLoading ? { average: 0, count: 0 } : (ratingSnapshot ?? { average: 0, count: 0 })}
//             productId={productId}
//           />

//           <Divider />

//           <div className="flex flex-wrap items-end justify-between gap-y-4 gap-x-2">
//             <div className="flex-1 min-w-[120px]">
//               <PriceBlock
//                 label="Bulk Price"
//                 amount={pricewithDiscount(productData.bulkPrice ?? productData.price, productData.discount ?? 0)}
//                 baseAmount={productData.price}
//                 discount={productData.discount}
//               />
//             </div>

//             <div className="flex-1 min-w-[120px]">
//               <PriceBlock
//                 label="Price"
//                 amount={pricewithDiscount(productData.price, productData.discount ?? 0)}
//                 baseAmount={productData.price}
//                 discount={productData.discount}
//               />
//             </div>

//             <div className="flex-none">
//               <div className="rounded-lg shadow-[0_0_12px_rgba(236,72,153,0.3)] transform transition hover:scale-105">
//                 <AddToCartButton data={productData} />
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-2 bg-slate-50 p-2 rounded text-[11px] text-slate-600">
//               <img src="https://d3ulwu8fab47va.cloudfront.net/skin/frontend/default/ubuycom-v1/images/countries-flag/us-store.svg" alt="USA" className="w-4" />
//               <span>Imported from USA store</span>
//           </div>

//           <Divider />
//           <WhyShopWithUs />
//         </aside>
//       </div>

//       {/* FULL WIDTH DESCRIPTION SECTION */}
//       <div className="mt-16 w-full border-t border-slate-200 pt-12">
//         <DescriptionBlock product={productData} />
//       </div>
//     </main>
//   );
// }

// function Badge() {
//   return (
//     <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
//       10 Minutes Delivery
//     </span>
//   );
// }

// function RatingSummary({ ratingSnapshot, productId }) {
//   const average = Number(ratingSnapshot?.average ?? 0).toFixed(1);
//   return (
//     <div className="space-y-1">
//       <div className="flex items-center gap-2 text-sm">
//         <span className="text-xl font-bold">{average}</span>
//         <span className="text-slate-400">/ 5.0</span>
//       </div>
//       <RatingBlock productId={productId} />
//     </div>
//   );
// }

// function PriceBlock({ label, amount, baseAmount, discount }) {
//   return (
//     <div className="flex flex-col gap-1">
//       <h2 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">{label}</h2>
//       <div className="flex flex-col">
//         <span className="text-xl font-bold text-slate-900 sm:text-2xl">
//           {DisplayPriceInRupees(amount)}
//         </span>
//         {discount > 0 && (
//           <div className="flex items-center gap-1 text-[10px]">
//             <span className="text-slate-400 line-through">{DisplayPriceInRupees(baseAmount)}</span>
//             <span className="text-rose-500 font-bold">-{discount}%</span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function DescriptionBlock({ product }) {
//   return (
//     <div className="space-y-16">
//       <section>
//         <div className="mb-8 inline-block border-b-4 border-amber-500 pb-1">
//           <h3 className="text-2xl font-bold">{t("product.whatStandsOut")}</h3>
//         </div>
//         <div className="grid gap-6 md:grid-cols-3">
//           {["Deep Cleansing", "Heartleaf Extract", "Korean Formula"].map((title) => (
//             <div key={title} className="p-6 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition">
//               <h4 className="font-bold mb-2">{title}</h4>
//               <p className="text-sm text-slate-600 leading-relaxed">High-quality ingredients designed to enhance skin wellness and achieve a radiant appearance.</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       <section>
//         <div className="mb-6 inline-block border-b-4 border-amber-500 pb-1">
//           <h3 className="text-2xl font-bold">Product Description</h3>
//         </div>
//         <div
//           className="prose prose-slate max-w-none text-base leading-relaxed text-slate-700 text-justify"
//           dangerouslySetInnerHTML={{ __html: product.description ?? "" }}
//         />
//       </section>

//       <section className="space-y-6">
//         <div className="mb-4 inline-block border-b-4 border-amber-500 pb-1">
//           <h3 className="text-2xl font-bold text-slate-900">{t("product.productDetails")}</h3>
//         </div>
//         <div className="grid gap-4 text-sm text-slate-700">
//           {[product.specifications, product.unit].filter(Boolean).map((detail, i) => (
//             <div key={i} className="flex items-start gap-3">
//               <div className="mt-1 h-5 w-5 flex-shrink-0 rounded bg-amber-500 flex items-center justify-center text-white font-bold text-[10px]">U</div>
//               <div>
//                 {/* Fallback for objects in details list */}
//                 {typeof detail === 'object' ? JSON.stringify(detail) : detail}
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// }

// function WhyShopWithUs() {
//   const perks = [
//     { title: "Super-fast Delivery", description: "From dark stores near you.", icon: "/assets/minute_delivery.jpeg" },
//     { title: "Best Prices", description: "Direct savings on essentials.", icon: "/assets/Best_Prices_Offers.png" },
//     { 
//       title: "Authentic Products", 
//       description: "Guaranteed authentic products.", 
//       icon: "https://d2ati23fc66y9j.cloudfront.net/ubuycom-v1/images/ubuy-seal-authentic.png.webp" 
//     },
//   ];

//   return (
//     <div className="grid gap-3">
//       {perks.map((perk) => (
//         <div key={perk.title} className="flex items-center gap-3 p-2 rounded-lg border border-slate-50">
//           <div className="relative h-10 w-10 flex-shrink-0">
//             {/* Standard <img> tag avoids hostname configuration errors */}
//             <img 
//               src={perk.icon} 
//               alt={perk.title} 
//               className="h-full w-full object-cover rounded" 
//             />
//           </div>
//           <div className="text-[11px]">
//             <h3 className="font-bold">{perk.title}</h3>
//             <p className="text-slate-500">{perk.description}</p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// function PageSkeleton() {
//   return <div className="container mx-auto p-10 animate-pulse bg-slate-50 h-screen rounded-xl" />;
// }

// function RatingSkeleton() {
//   return <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />;
// }





//client\src\app\product\[slug]\ProductDisplayClient.jsx
"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import Divider from "../../../components/Divider";
import AddToCartButton from "../../../components/AddToCartButton";
import { pricewithDiscount } from "../../../utils/PriceWithDiscount";
import { productQueryOptions, reviewStatsQueryOptions } from "./queries";
import ProductGallery from "./ProductGallery.client";
import { getLocalizedProductName } from "@/helpers/localizeContent";

const ReviewsSection = dynamic(() => import("./ReviewsSection.client"), {
  loading: () => (
    <div className="mt-12 h-32 animate-pulse rounded-xl bg-slate-100" />
  ),
});

function FCFA(amount) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '—'
  return `${amount.toLocaleString('en-US')} FCFA`
}

function formatProductDescription(text, noDescriptionText) {
  if (!text) return noDescriptionText;
  let formattedText = text.replace(/<\/?(b|strong)[^>]*>/gi, '');
  formattedText = formattedText.replace(/<\/p>/gi, '|||').replace(/<p[^>]*>/gi, '').replace(/<br\s*\/?>/gi, '|||').replace(/\n/g, '|||');
  formattedText = formattedText.replace(/([A-Z][A-Z\s\-&]{3,50})\s*-\s+/g, '|||$1 - ');
  formattedText = formattedText.replace(/([A-Z][a-zA-Z\s\-]{2,30}:)(?!\/)/g, '|||$1 ');
  const paragraphs = formattedText.split('|||').map(p => p.trim()).filter(p => p.length > 0);
  const styledParagraphs = paragraphs.map(para => {
    let p = para;
    p = p.replace(/^(About this item|Product Details|Key Features)/i, '<strong class="text-pink-600 text-xl block mb-2 mt-4">$1</strong>');
    p = p.replace(/^([A-Z][A-Z\s\-&]{3,50})\s*-\s*/, '<strong class="text-pink-600 font-bold">$1 - </strong>');
    p = p.replace(/^([A-Z][a-zA-Z\s\-]{2,30}:)/, '<strong class="text-pink-600 font-bold">$1</strong>');
    return `<p class="mb-4 leading-relaxed text-slate-700">${p}</p>`;
  });
  return styledParagraphs.join('');
}

function ReadOnlyStars({ value, size = 18 }) {
  const display = Number(value || 0);
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const full = display >= i + 1;
        const half = !full && display >= i + 0.5;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 20 20" className="inline-block">
            <defs>
              <linearGradient id={`pdpHalf${i}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stopColor="#f472b6" />
                <stop offset="50%" stopColor="#e5e7eb" />
              </linearGradient>
            </defs>
            <path
              d="M10 1.8l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9 5.06 17l.94-5.5-4-3.9 5.53-.8L10 1.8z"
              fill={full ? "#f472b6" : half ? `url(#pdpHalf${i})` : "#e5e7eb"}
              stroke="#fbcfe8"
            />
          </svg>
        );
      })}
    </div>
  );
}

export default function ProductDisplayClient({
  productId,
  initialProduct,
  initialReviewStats,
  initialDataUpdatedAt,
}) {
  const { t, i18n } = useTranslation();
  const { data: productData, isLoading: isProductLoading, isError: isProductError } = useQuery({
    ...productQueryOptions(productId),
    initialData: initialProduct,
    initialDataUpdatedAt,
  });
  const { data: reviewStats } = useQuery({
    ...reviewStatsQueryOptions(productId),
    initialData: initialReviewStats,
    initialDataUpdatedAt,
  });

  if (isProductLoading && !productData) return <PageSkeleton />;
  if (isProductError || !productData) return <section className="container mx-auto p-6 text-center"><p className="text-lg font-semibold text-rose-600">{t("product.loadError")}</p></section>;

  const images = useMemo(() => {
    if (Array.isArray(productData.image)) return productData.image.filter(Boolean);
    return [productData.image].filter(Boolean);
  }, [productData.image]);

  const productName = getLocalizedProductName(productData, i18n.language);

  return (
    <main className="container mx-auto p-4 pb-4 text-slate-900 font-medium">
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 uppercase">
        <span className="hover:text-pink-600">{typeof productData.brand === 'object' ? productData.brand?.name : productData.brand}</span>
        <span>/</span>
        <span className="font-bold text-slate-900 break-words line-clamp-1">{productName}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="relative min-w-0">
          <div className="absolute left-2 top-2 z-10">
            <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase">{t("product.bestseller")}</span>
          </div>
          <ProductGallery images={images} productName={productName} />
        </div>

        <aside className="space-y-6">
          <Badge />
          <h1 className="text-xl font-bold lg:text-3xl leading-tight break-words">{productName}</h1>
          <RatingSummary
            reviewStats={reviewStats ?? { average: 0, count: 0 }}
            productName={productName}
          />
          <Divider />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <PriceBlock label={t("product.bulkPrice")} amount={pricewithDiscount(productData.bulkPrice ?? productData.price, productData.discount ?? 0)} baseAmount={productData.bulkPrice ?? productData.price} discount={productData.discount} />
            <PriceBlock label={t("product.sellingPrice")} amount={pricewithDiscount(productData.price, productData.discount ?? 0)} baseAmount={productData.price} discount={productData.discount} />
            <div className="flex-none shadow-[0_0_12px_rgba(244,114,182,0.4)] rounded-lg"><AddToCartButton data={productData} /></div>
          </div>
          <div className="flex items-center gap-2 bg-pink-50 border border-pink-100 p-2.5 rounded text-xs text-pink-800 font-semibold"><span>✓ {t("product.authentic")}</span></div>
          <Divider />
          <WhyShopWithUs />
        </aside>
      </div>

      {/* GAP FIXED: Removed pb-32 mb-24 from here */}
      <div className="mt-10 w-full border-t border-slate-200 pt-8">
        <DescriptionBlock product={productData} />
      </div>

      <section id="reviews" className="mt-8 scroll-mt-24 border-t border-slate-200 pt-6 pb-2">
        <ReviewsSection productId={productId} productName={productName} />
      </section>
    </main>
  );
}

function Badge() {
  const { t } = useTranslation();
  return (
    <span className="inline-flex rounded-full bg-pink-100 border border-pink-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-pink-700">
      {t("product.fastDelivery")}
    </span>
  );
}
function RatingSummary({ reviewStats, productName }) {
  const { t } = useTranslation();
  const count = Number(reviewStats?.count ?? 0) || 0;
  const average = Number(reviewStats?.average ?? 0);

  if (count <= 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-600">
          {t("product.reviews.noReviewsProduct")}
        </p>
        <button
          type="button"
          onClick={() => {
            document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })
            window.dispatchEvent(new CustomEvent('essentialist:open-review-modal'))
          }}
          className="inline-flex text-sm font-semibold text-pink-600 hover:text-pink-700 underline-offset-2 hover:underline"
        >
          {t("product.reviews.writeFirst")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <ReadOnlyStars value={average} />
        <div className="flex items-baseline gap-2 text-sm">
          <span className="text-2xl font-bold text-slate-900">{average.toFixed(1)}</span>
          <span className="text-slate-500">/ 5</span>
          <span className="text-slate-600">
            ({t("product.reviews.count", { count })})
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })
          window.dispatchEvent(new CustomEvent('essentialist:open-review-modal'))
        }}
        className="inline-flex text-sm font-medium text-pink-600 hover:text-pink-700 underline-offset-2 hover:underline"
      >
        {t("product.reviews.seeOrAdd", { productName })}
      </button>
    </div>
  );
}
function PriceBlock({ label, amount, baseAmount, discount }) {
  return <div className="flex flex-col gap-1"><h2 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest">{label}</h2><span className="text-xl font-bold text-slate-900 sm:text-2xl">{FCFA(amount)}</span>{discount > 0 && <div className="flex items-center gap-1 text-[10px]"><span className="text-slate-400 line-through">{FCFA(baseAmount)}</span><span className="text-pink-500 font-bold">-{discount}%</span></div>}</div>;
}
function DescriptionBlock({ product }) {
  const { t } = useTranslation();
  const hasKeyFeatures = Array.isArray(product.keyFeatures) && product.keyFeatures.length > 0;
  const formattedDescription = formatProductDescription(
    product.description,
    t("product.noDescription"),
  );
  return (
    <div className="space-y-12">
      {hasKeyFeatures && (
        <section>
          <div className="mb-8 inline-block border-b-4 border-pink-500 pb-1"><h3 className="text-2xl font-bold">{t("product.whatStandsOut")}</h3></div>
          <div className="grid gap-6 md:grid-cols-3">{product.keyFeatures.map((f, i) => (<div key={i} className="p-6 rounded-xl border border-pink-100 bg-pink-50/30 shadow-sm"><h4 className="font-bold mb-2 text-pink-900">{f.title || f}</h4></div>))}</div>
        </section>
      )}
      <section>
        <div className="mb-6 inline-block border-b-4 border-pink-500 pb-1"><h3 className="text-2xl font-bold text-gray-900">{t("product.productDescription")}</h3></div>
        <div
          className="product-description-content w-full max-w-none text-base text-left"
          dangerouslySetInnerHTML={{ __html: formattedDescription }}
        />
      </section>
      {(product.specifications || product.unit) && (
        <section className="space-y-6">
          <div className="mb-2 inline-block border-b-4 border-pink-500 pb-1"><h3 className="text-2xl font-bold text-slate-900">{t("product.productDetails")}</h3></div>
          <div className="grid gap-4 text-sm text-slate-700">{[product.specifications, product.unit].filter(Boolean).map((detail, i) => (<div key={i} className="flex items-start gap-3"><div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-[10px]">✓</div><div className="pt-0.5">{typeof detail === 'object' ? JSON.stringify(detail) : detail}</div></div>))}</div>
        </section>
      )}
    </div>
  );
}
function WhyShopWithUs() {
  const { t } = useTranslation();
  const perks = [
    { titleKey: "product.perks.fastDelivery", icon: "/assets/minute_delivery.jpeg" },
    { titleKey: "product.perks.bestPrices", icon: "/assets/Best_Prices_Offers.png" },
    {
      titleKey: "product.perks.authenticProducts",
      icon: "https://d2ati23fc66y9j.cloudfront.net/ubuycom-v1/images/ubuy-seal-authentic.png.webp",
    },
  ];
  return (
    <div className="grid gap-3">
      {perks.map((p) => {
        const title = t(p.titleKey);
        return (
          <div key={p.titleKey} className="flex items-center gap-3 p-2 rounded-lg border border-slate-100 bg-white">
            <img src={p.icon} alt={title} className="h-10 w-10 object-cover rounded" />
            <div>
              <h3 className="font-bold text-slate-800 text-xs">{title}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
function PageSkeleton() { return <div className="container mx-auto p-10 animate-pulse bg-slate-50 h-screen rounded-xl" />; }