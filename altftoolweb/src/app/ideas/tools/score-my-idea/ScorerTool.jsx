"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SIGNALS, computeAos, tierOf, derivedBadges, WEIGHT_PRESETS } from "@altftool/core/ideas";
import ScoreRing from "../../_components/ScoreRing";

/*
 * Turns the corpus scoring model on the user's own idea.
 *
 * Runs entirely in the browser — nothing is uploaded, which matters because
 * people are pasting unshipped ideas into it. The percentile line is the part
 * that makes it useful: a raw score means nothing until you know it beats 71%
 * of a hundred thousand alternatives.
 */

const GUIDANCE = {
  demand: [
    "Nobody has looked for a solution",
    "People complain but do not search",
    "Some pay for a workaround today",
    "Active budget already exists",
    "People are actively hunting for this",
  ],
  moat: [
    "Copyable in a weekend",
    "A few months of head start",
    "Some workflow lock-in",
    "Data or integrations compound",
    "Regulatory or data moat that grows",
  ],
  money: [
    "Hard to charge for at all",
    "Low price, high churn",
    "Reasonable subscription",
    "High contract value, sticky",
    "Priced on outcomes, expands over time",
  ],
  feasibility: [
    "Needs a research team and a year",
    "Serious engineering, many months",
    "A quarter of focused work",
    "A month for one person",
    "A weekend on existing tools",
  ],
  timing: [
    "Could have been built a decade ago",
    "Nothing much has changed",
    "Some recent enabling shift",
    "A clear, dated change made this possible",
    "A closing window opened very recently",
  ],
  competition: [
    "Crowded with funded competitors",
    "Several established players",
    "A few partial solutions",
    "One weak incumbent",
    "Genuinely unserved",
  ],
};

/* Distribution of the real corpus, so the percentile line is not invented. */
const CORPUS_PERCENTILES = [
  [31, 0], [49, 10], [53, 25], [59, 50], [65, 75], [70, 90], [73, 95], [78, 99], [87, 100],
];

function percentileFor(aos) {
  if (aos <= CORPUS_PERCENTILES[0][0]) return 0;
  const last = CORPUS_PERCENTILES[CORPUS_PERCENTILES.length - 1];
  if (aos >= last[0]) return 100;
  for (let i = 1; i < CORPUS_PERCENTILES.length; i += 1) {
    const [hiScore, hiPct] = CORPUS_PERCENTILES[i];
    const [loScore, loPct] = CORPUS_PERCENTILES[i - 1];
    if (aos <= hiScore) {
      const t = (aos - loScore) / (hiScore - loScore || 1);
      return Math.round(loPct + t * (hiPct - loPct));
    }
  }
  return 100;
}

export default function ScorerTool({ corpusSize }) {
  const [name, setName] = useState("");
  const [values, setValues] = useState(
    Object.fromEntries(SIGNALS.map((s) => [s.key, 3])),
  );
  const [presetId, setPresetId] = useState("balanced");

  // 1–5 answers map onto the 0–100 scale the corpus uses.
  const scores = useMemo(
    () => Object.fromEntries(SIGNALS.map((s) => [s.key, Math.round((values[s.key] - 1) * 24 + 4)])),
    [values],
  );

  const weights = WEIGHT_PRESETS[presetId].weights;
  const aos = computeAos(scores, weights);
  const tier = tierOf(aos);
  const badges = derivedBadges(scores);
  const pct = percentileFor(aos);

  const weakest = SIGNALS.reduce((a, b) => (scores[b.key] < scores[a.key] ? b : a));
  const strongest = SIGNALS.reduce((a, b) => (scores[b.key] > scores[a.key] ? b : a));

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
      <div>
        <div className="mb-6">
          <label htmlFor="idea-name" className="mb-1.5 block font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-muted-foreground">
            Your idea (optional)
          </label>
          <input
            id="idea-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="AI intake triage for dental practices"
            className="h-11 w-full rounded-lg border border-border bg-surface px-3.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
          />
        </div>

        <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Weighting preset">
          {Object.entries(WEIGHT_PRESETS).map(([id, preset]) => (
            <button
              key={id}
              type="button"
              onClick={() => setPresetId(id)}
              aria-pressed={presetId === id}
              className={`rounded-full border px-3.5 py-1.5 text-[0.8125rem] font-medium transition ${
                presetId === id
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-5">
          {SIGNALS.map((signal) => (
            <fieldset key={signal.key} className="rounded-lg border border-border bg-canvas p-4">
              <legend className="flex items-center gap-2 px-1 text-[0.9375rem] font-semibold text-foreground">
                <span className="block h-2 w-2 rounded-sm" style={{ background: `var(${signal.cssVar})` }} />
                {signal.label}
                <span className="font-mono text-[0.6875rem] font-normal text-muted-foreground">
                  {weights[signal.key]}% weight
                </span>
              </legend>
              <p className="mb-2.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
                {GUIDANCE[signal.key][values[signal.key] - 1]}
              </p>
              <input
                type="range"
                className="afi-range"
                min="1"
                max="5"
                step="1"
                value={values[signal.key]}
                onChange={(e) => setValues((v) => ({ ...v, [signal.key]: Number(e.target.value) }))}
                style={{ "--afi-thumb": `var(${signal.cssVar})` }}
                aria-label={`${signal.label}: ${GUIDANCE[signal.key][values[signal.key] - 1]}`}
              />
            </fieldset>
          ))}
        </div>
      </div>

      <aside className="lg:sticky lg:top-20">
        <div className="rounded-xl border border-border-strong bg-gradient-to-br from-surface to-canvas p-6">
          <div className="flex flex-col items-center gap-3">
            <ScoreRing scores={scores} aos={aos} size="lg" />
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.1em]" style={{ color: `var(${tier.cssVar})` }}>
              Tier {tier.name}
            </span>
          </div>

          <p className="mt-5 border-t border-border pt-4 text-center text-sm leading-relaxed text-muted-foreground">
            {name ? <strong className="text-foreground">{name}</strong> : "This idea"} scores{" "}
            <strong className="text-foreground">{aos}/100</strong> and would place around the{" "}
            <strong className="text-foreground">{pct}th percentile</strong> of the{" "}
            {corpusSize.toLocaleString("en-US")} ideas in the corpus.
          </p>

          {badges.length > 0 ? (
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {badges.map((b) => (
                <span key={b.id} className="rounded-sm border border-primary/30 bg-primary-soft px-2 py-0.5 font-mono text-[0.6875rem] text-primary">
                  {b.label}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-5 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">Weakest link:</strong> {weakest.label.toLowerCase()}{" "}
              ({scores[weakest.key]}). Improving that one signal moves the composite more than
              anything else you could do.
            </p>
            <p className="mt-2">
              <strong className="text-foreground">Strongest:</strong> {strongest.label.toLowerCase()}{" "}
              ({scores[strongest.key]}).
            </p>
          </div>

          <Link
            href="/products/idea-lab"
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-[0.9375rem] font-semibold text-primary-foreground transition hover:bg-primary-hover"
          >
            Pressure-test it in IdeaLab →
          </Link>

          <p className="mt-3 text-center font-mono text-[0.6875rem] leading-relaxed text-muted-foreground">
            Runs entirely in your browser. Nothing is uploaded or stored.
          </p>
        </div>
      </aside>
    </div>
  );
}
