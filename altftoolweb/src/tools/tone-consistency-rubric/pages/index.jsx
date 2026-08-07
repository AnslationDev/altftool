"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import {
  ADJACENT_AGREEMENT_TARGET_PCT,
  DIMENSIONS,
  MAX_LEVEL,
  MAX_WEIGHT,
  MIN_LEVEL,
  MIN_WEIGHT,
  buildSummary,
  compareRaters,
  scoreTone,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const LEVELS = Array.from({ length: MAX_LEVEL - MIN_LEVEL + 1 }, (_, i) => MIN_LEVEL + i);
const WEIGHTS = Array.from({ length: MAX_WEIGHT - MIN_WEIGHT + 1 }, (_, i) => MIN_WEIGHT + i);

const defaultsFrom = (key) =>
  Object.fromEntries(DIMENSIONS.map((d) => [d.id, String(d[key])]));

const DEFAULT_TARGETS = defaultsFrom("defaultTarget");
const DEFAULT_WEIGHTS = defaultsFrom("defaultWeight");
const DEFAULT_RATINGS = {
  formality: "4",
  warmth: "3",
  directness: "4",
  energy: "5",
  jargon: "4",
  humour: "2",
};
const DEFAULT_RATER2 = {
  formality: "4",
  warmth: "3",
  directness: "3",
  energy: "4",
  jargon: "4",
  humour: "2",
};

const TONE_STYLE = {
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  danger: "text-[var(--danger)]",
};

const SEVERITY_STYLE = {
  "On target": "text-[var(--success)]",
  "Slight drift": "text-[var(--muted-foreground)]",
  "Clear drift": "text-[var(--warning)]",
  "Severe drift": "text-[var(--danger)]",
};

