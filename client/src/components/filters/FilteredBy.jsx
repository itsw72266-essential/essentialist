'use client'

import { useTranslation } from 'react-i18next'

export default function FilteredBy({ chips = [], onClear }) {
  const { t } = useTranslation()

  if (!chips.length) return null

  return (
    <div>
      <h3 className="font-bold text-sm mb-2">{t('search.filteredBy')}</h3>
      <div className="flex flex-col gap-2 items-start">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={chip.onRemove}
            className="flex items-center gap-1.5 rounded-full border border-blue-700 text-blue-800 text-sm font-semibold px-3 py-1.5 hover:bg-blue-50 transition-colors"
          >
            {chip.label}
            <span aria-hidden className="text-blue-700">×</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onClear}
        className="mt-2 text-sm text-blue-600 hover:underline"
      >
        {t('search.clearFilters')}
      </button>
    </div>
  )
}
