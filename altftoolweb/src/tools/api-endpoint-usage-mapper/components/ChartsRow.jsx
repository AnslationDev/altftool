"use client";

import { useState } from "react";
import { METHOD_BAR } from "./toneMaps";

const numberFormat = new Intl.NumberFormat("en-US");
const compactFormat = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export const USAGE_TONES = {
  "Actively Used": { stroke: "stroke-success", bg: "bg-success", text: "text-success" },
  "Infrequently Used": { stroke: "stroke-info", bg: "bg-info", text: "text-info" },
  "Rarely Used": { stroke: "stroke-warning", bg: "bg-warning", text: "text-warning" },
  Unused: { stroke: "stroke-danger", bg: "bg-danger", text: "text-danger" },
};

function UsageDonut({ breakdown, total }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const segments = breakdown
    .filter((item) => item.value > 0)
    .reduce((all, item) => {
      const offset = all.length ? all.at(-1).offset + all.at(-1).length : 0;
      return [...all, { ...item, offset, length: (item.value / total) * circumference }];
    }, []);

  return (
    <svg viewBox="0 0 112 112" className="h-40 w-40 shrink-0" role="img" aria-label={`Endpoint usage: ${breakdown.map((b) => `${b.label} ${b.value}`).join(", ")}`}>
      <g className="-rotate-90 origin-center">
        {segments.length === 0 && (
          <circle cx="56" cy="56" r={radius} fill="none" strokeWidth="14" className="stroke-muted" />
        )}
        {segments.map((item) => (
          <circle
            key={item.label}
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            strokeWidth="14"
            strokeDasharray={`${Math.max(item.length - 2, 0.75)} ${circumference}`}
            strokeDashoffset={-item.offset}
            className={`${USAGE_TONES[item.label].stroke} transition-all duration-500`}
          >
            <title>{`${item.label}: ${numberFormat.format(item.value)}`}</title>
          </circle>
        ))}
      </g>
      <text
        x="56"
        y="53"
        textAnchor="middle"
        className="fill-foreground text-2xl font-bold tabular-nums"
      >
        {numberFormat.format(total)}
      </text>
      <text x="56" y="70" textAnchor="middle" className="fill-muted-foreground text-[10px]">
        Total
      </text>
    </svg>
  );
}

export default function ChartsRow({ scan }) {
  const { usageBreakdown, topDomains, byMethod, methodBasis, totals } = scan;
  const [showAllDomains, setShowAllDomains] = useState(false);
  const totalEndpoints = totals.endpoints;
  const domainTotal = topDomains.reduce((sum, item) => sum + item.value, 0);
  const methodTotal = byMethod.reduce((sum, item) => sum + item.value, 0);
  const methodMax = Math.max(1, ...byMethod.map((item) => item.value));
  const visibleDomains = showAllDomains ? topDomains : topDomains.slice(0, 5);
  const basisLabel = methodBasis === "calls" ? "calls" : "endpoints";

  return (
    <section aria-label="Scan charts" className="grid gap-4 xl:grid-cols-3">
      {/* Endpoint usage overview */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-bold text-foreground">Endpoint Usage Overview</h2>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-5">
          <UsageDonut breakdown={usageBreakdown} total={totalEndpoints} />
          <ul className="min-w-40 flex-1 space-y-2.5">
            {usageBreakdown.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-xs">
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${USAGE_TONES[item.label].bg}`}
                />
                <span className="flex-1 truncate font-medium text-foreground">{item.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {numberFormat.format(item.value)} (
                  {totalEndpoints ? Math.round((item.value / totalEndpoints) * 100) : 0}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Top domains */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-foreground">Top Domains</h2>
          {topDomains.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllDomains((value) => !value)}
              className="text-xs font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {showAllDomains ? "Show top 5" : "View all"}
            </button>
          )}
        </div>
        {visibleDomains.length === 0 ? (
          <p className="mt-6 text-xs leading-5 text-muted-foreground">
            No absolute URLs detected yet — domains appear when sources include full URLs (specs,
            HAR files, or logs with hosts).
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {visibleDomains.map((item) => {
              const share = domainTotal ? item.value / domainTotal : 0;
              return (
                <li key={item.domain} className="text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-mono font-semibold text-foreground">
                      {item.domain}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {compactFormat.format(item.value)} ({Math.round(share * 100)}%)
                    </span>
                  </div>
                  <div
                    className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label={`${item.domain} share of ${basisLabel}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(share * 100)}
                  >
                    <div
                      className="h-full rounded-full bg-info transition-[width] duration-500"
                      style={{ width: `${Math.max(3, share * 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* HTTP method distribution */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-foreground">HTTP Methods Distribution</h2>
          <span className="text-[11px] text-muted-foreground">by {basisLabel}</span>
        </div>
        {byMethod.length === 0 ? (
          <p className="mt-6 text-xs leading-5 text-muted-foreground">
            Method distribution appears once endpoints are detected.
          </p>
        ) : (
          <div className="mt-4 flex items-end justify-around gap-2" style={{ minHeight: "9rem" }}>
            {byMethod.map((item) => {
              const pct = methodTotal ? Math.round((item.value / methodTotal) * 100) : 0;
              return (
                <div key={item.name} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[11px] font-bold tabular-nums text-foreground">{pct}%</span>
                  <div
                    className={`w-5 rounded-t-md ${METHOD_BAR[item.name] || "bg-muted-foreground"} transition-[height] duration-500`}
                    style={{ height: `${Math.max(6, (item.value / methodMax) * 104)}px` }}
                    role="progressbar"
                    aria-label={`${item.name}: ${pct}% of ${basisLabel}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={pct}
                  >
                    <span className="sr-only">{numberFormat.format(item.value)}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
