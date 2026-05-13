// //client\src\app\brands\BrandsDirectoryClient.jsx
// 'use client'

// import { useEffect, useMemo } from 'react'
// import Link from 'next/link'
// import { useQuery } from '@tanstack/react-query'

// import BrandSearch from '../../components/BrandSearch'
// import { valideURLConvert } from '../../utils/valideURLConvert'
// import {
//   useBrandsQuery,
//   useCategoriesQuery,
//   useSubCategoriesQuery
// } from '@/hooks/queries/useCatalogQueries'
// import SummaryApi from '@/common/SummaryApi'
// import Axios from '@/utils/Axios'

// const SITE_URL = 'https://www.esmakeupstore.com/brands'
// const ROOT_URL = 'https://www.esmakeupstore.com'
// const SITE_NAME = 'Essentialist Makeup Store'
// const OG_IMAGE =
//   'https://www.esmakeupstore.com/assets/staymattebutnotflatpowderfoundationmain.jpg'
// const MAX_PRODUCTS_FOR_STRUCTURED_DATA = 20

// function useProductCatalogQuery({ enabled }) {
//   return useQuery({
//     queryKey: ['product-catalog'],
//     enabled,
//     queryFn: async () => {
//       const response = await Axios({
//         ...SummaryApi.getProduct,
//         data: {
//           page: 1,
//           limit: 500,
//           onlyActive: true,
//           include: ['brand', 'category', 'subCategory']
//         }
//       })

//       const payload = response?.data
//       const items =
//         payload?.items ||
//         payload?.products ||
//         payload?.data?.items ||
//         payload?.data?.products ||
//         payload?.data ||
//         []

//       if (!Array.isArray(items)) {
//         throw new Error('Unexpected product catalog response')
//       }

//       return items
//     },
//     staleTime: 5 * 60_000,
//     refetchOnWindowFocus: false,
//     retry: 1
//   })
// }

// // ---------- Helper utilities (unchanged) ----------

// function createBrandSlug(name = '') {
//   return name
//     .normalize('NFD')
//     .replace(/[\u0300-\u036f]/g, '')
//     .toLowerCase()
//     .trim()
//     .replace(/&/g, 'and')
//     .replace(/\s+/g, '-')
//     .replace(/[^a-z0-9-]/g, '')
//     .replace(/-+/g, '-')
//     .replace(/^-|-$/g, '')
// }

// function createProductSlug(product = {}) {
//   const fallbackName =
//     typeof product?.name === 'string' ? product.name.trim() : ''
//   const raw =
//     typeof product?.slug === 'string' && product.slug.trim()
//       ? product.slug.trim()
//       : typeof product?.handle === 'string' && product.handle.trim()
//         ? product.handle.trim()
//         : typeof product?.seoSlug === 'string' && product.seoSlug.trim()
//           ? product.seoSlug.trim()
//           : fallbackName
//             ? valideURLConvert(fallbackName)
//             : ''

//   if (!raw) return ''
//   if (product?._id && typeof product._id === 'string' && !raw.includes(product._id)) {
//     return `${raw}-${product._id}`
//   }
//   return raw
// }

// function FCFA(amount) {
//   if (typeof amount !== 'number' || Number.isNaN(amount)) return '—'
//   return `${amount.toLocaleString('en-US')} FCFA`
// }

// function extractSubCategory(product = {}) {
//   const candidate =
//     product?.subCategory ??
//     product?.subCategories ??
//     product?.subcategory ??
//     product?.sub_category ??
//     null

//   if (Array.isArray(candidate)) return candidate[0]
//   if (candidate) return candidate

//   if (product?.subCategoryId || product?.subcategoryId) {
//     return {
//       _id: product.subCategoryId || product.subcategoryId,
//       name:
//         product?.subCategoryName ||
//         product?.subcategoryName ||
//         product?.subcategory ||
//         ''
//     }
//   }

//   if (
//     product?.subCategoryName ||
//     product?.subcategoryName ||
//     product?.subcategory
//   ) {
//     return {
//       _id: null,
//       name:
//         product?.subCategoryName ||
//         product?.subcategoryName ||
//         product?.subcategory ||
//         ''
//     }
//   }

//   return null
// }

// function extractPrice(product = {}, role) {
//   const sources =
//     role === 'bulk'
//       ? [
//           product?.pricing?.wholesale,
//           product?.pricing?.bulk,
//           product?.price?.wholesale,
//           product?.price?.bulk,
//           product?.bulkPrice,
//           product?.wholesalePrice,
//           product?.purchasePrice,
//           product?.costPrice,
//           product?.bulk,
//           product?.wholesale
//         ]
//       : [
//           product?.pricing?.retail,
//           product?.pricing?.selling,
//           product?.price?.retail,
//           product?.price?.selling,
//           product?.salePrice,
//           product?.sellingPrice,
//           product?.retailPrice,
//           product?.price?.current,
//           product?.price,
//           product?.mrp,
//           product?.sell
//         ]

//   return sources.find(
//     (value) => typeof value === 'number' && Number.isFinite(value)
//   )
// }

// function normalizeProductRow(product = {}) {
//   const brandEntity = product?.brand || product?.brandId || product?.brandInfo
//   const brandName =
//     typeof brandEntity === 'string'
//       ? brandEntity
//       : brandEntity?.name ||
//         product?.brandName ||
//         product?.brand_title ||
//         ''
//   const brandSlug =
//     typeof brandEntity === 'object' && brandEntity?.slug
//       ? brandEntity.slug
//       : createBrandSlug(brandName)

//   const subCategory = extractSubCategory(product)
//   const subCategoryId =
//     typeof subCategory === 'object' ? subCategory?._id : subCategory
//   const subCategoryName =
//     typeof subCategory === 'object'
//       ? subCategory?.name
//       : product?.subCategoryName ||
//         product?.subcategoryName ||
//         product?.subcategory ||
//         ''

//   const categoryEntity =
//     product?.category ||
//     product?.categories?.[0] ||
//     (typeof subCategory === 'object' ? subCategory?.category?.[0] : null)
//   const categoryId =
//     typeof categoryEntity === 'object'
//       ? categoryEntity?._id
//       : product?.categoryId || categoryEntity
//   const categoryName =
//     typeof categoryEntity === 'object'
//       ? categoryEntity?.name
//       : product?.categoryName || ''

//   const productSlug = createProductSlug(product)

//   return {
//     id:
//       product?._id ||
//       product?.id ||
//       `${brandSlug}-${product?.name || 'item'}`,
//     name: product?.name || product?.title || 'Unnamed product',
//     brandName,
//     brandSlug,
//     productSlug,
//     bulkPrice: extractPrice(product, 'bulk'),
//     sellingPrice: extractPrice(product, 'sell'),
//     subCategoryId,
//     subCategoryName,
//     categoryId,
//     categoryName
//   }
// }

