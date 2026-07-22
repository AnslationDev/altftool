import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function ReviewCard({ review }) {
  const initials = review.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-xl">
      <div className="mb-3 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-foreground/15"}`} />
        ))}
      </div>
      <p className="flex-1 text-sm leading-relaxed text-foreground/90">&ldquo;{review.quote}&rdquo;</p>
      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <div className="text-sm font-semibold">{review.name}</div>
          <div className="text-xs text-muted-foreground">{review.role}, {review.company}</div>
        </div>
      </div>
    </div>
  );
}
