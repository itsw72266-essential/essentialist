// //app/brands/[brand]/BrandPageClient.jsx
// 'use client'

// import { useEffect, useMemo } from 'react'
// import Link from 'next/link'
// import { useQuery } from '@tanstack/react-query'

// import SummaryApi from '@/common/SummaryApi'
// import Axios from '@/utils/Axios'
// import { valideURLConvert } from '../../../utils/valideURLConvert'
// import {
//   useBrandsQuery,
//   useCategoriesQuery,
//   useSubCategoriesQuery
// } from '@/hooks/queries/useCatalogQueries'

// const SITE_URL = 'https://www.esmakeupstore.com'
// const SITE_NAME = 'Essentialist Makeup Store'
// const DEFAULT_OG_IMAGE =
//   'https://www.esmakeupstore.com/assets/staymattebutnotflatpowderfoundationmain.jpg'
// const DEFAULT_BRAND_DESCRIPTION =
//   'Shop authentic makeup with FCFA pricing. Fast delivery in Douala & nationwide across Cameroon.'

// function createBrandSlug(name = '') {
//   if (typeof name !== 'string') return ''
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
//   if (
//     product?._id &&
//     typeof product._id === 'string' &&
//     !raw.includes(product._id)
//   ) {
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

// function stripMarkdown(text = '') {
//   return text
//     .replace(/!\[[^\]]*]\([^)]+\)/g, '')
//     .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
//     .replace(/[#>*_~`-]/g, '')
//     .replace(/\r?\n|\r/g, ' ')
//     .replace(/\s{2,}/g, ' ')
//     .trim()
// }

// function computeBrandMetrics(productRows = []) {
//   const rows = Array.isArray(productRows) ? productRows : []
//   const totalProducts = rows.length
//   const sellPrices = rows
//     .map((row) => row.sellingPrice)
//     .filter((value) => typeof value === 'number')
//   const bulkPrices = rows
//     .map((row) => row.bulkPrice)
//     .filter((value) => typeof value === 'number')

//   const avgSellingPrice = sellPrices.length
//     ? Math.round(
//         sellPrices.reduce((sum, value) => sum + value, 0) / sellPrices.length
//       )
//     : undefined

//   const avgBulkPrice = bulkPrices.length
//     ? Math.round(
//         bulkPrices.reduce((sum, value) => sum + value, 0) / bulkPrices.length
//       )
//     : undefined

//   const totalValue = sellPrices.reduce((sum, value) => sum + value, 0)

//   const categories = Array.from(
//     new Set(rows.map((row) => row.categoryName).filter(Boolean))
//   ).sort()

//   const subCategories = Array.from(
//     new Set(rows.map((row) => row.subCategoryName).filter(Boolean))
//   ).sort()

//   return {
//     totalProducts,
//     avgSellingPrice,
//     avgBulkPrice,
//     totalValue,
//     categories,
//     subCategories
//   }
// }

// function getSubCatInfo(allSubCategory = [], row = {}) {
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
//         sub?.name?.trim()?.toLowerCase() ===
//         row.subCategoryName.trim().toLowerCase()
//     )
//     if (foundByName) return foundByName
//   }

//   return null
// }

// function getCategoryLinkMeta(allCategory = [], allSubCategory = [], row = {}) {
//   const subCat = getSubCatInfo(allSubCategory, row)
//   if (!subCat) return null

//   let mainCat = null

//   if (Array.isArray(subCat.category) && subCat.category.length) {
//     mainCat = Array.isArray(allCategory)
//       ? allCategory.find(
//           (cat) =>
//             cat?._id === subCat.category[0]?._id ||
//             cat?._id === subCat.category[0]
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
//             cat?.name?.trim()?.toLowerCase() ===
//             row.categoryName.trim().toLowerCase()
//         )
//       : null
//   }

//   if (!mainCat) return null
//   return { mainCat, subCat }
// }

// function buildSubCatUrl(mainCat = {}, subCat = {}) {
//   if (!mainCat?._id || !subCat?._id) return '#'
//   return `/${valideURLConvert(mainCat.name)}-${mainCat._id}/${valideURLConvert(
//     subCat.name
//   )}-${subCat._id}`
// }

// function useBrandDetailsQuery(brandSlug, { enabled = true, initialData } = {}) {
//   return useQuery({
//     queryKey: ['brand-detail', brandSlug],
//     enabled: enabled && Boolean(brandSlug),
//     initialData,
//     queryFn: async () => {
//       const tried = new Set()

//       const slugCandidates = [
//         brandSlug,
//         brandSlug?.toLowerCase(),
//         brandSlug?.toUpperCase(),
//         brandSlug?.replace(/-/g, ' '),
//         brandSlug?.replace(/-/g, '')
//       ].filter(Boolean)

//       for (const candidate of slugCandidates) {
//         const normalized = createBrandSlug(candidate)
//         if (!normalized || tried.has(normalized)) continue
//         tried.add(normalized)

