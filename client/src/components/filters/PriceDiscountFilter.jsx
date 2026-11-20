'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { useTranslation } from 'react-i18next'
import Axios from '@/lib/apiClient'
import SummaryApi from '@/backend/contracts/summaryApi'
import { DisplayPriceInRupees } from '@/utils/DisplayPriceInRupees'

const FALLBACK_PRICE = { min: 0, max: 100000 }
const FALLBACK_DISCOUNT = { min: 0, max: 80 }

const railStyle = { backgroundColor: '#e5e7eb', height: 6 }
const trackStyle = [{ backgroundColor: '#2563eb', height: 6 }]
const handleStyle = [
  { borderColor: '#2563eb', backgroundColor: '#fff', borderWidth: 3, width: 20, height: 20, marginTop: -7, opacity: 1 },
  { borderColor: '#2563eb', backgroundColor: '#fff', borderWidth: 3, width: 20, height: 20, marginTop: -7, opacity: 1 },
]

export default function PriceDiscountFilter({
  price,
  discount,
  onPriceChange,
  onDiscountChange,
}) {
  const { t } = useTranslation()

  const { data: meta } = useQuery({
    queryKey: ['product-filter-meta', 'price-discount-bounds'],
    queryFn: async () => {
      const response = await Axios({ ...SummaryApi.productFilterMeta, data: {} })
      return response?.data?.data
    },
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  })

  const priceBounds = {
    min: Math.floor(meta?.priceRange?.min ?? FALLBACK_PRICE.min),
    max: Math.ceil(meta?.priceRange?.max ?? FALLBACK_PRICE.max),
  }
  const discountBounds = {
    min: Math.floor(meta?.discountRange?.min ?? FALLBACK_DISCOUNT.min),
    max: Math.ceil(meta?.discountRange?.max ?? FALLBACK_DISCOUNT.max),
  }

  // Keyed on the bounds so loading real DB bounds (replacing the fallback
  // guess) remounts the slider cleanly once, instead of fighting with it via
  // an effect that resets its value on every render and makes it jitter.
  const priceKey = `${priceBounds.min}-${priceBounds.max}`
  const discountKey = `${discountBounds.min}-${discountBounds.max}`

  if (priceBounds.min >= priceBounds.max && discountBounds.min >= discountBounds.max) {
    return null
  }

  return (
    <div className="space-y-6">
      <PriceRange
        t={t}
        bounds={priceBounds}
        value={price}
        onCommit={onPriceChange}
        sliderKey={priceKey}
      />
      <DiscountRange
        t={t}
        bounds={discountBounds}
        value={discount}
        onCommit={onDiscountChange}
        sliderKey={discountKey}
      />
    </div>
  )
}

function PriceRange({ t, bounds, value, onCommit, sliderKey }) {
  const initial = value || [bounds.min, bounds.max]
  const [label, setLabel] = useState(initial)

  return (
    <div>
      <h3 className="font-bold text-sm mb-1">{t('search.price')}</h3>
      <p className="text-xs sm:text-sm text-gray-700 mb-3 whitespace-nowrap overflow-hidden text-ellipsis">
        {DisplayPriceInRupees(label[0])} &ndash; {DisplayPriceInRupees(label[1])}
      </p>
      <Slider
        key={sliderKey}
        range
        min={bounds.min}
        max={bounds.max}
        defaultValue={initial}
        onChange={setLabel}
        onChangeComplete={(next) => onCommit?.(next)}
        railStyle={railStyle}
        trackStyle={trackStyle}
        handleStyle={handleStyle}
        allowCross={false}
      />
    </div>
  )
}

function DiscountRange({ t, bounds, value, onCommit, sliderKey }) {
  const initial = value || [bounds.min, bounds.max]
  const [label, setLabel] = useState(initial)

  return (
    <div>
      <h3 className="font-bold text-sm mb-1">{t('search.discount')}</h3>
      <p className="text-xs sm:text-sm text-gray-700 mb-3 whitespace-nowrap overflow-hidden text-ellipsis">
        {label[0]}% &ndash; {label[1]}%
      </p>
      <Slider
        key={sliderKey}
        range
        min={bounds.min}
        max={bounds.max}
        defaultValue={initial}
        onChange={setLabel}
        onChangeComplete={(next) => onCommit?.(next)}
        railStyle={railStyle}
        trackStyle={trackStyle}
        handleStyle={handleStyle}
        allowCross={false}
      />
    </div>
  )
}
