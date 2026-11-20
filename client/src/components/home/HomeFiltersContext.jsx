'use client'

import { createContext, useContext, useMemo, useState } from 'react'

const HomeFiltersContext = createContext(null)

export function HomeFiltersProvider({ children }) {
  const [categoryId, setCategoryId] = useState('')
  const [selectedBrands, setSelectedBrands] = useState([])
  const [priceRange, setPriceRange] = useState(null)
  const [discountRange, setDiscountRange] = useState(null)
  const [dealKey, setDealKey] = useState('all')

  const value = useMemo(
    () => ({
      categoryId,
      setCategoryId,
      selectedBrands,
      setSelectedBrands,
      priceRange,
      setPriceRange,
      discountRange,
      setDiscountRange,
      dealKey,
      setDealKey,
      hasActiveFilters: Boolean(
        categoryId || selectedBrands.length || priceRange || discountRange || dealKey !== 'all'
      ),
    }),
    [categoryId, selectedBrands, priceRange, discountRange, dealKey]
  )

  return (
    <HomeFiltersContext.Provider value={value}>
      {children}
    </HomeFiltersContext.Provider>
  )
}

export function useHomeFilters() {
  return useContext(HomeFiltersContext)
}
