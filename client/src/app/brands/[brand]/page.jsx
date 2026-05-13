// // app/brands/[brand]/page.jsx
// import { notFound } from 'next/navigation'
// import BrandPageClient from './BrandPageClient'

// const SITE_URL = 'https://www.esmakeupstore.com'
// const SITE_NAME = 'Essentialist Makeup Store'
// const DEFAULT_OG_IMAGE =
//   'https://www.esmakeupstore.com/assets/staymattebutnotflatpowderfoundationmain.jpg'
// const DEFAULT_BRAND_DESCRIPTION =
//   'Shop authentic makeup with FCFA pricing. Fast delivery in Douala & nationwide across Cameroon.'
// const BUILD_VALIDATION_PLACEHOLDER = '__build-validation__'

// // Make sure these slugs are always generated even if the API omits them.
// const HARDCODED_BRAND_SLUGS = ['estee-lauder']

// const RAW_API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').trim()
// const API_BASE = RAW_API_BASE.replace(/\/$/, '')
// const IS_EXPORT_MODE = process.env.NEXT_EXPORT === 'true'
// const IS_LOCALHOST_API = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(API_BASE)
// const CAN_USE_REMOTE_API =
//   Boolean(API_BASE) && !(IS_EXPORT_MODE && IS_LOCALHOST_API)

// /* -------------------------------------------------------------------------- */
// /* Helper utilities                                                           */
// /* -------------------------------------------------------------------------- */

// function createBrandSlug(source = '') {
//   if (typeof source !== 'string') return ''
//   return source
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

// function canonicalizeBrandSlug(candidate) {
//   if (!candidate) return ''
//   if (typeof candidate === 'string') return createBrandSlug(candidate)
//   if (typeof candidate.slug === 'string' && candidate.slug.trim()) {
//     return createBrandSlug(candidate.slug)
//   }
//   return createBrandSlug(
//     candidate.name || candidate.title || candidate._id || '',
//   )
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

// async function fetchJson(url, init = {}) {
//   if (!CAN_USE_REMOTE_API) return null

//   try {
//     const res = await fetch(url, init)
//     if (res.status === 404) return null
//     if (!res.ok) {
//       const body = await res
//         .text()
//         .catch(() => res.statusText || 'Request failed')
//       throw new Error(`Request failed ${res.status}: ${body}`)
//     }
//     return res.json()
//   } catch (error) {
//     console.warn('[brand page] fetchJson failed', { url, error })
//     return null
//   }
// }

// async function fetchBrandCollection() {
//   if (!CAN_USE_REMOTE_API) return []

//   const payload = await fetchJson(
//     `${API_BASE}/api/brand/list?limit=500&sort=nameAsc&onlyActive=true`,
//     { cache: 'no-store' },
//   )

//   const items =
//     payload?.data?.items ||
//     payload?.data ||
//     payload?.brands ||
//     payload?.items ||
//     []

//   return Array.isArray(items) ? items : []
// }

// async function fetchBrandBySlug(slug) {
//   if (!CAN_USE_REMOTE_API || !slug) return null

//   const direct = await fetchJson(
//     `${API_BASE}/api/brand/${encodeURIComponent(slug)}?includeProducts=true`,
//     { cache: 'no-store' },
//   )
//   const directNormalized = direct?.data || direct?.brand || direct
//   if (directNormalized) return directNormalized

//   const brands = await fetchBrandCollection()
//   return brands.find((brand) => canonicalizeBrandSlug(brand) === slug) || null
// }

// async function fetchProductsByBrand(brand) {
//   if (!CAN_USE_REMOTE_API || !brand) return []

//   if (Array.isArray(brand.products) && brand.products.length) {
//     return brand.products
//   }

//   const filterPayload = brand._id
//     ? { brandId: brand._id, page: 1, limit: 500, onlyActive: true }
//     : { brandSlug: canonicalizeBrandSlug(brand), page: 1, limit: 500 }

