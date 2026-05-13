// //client\src\app\brands\page.jsx
// import BrandsDirectoryClient from './BrandsDirectoryClient'
// import { valideURLConvert } from '../../utils/valideURLConvert'

// const SITE_URL = 'https://www.esmakeupstore.com/brands'
// const ROOT_URL = 'https://www.esmakeupstore.com'
// const SITE_NAME = 'Essentialist Makeup Store'
// const OG_IMAGE =
//   'https://www.esmakeupstore.com/assets/staymattebutnotflatpowderfoundationmain.jpg'
// const DEFAULT_TITLE = 'Shop Top Makeup Brands Online in Cameroon'
// const DEFAULT_BRANDS =
//   'NYX, Juvias Place, ONE/SIZE, Bobbi Brown, Smashbox, e.l.f., Estée Lauder, MAC, Clinique, LA Girl'
// const DEFAULT_DESC =
//   'Discover authentic makeup in Cameroon. Browse brand-specific price lists, compare FCFA pricing, and order with fast nationwide delivery from Douala.'

// const RAW_API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').trim()
// const API_BASE = RAW_API_BASE.replace(/\/$/, '')
// const IS_EXPORT_MODE = process.env.NEXT_EXPORT === 'true'
// const IS_LOCALHOST_API = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(API_BASE)
// const CAN_USE_REMOTE_API = Boolean(API_BASE) && !(IS_EXPORT_MODE && IS_LOCALHOST_API)

// // ---------- Fetch helpers (server-side for metadata) ----------

// async function fetchJson(url, init = {}) {
//   if (!CAN_USE_REMOTE_API) return null

//   try {
//     const res = await fetch(url, init)
//     if (res.status === 404) return null
//     if (!res.ok) {
//       const text = await res
//         .text()
//         .catch(() => res.statusText || 'Unable to read response body')
//       throw new Error(`Request failed ${res.status}: ${text}`)
//     }
//     return res.json()
//   } catch (error) {
//     console.warn('[brands directory] fetchJson failed', { url, error })
//     return null
//   }
// }

// async function fetchBrandCollection() {
//   if (!CAN_USE_REMOTE_API) return { items: [], meta: {} }

//   const payload = await fetchJson(
//     `${API_BASE}/api/brand/list?limit=200&sort=nameAsc&onlyActive=true&includeMetrics=true`,
//     { cache: 'no-store' }
//   )

//   const items =
//     payload?.data?.items ||
//     payload?.data ||
//     payload?.brands ||
//     payload?.items ||
//     []

//   const meta = payload?.meta || {
//     total: Array.isArray(items) ? items.length : 0
//   }

//   return { items: Array.isArray(items) ? items : [], meta }
// }

// async function fetchProductCatalog() {
//   if (!CAN_USE_REMOTE_API) return { items: [], meta: {} }

//   const payload = await fetchJson(`${API_BASE}/api/product/get`, {
//     cache: 'no-store',
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       page: 1,
//       limit: 500,
//       onlyActive: true,
//       include: ['brand', 'category', 'subCategory']
//     })
//   })

//   const items =
//     payload?.data?.items ||
//     payload?.data?.products ||
//     payload?.data ||
//     payload?.items ||
//     []

//   const meta = payload?.meta || {
//     total: Array.isArray(items) ? items.length : 0
//   }

//   return { items: Array.isArray(items) ? items : [], meta }
// }

// // ---------- Normalisation helpers (used in metadata) ----------

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
//   if (product?._id && !raw.includes(product._id)) {
//     return `${raw}-${product._id}`
//   }
//   return raw
// }

// function extractSubCategory(product) {
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

// function extractPrice(product, role) {
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

// function normalizeProductRow(product) {
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
//     id: product?._id || product?.id || `${brandSlug}-${product?.name || 'item'}`,
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

// // ---------- Metadata ----------

// export async function generateMetadata() {
//   if (!CAN_USE_REMOTE_API) {
//     return {
//       metadataBase: new URL(ROOT_URL),
//       title: DEFAULT_TITLE,
//       description:
//         'Brand directory content is unavailable during static export when NEXT_PUBLIC_API_URL points to localhost.',
//       robots: { index: false, follow: false },
//       alternates: { canonical: SITE_URL },
//       openGraph: {
//         type: 'website',
//         siteName: SITE_NAME,
//         url: SITE_URL,
//         title: DEFAULT_TITLE,
//         description: DEFAULT_DESC,
//         images: [
//           {
//             url: OG_IMAGE,
//             width: 1200,
//             height: 630,
//             alt: 'Makeup brands in Cameroon -- price list'
//           }
//         ],
//         locale: 'en_US'
//       },
//       twitter: {
//         card: 'summary_large_image',
//         title: DEFAULT_TITLE,
//         description: DEFAULT_DESC,
//         images: [OG_IMAGE]
//       }
//     }
//   }

