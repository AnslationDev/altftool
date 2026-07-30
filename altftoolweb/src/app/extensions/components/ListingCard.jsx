"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";

export default function ListingCard({ extension, slug }) {

  const usersCount = extension.users || "10K+";

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
        <div className="flex items-center gap-2 text-sm mt-1">
          <span className="text-(--muted-foreground) font-medium">
            {extension.rating}
          </span>
          <Star className="w-4 h-4 fill-[var(--primary)] text-[var(--primary)]" aria-hidden="true" />
        </div>

        {/* Description */}
        <p className="text-sm text-(--muted-foreground) mt-2 line-clamp-2">
          {extension.description}
        </p>

        {/* Footer (users) */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-xs text-(--muted-foreground)">
          <span>{usersCount} users</span>
          <span className="extension-listing-action inline-flex items-center gap-1 font-bold">
            Open <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
