import { Gem } from "lucide-react";

// AltF Deals' answer to AppSumo's taco ratings: gems.
export default function GemRating({ rating = 0, size = "h-4 w-4", showValue = false }) {
  const rounded = Math.round(Number(rating) || 0);

  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={`Rated ${rating} out of 5 gems`}>
      {Array.from({ length: 5 }).map((_, idx) => (
        <Gem
          key={idx}
          aria-hidden="true"
          className={`${size} ${idx < rounded ? "fill-(--primary)/25 text-(--primary)" : "text-(--muted-foreground)/50"}`}
        />
      ))}
      {showValue ? (
        <span className="ml-1 text-sm font-semibold text-(--foreground)">{Number(rating).toFixed(1)}</span>
      ) : null}
    </span>
  );
}