// function createEmptyStats() {
//   return {
//     totalProducts: 0,
//     sellSum: 0,
//     sellCount: 0,
//     bulkSum: 0,
//     bulkCount: 0,
//     categories: new Set(),
//     subCategories: new Set()
//   }
// }

// function aggregateBrandStats(brands = [], productRows = []) {
//   const statsMap = new Map()

//   productRows.forEach((row) => {
//     if (!row.brandSlug) return
//     if (!statsMap.has(row.brandSlug)) statsMap.set(row.brandSlug, createEmptyStats())
//     const stats = statsMap.get(row.brandSlug)

//     stats.totalProducts += 1

//     if (typeof row.sellingPrice === 'number') {
//       stats.sellSum += row.sellingPrice
//       stats.sellCount += 1
//     }

//     if (typeof row.bulkPrice === 'number') {
//       stats.bulkSum += row.bulkPrice
//       stats.bulkCount += 1
//     }

//     if (row.categoryName) stats.categories.add(row.categoryName)
//     if (row.subCategoryName) stats.subCategories.add(row.subCategoryName)
//   })

//   return (Array.isArray(brands) ? brands : []).map((brand) => {
//     const slug = brand.slug || createBrandSlug(brand.name || brand.title || brand._id || '')
//     const apiMetrics = brand.metrics || {}
//     const aggregated = statsMap.get(slug) || createEmptyStats()

//     const totalProducts =
//       aggregated.totalProducts || apiMetrics.totalProducts || 0

//     const avgSellingPrice =
//       aggregated.sellCount > 0
//         ? Math.round(aggregated.sellSum / aggregated.sellCount)
//         : apiMetrics.avgSellingPrice

//     const avgBulkPrice =
//       aggregated.bulkCount > 0
//         ? Math.round(aggregated.bulkSum / aggregated.bulkCount)
//         : apiMetrics.avgBulkPrice

//     const categories =
//       aggregated.categories.size > 0
//         ? Array.from(aggregated.categories).sort()
//         : apiMetrics.categories || []

//     const subCategories =
//       aggregated.subCategories.size > 0
//         ? Array.from(aggregated.subCategories).sort()
//         : apiMetrics.subCategories || []

//     return {
//       ...brand,
//       slug,
//       metrics: {
//         totalProducts,
//         avgSellingPrice,
//         avgBulkPrice,
//         categories,
//         subCategories
//       }
//     }
//   })
// }

// function getSubCatInfo(allSubCategory, row) {
//   if (!Array.isArray(allSubCategory)) return null

//   if (row.subCategoryId) {
//     const foundById = allSubCategory.find((sub) => {
//       const subId = typeof sub?._id === 'string' ? sub._id : ''
//       return subId === row.subCategoryId
//     })
//     if (foundById) return foundById
//   }

//   if (row.subCategoryName) {
//     const foundByName = allSubCategory.find(
//       (sub) =>
//         sub?.name?.trim()?.toLowerCase() === row.subCategoryName.trim().toLowerCase()
//     )
//     if (foundByName) return foundByName
//   }

//   return null
// }

// function getCategoryLinkMeta(allCategory, allSubCategory, row) {
//   const subCat = getSubCatInfo(allSubCategory, row)
//   if (!subCat) return null

//   let mainCat = null

//   if (Array.isArray(subCat.category) && subCat.category.length) {
//     mainCat = Array.isArray(allCategory)
//       ? allCategory.find(
//           (cat) =>
//             cat?._id === subCat.category[0]?._id || cat?._id === subCat.category[0]
//         )
//       : null
//   }

//   if (!mainCat && row.categoryId) {
//     mainCat = Array.isArray(allCategory)
//       ? allCategory.find((cat) => cat?._id === row.categoryId)
//       : null
//   }

//   if (!mainCat && row.categoryName) {
//     mainCat = Array.isArray(allCategory)
//       ? allCategory.find(
//           (cat) =>
//             cat?.name?.trim()?.toLowerCase() === row.categoryName.trim().toLowerCase()
//         )
//       : null
//   }

//   if (!mainCat) return null
//   return { mainCat, subCat }
// }

// function buildSubCatUrl(mainCat, subCat) {
//   if (!mainCat?._id || !subCat?._id) return '#'
//   return `/${valideURLConvert(mainCat.name)}-${mainCat._id}/${valideURLConvert(
//     subCat.name
//   )}-${subCat._id}`
// }

// // ---------- UI helpers (unchanged) ----------
// // ... (BrandDirectoryGrid, StructuredData, ApiUnavailableNotice, LoadingState, ErrorState, etc. remain identical)

// function BrandDirectoryGrid({ brandStats = [] }) {
//   if (!Array.isArray(brandStats) || !brandStats.length) return null

//   return (
//     <section className="container mx-auto px-4 py-5">
//       <header className="mb-8 text-center">
//         <h1 className="text-3xl font-bold">Shop by brand</h1>
//         <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
//           Explore curated makeup collections from our active brand partners. Click any brand to view their products.
//         </p>
//       </header>

//       <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
//         {brandStats.map((brand) => (
//           <Link
//             key={brand._id || brand.slug}
//             href={`/brands/${brand.slug}`}
//             className="group border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
//           >
//             <div className="p-6 flex flex-col items-center gap-4">
//               <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center overflow-hidden border">
//                 {brand.logo ? (
//                   // eslint-disable-next-line @next/next/no-img-element
//                   <img
//                     src={brand.logo}
//                     alt={brand.name}
//                     className="object-contain h-full w-full"
//                   />
//                 ) : (
//                   <span className="text-xs text-gray-400 text-center px-2">
//                     Logo coming soon
//                   </span>
//                 )}
//               </div>
//               <h2 className="text-lg font-semibold text-center">{brand.name}</h2>
//               {brand.isFeatured && (
//                 <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full">
//                   Featured
//                 </span>
//               )}
//               <p className="text-sm text-gray-500 line-clamp-3 text-center">
//                 {brand.description
//                   ? brand.description
//                       .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
//                       .slice(0, 140)
//                       .concat('…')
//                   : 'Discover signature products from this brand.'}
//               </p>
//               <div className="text-xs text-gray-500">
//                 {brand.metrics?.totalProducts || 0} products •{' '}
//                 {brand.metrics?.avgSellingPrice
//                   ? FCFA(brand.metrics.avgSellingPrice)
//                   : '—'}{' '}
//                 avg
//               </div>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </section>
//   )
// }

