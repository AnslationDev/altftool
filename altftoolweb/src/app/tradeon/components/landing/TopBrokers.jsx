// src/app/tradeon/components/landing/TopBrokers.jsx
"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

/*
  Each entry used to carry a `rating` literal — 4.7, 4.7, 4.8, 4.5 — rendered as
  a filled star row beside the broker's real name and logo, directly above an
  "Open Account" link to that broker's own site. Tradeon has no review store, no
  scoring model for brokers and no cited third-party source, so those scores were
  four invented verdicts on four real, regulated companies, shown where they most
  influence whether someone opens an account. The star row and the ratings behind
  it are gone rather than softened; the card still identifies the broker and links
  out, which is everything it can honestly say.
*/
const BROKERS = [
  {
    id: "pepperstone",
    name: "Pepperstone",
    logo: "https://unavatar.io/pepperstone.com",
    bgColor: "transparent",
    initials: "P",
    openAccountUrl: "https://pepperstone.com",
    reviewUrl: "/tradeon/brokers/pepperstone",
  },
  {
    id: "fxpro",
    name: "FxPro",
    logo: "https://unavatar.io/fxpro.com",
    bgColor: "transparent",
    initials: "Fx",
    openAccountUrl: "https://fxpro.com",
    reviewUrl: "/tradeon/brokers/fxpro",
  },
  {
    id: "iforex",
    name: "iFOREX",
    logo: "https://unavatar.io/iforex.com",
    bgColor: "transparent",
    initials: "iF",
    openAccountUrl: "https://iforex.com",
    reviewUrl: "/tradeon/brokers/iforex",
  },
  {
    id: "fp-markets",
    name: "FP Markets",
    logo: "https://unavatar.io/fpmarkets.com",
    bgColor: "transparent",
    initials: "FP",
    openAccountUrl: "https://fpmarkets.com",
    reviewUrl: "/tradeon/brokers/fp-markets",
  },
];

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

            {/* Broker Name */}
            <div className="text-center mb-4 flex flex-col items-center">
              <h3
                className="text-sm font-bold mb-1"
                style={{ color: "var(--tdn-fg-strong)" }}
              >
                {broker.name}
              </h3>
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