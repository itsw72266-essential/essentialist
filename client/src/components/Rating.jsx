'use client'

import { useId, useMemo, useState } from 'react'

const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

export default function Rating({
  value = 0,
  onChange,
  size = 20,
  readOnly = false,
  allowHalf = true,
  ariaLabel = 'Product rating',
}) {
  const id = useId()
  const [hover, setHover] = useState(null)
  const display = hover ?? value ?? 0
  const stepValue = useMemo(() => (allowHalf ? 0.5 : 1), [allowHalf])

  const handleKeyDown = (e) => {
    if (readOnly) return
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = clamp((value ?? 0) + stepValue, stepValue, 5)
      onChange?.(next)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = clamp((value ?? 0) - stepValue, stepValue, 5)
      onChange?.(next)
    } else if (e.key === 'Home') {
      e.preventDefault(); onChange?.(stepValue)
    } else if (e.key === 'End') {
      e.preventDefault(); onChange?.(5)
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault(); onChange?.(null)
    }
  }

  const handleClick = (idx, half) => {
    if (readOnly) return
    const val = allowHalf ? idx + (half ? 0.5 : 1) : idx + 1
    onChange?.(val)
  }

  return (
    <div
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={allowHalf ? 0.5 : 1}
      aria-valuemax={5}
      aria-valuenow={typeof value === 'number' ? value : 0}
      tabIndex={readOnly ? -1 : 0}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => setHover(null)}
      className="inline-flex items-center gap-1 select-none"
      id={id}
      style={{ lineHeight: 0 }}
    >
      {[0,1,2,3,4].map((i) => {
        const fullThreshold = i + 1
        const halfThreshold = i + 0.5
        const filled = display >= fullThreshold
        const half = allowHalf && !filled && display >= halfThreshold

        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            {allowHalf && !readOnly && (
              <button
                type="button"
                aria-label={`Rate ${i + 0.5} stars`}
                className="absolute inset-y-0 left-0 w-1/2 h-full"
                onMouseEnter={() => setHover(i + 0.5)}
                onClick={() => handleClick(i, true)}
              />
            )}
            {!readOnly && (
              <button
                type="button"
                aria-label={`Rate ${i + 1} stars`}
                className={`absolute inset-0 ${allowHalf ? 'left-1/2 w-1/2' : 'w-full'}`}
                onMouseEnter={() => setHover(i + 1)}
                onClick={() => handleClick(i, false)}
              />
            )}
            <StarIcon filled={filled} half={half} size={size} />
          </span>
        )
      })}
    </div>
  )
}

function StarIcon({ filled, half, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" className="pointer-events-none">
      <defs>
        <linearGradient id="halfGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#e5e7eb" />
        </linearGradient>
      </defs>
      <path
        d="M10 1.8l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9 5.06 17l.94-5.5-4-3.9 5.53-.8L10 1.8z"
        fill={filled ? '#f59e0b' : half ? 'url(#halfGrad)' : '#e5e7eb'}
        stroke="#d1d5db"
      />
    </svg>
  )
}