// function StructuredData({ products = [], brandStats = [] }) {
//   const structuredProducts = useMemo(() => {
//     if (!Array.isArray(products) || products.length === 0) return []
//     return products.slice(0, MAX_PRODUCTS_FOR_STRUCTURED_DATA).map((item) => ({
//       '@type': 'Product',
//       name: item.name,
//       brand: { '@type': 'Brand', name: item.brandName },
//       category: item.subCategoryName || item.categoryName,
//       offers: {
//         '@type': 'Offer',
//         priceCurrency: 'XAF',
//         price:
//           typeof item.sellingPrice === 'number'
//             ? String(item.sellingPrice)
//             : undefined,
//         availability: 'https://schema.org/InStock'
//       }
//     }))
//   }, [products])

//   const storeJsonLd = useMemo(() => {
//     if (!structuredProducts.length) return null

//     return {
//       '@context': 'https://schema.org',
//       '@type': 'Store',
//       name: SITE_NAME,
//       url: SITE_URL,
//       logo: OG_IMAGE,
//       image: [
//         OG_IMAGE,
//         'https://www.esmakeupstore.com/assets/NYX-PMU-Makeup-Lips-Liquid-Lipstick-LIP-LINGERIE-XXL-LXXL28-UNTAMABLE-0800897132187-OpenSwatch.webp',
//         'https://www.esmakeupstore.com/assets/800897085421_duochromaticilluminatingpowder_twilighttint_alt2.jpg'
//       ],
//       address: {
//         '@type': 'PostalAddress',
//         streetAddress: 'Bonamoussadi, Carrefour Maçon',
//         addressLocality: 'Douala',
//         addressCountry: 'CM'
//       },
//       contactPoint: {
//         '@type': 'ContactPoint',
//         telephone: '+237655225569',
//         contactType: 'customer support',
//         areaServed: 'CM'
//       },
//       sameAs: [
//         'https://www.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2Fesmakeupstore'
//       ],
//       makesOffer: structuredProducts
//     }
//   }, [structuredProducts])

//   const itemListJsonLd = useMemo(() => {
//     if (!structuredProducts.length) return null

//     return {
//       '@context': 'https://schema.org',
//       '@type': 'ItemList',
//       name: 'Makeup Brand Price List',
//       itemListElement: structuredProducts.map((prod, index) => ({
//         '@type': 'ListItem',
//         position: index + 1,
//         item: prod
//       }))
//     }
//   }, [structuredProducts])

//   const brandCollectionJsonLd = useMemo(() => {
//     if (!Array.isArray(brandStats) || !brandStats.length) return null

//     return {
//       '@context': 'https://schema.org',
//       '@type': 'ItemList',
//       name: 'Available Makeup Brands',
//       itemListElement: brandStats.map((brand, index) => ({
//         '@type': 'ListItem',
//         position: index + 1,
//         item: {
//           '@type': 'Brand',
//           name: brand.name,
//           url: `${ROOT_URL}/brands/${brand.slug}`
//         }
//       }))
//     }
//   }, [brandStats])

//   if (!storeJsonLd && !itemListJsonLd && !brandCollectionJsonLd) return null

//   return (
//     <>
//       {storeJsonLd && (
//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
//         />
//       )}
//       {itemListJsonLd && (
//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
//         />
//       )}
//       {brandCollectionJsonLd && (
//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{ __html: JSON.stringify(brandCollectionJsonLd) }}
//         />
//       )}
//     </>
//   )
// }

// function ApiUnavailableNotice() {
//   return (
//     <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4 py-16">
//       <section className="max-w-3xl w-full bg-white border border-pink-200 rounded-2xl shadow-lg p-8 space-y-4 text-center">
//         <h1 className="text-2xl md:text-3xl font-bold text-pink-600">
//           Brand directory skipped during static export
//         </h1>
//         <p className="text-gray-700">
//           Remote API calls are disabled because <code className="px-2 py-1 bg-gray-100 rounded">NEXT_PUBLIC_API_URL</code>{' '}
//           points to <code className="px-2 py-1 bg-gray-100 rounded">localhost</code> while exporting. Hydration cannot restore data in this mode.
//         </p>
//         <ol className="text-left text-gray-700 list-decimal list-inside space-y-2">
//           <li>Expose the API on a reachable host and update <code>NEXT_PUBLIC_API_URL</code>.</li>
//           <li>Or deploy with <code>next build && next start</code> to keep runtime fetching.</li>
//           <li>Or accept this placeholder for static exports.</li>
//         </ol>
//       </section>
//     </main>
//   )
// }

// function LoadingState() {
//   return (
//     <main className="bg-gradient-to-b from-pink-50 to-white min-h-screen py-10 px-2 md:px-10">
//       <section className="max-w-4xl mx-auto animate-pulse space-y-6">
//         <div className="h-12 bg-pink-200/60 rounded w-2/3 mx-auto" />
//         <div className="h-6 bg-pink-100/80 rounded w-1/2 mx-auto" />
//         <div className="h-40 bg-white rounded-lg shadow-sm" />
//         <div className="h-72 bg-white rounded-lg shadow-sm" />
//       </section>
//     </main>
//   )
// }

// function ErrorState({ message }) {
//   return (
//     <main className="bg-gradient-to-b from-pink-50 to-white min-h-screen py-10 px-2 md:px-10">
//       <section className="max-w-3xl mx-auto bg-white border border-red-200 rounded-xl shadow p-8 text-center space-y-4">
//         <h1 className="text-2xl font-bold text-red-500">Unable to load brands</h1>
//         <p className="text-gray-700">
//           We ran into a problem while fetching the brand catalog. Please refresh the page or try again later.
//         </p>
//         {message && <p className="text-sm text-red-400">{message}</p>}
//       </section>
//     </main>
//   )
// }

// async function pingIndexNow() {
//   try {
//     await fetch('/api/indexnow/submit-url', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ url: SITE_URL })
//     })
//   } catch (error) {
//     console.warn('[brands directory] pingIndexNow failed', error)
//   }
// }

// // ---------- Main client component ----------

// export default function BrandsDirectoryClient({ canUseRemoteApi }) {
//   const {
//     data: brands = [],
//     isLoading: isBrandsLoading,
//     isError: isBrandsError,
//     error: brandsError
//   } = useBrandsQuery({ enabled: canUseRemoteApi })

//   const {
//     data: categories = [],
//     isLoading: isCategoriesLoading
//   } = useCategoriesQuery({ enabled: canUseRemoteApi })

//   const {
//     data: subCategories = [],
//     isLoading: isSubCategoriesLoading
//   } = useSubCategoriesQuery({ enabled: canUseRemoteApi })

//   const {
//     data: products = [],
//     isLoading: isProductsLoading,
//     isError: isProductsError,
//     error: productsError
//   } = useProductCatalogQuery({ enabled: canUseRemoteApi })

//   useEffect(() => {
//     if (!canUseRemoteApi) return
//     if (process.env.NODE_ENV !== 'production') return
//     pingIndexNow()
//   }, [canUseRemoteApi])

//   const productRows = useMemo(
//     () => (Array.isArray(products) ? products.map(normalizeProductRow) : []),
//     [products]
//   )

