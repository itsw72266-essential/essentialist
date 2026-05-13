// // client/src/app/[category]/[subCategory]/SubCategoryClientBlock.jsx
// "use client";

// import React, { useMemo } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { useQuery } from "@tanstack/react-query";
// import CardProduct from "../../../components/CardProduct";
// import { valideURLConvert } from "../../../utils/valideURLConvert";
// import SummaryApi, { callSummaryApi } from "@/common/SummaryApi";

// const PAGE_SIZE = 8;

// const subCategoryBestTitles = {
//   Foundation: "Transfer Proof Foundation For Masks",
//   "Foundation Makeup": "Foundation Shade Finder Kit",
//   "Liquid Foundation": "Lightweight Liquid Foundation For Acne Prone Skin",
//   "Powder Foundation": "Buildable Powder Foundation For Mature Skin",
//   "Stick foundation": "Stick Foundation For Oily Skin",
//   "Total Control Drop Foundation": "Drop Foundation Full Coverage Adjustable",
//   "Foundation Primers": "Gripping Primer For Long Wear Makeup",
//   "Face Primer": "Pore Blurring Primer For Oily Skin",
//   "Tinted Moisturizer": "Tinted Moisturizer With SPF For Oily Skin",
//   "Setting Spray": "Alcohol Free Setting Spray For Dry Skin",
//   "SETTING POWDER": "No Flashback Setting Powder",
//   "All Setting Powder": "Translucent Setting Powder For Oily Skin",
//   Concealer: "Full Coverage Concealer For Dark Circles",
//   "Concealers & Neutralizers": "Peach Color Corrector For Dark Circles",
//   "Dark circle concealer": "Orange Concealer For Dark Circles",
//   "Blush Makeup": "Cream Blush For Mature Skin That Doesn’t Settle",
//   "All Blush": "Best Affordable Blush For Fair Skin",
//   "High Definition Blush": "HD Cream Blush For Camera Ready Look",
//   "Highlighters & Luminizers": "Subtle Highlighter For Mature Skin",
//   Illuminator: "Liquid Illuminator Under Foundation",
//   "Liquid highlighter": "Dewy Liquid Highlighter For Natural Glow",
//   Bronzy: "Subtle Bronzy Makeup Look Products",
//   "Bronzy Powder": "Warm Bronzer Powder For Olive Skin",
//   "Matte bronzer": "Matte Bronzer For Fair Cool Undertone",
//   "Eye Makeup": "Everyday Eye Makeup Kit For Beginners",
//   "Eye Shadow": "Neutral Eyeshadow For Blue Eyes",
//   "Eye Shadow Palette": "Mini Eyeshadow Palette For Travel",
//   Eyeliner: "Smudge Proof Eyeliner For Oily Lids",
//   Kajal: "Long Lasting Kajal For Watery Eyes",
//   Mascara: "Tubing Mascara For Short Lashes",
//   "Eye Cream & Treatment": "Eye Cream For Dark Circles And Puffiness Under $30",
//   "EYE CREAM": "Fragrance Free Eye Cream For Sensitive Skin",
//   "Eye Serum": "Retinol Eye Serum For Fine Lines",
//   "Eye brow cake powder": "Eyebrow Cake Powder For Sparse Brows",
//   "Eye Brow Enhancers": "Tinted Brow Gel For Thin Eyebrows",
//   "Lip Makeup": "Lip Makeup Set Gift For Her",
//   Lipstick: "Transfer Proof Lipstick For Weddings",
//   "Liquid Lipstick": "Comfortable Liquid Lipstick Non Drying",
//   "Matte Lip Sticks": "Matte Lipstick Set Nude",
//   "Lip Gloss": "Non Sticky Lip Gloss Set",
//   "Lip Lacquer": "High Shine Lip Lacquer Long Wear",
//   "Lip Liner": "Waterproof Lip Liner Nude Shades",
//   "Lip Plumper": "Cinnamon Lip Plumper Gloss",
//   "Lip Tint": "Long Lasting Lip Tint Waterproof",
//   "Lip Crayon": "Matte Lip Crayon Non Drying",
//   "Lip cream": "Long Lasting Lip Cream Matte Finish",
//   "Lip Cream Pallette": "Lip Cream Palette Professional",
//   "Lip/eye liner pencil 3 in 1": "3 In 1 Lip Eye Liner Pencil Set",
//   "Makeup Palettes": "All In One Makeup Palette With Mirror",
//   "Makeup Sets": "Beginner Makeup Set With Bag",
//   "Makeup Kits": "Travel Makeup Kit Essentials",
//   "Face Makeup": "Beginner Face Makeup Kit With Brushes",
//   Compact: "Compact Powder For Oily Skin Long Lasting",
//   "Loose Powder": "Talc Free Loose Setting Powder",
// };

