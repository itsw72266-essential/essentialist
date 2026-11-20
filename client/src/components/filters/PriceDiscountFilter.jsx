'use client'

import { useState } from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'
import { useTranslation } from 'react-i18next'

const PRICE_MIN = 0
const PRICE_MAX = 330
const DISCOUNT_MIN = 10
const DISCOUNT_MAX = 80

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
  const [localPrice, setLocalPrice] = useState(price || [PRICE_MIN, PRICE_MAX])
  const [localDiscount, setLocalDiscount] = useState(discount || [DISCOUNT_MIN, DISCOUNT_MAX])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-sm mb-1">{t('search.price')}</h3>
        <p className="text-sm text-gray-700 mb-3">
          ${localPrice[0]} &ndash; ${localPrice[1]}
        </p>
        <Slider
          range
          min={PRICE_MIN}
          max={PRICE_MAX}
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
          min={DISCOUNT_MIN}
          max={DISCOUNT_MAX}
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