//   try {
//     const [{ items: brandItems }, { items: productItems }] = await Promise.all([
//       fetchBrandCollection(),
//       fetchProductCatalog()
//     ])

//     const productRows = (Array.isArray(productItems) ? productItems : []).map(
//       normalizeProductRow
//     )
//     const brandStats = aggregateBrandStats(brandItems, productRows)

//     const brandNames = brandStats.map((brand) => brand.name).filter(Boolean)
//     const subCategoryNames = Array.from(
//       new Set(productRows.map((row) => row.subCategoryName).filter(Boolean))
//     )

//     const dynTitle = brandNames.length
//       ? `Shop Top Makeup Brands Online: ${brandNames.slice(0, 11).join(', ')}`
//       : DEFAULT_TITLE

//     const dynDesc = `Discover authentic makeup in Cameroon. Brands: ${
//       brandNames.length ? brandNames.join(', ') : DEFAULT_BRANDS
//     }. Categories: ${
//       subCategoryNames.length
//         ? subCategoryNames.join(', ')
//         : 'foundations, lip makeup, eye makeup, face makeup'
//     }. Browse individual brand pages for detailed pricing. Best FCFA prices, fast delivery in Douala & nationwide.`

//     return {
//       metadataBase: new URL(ROOT_URL),
//       title: dynTitle,
//       description: dynDesc,
//       keywords: [
//         'makeup brands',
//         'Cameroon makeup',
//         'Douala makeup store',
//         'authentic makeup Cameroon',
//         'foundation price list',
//         'lipstick price',
//         'powder price',
//         'cosmetics Cameroon',
//         'brand comparison',
//         'makeup price list',
//         ...brandNames.slice(0, 20).map((name) => `${name} Cameroon`),
//         ...subCategoryNames.slice(0, 20).map((cat) => `${cat} price`)
//       ],
//       robots: { index: true, follow: true },
//       alternates: { canonical: SITE_URL },
//       openGraph: {
//         type: 'website',
//         siteName: SITE_NAME,
//         url: SITE_URL,
//         title: dynTitle,
//         description: dynDesc,
//         images: [
//           {
//             url: OG_IMAGE,
//             width: 1200,
//             height: 630,
//             alt: 'Makeup brands in Cameroon -- price list'
//           }
//         ],
//         locale: 'en_US'
//       },
//       twitter: {
//         card: 'summary_large_image',
//         title: dynTitle,
//         description: dynDesc,
//         images: [OG_IMAGE]
//       }
//     }
//   } catch (error) {
//     console.error('Metadata generation (brands page) failed:', error)
//     return {
//       metadataBase: new URL(ROOT_URL),
//       title: DEFAULT_TITLE,
//       description: DEFAULT_DESC,
//       alternates: { canonical: SITE_URL },
//       robots: { index: true, follow: true },
//       openGraph: {
//         type: 'website',
//         siteName: SITE_NAME,
//         url: SITE_URL,
//         title: DEFAULT_TITLE,
//         description: DEFAULT_DESC,
//         images: [
//           {
//             url: OG_IMAGE,
//             width: 1200,
//             height: 630,
//             alt: 'Makeup brands in Cameroon -- price list'
//           }
//         ],
//         locale: 'en_US'
//       },
//       twitter: {
//         card: 'summary_large_image',
//         title: DEFAULT_TITLE,
//         description: DEFAULT_DESC,
//         images: [OG_IMAGE]
//       }
//     }
//   }
// }

// export function generateViewport() {
//   return {
//     themeColor: '#faf6f3'
//   }
// }

// // ---------- Page ----------

// export default function BrandPage() {
//   if (!CAN_USE_REMOTE_API) {
//     return (
//       <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4 py-16">
//         <section className="max-w-3xl w-full bg-white border border-pink-200 rounded-2xl shadow-lg p-8 space-y-4 text-center">
//           <h1 className="text-2xl md:text-3xl font-bold text-pink-600">
//             Brand directory skipped during static export
//           </h1>
//           <p className="text-gray-700">
//             Remote API calls are disabled because <code className="px-2 py-1 bg-gray-100 rounded">NEXT_PUBLIC_API_URL</code> points to a localhost host while <code>next export</code> is running. Client-side hydration cannot recover data in this mode.
//           </p>
//           <ol className="text-left text-gray-700 list-decimal list-inside space-y-2">
//             <li>Expose your API on a reachable host (staging/prod or tunnel) and update <code>NEXT_PUBLIC_API_URL</code>.</li>
//             <li>Or run with <code>next build && next start</code> to fetch data at runtime.</li>
//             <li>Or accept this static message for exported HTML pages.</li>
//           </ol>
//         </section>
//       </main>
//     )
//   }

