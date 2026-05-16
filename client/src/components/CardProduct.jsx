
// //src/components/CardProduct.jsx
// 'use client'

// import { useState, useMemo, useCallback, Suspense } from 'react'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import { useSelector } from 'react-redux'
// import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
// import { valideURLConvert } from '../utils/valideURLConvert'
// import { pricewithDiscount } from '../utils/PriceWithDiscount'
// import AddToCartButton from './AddToCartButton'
// import Image from 'next/image'
// import CardProductRating from './CardProductRating.client'
// import React from 'react'

// // Skeleton component for individual card (inline for zero server load)
// const CardSkeleton = () => (
//   <div className="relative flex flex-col border border-gray-200 overflow-hidden py-1 lg:p-2 rounded-lg bg-white shadow-sm animate-pulse">
//     {/* Image Skeleton */}
//     <div className="relative overflow-hidden rounded-lg aspect-square mb-3 bg-gray-200">
//       <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
//     </div>
    
//     {/* Details Skeleton */}
//     <div className="flex-grow flex flex-col px-2 space-y-2">
//       <div className="flex items-center justify-between mb-1">
//         <div className="rounded-full text-xs w-fit px-2 py-0.5 bg-gray-200 h-5 w-16" />
//         <div className="flex space-x-1">
//           {[...Array(5)].map((_, i) => (
//             <div key={i} className="w-4 h-4 bg-gray-300 rounded-full" />
//           ))}
//         </div>
//       </div>
      
//       <div className="h-8 bg-gray-200 rounded w-3/4" />
//       <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
      
//       <div className="flex items-center justify-between">
//         <div className="space-y-1">
//           <div className="h-5 bg-gray-200 rounded w-16" />
//           <div className="h-4 bg-gray-200 rounded w-12" />
//         </div>
//         <div className="h-8 w-20 bg-gray-200 rounded-full" />
//       </div>
//     </div>
//   </div>
// )

// // Memoize the component to prevent unnecessary re-renders when props are stable
// const CardProduct = React.memo(({ data, isLoading = false }) => {
//   const router = useRouter()
//   const [isHovered, setIsHovered] = useState(false)

//   // Early return for loading state (client-side skeleton, no server fetch)
//   if (isLoading) {
//     return <CardSkeleton />
//   }

//   // Simplified URL: Direct to /product/slug-id for fastest navigation (no category/subCategory lookup)
//   const productUrl = useMemo(() => `/product/${valideURLConvert(data.name)}-${data._id}`, [data.name, data._id])

//   // Memoized price calculation (computed only when dependencies change)
//   const discountedPrice = useMemo(() => {
//     const basePrice = typeof data.bulkPrice === 'number' && data.bulkPrice > 0 ? data.bulkPrice : data.price
//     return pricewithDiscount(basePrice, data.discount || 0)
//   }, [data.bulkPrice, data.price, data.discount])

//   // Memoized availability check for stock status (avoids re-computation)
//   const isInStock = useMemo(() => data.stock > 0, [data.stock])
//   const availabilityHref = useMemo(() => 
//     isInStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', 
//     [isInStock]
//   )

//   // Handle clicks on AddToCartButton (prevents full navigation, stops propagation)
//   const handleAddToCartClick = useCallback((e) => {
//     if (e.target.closest('[data-add-to-cart]')) {
//       e.preventDefault()
//       e.stopPropagation()
//       // AddToCartButton handles its own logic (e.g., Redux dispatch) – no navigation
//     }
//   }, [])

//   // Creative: Preload critical resources on hover for sub-100ms navigation feel
//   const handleMouseEnter = useCallback(() => {
//     setIsHovered(true)
//     // Preload the product page's critical JS/CSS (Next.js optimizes this, but explicit for perf)
//     if ('link' in document) {
//       const link = document.createElement('link')
//       link.rel = 'preload'
//       link.href = productUrl
//       link.as = 'fetch'
//       link.crossOrigin = ''
//       document.head.appendChild(link)
//       // Cleanup after a short delay
//       setTimeout(() => document.head.removeChild(link), 5000)
//     }
//   }, [productUrl])

//   // Optimized hover styles with CSS transitions (no JS for transform)
//   const cardClasses = useMemo(() => 
//     "relative flex flex-col border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out py-1 lg:p-2 rounded-lg bg-white shadow-sm hover:shadow-md group hover:-translate-y-1",
//     []
//   )

//   // Image src with fallback (memoized to avoid re-stringify)
//   const imageSrc = useMemo(() => 
//     Array.isArray(data.image) ? (data.image[0] || '/default-image.jpg') : (data.image || '/default-image.jpg'),
//     [data.image]
//   )

