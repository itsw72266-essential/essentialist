'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'

import '@/lib/i18n'

// Each image already has its own promo copy baked in by design, so the
// panel only needs an accessible alt text — no text overlay on top.
// Exception: holiday-glam-makeup-display.png has no baked-in headline like
// its siblings, so we render a matching overlay for it in code.
const PANELS = [
  {
    src: '/assets/black-friday-beauty-gift-display.png',
    altKey: 'home.heroPanel1Title',
  },
  {
    src: '/assets/festive-makeup-savings-ad.png',
    altKey: 'home.heroPanel2Title',
  },
  {
    src: '/assets/holiday-glam-makeup-display.png',
    altKey: 'home.heroPanel3Title',
    overlayEyebrowKey: 'home.heroPanel3Eyebrow',
    overlayTitleKey: 'home.heroPanel3Title',
  },
  {
    src: '/assets/holiday-makeup-gift-celebration.png',
    altKey: 'home.heroPanel4Title',
  },
  {
    src: '/assets/holiday-gifts-esmakeupstore.png',
    altKey: 'home.heroPanel5Title',
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
    <div className="w-full">
      <div className="relative">
        <div
          ref={trackRef}
          className="flex lg:grid lg:grid-cols-5
                     gap-0 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-none"
        >
          {PANELS.map((panel, index) => (
            <div
              key={panel.src}
              className="relative snap-start overflow-hidden aspect-[993/1584] bg-neutral-100
                         flex-none basis-[92%] sm:basis-[46%] lg:basis-auto"
            >
              <Image
                src={panel.src}
                alt={t(panel.altKey)}
                fill
                priority={index === 0}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                loading={index === 0 ? 'eager' : 'lazy'}
                unoptimized
                className="object-contain"
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 46vw, 92vw"
              />
              {panel.overlayTitleKey && (
                <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-pink-600/90 to-pink-600/0 px-4 pt-4 pb-10">
                  {panel.overlayEyebrowKey && (
                    <p className="text-white text-xs sm:text-sm font-medium">
                      {t(panel.overlayEyebrowKey)}
                    </p>
                  )}
                  <p className="text-white text-lg sm:text-xl lg:text-2xl font-bold leading-tight">
                    {t(panel.overlayTitleKey)}
                  </p>
                </div>
              )}
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