// function safeArray(value) {
//   return Array.isArray(value) ? value : [];
// }

// function bestSeoTitleForSubcategory(subCategoryName = "") {
//   if (subCategoryBestTitles[subCategoryName]) return subCategoryBestTitles[subCategoryName];
//   const key = Object.keys(subCategoryBestTitles).find(
//     (k) => k.toLowerCase() === String(subCategoryName).toLowerCase(),
//   );
//   if (key) return subCategoryBestTitles[key];
//   return `${subCategoryName} buy online in Cameroon`;
// }

// async function fetchSubCategoriesForCategory(categoryId) {
//   try {
//     const response = await callSummaryApi(SummaryApi.getSubCategory, {
//       payload: { categoryId },
//     });
//     const list = safeArray(response?.data || response);
//     return list.filter((sub) =>
//       safeArray(sub?.category).some((cat) => String(cat?._id) === String(categoryId)),
//     );
//   } catch (error) {
//     throw new Error("Unable to load subcategories at the moment.");
//   }
// }

// async function fetchProductsForSubCategory({ categoryId, subCategoryId, page }) {
//   try {
//     const response = await callSummaryApi(SummaryApi.getProductByCategoryAndSubCategory, {
//       payload: {
//         categoryId,
//         subCategoryId,
//         page,
//         limit: PAGE_SIZE,
//       },
//     });

//     if (!response?.success) {
//       return { products: [], totalCount: 0 };
//     }

//     return {
//       products: safeArray(response.data),
//       totalCount: Number(response.totalCount || 0),
//     };
//   } catch (error) {
//     throw new Error("Unable to load products right now.");
//   }
// }

// function StructuredData({ categorySlug, subCategorySlug, subCategoryName, products }) {
//   const url = `https://www.esmakeupstore.com/${categorySlug}/${subCategorySlug}`;

//   const breadcrumbJsonLd = {
//     "@context": "https://schema.org",
//     "@type": "BreadcrumbList",
//     itemListElement: [
//       { "@type": "ListItem", position: 1, name: "Home", item: "https://www.esmakeupstore.com/" },
//       { "@type": "ListItem", position: 2, name: "Products", item: "https://www.esmakeupstore.com/product" },
//       { "@type": "ListItem", position: 3, name: subCategoryName, item: url },
//     ],
//   };

//   const collectionJsonLd = {
//     "@context": "https://schema.org",
//     "@type": "CollectionPage",
//     name: `${subCategoryName} - EssentialistMakeupStore`,
//     url,
//     isPartOf: {
//       "@type": "WebSite",
//       name: "EssentialistMakeupStore",
//       url: "https://www.esmakeupstore.com/",
//     },
//   };

//   const itemListJsonLd =
//     products.length > 0
//       ? {
//           "@context": "https://schema.org",
//           "@type": "ItemList",
//           name: `${subCategoryName} Products`,
//           numberOfItems: products.length,
//           itemListElement: products.map((product, idx) => ({
//             "@type": "ListItem",
//             position: idx + 1,
//             item: {
//               "@type": "Product",
//               name: product?.name,
//               image: Array.isArray(product?.image) ? product.image[0] : product?.image,
//               offers: {
//                 "@type": "Offer",
//                 price: String(product?.price || ""),
//                 priceCurrency: "XAF",
//                 availability:
//                   Number(product?.stock) > 0
//                     ? "https://schema.org/InStock"
//                     : "https://schema.org/OutOfStock",
//               },
//             },
//           })),
//         }
//       : null;

//   return (
//     <>
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
//       />
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
//       />
//       {itemListJsonLd && (
//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
//         />
//       )}
//     </>
//   );
// }

