'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import FiltersSidebar from '@/components/filters/FiltersSidebar'

export default function HomeSidebarFilters() {
  const { t } = useTranslation()
  const router = useRouter()

  const [categoryId, setCategoryId] = useState('')
  const [selectedBrands, setSelectedBrands] = useState([])
  const [priceRange, setPriceRange] = useState(null)
  const [discountRange, setDiscountRange] = useState(null)

  const goToSearch = () => {
    const params = new URLSearchParams()
    if (categoryId) params.set('category', categoryId)
    if (selectedBrands.length) {
      params.set('brand', selectedBrands.map((b) => b._id).join(','))
      params.set('brandNames', selectedBrands.map((b) => b.name).join(','))
    }
    if (priceRange) {
      params.set('priceMin', priceRange[0])
      params.set('priceMax', priceRange[1])
    }
    if (discountRange) {
      params.set('discountMin', discountRange[0])
      params.set('discountMax', discountRange[1])
    }
    router.push(`/search?${params.toString()}`)
  }

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
        action={{ label: t('sidebar.showResults'), onClick: goToSearch }}
      />
    </div>
  )
}