//   return <BrandsDirectoryClient canUseRemoteApi={CAN_USE_REMOTE_API} />
// }








//client\src\app\brands\page.jsx
import BrandsDirectoryClient from './BrandsDirectoryClient'
import { valideURLConvert } from '../../utils/valideURLConvert'

const SITE_URL = 'https://www.esmakeupstore.com/brands'
const ROOT_URL = 'https://www.esmakeupstore.com'
const SITE_NAME = 'Essentialist Makeup Store'
const OG_IMAGE =
  'https://www.esmakeupstore.com/assets/staymattebutnotflatpowderfoundationmain.jpg'
const DEFAULT_TITLE = 'Shop Top Makeup Brands | Essentialist Makeup Store'
const DEFAULT_BRANDS =
  'NYX, Maybelline, Bobbi Brown, Smashbox, e.l.f.'
const DEFAULT_DESC =
  'Shop authentic cosmetic products from top brands. Browse our directory, compare prices, and order professional makeup with fast delivery.'

const RAW_API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').trim()
const API_BASE = RAW_API_BASE.replace(/\/$/, '')
const IS_EXPORT_MODE = process.env.NEXT_EXPORT === 'true'
const IS_LOCALHOST_API = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(API_BASE)
const CAN_USE_REMOTE_API = Boolean(API_BASE) && !(IS_EXPORT_MODE && IS_LOCALHOST_API)

// ---------- Fetch helpers (server-side for metadata) ----------

async function fetchJson(url, init = {}) {
  if (!CAN_USE_REMOTE_API) return null

  try {
    const res = await fetch(url, init)
    if (res.status === 404) return null
    if (!res.ok) {
      const text = await res
        .text()
        .catch(() => res.statusText || 'Unable to read response body')
      throw new Error(`Request failed ${res.status}: ${text}`)
    }
    return res.json()
  } catch (error) {
    console.warn('[brands directory] fetchJson failed', { url, error })
    return null
  }
}

async function fetchBrandCollection() {
  if (!CAN_USE_REMOTE_API) return { items: [], meta: {} }

  const payload = await fetchJson(
    `${API_BASE}/api/brand/list?limit=200&sort=nameAsc&onlyActive=true&includeMetrics=true`,
    { cache: 'no-store' }
  )

  const items =
    payload?.data?.items ||
    payload?.data ||
    payload?.brands ||
    payload?.items ||
    []

  const meta = payload?.meta || {
    total: Array.isArray(items) ? items.length : 0
  }

  return { items: Array.isArray(items) ? items : [], meta }
}

async function fetchProductCatalog() {
  if (!CAN_USE_REMOTE_API) return { items: [], meta: {} }

  const payload = await fetchJson(`${API_BASE}/api/product/get`, {
    cache: 'no-store',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      page: 1,
      limit: 500,
      onlyActive: true,
      include: ['brand', 'category', 'subCategory']
    })
  })

  const items =
    payload?.data?.items ||
    payload?.data?.products ||
    payload?.data ||
    payload?.items ||
    []

  const meta = payload?.meta || {
    total: Array.isArray(items) ? items.length : 0
  }

  return { items: Array.isArray(items) ? items : [], meta }
}

// ---------- Normalisation helpers (used in metadata) ----------

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
  if (product?._id && !raw.includes(product._id)) {
    return `${raw}-${product._id}`
  }
  return raw
}

