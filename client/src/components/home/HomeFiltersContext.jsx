'use client'

import { createContext, useContext, useMemo, useState } from 'react'

const HomeFiltersContext = createContext(null)

export function HomeFiltersProvider({ children }) {
  const [categoryId, setCategoryId] = useState('')
  const [selectedBrands, setSelectedBrands] = useState([])
  const [priceRange, setPriceRange] = useState(null)
  const [discountRange, setDiscountRange] = useState(null)

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
      hasActiveFilters: Boolean(
        categoryId || selectedBrands.length || priceRange || discountRange
      ),
    }),
    [categoryId, selectedBrands, priceRange, discountRange]
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
