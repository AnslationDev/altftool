"use client";

import React from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { formatPrice, resolveGuestPostPrice } from "../../lib/pricing";

function formatTraffic(value) {
  return Number.isFinite(value) ? `${value.toLocaleString()}/mo` : "Not provided";
}

export default function FeaturedPublishers({
  publishers = [],
  onSelectSite,
  onExploreMarketplace,
}) {
  const approved = publishers
    .filter((publisher) => publisher.status === "APPROVED")
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    .slice(0, 5);

  if (!approved.length) return null;

  return (
    <section className="space-y-4 my-8" aria-labelledby="featured-publishers-heading">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 id="featured-publishers-heading" className="text-xl font-black text-foreground tracking-tight">
            Current Publisher Listings
          </h2>
          <p className="text-xs text-muted">Metrics and prices below are supplied with each approved listing.</p>
        </div>
        <button
          type="button"
          onClick={onExploreMarketplace}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span>View all listings</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {approved.map((publisher) => {
          const label = publisher.name || publisher.domain;
          const initials = (label || "Publisher").slice(0, 2).toUpperCase();
          return (
            <button
              type="button"
              key={publisher.id}
              onClick={() => onSelectSite?.(publisher)}
              className="altf-card p-4 rounded-xl border border-border space-y-4 hover:border-primary transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-extrabold text-xs shrink-0">
                  {initials}
                </span>
                <span className="min-w-0">
                  <span className="text-xs font-extrabold text-foreground truncate flex items-center gap-1">
                    {label}
                    {publisher.verified ? (
                      <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" aria-label="Ownership check recorded" />
                    ) : null}
                  </span>
                  <span className="block text-[10px] font-mono text-muted truncate">{publisher.domain}</span>
                </span>
              </div>

              <dl className="space-y-2 text-[11px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">DR / DA</dt>
                  <dd className="font-mono text-foreground">{publisher.dr ?? "—"} / {publisher.da ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Traffic</dt>
                  <dd className="font-mono text-foreground">{formatTraffic(publisher.traffic)}</dd>
                </div>
                <div className="flex justify-between gap-2 border-t border-border pt-2">
                  <dt className="text-muted">Guest post</dt>
                  <dd className="font-mono font-bold text-primary">
                    {formatPrice(resolveGuestPostPrice(publisher))}
                  </dd>
                </div>
              </dl>
            </button>
          );
        })}
      </div>
    </section>
  );
}
