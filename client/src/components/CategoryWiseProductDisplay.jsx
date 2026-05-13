// components/CategoryWiseProductDisplay.js (Restored original Next.js styles from previous files; fixed header to justify-between; small gaps/px-1; no loading; fast prefetch nav)
'use client'

import React, { useMemo, useEffect, useRef, useState } from 'react'
import CardProduct from './CardProduct'
import { FaAngleLeft, FaAngleRight, FaArrowRight } from 'react-icons/fa6'
import { valideURLConvert } from '../utils/valideURLConvert'
import Link from 'next/link'

// No fetch/loading; render pre-fetched products directly for instant load
const CategoryWiseProductDisplay = ({ id, name, products = [], subCategories = [] }) => {
  const [redirectURL, setRedirectURL] = useState(`/${valideURLConvert(name)}-${id}`)
  const containerRef = useRef()

  // Build redirect URL (memoized for stability/fast re-renders)
  const computedRedirectURL = useMemo(() => {
    const subcategory = subCategories.find((sub) => {
      const filterData = sub.category?.some((c) => c._id === id)
      return filterData
    })
    return subcategory 
      ? `/${valideURLConvert(name)}-${id}/${valideURLConvert(subcategory.name)}-${subcategory._id}`
      : `/${valideURLConvert(name)}-${id}`
  }, [subCategories, name, id])

  useEffect(() => {
    setRedirectURL(computedRedirectURL)
  }, [computedRedirectURL])

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
      <div className="container mx-auto px-2 flex items-center justify-between p-2">
        <h2 className="font-bold text-[20px] md:text-[40px]">
          {name}
        </h2>
        <Link
          href={redirectURL}
          prefetch={true} // Prefetch for instant navigation (background load on hover)
          className="text-pink-400 hover:text-green-400 font-bold md:text-[20px] text-[16px] transition-colors duration-300 p-4 flex items-center gap-2 hover:gap-3"
          aria-label={`View all ${name} products`}
        >
          See All
          <FaArrowRight className="transition-all duration-300" />
        </Link>
      </div>

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