//   const payload = await fetchJson(`${API_BASE}/api/product/get`, {
//     cache: 'no-store',
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       ...filterPayload,
//       include: ['brand', 'category', 'subCategory'],
//     }),
//   })

//   const items =
//     payload?.data?.items ||
//     payload?.data?.products ||
//     payload?.data ||
//     payload?.items ||
//     []

//   return Array.isArray(items) ? items : []
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
//         '',
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
//         '',
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
//           product?.wholesale,
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
//           product?.sell,
//         ]

//   return sources.find(
//     (value) => typeof value === 'number' && Number.isFinite(value),
//   )
// }

// function normalizeProductRow(product = {}) {
//   const brandEntity = product?.brand || product?.brandId || product?.brandInfo
//   const brandSlug = canonicalizeBrandSlug(
//     typeof brandEntity === 'object' && brandEntity
//       ? brandEntity.slug || brandEntity.name
//       : brandEntity || product?.brandName,
//   )

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

//   const baseSlug =
//     typeof product?.slug === 'string' && product.slug.trim()
//       ? product.slug.trim()
//       : createBrandSlug(product?.name || '')

//   const productSlug =
//     baseSlug && product?._id && !baseSlug.includes(product._id)
//       ? `${baseSlug}-${product._id}`
//       : baseSlug

//   return {
//     id: product?._id || product?.id || `${brandSlug}-${product?.name || 'item'}`,
//     name: product?.name || product?.title || 'Unnamed product',
//     brandName:
//       typeof brandEntity === 'string'
//         ? brandEntity
//         : brandEntity?.name ||
//           product?.brandName ||
//           product?.brand_title ||
//           '',
//     brandSlug,
//     productSlug,
//     bulkPrice: extractPrice(product, 'bulk'),
//     sellingPrice: extractPrice(product, 'sell'),
//     subCategoryId,
//     subCategoryName,
//     categoryId,
//     categoryName,
//   }
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
//         sellPrices.reduce((sum, value) => sum + value, 0) / sellPrices.length,
//       )
//     : undefined

//   const avgBulkPrice = bulkPrices.length
//     ? Math.round(
//         bulkPrices.reduce((sum, value) => sum + value, 0) / bulkPrices.length,
//       )
//     : undefined

//   const categories = Array.from(
//     new Set(rows.map((row) => row.categoryName).filter(Boolean)),
//   ).sort()

//   const subCategories = Array.from(
//     new Set(rows.map((row) => row.subCategoryName).filter(Boolean)),
//   ).sort()

//   return {
//     totalProducts,
//     avgSellingPrice,
//     avgBulkPrice,
//     categories,
//     subCategories,
//   }
// }

// /* -------------------------------------------------------------------------- */
// /* Static params / metadata                                                   */
// /* -------------------------------------------------------------------------- */

// export async function generateStaticParams() {
//   if (!CAN_USE_REMOTE_API) {
//     return [{ brand: BUILD_VALIDATION_PLACEHOLDER }]
//   }

//   try {
//     const brands = await fetchBrandCollection()
//     const slugsFromApi = brands
//       .map((brand) => canonicalizeBrandSlug(brand))
//       .filter(Boolean)

//     const uniqueSlugs = Array.from(
//       new Set([...slugsFromApi, ...HARDCODED_BRAND_SLUGS]),
//     )

//     if (uniqueSlugs.length) {
//       return uniqueSlugs.map((brand) => ({ brand }))
//     }
//   } catch (error) {
//     console.warn(
//       'generateStaticParams failed, falling back to placeholder.',
//       error,
//     )
//   }

//   return [{ brand: BUILD_VALIDATION_PLACEHOLDER }]
// }

// export async function generateMetadata({ params }) {
//   const resolvedParams = await params
//   const brandParam = createBrandSlug(resolvedParams?.brand)

