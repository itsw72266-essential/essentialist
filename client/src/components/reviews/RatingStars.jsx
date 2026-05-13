"use client";

import { memo, useMemo } from "react";
import { Star, StarHalf, StarOff } from "lucide-react";

const MAX_STARS = 5;
const HALF_STEP = 0.5;

function RatingStars({
  value = 0,
  size = 18,
  editable = false,
  onChange,
  id,
  className = "",
}) {
  const displayStars = useMemo(() => {
    const stars = [];
    for (let i = 1; i <= MAX_STARS; i += 1) {
      if (value >= i) {
        stars.push("full");
      } else if (value >= i - HALF_STEP) {
        stars.push("half");
      } else {
        stars.push("empty");
      }
    }
    return stars;
  }, [value]);

  if (!editable) {
    return (
      <div className={`flex items-center gap-1 text-primary-200 ${className}`}>
        {displayStars.map((state, index) => {
          const key = `${id || "star"}-readonly-${index}`;
          if (state === "full") {
            return (
              <Star
                key={key}
                size={size}
                strokeWidth={1.5}
                className="fill-primary-200 text-primary-200"
              />
            );
          }
          if (state === "half") {
            return (
              <StarHalf
                key={key}
                size={size}
                strokeWidth={1.5}
                className="fill-primary-200 text-primary-200"
              />
            );
          }
          return (
            <StarOff
              key={key}
              size={size}
              strokeWidth={1.5}
              className="text-slate-300"
            />
          );
        })}
      </div>
    );
  }

  const handleSelect = (score) => {
    if (typeof onChange === "function") {
      onChange(score);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: MAX_STARS * 2 }).map((_, index) => {
        const score = (index + 1) * HALF_STEP;
        const isActive = value >= score;
        const iconKey = `${id || "star"}-editable-${score}`;

        const Icon = score % 1 === 0 ? Star : StarHalf;
        return (
          <button
            key={iconKey}
            type="button"
            onClick={() => handleSelect(score)}
            className={`rounded-full p-0.5 transition ${
              isActive
                ? "text-primary-200"
                : "text-slate-400 hover:text-primary-100"
            }`}
            aria-label={`Set rating to ${score} stars`}
          >
            <Icon
              size={size}
              strokeWidth={1.6}
              className={isActive ? "fill-primary-200" : "fill-transparent"}
            />
          </button>
        );
      })}
    </div>
  );
}

export default memo(RatingStars);