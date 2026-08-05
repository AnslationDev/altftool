import { Star } from "lucide-react";

/** Compact 5-star rating readout, rounded to the nearest half star visually via fill %. */
export default function RatingStars({ rating, size = 13, showValue = true, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="flex items-center" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => {
          const fill = Math.max(0, Math.min(1, rating - index)) * 100;
          return (
            <span key={index} className="relative inline-block" style={{ width: size, height: size }}>
              <Star className="absolute inset-0 text-slate-200" style={{ width: size, height: size }} fill="currentColor" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill}%` }}>
                <Star className="text-amber-400" style={{ width: size, height: size }} fill="currentColor" />
              </span>
            </span>
          );
        })}
      </span>
      {showValue ? <span className="text-xs font-semibold text-slate-500">{rating.toFixed(1)}</span> : null}
    </span>
  );
}