//   if (
//     !brandParam ||
//     brandParam === BUILD_VALIDATION_PLACEHOLDER ||
//     !CAN_USE_REMOTE_API
//   ) {
//     const fallbackSlug =
//       brandParam && brandParam !== BUILD_VALIDATION_PLACEHOLDER
//         ? brandParam.replace(/-/g, ' ')
//         : 'Brand not found'

//     return {
//       metadataBase: new URL(SITE_URL),
//       title: `${fallbackSlug} | ${SITE_NAME}`,
//       description: CAN_USE_REMOTE_API
//         ? 'This brand is not available in our store.'
//         : 'Brand catalog is unavailable during static export while NEXT_PUBLIC_API_URL points to localhost.',
//       robots: { index: false, follow: false },
//       alternates: {
//         canonical: `${SITE_URL}/brands/${brandParam || ''}`,
//       },
//     }
//   }

//   try {
//     const brand = await fetchBrandBySlug(brandParam)
//     if (!brand) {
//       return {
//         metadataBase: new URL(SITE_URL),
//         title: 'Brand not found',
//         description: 'This brand is not available in our store.',
//         robots: { index: false, follow: false },
//       }
//     }

//     const productsRaw = await fetchProductsByBrand(brand)
//     const productRows = Array.isArray(productsRaw)
//       ? productsRaw.map(normalizeProductRow)
//       : []
//     const metrics = computeBrandMetrics(productRows)

//     const title = `${brand.name}`
//     const plainBrandDescription = stripMarkdown(
//       brand.description || brand.shortDescription || '',
//     )

//     const description = plainBrandDescription
//       ? `${plainBrandDescription} Shop authentic ${brand.name} makeup with FCFA prices. ${metrics.totalProducts} products available including ${
//           metrics.subCategories.length
//             ? metrics.subCategories.slice(0, 5).join(', ')
//             : 'top-rated essentials'
//         }. Fast delivery in Douala & nationwide.`
//       : `Shop authentic ${brand.name} makeup with FCFA prices. ${metrics.totalProducts} products available including ${
//           metrics.subCategories.length
//             ? metrics.subCategories.slice(0, 5).join(', ')
//             : 'top-rated essentials'
//         }. Fast delivery in Douala & nationwide.`

//     const canonical = `${SITE_URL}/brands/${brandParam}`
//     const dynamicOgImage =
//       brand.ogImage ||
//       brand.banner ||
//       brand.coverImage ||
//       `${SITE_URL}/api/og/brand?slug=${encodeURIComponent(brandParam)}`

//     return {
//       metadataBase: new URL(SITE_URL),
//       title,
//       description,
//       keywords: [
//         `${brand.name}`,
//         `${brand.name} Cameroon`,
//         `${brand.name} price list`,
//         'authentic makeup',
//         'Douala makeup store',
//         ...metrics.subCategories
//           .slice(0, 8)
//           .map((cat) => `${brand.name} ${cat}`),
//         ...metrics.categories
//           .slice(0, 8)
//           .map((cat) => `${brand.name} ${cat} Cameroon`),
//       ],
//       robots: { index: true, follow: true },
//       alternates: { canonical },
//       openGraph: {
//         type: 'website',
//         siteName: SITE_NAME,
//         url: canonical,
//         title,
//         description,
//         images: [
//           {
//             url: dynamicOgImage,
//             width: 1200,
//             height: 630,
//             alt: `${brand.name}`,
//           },
//         ],
//         locale: 'en_US',
//       },
//       twitter: {
//         card: 'summary_large_image',
//         title,
//         description,
//         images: [dynamicOgImage],
//       },
//     }
//   } catch (error) {
//     console.error(`Metadata generation failed for brand ${brandParam}:`, error)
//     return {
//       metadataBase: new URL(SITE_URL),
//       title: `${brandParam} | ${SITE_NAME}`,
//       description: DEFAULT_BRAND_DESCRIPTION,
//       robots: { index: false, follow: false },
//       openGraph: {
//         type: 'website',
//         siteName: SITE_NAME,
//         url: `${SITE_URL}/brands/${brandParam}`,
//         title: `${brandParam} | ${SITE_NAME}`,
//         description: DEFAULT_BRAND_DESCRIPTION,
//         images: [
//           {
//             url: DEFAULT_OG_IMAGE,
//             width: 1200,
//             height: 630,
//             alt: 'Essentialist Makeup Store',
//           },
//         ],
//         locale: 'en_US',
//       },
//       twitter: {
//         card: 'summary_large_image',
//         images: [DEFAULT_OG_IMAGE],
//       },
//     }
//   }
// }