//         const endpoint = SummaryApi.getBrandDetails(candidate)

//         try {
//           const response = await Axios({
//             ...endpoint,
//             params: {
//               ...(endpoint?.params ?? {}),
//               includeProducts: true,
//               brandSlug: endpoint?.params?.brandSlug ?? normalized,
//               slug: endpoint?.params?.slug ?? normalized
//             }
//           })

//           const payload = response?.data
//           const brand = payload?.data || payload?.brand || payload

//           if (brand) {
//             return {
//               ...brand,
//               slug: createBrandSlug(brand.slug || brand.name || candidate)
//             }
//           }
//         } catch (error) {
//           if (error?.response?.status === 404) {
//             continue
//           }
//           throw error
//         }
//       }

//       throw new Error('Brand not found')
//     },
//     retry: (failureCount, error) => {
//       if (
//         error?.message === 'Brand not found' ||
//         error?.response?.status === 404
//       ) {
//         return false
//       }
//       return failureCount < 2
//     }
//   })
// }

// function useBrandProductsQuery(brand, enabled) {
//   return useQuery({
//     queryKey: ['brand-products', brand?._id || brand?.slug || brand?.name],
//     enabled: enabled && Boolean(brand),
//     queryFn: async () => {
//       if (Array.isArray(brand?.products) && brand.products.length) {
//         return brand.products
//       }

//       const filterPayload = brand?._id
//         ? { brandId: brand._id, page: 1, limit: 500, onlyActive: true }
//         : {
//             brandSlug: brand?.slug || createBrandSlug(brand?.name),
//             page: 1,
//             limit: 500
//           }

//       const response = await Axios({
//         ...SummaryApi.getProduct,
//         data: {
//           ...filterPayload,
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
//         throw new Error('Unexpected product payload')
//       }

//       return items
//     },
//     retry: 1
//   })
// }

// function BrandStructuredData({ brand = {}, products = [] }) {
//   if (!brand?.name) return null

//   const description =
//     stripMarkdown(brand.description || brand.shortDescription || '') ||
//     DEFAULT_BRAND_DESCRIPTION

//   const brandJsonLd = {
//     '@context': 'https://schema.org',
//     '@type': 'Brand',
//     name: brand.name,
//     url: `${SITE_URL}/brands/${brand.slug || createBrandSlug(brand.name || '')}`,
//     description,
//     image: brand.logo || undefined,
//     logo: brand.logo || undefined
//   }

//   const productListJsonLd = {
//     '@context': 'https://schema.org',
//     '@type': 'ItemList',
//     name: brand.name,
//     numberOfItems: Array.isArray(products) ? products.length : 0,
//     itemListElement: (Array.isArray(products) ? products : [])
//       .slice(0, 20)
//       .map((product, index) => ({
//         '@type': 'ListItem',
//         position: index + 1,
//         item: {
//           '@type': 'Product',
//           name: product.name,
//           brand: { '@type': 'Brand', name: product.brandName },
//           category: product.subCategoryName || product.categoryName,
//           offers: {
//             '@type': 'Offer',
//             priceCurrency: 'XAF',
//             price:
//               typeof product.sellingPrice === 'number'
//                 ? String(product.sellingPrice)
//                 : undefined,
//             availability: 'https://schema.org/InStock'
//           }
//         }
//       }))
//   }

//   return (
//     <>
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(brandJsonLd) }}
//       />
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: JSON.stringify(productListJsonLd) }}
//       />
//     </>
//   )
// }

// function BrandNavigation({ brands = [], currentSlug }) {
//   if (!Array.isArray(brands) || brands.length === 0) return null

//   return (
//     <div className="mb-8 bg-white rounded-lg shadow-md p-4">
//       <h3 className="text-lg font-semibold text-gray-800 mb-4">
//         Shop by Brand:
//       </h3>
//       <div className="flex flex-wrap gap-2">
//         <Link
//           href="/brands"
//           className="px-4 py-2 rounded-full border transition-colors bg-gray-100 text-gray-700 border-gray-300 hover:bg-pink-50 hover:border-pink-300"
//         >
//           All Brands
//         </Link>
//         {brands.map((brand) => {
//           const slug = brand.slug || createBrandSlug(brand.name || '')
//           const isActive = slug === currentSlug
//           return (
//             <Link
//               key={brand._id || slug}
//               href={`/brands/${slug}`}
//               className={`px-4 py-2 rounded-full border transition-colors ${
//                 isActive
//                   ? 'bg-pink-500 text-white border-pink-500'
//                   : 'bg-white text-gray-700 border-gray-300 hover:bg-pink-50 hover:border-pink-300'
//               }`}
//             >
//               {brand.name}
//             </Link>
//           )
//         })}
//       </div>
//     </div>
//   )
// }

