// components/CategoryWiseProductDisplay.js (Restored original Next.js styles from previous files; fixed header to justify-between; small gaps/px-1; no loading; fast prefetch nav)
'use client'

import React, { useMemo, useEffect, useRef, useState } from 'react'
import CardProduct from './CardProduct'
import { FaAngleLeft, FaAngleRight, FaArrowRight } from 'react-icons/fa6'
import { buildCategoryPath, buildSubCategoryPath } from '@/lib/catalogSlugs'
import { pickBrandLinksFromProducts } from '@/lib/seo/popularProductLinks'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'
import { useAdaptiveTextClasses } from '@/hooks/useAdaptiveTextClasses'
import { linkPrefetch } from '@/lib/devPerformance'
import { useLocalizedHref } from '@/hooks/useLocalizedHref'

// No fetch/loading; render pre-fetched products directly for instant load
const CategoryWiseProductDisplay = ({
  id,
  name,
  categoryLabel,
  products = [],
  subCategories = [],
}) => {
  const { t } = useTranslation()
  const localizedHref = useLocalizedHref()

  const displayName = categoryLabel ?? name

  const headingClasses = useAdaptiveTextClasses(displayName, 'sectionHeading')
  const seeAllClasses = useAdaptiveTextClasses(t('common.seeAll'), 'seeAllLink')

  const [redirectURL, setRedirectURL] = useState(buildCategoryPath({ _id: id, name }))
  const containerRef = useRef()

  // Build redirect URL (memoized for stability/fast re-renders)
  const computedRedirectURL = useMemo(() => {
    const subcategory = subCategories.find((sub) => {
      const filterData = sub.category?.some((c) => c._id === id)
      return filterData
    })
    const category = { _id: id, name }
    const path = subcategory
      ? buildSubCategoryPath(category, subcategory)
      : buildCategoryPath(category)
    return localizedHref(path)
  }, [subCategories, name, id, localizedHref])

  useEffect(() => {
    setRedirectURL(computedRedirectURL)
  }, [computedRedirectURL])

  const brandLinks = useMemo(
    () => pickBrandLinksFromProducts(products, 4),
    [products],
  )

  const handleScrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollLeft += 200
    }
  }

  const handleScrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollLeft -= 200
    }
  }

  return (
    <div className="mb-12">
      {/* Header: Restored original Next.js flex justify-between (title left, See All right) */}
      <div className="container mx-auto px-2 flex items-center justify-between gap-2 p-2">
        <h2 className={headingClasses}>
          {displayName}
        </h2>
        <Link
          href={redirectURL}
          prefetch={linkPrefetch}
          className={`text-pink-400 hover:text-green-400 transition-colors duration-300 p-2 sm:p-4 flex items-center gap-2 hover:gap-3 ${seeAllClasses}`}
          aria-label={`View all ${displayName} products`}
        >
          {t('common.seeAll')}
          <FaArrowRight className="transition-all duration-300" />
        </Link>
      </div>

      {brandLinks.length > 0 && (
        <nav
          className="container mx-auto px-2 pb-2 flex flex-wrap gap-2"
          aria-label={`${displayName} brands`}
        >
          {brandLinks.map((link) => (
            <Link
              key={link.href}
              href={localizedHref(link.href)}
              prefetch={linkPrefetch}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-50 text-pink-700 border border-pink-100 hover:bg-pink-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      {/* Product Grid: Restored original Next.js styles (small gaps, px-1 on cards, horizontal scroll) */}
      <div className="relative flex items-center cursor-pointer">
        <div
          className="grid grid-cols-2 sm:grid-cols-2 md:flex
                     gap-1 md:gap-1 lg:gap-1
                     container mx-auto 
                     overflow-x-auto scrollbar-none scroll-smooth
                     touch-pan-y"
          ref={containerRef}
          style={{ touchAction: 'pan-y' }}
        >
          {products.length > 0 ? (
            // Render pre-fetched products (instant, no loading delay)
            products.map((p, index) => (
              <div 
                key={`${p._id}-${id}-${index}`}
                className="px-1" // Original px-1 for tight spacing
              >
                <CardProduct data={p} />
              </div>
            ))
          ) : (
            // Fallback if no products (from server cache miss or empty response)
            <div className="col-span-full text-center text-gray-500 py-8 w-full px-1">
              No products in this category yet. Check back soon!
            </div>
          )}
        </div>
        {/* Scroll Buttons: Restored original positioning and classes */}
        <div className="w-full left-0 right-0 container mx-auto px-2 absolute hidden lg:flex justify-between">
          <button
            onClick={handleScrollLeft}
            className="z-10 relative bg-white hover:bg-gray-100 shadow-lg text-lg p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
            aria-label="Scroll left"
          >
            <FaAngleLeft />
          </button>
          <button
            onClick={handleScrollRight}
            className="z-10 relative bg-white hover:bg-gray-100 shadow-lg p-2 text-lg rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
            aria-label="Scroll right"
          >
            <FaAngleRight />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CategoryWiseProductDisplay