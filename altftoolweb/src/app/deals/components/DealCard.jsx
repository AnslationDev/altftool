"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Icon from "@/shared/ui/Icon";
import GemRating from "./GemRating";
import { UrgencyBadge } from "./CountdownTimer";
import { getDealReviewCount } from "../data/deals";

export default function DealCard({ deal, rank = null }) {
  if (!deal) return null;
  const reviewCount = getDealReviewCount(deal);
  const isNew = deal.shelves?.includes("justLaunched");
  const isEnding = deal.shelves?.includes("endingSoon");

  return (
    <article className="afd-card group" data-testid={`deal-card-${deal.slug}`}>
      <div className="afd-card-body">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {Number.isInteger(rank) ? <span className="afd-rank">{rank}</span> : null}
            <span className="afd-icon-tile">
              <Icon name={deal.icon ?? "sparkles"} className={`h-6 w-6 ${deal.iconColor ?? "text-(--primary)"}`} />
            </span>
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            {isNew ? <span className="afd-badge afd-badge-new">Just launched</span> : null}
            {isEnding ? <UrgencyBadge /> : null}
          </div>
        </div>

        <div>
          <Link
            href={`/deals/${deal.slug}`}
            className="rounded-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
          >
            <h3 className="text-base font-bold text-(--foreground) transition-colors group-hover:text-(--primary)">
              {deal.name}
            </h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-(--muted-foreground)">{deal.tagline}</p>
        </div>

        <div className="flex items-center gap-2">
          <GemRating rating={deal.rating} />
          <span className="text-xs text-(--muted-foreground)">
            {reviewCount > 0 ? `${reviewCount} reviews` : "No reviews yet"}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-(--border) pt-3">
          <div className="flex items-baseline gap-2">
            <span className="afd-price-free">FREE</span>
            <span className="text-xs font-semibold text-(--muted-foreground)">/lifetime</span>
            <span className="afd-price-original">${deal.originalPrice}/yr</span>
          </div>
          <Link
            href={`/deals/${deal.slug}`}
            aria-label={`View deal: ${deal.name}`}
            className="inline-flex min-h-[36px] items-center gap-1 rounded-lg px-3 text-sm font-semibold text-(--primary) transition-colors hover:bg-(--primary)/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
          >
            View deal
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