//   const brandStats = useMemo(
//     () => aggregateBrandStats(brands || [], productRows),
//     [brands, productRows]
//   )

//   const brandNames = brandStats.map((brand) => brand.name).filter(Boolean)
//   const subCategoryNames = Array.from(
//     new Set(productRows.map((row) => row.subCategoryName).filter(Boolean))
//   )
//   const categoryNames = Array.from(
//     new Set(productRows.map((row) => row.categoryName).filter(Boolean))
//   )
//   const totalProducts = productRows.length

//   if (!canUseRemoteApi) {
//     return <ApiUnavailableNotice />
//   }

//   if (isBrandsLoading || isProductsLoading || isCategoriesLoading || isSubCategoriesLoading) {
//     return <LoadingState />
//   }

//   if (isBrandsError || isProductsError) {
//     return (
//       <ErrorState
//         message={
//           productsError?.message ||
//           brandsError?.message ||
//           'Unknown error'
//         }
//       />
//     )
//   }

//   return (
//     <main className="bg-gradient-to-b from-pink-50 to-white min-h-screen py-10 px-2 md:px-10">
//       <StructuredData products={productRows} brandStats={brandStats} />

//       <div className="mb-2">
//         <BrandSearch />
//       </div>

//       <BrandDirectoryGrid brandStats={brandStats} />

