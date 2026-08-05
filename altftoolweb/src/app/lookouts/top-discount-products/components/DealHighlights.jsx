"use client";

import ScrollReveal from "./ScrollReveal";
import { DEAL_HIGHLIGHTS } from "../data/staticContent";
import { baloo2 } from "../lib/fonts";

const ACCENTS = {
  amber: "bg-[#FFE566] text-[#171717]",
  rose: "bg-[#FF5A5F] text-[#ffffff]",
  violet: "bg-[#c084fc] text-[#171717]",
  sky: "bg-[#4CC9F0] text-[#171717]",
};

function valueFor(key, metrics) {
  switch (key) {
    case "biggest-discounts":
      return `${metrics.biggestDiscount}% off`;
    case "trending":
      return `${metrics.trendingCount} deals`;
    case "top-rated":
      return `${metrics.topRating.toFixed(1)}★ best`;
    case "recent":
      return `${metrics.recentCount} new`;
    default:
      return null;
  }
}

export default function DealHighlights({ metrics, onSelect }) {
  return (
    <section className="px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DEAL_HIGHLIGHTS.map((h, i) => {
            const Icon = h.icon;
            return (
              <ScrollReveal key={h.key} delay={i * 80}>
                <button
                  type="button"
                  onClick={() => onSelect?.(h.key)}
                  className="tdp-neo-card w-full bg-[#ffffff] p-5 text-left"
                >
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#171717] ${ACCENTS[h.accent]}`}
                  >
                    <Icon size={20} strokeWidth={2.1} />
                  </span>
                  <h3 className={`${baloo2.className} mt-4 text-base font-bold text-[#171717]`}>{h.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#5b5648]">{h.text}</p>
                  {metrics && (
                    <p className="mt-3 text-sm font-extrabold text-[#FF5A5F]">
                      {valueFor(h.key, metrics)}
                    </p>
                  )}
                </button>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
