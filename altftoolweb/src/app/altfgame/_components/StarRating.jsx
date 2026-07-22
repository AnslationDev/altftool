import { Star } from "lucide-react";

// Compact star rating: a single filled star + numeric value.
export default function StarRating({ value, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 text-amber-400 ${className}`}>
      <Star className="h-3.5 w-3.5 fill-amber-400" strokeWidth={0} />
      <span className="font-medium text-foreground/90">{value.toFixed(1)}</span>
    </span>
  );
}