// function LoadingState() {
//   return (
//     <main className="bg-gradient-to-b from-pink-50 to-white min-h-screen py-10 px-2 md:px-10">
//       <section className="max-w-4xl mx-auto animate-pulse">
//         <div className="h-10 bg-pink-200/60 rounded w-2/3 mx-auto mb-4" />
//         <div className="h-4 bg-pink-100/80 rounded w-1/2 mx-auto mb-8" />
//         <div className="h-24 bg-white rounded-lg shadow-sm mb-6" />
//         <div className="h-72 bg-white rounded-lg shadow-sm" />
//       </section>
//     </main>
//   )
// }

// function ErrorState({ message }) {
//   return (
//     <main className="bg-gradient-to-b from-pink-50 to-white min-h-screen py-10 px-2 md:px-10">
//       <section className="max-w-3xl mx-auto bg-white border border-red-200 rounded-xl shadow p-8 text-center space-y-4">
//         <h1 className="text-2xl font-bold text-red-500">Unable to load brand</h1>
//         <p className="text-gray-700">
//           We hit a snag while retrieving the brand catalogue. Please refresh or try again later.
//         </p>
//         {message && <p className="text-sm text-red-400">{message}</p>}
//         <Link
//           href="/brands"
//           className="inline-flex mt-4 px-6 py-3 rounded-full bg-pink-500 text-white font-semibold hover:bg-pink-600 transition"
//         >
//           Back to all brands
//         </Link>
//       </section>
//     </main>
//   )
// }

// function BrandNotFound({ brandSlug }) {
//   return (
//     <main className="bg-gradient-to-b from-pink-50 to-white min-h-screen py-10 px-2 md:px-10">
//       <section className="max-w-4xl mx-auto text-center bg-white border border-pink-200 rounded-lg shadow p-8">
//         <h1 className="text-3xl font-bold text-pink-500">Brand temporarily unavailable</h1>
//         <p className="mt-4 text-gray-600">
//           We couldn’t load brand details right now. Please ensure the API is reachable and try again.
//         </p>
//         <p className="mt-2 text-gray-500 text-sm">
//           Requested brand slug: <code>{brandSlug}</code>
//         </p>
//         <Link
//           href="/brands"
//           className="inline-flex mt-6 px-6 py-3 rounded-full bg-pink-500 text-white font-semibold hover:bg-pink-600 transition"
//         >
//           Back to all brands
//         </Link>
//       </section>
//     </main>
//   )
// }

// async function pingBrandIndexNow(brandSlug) {
//   try {
//     await fetch('/api/indexnow/submit-url', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ url: `${SITE_URL}/brands/${brandSlug}` })
//     })
//   } catch (error) {
//     console.warn('[brand page] pingIndexNow failed', error)
//   }
// }

// export default function BrandPageClient({ brandSlug }) {
//   const {
//     data: allBrands = [],
//     isLoading: isBrandsLoading
//   } = useBrandsQuery({ enabled: true })

//   const fallbackBrand = useMemo(() => {
//     if (!Array.isArray(allBrands) || !brandSlug) return undefined
//     return allBrands.find((brand) => {
//       const slug = brand.slug || createBrandSlug(brand.name || '')
//       return slug === brandSlug
//     })
//   }, [allBrands, brandSlug])

//   const {
//     data: brandDetailData,
//     isLoading: isBrandLoadingRaw,
//     isError: isBrandError,
//     error: brandError
//   } = useBrandDetailsQuery(brandSlug, {
//     enabled: Boolean(brandSlug),
//     initialData: fallbackBrand
//   })

//   const brandData = brandDetailData || fallbackBrand

//   const {
//     data: allCategory = [],
//     isLoading: isCategoriesLoading
//   } = useCategoriesQuery({ enabled: true })

//   const {
//     data: allSubCategory = [],
//     isLoading: isSubCategoriesLoading
//   } = useSubCategoriesQuery({ enabled: true })

//   const {
//     data: brandProducts = [],
//     isLoading: isProductsLoading,
//     isError: isProductsError,
//     error: productsError
//   } = useBrandProductsQuery(brandData, Boolean(brandData))

//   useEffect(() => {
//     if (!brandSlug) return
//     if (process.env.NODE_ENV !== 'production') return
//     void pingBrandIndexNow(brandSlug)
//   }, [brandSlug])

//   const productRows = useMemo(
//     () =>
//       Array.isArray(brandProducts)
//         ? brandProducts.map(normalizeProductRow)
//         : [],
//     [brandProducts]
//   )

//   const metrics = useMemo(() => computeBrandMetrics(productRows), [productRows])

//   const currentSlug = brandData?.slug || createBrandSlug(brandData?.name || '')

//   const brandForNavigation = useMemo(
//     () =>
//       Array.isArray(allBrands)
//         ? allBrands.map((brand) => ({
//             ...brand,
//             slug: brand.slug || createBrandSlug(brand.name || '')
//           }))
//         : [],
//     [allBrands]
//   )

//   const plainBrandDescription = stripMarkdown(
//     brandData?.description || brandData?.shortDescription || ''
//   )

