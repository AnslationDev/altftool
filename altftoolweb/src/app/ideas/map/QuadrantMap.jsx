"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { SIGNALS, tierOf, formatUsd, EFFORT_LABELS } from "@altftool/core/ideas";

/*
 * Effort vs reward, plotted.
 *
 * x = feasibility (right is easier to build)
 * y = reward, a blend of demand, monetisation and moat
 *
 * The four quadrants are the actual decision: Quick Wins are worth starting,
 * Big Bets are worth funding, Fillers are worth ignoring unless they are
 * strategic, and Money Pits are worth naming so you stop being drawn back to
 * them. A scatter is the only view where "this idea is in the wrong quadrant
 * for me" becomes obvious at a glance.
 */

const PAD = { top: 28, right: 28, bottom: 44, left: 52 };
const VIEW = { w: 900, h: 560 };

const QUADRANTS = [
  { id: "quick", label: "Quick wins", hint: "Easier than most, and worth more", x: 1, y: 1 },
  { id: "bets", label: "Big bets", hint: "Worth more, but harder than most", x: 0, y: 1 },
  { id: "fillers", label: "Fillers", hint: "Easy, but a lower ceiling", x: 1, y: 0 },
  { id: "pits", label: "Money pits", hint: "Harder than most, lower ceiling", x: 0, y: 0 },
];

function rewardOf(scores) {
  return Math.round(scores.demand * 0.4 + scores.money * 0.36 + scores.moat * 0.24);
}

const median = (nums) => {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
};

/*
 * The dividing lines sit at the MEDIAN of the plotted set, not at a fixed 50.
 *
 * These are the highest-scoring ideas in the corpus, so their raw scores all
 * cluster in the upper range — split at 50 and two quadrants come out empty,
 * which makes the whole framing decorative. Splitting at the median guarantees
 * all four are populated and changes the question to the useful one:
 * "harder or easier than the other ideas I am actually choosing between".
 */
function quadrantOf(feasibility, reward, split) {
  const easy = feasibility >= split.x;
  const high = reward >= split.y;
  if (easy && high) return "quick";
  if (!easy && high) return "bets";
  if (easy && !high) return "fillers";
  return "pits";
}

/** Axis domain padded to the data, so the plot is not mostly empty space. */
function domainOf(values) {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pad = Math.max(4, Math.round((hi - lo) * 0.08));
  return { lo: Math.max(0, lo - pad), hi: Math.min(100, hi + pad) };
}

/** Four evenly spaced, whole-number ticks across a domain. */
function ticksFor({ lo, hi }) {
  const step = (hi - lo) / 4;
  return Array.from({ length: 5 }, (_, i) => Math.round(lo + step * i));
}

