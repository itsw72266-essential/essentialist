'use client'

import { useEffect, useMemo, useState } from 'react'

function Star({ filled, half, size = 14 }) {
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
        <linearGradient id="halfGradCard" x1="0" x2="1" y1="0" y2="0">
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#e5e7eb" />
        </linearGradient>
      </defs>
      <path
        d="M10 1.8l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9 5.06 17l.94-5.5-4-3.9 5.53-.8L10 1.8z"
        fill={filled ? '#f59e0b' : half ? 'url(#halfGradCard)' : '#e5e7eb'}
        stroke="#d1d5db"
      />
    </svg>
  )
}

export default function CardProductRating({ productId, initial }) {
  const [avg, setAvg] = useState(
    typeof initial?.average === 'number' ? initial.average : 0
  )
  const [count, setCount] = useState(
    typeof initial?.count === 'number' ? initial.count : 0
  )

  // Only fetch if no initial rating provided
  useEffect(() => {
    let ignore = false
    async function run() {
      if (typeof initial?.average === 'number') return
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (!apiUrl) return
        const res = await fetch(`${apiUrl}/api/ratings/${productId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        })
        if (!res.ok) return
        const json = await res.json()
        const data = json?.data || { average: 0, count: 0 }
        if (!ignore) {
          setAvg(Number(data.average || 0))
          setCount(Number(data.count || 0))
        }
      } catch {
        // silent
      }
    }
    run()
    return () => { ignore = true }
  }, [productId, initial])

  const stars = useMemo(() => {
    const display = Number(avg || 0)
    return [0,1,2,3,4].map((i) => {
      const full = display >= i + 1
      const half = !full && display >= i + 0.5
      return { full, half }
    })
  }, [avg])

  return (
    <div className="flex items-center gap-1" aria-label="Product rating">
      <div className="flex items-center gap-0.5">
        {stars.map((st, idx) => (
          <Star key={idx} filled={st.full} half={st.half} size={14} />
        ))}
      </div>
      <div className="text-[11px] text-gray-700">
        <span className="font-semibold">{avg?.toFixed(2)}</span>
        <span className="text-gray-500 ml-1">({count})</span>
      </div>
    </div>
  )
}