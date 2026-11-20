'use client'

import FilteredBy from './FilteredBy'
import DepartmentFilter from './DepartmentFilter'
import BrandsFilter from './BrandsFilter'
import PriceDiscountFilter from './PriceDiscountFilter'
import { useCategoriesQuery } from '@/hooks/queries/useCatalogQueries'
import { DisplayPriceInRupees } from '@/utils/DisplayPriceInRupees'

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
  const { data: categories = [] } = useCategoriesQuery()
  const selectedCategory = categories.find((c) => c._id === categoryId)

  const chips = [
    ...(selectedCategory
      ? [{ key: 'department', label: selectedCategory.name, onRemove: () => onCategoryChange?.('') }]
      : []),
    ...selectedBrands.map((brand) => ({
      key: `brand-${brand._id}`,
      label: brand.name,
      onRemove: () => onBrandsChange?.(selectedBrands.filter((b) => b._id !== brand._id)),
    })),
    ...(priceRange
      ? [{ key: 'price', label: `${DisplayPriceInRupees(priceRange[0])} - ${DisplayPriceInRupees(priceRange[1])}`, onRemove: () => onPriceChange?.(null) }]
      : []),
    ...(discountRange
      ? [{ key: 'discount', label: `${discountRange[0]}% - ${discountRange[1]}%`, onRemove: () => onDiscountChange?.(null) }]
      : []),
  ]

  const clearAll = () => {
    onCategoryChange?.('')
    onBrandsChange?.([])
    onPriceChange?.(null)
    onDiscountChange?.(null)
  }

  return (
    <div className="space-y-6">
      <FilteredBy chips={chips} onClear={clearAll} />
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