// export default function SubCategoryClientBlock({
//   categorySlug,
//   subCategorySlug,
//   categoryId,
//   subCategoryId,
//   page = 1,
//   categoryNameFromSlug,
//   subCategoryNameFromSlug,
// }) {
//   const {
//     data: subCategories = [],
//     isLoading: isSubCategoriesLoading,
//     isError: isSubCategoriesError,
//     error: subCategoriesError,
//     refetch: refetchSubCategories,
//   } = useQuery({
//     queryKey: ["subcategories-by-category", categoryId],
//     queryFn: () => fetchSubCategoriesForCategory(categoryId),
//     enabled: Boolean(categoryId),
//     staleTime: 5 * 60_000,
//     refetchOnWindowFocus: false,
//   });

//   const {
//     data: productsPayload,
//     isLoading: isProductsLoading,
//     isFetching: isProductsFetching,
//     isError: isProductsError,
//     error: productsError,
//     refetch: refetchProducts,
//   } = useQuery({
//     queryKey: ["products-by-category-subcategory", categoryId, subCategoryId, page],
//     queryFn: () => fetchProductsForSubCategory({ categoryId, subCategoryId, page }),
//     enabled: Boolean(categoryId && subCategoryId),
//     keepPreviousData: true,
//     staleTime: 120_000,
//     refetchOnWindowFocus: false,
//   });

//   const products = productsPayload?.products ?? [];
//   const totalCount = Number(productsPayload?.totalCount || 0);
//   const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
//   const hasMore = page < totalPages;

//   const activeSubCategory = useMemo(
//     () => subCategories.find((item) => String(item?._id) === String(subCategoryId)) || null,
//     [subCategories, subCategoryId],
//   );

//   const resolvedSubCategoryName = activeSubCategory?.name || subCategoryNameFromSlug || "Subcategory";
//   const resolvedCategoryName =
//     (Array.isArray(activeSubCategory?.category)
//       ? activeSubCategory?.category?.[0]?.name
//       : undefined) || categoryNameFromSlug || "Category";

//   const h1Commercial = bestSeoTitleForSubcategory(resolvedSubCategoryName);
//   const basePath = `/${categorySlug}/${subCategorySlug}`;
//   const nextHref = hasMore ? `${basePath}?page=${page + 1}` : null;

//   const combinedErrorMessage =
//     productsError?.message ||
//     subCategoriesError?.message ||
//     "Something went wrong while loading this collection.";

//   return (
//     <>
//       <StructuredData
//         categorySlug={categorySlug}
//         subCategorySlug={subCategorySlug}
//         subCategoryName={resolvedSubCategoryName}
//         products={products}
//       />

//       <style
//         dangerouslySetInnerHTML={{
//           __html: `
//           .scrollbarCustom {
//             scrollbar-width: thin;
//             scrollbar-color: #cbd5e1 transparent;
//           }
//           .scrollbarCustom::-webkit-scrollbar { height: 8px; width: 8px; }
//           .scrollbarCustom::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
//           .scrollbarCustom::-webkit-scrollbar-track { background: transparent; }
//         `,
//         }}
//       />

//       <main className="sticky top-24 lg:top-20">
//         <section className="container sticky top-24 mx-auto grid grid-cols-[90px,1fr] md:grid-cols-[200px,1fr] lg:grid-cols-[380px,1fr]">
//           <aside
//             className="min-h-[88vh] max-h-[88vh] overflow-y-scroll grid gap-1 shadow-md scrollbarCustom bg-white py-2"
//             aria-label="Subcategories"
//           >
//             {isSubCategoriesLoading ? (
//               <div className="p-4 text-center text-sm text-gray-500">Loading collections…</div>
//             ) : isSubCategoriesError ? (
//               <div className="flex flex-col items-center justify-center gap-3 p-4 text-center text-sm text-red-600">
//                 <p>{combinedErrorMessage}</p>
//                 <button
//                   type="button"
//                   onClick={() => refetchSubCategories()}
//                   className="inline-flex items-center justify-center rounded-lg border border-red-600 px-4 py-2 text-red-600 hover:bg-red-50 transition"
//                 >
//                   Retry
//                 </button>
//               </div>
//             ) : subCategories.length > 0 ? (
//               subCategories.map((sub) => {
//                 const isActive = String(sub?._id) === String(subCategoryId);
//                 const subBest = bestSeoTitleForSubcategory(sub?.name);
//                 const link = `/${categorySlug}/${valideURLConvert(sub?.name)}-${sub?._id}`;

