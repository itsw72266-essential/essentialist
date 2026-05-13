// 'use client';

// import React, { useEffect, useMemo, useState } from 'react';
// import { useSelector } from 'react-redux';
// import Link from 'next/link';
// import { valideURLConvert } from '../utils/valideURLConvert';
// import SummaryApi, { callSummaryApi } from '../common/SummaryApi';

// const fallbackBrands = [
//   'NYX',
//   'LA girl',
//   'ELF',
//   'SMASHBOX',
//   'BOBBI BROWN',
//   'TOO FACED',
//   'ESTEE LAUDER',
//   'MAC',
//   'CLINIC',
//   'ONE SIZE',
//   'JUVIA'
// ];

// const createBrandSlug = (brand) =>
//   brand.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

// const pickArray = (...candidates) => {
//   for (const candidate of candidates) {
//     if (Array.isArray(candidate)) return candidate;
//   }
//   return [];
// };

// const normalizeBrands = (payload) =>
//   pickArray(
//     payload,
//     payload?.data,
//     payload?.data?.data,
//     payload?.data?.brands,
//     payload?.data?.docs,
//     payload?.brands,
//     payload?.result,
//     payload?.rows
//   );

// const toBrandRecord = (brandLike) => {
//   if (!brandLike) return null;

//   if (typeof brandLike === 'string') {
//     return {
//       id: brandLike,
//       name: brandLike,
//       slug: createBrandSlug(brandLike)
//     };
//   }

//   const id = brandLike._id || brandLike.id || brandLike.value || null;
//   const name =
//     brandLike.name ||
//     brandLike.title ||
//     brandLike.label ||
//     brandLike.displayName ||
//     '';
//   const slug =
//     brandLike.slug ||
//     brandLike.handle ||
//     brandLike.urlKey ||
//     (name ? createBrandSlug(name) : '');

//   if (!id || !name || !slug) return null;

//   return {
//     id,
//     name,
//     slug,
//     isActive: typeof brandLike.isActive === 'boolean' ? brandLike.isActive : true
//   };
// };

// const SideBar = ({
//   isMobile = false,
//   onNavigate = () => {},
//   categoryData = [],
//   subCategoryData = [],
//   loadingCategory = false
// }) => {
//   const reduxCategoryData = useSelector((state) => state.product.allCategory) || [];
//   const reduxSubCategoryData = useSelector((state) => state.product.allSubCategory) || [];
//   const reduxLoadingCategory = useSelector((state) => state.product.loadingCategory);

//   const finalCategoryData = categoryData.length > 0 ? categoryData : reduxCategoryData;
//   const finalSubCategoryData = subCategoryData.length > 0 ? subCategoryData : reduxSubCategoryData;
//   const finalLoadingCategory =
//     typeof loadingCategory === 'boolean' ? loadingCategory : reduxLoadingCategory;

//   const [hydrated, setHydrated] = useState(false);
//   useEffect(() => {
//     setHydrated(true);
//   }, []);

//   const [brandState, setBrandState] = useState({
//     loading: true,
//     error: null,
//     data: []
//   });

//   useEffect(() => {
//     let isMounted = true;
//     const controller = new AbortController();

//     const fetchBrands = async () => {
//       try {
//         setBrandState({
//           loading: true,
//           error: null,
//           data: []
//         });

//         const response = await callSummaryApi(SummaryApi.getBrands, {
//           params: { limit: 500, sort: 'nameAsc' },
//           signal: controller.signal
//         });

//         const normalisedRaw = normalizeBrands(response) || [];
//         const brands =
//           normalisedRaw.length === 0
//             ? normalizeBrands(response?.data) || []
//             : normalisedRaw;

//         if (!isMounted) return;

//         setBrandState({
//           loading: false,
//           error: null,
//           data: brands
//         });
//       } catch (error) {
//         if (!isMounted || error?.name === 'AbortError') return;

//         setBrandState({
//           loading: false,
//           error,
//           data: []
//         });
//       }
//     };

//     fetchBrands();

