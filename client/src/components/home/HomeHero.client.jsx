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
  },
  {
    src: '/assets/holiday-makeup-gift-celebration.png',
    altKey: 'home.heroPanel4Title',
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
          className="grid grid-flow-col auto-cols-[94%] sm:auto-cols-[42%] lg:auto-cols-fr lg:grid-flow-row lg:grid-cols-4
                     gap-0 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-none"
        >
          {PANELS.map((panel, index) => (
            <div
              key={panel.src}
              className="relative snap-start overflow-hidden h-[280px] sm:h-[420px] lg:h-[740px] bg-neutral-100"
            >
              <Image
                src={panel.src}
                alt={t(panel.altKey)}
                fill
                priority={index === 0}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                loading={index === 0 ? 'eager' : 'lazy'}
                unoptimized
                className="object-cover"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 42vw, 94vw"
              />
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