//   return (
//     <Link
//       href={productUrl}
//       className={cardClasses}
//       onMouseEnter={handleMouseEnter}
//       onMouseLeave={() => setIsHovered(false)}
//       onClick={handleAddToCartClick} // Stop propagation for AddToCart
//       prefetch={true} // Enable prefetching for instant navigation on click/hover (Next.js 15 optimized)
//       style={{
//         minWidth: typeof window !== 'undefined' && window.innerWidth < 768 ? '1rem' : 'auto',
//         maxWidth: '20rem',
//       }}
//       // Creative: Add rel="preload" hint for browser prefetching
//       rel="preload"
//     >
//       {/* Inline structured data snippet for this product (no server render, client-side hydration) */}
//       <script
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{
//           __html: JSON.stringify({
//             '@context': 'https://schema.org',
//             '@type': 'Product',
//             name: data.name,
//             image: imageSrc,
//             offers: {
//               '@type': 'Offer',
//               price: data.price,
//               priceCurrency: 'XAF', // Adjust as needed
//               availability: availabilityHref
//             }
//           })
//         }}
//       />
      
//       {/* Product Image Container - Optimized with Next.js Image for faster loading + blur placeholder */}
//       <div className="relative overflow-hidden rounded-lg aspect-square mb-3">
//         <Image
//           src={imageSrc}
//           className="w-full h-full object-contain transition-transform duration-500 ease-in-out group-hover:scale-105"
//           alt={data.name}
//           loading="lazy" // Lazy load for faster initial page load (client-side)
//           width={400}
//           height={400}
//           decoding="async" // Faster decoding on client
//           placeholder="blur" // Blur placeholder for perceived performance (no server dependency)
//           blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8Alt4X55Q8v4jHHRgYbGRgX5J8n4jHHRgYbGRgX/9k=" // Static blur for quick client-side fallback
//           sizes="(max-width: 768px) 100vw, 50vw" // Responsive sizes for optimal client loading
//           // Fixed: Use string "low" for fetchPriority (invalid boolean 'false' caused error)
//           fetchPriority="low" // Low priority for offscreen cards to save bandwidth (string value for Next.js Image)
//         />
        
//         {/* Discount Badge - Conditional render for perf */}
//         {Boolean(data.discount) && (
//           <div className="absolute top-2 right-2 bg-green-600 text-white font-medium rounded-full px-2 py-1 text-xs">
//             {data.discount}% OFF
//           </div>
//         )}
//       </div>

//       {/* Product Details - All client-side */}
//       <div className="flex-grow flex flex-col px-2">
//         {/* Delivery Time and Rating - Memoized components */}
//         <div className="flex items-center justify-between mb-1">
//           <div className="rounded-full text-xs w-fit px-2 py-0.5 text-green-600 bg-green-50 flex items-center">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             10 min
//           </div>
//           <CardProductRating productId={data._id} initial={data.rating} />
//         </div>

//         {/* Product Name */}
//         <h3 className="font-semibold text-gray-800 text-sm lg:text-base line-clamp-2 mb-1 transition-colors duration-300 group-hover:text-gray-600">
//           {data.name}
//         </h3>

//         {/* Product Unit */}
//         {data.unit && (
//           <div className="text-gray-500 text-sm mb-3">
//             {data.unit}
//           </div>
//         )}

//         {/* Price and Add to Cart */}
//         <div className="flex items-center justify-between mt-auto">
//           <div className="flex flex-col">
//             <div className="font-bold text-gray-900">
//               {DisplayPriceInRupees(discountedPrice)}
//             </div>
//             {Boolean(data.discount) && (
//               <div className="text-xs text-gray-500 line-through">
//                 {DisplayPriceInRupees(data.price)}
//               </div>
//             )}
//           </div>
//           <div className="transition-transform duration-300 group-hover:scale-105">
//             {isInStock ? (
//               <div data-add-to-cart className="pointer-events-auto">
//                 <AddToCartButton data={data} />
//               </div>
//             ) : (
//               <p className="text-red-500 text-sm bg-red-50 px-3 py-1 rounded-full">Out of stock</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </Link>
//   )
// })

// CardProduct.displayName = 'CardProduct'

// export default CardProduct






// src/components/CardProduct.jsx
'use client'

import { useMemo, useCallback } from 'react'
import Link from 'next/link'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { valideURLConvert } from '../utils/valideURLConvert'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import AddToCartButton from './AddToCartButton'
import Image from 'next/image'
import CardProductRating from './CardProductRating.client'
import React from 'react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { getLocalizedContent, getLocalizedProductName } from '@/helpers/localizeContent'
import { linkPrefetch } from '@/lib/devPerformance'

const CardSkeleton = () => (
  <div className="relative flex flex-col border border-gray-200 overflow-hidden py-1 lg:p-2 rounded-lg bg-white shadow-sm animate-pulse">
    <div className="relative overflow-hidden rounded-lg aspect-square mb-3 bg-gray-200">
      <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
    </div>
    <div className="flex-grow flex flex-col px-2 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="rounded-full bg-gray-200 h-5 w-16" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
      <div className="h-8 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-5 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-12" />
        </div>
        <div className="h-8 w-20 bg-gray-200 rounded-full" />
      </div>
    </div>
  </div>
)

const CardProduct = React.memo(({ data, isLoading = false, priority = false }) => {
  const { t, i18n } = useTranslation()
  const displayName = useMemo(
    () => getLocalizedProductName(data, i18n.language),
    [data, i18n.language],
  )
  const displayUnit = useMemo(
    () => getLocalizedContent(data, 'unit', i18n.language),
    [data, i18n.language],
  )
  if (isLoading) {
    return <CardSkeleton />
  }

  const productUrl = useMemo(() => `/product/${valideURLConvert(data.name)}-${data._id}`, [data.name, data._id])

  const discountedPrice = useMemo(() => {
    const basePrice = typeof data.bulkPrice === 'number' && data.bulkPrice > 0 ? data.bulkPrice : data.price
    return pricewithDiscount(basePrice, data.discount || 0)
  }, [data.bulkPrice, data.price, data.discount])

  const isInStock = useMemo(() => data.stock > 0, [data.stock])
  const availabilityHref = useMemo(() => isInStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', [isInStock])

  const handleAddToCartClick = useCallback((e) => {
    if (e.target.closest('[data-add-to-cart]')) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  // FIX: Moved min-width and max-width into Tailwind classes to prevent Hydration Mismatch
  const cardClasses = useMemo(() => 
    "relative flex flex-col border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out py-1 lg:p-2 rounded-lg bg-white shadow-sm hover:shadow-md group hover:-translate-y-1 min-w-[1rem] max-w-[20rem]",
    []
  )

  const imageSrc = useMemo(() => 
    Array.isArray(data.image) ? (data.image[0] || '/default-image.jpg') : (data.image || '/default-image.jpg'),
    [data.image]
  )

  return (
    <Link
      href={productUrl}
      className={cardClasses}
      onClick={handleAddToCartClick}
      prefetch={linkPrefetch}
      // style prop removed because it is now safely handled by Tailwind in `cardClasses`
    >
      <div className="relative overflow-hidden rounded-lg aspect-square mb-3">
        <Image
          src={imageSrc}
          className="w-full h-full object-contain transition-transform duration-500 ease-in-out group-hover:scale-105"
          alt={displayName}
          width={400}
          height={400}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "low"}
          decoding="async"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8Alt4X55Q8v4jHHRgYbGRgX5J8n4jHHRgYbGRgX/9k="
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized={true} 
        />
        
        {Boolean(data.discount) && (
          <div className="absolute top-2 right-2 bg-pink-500 text-white font-medium rounded-full px-2 py-1 text-[10px] tracking-wider uppercase shadow-sm">
            {data.discount}% {t('product.off')}
          </div>
        )}
      </div>

      <div className="flex-grow flex flex-col px-2">
        <div className="flex items-center justify-between mb-1">
          <div className="rounded-full text-[10px] uppercase tracking-wider font-bold w-fit px-2 py-0.5 text-pink-600 bg-pink-50 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            10 min
          </div>
          <CardProductRating productId={data._id} />
        </div>

        <h3 className="font-bold text-gray-900 text-sm line-clamp-2 break-words mb-1 transition-colors duration-300 group-hover:text-pink-600">
          {displayName}
        </h3>

        {displayUnit && (
          <div className="text-gray-400 text-xs mb-3 font-medium line-clamp-1 break-words">
            {displayUnit}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <div className="font-black text-gray-900 text-sm">
              {DisplayPriceInRupees(discountedPrice)}
            </div>
            {Boolean(data.discount) && (
              <div className="text-[10px] text-gray-400 line-through">
                {DisplayPriceInRupees(data.price)}
              </div>
            )}
          </div>
          <div className="transition-transform duration-300 group-hover:scale-105">
            {isInStock ? (
              <div data-add-to-cart className="pointer-events-auto">
                <AddToCartButton data={data} />
              </div>
            ) : (
              <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider bg-red-50 px-2 py-1 rounded-full border border-red-100">{t('product.soldOut')}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
})

CardProduct.displayName = 'CardProduct'

export default CardProduct
