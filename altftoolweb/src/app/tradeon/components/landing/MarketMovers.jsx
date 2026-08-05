// // src/app/tradeon/components/landing/MarketMovers.jsx
// "use client";

// import Link from "next/link";
// import { Activity, Flame, Snowflake } from "lucide-react";
// import { assetHref, formatPct } from "../../lib/format";
// import LiveValue from "../shared/LiveValue";
// import Sparkline from "../shared/Sparkline";

// function Row({ d }) {
//   return (
//     <Link
//       href={assetHref(d.symbol)}
//       className="flex items-center gap-2.5 py-2.5 px-1 border-b border-white/10 dark:border-white/10 border-slate-200 hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
//     >
//       <div className="min-w-0 w-20">
//         <div className="text-xs font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>
//           {d.symbol}
//         </div>
//         <div className="text-[0.62rem] truncate" style={{ color: "var(--tdn-faint)" }}>
//           {d.name}
//         </div>
//       </div>
//       <Sparkline
//         data={d.spark}
//         width={54}
//         height={20}
//         color={d.changePct >= 0 ? "var(--tdn-up)" : "var(--tdn-down)"}
//       />
//       <div className="ml-auto text-right">
//         <div className="tdn-mono text-xs font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>
//           <LiveValue value={d.price} currency={d.assetClass === "forex" ? "" : "$"} />
//         </div>
//         <div
//           className={`tdn-mono text-[0.66rem] font-semibold ${
//             d.changePct >= 0 ? "tdn-up" : "tdn-down"
//           }`}
//         >
//           {formatPct(d.changePct)}
//         </div>
//       </div>
//     </Link>
//   );
// }

// function Panel({ title, icon: Icon, color, rows, footer }) {
//   return (
//     <div className="flex flex-col w-full">
//       {/* Panel Header */}
//       <div className="flex items-center justify-between pb-2 border-b-2 border-white/15 dark:border-white/15 border-slate-300">
//         <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--tdn-fg-strong)" }}>
//           <Icon size={15} style={{ color }} /> {title}
//         </span>
//         <span className="text-[0.66rem]" style={{ color: "var(--tdn-faint)" }}>
//           {footer}
//         </span>
//       </div>

//       {/* Panel Rows with Row Lines */}
//       <div className="flex flex-col">
//         {rows.map((d) => (
//           <Row key={d.symbol} d={d} />
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function MarketMovers({ data = [] }) {
//   const byChange = [...data].sort((a, b) => b.changePct - a.changePct);
//   const gainers = byChange.slice(0, 5);
//   const losers = byChange.slice(-5).reverse();
//   const active = [...data].sort((a, b) => (b.volume || 0) - (a.volume || 0)).slice(0, 5);

//   return (
//     <section className="tdn-container tdn-section-tight bg-transparent">
//       {/* Section Header */}
//       <div className="flex items-end justify-between mb-4">
//         <div>
//           <span className="tdn-eyebrow text-[0.62rem]">Market movers</span>
//           <h2 className="tdn-display text-xl sm:text-2xl mt-0.5" style={{ color: "var(--tdn-fg-strong)" }}>
//             What&apos;s moving right now
//           </h2>
//         </div>
//         <span className="tdn-badge-live !text-[0.66rem]">
//           <span className="tdn-dot" /> Live
//         </span>
//       </div>

//       {/* Grid Panels */}
//       <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
//         <Panel title="Top Gainers" icon={Flame} color="var(--tdn-up)" rows={gainers} footer="24h" />
//         <Panel title="Top Losers" icon={Snowflake} color="var(--tdn-down)" rows={losers} footer="24h" />
//         <Panel
//           title="Most Active"
//           icon={Activity}
//           color="var(--tdn-iris-2)"
//           rows={active}
//           footer="by volume"
//         />
//       </div>
//     </section>
//   );
// }


// src/app/tradeon/components/landing/MarketMovers.jsx




// src/app/tradeon/components/landing/MarketMovers.jsx



// src/app/tradeon/components/landing/MarketMovers.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, Flame, Snowflake, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { assetHref, formatPct } from "../../lib/format";
import LiveValue from "../shared/LiveValue";
import Sparkline from "../shared/Sparkline";

function Row({ d, accentColor }) {
  const isPositive = d.changePct >= 0;

  return (
    <Link
      href={assetHref(d.symbol)}
      className="group relative flex items-center justify-between gap-2 py-2.5 px-2 border-b border-slate-200 dark:border-white/10 hover:bg-slate-100/60 dark:hover:bg-white/[0.05] transition-all duration-200"
    >
      {/* Hover Accent Indicator */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 group-hover:h-3/4 transition-all duration-200 rounded-r-full"
        style={{ backgroundColor: accentColor || (isPositive ? "var(--tdn-up)" : "var(--tdn-down)") }}
      />

      {/* Symbol & Asset Name */}
      <div className="min-w-[65px] max-w-[85px] shrink-0 pl-1">
        <div
          className="flex items-center gap-0.5 text-xs font-bold transition-transform group-hover:translate-x-0.5 duration-200 truncate"
          style={{ color: "var(--tdn-fg-strong)" }}
        >
          {d.symbol}
          {isPositive ? (
            <ArrowUpRight size={12} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--tdn-up)]" />
          ) : (
            <ArrowDownRight size={12} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--tdn-down)]" />
          )}
        </div>
        <div className="text-[0.62rem] truncate font-medium" style={{ color: "var(--tdn-faint)" }}>
          {d.name}
        </div>
      </div>

      {/* Sparkline Chart */}
      <div className="flex-1 flex justify-center items-center min-w-[36px] opacity-80 group-hover:opacity-100 transition-opacity">
        <Sparkline
          data={d.spark}
          width={44}
          height={18}
          color={isPositive ? "var(--tdn-up)" : "var(--tdn-down)"}
        />
      </div>

      {/* Live Value & % Change */}
      <div className="text-right shrink-0">
        <div className="tdn-mono text-xs font-bold tracking-tight" style={{ color: "var(--tdn-fg-strong)" }}>
          <LiveValue value={d.price} currency={d.assetClass === "forex" ? "" : "$"} />
        </div>
        <div
          className={`tdn-mono text-[0.65rem] font-semibold flex items-center justify-end gap-0.5 ${
            isPositive ? "tdn-up" : "tdn-down"
          }`}
        >
          {formatPct(d.changePct)}
        </div>
      </div>
    </Link>
  );
}

