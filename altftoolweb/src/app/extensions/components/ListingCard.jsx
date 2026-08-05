"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";

export default function ListingCard({ extension, slug }) {

  // Was `extension.users || "10K+"`. Every one of the 57 Firestore extension
  // records has an empty `users` field (39 omit it, 18 store ""), so the
  // fallback fired on all of them and the grid published an invented install
  // count of "10K+ users" on every card. There is no analytics feed behind
  // this number, so the row renders only when a record actually carries one.
  const usersCount =
    typeof extension.users === "string" || typeof extension.users === "number"
      ? String(extension.users).trim()
      : "";

  // Same rule for the rating: the star only appears next to a real value, and
  // a 0 from an unrated record must not render as a zero-star score.
  const ratingValue =
    typeof extension.rating === "number" && extension.rating > 0
      ? String(extension.rating)
      : "";

  return (
    <Link
      href={`/extensions/${slug}`}
      className="extension-listing-card group block min-h-[300px] rounded-xl border border-[var(--border)] bg-[var(--card)] transition-all duration-300 animate-slide-down"
    >
      <div className="h-full gap-3 p-4 flex flex-col ">

        {/* Thumbnail */}
        {/* Thumbnail */}
        <div className="extension-listing-thumb relative w-full h-[150px] rounded-xl overflow-hidden text-center ">

          {extension?.image && extension.image.trim() !== "" ? (
            <ManagedImage
              src={extension.image}
              alt={extension.name || "extension"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--muted-foreground)] text-sm">
              No image
            </div>
          )}

        </div>


        {/* Title */}
        <h3 className="font-semibold text-[15px] leading-snug text-(--foreground) line-clamp-2 ">
          {extension.name}
        </h3>

        {/* Rating row */}
        {ratingValue ? (
          <div className="flex items-center gap-2 text-sm mt-1">
            <span className="text-(--muted-foreground) font-medium">
              {ratingValue}
            </span>
            <Star className="w-4 h-4 fill-[var(--primary)] text-[var(--primary)]" aria-hidden="true" />
          </div>
        ) : null}

        {/* Description */}
        <p className="text-sm text-(--muted-foreground) mt-2 line-clamp-2">
          {extension.description}
        </p>

        {/* Footer (users) */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-xs text-(--muted-foreground)">
          {usersCount ? <span>{usersCount} users</span> : <span />}
          <span className="extension-listing-action inline-flex items-center gap-1 font-bold">
            Open <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