export default function ToolHome() {
  const [sampleName, setSampleName] = useState("Onboarding email v3");
  const [ratings, setRatings] = useState(DEFAULT_RATINGS);
  const [targets, setTargets] = useState(DEFAULT_TARGETS);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [showRater2, setShowRater2] = useState(false);
  const [rater2, setRater2] = useState(DEFAULT_RATER2);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => scoreTone({ ratings, targets, weights }),
    [ratings, targets, weights]
  );
  const agreement = useMemo(
    () => (showRater2 ? compareRaters(ratings, rater2) : null),
    [showRater2, ratings, rater2]
  );

  const summary = useMemo(() => buildSummary(result, sampleName), [result, sampleName]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSampleName("Onboarding email v3");
    setRatings(DEFAULT_RATINGS);
    setTargets(DEFAULT_TARGETS);
    setWeights(DEFAULT_WEIGHTS);
    setRater2(DEFAULT_RATER2);
    setShowRater2(false);
    setCopied(false);
  };

  const failed = Boolean(result.error);
  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Voice QA
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Tone Consistency Rubric</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set the voice you want, rate what the draft actually does on six anchored 1-5 scales, and
          get a weighted alignment score that names the dimension to fix first.
        </p>
      </header>

      <section className={CARD}>
        <label className={LABEL_CLASS} htmlFor="sample-name">
          What are you grading?
        </label>
        <input
          id="sample-name"
          className={`mt-2 ${INPUT_CLASS}`}
          type="text"
          value={sampleName}
          onChange={(event) => setSampleName(event.target.value)}
          placeholder="e.g. Pricing page hero, support macro #14"
        />
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`} aria-labelledby="score-heading" aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              id="score-heading"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Voice alignment
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? dash : `${result.score}/100`}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${failed ? "text-[var(--muted-foreground)]" : TONE_STYLE[result.band.tone]}`}
            >
              {failed ? dash : result.band.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the tone scorecard"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy scorecard"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the rubric" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!failed && (
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{result.band.note}</p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Dimensions on target",
              failed ? dash : `${result.onTargetCount} of ${result.rows.length}`,
            ],
            ["Average miss", failed ? dash : `${result.meanDistance} scale points`],
            [
              "Fix first",
              failed || !result.biggestDrift
                ? dash
                : `${result.biggestDrift.label} — ${result.biggestDrift.direction}`,
            ],
            ["Total weight applied", failed ? dash : String(result.weightSum)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Voice alignment ${result.score} out of 100`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.score))}%` }}
              />
            </div>
          </div>
        )}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="rubric-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="rubric-heading" className="text-base font-semibold">
            The rubric
          </h2>
          <button
            type="button"
            onClick={() => setShowRater2((value) => !value)}
            aria-expanded={showRater2}
            className="min-h-11 rounded-md px-3 text-sm font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            {showRater2 ? "Hide second rater" : "Add a second rater"}
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {DIMENSIONS.map((dim) => {
            const row = failed ? null : result.rows.find((r) => r.id === dim.id);
            return (
              <div
                key={dim.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold">{dim.label}</h3>
                  <span
                    className={`text-xs font-bold uppercase tracking-wide ${row ? SEVERITY_STYLE[row.severity] : "text-[var(--muted-foreground)]"}`}
                    aria-live="polite"
                  >
                    {row ? (row.distance === 0 ? row.severity : `${row.severity} · ${row.direction}`) : dash}
                  </span>
                </div>

                <div className={`mt-3 grid gap-3 ${showRater2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`target-${dim.id}`}>
                      Target
                    </label>
                    <select
                      id={`target-${dim.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      value={targets[dim.id]}
                      onChange={(event) =>
                        setTargets((prev) => ({ ...prev, [dim.id]: event.target.value }))
                      }
                    >
                      {LEVELS.map((level) => (
                        <option key={level} value={String(level)}>
                          {level} — {dim.anchors[level - 1].split(":")[0]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`rating-${dim.id}`}>
                      {showRater2 ? "Rater 1 observed" : "Observed"}
                    </label>
                    <select
                      id={`rating-${dim.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      value={ratings[dim.id]}
                      onChange={(event) =>
                        setRatings((prev) => ({ ...prev, [dim.id]: event.target.value }))
                      }
                    >
                      {LEVELS.map((level) => (
                        <option key={level} value={String(level)}>
                          {level} — {dim.anchors[level - 1].split(":")[0]}
                        </option>
                      ))}
                    </select>
                  </div>
                  {showRater2 ? (
                    <div>
                      <label className={LABEL_CLASS} htmlFor={`rater2-${dim.id}`}>
                        Rater 2 observed
                      </label>
                      <select
                        id={`rater2-${dim.id}`}
                        className={`mt-2 ${INPUT_CLASS}`}
                        value={rater2[dim.id]}
                        onChange={(event) =>
                          setRater2((prev) => ({ ...prev, [dim.id]: event.target.value }))
                        }
                      >
                        {LEVELS.map((level) => (
                          <option key={level} value={String(level)}>
                            {level} — {dim.anchors[level - 1].split(":")[0]}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`weight-${dim.id}`}>
                      Weight
                    </label>
                    <select
                      id={`weight-${dim.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      value={weights[dim.id]}
                      onChange={(event) =>
                        setWeights((prev) => ({ ...prev, [dim.id]: event.target.value }))
                      }
                    >
                      {WEIGHTS.map((weight) => (
                        <option key={weight} value={String(weight)}>
                          {weight === 0 ? "0 — ignore" : weight}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <dl className="mt-3 space-y-1.5 text-xs leading-5">
                  <div>
                    <dt className="inline font-semibold text-[var(--muted-foreground)]">Target anchor: </dt>
                    <dd className="inline text-[var(--muted-foreground)]">
                      {row ? row.anchorTarget : dash}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-[var(--muted-foreground)]">You marked: </dt>
                    <dd className="inline text-[var(--muted-foreground)]">
                      {row ? row.anchorObserved : dash}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      </section>

      {showRater2 ? (
        <section className={`mt-6 ${CARD}`} aria-labelledby="agreement-heading">
          <h2 id="agreement-heading" className="text-base font-semibold">
            Rater agreement
          </h2>
          {agreement && agreement.error ? (
            <p
              role="alert"
              className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {agreement.error}
            </p>
          ) : (
            <>
              <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
                {[
                  ["Exact agreement", `${agreement.exactPct}%`],
                  [
                    `Adjacent agreement (target ${ADJACENT_AGREEMENT_TARGET_PCT}%)`,
                    `${agreement.adjacentPct}%`,
                  ],
                  ["Mean absolute difference", `${agreement.meanAbsDiff} points`],
                  [
                    "Widest disagreement",
                    `${agreement.worstPair.label} (${agreement.worstPair.a} vs ${agreement.worstPair.b})`,
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              <p
                className={`mt-3 rounded-md px-3 py-2 text-sm ${agreement.passesTarget ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--warning-soft)] text-[var(--warning)]"}`}
              >
                {agreement.passesTarget
                  ? "Adjacent agreement is at or above target — the anchors are being read the same way."
                  : `Adjacent agreement is below ${ADJACENT_AGREEMENT_TARGET_PCT}%. Rewrite the anchor for "${agreement.worstPair.label}" before rolling this rubric out.`}
              </p>
            </>
          )}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A rubric measures how closely writing matches a voice you have already defined. It cannot
        tell you whether that voice is the right one for your audience — that still needs research.
      </p>
    </main>
  );
}
