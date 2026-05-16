'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

import Axios from '@/lib/apiClient'
import SummaryApi from '@/backend/contracts/summaryApi'
import { readPersistedUser } from '@/utils/authUserStorage'
import LeaveReviewModal from './LeaveReviewModal.client'

const OPEN_REVIEW_EVENT = 'essentialist:open-review-modal'

function getInitials(name) {
  const parts = String(name || 'C')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return (parts[0]?.[0] || 'C').toUpperCase()
}

function ReviewStars({ rating, size = 14 }) {
  const value = Number(rating) || 0
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.5}
          className={
            value >= i
              ? 'fill-amber-400 text-amber-400'
              : 'fill-transparent text-slate-200'
          }
        />
      ))}
    </span>
  )
}

export default function ReviewsSection({ productId, productName }) {
  const { t, i18n } = useTranslation()
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
  const displayName = (r) =>
    r.authorName || r?.user?.name || t('product.reviews.customer')

  const formatReviewDate = (iso) => {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleDateString(i18n.language?.startsWith('fr') ? 'fr-FR' : 'en-US')
    } catch {
      return ''
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-0">
        <h2 className="text-xl font-bold text-slate-900">
          {t('product.reviews.sectionTitle')}
        </h2>
        <button
          type="button"
          onClick={openReviewModal}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
        >
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
          {t('product.reviews.leaveReview')}
        </button>
      </div>

      <LeaveReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        productId={productId}
        productName={productName}
        onSubmitted={(message) => {
          toast.success(message || t('product.reviews.modal.thankYou'))
        }}
      />

      <div className="divide-y divide-slate-200">
        {isLoading ? (
          <p className="py-3 text-sm text-slate-500">{t('product.reviews.loading')}</p>
        ) : (
          items.map((r, idx) => {
            const name = displayName(r)
            return (
              <article key={r._id || `${idx}-${name}`} className="flex gap-4 py-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {getInitials(name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <ReviewStars rating={r.rating} />
                    {r.createdAt && (
                      <time
                        className="text-sm text-slate-500"
                        dateTime={r.createdAt}
                      >
                        {formatReviewDate(r.createdAt)}
                      </time>
                    )}
                  </div>
                  {r.title && (
                    <h4 className="mt-3 font-medium text-slate-900">{r.title}</h4>
                  )}
                  {r.comment && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                      {r.comment}
                    </p>
                  )}
                  {r.isVerifiedPurchase && (
                    <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      {t('product.reviews.verifiedPurchase')}
                    </span>
                  )}
                </div>
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}