export default function QuadrantMap({ points, verticals }) {
  const [vertical, setVertical] = useState("all");
  const [quadrant, setQuadrant] = useState("all");
  const [active, setActive] = useState(null);
  const titleId = useId();

  /* Scored once over the full set so the median split and the axis domain stay
     stable while the user filters — otherwise every filter change would move
     the goalposts and the counts would be meaningless. */
  const { scored, split, xDomain, yDomain } = useMemo(() => {
    // reward now arrives precomputed from the server so the three signals it
    // derives from need not be serialised; rewardOf stays as a fallback.
    const withReward = points.map((p) => ({ ...p, reward: p.reward ?? rewardOf(p.scores) }));
    const s = {
      x: median(withReward.map((p) => p.scores.feasibility)),
      y: median(withReward.map((p) => p.reward)),
    };
    return {
      scored: withReward.map((p) => ({ ...p, quad: quadrantOf(p.scores.feasibility, p.reward, s) })),
      split: s,
      xDomain: domainOf(withReward.map((p) => p.scores.feasibility)),
      yDomain: domainOf(withReward.map((p) => p.reward)),
    };
  }, [points]);

  const plotted = useMemo(
    () =>
      scored
        .filter((p) => (vertical === "all" ? true : p.verticalSlug === vertical))
        .filter((p) => (quadrant === "all" ? true : p.quad === quadrant)),
    [scored, vertical, quadrant],
  );

  const counts = useMemo(() => {
    const base = { quick: 0, bets: 0, fillers: 0, pits: 0 };
    for (const p of scored) base[p.quad] += 1;
    return base;
  }, [scored]);

  const plotW = VIEW.w - PAD.left - PAD.right;
  const plotH = VIEW.h - PAD.top - PAD.bottom;
  const toX = (v) =>
    PAD.left + ((v - xDomain.lo) / (xDomain.hi - xDomain.lo)) * plotW;
  const toY = (v) =>
    PAD.top + (1 - (v - yDomain.lo) / (yDomain.hi - yDomain.lo)) * plotH;

  const maxTam = useMemo(() => Math.max(...points.map((p) => p.tamUsd), 1), [points]);
  const radiusOf = (tam) => 3 + Math.sqrt(tam / maxTam) * 6;

  return (
    <div>
      {/* Controls */}
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <div>
          <label
            htmlFor="afi-map-vertical"
            className="mb-1.5 block font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-muted-foreground"
          >
            Industry
          </label>
          <select
            id="afi-map-vertical"
            value={vertical}
            onChange={(e) => setVertical(e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
          >
            <option value="all">All industries</option>
            {verticals.map((v) => (
              <option key={v.slug} value={v.slug}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setQuadrant("all")}
            aria-pressed={quadrant === "all"}
            className={`rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition ${
              quadrant === "all"
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground"
            }`}
          >
            All
          </button>
          {QUADRANTS.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setQuadrant(quadrant === q.id ? "all" : q.id)}
              aria-pressed={quadrant === q.id}
              className={`rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition ${
                quadrant === q.id
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground"
              }`}
            >
              {q.label}
              <span className="ml-1.5 font-mono text-[0.6875rem] opacity-60">{counts[q.id]}</span>
            </button>
          ))}
        </div>

        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {plotted.length.toLocaleString("en-US")} plotted
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
        {/* Plot */}
        <div className="overflow-x-auto rounded-lg border border-border bg-canvas p-2">
          <svg
            viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
            className="h-auto w-full min-w-[640px]"
            role="img"
            aria-labelledby={titleId}
          >
            <title id={titleId}>
              Scatter plot of {plotted.length} startup ideas. Horizontal axis is feasibility, higher
              is easier to build. Vertical axis is reward, blending demand, monetisation and moat.
              Quadrants are split at the median feasibility of {split.x} and median reward of{" "}
              {split.y}, so each quadrant holds roughly a quarter of the ideas.
            </title>

            {/* quadrant fills, bounded by the median split */}
            {QUADRANTS.map((q) => {
              const x0 = q.x ? toX(split.x) : PAD.left;
              const x1 = q.x ? PAD.left + plotW : toX(split.x);
              const y0 = q.y ? PAD.top : toY(split.y);
              const y1 = q.y ? toY(split.y) : PAD.top + plotH;
              return (
                <rect
                  key={q.id}
                  x={x0}
                  y={y0}
                  width={Math.max(0, x1 - x0)}
                  height={Math.max(0, y1 - y0)}
                  fill={q.id === "quick" ? "var(--primary)" : "var(--foreground)"}
                  opacity={q.id === "quick" ? 0.05 : 0.02}
                />
              );
            })}

            {/* gridlines */}
            {ticksFor(xDomain).map((t) => (
              <g key={`x-${t}`}>
                <line x1={toX(t)} y1={PAD.top} x2={toX(t)} y2={PAD.top + plotH}
                  stroke="var(--border)" strokeWidth="0.5" />
                <text x={toX(t)} y={VIEW.h - 22} textAnchor="middle"
                  className="fill-[var(--muted-foreground)] font-mono" fontSize="11">
                  {t}
                </text>
              </g>
            ))}
            {ticksFor(yDomain).map((t) => (
              <g key={`y-${t}`}>
                <line x1={PAD.left} y1={toY(t)} x2={PAD.left + plotW} y2={toY(t)}
                  stroke="var(--border)" strokeWidth="0.5" />
                <text x={PAD.left - 10} y={toY(t) + 4} textAnchor="end"
                  className="fill-[var(--muted-foreground)] font-mono" fontSize="11">
                  {t}
                </text>
              </g>
            ))}

            {/* median split lines */}
            <line x1={toX(split.x)} y1={PAD.top} x2={toX(split.x)} y2={PAD.top + plotH}
              stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="5 4" />
            <line x1={PAD.left} y1={toY(split.y)} x2={PAD.left + plotW} y2={toY(split.y)}
              stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="5 4" />
            <text x={toX(split.x) + 6} y={PAD.top + 12}
              className="fill-[var(--muted-foreground)] font-mono" fontSize="10">
              median {split.x}
            </text>
            <text x={PAD.left + 6} y={toY(split.y) - 6}
              className="fill-[var(--muted-foreground)] font-mono" fontSize="10">
              median {split.y}
            </text>

            {/* quadrant labels, anchored to the corners of each region */}
            {QUADRANTS.map((q) => (
              <text
                key={q.id}
                x={q.x ? PAD.left + plotW - 8 : PAD.left + 8}
                y={q.y ? PAD.top + 14 : PAD.top + plotH - 8}
                textAnchor={q.x ? "end" : "start"}
                className="fill-[var(--muted-foreground)] font-mono uppercase"
                fontSize="11"
                letterSpacing="0.1em"
                opacity="0.75"
              >
                {q.label}
              </text>
            ))}

            {/* axis titles */}
            <text x={PAD.left + plotW / 2} y={VIEW.h - 4} textAnchor="middle"
              className="fill-[var(--foreground)] font-mono" fontSize="12">
              Feasibility →
            </text>
            <text
              x={-(PAD.top + plotH / 2)} y={16} textAnchor="middle"
              transform="rotate(-90)"
              className="fill-[var(--foreground)] font-mono" fontSize="12"
            >
              Reward →
            </text>

            {/* points */}
            {plotted.map((p) => {
              const tier = tierOf(p.aos);
              const isActive = active?.slug === p.slug;
              return (
                <circle
                  key={p.slug}
                  cx={toX(p.scores.feasibility)}
                  cy={toY(p.reward)}
                  r={isActive ? radiusOf(p.tamUsd) + 3 : radiusOf(p.tamUsd)}
                  fill={`var(${tier.cssVar})`}
                  fillOpacity={isActive ? 0.95 : 0.5}
                  stroke={isActive ? "var(--foreground)" : "none"}
                  strokeWidth={isActive ? 1.5 : 0}
                  className="cursor-pointer transition-[r,fill-opacity]"
                  onMouseEnter={() => setActive(p)}
                  onFocus={() => setActive(p)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${p.title}. Score ${p.aos}. Feasibility ${p.scores.feasibility}, reward ${p.reward}.`}
                />
              );
            })}
          </svg>
        </div>

        {/* Detail panel */}
        <aside className="lg:sticky lg:top-20">
          {active ? (
            <div className="rounded-lg border border-card-border bg-card p-5">
              <span
                className="font-mono text-[0.6875rem] uppercase tracking-[0.1em]"
                style={{ color: `var(${tierOf(active.aos).cssVar})` }}
              >
                Tier {tierOf(active.aos).name} · {active.aos}/100
              </span>
              <h2 className="mt-2 text-base font-semibold leading-snug tracking-tight text-foreground">
                {active.title}
              </h2>
              <dl className="mt-3">
                {[
                  ["Industry", active.vertical],
                  ["Feasibility", String(active.scores.feasibility)],
                  ["Reward", String(active.reward)],
                  ["TAM", formatUsd(active.tamUsd)],
                  ["Effort", EFFORT_LABELS[active.effort]],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-border py-1.5 text-[0.8125rem] last:border-b-0">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-mono tabular-nums text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
              <Link
                href={`/ideas/idea/${active.slug}`}
                className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
              >
                Open dossier →
              </Link>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-canvas p-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Hover or tab to a point to inspect it. Dot size is market size; colour is tier.
              </p>
            </div>
          )}

          <div className="mt-4 rounded-lg border border-card-border bg-card p-5">
            <h2 className="mb-3 font-mono text-[0.625rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              How to read it
            </h2>
            <ul className="flex flex-col gap-2.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
              {QUADRANTS.map((q) => (
                <li key={q.id}>
                  <strong className="text-foreground">{q.label}</strong> — {q.hint}
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-border pt-3 text-[0.75rem] leading-relaxed text-muted-foreground">
              Quadrants split at the <strong className="text-foreground">median</strong> of what is
              plotted — feasibility {split.x}, reward {split.y} — not at a fixed midpoint. These are
              already the strongest ideas in the corpus, so &ldquo;harder than most&rdquo; here
              means harder than other good ideas, not hard in absolute terms.
            </p>
            <p className="mt-2 text-[0.75rem] leading-relaxed text-muted-foreground">
              Reward blends {SIGNALS.find((s) => s.key === "demand").label.toLowerCase()},
              monetisation and moat. It is not the composite score — an idea can sit high here and
              still rank lower overall because of timing or crowding.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