//     return () => {
//       isMounted = false;
//       controller.abort();
//     };
//   }, []);

//   const resolvedBrands = useMemo(() => {
//     const source = brandState.data.length ? brandState.data : fallbackBrands;
//     return source
//       .map(toBrandRecord)
//       .filter(Boolean)
//       .sort((a, b) => a.name.localeCompare(b.name));
//   }, [brandState.data]);

//   const getSubcategoriesForCategory = useMemo(() => {
//     const subcatsByCat = {};
//     finalSubCategoryData.forEach((sub) => {
//       const categoryField = Array.isArray(sub.category) ? sub.category[0] : sub.category;
//       const catId = categoryField?._id || categoryField;
//       if (!catId) return;
//       if (!subcatsByCat[catId]) subcatsByCat[catId] = [];
//       subcatsByCat[catId].push(sub);
//     });
//     return (categoryId) => subcatsByCat[categoryId] || [];
//   }, [finalSubCategoryData]);

//   const baseClasses = isMobile
//     ? 'bg-white text-black w-full'
//     : 'bg-white shadow-lg rounded-lg w-full h-auto flex flex-col hidden md:block';

//   const headerClasses = isMobile
//     ? 'bg-pink-400 p-3 border-b border-purple-800'
//     : 'bg-gradient-to-r from-pink-300 to-pink-400 p-2';

//   const categoryItemClasses = isMobile
//     ? 'w-full px-4 py-3 flex items-center hover:bg-purple-50 transition-colors border-b border-gray-100'
//     : 'w-full px-6 py-3 flex items-center hover:bg-pink-50 transition-colors';

//   const subcategoryContainerClasses = isMobile
//     ? 'bg-white px-4 py-2'
//     : 'bg-gray-50 px-6 py-2';

//   const itemClasses = isMobile
//     ? 'text-sm text-black py-2 px-3 font-bold rounded hover:bg-pink-600 hover:text-white cursor-pointer transition-colors block'
//     : 'text-sm text-black py-1 px-2 rounded hover:bg-pink-100 hover:text-pink-600 cursor-pointer transition-colors';

//   const skeletonBlocks = useMemo(() => Array.from({ length: 8 }), []);
//   const brandSkeletonBlocks = useMemo(() => Array.from({ length: 9 }), []);

//   const SkeletonBlock = ({ index }) => (
//     <div key={`category-skeleton-${index}`} className="p-4 animate-pulse">
//       <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
//       <div className="h-4 bg-gray-200 rounded w-1/2 ml-3 mb-2" />
//       <div className="h-4 bg-gray-200 rounded w-2/3 ml-3" />
//     </div>
//   );

//   const BrandSkeleton = ({ index }) => (
//     <div
//       key={`brand-skeleton-${index}`}
//       className="h-4 rounded bg-gray-200 animate-pulse"
//       style={{ width: `${60 + (index % 4) * 8}%` }}
//     />
//   );

//   if (!hydrated) {
//     return (
//       <aside className={baseClasses}>
//         <div className={headerClasses}>
//           <h2 className="text-white font-bold text-lg uppercase tracking-wide">
//             Shop By Brand
//           </h2>
//         </div>
//         <div className={isMobile ? 'px-4 py-3' : 'px-6 py-4'}>
//           <div className="space-y-3">
//             {brandSkeletonBlocks.map((_, index) => (
//               <BrandSkeleton key={`brand-prehydrate-${index}`} index={index} />
//             ))}
//           </div>
//         </div>
//       </aside>
//     );
//   }

//   const showBrandSkeleton = brandState.loading;
//   const showBrandError =
//     !brandState.loading && !resolvedBrands.length && brandState.error;
//   const showCategorySkeleton = finalLoadingCategory;
//   const showCategoryEmpty = !finalLoadingCategory && !finalCategoryData.length;

//   return (
//     <aside className={baseClasses}>
//       <div className={headerClasses}>
//         <h2 className="text-white font-bold text-lg uppercase tracking-wide">
//           Shop By Brands
//         </h2>
//       </div>

