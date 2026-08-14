"use client";

import { useMemo, useState } from "react";
import {
  SIGNALS,
  SIGNAL_KEYS,
  WEIGHT_PRESETS,
  computeAos,
  tierOf,
} from "@altftool/core/ideas";

/*
 * Re-weighting is the interaction nobody else in this category offers. A solo
 * developer and a venture-backed team should not be handed the same ranking,
 * so the weights are exposed rather than hidden, and the corpus re-sorts live.
 */
export default function WeightTuner({ ideas }) {
  const [weights, setWeights] = useState(WEIGHT_PRESETS.balanced.weights);
  const [presetId, setPresetId] = useState("balanced");

  const ranked = useMemo(() => {
    return ideas
      .map((idea) => ({
        idea,
        aos: computeAos(idea.scores, weights),
        base: idea.aos ?? computeAos(idea.scores),
      }))
      .sort((a, b) => b.aos - a.aos)
      .slice(0, 7);
  }, [ideas, weights]);

  function applyPreset(id) {
    setPresetId(id);
    setWeights(WEIGHT_PRESETS[id].weights);
  }

  function setWeight(key, value) {
    setPresetId("custom");
    setWeights((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="grid items-start gap-8 rounded-xl border border-border bg-canvas p-6 lg:grid-cols-2 lg:gap-14">
      <div>
        <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
          A solo developer and a venture-backed team should not get the same ranking. Drag the
          weights, or pick a preset — the whole corpus re-sorts instantly.
        </p>

        <div className="my-6 flex flex-wrap gap-2" role="group" aria-label="Scoring presets">
          {Object.entries(WEIGHT_PRESETS).map(([id, preset]) => (
            <button
              key={id}
              type="button"
              onClick={() => applyPreset(id)}
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

        <div>
          {SIGNALS.map((signal) => (
            <div key={signal.key} className="afi-signal-row">
              <label
                htmlFor={`afi-w-${signal.key}`}
                className="flex items-center gap-2 font-mono text-xs text-muted-foreground"
              >
                <span
                  className="block h-2 w-2 shrink-0 rounded-sm"
                  style={{ background: `var(${signal.cssVar})` }}
                />
                {signal.label}
              </label>
              <input
                id={`afi-w-${signal.key}`}
                className="afi-range"
                type="range"
                min="0"
                max="40"
                step="1"
                value={weights[signal.key]}
                onChange={(event) => setWeight(signal.key, Number(event.target.value))}
                style={{ "--afi-thumb": `var(${signal.cssVar})` }}
              />
              <output
                htmlFor={`afi-w-${signal.key}`}
                className="text-right font-mono text-[0.8125rem] tabular-nums text-foreground"
              >
                {weights[signal.key]}%
              </output>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3.5 flex items-center justify-between">
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground">
            Live ranking
          </span>
          <span className="rounded-sm border border-border bg-surface-soft px-2 py-1 font-mono text-xs text-muted-foreground">
            {presetId === "custom" ? "Custom" : WEIGHT_PRESETS[presetId].label}
          </span>
        </div>

        <ol className="flex flex-col gap-2">
          {ranked.map((entry, i) => {
            const delta = entry.aos - entry.base;
            const tier = tierOf(entry.aos);
            return (
              <li
                key={entry.idea.slug}
                className="flex items-center gap-3.5 rounded-lg border border-border bg-surface px-3.5 py-3 transition-colors hover:border-border-strong"
              >
                <span className="w-6 font-mono text-xs tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <span
                  className="w-7 font-mono text-[0.8125rem] tabular-nums"
                  style={{ color: `var(${tier.cssVar})` }}
                >
                  {entry.aos}
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground">
                  {entry.idea.title}
                  <span className="ml-1.5 font-mono text-[0.6875rem] font-normal text-muted-foreground">
                    · {entry.idea.dna.vertical}
                  </span>
                </span>
                <span
                  className={`w-10 text-right font-mono text-[0.6875rem] ${
                    delta > 0 ? "text-success" : delta < 0 ? "text-danger" : "text-muted-foreground"
                  }`}
                >
                  {delta === 0 ? "—" : `${delta > 0 ? "+" : ""}${delta}`}
                </span>
              </li>
            );
          })}
        </ol>

        <p className="mt-3.5 font-mono text-[0.6875rem] leading-relaxed text-muted-foreground">
          Change shown against the balanced weighting. Weights are normalised, so the totals do not
          need to reach 100.
        </p>
      </div>
    </div>
  );
}

export { SIGNAL_KEYS };
