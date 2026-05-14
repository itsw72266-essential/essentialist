'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import Axios from '@/lib/apiClient'
import SummaryApi from '@/backend/contracts/summaryApi'
import AxiosToastError from '@/lib/axiosToastError'
import { emitReviewStatsUpdated } from '@/utils/reviewStatsBatcher'

const RATING_OPTIONS = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5]

export default function ReviewsSection({ productId }) {
  const queryClient = useQueryClient()
  const [page] = useState(1)
  const [form, setForm] = useState({ rating: 5, title: '', comment: '' })
  const [localError, setLocalError] = useState('')
  const [localSuccess, setLocalSuccess] = useState('')

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

  const upsertMutation = useMutation({
    mutationFn: async () => {
      const headers = {}
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('reviewGuestToken')
        if (token) headers['x-review-token'] = token
      }
      const { data: body } = await Axios({
        ...SummaryApi.reviews.create,
        data: {
          productId,
          rating: Number(form.rating),
          title: form.title?.trim() || undefined,
          comment: form.comment?.trim() || undefined,
          subjectType: 'product',
        },
        headers,
      })
      return body
    },
    onSuccess: (body) => {
      setLocalSuccess(body?.message || 'Thank you — your review was published.')
      setLocalError('')
      if (body?.guestToken && typeof window !== 'undefined') {
        localStorage.setItem('reviewGuestToken', body.guestToken)
      }
      setForm((f) => ({ ...f, title: '', comment: '' }))
      queryClient.invalidateQueries({ queryKey: ['reviews-public', productId] })
      queryClient.invalidateQueries({ queryKey: ['product-review-stats', productId] })
      emitReviewStatsUpdated(productId)
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to save review'
      setLocalError(msg)
      AxiosToastError(err)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await Axios({
        ...SummaryApi.reviews.deleteMine(productId),
      })
    },
    onSuccess: () => {
      setLocalSuccess('Your review was removed.')
      setLocalError('')
      queryClient.invalidateQueries({ queryKey: ['reviews-public', productId] })
      queryClient.invalidateQueries({ queryKey: ['product-review-stats', productId] })
      emitReviewStatsUpdated(productId)
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to delete review'
      setLocalError(msg)
      AxiosToastError(err)
    },
  })

  const items = data?.items ?? []
  const stats = data?.stats ?? { average: 0, count: 0 }
  const submitting = upsertMutation.isPending || deleteMutation.isPending

  const handleSubmit = (e) => {
    e.preventDefault()
    setLocalError('')
    setLocalSuccess('')
    const r = Number(form.rating)
    if (!r || r < 0.5 || r > 5) {
      setLocalError('Please choose a rating between 0.5 and 5 (half-star steps).')
      return
    }
    upsertMutation.mutate()
  }

  const displayName = (r) => r.authorName || r?.user?.name || 'Customer'

  return (
    <div className="mt-2">
      {Number(stats.count) > 0 && (
        <p className="text-sm text-slate-700 mb-4">
          Overall from published reviews:{' '}
          <span className="font-semibold text-slate-900">{Number(stats.average).toFixed(1)}</span>
          <span className="text-slate-500"> / 5</span>
          <span className="text-slate-600"> ({Number(stats.count)} review{Number(stats.count) === 1 ? '' : 's'})</span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="font-semibold text-slate-900">Write a review</h3>
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1">Rating</label>
          <select
            value={form.rating}
            onChange={(e) => setForm((s) => ({ ...s, rating: Number(e.target.value) }))}
            className="border border-slate-300 rounded-lg px-3 py-2 w-full max-w-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            {RATING_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v} / 5
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1">Title (optional)</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 w-full text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
            maxLength={140}
            placeholder="Short headline for your review"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1">Comment</label>
          <textarea
            value={form.comment}
            onChange={(e) => setForm((s) => ({ ...s, comment: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 w-full text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
            rows={4}
            maxLength={5000}
            placeholder="What did you like? How was packaging and delivery?"
          />
        </div>

        {localError && <p className="text-sm text-rose-600">{localError}</p>}
        {localSuccess && <p className="text-sm text-emerald-700">{localSuccess}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
          >
            {upsertMutation.isPending ? 'Publishing…' : 'Publish review'}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => deleteMutation.mutate()}
            className="px-4 py-2 rounded-lg border border-rose-200 text-rose-700 text-sm font-medium hover:bg-rose-50 disabled:opacity-60 transition-colors"
          >
            Delete my review
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-slate-600">Loading reviews…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-700">No published reviews yet. Be the first to share your experience.</p>
        ) : (
          items.map((r, idx) => (
            <div
              key={r._id || `${idx}-${displayName(r)}`}
              className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-900">{displayName(r)}</div>
                <div className="text-xs text-slate-500 whitespace-nowrap">
                  {new Date(r.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="text-sm mt-1 text-slate-800">
                <span className="font-semibold text-amber-600">{r.rating}</span>
                <span className="text-slate-500"> / 5</span>
              </div>
              {r.title && <div className="mt-1 font-medium text-slate-900">{r.title}</div>}
              {r.comment && (
                <p className="text-sm mt-2 whitespace-pre-wrap text-slate-700 leading-relaxed">{r.comment}</p>
              )}
              {r.isVerifiedPurchase && (
                <span className="text-xs text-emerald-800 bg-emerald-50 rounded-full px-2 py-0.5 mt-2 inline-block font-medium">
                  Verified purchase
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