//                 return (
//                   <Link
//                     key={sub?._id}
//                     href={link}
//                     title={subBest}
//                     scroll
//                     className={`group relative w-full p-2 lg:flex items-center lg:w-full lg:h-16 box-border lg:gap-4 border-b transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-100 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
//                       isActive
//                         ? "bg-secondary-200/10 text-secondary-100 border-secondary-200"
//                         : "hover:bg-secondary-200/5"
//                     }`}
//                     aria-current={isActive ? "page" : undefined}
//                     prefetch={false}
//                   >
//                     <div className="relative flex h-full w-full items-center justify-center lg:w-12">
//                       <Image
//                         src={sub?.image || "/placeholder.png"}
//                         alt={sub?.name || "Subcategory"}
//                         className="w-14 lg:h-14 lg:w-12 h-full object-scale-down"
//                         loading="lazy"
//                         width={56}
//                         height={56}
//                       />
//                     </div>
//                     <p
//                       className={`-mt-6 lg:mt-0 text-xs text-center lg:text-left lg:text-base sm:text-sm font-semibold py-6 lg:py-0 transition-colors duration-200 ${
//                         isActive ? "text-secondary-100" : "text-primary"
//                       }`}
//                     >
//                       {sub?.name}
//                     </p>
//                     {!isActive && (
//                       <span className="pointer-events-none absolute inset-y-2 left-0 w-1 rounded-full bg-transparent group-focus-visible:bg-secondary-100 group-hover:bg-secondary-100/40 transition-colors" />
//                     )}
//                     {isActive && (
//                       <span className="pointer-events-none absolute inset-y-2 left-0 w-1 rounded-full bg-secondary-100" />
//                     )}
//                   </Link>
//                 );
//               })
//             ) : (
//               <div className="p-4 text-center text-gray-500 text-sm">No subcategories found</div>
//             )}
//           </aside>

//           <section className="sticky top-20">
//             <header className="bg-white shadow-md p-4 z-10">
//               <div className="flex items-center justify-between gap-4">
//                 <div>
//                   <h1 className="font-semibold">{h1Commercial}</h1>
//                   <p className="text-xs text-gray-500 mt-1">
//                     {resolvedSubCategoryName} in {resolvedCategoryName}
//                   </p>
//                 </div>
//                 {isProductsFetching && products.length > 0 && (
//                   <span className="text-xs text-gray-500 animate-pulse">Refreshing…</span>
//                 )}
//               </div>
//               {products.length > 0 && (
//                 <p className="text-sm text-gray-600 mt-1">
//                   {Math.min(products.length, PAGE_SIZE)} of {totalCount} products
//                 </p>
//               )}
//             </header>

//             <section
//               key={`${subCategoryId}-${page}`}
//               className="min-h-[80vh] max-h-[80vh] overflow-y-auto relative"
//             >
//               {isProductsLoading && products.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-full p-8 text-center">
//                   <div className="text-gray-400 mb-4">
//                     <svg
//                       className="mx-auto h-16 w-16 animate-spin"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       aria-hidden="true"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={1.5}
//                         d="M12 3v3m6.364 1.636l-2.121 2.121M21 12h-3m-1.636 6.364l-2.121-2.121M12 21v-3m-6.364-1.636l2.121-2.121M3 12h3m1.636-6.364l2.121 2.121"
//                       />
//                     </svg>
//                   </div>
//                   <p className="text-gray-500">Loading products…</p>
//                 </div>
//               ) : isProductsError ? (
//                 <div className="flex flex-col items-center justify-center h-full p-8 text-center">
//                   <div className="text-4xl mb-3">😞</div>
//                   <h2 className="text-lg font-medium text-gray-900 mb-2">Unable to load products</h2>
//                   <p className="text-gray-500 mb-4">{combinedErrorMessage}</p>
//                   <button
//                     onClick={() => refetchProducts()}
//                     type="button"
//                     className="inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 transition-colors"
//                   >
//                     Try Again
//                   </button>
//                 </div>
//               ) : products.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-full p-8 text-center">
//                   <div className="text-gray-400 mb-4">
//                     <svg
//                       className="w-16 h-16 mx-auto"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                       aria-hidden="true"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={1}
//                         d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V9M16 13v2a2 2 0 01-2 2h-2m0 0H9m3 0v-2M9 13h2"
//                       />
//                     </svg>
//                   </div>
//                   <h2 className="text-lg font-medium text-gray-900 mb-2">No products found</h2>
//                   <p className="text-gray-500">There are no products in this category yet.</p>
//                 </div>
//               ) : (
//                 <>
//                   <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 gap-4" role="list">
//                     {products.map((product) => (
//                       <li key={product?._id}>
//                         <CardProduct data={product} />
//                       </li>
//                     ))}
//                   </ul>

