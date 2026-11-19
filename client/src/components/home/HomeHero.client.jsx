'use client'

import Image from 'next/image'
import { useTranslation } from 'react-i18next'

import '@/lib/i18n'

const PANELS = [
  {
    src: '/assets/black-friday-beauty-gift-display.png',
    eyebrowKey: 'home.heroPanel1Eyebrow',
    titleKey: 'home.heroPanel1Title',
  },
  {
    src: '/assets/festive-makeup-savings-ad.png',
    eyebrowKey: 'home.heroPanel2Eyebrow',
    titleKey: 'home.heroPanel2Title',
  },
  {
    src: '/assets/holiday-glam-makeup-display.png',
    eyebrowKey: 'home.heroPanel3Eyebrow',
    titleKey: 'home.heroPanel3Title',
  },
  {
    src: '/assets/holiday-makeup-gift-celebration.png',
    eyebrowKey: 'home.heroPanel4Eyebrow',
    titleKey: 'home.heroPanel4Title',
  },
]

export default function HomeHero() {
  const { t } = useTranslation()

  return (
    <div className="container mx-auto px-4 pt-4">
      <div
        className="grid grid-flow-col auto-cols-[82%] sm:auto-cols-[46%] lg:auto-cols-fr lg:grid-flow-row lg:grid-cols-4
                   gap-3 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-none pb-1"
      >
        {PANELS.map((panel, index) => (
          <div
            key={panel.src}
            className="relative snap-start rounded-lg overflow-hidden h-[320px] sm:h-[380px] lg:h-[420px] bg-neutral-100"
          >
            <Image
              src={panel.src}
              alt={t(panel.titleKey)}
              fill
              priority={index === 0}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              loading={index === 0 ? 'eager' : 'lazy'}
              unoptimized
              className="object-cover"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 46vw, 82vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute top-5 left-5 right-5 text-white">
              <p className="text-sm font-medium opacity-90">{t(panel.eyebrowKey)}</p>
              <h2 className="text-xl sm:text-2xl font-extrabold leading-tight mt-1">
                {t(panel.titleKey)}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
