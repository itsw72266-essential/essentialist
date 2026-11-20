'use client'

import { useRef } from 'react'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'
import { DisplayPriceInRupees } from '@/utils/DisplayPriceInRupees'

export const DEAL_FILTERS = [
  { key: 'all', label: 'All Deals', filters: {} },
  { key: 'hot', label: "Today's Hot Deals", filters: { isHot: true } },
  { key: 'new', label: 'New Arrivals', filters: { newWithinDays: 14 } },
  { key: 'off5000', label: `${DisplayPriceInRupees(5000)}+ Off`, filters: { discountAmount: { min: 5000 } } },
  { key: 'off10000', label: `${DisplayPriceInRupees(10000)}+ Off`, filters: { discountAmount: { min: 10000 } } },
  { key: 'inStock', label: 'In Stock Only', filters: { stockStatus: 'inStock' } },
]

export default function QuickFilterChips({ active = 'all', onSelect }) {
  const trackRef = useRef(null)

  const scrollByAmount = (direction) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: direction * 220, behavior: 'smooth' })
  }

  return (
    <div className="relative flex items-center gap-1 mb-4">
      <button
        type="button"
        onClick={() => scrollByAmount(-1)}
        aria-label="Scroll left"
        className="shrink-0 h-9 w-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
      >
        <IoChevronBack size={16} />
      </button>

      <div
        ref={trackRef}
        className="flex gap-2 overflow-x-auto scrollbar-none scroll-smooth"
      >
        {DEAL_FILTERS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onSelect?.(option.key)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              active === option.key
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-300 text-black hover:bg-gray-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollByAmount(1)}
        aria-label="Scroll right"
        className="shrink-0 h-9 w-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
      >
        <IoChevronForward size={16} />
      </button>
    </div>
  )
}