// /* -------------------------------------------------------------------------- */
// /* Page component                                                             */
// /* -------------------------------------------------------------------------- */

// export default async function BrandPage({ params }) {
//   const resolvedParams = await params
//   const brandParam = createBrandSlug(resolvedParams?.brand)

//   if (!brandParam || brandParam === BUILD_VALIDATION_PLACEHOLDER) {
//     notFound()
//   }

//   if (!CAN_USE_REMOTE_API) {
//     return (
//       <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4 py-16">
//         <section className="max-w-3xl w-full bg-white border border-pink-200 rounded-2xl shadow-lg p-8 space-y-4 text-center">
//           <h1 className="text-2xl md:text-3xl font-bold text-pink-600">
//             Brand catalog skipped during static export
//           </h1>
//           <p className="text-gray-700">
//             <code className="px-2 py-1 bg-gray-100 rounded">
//               NEXT_PUBLIC_API_URL
//             </code>{' '}
//             points to{' '}
//             <code className="px-2 py-1 bg-gray-100 rounded">
//               localhost
//             </code>
//             , so we cannot fetch brand data during export.
//           </p>
//           <ol className="text-left text-gray-700 list-decimal list-inside space-y-2">
//             <li>
//               Expose the API on a public host and update{' '}
//               <code className="px-2 py-1 bg-gray-100 rounded">
//                 NEXT_PUBLIC_API_URL
//               </code>
//               .
//             </li>
//             <li>
//               Or deploy with{' '}
//               <code className="px-2 py-1 bg-gray-100 rounded">
//                 next build && next start
//               </code>{' '}
//               so runtime fetching can succeed.
//             </li>
//             <li>Or accept this placeholder for exported builds.</li>
//           </ol>
//           <p className="text-sm text-gray-600">
//             Requested brand slug: <code>{brandParam}</code>
//           </p>
//         </section>
//       </main>
//     )
//   }

//   return <BrandPageClient brandSlug={brandParam} />
// }





// app/brands/[brand]/page.jsx
import { notFound } from 'next/navigation'
import BrandPageClient from './BrandPageClient'

const SITE_URL = 'https://www.esmakeupstore.com'
const SITE_NAME = 'Essentialist Makeup Store'
const DEFAULT_OG_IMAGE =
  'https://www.esmakeupstore.com/assets/staymattebutnotflatpowderfoundationmain.jpg'
const DEFAULT_BRAND_DESCRIPTION =
  'Shop authentic makeup with FCFA pricing. Fast delivery in Douala & nationwide across Cameroon.'
const BUILD_VALIDATION_PLACEHOLDER = '__build-validation__'

// Make sure these slugs are always generated even if the API omits them.
const HARDCODED_BRAND_SLUGS = ['estee-lauder']

const RAW_API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').trim()
const API_BASE = RAW_API_BASE.replace(/\/$/, '')
const IS_EXPORT_MODE = process.env.NEXT_EXPORT === 'true'
const IS_LOCALHOST_API = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(API_BASE)
const CAN_USE_REMOTE_API =
  Boolean(API_BASE) && !(IS_EXPORT_MODE && IS_LOCALHOST_API)

/* -------------------------------------------------------------------------- */
/* Helper utilities                                                           */
/* -------------------------------------------------------------------------- */

