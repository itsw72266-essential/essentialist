'use client'

import { useTranslation } from 'react-i18next'
import { useCategoriesQuery } from '@/hooks/queries/useCatalogQueries'

export default function DepartmentFilter({ selectedCategoryId, onSelect }) {
  const { t } = useTranslation()
  const { data: categories = [], isLoading } = useCategoriesQuery()

  return (
    <div>
      <h3 className="font-bold text-sm mb-2">{t('search.department')}</h3>
      <ul className="space-y-1.5">
        <li className="flex items-center gap-2">
          <input
            type="radio"
            id="department-all"
            name="department"
            checked={!selectedCategoryId}
            onChange={() => onSelect?.('')}
            className="h-4 w-4 accent-blue-600 cursor-pointer"
          />
          <label htmlFor="department-all" className="text-sm text-black cursor-pointer">
            {t('search.allCategories')}
          </label>
        </li>
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <li key={`dept-skeleton-${i}`} className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
          ))}
        {!isLoading &&
          categories.map((category) => (
            <li key={category._id} className="flex items-center gap-2">
              <input
                type="radio"
                id={`department-${category._id}`}
                name="department"
                checked={selectedCategoryId === category._id}
                onChange={() => onSelect?.(category._id)}
                className="h-4 w-4 accent-blue-600 cursor-pointer"
              />
              <label htmlFor={`department-${category._id}`} className="text-sm text-black cursor-pointer">
                {category.name}
              </label>
            </li>
          ))}
      </ul>
    </div>
  )
}
