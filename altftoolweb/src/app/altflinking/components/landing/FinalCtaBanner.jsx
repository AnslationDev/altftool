"use client";

import React from "react";
import { ArrowRight, Globe, Search } from "lucide-react";

export default function FinalCtaBanner({ onExploreMarketplace, onListWebsite }) {
  return (
    <section className="altf-card border border-primary/30 bg-surface-soft p-6 sm:p-10" aria-labelledby="final-cta-heading">
      <div className="max-w-3xl space-y-4">
        <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          REVIEW THE AVAILABLE LISTINGS
        </span>
        <h2 id="final-cta-heading" className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          Browse placement details or submit your website
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Public listings contain publisher-submitted prices and details that have passed through admin review. Some metrics may be unavailable, and a placement request does not guarantee publication, payment, link attributes, or search indexing.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" onClick={onExploreMarketplace} className="altf-btn-primary px-6 py-3 text-xs font-bold sm:text-sm">
            <Search className="h-4 w-4" aria-hidden="true" />
            Explore listings
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={onListWebsite} className="altf-btn-secondary px-6 py-3 text-xs font-bold sm:text-sm">
            <Globe className="h-4 w-4" aria-hidden="true" />
            Submit a website
          </button>
        </div>
      </div>
    </section>
  );
}
