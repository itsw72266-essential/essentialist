'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { usePublicReviews } from '@/hooks/queries/reviews'
import ReviewCard from '@/components/reviews/ReviewCard'
import ReviewForm from '@/components/reviews/ReviewForm'
import RatingStars from '@/components/reviews/RatingStars'
import '@/lib/i18n'

const SUBJECT_FILTER_KEYS = [
  { labelKey: 'reviewsPage.filterAll', value: 'all' },
  { labelKey: 'reviewsPage.filterProduct', value: 'product' },
  { labelKey: 'reviewsPage.filterService', value: 'customer_service' },
  { labelKey: 'reviewsPage.filterShipping', value: 'shipping' },
  { labelKey: 'reviewsPage.filterStore', value: 'environment' },
  { labelKey: 'reviewsPage.filterWebsite', value: 'website' },
  { labelKey: 'reviewsPage.filterOther', value: 'other' },
]

const MIN_RATINGS = [0, 3, 3.5, 4, 4.5]

export default function ReviewClient() {
  const { t } = useTranslation()
  const [subjectType, setSubjectType] = useState('all')
  const [minRating, setMinRating] = useState(0)
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  const queryPayload = useMemo(
    () => ({
      subjectType,
      minRating: minRating || undefined,
      verifiedOnly: verifiedOnly || undefined,
      limit: 6,
    }),
    [subjectType, minRating, verifiedOnly],
  )

  const {
    data,
    status,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = usePublicReviews(queryPayload)

  const reviews = useMemo(() => {
    if (!data?.pages?.length) return []
    return data.pages.flatMap((page) => page.items ?? [])
  }, [data])

  const stats = data?.pages?.[0]?.stats ?? { average: 0, count: 0 }
  const { average, count } = stats
  const normalizedAverage = Number(average || 0).toFixed(1)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [subjectType, minRating, verifiedOnly])

  const handleResetFilters = () => {
    setSubjectType('all')
    setMinRating(0)
    setVerifiedOnly(false)
  }

  const isLoadingInitial =
    status === 'pending' || status === 'loading' || status === 'idle'

  const isEmpty = !isFetching && reviews.length === 0
  const formSubject =
    subjectType === 'all' || !subjectType ? 'product' : subjectType

  return (
    <div className="bg-gradient-to-b from-white via-white to-primary-100/10 py-12">
      <section className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <header className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-secondary-100/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-secondary-100">
              {t('reviewsPage.badge')}
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
              {t('reviewsPage.heroTitle')}
            </h1>
            <p className="text-base text-slate-600 md:text-lg">
              {t('reviewsPage.heroIntro')}
            </p>

            <div className="flex flex-wrap items-center gap-6 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-inner">
              <div>
                <div className="text-4xl font-bold text-secondary-200">
                  {normalizedAverage}
                </div>
                <div className="text-sm font-semibold text-slate-600">
                  {t('reviewsPage.averageRating')}
                </div>
                <div className="text-xs text-slate-500">
                  {t('reviewsPage.count', { count })}
                </div>
              </div>
              <RatingStars value={Number(average || 0)} size={20} />
            </div>
          </div>

          <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-secondary-100/10 bg-gradient-to-br from-secondary-100/10 via-white to-primary-100/20 p-6 shadow-xl shadow-secondary-100/10">
            <div>
              <h2 className="text-xl font-semibold text-secondary-100">
                {t('reviewsPage.whyModerateTitle')}
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                {t('reviewsPage.whyModerateBody')}
              </p>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• {t('reviewsPage.bullet1')}</li>
              <li>• {t('reviewsPage.bullet2')}</li>
              <li>• {t('reviewsPage.bullet3')}</li>
            </ul>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-secondary-200 px-4 py-2 text-sm font-semibold text-secondary-200 transition hover:bg-secondary-200 hover:text-white"
            >
              <RefreshCcw size={16} />
              {t('reviewsPage.refresh')}
            </button>
          </div>
        </header>

        <section className="mt-12 grid gap-10 lg:grid-cols-[1.6fr,1fr] lg:items-start">
          <div className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_FILTER_KEYS.map((filter) => {
                    const active = subjectType === filter.value
                    return (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => setSubjectType(filter.value)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          active
                            ? 'bg-secondary-200 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t(filter.labelKey)}
                      </button>
                    )
                  })}
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-secondary-200 hover:underline"
                >
                  {t('reviewsPage.resetFilters')}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <span>{t('reviewsPage.minRating')}</span>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="rounded border border-slate-200 px-2 py-1 text-sm"
                  >
                    {MIN_RATINGS.map((r) => (
                      <option key={r} value={r}>
                        {r === 0 ? t('reviewsPage.filterAll') : `${r}+`}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                  />
                  {t('reviewsPage.verifiedOnly')}
                </label>
              </div>
            </div>

            {isLoadingInitial ? (
              <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
                <Loader2 className="animate-spin" size={20} />
                {t('reviewsPage.loading')}
              </div>
            ) : isEmpty ? (
              <p className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-600">
                {t('reviewsPage.empty')}
              </p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
                {hasNextPage && (
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="w-full rounded-full border border-secondary-200 py-3 text-sm font-semibold text-secondary-200 transition hover:bg-secondary-200 hover:text-white disabled:opacity-50"
                  >
                    {isFetchingNextPage
                      ? t('reviewsPage.loadingMore')
                      : t('reviewsPage.loadMore')}
                  </button>
                )}
              </div>
            )}
          </div>

          <ReviewForm defaultSubject={formSubject} />
        </section>
      </section>
    </div>
  )
}