//                   {hasMore && (
//                     <nav className="p-4 text-center" aria-label="Pagination">
//                       <Link
//                         href={nextHref}
//                         className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
//                         prefetch={false}
//                       >
//                         Load More Products
//                       </Link>
//                     </nav>
//                   )}
//                 </>
//               )}
//             </section>
//           </section>
//         </section>
//       </main>
//     </>
//   );
// }








// client/src/app/[category]/[subCategory]/SubCategoryClientBlock.jsx
"use client";

import React, { useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import CardProduct from "../../../components/CardProduct";
import { valideURLConvert } from "../../../utils/valideURLConvert";
import SummaryApi, { callSummaryApi } from "@/common/SummaryApi";

const PAGE_SIZE = 12;

const subCategoryBestTitles = {
  Foundation: "Transfer Proof Foundation For Masks",
  "Foundation Makeup": "Foundation Shade Finder Kit",
  "Liquid Foundation": "Lightweight Liquid Foundation For Acne Prone Skin",
  "Powder Foundation": "Buildable Powder Foundation For Mature Skin",
  "Stick foundation": "Stick Foundation For oily Skin",
  "Total Control Drop Foundation": "Drop Foundation Full Coverage Adjustable",
  "Foundation Primers": "Gripping Primer For Long Wear Makeup",
  "Face Primer": "Pore Blurring Primer For Oily Skin",
  "Tinted Moisturizer": "Tinted Moisturizer With SPF For Oily Skin",
  "Setting Spray": "Alcohol Free Setting Spray For Dry Skin",
  "SETTING POWDER": "No Flashback Setting Powder",
  "All Setting Powder": "Translucent Setting Powder For Oily Skin",
  Concealer: "Full Coverage Concealer For Dark Circles",
  "Concealers & Neutralizers": "Peach Color Corrector For Dark Circles",
  "Dark circle concealer": "Orange Concealer For Dark Circles",
  "Blush Makeup": "Cream Blush For Mature Skin",
  "All Blush": "Best Affordable Blush For Fair Skin",
  "High Definition Blush": "HD Cream Blush For Camera Ready Look",
  "Highlighters & Luminizers": "Subtle Highlighter For Mature Skin",
  Illuminator: "Liquid Illuminator Under Foundation",
  "Liquid highlighter": "Dewy Liquid Highlighter For Natural Glow",
  Bronzy: "Subtle Bronzy Makeup Look Products",
  "Bronzy Powder": "Warm Bronzer Powder For Olive Skin",
  "Matte bronzer": "Matte Bronzer For Fair Cool Undertone",
  "Eye Makeup": "Everyday Eye Makeup Kit For Beginners",
  "Eye Shadow": "Neutral Eyeshadow For Blue Eyes",
  "Eye Shadow Palette": "Mini Eyeshadow Palette For Travel",
  Eyeliner: "Smudge Proof Eyeliner For Oily Lids",
  Kajal: "Long Lasting Kajal For Watery Eyes",
  Mascara: "Tubing Mascara For Short Lashes",
  "Eye Cream & Treatment": "Eye Cream for Dark Circles",
  "Lip Makeup": "Lip Makeup Set Gift For Her",
  Lipstick: "Transfer Proof Lipstick For Weddings",
  "Liquid Lipstick": "Comfortable Liquid Lipstick Non Drying",
  "Matte Lip Sticks": "Matte Lipstick Set Nude",
  "Lip Gloss": "Non Sticky Lip Gloss Set",
  "Makeup Palettes": "All In One Makeup Palette With Mirror",
  "Makeup Sets": "Beginner Makeup Set With Bag",
  "Makeup Kits": "Travel Makeup Kit Essentials",
  "Face Makeup": "Beginner Face Makeup Kit With Brushes",
  Compact: "Compact Powder For Oily Skin Long Lasting",
  "Loose Powder": "Talc Free Loose Setting Powder",
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function bestSeoTitleForSubcategory(subCategoryName = "") {
  if (subCategoryBestTitles[subCategoryName]) return subCategoryBestTitles[subCategoryName];
  const key = Object.keys(subCategoryBestTitles).find(
    (k) => k.toLowerCase() === String(subCategoryName).toLowerCase()
  );
  if (key) return subCategoryBestTitles[key];
  return `${subCategoryName} Essentials Cameroon`;
}

async function fetchSubCategoriesForCategory(categoryId) {
  try {
    const response = await callSummaryApi(SummaryApi.getSubCategory, {
      payload: { categoryId },
    });
    const list = safeArray(response?.data || response);
    return list.filter((sub) =>
      safeArray(sub?.category).some((cat) => String(cat?._id) === String(categoryId))
    );
  } catch (error) {
    throw new Error("Unable to load subcategories.");
  }
}

function StructuredData({ categorySlug, subCategorySlug, subCategoryName, products }) {
  const url = `https://www.esmakeupstore.com/${categorySlug}/${subCategorySlug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.esmakeupstore.com/" },
      { "@type": "ListItem", position: 2, name: "Products", item: "https://www.esmakeupstore.com/product" },
      { "@type": "ListItem", position: 3, name: subCategoryName, item: url },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${subCategoryName} - Essentialist Makeup Store`,
    description: `Shop authentic ${subCategoryName} online in Cameroon. Fast delivery to Douala and Yaoundé with transparent FCFA pricing.`,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: "Essentialist Makeup Store",
      url: "https://www.esmakeupstore.com/",
    },
  };

  const itemListJsonLd = products.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${subCategoryName} Products`,
    numberOfItems: products.length,
    itemListElement: products.map((product, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Product",
        name: product?.name,
        image: Array.isArray(product?.image) ? product.image[0] : product?.image,
        brand: product?.brand ? { "@type": "Brand", name: product.brand } : { "@type": "Brand", name: "Essentialist" },
        offers: {
          "@type": "Offer",
          price: String(product?.price || ""),
          priceCurrency: "XAF",
          availability: Number(product?.stock) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          seller: { "@type": "Organization", name: "Essentialist Makeup Store" }
        },
      },
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      {itemListJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />}
    </>
  );
}

export default function SubCategoryClientBlock({
  categorySlug,
  subCategorySlug,
  categoryId,
  subCategoryId,
  page = 1,
  categoryNameFromSlug,
  subCategoryNameFromSlug,
}) {
  const mobileContentRef = useRef(null);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  useEffect(() => {
    if (mobileContentRef.current) {
      mobileContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [subCategoryId]);

  const { 
    data: subCategories = [], 
    isLoading: isSubCategoriesLoading, 
    isError: isSubCategoriesError, 
    error: subCategoriesError, 
    refetch: refetchSubCategories 
  } = useQuery({
    queryKey: ["subcategories-by-category", categoryId],
    queryFn: () => fetchSubCategoriesForCategory(categoryId),
    enabled: Boolean(categoryId),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
    refetch: refetchProducts,
  } = useInfiniteQuery({
    queryKey: ["products-infinite", categoryId, subCategoryId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await callSummaryApi(SummaryApi.getProductByCategoryAndSubCategory, {
        payload: { categoryId, subCategoryId, page: pageParam, limit: PAGE_SIZE },
      });
      if (!response?.success) return { data: [], totalCount: 0, nextPage: null };
      const totalPages = Math.ceil((response.totalCount || 0) / PAGE_SIZE);
      return {
        data: safeArray(response.data),
        totalCount: Number(response.totalCount || 0),
        nextPage: pageParam < totalPages ? pageParam + 1 : null,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: Boolean(categoryId && subCategoryId),
    staleTime: 120_000,
  });

  const allProducts = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const totalCount = data?.pages[0]?.totalCount || 0;

  const activeSubCategory = useMemo(
    () => subCategories.find((item) => String(item?._id) === String(subCategoryId)) || null,
    [subCategories, subCategoryId]
  );

  const resolvedSubCategoryName = activeSubCategory?.name || subCategoryNameFromSlug || "Subcategory";
  const resolvedCategoryName = (Array.isArray(activeSubCategory?.category) ? activeSubCategory?.category?.[0]?.name : undefined) || categoryNameFromSlug || "Category";
  const h1Commercial = bestSeoTitleForSubcategory(resolvedSubCategoryName);
  
  const combinedErrorMessage = productsError?.message || subCategoriesError?.message || "Something went wrong while loading this collection.";

  return (
    <>
      <StructuredData categorySlug={categorySlug} subCategorySlug={subCategorySlug} subCategoryName={resolvedSubCategoryName} products={allProducts} />

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbarCustom { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
        .scrollbarCustom::-webkit-scrollbar { height: 8px; width: 8px; }
        .scrollbarCustom::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
        .scrollbarCustom::-webkit-scrollbar-track { background: transparent; }
      `}} />

      {/* ======================================================== */}
      {/* MOBILE UI */}
      {/* ======================================================== */}
      <main className="sticky top-20 block lg:hidden bg-white">
        <section className="container mx-auto grid grid-cols-[90px,1fr] md:grid-cols-[200px,1fr]">
          <aside className="min-h-[88vh] max-h-[88vh] overflow-y-scroll grid gap-1 shadow-md scrollbarCustom bg-white py-2 border-r border-slate-100 z-20" aria-label="Subcategories">
            {isSubCategoriesLoading ? (
              <div className="p-4 text-center text-xs text-gray-500">Loading...</div>
            ) : isSubCategoriesError ? (
              <div className="p-4 text-center text-xs text-red-500"><button onClick={() => refetchSubCategories()}>Retry</button></div>
            ) : subCategories.length > 0 ? (
              subCategories.map((sub) => {
                const isActive = String(sub?._id) === String(subCategoryId);
                return (
                  <Link
                    key={sub?._id}
                    href={`/${categorySlug}/${valideURLConvert(sub?.name)}-${sub?._id}`}
                    scroll={false} 
                    prefetch={true} 
                    className={`group relative w-full p-2 flex flex-col items-center md:flex-row md:h-16 box-border md:gap-4 border-b transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                      isActive ? "bg-pink-50 text-pink-600 border-pink-200" : "hover:bg-pink-50/50 text-gray-600"
                    }`}
                  >
                    <div className="relative flex h-12 w-full items-center justify-center md:h-full md:w-12">
                      <Image src={sub?.image || "/placeholder.png"} alt={sub?.name || "Subcategory"} className="w-10 h-10 md:w-12 md:h-12 object-scale-down" loading="lazy" width={48} height={48} />
                    </div>
                    <p className={`text-[10px] text-center md:text-left md:text-sm font-semibold mt-1 md:mt-0 transition-colors duration-200 ${isActive ? "text-pink-600" : "text-slate-600"}`}>
                      {sub?.name}
                    </p>
                    {!isActive && <span className="pointer-events-none absolute inset-y-2 left-0 w-1 rounded-full bg-transparent group-focus-visible:bg-pink-500 group-hover:bg-pink-300/40 transition-colors" />}
                    {isActive && <span className="pointer-events-none absolute inset-y-2 left-0 w-1 rounded-full bg-pink-500" />}
                  </Link>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">No subcategories found</div>
            )}
          </aside>

          <section ref={mobileContentRef} className="min-h-[88vh] max-h-[88vh] overflow-y-auto scrollbarCustom bg-slate-50/30">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-10 border-b border-slate-100">
              <div className="flex items-center justify-between gap-2">
                <h1 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">{h1Commercial}</h1>
              </div>
              <p className="text-xs text-gray-500 mt-1">{totalCount} Items</p>
            </header>

            <div className="p-3">
              {isProductsLoading && allProducts.length === 0 ? (
                // PROPER MOBILE SKELETON (ZERO CLS)
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list">
                  {[...Array(4)].map((_, i) => (
                    <li key={i}><CardProduct isLoading={true} /></li>
                  ))}
                </ul>
              ) : isProductsError ? (
                <div className="text-center p-8"><p className="text-red-500 text-sm mb-2">Error loading products.</p><button onClick={() => refetchProducts()} className="bg-pink-500 text-white px-4 py-2 rounded text-xs font-bold">Retry</button></div>
              ) : allProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <h2 className="text-base font-medium text-gray-900 mb-2">No products found</h2>
                  <p className="text-gray-500 text-xs">There are no products in this category yet.</p>
                </div>
              ) : (
                <>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list">
                    {allProducts.map((product, index) => (
                      <li key={product?._id}>
                        <CardProduct data={product} priority={index < 4} />
                      </li>
                    ))}
                  </ul>

                  {hasNextPage && (
                    <nav className="p-4 text-center pb-24" aria-label="Pagination">
                      <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="inline-flex items-center justify-center px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 text-sm"
                      >
                        {isFetchingNextPage ? (
                           <span className="flex items-center gap-2">
                             <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             Loading...
                           </span>
                        ) : "Load More Products"}
                      </button>
                    </nav>
                  )}
                </>
              )}
            </div>
          </section>
        </section>
      </main>

      {/* ======================================================== */}
      {/* DESKTOP UI */}
      {/* ======================================================== */}
      <main className="hidden lg:flex flex-row container mx-auto px-4 gap-8 pb-20 pt-8">
        <aside className="w-72 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-pink-400">Collections</h2>
            <nav className="flex flex-col gap-1 max-h-[70vh] overflow-y-auto scrollbarCustom pr-2" aria-label="Subcategories">
              {isSubCategoriesLoading ? (
                <div className="animate-pulse space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-lg" />)}</div>
              ) : (
                subCategories.map((sub) => {
                  const isActive = String(sub?._id) === String(subCategoryId);
                  return (
                    <Link
                      key={sub._id}
                      href={`/${categorySlug}/${valideURLConvert(sub.name)}-${sub._id}`}
                      scroll={false} 
                      prefetch={true} 
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border ${
                        isActive ? "bg-pink-50 text-pink-600 border-pink-200 font-bold shadow-sm" : "bg-white border-transparent text-slate-600 hover:bg-pink-50 hover:text-pink-600"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                        <img src={sub.image || "/placeholder.png"} alt="" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-sm truncate">{sub.name}</span>
                    </Link>
                  );
                })
              )}
            </nav>
          </div>
        </aside>

        <section className="flex-grow">
          <header className="mb-10 flex items-end justify-between gap-4 border-b border-slate-100 pb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{h1Commercial}</h1>
              <p className="text-slate-500 font-medium">{resolvedSubCategoryName} in {categoryNameFromSlug}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-pink-50 text-pink-600 text-xs font-black px-4 py-2 rounded-full border border-pink-100 uppercase">{totalCount} Items</span>
            </div>
          </header>

          {isProductsLoading && allProducts.length === 0 ? (
            // PROPER DESKTOP SKELETON (ZERO CLS)
            <ul className="grid grid-cols-3 xl:grid-cols-4 gap-8" role="list">
              {[...Array(8)].map((_, i) => (
                <li key={i}><CardProduct isLoading={true} /></li>
              ))}
            </ul>
          ) : isProductsError ? (
            <div className="text-center py-20 bg-rose-50 rounded-3xl border border-rose-100"><p className="text-rose-600 font-bold mb-4">Error loading products.</p><button onClick={() => refetchProducts()} className="bg-rose-600 text-white px-8 py-3 rounded-full font-bold">Try Again</button></div>
          ) : allProducts.length === 0 ? (
            <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200"><p className="text-slate-500">No products found.</p></div>
          ) : (
            <>
              <ul className="grid grid-cols-3 xl:grid-cols-4 gap-8" role="list">
                {allProducts.map((p, index) => (
                  <li key={p._id} className="transition-transform hover:-translate-y-1 duration-300">
                    <CardProduct data={p} priority={index < 4} />
                  </li>
                ))}
              </ul>
              {hasNextPage && (
                <nav className="mt-16 text-center">
                  <button 
                    onClick={() => fetchNextPage()} 
                    disabled={isFetchingNextPage}
                    className="inline-flex items-center px-12 py-4 bg-pink-600 text-white font-black rounded-full hover:bg-pink-700 transition-all shadow-xl shadow-pink-200 uppercase text-xs disabled:opacity-50"
                  >
                    {isFetchingNextPage ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Loading...
                      </span>
                    ) : "Load More Products"}
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}