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
    src: '/assets/Pink Stocking Stuffers Under $25.png',
    altKey: 'home.heroPanelTitle',
    width: 993,
    height: 1584,
  },
  {
    src: '/assets/black-friday-beauty-gift-display.png',
    altKey: 'home.heroPanel1Title',
    width: 993,
    height: 1584,
  },
   {
    src: '/assets/Essentialist Makeup Deals Gift Bundle.png',
    altKey: 'home.heroPanel2Title',
    // Its real pixel dimensions, so object-contain shows the whole image
    // (including the logo near the bottom) uncropped, like its siblings.
    width: 941,
    height: 1505,
  },
  {
    src: '/assets/festive-makeup-savings-ad.png',
    altKey: 'home.heroPanel3Title',
    width: 995,
    height: 1580,
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
    src: '/assets/Holiday Makeup Essentials Savings.png',
    altKey: 'home.heroPanel4Title',
    width: 992,
    height: 1585,
  },
  {
    src: '/assets/holiday-makeup-gift-celebration.png',
    altKey: 'home.heroPanel5Title',
    width: 992,
    height: 1585,
  },
  {
    src: '/assets/Glossy Pink Makeup Sale Essentials.png',
    altKey: 'home.heroPanel5Title',
    width: 993,
    height: 1584,
  },
  {
    src: '/assets/holiday-gifts-esmakeupstore.png',
    altKey: 'home.heroPanel6Title',
    width: 993,
    height: 1584,
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
              <Image
                src={panel.src}
                alt={t(panel.altKey)}
                fill
                priority={index === 0}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                loading={index === 0 ? 'eager' : 'lazy'}
                unoptimized
                className={panel.alwaysCover ? 'object-cover' : 'object-contain'}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 20vw, 25vw"
              />
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
