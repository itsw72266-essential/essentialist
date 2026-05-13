"use client";
import React from 'react'
import { useTranslation } from 'react-i18next'
import '@/lib/i18n'

const NoData = () => {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col items-center justify-center p-4 gap-2'>
      <img
        src="/assets/nothing here yet.webp"
        alt={t('common.noData')}
        className='w-36' 
      />
      <p className='text-neutral-500'>{t('common.noData')}</p>
    </div>
  )
}

export default NoData