//   const brandStillLoading =
//     (isBrandLoadingRaw && !brandData) ||
//     isBrandsLoading ||
//     isCategoriesLoading ||
//     isSubCategoriesLoading ||
//     (isProductsLoading && !brandProducts)

//   if (brandStillLoading) {
//     return <LoadingState />
//   }

//   const blockingBrandError = isBrandError && !brandData

//   if (blockingBrandError) {
//     if (brandError?.message === 'Brand not found') {
//       return <BrandNotFound brandSlug={brandSlug} />
//     }
//     return <ErrorState message={brandError?.message} />
//   }

//   if (!brandData) {
//     return <BrandNotFound brandSlug={brandSlug} />
//   }

//   if (isProductsError) {
//     return <ErrorState message={productsError?.message} />
//   }

//   return (
//     <main className="bg-gradient-to-b from-pink-50 to-white min-h-screen py-10 px-2 md:px-10">
//       <BrandStructuredData brand={brandData} products={productRows} />

//       <header className="text-center mb-8">
//         <h1 className="text-4xl md:text-6xl font-extrabold text-pink-400 mb-2 tracking-tight">
//           {String(brandData.name || '').toUpperCase()} 
//         </h1>
//         <p className="text-lg md:text-2xl text-gray-700 font-semibold">
//           Authentic {brandData.name} Products in Cameroon
//         </p>

//         <p className="text-gray-600 text-sm mt-4">
//           Categories:{' '}
//           {metrics.subCategories.length
//             ? metrics.subCategories.slice(0, 8).join(', ')
//             : 'Foundation, Lip makeup, Eye makeup'}
//           {metrics.subCategories.length > 8 ? '…' : ''}
//         </p>
//         {plainBrandDescription && (
//           <p className="text-gray-600 mt-4 text-sm max-w-3xl mx-auto">
//             {plainBrandDescription}
//           </p>
//         )}
//       </header>

//       <BrandNavigation brands={brandForNavigation} currentSlug={currentSlug} />

//       <section
//         aria-labelledby="brand-products"
//         className="overflow-x-auto rounded-lg border border-pink-200 shadow-lg bg-white"
//       >
//         <div className="bg-gradient-to-r from-pink-300 to-pink-200 text-gray-700 p-4">
//           <h2 id="brand-products" className="text-xl font-bold">
//             Complete {brandData.name} Product Catalog
//           </h2>
//           <p className="text-gray-700 text-sm mt-1">
//             All {metrics.totalProducts} authentic {brandData.name} products with current FCFA pricing
//           </p>
//         </div>