//       <div className={isMobile ? 'px-4 py-3' : 'px-6 py-4'}>
//         {showBrandSkeleton ? (
//           <div className="space-y-3">
//             {brandSkeletonBlocks.map((_, index) => (
//               <BrandSkeleton key={`brand-skel-${index}`} index={index} />
//             ))}
//           </div>
//         ) : showBrandError ? (
//           <p className="text-sm text-gray-500">
//             {brandState.error?.message || 'Brands are unavailable right now.'}
//           </p>
//         ) : (
//           <ul className="space-y-1">
//             <li>
//               <Link
//                 href="/brands"
//                 prefetch
//                 onClick={onNavigate}
//                 className={`${itemClasses} font-bold`}
//               >
//                 All Brands
//               </Link>
//             </li>
//             {resolvedBrands.map((brand) => (
//               <li key={brand.id}>
//                 <Link
//                   href={`/brands/${brand.slug}`}
//                   prefetch
//                   onClick={onNavigate}
//                   className={itemClasses}
//                 >
//                   {brand.name}
//                   {!brand.isActive ? ' (inactive)' : ''}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       <div
//         className={`${headerClasses} ${
//           isMobile ? 'border-t border-purple-800' : 'border-t border-pink-300'
//         }`}
//       >
//         <h2 className="text-white font-bold text-lg uppercase tracking-wide">
//           Shop By Category
//         </h2>
//       </div>

//       <div className={isMobile ? '' : 'divide-y divide-gray-100'}>
//         {showCategorySkeleton ? (
//           skeletonBlocks.map((_, index) => <SkeletonBlock key={index} index={index} />)
//         ) : showCategoryEmpty ? (
//           <div className="p-4 text-sm text-gray-500">No categories found</div>
//         ) : (
//           finalCategoryData.map((category) => {
//             const subcategories = getSubcategoriesForCategory(category._id);
//             return (
//               <div key={category._id} className="overflow-hidden">
//                 <div className={categoryItemClasses}>
//                   <span className="font-bold text-black">{category.name}</span>
//                 </div>
//                 <div className={subcategoryContainerClasses}>
//                   {subcategories.length > 0 ? (
//                     <ul className={`space-y-1 py-2 ${isMobile ? 'pl-4' : ''}`}>
//                       {subcategories.map((subCat) => {
//                         const url = `/${valideURLConvert(category.name)}-${category._id}/${valideURLConvert(
//                           subCat.name
//                         )}-${subCat._id}`;

//                         return (
//                           <li key={subCat._id}>
//                             <Link
//                               href={url}
//                               prefetch
//                               onClick={onNavigate}
//                               className={itemClasses}
//                             >
//                               {subCat.name}
//                             </Link>
//                           </li>
//                         );
//                       })}
//                     </ul>
//                   ) : (
//                     <p
//                       className={`text-sm py-2 ${
//                         isMobile ? 'text-gray-400 pl-4' : 'text-gray-500'
//                       }`}
//                     >
//                       No subcategories available
//                     </p>
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </aside>
//   );
// };

// export default SideBar;


// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import { useQuery } from "@tanstack/react-query";

// import { valideURLConvert } from "@/utils/valideURLConvert";
// import SummaryApi, { callSummaryApi } from "@/common/SummaryApi";

// const fallbackBrands = [
//   "NYX",
//   "LA girl",
//   "ELF",
//   "SMASHBOX",
//   "BOBBI BROWN",
//   "TOO FACED",
//   "ESTEE LAUDER",
//   "MAC",
//   "CLINIC",
//   "ONE SIZE",
//   "JUVIA",
// ];

// const createBrandSlug = (brand) =>
//   brand.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

// const pickArray = (...candidates) => {
//   for (const candidate of candidates) {
//     if (Array.isArray(candidate)) return candidate;
//   }
//   return [];
// };

// const normalizeBrands = (payload) =>
//   pickArray(
//     payload,
//     payload?.data,
//     payload?.data?.data,
//     payload?.data?.brands,
//     payload?.data?.docs,
//     payload?.brands,
//     payload?.result,
//     payload?.rows
//   );

