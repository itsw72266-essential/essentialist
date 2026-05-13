'use client'

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import CategoryWiseProductDisplay from './CategoryWiseProductDisplay'
import CardLoading from './CardLoading'

function CategoryFallback() {
  return (
    <div className="mb-12">
      <div className="container mx-auto px-2 flex items-center justify-between p-2">
        <h2 className="font-bold text-[20px] md:text-[40px] animate-pulse bg-gray-200 h-8 w-48 rounded"></h2>
        <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
      </div>
      <div className="relative flex items-center">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:flex gap-1 md:gap-1 lg:gap-1 container mx-auto overflow-x-auto scrollbar-none scroll-smooth touch-pan-y">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-1">
              <div className="relative flex flex-col border border-gray-200 overflow-hidden py-1 lg:p-2 rounded-lg bg-white shadow-sm animate-pulse">
                <div className="relative overflow-hidden rounded-lg aspect-square mb-3 bg-gray-200">
                  <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
                </div>
                <div className="flex-grow flex flex-col px-2 space-y-2">
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
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CategorySectionsInfinite({
  categoryProducts = [],
  subCategoryData = [],
}) {
  const INITIAL_COUNT = 4
  const BATCH_SIZE = 4

  const total = Array.isArray(categoryProducts) ? categoryProducts.length : 0
  const [visibleCount, setVisibleCount] = useState(
    Math.min(INITIAL_COUNT, total)
  )

  const sentinelRef = useRef(null)
  const lockRef = useRef(false)

  const hasMore = visibleCount < total

  const visibleItems = useMemo(
    () => categoryProducts.slice(0, visibleCount),
    [categoryProducts, visibleCount]
  )

  useEffect(() => {
    if (!hasMore) return

    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting) return
        if (lockRef.current) return

        lockRef.current = true
        setVisibleCount((prev) => Math.min(total, prev + BATCH_SIZE))

        setTimeout(() => {
          lockRef.current = false
        }, 150)
      },
      { rootMargin: '100px 0px' }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, total])

  if (!total) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-500">
        <p>Products will appear here soon. Please check back later.</p>
      </div>
    )
  }

  return (
    <div className="lg:block">
      {visibleItems.map(({ category, products }) => {
        if (!category || !category._id) return null
        return (
          <Suspense key={`${category._id}-products`} fallback={<CategoryFallback />}>
            <CategoryWiseProductDisplay
              id={category._id}
              name={category.name}
              products={products || []}
              subCategories={subCategoryData || []}
            />
          </Suspense>
        )
      })}

      {hasMore && (
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <CardLoading key={`home-loading-${i}`} />
            ))}
          </div>
        </div>
      )}

      <div ref={sentinelRef} className="h-2" aria-hidden="true" />
    </div>
  )
}