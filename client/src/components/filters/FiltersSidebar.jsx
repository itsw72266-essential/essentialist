'use client'

import DepartmentFilter from './DepartmentFilter'
import BrandsFilter from './BrandsFilter'
import PriceDiscountFilter from './PriceDiscountFilter'

export default function FiltersSidebar({
  categoryId = '',
  onCategoryChange,
  selectedBrands = [],
  onBrandsChange,
  priceRange = null,
  onPriceChange,
  discountRange = null,
  onDiscountChange,
  action,
}) {
  return (
    <div className="space-y-6">
      <DepartmentFilter selectedCategoryId={categoryId} onSelect={onCategoryChange} />
      <BrandsFilter selectedBrands={selectedBrands} onChange={onBrandsChange} />
      <PriceDiscountFilter
        price={priceRange}
        discount={discountRange}
        onPriceChange={onPriceChange}
        onDiscountChange={onDiscountChange}
      />
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="text-pink-600 hover:text-pink-700 hover:underline font-semibold text-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
