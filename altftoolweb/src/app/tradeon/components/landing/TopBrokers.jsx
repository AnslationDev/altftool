// src/app/tradeon/components/landing/TopBrokers.jsx
"use client";

import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";

const BROKERS = [
  {
    id: "pepperstone",
    name: "Pepperstone",
    logo: "https://unavatar.io/pepperstone.com",
    bgColor: "transparent",
    initials: "P",
    rating: 4.7,
    openAccountUrl: "https://pepperstone.com",
    reviewUrl: "/tradeon/brokers/pepperstone",
  },
  {
    id: "fxpro",
    name: "FxPro",
    logo: "https://unavatar.io/fxpro.com",
    bgColor: "transparent",
    initials: "Fx",
    rating: 4.7,
    openAccountUrl: "https://fxpro.com",
    reviewUrl: "/tradeon/brokers/fxpro",
  },
  {
    id: "iforex",
    name: "iFOREX",
    logo: "https://unavatar.io/iforex.com",
    bgColor: "transparent",
    initials: "iF",
    rating: 4.8,
    openAccountUrl: "https://iforex.com",
    reviewUrl: "/tradeon/brokers/iforex",
  },
  {
    id: "fp-markets",
    name: "FP Markets",
    logo: "https://unavatar.io/fpmarkets.com",
    bgColor: "transparent",
    initials: "FP",
    rating: 4.5,
    openAccountUrl: "https://fpmarkets.com",
    reviewUrl: "/tradeon/brokers/fp-markets",
  },
];

function StarRating({ rating }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex items-center gap-1">
      <span
        className="tdn-mono text-xs font-bold mr-1"
        style={{ color: "var(--tdn-fg-strong)" }}
      >
        {rating.toFixed(1)}
      </span>
      <div className="flex items-center text-amber-400">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={13}
            className={`${
              i < fullStars
                ? "fill-amber-400 text-amber-400"
                : i === fullStars && hasHalfStar
                ? "fill-amber-400/50 text-amber-400"
                : "text-slate-300 dark:text-slate-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function TopBrokers() {
  return (
    <section className="tdn-container tdn-section-tight">
      {/* ── Section Title & Navigation ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="tdn-eyebrow text-[0.62rem]">Recommendations</span>
          <Link href="#" className="group flex items-center gap-1 mt-0.5">
            <h2
              className="tdn-display text-xl sm:text-2xl transition-colors group-hover:text-cyan-400"
              style={{ color: "var(--tdn-fg-strong)" }}
            >
              Top Brokers
            </h2>
            <ChevronRight
              size={22}
              className="transition-transform group-hover:translate-x-1"
              style={{ color: "var(--tdn-fg-strong)" }}
            />
          </Link>
        </div>
      </div>

      {/* ── Brokers Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 w-full">
        {BROKERS.map((broker) => (
          <div
            key={broker.id}
            className="w-full h-full p-4 flex flex-col items-center justify-between border-b border-white/10 dark:border-white/10 border-slate-200 lg:border-b-0 lg:border-r last:border-r-0 last:border-b-0"
          >
            {/* Minimal Logo (No Box/Border) */}
            <div className="w-14 h-14 mb-3 flex items-center justify-center relative">
              {/* Fallback Initials Badge if image fails */}
              <div
                className="absolute inset-0 flex items-center justify-center font-bold text-white text-base rounded-full"
                style={{ backgroundColor: broker.bgColor }}
              >
                {broker.initials}
              </div>

              {/* Logo Image without borders or backgrounds */}
              <img
                src={broker.logo}
                alt={`${broker.name} logo`}
                className="w-full h-full object-contain relative z-10 rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            {/* Broker Name & Stars */}
            <div className="text-center mb-4 flex flex-col items-center">
              <h3
                className="text-sm font-bold mb-1"
                style={{ color: "var(--tdn-fg-strong)" }}
              >
                {broker.name}
              </h3>
              <StarRating rating={broker.rating} />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center gap-2 text-center mt-auto w-full">
              <a
                href={broker.openAccountUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tdn-btn tdn-btn-primary inline-flex w-auto px-5 py-2 text-xs font-semibold whitespace-nowrap"
              >
                Open Account
              </a>

              <div>
                <Link
                  href={broker.reviewUrl}
                  className="text-xs font-medium hover:underline inline-block transition-colors"
                  style={{ color: "var(--tdn-accent-text, #38bdf8)" }}
                >
                  Read Review
                </Link>
              </div>
            </div>

            {/* Disclaimer Footnote */}
            {broker.disclaimer && (
              <p
                className="mt-3 text-[0.62rem] text-center leading-tight"
                style={{ color: "var(--tdn-faint)" }}
              >
                {broker.disclaimer}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}