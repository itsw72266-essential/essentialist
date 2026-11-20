'use client'

import { useEffect, useState } from 'react'
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

  const [localPrice, setLocalPrice] = useState(price || [priceBounds.min, priceBounds.max])
  const [localDiscount, setLocalDiscount] = useState(discount || [discountBounds.min, discountBounds.max])

  // Once real bounds load from the database, widen the default (unfiltered)
  // slider range to match them instead of staying on the fallback guess.
  useEffect(() => {
    if (!price && meta?.priceRange) setLocalPrice([priceBounds.min, priceBounds.max])
  }, [meta?.priceRange])

  useEffect(() => {
    if (!discount && meta?.discountRange) setLocalDiscount([discountBounds.min, discountBounds.max])
  }, [meta?.discountRange])

  if (priceBounds.min >= priceBounds.max && discountBounds.min >= discountBounds.max) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-sm mb-1">{t('search.price')}</h3>
        <p className="text-sm text-gray-700 mb-3">
          {DisplayPriceInRupees(localPrice[0])} &ndash; {DisplayPriceInRupees(localPrice[1])}
        </p>
        <Slider
          range
          min={priceBounds.min}
          max={priceBounds.max}
          value={localPrice}
          onChange={setLocalPrice}
          onChangeComplete={(value) => onPriceChange?.(value)}
          railStyle={railStyle}
          trackStyle={trackStyle}
          handleStyle={handleStyle}
          allowCross={false}
        />
      </div>

      <div>
        <h3 className="font-bold text-sm mb-1">{t('search.discount')}</h3>
        <p className="text-sm text-gray-700 mb-3">
          {localDiscount[0]}% &ndash; {localDiscount[1]}%
        </p>
        <Slider
          range
          min={discountBounds.min}
          max={discountBounds.max}
          value={localDiscount}
          onChange={setLocalDiscount}
          onChangeComplete={(value) => onDiscountChange?.(value)}
          railStyle={railStyle}
          trackStyle={trackStyle}
          handleStyle={handleStyle}
          allowCross={false}
        />
      </div>
    </div>
  )
}
