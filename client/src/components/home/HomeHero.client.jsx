'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'

import '@/lib/i18n'

// Each image already has its own promo copy baked in by design, so the
// panel only needs an accessible alt text — no text overlay on top.
const PANELS = [
   {
    src: '/assets/Glossy Neon Beauty Deals Poster.webp',
    altKey: 'home.heroPanelTitle',
    width: 800,
    height: 1282,
  },
  {
    src: '/assets/black-friday-beauty-gift-display.webp',
    altKey: 'home.heroPanelTitle',
    width: 800,
    height: 1276,
  },
  {
    type: 'iframe',
    src: '/assets/essentialist_makeup_animated_ad.html',
    altKey: 'home.heroPanelAd1Title',
    width: 460,
    height: 724,
  },
  {
    src: '/assets/festive-makeup-savings-ad.webp',
    altKey: 'home.heroPanel2Title',
    width: 800,
    height: 1270,
  },
  {
    src: '/assets/Essentialist Makeup Deals Gift Bundle.webp',
    altKey: 'home.heroPanel3Title',
    width: 800,
    height: 1281,
  },
  // {
  //   src: '/assets/Essentialist Makeup Gift Box.png',
  //   altKey: 'home.heroPanel3Title',
  //   // Its real pixel dimensions, so object-contain shows the whole image
  //   // (including the logo near the bottom) uncropped, like its siblings.
  //   width: 941,
  //   height: 1585,
  // },
 
  {
    src: '/assets/Holiday Makeup Essentials Savings.webp',
    altKey: 'home.heroPanel4Title',
    width: 800,
    height: 1279,
  },
  {
    src: '/assets/holiday-makeup-gift-celebration.webp',
    altKey: 'home.heroPanel5Title',
    width: 800,
    height: 1278,
  },
  {
    src: '/assets/Glossy Pink Makeup Sale Essentials.webp',
    altKey: 'home.heroPanel5Title',
    width: 800,
    height: 1279,
  },
  {
    src: '/assets/holiday-gifts-esmakeupstore.webp',
    altKey: 'home.heroPanel6Title',
    width: 800,
    height: 1276,
  },
  {
    src: '/assets/Pink Stocking Stuffers Under $25.webp',
    altKey: 'home.heroPanelTitle',
    width: 800,
    height: 1278,
  },
]

export default function HomeHero() {
  const { t } = useTranslation()
  const trackRef = useRef(null)

  const scrollByPanel = (direction) => {
    const track = trackRef.current
    if (!track) return
    const panel = track.firstElementChild
    const amount = (panel?.getBoundingClientRect().width || track.clientWidth * 0.7) + 1
    track.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  return (
    <div className="w-full">
      <div className="relative">
        <div
          ref={trackRef}
          className="flex
                     gap-px overflow-x-auto snap-x snap-mandatory scrollbar-none"
        >
          {PANELS.map((panel, index) => (
            <div
              key={panel.src}
              className="relative snap-start self-start overflow-hidden bg-neutral-100
                         flex-none basis-[46%] sm:basis-[22%] lg:basis-[25%]
                         aspect-[var(--panel-ar)]"
              style={{ '--panel-ar': `${panel.width} / ${panel.height}` }}
            >
              {panel.type === 'iframe' ? (
                <iframe
                  src={panel.src}
                  title={t(panel.altKey)}
                  loading={index < 4 ? 'eager' : 'lazy'}
                  className="absolute inset-0 h-full w-full border-0"
                />
              ) : (
                <Image
                  src={panel.src}
                  alt={t(panel.altKey)}
                  fill
                  priority={index < 4}
                  fetchPriority={index < 4 ? 'high' : 'auto'}
                  loading={index < 4 ? 'eager' : 'lazy'}
                  unoptimized
                  className={panel.alwaysCover ? 'object-cover' : 'object-contain'}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 20vw, 25vw"
                />
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollByPanel(-1)}
          aria-label="Previous"
          className="absolute left-0.5 lg:left-2 top-1/2 -translate-y-1/2 h-6 w-6 lg:h-10 lg:w-10 rounded-full bg-white/80 hover:bg-white
                     flex items-center justify-center shadow z-10"
        >
          <IoChevronBack size={12} className="lg:hidden" />
          <IoChevronBack size={20} className="hidden lg:block" />
        </button>
        <button
          type="button"
          onClick={() => scrollByPanel(1)}
          aria-label="Next"
          className="absolute right-0.5 lg:right-2 top-1/2 -translate-y-1/2 h-6 w-6 lg:h-10 lg:w-10 rounded-full bg-white/80 hover:bg-white
                     flex items-center justify-center shadow z-10"
        >
          <IoChevronForward size={12} className="lg:hidden" />
          <IoChevronForward size={20} className="hidden lg:block" />
        </button>
      </div>
    </div>
  )
}