//         <table className="min-w-full text-sm md:text-base">
//           <thead>
//             <tr className="bg-pink-100 text-black">
//               <th scope="col" className="py-3 px-2 md:px-4 font-bold text-left">
//                 Product
//               </th>
//               <th scope="col" className="py-3 px-2 md:px-4 font-bold text-left">
//                 Category
//               </th>
//               <th scope="col" className="py-3 px-2 md:px-4 font-bold text-right">
//                 Bulk Price
//               </th>
//               <th scope="col" className="py-3 px-2 md:px-4 font-bold text-right">
//                 Selling Price
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {productRows.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan={4}
//                   className="py-6 px-4 text-center text-gray-500 italic bg-white"
//                 >
//                   No products listed yet for this brand.
//                 </td>
//               </tr>
//             ) : (
//               productRows.map((row, index) => {
//                 const linkMeta = getCategoryLinkMeta(
//                   allCategory,
//                   allSubCategory,
//                   row
//                 )
//                 const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-pink-50'

//                 return (
//                   <tr key={row.id || `${row.name}-${index}`} className={rowClass}>
//                     <td className="py-3 px-2 md:px-4 font-semibold text-gray-900">
//                       {row.productSlug ? (
//                         <Link
//                           href={`/product/${row.productSlug}`}
//                           className="text-gray-900 hover:text-pink-500 underline decoration-pink-300 decoration-2 underline-offset-2 transition-colors font-medium"
//                           aria-label={`View ${row.name}`}
//                         >
//                           {row.name}
//                         </Link>
//                       ) : (
//                         <span>{row.name}</span>
//                       )}
//                     </td>
//                     <td className="py-3 px-2 md:px-4">
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
//                     <td className="py-3 px-2 md:px-4 text-right font-bold text-green-600">
//                       {FCFA(row.bulkPrice)}
//                     </td>
//                     <td className="py-3 px-2 md:px-4 text-right font-bold text-pink-500">
//                       {FCFA(row.sellingPrice)}
//                     </td>
//                   </tr>
//                 )
//               })
//             )}
//           </tbody>
//         </table>
//       </section>

//       <section className="mt-8 max-w-3xl mx-auto text-center text-gray-700">
//         <p>
//           Looking for {brandData.name} in Douala? Compare FCFA prices and shop online with nationwide delivery. Popular picks include primers, foundations, and setting powders. Need help choosing a shade?{' '}
//           <a href="mailto:info@esmakeupstore.com" className="underline text-pink-500">
//             Email our team
//           </a>
//           .
//         </p>
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
//                 name: `Is ${brandData.name} available in stock?`,
//                 acceptedAnswer: {
//                   '@type': 'Answer',
//                   text: `Yes, most ${brandData.name} items listed here are marked In stock and ship nationwide in Cameroon.`
//                 }
//               },
//               {
//                 '@type': 'Question',
//                 name: `How much is ${brandData.name} foundation in FCFA?`,
//                 acceptedAnswer: {
//                   '@type': 'Answer',
//                   text: 'Prices vary by shade and line. Check the table for live FCFA pricing or contact us for assistance.'
//                 }
//               }
//             ]
//           })
//         }}
//       />
//     </main>
//   )
// }








//app/brands/[brand]/BrandPageClient.jsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

import SummaryApi from '@/common/SummaryApi'
import Axios from '@/utils/Axios'
import { valideURLConvert } from '../../../utils/valideURLConvert'
import {
  useBrandsQuery,
  useCategoriesQuery,
  useSubCategoriesQuery
} from '@/hooks/queries/useCatalogQueries'

const SITE_URL = 'https://www.esmakeupstore.com'
const SITE_NAME = 'Essentialist Makeup Store'
const DEFAULT_OG_IMAGE =
  'https://www.esmakeupstore.com/assets/staymattebutnotflatpowderfoundationmain.jpg'
const DEFAULT_BRAND_DESCRIPTION =
  'Shop authentic makeup with FCFA pricing. Fast delivery in Douala & nationwide across Cameroon.'

const ITEMS_PER_PAGE = 20;

function createBrandSlug(name = '') {
  if (typeof name !== 'string') return ''
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
  if (
    product?._id &&
    typeof product._id === 'string' &&
    !raw.includes(product._id)
  ) {
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

function stripMarkdown(text = '') {
  return text
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[#>*_~`-]/g, '')
    .replace(/\r?\n|\r/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function computeBrandMetrics(productRows = []) {
  const rows = Array.isArray(productRows) ? productRows : []
  const totalProducts = rows.length
  const sellPrices = rows
    .map((row) => row.sellingPrice)
    .filter((value) => typeof value === 'number')
  const bulkPrices = rows
    .map((row) => row.bulkPrice)
    .filter((value) => typeof value === 'number')

  const avgSellingPrice = sellPrices.length
    ? Math.round(
        sellPrices.reduce((sum, value) => sum + value, 0) / sellPrices.length
      )
    : undefined

  const avgBulkPrice = bulkPrices.length
    ? Math.round(
        bulkPrices.reduce((sum, value) => sum + value, 0) / bulkPrices.length
      )
    : undefined

  const totalValue = sellPrices.reduce((sum, value) => sum + value, 0)

  const categories = Array.from(
    new Set(rows.map((row) => row.categoryName).filter(Boolean))
  ).sort()

  const subCategories = Array.from(
    new Set(rows.map((row) => row.subCategoryName).filter(Boolean))
  ).sort()

  return {
    totalProducts,
    avgSellingPrice,
    avgBulkPrice,
    totalValue,
    categories,
    subCategories
  }
}

function getSubCatInfo(allSubCategory = [], row = {}) {
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
        sub?.name?.trim()?.toLowerCase() ===
        row.subCategoryName.trim().toLowerCase()
    )
    if (foundByName) return foundByName
  }

  return null
}

function getCategoryLinkMeta(allCategory = [], allSubCategory = [], row = {}) {
  const subCat = getSubCatInfo(allSubCategory, row)
  if (!subCat) return null

  let mainCat = null

  if (Array.isArray(subCat.category) && subCat.category.length) {
    mainCat = Array.isArray(allCategory)
      ? allCategory.find(
          (cat) =>
            cat?._id === subCat.category[0]?._id ||
            cat?._id === subCat.category[0]
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
            cat?.name?.trim()?.toLowerCase() ===
            row.categoryName.trim().toLowerCase()
        )
      : null
  }

  if (!mainCat) return null
  return { mainCat, subCat }
}

function buildSubCatUrl(mainCat = {}, subCat = {}) {
  if (!mainCat?._id || !subCat?._id) return '#'
  return `/${valideURLConvert(mainCat.name)}-${mainCat._id}/${valideURLConvert(
    subCat.name
  )}-${subCat._id}`
}

function useBrandDetailsQuery(brandSlug, { enabled = true, initialData } = {}) {
  return useQuery({
    queryKey: ['brand-detail', brandSlug],
    enabled: enabled && Boolean(brandSlug),
    initialData,
    queryFn: async () => {
      const tried = new Set()

      const slugCandidates = [
        brandSlug,
        brandSlug?.toLowerCase(),
        brandSlug?.toUpperCase(),
        brandSlug?.replace(/-/g, ' '),
        brandSlug?.replace(/-/g, '')
      ].filter(Boolean)

      for (const candidate of slugCandidates) {
        const normalized = createBrandSlug(candidate)
        if (!normalized || tried.has(normalized)) continue
        tried.add(normalized)

        const endpoint = SummaryApi.getBrandDetails(candidate)

        try {
          const response = await Axios({
            ...endpoint,
            params: {
              ...(endpoint?.params ?? {}),
              includeProducts: true,
              brandSlug: endpoint?.params?.brandSlug ?? normalized,
              slug: endpoint?.params?.slug ?? normalized
            }
          })

          const payload = response?.data
          const brand = payload?.data || payload?.brand || payload

          if (brand) {
            return {
              ...brand,
              slug: createBrandSlug(brand.slug || brand.name || candidate)
            }
          }
        } catch (error) {
          if (error?.response?.status === 404) {
            continue
          }
          throw error
        }
      }

      throw new Error('Brand not found')
    },
    retry: (failureCount, error) => {
      if (
        error?.message === 'Brand not found' ||
        error?.response?.status === 404
      ) {
        return false
      }
      return failureCount < 2
    }
  })
}

function useBrandProductsQuery(brand, enabled) {
  return useQuery({
    queryKey: ['brand-products', brand?._id || brand?.slug || brand?.name],
    enabled: enabled && Boolean(brand),
    queryFn: async () => {
      if (Array.isArray(brand?.products) && brand.products.length) {
        return brand.products
      }

      const filterPayload = brand?._id
        ? { brandId: brand._id, page: 1, limit: 500, onlyActive: true }
        : {
            brandSlug: brand?.slug || createBrandSlug(brand?.name),
            page: 1,
            limit: 500
          }

      const response = await Axios({
        ...SummaryApi.getProduct,
        data: {
          ...filterPayload,
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
        throw new Error('Unexpected product payload')
      }

      return items
    },
    retry: 1
  })
}

function BrandStructuredData({ brand = {}, products = [] }) {
  if (!brand?.name) return null

  const description =
    stripMarkdown(brand.description || brand.shortDescription || '') ||
    DEFAULT_BRAND_DESCRIPTION

  const brandJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: brand.name,
    url: `${SITE_URL}/brands/${brand.slug || createBrandSlug(brand.name || '')}`,
    description,
    image: brand.logo || undefined,
    logo: brand.logo || undefined
  }

  const productListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: brand.name,
    numberOfItems: Array.isArray(products) ? products.length : 0,
    itemListElement: (Array.isArray(products) ? products : [])
      .slice(0, 20)
      .map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          brand: { '@type': 'Brand', name: product.brandName },
          category: product.subCategoryName || product.categoryName,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'XAF',
            price:
              typeof product.sellingPrice === 'number'
                ? String(product.sellingPrice)
                : undefined,
            availability: 'https://schema.org/InStock'
          }
        }
      }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productListJsonLd) }}
      />
    </>
  )
}

