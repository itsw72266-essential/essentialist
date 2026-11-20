'use client'

import { useTranslation } from 'react-i18next'
import FiltersSidebar from '@/components/filters/FiltersSidebar'
import { useHomeFilters } from './HomeFiltersContext'

export default function HomeSidebarFilters() {
  const { t } = useTranslation()
  const {
    categoryId,
    setCategoryId,
    selectedBrands,
    setSelectedBrands,
    priceRange,
    setPriceRange,
    discountRange,
    setDiscountRange,
  } = useHomeFilters()

  return (
    <div className="bg-white/70 rounded-xl shadow-sm px-6 py-4">
      <h2 className="font-bold text-lg uppercase tracking-wide mb-4">{t('sidebar.filters')}</h2>
      <FiltersSidebar
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        selectedBrands={selectedBrands}
        onBrandsChange={setSelectedBrands}
        priceRange={priceRange}
        onPriceChange={setPriceRange}
        discountRange={discountRange}
        onDiscountChange={setDiscountRange}
      />
    </div>
  )
}
