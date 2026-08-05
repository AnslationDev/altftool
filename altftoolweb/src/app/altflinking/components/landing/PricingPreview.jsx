"use client";

import React from "react";
import { ArrowRight, Check, Globe, Info } from "lucide-react";

export default function PricingPreview({ onExploreMarketplace, onListWebsite }) {
  return (
    <section className="space-y-6" aria-labelledby="pricing-preview-heading">
      <div className="mx-auto max-w-2xl space-y-2 text-center">
        <h2 id="pricing-preview-heading" className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Publisher-provided placement pricing
        </h2>
        <p className="text-sm text-muted">
          Each approved listing shows only the explicit prices its publisher submitted. ALTFTool does not infer a missing price.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        <article className="altf-card flex flex-col justify-between space-y-6 border border-border p-6 sm:p-8">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              FOR PUBLISHERS
            </span>
            <h3 className="text-xl font-black text-foreground">Set explicit listing prices</h3>
            <ul className="space-y-3 text-xs text-muted">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                Submit guest-post and link-insertion prices separately.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                Leave a placement type unavailable instead of supplying an estimate.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                Submit the listing for admin review before it can appear publicly.
              </li>
            </ul>
          </div>
          <button type="button" onClick={onListWebsite} className="altf-btn-secondary w-full py-3 text-xs font-bold">
            Submit a website
            <Globe className="h-4 w-4" aria-hidden="true" />
          </button>
        </article>

        <article className="altf-card flex flex-col justify-between space-y-6 border border-primary/40 p-6 sm:p-8">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              FOR BUYERS
            </span>
            <h3 className="text-xl font-black text-foreground">Request an available placement</h3>
            <ul className="space-y-3 text-xs text-muted">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                Compare the explicit prices recorded on approved listings.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                Treat missing metrics and prices as unavailable, not zero.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                Send a placement request tied to the chosen listing and type.
              </li>
            </ul>
          </div>
          <button type="button" onClick={onExploreMarketplace} className="altf-btn-primary w-full py-3 text-xs font-bold">
            Explore listings
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </article>
      </div>

      <div className="mx-auto flex max-w-4xl items-start gap-3 rounded-lg border border-border bg-surface-soft p-4 text-xs leading-relaxed text-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          Displayed amounts are listing records, not evidence that money was collected or paid. ALTFTool does not currently guarantee fees, payment processing, or publisher payouts.
        </p>
      </div>
    </section>
  );
}
