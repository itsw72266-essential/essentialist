"use client";

import React from "react";
import { HiStar } from "react-icons/hi";

const ReviewStars = ({ value = 0, size = 18 }) => {
  return (
    <div className="flex items-center gap-0.5 text-primary-200">
      {Array.from({ length: 5 }).map((_, idx) => {
        const filled = value >= idx + 1;
        const half = !filled && value > idx && value < idx + 1;
        return (
          <HiStar
            key={idx}
            size={size}
            className={
              filled
                ? "text-primary-200"
                : half
                ? "text-primary-200 opacity-70"
                : "text-slate-300"
            }
          />
        );
      })}
    </div>
  );
};

export default ReviewStars;