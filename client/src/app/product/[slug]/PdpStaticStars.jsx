'use client'

export default function PdpStaticStars({ average = 0, count = 0, size = 18 }) {
  const avg = Number(average || 0)
  const stars = [0, 1, 2, 3, 4].map((i) => {
    const full = avg >= i + 1
    const half = !full && avg >= i + 0.5
    return { full, half }
  })

  return (
    <div className="flex items-center gap-2" aria-label="Product rating summary">
      <div className="flex items-center gap-0.5">
        {stars.map((s, idx) => (
          <Star key={idx} filled={s.full} half={s.half} size={size} />
        ))}
      </div>
      <div className="text-sm text-gray-700">
        <span className="font-semibold">{avg.toFixed(2)}</span>
        <span className="ml-1 text-gray-500">({count} {count === 1 ? 'rating' : 'ratings'})</span>
      </div>
    </div>
  )
}

function Star({ filled, half, size = 18 }) {
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
        <linearGradient id="halfGradPdp" x1="0" x2="1" y1="0" y2="0">
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#e5e7eb" />
        </linearGradient>
      </defs>
      <path
        d="M10 1.8l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9 5.06 17l.94-5.5-4-3.9 5.53-.8L10 1.8z"
        fill={filled ? '#f59e0b' : half ? 'url(#halfGradPdp)' : '#e5e7eb'}
        stroke="#d1d5db"
      />
    </svg>
  )
}