// const normalizeCollection = (payload) =>
//   pickArray(
//     payload,
//     payload?.data,
//     payload?.data?.data,
//     payload?.data?.docs,
//     payload?.docs,
//     payload?.rows,
//     payload?.result
//   );

// const toBrandRecord = (brandLike) => {
//   if (!brandLike) return null;

//   if (typeof brandLike === "string") {
//     return {
//       id: brandLike,
//       name: brandLike,
//       slug: createBrandSlug(brandLike),
//     };
//   }

//   const id = brandLike._id || brandLike.id || brandLike.value || null;
//   const name =
//     brandLike.name ||
//     brandLike.title ||
//     brandLike.label ||
//     brandLike.displayName ||
//     "";
//   const slug =
//     brandLike.slug ||
//     brandLike.handle ||
//     brandLike.urlKey ||
//     (name ? createBrandSlug(name) : "");

//   if (!id || !name || !slug) return null;

//   return {
//     id,
//     name,
//     slug,
//     isActive:
//       typeof brandLike.isActive === "boolean" ? brandLike.isActive : true,
//   };
// };

// const SideBar = ({
//   isMobile = false,
//   onNavigate = () => {},
//   categoryData = [],
//   subCategoryData = [],
//   loadingCategory,
// }) => {
//   const [hydrated, setHydrated] = useState(false);
//   useEffect(() => {
//     setHydrated(true);
//   }, []);

//   const {
//     data: fetchedCategories = [],
//     isLoading: categoriesLoading,
//   } = useQuery({
//     queryKey: ["categories", "sidebar"],
//     queryFn: async () => {
//       const response = await callSummaryApi(SummaryApi.getCategory, {
//         cache: "no-store",
//       });
//       return normalizeCollection(response);
//     },
//     staleTime: 5 * 60 * 1000,
//   });

//   const {
//     data: fetchedSubCategories = [],
//     isLoading: subCategoriesLoading,
//   } = useQuery({
//     queryKey: ["subcategories", "sidebar"],
//     queryFn: async () => {
//       const response = await callSummaryApi(SummaryApi.getSubCategory, {
//         payload: { limit: 1000 },
//         cache: "no-store",
//       });
//       return normalizeCollection(response);
//     },
//     staleTime: 5 * 60 * 1000,
//   });

//   const {
//     data: brandData = [],
//     isLoading: brandsLoading,
//   } = useQuery({
//     queryKey: ["brands", "sidebar"],
//     queryFn: async () => {
//       const response = await callSummaryApi(SummaryApi.getBrands, {
//         params: { limit: 500, sort: "nameAsc" },
//         cache: "no-store",
//       });
//       const normalized =
//         normalizeBrands(response) || normalizeBrands(response?.data) || [];
//       return normalized;
//     },
//     staleTime: 10 * 60 * 1000,
//   });

//   const finalCategoryData =
//     categoryData.length > 0 ? categoryData : fetchedCategories;
//   const finalSubCategoryData =
//     subCategoryData.length > 0 ? subCategoryData : fetchedSubCategories;
//   const finalLoadingCategory =
//     typeof loadingCategory === "boolean"
//       ? loadingCategory
//       : categoriesLoading || subCategoriesLoading;

//   const resolvedBrands = useMemo(() => {
//     const source = brandData.length ? brandData : fallbackBrands;
//     return source
//       .map(toBrandRecord)
//       .filter(Boolean)
//       .sort((a, b) => a.name.localeCompare(b.name));
//   }, [brandData]);

//   const getSubcategoriesForCategory = useMemo(() => {
//     const subcatsByCat = {};
//     finalSubCategoryData.forEach((sub) => {
//       const categoryField = Array.isArray(sub.category)
//         ? sub.category[0]
//         : sub.category;
//       const catId = categoryField?._id || categoryField;
//       if (!catId) return;
//       if (!subcatsByCat[catId]) subcatsByCat[catId] = [];
//       subcatsByCat[catId].push(sub);
//     });
//     return (categoryId) => subcatsByCat[categoryId] || [];
//   }, [finalSubCategoryData]);