function Panel({ title, icon: Icon, color, rows, footer, activeFilter, onFilterChange }) {
  return (
    <div className="flex flex-col w-full">
      {/* Panel Header - Line Removed */}
      <div className="flex items-center justify-between pb-1.5">
        <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold tracking-wide" style={{ color: "var(--tdn-fg-strong)" }}>
          <div
            className="p-1 rounded-md bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm"
            style={{ color }}
          >
            <Icon size={14} />
          </div>
          {title}
        </span>

        {/* Dynamic Filter Toggle Buttons with High Contrast Visibility */}
        {onFilterChange ? (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/10 p-0.5 rounded-md border border-slate-200 dark:border-white/10 text-[0.65rem] font-semibold">
            <button
              type="button"
              onClick={() => onFilterChange("24h")}
              className={`px-2 py-0.5 rounded transition-all ${
                activeFilter === "24h"
                  ? "bg-cyan-600 text-white font-bold shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              24h
            </button>
            <button
              type="button"
              onClick={() => onFilterChange("vol")}
              className={`px-2 py-0.5 rounded transition-all ${
                activeFilter === "vol"
                  ? "bg-cyan-600 text-white font-bold shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Vol
            </button>
          </div>
        ) : (
          <span className="text-[0.62rem] font-mono uppercase tracking-wider" style={{ color: "var(--tdn-faint)" }}>
            {footer}
          </span>
        )}
      </div>

      {/* Row List Container */}
      <div className="flex flex-col">
        {rows.map((d) => (
          <Row key={d.symbol} d={d} accentColor={color} />
        ))}
      </div>
    </div>
  );
}

export default function MarketMovers({ data = [] }) {
  const [activeSort, setActiveSort] = useState("24h");

  // Sorting Logic
  const byChange = [...data].sort((a, b) => b.changePct - a.changePct);
  const gainers = byChange.slice(0, 5);
  const losers = byChange.slice(-5).reverse();

  const active = [...data]
    .sort((a, b) => (activeSort === "vol" ? (b.volume || 0) - (a.volume || 0) : Math.abs(b.changePct) - Math.abs(a.changePct)))
    .slice(0, 5);

  return (
    <section className="w-full bg-transparent">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <span className="tdn-eyebrow text-[0.62rem] tracking-widest uppercase">Market movers</span>
          <h2 className="tdn-display text-lg sm:text-xl mt-0.5 font-bold" style={{ color: "var(--tdn-fg-strong)" }}>
            What&apos;s moving
          </h2>
        </div>

        {/* Pulse Live Badge */}
        <div className="tdn-badge-live !text-[0.62rem]">
          <span className="tdn-dot animate-pulse" /> Live
        </div>
      </div>

      {/* Sidebar Grid Layout */}
      <div className="grid grid-cols-1 gap-6">
        <Panel
          title="Top Gainers"
          icon={Flame}
          color="var(--tdn-up)"
          rows={gainers}
          footer="24h"
        />
        <Panel
          title="Top Losers"
          icon={Snowflake}
          color="var(--tdn-down)"
          rows={losers}
          footer="24h"
        />
        <Panel
          title="Most Active"
          icon={Activity}
          color="var(--tdn-iris-2)"
          rows={active}
          footer="by volume"
          activeFilter={activeSort}
          onFilterChange={setActiveSort}
        />
      </div>
    </section>
  );
}