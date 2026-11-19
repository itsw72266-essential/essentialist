'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'

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
  const trackRef = useRef(null)

  const scrollByPanel = (direction) => {
    const track = trackRef.current
    if (!track) return
    const panel = track.firstElementChild
    const amount = (panel?.getBoundingClientRect().width || track.clientWidth * 0.7) + 12
    track.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  return (
    <div className="container mx-auto px-4 pt-4">
      <div className="relative">
        <div
          ref={trackRef}
          className="grid grid-flow-col auto-cols-[74%] sm:auto-cols-[42%] lg:auto-cols-fr lg:grid-flow-row lg:grid-cols-4
                     gap-3 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-none pb-1"
        >
          {PANELS.map((panel, index) => (
            <div
              key={panel.src}
              className="relative snap-start rounded-lg overflow-hidden h-[220px] sm:h-[300px] lg:h-[400px] bg-neutral-100"
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
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 42vw, 74vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute top-3 left-3 right-3 sm:top-5 sm:left-5 sm:right-5 text-white">
                <p className="text-xs sm:text-sm font-medium opacity-90">
                  {t(panel.eyebrowKey)}
                </p>
                <h2 className="text-base sm:text-xl lg:text-2xl font-extrabold leading-tight mt-1">
                  {t(panel.titleKey)}
                </h2>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollByPanel(-1)}
          aria-label="Previous"
          className="lg:hidden absolute left-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 hover:bg-white
                     flex items-center justify-center shadow z-10"
        >
          <IoChevronBack size={18} />
        </button>
        <button
          type="button"
          onClick={() => scrollByPanel(1)}
          aria-label="Next"
          className="lg:hidden absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 hover:bg-white
                     flex items-center justify-center shadow z-10"
        >
          <IoChevronForward size={18} />
        </button>
      </div>
    </div>
  )
}