//   const baseClasses = isMobile
//     ? "bg-white text-black w-full"
//     : "bg-white shadow-lg rounded-lg w-full h-auto flex flex-col hidden md:block";

//   const headerClasses = isMobile
//     ? "bg-pink-400 p-3 border-b border-purple-800"
//     : "bg-gradient-to-r from-pink-300 to-pink-400 p-2";

//   const categoryItemClasses = isMobile
//     ? "w-full px-4 py-3 flex items-center hover:bg-purple-50 transition-colors border-b border-gray-100"
//     : "w-full px-6 py-3 flex items-center hover:bg-pink-50 transition-colors";

//   const subcategoryContainerClasses = isMobile
//     ? "bg-white px-4 py-2"
//     : "bg-gray-50 px-6 py-2";

//   const itemClasses = isMobile
//     ? "text-sm text-black py-2 px-3 font-bold rounded hover:bg-pink-600 hover:text-white cursor-pointer transition-colors block"
//     : "text-sm text-black py-1 px-2 rounded hover:bg-pink-100 hover:text-pink-600 cursor-pointer transition-colors";

//   const skeletonBlocks = useMemo(() => Array.from({ length: 8 }), []);
//   const brandSkeletonBlocks = useMemo(() => Array.from({ length: 9 }), []);

//   const SkeletonBlock = ({ index }) => (
//     <div key={`category-skeleton-${index}`} className="p-4 animate-pulse">
//       <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
//       <div className="h-4 bg-gray-200 rounded w-1/2 ml-3 mb-2" />
//       <div className="h-4 bg-gray-200 rounded w-2/3 ml-3" />
//     </div>
//   );

//   const BrandSkeleton = ({ index }) => (
//     <div
//       key={`brand-skeleton-${index}`}
//       className="h-4 rounded bg-gray-200 animate-pulse"
//       style={{ width: `${60 + (index % 4) * 8}%` }}
//     />
//   );

//   if (!hydrated) {
//     return (
//       <aside className={baseClasses}>
//         <div className={headerClasses}>
//           <h2 className="text-white font-bold text-lg uppercase tracking-wide">
//             Shop By Brand
//           </h2>
//         </div>
//         <div className={isMobile ? "px-4 py-3" : "px-6 py-4"}>
//           <div className="space-y-3">
//             {brandSkeletonBlocks.map((_, index) => (
//               <BrandSkeleton key={`brand-prehydrate-${index}`} index={index} />
//             ))}
//           </div>
//         </div>
//       </aside>
//     );
//   }

//   const showBrandSkeleton = brandsLoading;
//   const showBrandError =
//     !brandsLoading && !resolvedBrands.length;

//   return (
//     <aside className={baseClasses}>
//       <div className={headerClasses}>
//         <h2 className="text-white font-bold text-lg uppercase tracking-wide">
//           Shop By Brands
//         </h2>
//       </div>

//       <div className={isMobile ? "px-4 py-3" : "px-6 py-4"}>
//         {showBrandSkeleton ? (
//           <div className="space-y-3">
//             {brandSkeletonBlocks.map((_, index) => (
//               <BrandSkeleton key={`brand-skel-${index}`} index={index} />
//             ))}
//           </div>
//         ) : showBrandError ? (
//           <p className="text-sm text-gray-500">
//             Brands are unavailable right now.
//           </p>
//         ) : (
//           <ul className="space-y-1">
//             <li>
//               <Link
//                 href="/brands"
//                 prefetch
//                 onClick={onNavigate}
//                 className={`${itemClasses} font-bold`}
//               >
//                 All Brands
//               </Link>
//             </li>
//             {resolvedBrands.map((brand) => (
//               <li key={brand.id}>
//                 <Link
//                   href={`/brands/${brand.slug}`}
//                   prefetch
//                   onClick={onNavigate}
//                   className={itemClasses}
//                 >
//                   {brand.name}
//                   {!brand.isActive ? " (inactive)" : ""}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       <div
//         className={`${headerClasses} ${
//           isMobile ? "border-t border-purple-800" : "border-t border-pink-300"
//         }`}
//       >
//         <h2 className="text-white font-bold text-lg uppercase tracking-wide">
//           Shop By Category
//         </h2>
//       </div>

