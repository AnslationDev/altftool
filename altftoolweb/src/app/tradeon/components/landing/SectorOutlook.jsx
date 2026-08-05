// src/app/tradeon/components/landing/SectorOutlook.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { outlookSlug } from "../../lib/slug";

const SECTORS = [
  {
    name: "Banking Sector",
    stocks: [
      { t: "ICICIBANK", s: "ICICI", d: "icicibank.com" },
      { t: "SBIN", s: "SBI", d: "sbi.co.in" },
      { t: "HDFCBANK", s: "HDFC", d: "hdfcbank.com" },
      { t: "AXISBANK", s: "AXIS", d: "axisbank.com" },
    ],
  },
  {
    name: "IT Sector",
    stocks: [
      { t: "WIPRO", s: "WIPRO", d: "wipro.com" },
      { t: "TCS", s: "TCS", d: "tcs.com" },
      { t: "INFY", s: "INFY", d: "infosys.com" },
      { t: "HCLTECH", s: "HCL", d: "hcltech.com" },
    ],
  },
  {
    name: "Pharma Sector",
    stocks: [
      { t: "SUNPHARMA", s: "SUN", d: "sunpharma.com" },
      { t: "CIPLA", s: "CIPLA", d: "cipla.com" },
      { t: "LUPIN", s: "LUPIN", d: "lupin.com" },
      { t: "DRREDDY", s: "DRL", d: "drreddys.com" },
    ],
  },
];

// Official logo CDN with theme-friendly fallback styling
function CompanyLogo({ st }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="text-xs font-black tracking-tight" style={{ color: "var(--tdn-accent-text, #38bdf8)" }}>
        {st.s}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://cdn.brandfetch.io/${st.d}/w/256/h/128`}
      alt={`${st.t} logo`}
      loading="lazy"
      className="object-contain max-w-[88%] max-h-[85%]"
      onError={() => setFailed(true)}
    />
  );
}

export default function SectorOutlook() {
  return (
    <section className="tdn-container tdn-section-tight w-full">
      {/* Section Header */}
      <div className="mb-3">
        <span className="tdn-eyebrow text-[0.62rem]">By sector</span>
        <h2 className="tdn-display text-xl sm:text-2xl mt-0.5" style={{ color: "var(--tdn-fg-strong)" }}>
          Stock outlook for the week
        </h2>
      </div>

      {/* Top Divider Line (Theme-aware) */}
      <div className="pt-4 border-t-2 border-[var(--tdn-fg-strong)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-6">
          {SECTORS.map((sec) => (
            <div key={sec.name} className="flex flex-col">
              <h3
                className="text-xs sm:text-sm font-extrabold uppercase tracking-wide mb-2"
                style={{ color: "var(--tdn-fg-strong)" }}
              >
                {sec.name}
              </h3>
              {sec.stocks.map((st) => (
                <Link
                  key={st.t}
                  href={`/tradeon/weekly-outlook/${outlookSlug(st.t)}`}
                  className="group flex items-center gap-2.5 py-2.5 border-b border-white/10 dark:border-white/10 border-slate-200 hover:bg-white/5 transition-colors"
                >
                  {/* Logo Tile — Styled with theme surface colors */}
                  <span
                    className="shrink-0 grid place-items-center rounded-md overflow-hidden bg-white/5 border border-white/10"
                    style={{ flexBasis: "35%", height: 56 }}
                  >
                    <CompanyLogo st={st} />
                  </span>

                  {/* Title */}
                  <span
                    className="text-xs sm:text-sm font-semibold leading-snug transition-colors group-hover:text-[var(--tdn-iris-2)]"
                    style={{ flexBasis: "65%", color: "var(--tdn-fg-strong)" }}
                  >
                    {st.t} Outlook for the Week
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* View All CTA Button */}
      <div className="flex justify-center mt-6 sm:mt-8">
        <Link
          href="/tradeon/outlook"
          className="tdn-btn tdn-btn-primary px-6 py-2 text-xs font-semibold"
        >
          View All
        </Link>
      </div>
    </section>
  );
}