function extractSubCategory(product) {
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

function extractPrice(product, role) {
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

function normalizeProductRow(product) {
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
    id: product?._id || product?.id || `${brandSlug}-${product?.name || 'item'}`,
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

// ---------- Metadata ----------

export async function generateMetadata() {
  if (!CAN_USE_REMOTE_API) {
    return {
      metadataBase: new URL(ROOT_URL),
      title: DEFAULT_TITLE,
      description: DEFAULT_DESC,
      robots: { index: false, follow: false },
      alternates: { canonical: SITE_URL },
      openGraph: {
        type: 'website',
        siteName: SITE_NAME,
        url: SITE_URL,
        title: DEFAULT_TITLE,
        description: DEFAULT_DESC,
        images: [
          {
            url: OG_IMAGE,
            width: 1200,
            height: 630,
            alt: 'Makeup brands collection at Essentialist Makeup Store'
          }
        ],
        locale: 'en_US'
      },
      twitter: {
        card: 'summary_large_image',
        title: DEFAULT_TITLE,
        description: DEFAULT_DESC,
        images: [OG_IMAGE]
      }
    }
  }

  try {
    const [{ items: brandItems }, { items: productItems }] = await Promise.all([
      fetchBrandCollection(),
      fetchProductCatalog()
    ])

    const productRows = (Array.isArray(productItems) ? productItems : []).map(
      normalizeProductRow
    )
    const brandStats = aggregateBrandStats(brandItems, productRows)

    const brandNames = brandStats.map((brand) => brand.name).filter(Boolean)
    
    // SEO Fix: Limit to top 3 brands for a clean, un-truncated title
    const dynTitle = brandNames.length
      ? `Shop ${brandNames.slice(0, 3).join(', ')} & Top Makeup Brands`
      : DEFAULT_TITLE

    // SEO Fix: Limit description to top 5 brands to avoid keyword stuffing penalties
    const dynDesc = `Discover authentic cosmetic products from top brands like ${
      brandNames.length ? brandNames.slice(0, 5).join(', ') : DEFAULT_BRANDS
    }. Compare prices, shop skin essentials, and get fast delivery.`

    return {
      metadataBase: new URL(ROOT_URL),
      title: dynTitle,
      description: dynDesc,
      // SEO Fix: Hardcoded the highly-searched terms and limited dynamic brands
      keywords: [
        'Essentialist makeup store',
        'makeup brands',
        'cosmetic products',
        'professional makeup',
        'skin essentials',
        'brand comparison',
        ...brandNames.slice(0, 5) // Only include top 5 dynamic brands
      ],
      robots: { index: true, follow: true },
      alternates: { canonical: SITE_URL },
      openGraph: {
        type: 'website',
        siteName: SITE_NAME,
        url: SITE_URL,
        title: dynTitle,
        description: dynDesc,
        images: [
          {
            url: OG_IMAGE,
            width: 1200,
            height: 630,
            alt: 'Makeup brands collection at Essentialist Makeup Store'
          }
        ],
        locale: 'en_US'
      },
      twitter: {
        card: 'summary_large_image',
        title: dynTitle,
        description: dynDesc,
        images: [OG_IMAGE]
      }
    }
  } catch (error) {
    console.error('Metadata generation (brands page) failed:', error)
    return {
      metadataBase: new URL(ROOT_URL),
      title: DEFAULT_TITLE,
      description: DEFAULT_DESC,
      alternates: { canonical: SITE_URL },
      robots: { index: true, follow: true },
      openGraph: {
        type: 'website',
        siteName: SITE_NAME,
        url: SITE_URL,
        title: DEFAULT_TITLE,
        description: DEFAULT_DESC,
        images: [
          {
            url: OG_IMAGE,
            width: 1200,
            height: 630,
            alt: 'Makeup brands collection at Essentialist Makeup Store'
          }
        ],
        locale: 'en_US'
      },
      twitter: {
        card: 'summary_large_image',
        title: DEFAULT_TITLE,
        description: DEFAULT_DESC,
        images: [OG_IMAGE]
      }
    }
  }
}

export function generateViewport() {
  return {
    themeColor: '#faf6f3'
  }
}

// ---------- Page ----------

export default function BrandPage() {
  if (!CAN_USE_REMOTE_API) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4 py-16">
        <section className="max-w-3xl w-full bg-white border border-pink-200 rounded-2xl shadow-lg p-8 space-y-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-pink-600">
            Brand directory skipped during static export
          </h1>
          <p className="text-gray-700">
            Remote API calls are disabled because <code className="px-2 py-1 bg-gray-100 rounded">NEXT_PUBLIC_API_URL</code> points to a localhost host while <code>next export</code> is running. Client-side hydration cannot recover data in this mode.
          </p>
          <ol className="text-left text-gray-700 list-decimal list-inside space-y-2">
            <li>Expose your API on a reachable host (staging/prod or tunnel) and update <code>NEXT_PUBLIC_API_URL</code>.</li>
            <li>Or run with <code>next build && next start</code> to fetch data at runtime.</li>
            <li>Or accept this static message for exported HTML pages.</li>
          </ol>
        </section>
      </main>
    )
  }

  return <BrandsDirectoryClient canUseRemoteApi={CAN_USE_REMOTE_API} />
}