//       <section
//         aria-labelledby="product-table-heading"
//         className="overflow-x-auto rounded-lg border border-pink-200 shadow-lg bg-white"
//       >
//         <h2
//           id="product-table-heading"
//           className="text-xl font-bold text-pink-600 p-4 border-b border-pink-200"
//         >
//           Complete Product Price List - All Brands
//         </h2>
//         <table className="min-w-full text-sm md:text-base">
//           <thead>
//             <tr className="bg-pink-100 text-black">
//               <th scope="col" className="py-3 px-2 md:px-4 font-bold text-left">
//                 Product
//               </th>
//               <th scope="col" className="py-3 px-2 md:px-4 font-bold text-left">
//                 Subcategory
//               </th>
//               <th scope="col" className="py-3 px-2 md:px-4 font-bold text-left">
//                 Brand
//               </th>
//               <th scope="col" className="py-3 px-2 md:px-4 font-bold text-right">
//                 Bulk Price (FCFA)
//               </th>
//               <th scope="col" className="py-3 px-2 md:px-4 font-bold text-right">
//                 Selling Price (FCFA)
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {productRows.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan={5}
//                   className="py-6 px-4 text-center text-gray-500 italic bg-white"
//                 >
//                   No products available yet. Please check back soon.
//                 </td>
//               </tr>
//             ) : (
//               productRows.map((row, index) => {
//                 const linkMeta = getCategoryLinkMeta(
//                   categories,
//                   subCategories,
//                   row
//                 )
//                 const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-pink-50'

//                 return (
//                   <tr key={row.id || `${row.name}-${index}`} className={rowClass}>
//                     <td className="py-2 px-2 md:px-4 font-semibold text-gray-900">
//                       {row.productSlug ? (
//                         <Link
//                           href={`/product/${row.productSlug}`}
//                           className="text-gray-900 hover:text-pink-600 underline decoration-pink-300 decoration-2 underline-offset-2 transition-colors font-medium"
//                           aria-label={`View ${row.name}`}
//                         >
//                           {row.name}
//                         </Link>
//                       ) : (
//                         <span>{row.name}</span>
//                       )}
//                     </td>
//                     <td className="py-2 px-2 md:px-4">
//                       {linkMeta ? (
//                         <Link
//                           href={buildSubCatUrl(linkMeta.mainCat, linkMeta.subCat)}
//                           className="underline text-blue-700 hover:text-pink-500 transition font-medium focus:outline-none focus:ring-2 focus:ring-pink-300 rounded"
//                           aria-label={`Browse ${row.subCategoryName} in ${linkMeta.mainCat?.name}`}
//                         >
//                           {row.subCategoryName || row.categoryName || 'View'}
//                         </Link>
//                       ) : (
//                         <span className="text-gray-500">
//                           {row.subCategoryName || row.categoryName || '—'}
//                         </span>
//                       )}
//                     </td>
//                     <td className="py-2 px-2 md:px-4">
//                       <Link
//                         href={`/brands/${row.brandSlug}`}
//                         className="text-gray-900 hover:text-pink-600 font-medium transition-colors underline"
//                         aria-label={`View all ${row.brandName} products`}
//                       >
//                         {row.brandName}
//                       </Link>
//                     </td>
//                     <td className="py-2 px-2 md:px-4 text-right font-bold text-green-600">
//                       {FCFA(row.bulkPrice)}
//                     </td>
//                     <td className="py-2 px-2 md:px-4 text-right font-bold text-pink-600">
//                       {FCFA(row.sellingPrice)}
//                     </td>
//                   </tr>
//                 )
//               })
//             )}
//           </tbody>
//         </table>
//       </section>

//       <section className="text-center mb-8 mt-10">
//         <h1 className="text-4xl md:text-6xl font-extrabold text-pink-500 mb-2 tracking-tight">
//           ESSENTIALIST MAKEUP STORE
//         </h1>
//         <p className="text-lg md:text-2xl text-gray-700 font-semibold">
//           Build &amp; Brand — Makeup Brands Price List
//         </p>
//         <p className="text-pink-600 font-bold mt-2">
//           Discover authentic brands at the best prices in Cameroon!
//         </p>
//         <p className="text-gray-600 mt-1">
//           Brands: {brandNames.length ? brandNames.join(', ') : 'NYX, Juvias Place, ONE/SIZE, Bobbi Brown, Smashbox, e.l.f., Estée Lauder, MAC, Clinique, LA Girl'}.
//         </p>
//         <p className="text-gray-600">
//           Categories:{' '}
//           {subCategoryNames.length
//             ? subCategoryNames.join(', ')
//             : categoryNames.join(', ') || 'Foundations, Lip Makeup, Eye Makeup'}
//           .
//         </p>
//         <p className="text-gray-500 text-sm mt-2">
//           Total products tracked: {totalProducts.toLocaleString()}
//         </p>
//       </section>

//       <section className="max-w-4xl mx-auto bg-white border border-pink-200 rounded-lg shadow p-6 space-y-4">
//         <h2 className="text-2xl font-bold text-pink-600">Brand FAQs</h2>
//         <details className="p-3 bg-pink-50 rounded">
//           <summary className="font-semibold text-gray-800">
//             Do you deliver NYX, MAC, and Estée Lauder nationwide in Cameroon?
//           </summary>
//           <p className="text-gray-700 mt-2">
//             Yes. We ship from Douala to cities nationwide. Delivery is fast and payment is 100% secure online.
//           </p>
//         </details>
//         <details className="p-3 bg-pink-50 rounded">
//           <summary className="font-semibold text-gray-800">
//             Are the products authentic?
//           </summary>
//           <p className="text-gray-700 mt-2">
//             All items are 100% authentic. We publish FCFA price lists for transparency and keep popular items marked In stock.
//           </p>
//         </details>
//         <details className="p-3 bg-pink-50 rounded">
//           <summary className="font-semibold text-gray-800">
//             How can I find my foundation shade?
//           </summary>
//           <p className="text-gray-700 mt-2">
//             Open any brand page and filter by category. For Estée Lauder Double Wear or MAC Studio Fix, contact support for a quick shade guide.
//           </p>
//         </details>
//       </section>

//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{
//           __html: JSON.stringify({
//             '@context': 'https://schema.org',
//             '@type': 'FAQPage',
//             mainEntity: [
//               {
//                 '@type': 'Question',
//                 name: 'Do you deliver NYX, MAC, and Estée Lauder nationwide in Cameroon?',
//                 acceptedAnswer: {
//                   '@type': 'Answer',
//                   text: 'Yes. We ship from Douala to cities nationwide. Delivery is fast and payment is 100% secure online.'
//                 }
//               },
//               {
//                 '@type': 'Question',
//                 name: 'Are the products authentic?',
//                 acceptedAnswer: {
//                   '@type': 'Answer',
//                   text: 'All items are 100% authentic. We publish FCFA price lists for transparency and keep popular items marked In stock.'
//                 }
//               },
//               {
//                 '@type': 'Question',
//                 name: 'How can I find my foundation shade?',
//                 acceptedAnswer: {
//                   '@type': 'Answer',
//                   text: 'Open any brand page and filter by category. For Estée Lauder Double Wear or MAC Studio Fix, contact support for a quick shade guide.'
//                 }
//               }
//             ]
//           })
//         }}
//       />
//     </main>
//   )
// }





//client\src\app\brands\BrandsDirectoryClient.jsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

import BrandSearch from '../../components/BrandSearch'
import { valideURLConvert } from '../../utils/valideURLConvert'
import {
  useBrandsQuery,
  useCategoriesQuery,
  useSubCategoriesQuery
} from '@/hooks/queries/useCatalogQueries'
import SummaryApi from '@/common/SummaryApi'
import Axios from '@/utils/Axios'

const SITE_URL = 'https://www.esmakeupstore.com/brands'
const ROOT_URL = 'https://www.esmakeupstore.com'
const SITE_NAME = 'Essentialist Makeup Store'
const OG_IMAGE =
  'https://www.esmakeupstore.com/assets/staymattebutnotflatpowderfoundationmain.jpg'
const MAX_PRODUCTS_FOR_STRUCTURED_DATA = 20

// Set how many items you want per page here!
const ITEMS_PER_PAGE = 20 

function useProductCatalogQuery({ enabled }) {
  return useQuery({
    queryKey: ['product-catalog'],
    enabled,
    queryFn: async () => {
      const response = await Axios({
        ...SummaryApi.getProduct,
        data: {
          page: 1,
          limit: 500,
          onlyActive: true,
          include: ['brand', 'category', 'subCategory']
        }
      })

      const payload = response?.data
      const items =
        payload?.items ||
        payload?.products ||
        payload?.data?.items ||
        payload?.data?.products ||
        payload?.data ||
        []

      if (!Array.isArray(items)) {
        throw new Error('Unexpected product catalog response')
      }

      return items
    },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1
  })
}

// ---------- Helper utilities ----------

function createBrandSlug(name = '') {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function createProductSlug(product = {}) {
  const fallbackName =
    typeof product?.name === 'string' ? product.name.trim() : ''
  const raw =
    typeof product?.slug === 'string' && product.slug.trim()
      ? product.slug.trim()
      : typeof product?.handle === 'string' && product.handle.trim()
        ? product.handle.trim()
        : typeof product?.seoSlug === 'string' && product.seoSlug.trim()
          ? product.seoSlug.trim()
          : fallbackName
            ? valideURLConvert(fallbackName)
            : ''

  if (!raw) return ''
  if (product?._id && typeof product._id === 'string' && !raw.includes(product._id)) {
    return `${raw}-${product._id}`
  }
  return raw
}

function FCFA(amount) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '—'
  return `${amount.toLocaleString('en-US')} FCFA`
}

function extractSubCategory(product = {}) {
  const candidate =
    product?.subCategory ??
    product?.subCategories ??
    product?.subcategory ??
    product?.sub_category ??
    null

  if (Array.isArray(candidate)) return candidate[0]
  if (candidate) return candidate

  if (product?.subCategoryId || product?.subcategoryId) {
    return {
      _id: product.subCategoryId || product.subcategoryId,
      name:
        product?.subCategoryName ||
        product?.subcategoryName ||
        product?.subcategory ||
        ''
    }
  }

  if (
    product?.subCategoryName ||
    product?.subcategoryName ||
    product?.subcategory
  ) {
    return {
      _id: null,
      name:
        product?.subCategoryName ||
        product?.subcategoryName ||
        product?.subcategory ||
        ''
    }
  }

  return null
}

function extractPrice(product = {}, role) {
  const sources =
    role === 'bulk'
      ? [
          product?.pricing?.wholesale,
          product?.pricing?.bulk,
          product?.price?.wholesale,
          product?.price?.bulk,
          product?.bulkPrice,
          product?.wholesalePrice,
          product?.purchasePrice,
          product?.costPrice,
          product?.bulk,
          product?.wholesale
        ]
      : [
          product?.pricing?.retail,
          product?.pricing?.selling,
          product?.price?.retail,
          product?.price?.selling,
          product?.salePrice,
          product?.sellingPrice,
          product?.retailPrice,
          product?.price?.current,
          product?.price,
          product?.mrp,
          product?.sell
        ]

  return sources.find(
    (value) => typeof value === 'number' && Number.isFinite(value)
  )
}

function normalizeProductRow(product = {}) {
  const brandEntity = product?.brand || product?.brandId || product?.brandInfo
  const brandName =
    typeof brandEntity === 'string'
      ? brandEntity
      : brandEntity?.name ||
        product?.brandName ||
        product?.brand_title ||
        ''
  const brandSlug =
    typeof brandEntity === 'object' && brandEntity?.slug
      ? brandEntity.slug
      : createBrandSlug(brandName)

  const subCategory = extractSubCategory(product)
  const subCategoryId =
    typeof subCategory === 'object' ? subCategory?._id : subCategory
  const subCategoryName =
    typeof subCategory === 'object'
      ? subCategory?.name
      : product?.subCategoryName ||
        product?.subcategoryName ||
        product?.subcategory ||
        ''

  const categoryEntity =
    product?.category ||
    product?.categories?.[0] ||
    (typeof subCategory === 'object' ? subCategory?.category?.[0] : null)
  const categoryId =
    typeof categoryEntity === 'object'
      ? categoryEntity?._id
      : product?.categoryId || categoryEntity
  const categoryName =
    typeof categoryEntity === 'object'
      ? categoryEntity?.name
      : product?.categoryName || ''

  const productSlug = createProductSlug(product)

  return {
    id:
      product?._id ||
      product?.id ||
      `${brandSlug}-${product?.name || 'item'}`,
    name: product?.name || product?.title || 'Unnamed product',
    brandName,
    brandSlug,
    productSlug,
    bulkPrice: extractPrice(product, 'bulk'),
    sellingPrice: extractPrice(product, 'sell'),
    subCategoryId,
    subCategoryName,
    categoryId,
    categoryName
  }
}

function createEmptyStats() {
  return {
    totalProducts: 0,
    sellSum: 0,
    sellCount: 0,
    bulkSum: 0,
    bulkCount: 0,
    categories: new Set(),
    subCategories: new Set()
  }
}

function aggregateBrandStats(brands = [], productRows = []) {
  const statsMap = new Map()

  productRows.forEach((row) => {
    if (!row.brandSlug) return
    if (!statsMap.has(row.brandSlug)) statsMap.set(row.brandSlug, createEmptyStats())
    const stats = statsMap.get(row.brandSlug)

    stats.totalProducts += 1

    if (typeof row.sellingPrice === 'number') {
      stats.sellSum += row.sellingPrice
      stats.sellCount += 1
    }

    if (typeof row.bulkPrice === 'number') {
      stats.bulkSum += row.bulkPrice
      stats.bulkCount += 1
    }

    if (row.categoryName) stats.categories.add(row.categoryName)
    if (row.subCategoryName) stats.subCategories.add(row.subCategoryName)
  })

  return (Array.isArray(brands) ? brands : []).map((brand) => {
    const slug = brand.slug || createBrandSlug(brand.name || brand.title || brand._id || '')
    const apiMetrics = brand.metrics || {}
    const aggregated = statsMap.get(slug) || createEmptyStats()

    const totalProducts =
      aggregated.totalProducts || apiMetrics.totalProducts || 0

    const avgSellingPrice =
      aggregated.sellCount > 0
        ? Math.round(aggregated.sellSum / aggregated.sellCount)
        : apiMetrics.avgSellingPrice

    const avgBulkPrice =
      aggregated.bulkCount > 0
        ? Math.round(aggregated.bulkSum / aggregated.bulkCount)
        : apiMetrics.avgBulkPrice

    const categories =
      aggregated.categories.size > 0
        ? Array.from(aggregated.categories).sort()
        : apiMetrics.categories || []

    const subCategories =
      aggregated.subCategories.size > 0
        ? Array.from(aggregated.subCategories).sort()
        : apiMetrics.subCategories || []

    return {
      ...brand,
      slug,
      metrics: {
        totalProducts,
        avgSellingPrice,
        avgBulkPrice,
        categories,
        subCategories
      }
    }
  })
}

function getSubCatInfo(allSubCategory, row) {
  if (!Array.isArray(allSubCategory)) return null

  if (row.subCategoryId) {
    const foundById = allSubCategory.find((sub) => {
      const subId = typeof sub?._id === 'string' ? sub._id : ''
      return subId === row.subCategoryId
    })
    if (foundById) return foundById
  }

  if (row.subCategoryName) {
    const foundByName = allSubCategory.find(
      (sub) =>
        sub?.name?.trim()?.toLowerCase() === row.subCategoryName.trim().toLowerCase()
    )
    if (foundByName) return foundByName
  }

  return null
}

function getCategoryLinkMeta(allCategory, allSubCategory, row) {
  const subCat = getSubCatInfo(allSubCategory, row)
  if (!subCat) return null

  let mainCat = null

  if (Array.isArray(subCat.category) && subCat.category.length) {
    mainCat = Array.isArray(allCategory)
      ? allCategory.find(
          (cat) =>
            cat?._id === subCat.category[0]?._id || cat?._id === subCat.category[0]
        )
      : null
  }

  if (!mainCat && row.categoryId) {
    mainCat = Array.isArray(allCategory)
      ? allCategory.find((cat) => cat?._id === row.categoryId)
      : null
  }

  if (!mainCat && row.categoryName) {
    mainCat = Array.isArray(allCategory)
      ? allCategory.find(
          (cat) =>
            cat?.name?.trim()?.toLowerCase() === row.categoryName.trim().toLowerCase()
        )
      : null
  }

  if (!mainCat) return null
  return { mainCat, subCat }
}

function buildSubCatUrl(mainCat, subCat) {
  if (!mainCat?._id || !subCat?._id) return '#'
  return `/${valideURLConvert(mainCat.name)}-${mainCat._id}/${valideURLConvert(
    subCat.name
  )}-${subCat._id}`
}

// ---------- UI helpers ----------

function BrandDirectoryGrid({ brandStats = [] }) {
  if (!Array.isArray(brandStats) || !brandStats.length) return null

  return (
    <section className="container mx-auto px-4 py-5">
      <header className="mb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-pink-600 mb-4 tracking-tight">
          Shop Top Makeup Brands
        </h1>
        <p className="text-gray-600 text-base md:text-lg leading-relaxed">
          Discover our curated collection of authentic <strong>cosmetic products</strong> and professional beauty essentials. Browse top brands, compare FCFA prices, and find your perfect shade with fast delivery in Douala and across Cameroon.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {brandStats.map((brand) => (
          <Link
            key={brand._id || brand.slug}
            href={`/brands/${brand.slug}`}
            className="group border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-6 flex flex-col items-center gap-4">
              <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center overflow-hidden border">
                {brand.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.logo}
                    alt={`${brand.name} cosmetics`}
                    className="object-contain h-full w-full"
                  />
                ) : (
                  <span className="text-xs text-gray-400 text-center px-2">
                    Logo coming soon
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-center">{brand.name}</h2>
              {brand.isFeatured && (
                <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full">
                  Featured
                </span>
              )}
              <p className="text-sm text-gray-500 line-clamp-3 text-center">
                {brand.description
                  ? brand.description
                      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
                      .slice(0, 140)
                      .concat('…')
                  : 'Discover signature products from this brand.'}
              </p>
              <div className="text-xs text-gray-500">
                {brand.metrics?.totalProducts || 0} products •{' '}
                {brand.metrics?.avgSellingPrice
                  ? FCFA(brand.metrics.avgSellingPrice)
                  : '—'}{' '}
                avg
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function StructuredData({ products = [], brandStats = [] }) {
  const structuredProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return []
    return products.slice(0, MAX_PRODUCTS_FOR_STRUCTURED_DATA).map((item) => ({
      '@type': 'Product',
      name: item.name,
      brand: { '@type': 'Brand', name: item.brandName },
      category: item.subCategoryName || item.categoryName,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'XAF',
        price:
          typeof item.sellingPrice === 'number'
            ? String(item.sellingPrice)
            : undefined,
        availability: 'https://schema.org/InStock'
      }
    }))
  }, [products])

  const storeJsonLd = useMemo(() => {
    if (!structuredProducts.length) return null

    return {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: SITE_NAME,
      url: SITE_URL,
      logo: OG_IMAGE,
      image: [
        OG_IMAGE,
        'https://www.esmakeupstore.com/assets/NYX-PMU-Makeup-Lips-Liquid-Lipstick-LIP-LINGERIE-XXL-LXXL28-UNTAMABLE-0800897132187-OpenSwatch.webp',
        'https://www.esmakeupstore.com/assets/800897085421_duochromaticilluminatingpowder_twilighttint_alt2.jpg'
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Bonamoussadi, Carrefour Maçon',
        addressLocality: 'Douala',
        addressCountry: 'CM'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+237655225569',
        contactType: 'customer support',
        areaServed: 'CM'
      },
      sameAs: [
        'https://www.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2Fesmakeupstore'
      ],
      makesOffer: structuredProducts
    }
  }, [structuredProducts])

  const itemListJsonLd = useMemo(() => {
    if (!structuredProducts.length) return null

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Makeup Brand Price List',
      itemListElement: structuredProducts.map((prod, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: prod
      }))
    }
  }, [structuredProducts])

  const brandCollectionJsonLd = useMemo(() => {
    if (!Array.isArray(brandStats) || !brandStats.length) return null

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Available Makeup Brands',
      itemListElement: brandStats.map((brand, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Brand',
          name: brand.name,
          url: `${ROOT_URL}/brands/${brand.slug}`
        }
      }))
    }
  }, [brandStats])

  if (!storeJsonLd && !itemListJsonLd && !brandCollectionJsonLd) return null

  return (
    <>
      {storeJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
        />
      )}
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      {brandCollectionJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(brandCollectionJsonLd) }}
        />
      )}
    </>
  )
}

