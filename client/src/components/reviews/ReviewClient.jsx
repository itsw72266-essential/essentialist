"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";
import { usePublicReviews } from "@/hooks/queries/reviews";
import ReviewCard from "@/components/reviews/ReviewCard";
import ReviewForm from "@/components/reviews/ReviewForm";
import RatingStars from "@/components/reviews/RatingStars";

const SUBJECT_FILTERS = [
  { label: "All", value: "all" },
  { label: "Product", value: "product" },
  { label: "Customer Service", value: "customer_service" },
  { label: "Shipping", value: "shipping" },
  { label: "In-store Experience", value: "environment" },
  { label: "Website", value: "website" },
  { label: "Other", value: "other" },
];

const MIN_RATINGS = [0, 3, 3.5, 4, 4.5];

export default function ReviewClient() {
  const [subjectType, setSubjectType] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const queryPayload = useMemo(
    () => ({
      subjectType,
      minRating: minRating || undefined,
      verifiedOnly: verifiedOnly || undefined,
      limit: 6,
    }),
    [subjectType, minRating, verifiedOnly]
  );

  const {
    data,
    status,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = usePublicReviews(queryPayload);

  const reviews = useMemo(() => {
    if (!data?.pages?.length) return [];
    return data.pages.flatMap((page) => page.items ?? []);
  }, [data]);

  const stats = data?.pages?.[0]?.stats ?? { average: 0, count: 0 };
  const { average, count } = stats;
  const normalizedAverage = Number(average || 0).toFixed(1);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [subjectType, minRating, verifiedOnly]);

  const handleResetFilters = () => {
    setSubjectType("all");
    setMinRating(0);
    setVerifiedOnly(false);
  };

  const isLoadingInitial =
    status === "pending" || status === "loading" || status === "idle";

  const isEmpty = !isFetching && reviews.length === 0;
  const formSubject =
    subjectType === "all" || !subjectType ? "product" : subjectType;

  return (
    <div className="bg-gradient-to-b from-white via-white to-primary-100/10 py-12">
      <section className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <header className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-secondary-100/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-secondary-100">
              Trusted customer voices
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
              See how real shoppers feel about Essentialist
            </h1>
            <p className="text-base text-slate-600 md:text-lg">
              Browse authentic experiences across our products, shipping, stores
              and support team. Filter by subject, minimum rating, or verified
              purchases.
            </p>

            <div className="flex flex-wrap items-center gap-6 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-inner">
              <div>
                <div className="text-4xl font-bold text-secondary-200">
                  {normalizedAverage}
                </div>
                <div className="text-sm font-semibold text-slate-600">
                  Average rating
                </div>
                <div className="text-xs text-slate-500">
                  {count} {count === 1 ? "review" : "reviews"}
                </div>
              </div>
              <RatingStars value={Number(average || 0)} size={20} />
            </div>
          </div>

          <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-secondary-100/10 bg-gradient-to-br from-secondary-100/10 via-white to-primary-100/20 p-6 shadow-xl shadow-secondary-100/10">
            <div>
              <h2 className="text-xl font-semibold text-secondary-100">
                Why we moderate carefully
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                Every submission passes authenticity checks. We remove spam,
                verify purchases where possible, and surface the most helpful
                stories.
              </p>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• Transparent ratings with zero pay-to-play.</li>
              <li>• Verified purchase badges for genuine orders.</li>
              <li>• Admin dashboard for rapid moderation.</li>
            </ul>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-secondary-200 px-4 py-2 text-sm font-semibold text-secondary-200 transition hover:bg-secondary-200 hover:text-white"
            >
              <RefreshCcw size={16} />
              Refresh reviews
            </button>
          </div>
        </header>

        <section className="mt-12 grid gap-10 lg:grid-cols-[1.6fr,1fr] lg:items-start">
          <div className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_FILTERS.map((filter) => {
                    const isActive = subjectType === filter.value;
                    return (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => setSubjectType(filter.value)}
                        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                          isActive
                            ? "bg-secondary-200 text-white shadow-sm"
                            : "border border-slate-200 text-slate-600 hover:border-secondary-100 hover:text-secondary-200"
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-100 underline-offset-4 hover:underline"
                >
                  Reset filters
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <label className="flex items-center gap-2">
                  <span>Minimum rating</span>
                  <select
                    value={minRating}
                    onChange={(event) => setMinRating(Number(event.target.value))}
                    className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-700 focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30"
                  >
                    {MIN_RATINGS.map((value) => (
                      <option value={value} key={value}>
                        {value === 0 ? "All" : `${value}+`}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(event) => setVerifiedOnly(event.target.checked)}
                    className="h-4 w-4 rounded border border-slate-300 text-secondary-200 focus:ring-secondary-200"
                  />
                  Verified purchases only
                </label>
              </div>
            </div>

            {isLoadingInitial && (
              <div className="flex items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/80 p-10 text-sm text-slate-500">
                <Loader2 size={20} className="mr-2 animate-spin" />
                Fetching reviews…
              </div>
            )}

            {isEmpty && (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-10 text-center text-sm text-slate-500">
                No reviews match these filters yet. Be the first to share your
                story!
              </div>
            )}

            <div className="grid gap-6">
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>

            {hasNextPage && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="inline-flex items-center gap-2 rounded-full border border-secondary-200 px-6 py-2 text-sm font-semibold text-secondary-200 transition hover:bg-secondary-200 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isFetchingNextPage && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {isFetchingNextPage ? "Loading more…" : "Load more reviews"}
                </button>
              </div>
            )}
          </div>

          <div className="sticky top-24">
            <ReviewForm defaultSubject={formSubject} />
          </div>
        </section>
      </section>
    </div>
  );
}