//       <div className={isMobile ? "" : "divide-y divide-gray-100"}>
//         {finalLoadingCategory ? (
//           skeletonBlocks.map((_, index) => <SkeletonBlock key={index} index={index} />)
//         ) : finalCategoryData.length === 0 ? (
//           <div className="p-4 text-sm text-gray-500">No categories found</div>
//         ) : (
//           finalCategoryData.map((category) => {
//             const subcategories = getSubcategoriesForCategory(category._id);
//             return (
//               <div key={category._id} className="overflow-hidden">
//                 <div className={categoryItemClasses}>
//                   <span className="font-bold text-black">{category.name}</span>
//                 </div>
//                 <div className={subcategoryContainerClasses}>
//                   {subcategories.length > 0 ? (
//                     <ul className={`space-y-1 py-2 ${isMobile ? "pl-4" : ""}`}>
//                       {subcategories.map((subCat) => {
//                         const url = `/${valideURLConvert(category.name)}-${
//                           category._id
//                         }/${valideURLConvert(subCat.name)}-${subCat._id}`;

//                         return (
//                           <li key={subCat._id}>
//                             <Link
//                               href={url}
//                               prefetch
//                               onClick={onNavigate}
//                               className={itemClasses}
//                             >
//                               {subCat.name}
//                             </Link>
//                           </li>
//                         );
//                       })}
//                     </ul>
//                   ) : (
//                     <p
//                       className={`text-sm py-2 ${
//                         isMobile ? "text-gray-400 pl-4" : "text-gray-500"
//                       }`}
//                     >
//                       No subcategories available
//                     </p>
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </aside>
//   );
// };

// export default SideBar;



"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { valideURLConvert } from "@/utils/valideURLConvert";
import {
  useBrandsQuery,
  useCategoriesQuery,
  useSubCategoriesQuery,
} from "@/hooks/queries/useCatalogQueries";
import "@/lib/i18n";

// Local fallback if brand API returns empty
const fallbackBrands = [
  "NYX",
  "LA girl",
  "ELF",
  "SMASHBOX",
  "BOBBI BROWN",
  "TOO FACED",
  "ESTEE LAUDER",
  "MAC",
  "CLINIC",
  "ONE SIZE",
  "JUVIA",
];

const createBrandSlug = (brand) =>
  brand.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const pickArray = (...candidates) => {
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
};

const normalizeBrands = (payload) =>
  pickArray(
    payload,
    payload?.data,
    payload?.data?.data,
    payload?.data?.brands,
    payload?.data?.docs,
    payload?.brands,
    payload?.result,
    payload?.rows
  );

const normalizeCollection = (payload) =>
  pickArray(
    payload,
    payload?.data,
    payload?.data?.data,
    payload?.data?.docs,
    payload?.docs,
    payload?.rows,
    payload?.result
  );

const toBrandRecord = (brandLike) => {
  if (!brandLike) return null;

  if (typeof brandLike === "string") {
    return {
      id: brandLike,
      name: brandLike,
      slug: createBrandSlug(brandLike),
    };
  }

  const id = brandLike._id || brandLike.id || brandLike.value || null;
  const name =
    brandLike.name ||
    brandLike.title ||
    brandLike.label ||
    brandLike.displayName ||
    "";
  const slug =
    brandLike.slug ||
    brandLike.handle ||
    brandLike.urlKey ||
    (name ? createBrandSlug(name) : "");

  if (!id || !name || !slug) return null;

  return {
    id,
    name,
    slug,
    isActive:
      typeof brandLike.isActive === "boolean" ? brandLike.isActive : true,
  };
};

