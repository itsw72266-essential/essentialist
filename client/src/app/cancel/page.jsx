'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import '@/lib/i18n'

export default function Cancel() {
  const { t } = useTranslation()

  return (
    <div className="m-2 w-full max-w-md bg-red-200 p-4 py-5 rounded mx-auto flex flex-col justify-center items-center gap-5">
      <p className="text-red-800 font-bold text-lg text-center">{t('errors.orderCancelled')}</p>
      <Link
        href="/"
        className="border border-red-900 text-red-900 hover:bg-red-900 hover:text-white transition-all px-4 py-1"
      >
        {t('errors.goHome')}
      </Link>
    </div>
  )
}
