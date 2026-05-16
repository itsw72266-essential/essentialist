'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import Modal from '@/components/Modal'
import Axios from '@/lib/apiClient'
import SummaryApi from '@/backend/contracts/summaryApi'
import AxiosToastError from '@/lib/axiosToastError'
import { emitReviewStatsUpdated } from '@/utils/reviewStatsBatcher'

function InteractiveStars({ value, onChange, size = 36 }) {
  const [hover, setHover] = useState(0)
  const display = hover || value

  return (
    <div
      className="flex items-center justify-center gap-1 py-2"
      role="group"
      aria-label="Select a star rating"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = display >= star
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="rounded-full p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
          >
            <Star
              size={size}
              strokeWidth={1.5}
              className={
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-slate-300'
              }
            />
          </button>
        )
      })}
    </div>
  )
}

export default function LeaveReviewModal({
  open,
  onClose,
  productId,
  productName,
  onSubmitted,
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const resetForm = () => {
    setRating(0)
    setTitle('')
    setComment('')
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const upsertMutation = useMutation({
    mutationFn: async () => {
      const { data: body } = await Axios({
        ...SummaryApi.reviews.create,
        data: {
          productId,
          rating: Number(rating),
          title: title.trim() || undefined,
          comment: comment.trim() || undefined,
          subjectType: 'product',
        },
      })
      return body
    },
    onSuccess: (body) => {
      queryClient.invalidateQueries({ queryKey: ['reviews-public', productId] })
      queryClient.invalidateQueries({ queryKey: ['product-review-stats', productId] })
      emitReviewStatsUpdated(productId)
      resetForm()
      onClose()
      onSubmitted?.(body?.message)
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t('product.reviews.submitFailed')
      setError(msg)
      AxiosToastError(err)
    },
  })

  const canSubmit = rating >= 1 && !upsertMutation.isPending

  return (
    <Modal open={open} onClose={handleClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setError('')
          if (!rating || rating < 1 || rating > 5) {
            setError(t('product.reviews.modal.ratingRequired'))
            return
          }
          upsertMutation.mutate()
        }}
        className="p-6 pt-10 sm:p-8 max-w-lg mx-auto"
      >
        <header className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('product.reviews.modal.title')}
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            {productName
              ? t('product.reviews.modal.introWithProduct', { productName })
              : t('product.reviews.modal.introGeneric')}
          </p>
        </header>

        <InteractiveStars value={rating} onChange={setRating} />

        <div className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="review-title"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              {t('product.reviews.modal.headlineOptional')}
            </label>
            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={140}
              placeholder={t('product.reviews.modal.headlinePlaceholder')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label
              htmlFor="review-comment"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
              {t('product.reviews.modal.experienceOptional')}
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={5000}
              placeholder={t('product.reviews.modal.experiencePlaceholder')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 text-sm resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-rose-600 text-center" role="alert">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={upsertMutation.isPending}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60 transition-colors"
          >
            {t('product.reviews.modal.maybeLater')}
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-800 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {upsertMutation.isPending
              ? t('product.reviews.modal.submitting')
              : t('product.reviews.modal.submit')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
