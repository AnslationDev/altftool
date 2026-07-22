"use client";

import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

import Icon from "@/shared/ui/Icon";
import GemRating from "./GemRating";
import { getDealReviewCount, getStaffPicks } from "../data/deals";

export default function StaffPicks() {
  const picks = getStaffPicks();
  if (!picks.length) return null;

  return (
    <section className="section py-6" aria-labelledby="staff-picks-heading">
      <div className="mb-6">
        <h2 id="staff-picks-heading" className="section-title text-left! mb-1">
          Staff picks
        </h2>
        <p className="text-sm text-(--muted-foreground) md:text-base">
          The tools our own team can&apos;t stop talking about.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {picks.map((deal) => (
          <article key={deal.slug} className="afd-card">
            <div className="afd-card-body">
              <div className="flex items-center gap-3">
                <span className="afd-icon-tile">
                  <Icon name={deal.icon ?? "sparkles"} className={`h-6 w-6 ${deal.iconColor ?? "text-(--primary)"}`} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-(--foreground)">{deal.name}</h3>
                  <div className="mt-0.5 flex items-center gap-2">
                    <GemRating rating={deal.rating} size="h-3.5 w-3.5" />
                    <span className="text-xs text-(--muted-foreground)">{getDealReviewCount(deal)} reviews</span>
                  </div>
                </div>
              </div>

              <blockquote className="relative rounded-lg bg-(--primary)/6 p-4 text-sm text-(--foreground)">
                <Quote className="absolute -top-2 left-3 h-4 w-4 text-(--primary)" aria-hidden="true" />
                &ldquo;{deal.staffQuote.text}&rdquo;
                <footer className="mt-2 text-xs font-semibold text-(--muted-foreground)">
                  {deal.staffQuote.author} · {deal.staffQuote.role}
                </footer>
              </blockquote>

              <div className="mt-auto flex items-end justify-between gap-3 border-t border-(--border) pt-3">
                <div className="flex items-baseline gap-2">
                  <span className="afd-price-free">FREE</span>
                  <span className="afd-price-original">${deal.originalPrice}/yr</span>
                </div>
                <Link
                  href={`/deals/${deal.slug}`}
                  className="inline-flex min-h-[36px] items-center gap-1 rounded-lg px-3 text-sm font-semibold text-(--primary) transition-colors hover:bg-(--primary)/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
                >
                  View deal
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