const SideBar = ({
  isMobile = false,
  onNavigate = () => {},
  categoryData = [],
  subCategoryData = [],
  loadingCategory,
}) => {
  const { t } = useTranslation();
  // Avoid hydration mismatch for suspense/unified initial paint
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Categories via React Query hook
  const {
    data: rqCategories = [],
    isLoading: categoriesLoading,
  } = useCategoriesQuery({
    enabled: typeof window !== "undefined",
    // keep your 5 min stale time similar to original
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    // Return as-is; normalizeCollection kept for safety if needed elsewhere
    select: (data) => normalizeCollection(data) || data || [],
    // Do not sync to Redux here if you prefer local-only; set to true to keep previous behavior
    syncToRedux: true,
  });

  // Subcategories via React Query hook
  const {
    data: rqSubCategories = [],
    isLoading: subCategoriesLoading,
  } = useSubCategoriesQuery({
    enabled: typeof window !== "undefined",
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    select: (data) => normalizeCollection(data) || data || [],
    syncToRedux: true,
  });

  // Brands via React Query hook
  const {
    data: rqBrands = [],
    isLoading: brandsLoading,
  } = useBrandsQuery({
    enabled: typeof window !== "undefined",
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    // Keep hook-returned structure; normalize to array of brand-like
    select: (data) => normalizeBrands(data) || data || [],
    syncToRedux: true,
  });

  // Prefer props when present, fallback to React Query data otherwise
  const finalCategoryData =
    Array.isArray(categoryData) && categoryData.length > 0
      ? categoryData
      : rqCategories;

  const finalSubCategoryData =
    Array.isArray(subCategoryData) && subCategoryData.length > 0
      ? subCategoryData
      : rqSubCategories;

  const finalLoadingCategory =
    typeof loadingCategory === "boolean"
      ? loadingCategory
      : categoriesLoading || subCategoriesLoading;

  // Prepare brands with fallback and sorting
  const resolvedBrands = useMemo(() => {
    const source = rqBrands && rqBrands.length ? rqBrands : fallbackBrands;
    return source
      .map(toBrandRecord)
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rqBrands]);

  // Build subcategory grouping per category
  const getSubcategoriesForCategory = useMemo(() => {
    const subcatsByCat = {};
    finalSubCategoryData.forEach((sub) => {
      const categoryField = Array.isArray(sub.category)
        ? sub.category[0]
        : sub.category;
      const catId = categoryField?._id || categoryField;
      if (!catId) return;
      if (!subcatsByCat[catId]) subcatsByCat[catId] = [];
      subcatsByCat[catId].push(sub);
    });
    return (categoryId) => subcatsByCat[categoryId] || [];
  }, [finalSubCategoryData]);

  // Styling classes preserved
  const baseClasses = isMobile
    ? "bg-white text-black w-full"
    : "bg-white shadow-lg rounded-lg w-full h-auto flex flex-col hidden md:block";

  const headerClasses = isMobile
    ? "bg-pink-400 p-3 border-b border-purple-800"
    : "bg-gradient-to-r from-pink-300 to-pink-400 p-2";

  const categoryItemClasses = isMobile
    ? "w-full px-4 py-3 flex items-center hover:bg-purple-50 transition-colors border-b border-gray-100"
    : "w-full px-6 py-3 flex items-center hover:bg-pink-50 transition-colors";

  const subcategoryContainerClasses = isMobile
    ? "bg-white px-4 py-2"
    : "bg-gray-50 px-6 py-2";

  const itemClasses = isMobile
    ? "text-sm text-black py-2 px-3 font-bold rounded hover:bg-pink-600 hover:text-white cursor-pointer transition-colors block"
    : "text-sm text-black py-1 px-2 rounded hover:bg-pink-100 hover:text-pink-600 cursor-pointer transition-colors";

  const skeletonBlocks = useMemo(() => Array.from({ length: 8 }), []);
  const brandSkeletonBlocks = useMemo(() => Array.from({ length: 9 }), []);

  const SkeletonBlock = ({ index }) => (
    <div key={`category-skeleton-${index}`} className="p-4 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-1/2 ml-3 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-2/3 ml-3" />
    </div>
  );

  const BrandSkeleton = ({ index }) => (
    <div
      key={`brand-skeleton-${index}`}
      className="h-4 rounded bg-gray-200 animate-pulse"
      style={{ width: `${60 + (index % 4) * 8}%` }}
    />
  );

  // Pre-hydration skeleton to avoid mismatch
  if (!hydrated) {
    return (
      <aside className={baseClasses}>
        <div className={headerClasses}>
          <h2 className="text-white font-bold text-lg uppercase tracking-wide">
            {t("sidebar.shopByBrand")}
          </h2>
        </div>
        <div className={isMobile ? "px-4 py-3" : "px-6 py-4"}>
          <div className="space-y-3">
            {brandSkeletonBlocks.map((_, index) => (
              <BrandSkeleton key={`brand-prehydrate-${index}`} index={index} />
            ))}
          </div>
        </div>
      </aside>
    );
  }

  const showBrandSkeleton = brandsLoading;
  const showBrandError = !brandsLoading && !resolvedBrands.length;

  return (
    <aside className={baseClasses}>
      <div className={headerClasses}>
        <h2 className="text-white font-bold text-lg uppercase tracking-wide">
          {t("sidebar.shopByBrands")}
        </h2>
      </div>

      <div className={isMobile ? "px-4 py-3" : "px-6 py-4"}>
        {showBrandSkeleton ? (
          <div className="space-y-3">
            {brandSkeletonBlocks.map((_, index) => (
              <BrandSkeleton key={`brand-skel-${index}`} index={index} />
            ))}
          </div>
        ) : showBrandError ? (
          <p className="text-sm text-gray-500">
            {t("sidebar.brandsUnavailable")}
          </p>
        ) : (
          <ul className="space-y-1">
            <li>
              <Link
                href="/brands"
                prefetch={false}
                onClick={onNavigate}
                className={`${itemClasses} font-bold`}
              >
                {t("sidebar.allBrands")}
              </Link>
            </li>
            {resolvedBrands.map((brand) => (
              <li key={brand.id}>
                <Link
                  href={`/brands/${brand.slug}`}
                  prefetch={false}
                  onClick={onNavigate}
                  className={itemClasses}
                >
                  {brand.name}
                  {!brand.isActive ? ` (${t("sidebar.inactive")})` : ""}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        className={`${headerClasses} ${
          isMobile ? "border-t border-purple-800" : "border-t border-pink-300"
        }`}
      >
        <h2 className="text-white font-bold text-lg uppercase tracking-wide">
          {t("sidebar.shopByCategory")}
        </h2>
      </div>

      <div className={isMobile ? "" : "divide-y divide-gray-100"}>
        {finalLoadingCategory ? (
          skeletonBlocks.map((_, index) => (
            <SkeletonBlock key={index} index={index} />
          ))
        ) : finalCategoryData.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">{t("sidebar.noCategories")}</div>
        ) : (
          finalCategoryData.map((category) => {
            const subcategories = getSubcategoriesForCategory(category._id);
            return (
              <div key={category._id} className="overflow-hidden">
                <div className={categoryItemClasses}>
                  <span className="font-bold text-black">{category.name}</span>
                </div>
                <div className={subcategoryContainerClasses}>
                  {subcategories.length > 0 ? (
                    <ul className={`space-y-1 py-2 ${isMobile ? "pl-4" : ""}`}>
                      {subcategories.map((subCat) => {
                        const url = `/${valideURLConvert(category.name)}-${
                          category._id
                        }/${valideURLConvert(subCat.name)}-${subCat._id}`;

                        return (
                          <li key={subCat._id}>
                            <Link
                              href={url}
                              prefetch={false}
                              onClick={onNavigate}
                              className={itemClasses}
                            >
                              {subCat.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p
                      className={`text-sm py-2 ${
                        isMobile ? "text-gray-400 pl-4" : "text-gray-500"
                      }`}
                    >
                      {t("sidebar.noSubcategories")}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default SideBar;
