'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'

import {
  REVIEW_STATS_UPDATED_EVENT,
  scheduleReviewStatsFetch,
  subscribeReviewStats,
} from '@/utils/reviewStatsBatcher'

function Star({ filled, half, size = 14, gradId }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="inline-block"
      style={{ display: 'inline-block' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="50%" stopColor="#f472b6" />
          <stop offset="50%" stopColor="#e5e7eb" />
        </linearGradient>
      </defs>
      <path
        d="M10 1.8l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9 5.06 17l.94-5.5-4-3.9 5.53-.8L10 1.8z"
        fill={filled ? '#f472b6' : half ? `url(#${gradId})` : '#e5e7eb'}
        stroke="#fbcfe8"
      />
    </svg>
  )
}

export default function CardProductRating({ productId }) {
  const halfGradId = useId().replace(/:/g, '')
  const rootRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [avg, setAvg] = useState(0)
  const [count, setCount] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!productId || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const el = rootRef.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { root: null, rootMargin: '160px 0px', threshold: 0.01 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [productId])

  useEffect(() => {
    if (!visible || !productId) return

    const unsub = subscribeReviewStats(productId, (stats) => {
      setAvg(Number(stats.average) || 0)
      setCount(Number(stats.count) || 0)
      setReady(true)
    })
    scheduleReviewStatsFetch(productId)
    return unsub
  }, [visible, productId])

  useEffect(() => {
    if (!productId || typeof window === 'undefined') return
    const onUpdate = (e) => {
      if (String(e.detail?.productId) === String(productId)) {
        scheduleReviewStatsFetch(productId)
      }
    }
    window.addEventListener(REVIEW_STATS_UPDATED_EVENT, onUpdate)
    return () => window.removeEventListener(REVIEW_STATS_UPDATED_EVENT, onUpdate)
  }, [productId])

  const stars = useMemo(() => {
    const display = Number(avg || 0)
    return [0, 1, 2, 3, 4].map((i) => {
      const full = display >= i + 1
      const half = !full && display >= i + 0.5
      return { full, half }
    })
  }, [avg])

  return (
    <span
      ref={rootRef}
      className="inline-flex min-h-4 min-w-[1.5rem] max-w-[7rem] items-center justify-end"
    >
      {ready && count > 0 ? (
        <span
          className="flex items-center gap-1"
          aria-label={`Average rating ${avg.toFixed(1)} from ${count} reviews`}
        >
          <span className="flex items-center gap-0.5">
            {stars.map((st, idx) => (
              <Star
                key={idx}
                filled={st.full}
                half={st.half}
                size={14}
                gradId={`${halfGradId}-${idx}`}
              />
            ))}
          </span>
          <span className="text-[11px] text-gray-700">
            <span className="font-semibold">{avg.toFixed(1)}</span>
            <span className="text-gray-500 ml-1">({count})</span>
          </span>
        </span>
      ) : null}
    </span>
  )
}
