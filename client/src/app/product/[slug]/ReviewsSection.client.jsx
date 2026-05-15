'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import toast from 'react-hot-toast'

import Axios from '@/lib/apiClient'
import SummaryApi from '@/backend/contracts/summaryApi'
import { readPersistedUser } from '@/utils/authUserStorage'
import LeaveReviewModal from './LeaveReviewModal.client'

const OPEN_REVIEW_EVENT = 'essentialist:open-review-modal'

export default function ReviewsSection({ productId, productName }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [modalOpen, setModalOpen] = useState(false)
  const [page] = useState(1)

  const returnPath = useMemo(() => {
    const qs = searchParams?.toString()
    return `${pathname}${qs ? `?${qs}` : ''}#reviews`
  }, [pathname, searchParams])

  const isLoggedIn = useCallback(() => {
    const user = readPersistedUser()
    return Boolean(user?._id)
  }, [])

  const openReviewModal = useCallback(() => {
    if (!isLoggedIn()) {
      const redirect = encodeURIComponent(returnPath)
      router.push(`/login?redirect=${redirect}`)
      return
    }
    setModalOpen(true)
  }, [isLoggedIn, returnPath, router])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const shouldOpen =
      searchParams?.get('writeReview') === '1' ||
      searchParams?.get('openReview') === '1'
    if (shouldOpen && isLoggedIn()) {
      setModalOpen(true)
    }
  }, [searchParams, isLoggedIn])

  useEffect(() => {
    const handler = () => openReviewModal()
    window.addEventListener(OPEN_REVIEW_EVENT, handler)
    return () => window.removeEventListener(OPEN_REVIEW_EVENT, handler)
  }, [openReviewModal])

  const { data, isLoading } = useQuery({
    queryKey: ['reviews-public', productId, page],
    queryFn: async () => {
      const { data: body } = await Axios({
        ...SummaryApi.reviews.listByProduct(productId),
        params: { page, limit: 10 },
      })
      return (
        body?.data ?? {
          items: [],
          stats: { average: 0, count: 0 },
          total: 0,
        }
      )
    },
    enabled: Boolean(productId),
  })

  const items = data?.items ?? []
  const stats = data?.stats ?? { average: 0, count: 0 }
  const displayName = (r) => r.authorName || r?.user?.name || 'Customer'

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          {Number(stats.count) > 0 ? (
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">
                {Number(stats.average).toFixed(1)}
              </span>
              <span className="text-slate-500"> / 5</span>
              <span className="text-slate-600">
                {' '}
                ({Number(stats.count)} review{Number(stats.count) === 1 ? '' : 's'})
              </span>
            </p>
          ) : (
            <p className="text-sm text-slate-600">No published reviews yet.</p>
          )}
        </div>

        <button
          type="button"
          onClick={openReviewModal}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
        >
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
          Leave a Review
        </button>
      </div>

      <LeaveReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        productId={productId}
        productName={productName}
        onSubmitted={(message) => {
          toast.success(message || 'Thank you — your review was published.')
        }}
      />

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-slate-600">Loading reviews…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-700 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center">
            Be the first to share your experience. Click &ldquo;Leave a Review&rdquo; above.
          </p>
        ) : (
          items.map((r, idx) => (
            <article
              key={r._id || `${idx}-${displayName(r)}`}
              className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-900">{displayName(r)}</div>
                <time
                  className="text-xs text-slate-500 whitespace-nowrap"
                  dateTime={r.createdAt}
                >
                  {new Date(r.createdAt).toLocaleString()}
                </time>
              </div>
              <div className="flex items-center gap-0.5 mt-2" aria-hidden>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      Number(r.rating) >= i
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-transparent text-slate-200'
                    }`}
                  />
                ))}
                <span className="ml-2 text-xs text-slate-600">{r.rating} / 5</span>
              </div>
              {r.title && <h4 className="mt-2 font-medium text-slate-900">{r.title}</h4>}
              {r.comment && (
                <p className="text-sm mt-2 whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {r.comment}
                </p>
              )}
              {r.isVerifiedPurchase && (
                <span className="text-xs text-emerald-800 bg-emerald-50 rounded-full px-2 py-0.5 mt-2 inline-block font-medium">
                  Verified purchase
                </span>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  )
}
