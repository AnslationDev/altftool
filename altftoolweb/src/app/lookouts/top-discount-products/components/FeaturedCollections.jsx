"use client";

import { ArrowRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { FEATURED_COLLECTIONS } from "../data/staticContent";
import { baloo2 } from "../lib/fonts";

export default function FeaturedCollections({ categoryCounts, onSelect }) {
  const collections = FEATURED_COLLECTIONS.filter(
    (c) => (categoryCounts[c.categoryKey] || 0) > 0,
  );

  if (!collections.length) return null;

  return (
    <section className="px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-[#FF5A5F]">Browse by theme</p>
          <h2 className={`${baloo2.className} mt-2 text-2xl font-extrabold text-[#171717] sm:text-3xl`}>
            Featured collections
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {collections.map((c, i) => (
            <ScrollReveal key={c.key} delay={i * 60}>
              <button
                type="button"
                onClick={() => onSelect(c.categoryKey)}
                className="tdp-neo-card group relative flex h-32 w-full flex-col justify-end overflow-hidden p-4 text-left"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${c.gradient} transition-transform duration-500 group-hover:scale-110`}
                />
                <div className="absolute inset-0 bg-[#171717]/10" />
                <span className={`${baloo2.className} relative text-sm font-extrabold text-[#ffffff]`}>
                  {c.label}
                </span>
                <span className="relative mt-1 flex items-center gap-1 text-xs font-semibold text-[#ffffff]/85">
                  {categoryCounts[c.categoryKey] || 0} deals
                  <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </button>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
