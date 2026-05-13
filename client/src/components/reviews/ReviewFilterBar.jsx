"use client";

import React from "react";
import { SUBJECT_TYPES } from "@/constants/reviews"; // create if not present
import clsx from "clsx";

const ratingOptions = [
  { label: "All ratings", value: "" },
  { label: "4 ★ & up", value: 4 },
  { label: "3 ★ & up", value: 3 },
  { label: "2 ★ & up", value: 2 },
  { label: "1 ★ & up", value: 1 },
];

const ReviewFilterBar = ({
  filters,
  onChange,
  loading,
  showSubject = true,
}) => {
  const handle = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap gap-3">
        {showSubject && (
          <div className="flex flex-wrap gap-2">
            {SUBJECT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={clsx(
                  "rounded-full border px-3 py-1 text-sm capitalize transition",
                  filters.subjectType === type
                    ? "border-primary-200 bg-primary-200/10 text-primary-200"
                    : "border-slate-200 text-slate-600 hover:border-primary-200"
                )}
                onClick={() => handle("subjectType", type)}
                disabled={loading}
              >
                {type.replace("_", " ")}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500">Min rating</label>
          <select
            value={filters.minRating ?? ""}
            onChange={(e) => handle("minRating", e.target.value || null)}
            className="rounded-md border border-slate-200 px-2 py-1 text-sm"
            disabled={loading}
          >
            {ratingOptions.map((opt) => (
              <option value={opt.value} key={opt.label}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => handle("verifiedOnly", e.target.checked)}
            disabled={loading}
          />
          Verified purchases
        </label>
      </div>
    </div>
  );
};

export default ReviewFilterBar;