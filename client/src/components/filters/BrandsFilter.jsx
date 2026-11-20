'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBrandsQuery } from '@/hooks/queries/useCatalogQueries'

const INITIAL_LIMIT = 6
const EXPANDED_LIMIT = 100

export default function BrandsFilter({ selectedBrands = [], onChange }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const { data: initialBrands = [], isLoading: initialLoading } = useBrandsQuery({
    params: { limit: INITIAL_LIMIT, sort: 'featured', onlyActive: true },
    syncToRedux: false,
  })

  const { data: allBrands = [], isLoading: expandedLoading } = useBrandsQuery({
    enabled: expanded,
    params: { limit: EXPANDED_LIMIT, sort: 'nameAsc', onlyActive: true },
    syncToRedux: false,
  })

  const brands = useMemo(() => {
    if (expanded && allBrands.length) return allBrands
    return initialBrands
  }, [expanded, allBrands, initialBrands])

  const selectedSet = useMemo(() => new Set(selectedBrands.map((b) => b._id)), [selectedBrands])

  const toggleBrand = (brand) => {
    if (selectedSet.has(brand._id)) {
      onChange?.(selectedBrands.filter((b) => b._id !== brand._id))
    } else {
      onChange?.([...selectedBrands, brand])
    }
  }

  const showSeeMoreSpinner = expanded && expandedLoading && !allBrands.length

  return (
    <div>
      <h3 className="font-bold text-sm mb-2">{t('search.brands')}</h3>
      <ul className="space-y-1.5">
        {initialLoading &&
          Array.from({ length: INITIAL_LIMIT }).map((_, i) => (
            <li key={`brand-skeleton-${i}`} className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          ))}
        {!initialLoading &&
          brands.map((brand) => (
            <li key={brand._id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`brand-${brand._id}`}
                checked={selectedSet.has(brand._id)}
                onChange={() => toggleBrand(brand)}
                className="h-4 w-4 accent-pink-500 cursor-pointer"
              />
              <label htmlFor={`brand-${brand._id}`} className="text-sm text-black cursor-pointer">
                {brand.name}
              </label>
            </li>
          ))}
      </ul>

      {!expanded && !initialLoading && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          {t('search.seeMore')}
        </button>
      )}

      {showSeeMoreSpinner && (
        <p className="mt-2 text-sm text-gray-500">{t('search.loading')}</p>
      )}
    </div>
  )
}
