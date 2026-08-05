"use client";

import { Star } from "lucide-react";

/**
 * Star display for a tool's rating. The value itself is a stable,
 * name-derived seed (see designTools.js) rather than a live user-vote
 * average — this renders whatever number it's given, callers are
 * responsible for labeling it honestly where that distinction matters.
 */
export default function RatingStars({ rating, size = 14, showValue = true, className = "" }) {
  const filled = Math.round(rating);

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="inline-flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            width={size}
            height={size}
            className={i < filled ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
            aria-hidden="true"
          />
        ))}
      </span>
      {showValue ? <span className="text-sm font-bold text-[#0A0523]">{rating.toFixed(1)}</span> : null}
    </span>
  );
}