function createBrandSlug(source = '') {
  if (typeof source !== 'string') return ''
  return source
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

function canonicalizeBrandSlug(candidate) {
  if (!candidate) return ''
  if (typeof candidate === 'string') return createBrandSlug(candidate)
  if (typeof candidate.slug === 'string' && candidate.slug.trim()) {
    return createBrandSlug(candidate.slug)
  }
  return createBrandSlug(
    candidate.name || candidate.title || candidate._id || '',
  )
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

async function fetchJson(url, init = {}) {
  if (!CAN_USE_REMOTE_API) return null

  try {
    const res = await fetch(url, init)
    if (res.status === 404) return null
    if (!res.ok) {
      const body = await res
        .text()
        .catch(() => res.statusText || 'Request failed')
      throw new Error(`Request failed ${res.status}: ${body}`)
    }
    return res.json()
  } catch (error) {
    console.warn('[brand page] fetchJson failed', { url, error })
    return null
  }
}

async function fetchBrandCollection() {
  if (!CAN_USE_REMOTE_API) return []

  const payload = await fetchJson(
    `${API_BASE}/api/brand/list?limit=500&sort=nameAsc&onlyActive=true`,
    { cache: 'no-store' },
  )

  const items =
    payload?.data?.items ||
    payload?.data ||
    payload?.brands ||
    payload?.items ||
    []

  return Array.isArray(items) ? items : []
}

async function fetchBrandBySlug(slug) {
  if (!CAN_USE_REMOTE_API || !slug) return null

  const direct = await fetchJson(
    `${API_BASE}/api/brand/${encodeURIComponent(slug)}?includeProducts=true`,
    { cache: 'no-store' },
  )
  const directNormalized = direct?.data || direct?.brand || direct
  if (directNormalized) return directNormalized

  const brands = await fetchBrandCollection()
  return brands.find((brand) => canonicalizeBrandSlug(brand) === slug) || null
}

async function fetchProductsByBrand(brand) {
  if (!CAN_USE_REMOTE_API || !brand) return []

  if (Array.isArray(brand.products) && brand.products.length) {
    return brand.products
  }

  const filterPayload = brand._id
    ? { brandId: brand._id, page: 1, limit: 500, onlyActive: true }
    : { brandSlug: canonicalizeBrandSlug(brand), page: 1, limit: 500 }

  const payload = await fetchJson(`${API_BASE}/api/product/get`, {
    cache: 'no-store',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...filterPayload,
      include: ['brand', 'category', 'subCategory'],
    }),
  })

  const items =
    payload?.data?.items ||
    payload?.data?.products ||
    payload?.data ||
    payload?.items ||
    []

  return Array.isArray(items) ? items : []
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
        '',
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
        '',
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
          product?.wholesale,
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
          product?.sell,
        ]

  return sources.find(
    (value) => typeof value === 'number' && Number.isFinite(value),
  )
}

function normalizeProductRow(product = {}) {
  const brandEntity = product?.brand || product?.brandId || product?.brandInfo
  const brandSlug = canonicalizeBrandSlug(
    typeof brandEntity === 'object' && brandEntity
      ? brandEntity.slug || brandEntity.name
      : brandEntity || product?.brandName,
  )

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

  const baseSlug =
    typeof product?.slug === 'string' && product.slug.trim()
      ? product.slug.trim()
      : createBrandSlug(product?.name || '')

  const productSlug =
    baseSlug && product?._id && !baseSlug.includes(product._id)
      ? `${baseSlug}-${product._id}`
      : baseSlug

  return {
    id: product?._id || product?.id || `${brandSlug}-${product?.name || 'item'}`,
    name: product?.name || product?.title || 'Unnamed product',
    brandName:
      typeof brandEntity === 'string'
        ? brandEntity
        : brandEntity?.name ||
          product?.brandName ||
          product?.brand_title ||
          '',
    brandSlug,
    productSlug,
    bulkPrice: extractPrice(product, 'bulk'),
    sellingPrice: extractPrice(product, 'sell'),
    subCategoryId,
    subCategoryName,
    categoryId,
    categoryName,
  }
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
        sellPrices.reduce((sum, value) => sum + value, 0) / sellPrices.length,
      )
    : undefined

  const avgBulkPrice = bulkPrices.length
    ? Math.round(
        bulkPrices.reduce((sum, value) => sum + value, 0) / bulkPrices.length,
      )
    : undefined

  const categories = Array.from(
    new Set(rows.map((row) => row.categoryName).filter(Boolean)),
  ).sort()

  const subCategories = Array.from(
    new Set(rows.map((row) => row.subCategoryName).filter(Boolean)),
  ).sort()

  return {
    totalProducts,
    avgSellingPrice,
    avgBulkPrice,
    categories,
    subCategories,
  }
}

