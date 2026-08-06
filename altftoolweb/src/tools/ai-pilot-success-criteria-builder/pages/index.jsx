"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Target, Trash2 } from "lucide-react";

import {
  DIRECTIONS,
  METRIC_KINDS,
  POWER_LEVELS,
  SIGNIFICANCE_LEVELS,
  TIERS,
  buildPilotPlan,
} from "../lib";

const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DEC1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const DASH = "—";

const FIELD =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-medium text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_CRITERIA = [
  {
    label: "Tickets resolved without a human",
    kind: "rate",
    direction: "increase",
    tier: "must",
    baseline: "10",
    target: "15",
    observed: "",
  },
  {
    label: "Average handle time (minutes)",
    kind: "continuous",
    direction: "decrease",
    tier: "nice",
    baseline: "12",
    target: "10",
    observed: "",
  },
];

const DEFAULT_STATE = {
  pilotName: "Support copilot pilot",
  durationWeeks: "8",
  significanceId: "0.05",
  powerId: "0.80",
  stdDev: "4",
  primaryIndex: 0,
  criteria: DEFAULT_CRITERIA,
};

const blankCriterion = () => ({
  label: "",
  kind: "rate",
  direction: "increase",
  tier: "must",
  baseline: "",
  target: "",
  observed: "",
});

function decisionTone(decision) {
  if (decision === "No-go") return "text-[var(--danger)]";
  if (decision === "Go") return "text-[var(--success)]";
  return "text-[var(--primary)]";
}

