"use client";

import React from "react";
import ReviewCard from "./ReviewCard";

const ReviewList = ({
  data,
  isLoading,
  onDelete,
  stats = { average: 0, count: 0 },
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="h-36 animate-pulse rounded-2xl bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (!data?.items?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-10 text-center">
        <h4 className="text-lg font-semibold text-slate-700">
          No reviews yet
        </h4>
        <p className="mt-2 text-sm text-slate-500">
          Be the first to share your experience.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <p className="text-sm font-semibold text-slate-600">
          {stats.count} review{stats.count === 1 ? "" : "s"} · Average{" "}
          <span className="text-primary-200">{stats.average?.toFixed(2)}</span>
        </p>
      </div>

      {data.items.map((item) => (
        <ReviewCard key={item._id} review={item} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default ReviewList;