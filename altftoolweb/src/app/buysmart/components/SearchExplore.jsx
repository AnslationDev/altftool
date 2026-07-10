"use client";

import { ArrowRight } from "lucide-react";

import ManagedImage from "@/components/ui/ManagedImage";

export default function SearchExplore({
  scrollToFilter,
}) {
  return (
    <section className="space-y-5 animate-slide-up">
      <div className="buy-smart-deals-banner relative overflow-hidden px-5 py-3.5 shadow-[var(--anslation-ds-shadow-sm)] sm:px-7 sm:py-4 lg:px-10">
        <div className="pointer-events-none absolute inset-0" />
        <div className="buy-smart-deals-inner relative z-10 grid items-center gap-5 md:grid-cols-[240px_minmax(0,1fr)_auto] lg:grid-cols-[280px_minmax(0,1fr)_auto]">
          <ManagedImage
            src="/buy-smart/deals-gift.png"
            alt="Gift box with deal confetti"
            loading="lazy"
            decoding="async"
            className="mx-auto h-[120px] w-full max-w-[220px] object-contain md:h-[150px] md:max-w-[260px]"
          />
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-extrabold leading-tight text-(--foreground) sm:text-3xl">
              Exclusive deals, handpicked for you!
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-(--muted-foreground) sm:text-base">
              Save more with curated offers from top brands.
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToFilter}
            className="buy-smart-gradient-cta mx-auto inline-flex h-12 min-w-[150px] items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] px-5 text-sm font-bold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-(--primary) md:mx-0"
          >
            Explore Deals
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