/* -------------------------------------------------------------------------- */
/* Static params / metadata                                                   */
/* -------------------------------------------------------------------------- */

export async function generateStaticParams() {
  if (!CAN_USE_REMOTE_API) {
    return [{ brand: BUILD_VALIDATION_PLACEHOLDER }]
  }

  try {
    const brands = await fetchBrandCollection()
    const slugsFromApi = brands
      .map((brand) => canonicalizeBrandSlug(brand))
      .filter(Boolean)

    const uniqueSlugs = Array.from(
      new Set([...slugsFromApi, ...HARDCODED_BRAND_SLUGS]),
    )

    if (uniqueSlugs.length) {
      return uniqueSlugs.map((brand) => ({ brand }))
    }
  } catch (error) {
    console.warn(
      'generateStaticParams failed, falling back to placeholder.',
      error,
    )
  }

  return [{ brand: BUILD_VALIDATION_PLACEHOLDER }]
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params
  const brandParam = createBrandSlug(resolvedParams?.brand)

  if (
    !brandParam ||
    brandParam === BUILD_VALIDATION_PLACEHOLDER ||
    !CAN_USE_REMOTE_API
  ) {
    const fallbackSlug =
      brandParam && brandParam !== BUILD_VALIDATION_PLACEHOLDER
        ? brandParam.replace(/-/g, ' ')
        : 'Brand not found'

    return {
      metadataBase: new URL(SITE_URL),
      title: `${fallbackSlug} | ${SITE_NAME}`,
      description: CAN_USE_REMOTE_API
        ? 'This brand is not available in our store.'
        : 'Brand catalog is unavailable during static export while NEXT_PUBLIC_API_URL points to localhost.',
      robots: { index: false, follow: false },
      alternates: {
        canonical: `${SITE_URL}/brands/${brandParam || ''}`,
      },
    }
  }

  try {
    const brand = await fetchBrandBySlug(brandParam)
    if (!brand) {
      return {
        metadataBase: new URL(SITE_URL),
        title: 'Brand not found | Essentialist Makeup Store',
        description: 'This brand is not available in our store.',
        robots: { index: false, follow: false },
      }
    }

    const productsRaw = await fetchProductsByBrand(brand)
    const productRows = Array.isArray(productsRaw)
      ? productsRaw.map(normalizeProductRow)
      : []
    const metrics = computeBrandMetrics(productRows)

    // SEO Fix: Action-oriented title for higher CTR
    const title = `Shop ${brand.name} Makeup | Essentialist Makeup Store`
    
    // SEO Fix: Limit description length to ensure keywords stay visible on Google
    const plainBrandDescription = stripMarkdown(
      brand.description || brand.shortDescription || '',
    )
    const shortDesc = plainBrandDescription.length > 60 
      ? `${plainBrandDescription.substring(0, 60)}...` 
      : plainBrandDescription

    const description = shortDesc
      ? `${shortDesc} Shop authentic ${brand.name} cosmetics at Essentialist Makeup Store. Explore ${metrics.totalProducts} products. Fast delivery in Cameroon.`
      : `Shop authentic ${brand.name} makeup at Essentialist Makeup Store. Browse ${metrics.totalProducts} products including ${
          metrics.subCategories.length
            ? metrics.subCategories.slice(0, 3).join(', ')
            : 'top-rated essentials'
        }. Fast delivery in Douala & nationwide.`

    const canonical = `${SITE_URL}/brands/${brandParam}`
    const dynamicOgImage =
      brand.ogImage ||
      brand.banner ||
      brand.coverImage ||
      `${SITE_URL}/api/og/brand?slug=${encodeURIComponent(brandParam)}`

    return {
      metadataBase: new URL(SITE_URL),
      title,
      description,
      // SEO Fix: Limited dynamic keywords to avoid spam penalties
      keywords: [
        `${brand.name}`,
        `${brand.name} makeup Cameroon`,
        `buy ${brand.name} Douala`,
        'authentic cosmetics',
        ...metrics.subCategories
          .slice(0, 4)
          .map((cat) => `${brand.name} ${cat}`),
      ],
      robots: { index: true, follow: true },
      alternates: { canonical },
      openGraph: {
        type: 'website',
        siteName: SITE_NAME,
        url: canonical,
        title,
        description,
        images: [
          {
            url: dynamicOgImage,
            width: 1200,
            height: 630,
            alt: `${brand.name} cosmetic products`,
          },
        ],
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [dynamicOgImage],
      },
    }
  } catch (error) {
    console.error(`Metadata generation failed for brand ${brandParam}:`, error)
    return {
      metadataBase: new URL(SITE_URL),
      title: `${brandParam} Makeup | ${SITE_NAME}`,
      description: DEFAULT_BRAND_DESCRIPTION,
      robots: { index: false, follow: false },
      openGraph: {
        type: 'website',
        siteName: SITE_NAME,
        url: `${SITE_URL}/brands/${brandParam}`,
        title: `${brandParam} Makeup | ${SITE_NAME}`,
        description: DEFAULT_BRAND_DESCRIPTION,
        images: [
          {
            url: DEFAULT_OG_IMAGE,
            width: 1200,
            height: 630,
            alt: 'Essentialist Makeup Store',
          },
        ],
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        images: [DEFAULT_OG_IMAGE],
      },
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Page component                                                             */
/* -------------------------------------------------------------------------- */

export default async function BrandPage({ params }) {
  const resolvedParams = await params
  const brandParam = createBrandSlug(resolvedParams?.brand)

  if (!brandParam || brandParam === BUILD_VALIDATION_PLACEHOLDER) {
    notFound()
  }

  if (!CAN_USE_REMOTE_API) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4 py-16">
        <section className="max-w-3xl w-full bg-white border border-pink-200 rounded-2xl shadow-lg p-8 space-y-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-pink-600">
            Brand catalog skipped during static export
          </h1>
          <p className="text-gray-700">
            <code className="px-2 py-1 bg-gray-100 rounded">
              NEXT_PUBLIC_API_URL
            </code>{' '}
            points to{' '}
            <code className="px-2 py-1 bg-gray-100 rounded">
              localhost
            </code>
            , so we cannot fetch brand data during export.
          </p>
          <ol className="text-left text-gray-700 list-decimal list-inside space-y-2">
            <li>
              Expose the API on a public host and update{' '}
              <code className="px-2 py-1 bg-gray-100 rounded">
                NEXT_PUBLIC_API_URL
              </code>
              .
            </li>
            <li>
              Or deploy with{' '}
              <code className="px-2 py-1 bg-gray-100 rounded">
                next build && next start
              </code>{' '}
              so runtime fetching can succeed.
            </li>
            <li>Or accept this placeholder for exported builds.</li>
          </ol>
          <p className="text-sm text-gray-600">
            Requested brand slug: <code>{brandParam}</code>
          </p>
        </section>
      </main>
    )
  }

  return <BrandPageClient brandSlug={brandParam} />
}