function BrandNavigation({ brands = [], currentSlug }) {
  if (!Array.isArray(brands) || brands.length === 0) return null

  return (
    <div className="mb-8 bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Shop by Brand:
      </h3>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/brands"
          className="px-4 py-2 rounded-full border transition-colors bg-gray-100 text-gray-700 border-gray-300 hover:bg-pink-50 hover:border-pink-300"
        >
          All Brands
        </Link>
        {brands.map((brand) => {
          const slug = brand.slug || createBrandSlug(brand.name || '')
          const isActive = slug === currentSlug
          return (
            <Link
              key={brand._id || slug}
              href={`/brands/${slug}`}
              className={`px-4 py-2 rounded-full border transition-colors ${
                isActive
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-pink-50 hover:border-pink-300'
              }`}
            >
              {brand.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <main className="bg-gradient-to-b from-pink-50 to-white min-h-screen py-10 px-2 md:px-10">
      <section className="max-w-4xl mx-auto animate-pulse">
        <div className="h-10 bg-pink-200/60 rounded w-2/3 mx-auto mb-4" />
        <div className="h-4 bg-pink-100/80 rounded w-1/2 mx-auto mb-8" />
        <div className="h-24 bg-white rounded-lg shadow-sm mb-6" />
        <div className="h-72 bg-white rounded-lg shadow-sm" />
      </section>
    </main>
  )
}

function ErrorState({ message }) {
  return (
    <main className="bg-gradient-to-b from-pink-50 to-white min-h-screen py-10 px-2 md:px-10">
      <section className="max-w-3xl mx-auto bg-white border border-red-200 rounded-xl shadow p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-500">Unable to load brand</h1>
        <p className="text-gray-700">
          We hit a snag while retrieving the brand catalogue. Please refresh or try again later.
        </p>
        {message && <p className="text-sm text-red-400">{message}</p>}
        <Link
          href="/brands"
          className="inline-flex mt-4 px-6 py-3 rounded-full bg-pink-500 text-white font-semibold hover:bg-pink-600 transition"
        >
          Back to all brands
        </Link>
      </section>
    </main>
  )
}

function BrandNotFound({ brandSlug }) {
  return (
    <main className="bg-gradient-to-b from-pink-50 to-white min-h-screen py-10 px-2 md:px-10">
      <section className="max-w-4xl mx-auto text-center bg-white border border-pink-200 rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-pink-500">Brand temporarily unavailable</h1>
        <p className="mt-4 text-gray-600">
          We couldn’t load brand details right now. Please ensure the API is reachable and try again.
        </p>
        <p className="mt-2 text-gray-500 text-sm">
          Requested brand slug: <code>{brandSlug}</code>
        </p>
        <Link
          href="/brands"
          className="inline-flex mt-6 px-6 py-3 rounded-full bg-pink-500 text-white font-semibold hover:bg-pink-600 transition"
        >
          Back to all brands
        </Link>
      </section>
    </main>
  )
}

async function pingBrandIndexNow(brandSlug) {
  try {
    await fetch('/api/indexnow/submit-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: `${SITE_URL}/brands/${brandSlug}` })
    })
  } catch (error) {
    console.warn('[brand page] pingIndexNow failed', error)
  }
}

export default function BrandPageClient({ brandSlug }) {
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: allBrands = [],
    isLoading: isBrandsLoading
  } = useBrandsQuery({ enabled: true })

  const fallbackBrand = useMemo(() => {
    if (!Array.isArray(allBrands) || !brandSlug) return undefined
    return allBrands.find((brand) => {
      const slug = brand.slug || createBrandSlug(brand.name || '')
      return slug === brandSlug
    })
  }, [allBrands, brandSlug])

  const {
    data: brandDetailData,
    isLoading: isBrandLoadingRaw,
    isError: isBrandError,
    error: brandError
  } = useBrandDetailsQuery(brandSlug, {
    enabled: Boolean(brandSlug),
    initialData: fallbackBrand
  })

  const brandData = brandDetailData || fallbackBrand
  const currentSlug = brandData?.slug || createBrandSlug(brandData?.name || '')

  const {
    data: allCategory = [],
    isLoading: isCategoriesLoading
  } = useCategoriesQuery({ enabled: true })

  const {
    data: allSubCategory = [],
    isLoading: isSubCategoriesLoading
  } = useSubCategoriesQuery({ enabled: true })

  const {
    data: brandProducts = [],
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError
  } = useBrandProductsQuery(brandData, Boolean(brandData))

  useEffect(() => {
    setCurrentPage(1);
  }, [brandSlug]);

  useEffect(() => {
    if (!brandSlug) return
    if (process.env.NODE_ENV !== 'production') return
    void pingBrandIndexNow(brandSlug)
  }, [brandSlug])

  // THE FIX: Strict client-side filter to toss out products not matching this brand
  const productRows = useMemo(() => {
    if (!Array.isArray(brandProducts)) return [];
    
    const allNormalized = brandProducts.map(normalizeProductRow);
    
    // Safety Net: Filter out anything that doesn't exactly match the current brand slug
    if (currentSlug) {
      return allNormalized.filter(product => product.brandSlug === currentSlug);
    }
    
    return allNormalized;
  }, [brandProducts, currentSlug])

  const totalPages = Math.ceil(productRows.length / ITEMS_PER_PAGE);
  const paginatedRows = productRows.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const metrics = useMemo(() => computeBrandMetrics(productRows), [productRows])

  const brandForNavigation = useMemo(
    () =>
      Array.isArray(allBrands)
        ? allBrands.map((brand) => ({
            ...brand,
            slug: brand.slug || createBrandSlug(brand.name || '')
          }))
        : [],
    [allBrands]
  )

  const plainBrandDescription = stripMarkdown(
    brandData?.description || brandData?.shortDescription || ''
  )

  const brandStillLoading =
    (isBrandLoadingRaw && !brandData) ||
    isBrandsLoading ||
    isCategoriesLoading ||
    isSubCategoriesLoading ||
    (isProductsLoading && !brandProducts)

  if (brandStillLoading) {
    return <LoadingState />
  }

  const blockingBrandError = isBrandError && !brandData

  if (blockingBrandError) {
    if (brandError?.message === 'Brand not found') {
      return <BrandNotFound brandSlug={brandSlug} />
    }
    return <ErrorState message={brandError?.message} />
  }

  if (!brandData) {
    return <BrandNotFound brandSlug={brandSlug} />
  }

  if (isProductsError) {
    return <ErrorState message={productsError?.message} />
  }

  return (
    <main className="bg-gradient-to-b from-pink-50 to-white min-h-screen py-10 px-2 md:px-10">
      <BrandStructuredData brand={brandData} products={productRows} />

      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-extrabold text-pink-400 mb-2 tracking-tight">
          Shop {String(brandData.name || '').toUpperCase()} Makeup
        </h1>
        <h2 className="text-lg md:text-2xl text-gray-700 font-semibold">
          Authentic {brandData.name} Cosmetic Products in Cameroon
        </h2>

        <p className="text-gray-600 text-sm mt-4">
          Categories:{' '}
          {metrics.subCategories.length
            ? metrics.subCategories.slice(0, 8).join(', ')
            : 'Foundation, Lip makeup, Eye makeup'}
          {metrics.subCategories.length > 8 ? '…' : ''}
        </p>
        {plainBrandDescription && (
          <p className="text-gray-600 mt-4 text-sm max-w-3xl mx-auto">
            {plainBrandDescription}
          </p>
        )}
      </header>

      <BrandNavigation brands={brandForNavigation} currentSlug={currentSlug} />

      <section
        aria-labelledby="brand-products"
        className="overflow-x-auto rounded-lg border border-pink-200 shadow-lg bg-white"
      >
        <div className="bg-gradient-to-r from-pink-300 to-pink-200 text-gray-700 p-4">
          <h2 id="brand-products" className="text-xl font-bold">
            Complete {brandData.name} Product Catalog
          </h2>
          <p className="text-gray-700 text-sm mt-1">
            All {metrics.totalProducts} authentic {brandData.name} products with current FCFA pricing
          </p>
        </div>

        <table className="min-w-full text-sm md:text-base">
          <thead>
            <tr className="bg-pink-100 text-black">
              <th scope="col" className="py-3 px-2 md:px-4 font-bold text-left">
                Product
              </th>
              <th scope="col" className="py-3 px-2 md:px-4 font-bold text-left">
                Category
              </th>
              <th scope="col" className="py-3 px-2 md:px-4 font-bold text-right">
                Bulk Price
              </th>
              <th scope="col" className="py-3 px-2 md:px-4 font-bold text-right">
                Selling Price
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-6 px-4 text-center text-gray-500 italic bg-white"
                >
                  No products listed yet for this brand.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, index) => {
                const linkMeta = getCategoryLinkMeta(
                  allCategory,
                  allSubCategory,
                  row
                )
                const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-pink-50'

                return (
                  <tr key={row.id || `${row.name}-${index}`} className={rowClass}>
                    <td className="py-3 px-2 md:px-4 font-semibold text-gray-900">
                      {row.productSlug ? (
                        <Link
                          href={`/product/${row.productSlug}`}
                          className="text-gray-900 hover:text-pink-500 underline decoration-pink-300 decoration-2 underline-offset-2 transition-colors font-medium"
                          aria-label={`View ${row.name}`}
                        >
                          {row.name}
                        </Link>
                      ) : (
                        <span>{row.name}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 md:px-4">
                      {linkMeta ? (
                        <Link
                          href={buildSubCatUrl(linkMeta.mainCat, linkMeta.subCat)}
                          className="underline text-blue-700 hover:text-pink-500 transition font-medium focus:outline-none focus:ring-2 focus:ring-pink-300 rounded"
                          aria-label={`Browse ${row.subCategoryName} in ${linkMeta.mainCat?.name}`}
                        >
                          {row.subCategoryName || row.categoryName || 'View'}
                        </Link>
                      ) : (
                        <span className="text-gray-500">
                          {row.subCategoryName || row.categoryName || '—'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 md:px-4 text-right font-bold text-green-600">
                      {FCFA(row.bulkPrice)}
                    </td>
                    <td className="py-3 px-2 md:px-4 text-right font-bold text-pink-500">
                      {FCFA(row.sellingPrice)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-pink-200 bg-white">
            <span className="text-sm text-gray-600 mb-4 sm:mb-0">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, productRows.length)} of {productRows.length} products
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
        )}
      </section>

      <section className="mt-8 max-w-4xl mx-auto text-center text-gray-700 bg-pink-50 p-6 rounded-lg border border-pink-100">
        <p className="leading-relaxed">
          Looking to buy <strong>{brandData.name} makeup in Douala</strong> or anywhere in Cameroon?
          The Essentialist Makeup Store is your trusted source for authentic <strong>cosmetic products</strong>
          and professional beauty supplies. Compare our transparent FCFA prices on top-rated {brandData.name}
          foundations, blurring setting powders, lip glosses, and other skin essentials.
          Need help matching your shade or building your makeup kit?{' '}
          <a href="mailto:info@esmakeupstore.com" className="font-semibold text-pink-500 hover:text-pink-600 underline decoration-pink-300">
            Email our beauty team
          </a>
          {' '}for a personalized consultation. Enjoy fast, reliable delivery nationwide!
        </p>
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
                name: `Is ${brandData.name} available in stock?`,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: `Yes, most ${brandData.name} items listed here are marked In stock and ship nationwide in Cameroon.`
                }
              },
              {
                '@type': 'Question',
                name: `How much is ${brandData.name} foundation in FCFA?`,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Prices vary by shade and line. Check the table for live FCFA pricing or contact us for assistance.'
                }
              }
            ]
          })
        }}
      />
    </main>
  )
}