function ApiUnavailableNotice() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4 py-16">
      <section className="max-w-3xl w-full bg-white border border-pink-200 rounded-2xl shadow-lg p-8 space-y-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-pink-600">
          Brand directory skipped during static export
        </h1>
        <p className="text-gray-700">
          Remote API calls are disabled because <code className="px-2 py-1 bg-gray-100 rounded">NEXT_PUBLIC_API_URL</code>{' '}
          points to <code className="px-2 py-1 bg-gray-100 rounded">localhost</code> while exporting. Hydration cannot restore data in this mode.
        </p>
        <ol className="text-left text-gray-700 list-decimal list-inside space-y-2">
          <li>Expose the API on a reachable host and update <code>NEXT_PUBLIC_API_URL</code>.</li>
          <li>Or deploy with <code>next build && next start</code> to keep runtime fetching.</li>
          <li>Or accept this placeholder for static exports.</li>
        </ol>
      </section>
    </main>
  )
}

function LoadingState() {
  return (
    <main className="bg-gradient-to-b from-pink-50 to-white min-h-screen py-10 px-2 md:px-10">
      <section className="max-w-4xl mx-auto animate-pulse space-y-6">
        <div className="h-12 bg-pink-200/60 rounded w-2/3 mx-auto" />
        <div className="h-6 bg-pink-100/80 rounded w-1/2 mx-auto" />
        <div className="h-40 bg-white rounded-lg shadow-sm" />
        <div className="h-72 bg-white rounded-lg shadow-sm" />
      </section>
    </main>
  )
}

