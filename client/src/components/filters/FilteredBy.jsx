'use client'

import { useTranslation } from 'react-i18next'

export default function FilteredBy({ chips = [], onClear }) {
  const { t } = useTranslation()

  if (!chips.length) return null

  return (
    <div>
      <h3 className="font-bold text-sm mb-2">{t('search.filteredBy')}</h3>
      <div className="flex flex-col gap-2 items-stretch">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={chip.onRemove}
            title={chip.label}
            className="rounded-xl border-2 border-blue-700 bg-blue-50 hover:bg-blue-100 text-blue-900 text-sm font-bold px-4 py-2 text-left truncate transition-colors"
          >
            {chip.label}
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
