// src/app/tradeon/components/landing/SectorOutlook.jsx
// Home "Sector Outlook" grid — four sector columns (Banking / IT / FMCG / Pharma),
// each a list of "<TICKER> Outlook for the Week" rows in a 40% logo / 60% title
// layout, matching the reference. Each row links to that symbol's asset page.
// Official company logos are loaded by domain from Brandfetch's logo CDN; a
// coloured monogram is shown as a fallback if a logo can't load.
"use client";

import { useState } from "react";
import Link from "next/link";
import { outlookSlug } from "../../lib/slug";

const SECTORS = [
  {
    name: "Banking Sector",
    stocks: [
      { t: "ICICIBANK", s: "ICICI", c: "#f58220", d: "icicibank.com" },
      { t: "SBIN", s: "SBI", c: "#1aa2d6", d: "sbi.co.in" },
      { t: "HDFCBANK", s: "HDFC", c: "#e4022d", d: "hdfcbank.com" },
      { t: "AXISBANK", s: "AXIS", c: "#97144d", d: "axisbank.com" },
    ],
  },
  {
    name: "IT Sector",
    stocks: [
      { t: "WIPRO", s: "WIPRO", c: "#7a29a0", d: "wipro.com" },
      { t: "TCS", s: "TCS", c: "#ee3984", d: "tcs.com" },
      { t: "INFY", s: "INFY", c: "#007cc3", d: "infosys.com" },
      { t: "HCLTECH", s: "HCL", c: "#0f5aa8", d: "hcltech.com" },
    ],
  },
  {
    name: "FMCG Sector",
    stocks: [
      { t: "ITC", s: "ITC", c: "#00447c", d: "itcportal.com" },
      { t: "HINDUNILVR", s: "HUL", c: "#1e3888", d: "hul.co.in" },
      { t: "DABUR", s: "DABUR", c: "#5a9e2f", d: "dabur.com" },
      { t: "COLPAL", s: "CP", c: "#ed1c24", d: "colgate.com" },
    ],
  },
  {
    name: "Pharma Sector",
    stocks: [
      { t: "SUNPHARMA", s: "SUN", c: "#f5821f", d: "sunpharma.com" },
      { t: "CIPLA", s: "CIPLA", c: "#0057a8", d: "cipla.com" },
      { t: "LUPIN", s: "LUPIN", c: "#00a651", d: "lupin.com" },
      { t: "DRREDDY", s: "DRL", c: "#5b2d8e", d: "drreddys.com" },
    ],
  },
];

// Official logo (Brandfetch CDN, by domain) — keeps aspect ratio via object-fit;
// falls back to a coloured monogram if the image can't load.
function CompanyLogo({ st }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <span className="text-[0.62rem] font-black tracking-tight" style={{ color: st.c }}>{st.s}</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://cdn.brandfetch.io/${st.d}/w/256/h/128`}
      alt={`${st.t} logo`}
      loading="lazy"
      className="object-contain"
      style={{ maxWidth: "92%", maxHeight: "88%" }}
      onError={() => setFailed(true)}
    />
  );
}

export default function SectorOutlook() {
  return (
    <section className="tdn-container tdn-section-tight">
      <div className="mb-3">
        <span className="tdn-eyebrow text-[0.62rem]">By sector</span>
        <h2 className="tdn-display text-xl sm:text-2xl mt-0.5" style={{ color: "var(--tdn-fg-strong)" }}>
          Stock outlook for the week
        </h2>
      </div>

      {/* One continuous thick top rule spanning all columns (matches the design) */}
      <div className="pt-4" style={{ borderTop: "3px solid var(--tdn-fg-strong)" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
          {SECTORS.map((sec) => (
            <div key={sec.name}>
              <h3 className="text-sm font-extrabold uppercase tracking-wide mb-1" style={{ color: "var(--tdn-fg-strong)" }}>
                {sec.name}
              </h3>
              {sec.stocks.map((st) => (
                <Link
                  key={st.t}
                  href={`/tradeon/weekly-outlook/${outlookSlug(st.t)}`}
                  className="group flex items-center gap-3 py-2.5 border-b"
                  style={{ borderColor: "var(--tdn-border)" }}
                >
                  {/* 40% — official logo on a light tile (readable in any theme) */}
                  <span
                    className="shrink-0 grid place-items-center rounded-lg overflow-hidden"
                    style={{ flexBasis: "40%", height: 72, background: "#ffffff", border: "1px solid var(--tdn-border)" }}
                  >
                    <CompanyLogo st={st} />
                  </span>
                  {/* 60% — title */}
                  <span
                    className="text-sm font-semibold leading-snug transition-colors group-hover:text-[var(--tdn-iris-2)]"
                    style={{ flexBasis: "60%", color: "var(--tdn-fg-strong)" }}
                  >
                    {st.t} Outlook for the Week
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Link href="/tradeon/outlook" className="tdn-btn" style={{ background: "var(--tdn-fg-strong)", color: "var(--tdn-bg)", minWidth: 150 }}>
          View All
        </Link>
      </div>
    </section>
  );
}
