'use client'

import Image from 'next/image'
import { useTranslation } from 'react-i18next'

import '@/lib/i18n'
import { useAdaptiveTextClasses } from '@/hooks/useAdaptiveTextClasses'

export default function HomeHero() {
  const { t } = useTranslation()
  const heroTitleClasses = useAdaptiveTextClasses(t('home.heroTitle'), 'heroTitle')
  const heroSubtitleClasses = useAdaptiveTextClasses(
    t('home.heroSubtitle'),
    'heroSubtitle',
  )

  return (
    <div className="container mx-auto px-4 pt-4">
      <div className="w-full h-full min-h-48 rounded overflow-hidden">
        <div className="hidden lg:block">
          <Image
            src="/assets/fbb4343f-2d39-4c25-ac2f-1ab5037f50da.avif"
            width={1200}
            height={500}
            alt={t('home.bannerAltPro')}
            priority
            fetchPriority="high"
            loading="eager"
            unoptimized
            className="w-full h-auto"
            sizes="100vw"
          />
        </div>
        <div className="lg:hidden">
          <Image
            src="/assets/cosmetics-beauty-products-for-make-up-sale-banner-vector-25170220.avif"
            width={400}
            height={250}
            alt={t('home.bannerAlt')}
            priority
            fetchPriority="high"
            loading="eager"
            unoptimized
            className="w-full h-auto"
            sizes="100vw"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-6 mb-8 px-4 flex flex-col items-center text-center">
        <h1 className={heroTitleClasses}>
          <span className="text-pink-600">{t('home.heroTitle')}</span>
          {' — '}
          {t('home.heroTitleAccent')}
        </h1>
        <p className={heroSubtitleClasses}>
          {t('home.heroSubtitle')}
        </p>
      </div>
    </div>
  )
}