export default function ToolHome() {
  const [state, setState] = useState(DEFAULT_STATE);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => buildPilotPlan(state), [state]);
  const hasError = Boolean(result.error);

  const setField = (key, value) => {
    setState((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const setCriterion = (index, key, value) => {
    setState((prev) => ({
      ...prev,
      criteria: prev.criteria.map((c, i) => (i === index ? { ...c, [key]: value } : c)),
    }));
    setCopied(false);
  };

  const addCriterion = () => {
    setState((prev) => ({ ...prev, criteria: [...prev.criteria, blankCriterion()] }));
    setCopied(false);
  };

  const removeCriterion = (index) => {
    setState((prev) => {
      const criteria = prev.criteria.filter((_, i) => i !== index);
      const lastIndex = Math.max(0, criteria.length - 1);
      // Deleting a criterion listed before the primary shifts every later
      // index down by one, so the primary pointer must shift with it or it
      // silently ends up pointing at a different criterion than the one the
      // user selected.
      let primaryIndex = prev.primaryIndex;
      if (index < prev.primaryIndex) {
        primaryIndex -= 1;
      } else if (index === prev.primaryIndex) {
        primaryIndex = Math.min(prev.primaryIndex, lastIndex);
      }
      primaryIndex = Math.min(Math.max(primaryIndex, 0), lastIndex);
      return { ...prev, criteria, primaryIndex };
    });
    setCopied(false);
  };

  const reset = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Reset the builder? This clears the pilot name, settings and all criteria you've entered.")
    ) {
      return;
    }
    setState(DEFAULT_STATE);
    setCopied(false);
  };

  const copyResult = async () => {
    if (hasError || !result.doc) return;
    try {
      await navigator.clipboard.writeText(result.doc);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const primaryIsContinuous =
    state.criteria[state.primaryIndex]?.kind === "continuous";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Target className="h-4 w-4" aria-hidden="true" />
          AI pilot planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Pilot Success Criteria Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write the go/no-go rule before the pilot starts. Set must-have and nice-to-have criteria,
          then size the sample needed to detect the lift you are asking for at your chosen
          confidence and power.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The pilot</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="pilot-name">
              Pilot name
            </label>
            <input
              id="pilot-name"
              type="text"
              className={`${FIELD} mt-1`}
              value={state.pilotName}
              onChange={(e) => setField("pilotName", e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="pilot-weeks">
              Pilot length (weeks)
            </label>
            <input
              id="pilot-weeks"
              type="number"
              min="1"
              max="104"
              step="1"
              inputMode="numeric"
              className={`${FIELD} mt-1`}
              value={state.durationWeeks}
              onChange={(e) => setField("durationWeeks", e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="pilot-alpha">
              Confidence level
            </label>
            <select
              id="pilot-alpha"
              className={`${FIELD} mt-1`}
              value={state.significanceId}
              onChange={(e) => setField("significanceId", e.target.value)}
            >
              {SIGNIFICANCE_LEVELS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="pilot-power">
              Statistical power
            </label>
            <select
              id="pilot-power"
              className={`${FIELD} mt-1`}
              value={state.powerId}
              onChange={(e) => setField("powerId", e.target.value)}
            >
              {POWER_LEVELS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="pilot-primary">
              Primary metric (the pilot is sized on this)
            </label>
            <select
              id="pilot-primary"
              className={`${FIELD} mt-1`}
              value={String(state.primaryIndex)}
              onChange={(e) => setField("primaryIndex", Number(e.target.value))}
            >
              {state.criteria.map((c, i) => (
                <option key={`primary-${i}`} value={String(i)}>
                  {c.label.trim() || `Criterion ${i + 1}`}
                </option>
              ))}
            </select>
          </div>
          {primaryIsContinuous ? (
            <div>
              <label className={LABEL} htmlFor="pilot-sd">
                Standard deviation of the primary metric
              </label>
              <input
                id="pilot-sd"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                className={`${FIELD} mt-1`}
                value={state.stdDev}
                onChange={(e) => setField("stdDev", e.target.value)}
              />
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Success criteria</h2>
          <button type="button" onClick={addCriterion} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add criterion
          </button>
        </div>

        {state.criteria.map((c, i) => (
          <fieldset
            key={`criterion-${i}`}
            className="mt-4 rounded-lg border border-[var(--border)] p-4"
          >
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Criterion {i + 1}
              {i === state.primaryIndex ? " (primary)" : ""}
            </legend>

            <div className="grid gap-4">
              <div>
                <label className={LABEL} htmlFor={`c-label-${i}`}>
                  What you are measuring
                </label>
                <input
                  id={`c-label-${i}`}
                  type="text"
                  className={`${FIELD} mt-1`}
                  value={c.label}
                  onChange={(e) => setCriterion(i, "label", e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL} htmlFor={`c-kind-${i}`}>
                    Metric type
                  </label>
                  <select
                    id={`c-kind-${i}`}
                    className={`${FIELD} mt-1`}
                    value={c.kind}
                    onChange={(e) => setCriterion(i, "kind", e.target.value)}
                  >
                    {METRIC_KINDS.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL} htmlFor={`c-dir-${i}`}>
                    Direction
                  </label>
                  <select
                    id={`c-dir-${i}`}
                    className={`${FIELD} mt-1`}
                    value={c.direction}
                    onChange={(e) => setCriterion(i, "direction", e.target.value)}
                  >
                    {DIRECTIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL} htmlFor={`c-base-${i}`}>
                    Baseline today {c.kind === "rate" ? "(%)" : ""}
                  </label>
                  <input
                    id={`c-base-${i}`}
                    type="number"
                    step="any"
                    inputMode="decimal"
                    className={`${FIELD} mt-1`}
                    value={c.baseline}
                    onChange={(e) => setCriterion(i, "baseline", e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL} htmlFor={`c-target-${i}`}>
                    Target {c.kind === "rate" ? "(%)" : ""}
                  </label>
                  <input
                    id={`c-target-${i}`}
                    type="number"
                    step="any"
                    inputMode="decimal"
                    className={`${FIELD} mt-1`}
                    value={c.target}
                    onChange={(e) => setCriterion(i, "target", e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL} htmlFor={`c-tier-${i}`}>
                    Tier
                  </label>
                  <select
                    id={`c-tier-${i}`}
                    className={`${FIELD} mt-1`}
                    value={c.tier}
                    onChange={(e) => setCriterion(i, "tier", e.target.value)}
                  >
                    {TIERS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL} htmlFor={`c-observed-${i}`}>
                    Observed at the end (leave blank until then)
                  </label>
                  <input
                    id={`c-observed-${i}`}
                    type="number"
                    step="any"
                    inputMode="decimal"
                    className={`${FIELD} mt-1`}
                    value={c.observed}
                    onChange={(e) => setCriterion(i, "observed", e.target.value)}
                  />
                </div>
              </div>

              {state.criteria.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeCriterion(i)}
                  aria-label={`Remove criterion ${i + 1}`}
                  className={`${GHOST_BTN} w-full sm:w-auto sm:self-start`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              ) : null}
            </div>
          </fieldset>
        ))}
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Observations needed per arm
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : INT.format(result.samplePerArm)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to size the pilot."
                : `${INT.format(result.totalSample)} in total across both arms, about ${INT.format(result.perWeek)} per week over ${result.weeks} week${result.weeks === 1 ? "" : "s"}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the pilot criteria sheet"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy sheet"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the builder to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Decision right now
            </dt>
            <dd className={`text-sm font-semibold ${hasError ? "" : decisionTone(result.decision)}`}>
              {hasError ? DASH : result.decision}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Must-have criteria
            </dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : `${result.mustHaveCount} gating the decision`}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Primary metric
            </dt>
            <dd className="text-sm font-semibold">{hasError ? DASH : result.primary.label}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Statistical plan
            </dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : `${result.significance.label}, ${result.powerLevel.label}`}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Decision rule to agree now
            </dt>
            <dd className="text-sm">{hasError ? DASH : result.rule}</dd>
          </div>
        </dl>

        {!hasError && result.impractical ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            That lift is too small to prove at this sample size. Either aim for a bigger change, or
            accept the pilot will be directional rather than statistically conclusive.
          </p>
        ) : null}

        {!hasError ? (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.sampleNote} {result.decisionReason}
          </p>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Criteria sheet</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Criterion
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Tier
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Baseline
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Target
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Relative change
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.criteria.map((c, i) => {
                  const unit = c.kind === "rate" ? "%" : "";
                  return (
                    <tr key={`row-${i}`} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{c.label}</td>
                      <td className="py-2 pr-3">{c.tier === "must" ? "Must" : "Nice"}</td>
                      <td className="py-2 pr-3">
                        {DEC1.format(c.baseline)}
                        {unit}
                      </td>
                      <td className="py-2 pr-3">
                        {DEC1.format(c.target)}
                        {unit}
                      </td>
                      <td className="py-2 pr-3">
                        {c.relativeChangePct === null
                          ? "n/a"
                          : `${c.relativeChangePct > 0 ? "+" : ""}${DEC1.format(c.relativeChangePct)}%`}
                      </td>
                      <td className="py-2">
                        {c.status === "pass" ? (
                          <span className="font-semibold text-[var(--success)]">Pass</span>
                        ) : c.status === "fail" ? (
                          <span className="font-semibold text-[var(--danger)]">Fail</span>
                        ) : (
                          <span className="text-[var(--muted-foreground)]">Not measured</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}