function ErrorState({ message }) {
  return (
    <main className="bg-gradient-to-b from-pink-50 to-white min-h-screen py-10 px-2 md:px-10">
      <section className="max-w-3xl mx-auto bg-white border border-red-200 rounded-xl shadow p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-500">Unable to load brands</h1>
        <p className="text-gray-700">
          We ran into a problem while fetching the brand catalog. Please refresh the page or try again later.
        </p>
        {message && <p className="text-sm text-red-400">{message}</p>}
      </section>
    </main>
  )
}

async function pingIndexNow() {
  try {
    await fetch('/api/indexnow/submit-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: SITE_URL })
    })
  } catch (error) {
    console.warn('[brands directory] pingIndexNow failed', error)
  }
}

// ---------- Main client component ----------

export default function BrandsDirectoryClient({ canUseRemoteApi }) {
  // Pagination & Filtering States
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('')

  const {
    data: brands = [],
    isLoading: isBrandsLoading,
    isError: isBrandsError,
    error: brandsError
  } = useBrandsQuery({ enabled: canUseRemoteApi })

  const {
    data: categories = [],
    isLoading: isCategoriesLoading
  } = useCategoriesQuery({ enabled: canUseRemoteApi })

  const {
    data: subCategories = [],
    isLoading: isSubCategoriesLoading
  } = useSubCategoriesQuery({ enabled: canUseRemoteApi })

  const {
    data: products = [],
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError
  } = useProductCatalogQuery({ enabled: canUseRemoteApi })

  useEffect(() => {
    if (!canUseRemoteApi) return
    if (process.env.NODE_ENV !== 'production') return
    pingIndexNow()
  }, [canUseRemoteApi])

  const productRows = useMemo(
    () => (Array.isArray(products) ? products.map(normalizeProductRow) : []),
    [products]
  )

  const brandStats = useMemo(
    () => aggregateBrandStats(brands || [], productRows),
    [brands, productRows]
  )

  // Filter logic
  const filteredRows = useMemo(() => {
    let rows = productRows;
    if (selectedBrandFilter) {
      rows = rows.filter(row => row.brandSlug === selectedBrandFilter);
    }
    return rows;
  }, [productRows, selectedBrandFilter]);

  // Reset page to 1 if filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrandFilter]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  const brandNames = brandStats.map((brand) => brand.name).filter(Boolean)
  const subCategoryNames = Array.from(
    new Set(productRows.map((row) => row.subCategoryName).filter(Boolean))
  )
  const categoryNames = Array.from(
    new Set(productRows.map((row) => row.categoryName).filter(Boolean))
  )
  const totalProducts = productRows.length

  if (!canUseRemoteApi) {
    return <ApiUnavailableNotice />
  }

  if (isBrandsLoading || isProductsLoading || isCategoriesLoading || isSubCategoriesLoading) {
    return <LoadingState />
  }

  if (isBrandsError || isProductsError) {
    return (
      <ErrorState
        message={
          productsError?.message ||
          brandsError?.message ||
          'Unknown error'
        }
      />
    )
  }

  return (
    <main className="bg-gradient-to-b from-pink-50 to-white min-h-screen py-10 px-2 md:px-10">
      <StructuredData products={productRows} brandStats={brandStats} />

      <div className="mb-2">
        <BrandSearch />
      </div>

      <BrandDirectoryGrid brandStats={brandStats} />

      <section
        aria-labelledby="product-table-heading"
        className="overflow-x-auto rounded-lg border border-pink-200 shadow-lg bg-white mt-10"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-pink-200 bg-gradient-to-r from-pink-100 to-pink-50">
          <h2 id="product-table-heading" className="text-xl font-bold text-pink-600 mb-4 sm:mb-0">
            Complete Product Price List
          </h2>
          
          <select
            value={selectedBrandFilter}
            onChange={(e) => setSelectedBrandFilter(e.target.value)}
            className="w-full sm:w-auto p-2 border border-pink-300 rounded-md text-sm text-gray-700 focus:ring-pink-500 focus:border-pink-500 bg-white"
            aria-label="Filter products by brand"
          >
            <option value="">All Brands</option>
            {brandStats.map(b => (
              <option key={b.slug} value={b.slug}>{b.name}</option>
            ))}
          </select>
        </div>

        <table className="min-w-full text-sm md:text-base">
          <thead>
            <tr className="bg-white border-b text-gray-700">
              <th scope="col" className="py-3 px-2 md:px-4 font-bold text-left">Product</th>
              <th scope="col" className="py-3 px-2 md:px-4 font-bold text-left hidden sm:table-cell">Subcategory</th>
              <th scope="col" className="py-3 px-2 md:px-4 font-bold text-left hidden md:table-cell">Brand</th>
              <th scope="col" className="py-3 px-2 md:px-4 font-bold text-right">Bulk Price</th>
              <th scope="col" className="py-3 px-2 md:px-4 font-bold text-right">Selling Price</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 px-4 text-center text-gray-500 italic bg-white">
                  No products found for this selection.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, index) => {
                const linkMeta = getCategoryLinkMeta(categories, subCategories, row)
                const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-pink-50/50'

                return (
                  <tr key={row.id || `${row.name}-${index}`} className={`${rowClass} hover:bg-pink-100 transition-colors`}>
                    <td className="py-3 px-2 md:px-4 font-semibold text-gray-900">
                      {row.productSlug ? (
                        <Link
                          href={`/product/${row.productSlug}`}
                          className="text-gray-900 hover:text-pink-600 underline decoration-pink-300 decoration-2 underline-offset-2 transition-colors font-medium"
                          aria-label={`View ${row.name}`}
                        >
                          {row.name}
                        </Link>
                      ) : (
                        <span>{row.name}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 md:px-4 hidden sm:table-cell">
                      {linkMeta ? (
                        <Link
                          href={buildSubCatUrl(linkMeta.mainCat, linkMeta.subCat)}
                          className="text-blue-600 hover:text-pink-600 transition font-medium focus:outline-none focus:ring-2 focus:ring-pink-300 rounded"
                        >
                          {row.subCategoryName || row.categoryName || 'View'}
                        </Link>
                      ) : (
                        <span className="text-gray-500">{row.subCategoryName || row.categoryName || '—'}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 md:px-4 hidden md:table-cell">
                      <Link
                        href={`/brands/${row.brandSlug}`}
                        className="text-gray-600 hover:text-pink-600 font-medium transition-colors"
                      >
                        {row.brandName}
                      </Link>
                    </td>
                    <td className="py-3 px-2 md:px-4 text-right font-bold text-green-600 whitespace-nowrap">
                      {FCFA(row.bulkPrice)}
                    </td>
                    <td className="py-3 px-2 md:px-4 text-right font-bold text-pink-600 whitespace-nowrap">
                      {FCFA(row.sellingPrice)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* This Pagination Bar will ALWAYS render so you can see it */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-pink-200 bg-white">
          <span className="text-sm text-gray-600 mb-4 sm:mb-0">
            Showing {filteredRows.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredRows.length)} of {filteredRows.length} products
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-pink-600 bg-white border border-pink-300 rounded hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 text-sm font-medium text-pink-600 bg-white border border-pink-300 rounded hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <section className="text-center mb-8 mt-12 bg-pink-50 p-8 rounded-xl border border-pink-100 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-pink-600 mb-3">
          Your Trusted Makeup Store in Cameroon
        </h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          At the Essentialist Makeup Store, we pride ourselves on offering a wide range of authentic beauty products. 
          Whether you are looking for top-tier 
          {brandNames.length ? ` brands like ${brandNames.slice(0, 5).join(', ')}` : ' cosmetic brands'} 
          or specific essentials like 
          {subCategoryNames.length ? ` ${subCategoryNames.slice(0, 4).join(', ')}` : ' foundations and setting powders'}, 
          we have you covered with the best FCFA pricing and fast nationwide delivery.
        </p>
        <p className="text-gray-500 text-sm font-medium">
          Currently tracking {totalProducts.toLocaleString()} premium products in our active catalog.
        </p>
      </section>

      <section className="max-w-4xl mx-auto bg-white border border-pink-200 rounded-lg shadow p-6 space-y-4">
        <h2 className="text-2xl font-bold text-pink-600">Brand FAQs</h2>
        <details className="p-3 bg-pink-50 rounded">
          <summary className="font-semibold text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300">
            Do you deliver NYX, MAC, and Estée Lauder nationwide in Cameroon?
          </summary>
          <p className="text-gray-700 mt-2">
            Yes. We ship from Douala to cities nationwide. Delivery is fast and payment is 100% secure online.
          </p>
        </details>
        <details className="p-3 bg-pink-50 rounded">
          <summary className="font-semibold text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300">
            Are the products authentic?
          </summary>
          <p className="text-gray-700 mt-2">
            All items are 100% authentic. We publish FCFA price lists for transparency and keep popular items marked In stock.
          </p>
        </details>
        <details className="p-3 bg-pink-50 rounded">
          <summary className="font-semibold text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300">
            How can I find my foundation shade?
          </summary>
          <p className="text-gray-700 mt-2">
            Open any brand page and filter by category. For Estée Lauder Double Wear or MAC Studio Fix, contact support for a quick shade guide.
          </p>
        </details>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Do you deliver NYX, MAC, and Estée Lauder nationwide in Cameroon?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. We ship from Douala to cities nationwide. Delivery is fast and payment is 100% secure online.'
                }
              },
              {
                '@type': 'Question',
                name: 'Are the products authentic?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'All items are 100% authentic. We publish FCFA price lists for transparency and keep popular items marked In stock.'
                }
              },
              {
                '@type': 'Question',
                name: 'How can I find my foundation shade?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Open any brand page and filter by category. For Estée Lauder Double Wear or MAC Studio Fix, contact support for a quick shade guide.'
                }
              }
            ]
          })
        }}
      />
    </main>
  )
}