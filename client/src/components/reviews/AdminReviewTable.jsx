"use client";

import React from "react";
import dayjs from "dayjs";
import clsx from "clsx";

import ReviewStars from "./ReviewStars";

const statusOptions = ["published", "pending", "hidden"];

const AdminReviewTable = ({
  items,
  onStatusChange,
  onDelete,
  loadingRowId,
}) => {
  if (!items?.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
        No reviews match your filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      <div className="hidden bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid md:grid-cols-[1.4fr,1fr,1fr,0.8fr,120px]">
        <span>Review</span>
        <span>Product / Subject</span>
        <span>Author</span>
        <span>Rating</span>
        <span>Status</span>
      </div>

      <ul className="divide-y divide-slate-100">
        {items.map((review) => (
          <li
            key={review._id}
            className="grid gap-4 px-4 py-4 md:grid-cols-[1.4fr,1fr,1fr,0.8fr,120px]"
          >
            <div>
              <p className="font-semibold text-slate-800">
                {review.title || "Untitled review"}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {review.comment}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {dayjs(review.createdAt).format("MMM D, YYYY h:mm A")}
              </p>
            </div>

            <div className="text-sm text-slate-600">
              {review.product?.name || "—"}
              <div className="text-xs uppercase text-slate-400">
                {review.subjectType}
              </div>
            </div>

            <div className="text-sm text-slate-600">
              {review.authorName}
              <div className="text-xs text-slate-400">{review.authorEmail}</div>
            </div>

            <div className="flex flex-col">
              <ReviewStars value={review.rating} size={14} />
              <span className="text-xs text-slate-500">
                {review.rating.toFixed(1)}
              </span>
            </div>

            <div className="flex flex-col gap-2 text-sm">
              <select
                className={clsx(
                  "rounded-md border px-2 py-1 text-xs font-semibold uppercase",
                  review.status === "published"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : review.status === "pending"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-slate-100 text-slate-500"
                )}
                value={review.status}
                disabled={loadingRowId === review._id}
                onChange={(e) =>
                  onStatusChange(review._id, { status: e.target.value })
                }
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="text-left text-xs font-semibold text-red-500"
                onClick={() => onDelete(review._id)}
                disabled={loadingRowId === review._id}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminReviewTable;