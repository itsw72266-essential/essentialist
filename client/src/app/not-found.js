'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import '@/lib/i18n'

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
      <h1 className="text-4xl font-bold text-pink-600">{t('errors.notFoundTitle')}</h1>
      <p className="mt-4 text-gray-600">{t('errors.notFoundBody')}</p>
      <Link
        href="/"
        className="mt-6 px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-all"
      >
        {t('errors.returnHome')}
      </Link>
    </main>
  )
}
