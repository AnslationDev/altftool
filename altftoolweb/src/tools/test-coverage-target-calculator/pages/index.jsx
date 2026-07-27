"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Target } from "lucide-react";

import {
  METRICS,
  coverageGap,
  effortEstimate,
  metricById,
  newCodeRequirement,
  ratchetPlan,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DEC = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  metric: "lines",
  total: "1000",
  covered: "750",
  target: "80",
  newItems: "100",
  steps: "5",
  minutesPerItem: "12",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const metric = metricById(form.metric);
  const unit = metric.unit;

  const gap = useMemo(
    () =>
      coverageGap({
        total: form.total.trim() === "" ? NaN : Number(form.total),
        covered: form.covered.trim() === "" ? NaN : Number(form.covered),
        targetPercent: form.target.trim() === "" ? NaN : Number(form.target),
      }),
    [form.total, form.covered, form.target],
  );
  const hasError = Boolean(gap.error);

  const newCode = useMemo(
    () =>
      hasError
        ? null
        : newCodeRequirement({
            total: Number(form.total),
            covered: Number(form.covered),
            targetPercent: Number(form.target),
            newItems: form.newItems.trim() === "" ? NaN : Number(form.newItems),
          }),
    [hasError, form.total, form.covered, form.target, form.newItems],
  );

  const ratchet = useMemo(
    () =>
      hasError
        ? null
        : ratchetPlan({
            total: Number(form.total),
            covered: Number(form.covered),
            targetPercent: Number(form.target),
            steps: form.steps.trim() === "" ? NaN : Number(form.steps),
          }),
    [hasError, form.total, form.covered, form.target, form.steps],
  );

  const effort = useMemo(
    () =>
      hasError
        ? null
        : effortEstimate({
            items: gap.toCover,
            minutesPerItem: form.minutesPerItem.trim() === "" ? NaN : Number(form.minutesPerItem),
          }),
    [hasError, gap.toCover, form.minutesPerItem],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Coverage target (${metric.label.toLowerCase()})`,
      `Current: ${NUM.format(gap.covered)} / ${NUM.format(gap.total)} = ${PCT.format(gap.currentPercent)}%`,
      `Gate: ${PCT.format(gap.target)}% → need ${NUM.format(gap.required)} covered ${unit}s`,
      gap.meetsTarget
        ? `Already passing with ${NUM.format(gap.surplus)} ${unit}s of headroom`
        : `Still to cover: ${NUM.format(gap.toCover)} ${unit}s`,
      gap.uncoveredBudget !== null && gap.meetsTarget
        ? `Untested ${unit}s you can add before failing: ${NUM.format(gap.uncoveredBudget)}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, gap, metric.label, unit]);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const mainFields = [
    ["total", `Total ${unit}s in the report`, { min: "1", step: "1" }],
    ["covered", `${metric.label} already covered`, { min: "0", step: "1" }],
    ["target", "Coverage gate (%)", { min: "0", max: "100", step: "0.1" }],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Target className="h-4 w-4" aria-hidden="true" />
          Coverage gate
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Test Coverage Target Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Coverage gates are percentages, but tests cover whole lines and branches. This converts
          your threshold into the exact whole-number count you must reach —{" "}
          <code>ceil(total × target / 100)</code> — plus what your next pull request has to achieve.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cov-metric">
              Metric
            </label>
            <select
              id="cov-metric"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.metric}
              onChange={(event) => set("metric", event.target.value)}
            >
              {METRICS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {mainFields.map(([key, label, attrs]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`cov-${key}`}>
                {label}
              </label>
              <input
                id={`cov-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                {...attrs}
                value={form[key]}
                onChange={(event) => set(key, event.target.value)}
              />
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="cov-newItems">
              New {unit}s in your next change
            </label>
            <input
              id="cov-newItems"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.newItems}
              onChange={(event) => set("newItems", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cov-minutes">
              Minutes to cover one {unit}
            </label>
            <input
              id="cov-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.minutesPerItem}
              onChange={(event) => set("minutesPerItem", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cov-steps">
              Ratchet steps (sprints)
            </label>
            <input
              id="cov-steps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="52"
              step="1"
              value={form.steps}
              onChange={(event) => set("steps", event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {gap.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {unit.charAt(0).toUpperCase() + unit.slice(1)}s still to cover
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(gap.toCover)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the gap."
                : gap.meetsTarget
                  ? `Already at ${PCT.format(gap.currentPercent)}% — the ${PCT.format(gap.target)}% gate passes.`
                  : `From ${PCT.format(gap.currentPercent)}% now to the ${PCT.format(gap.target)}% gate.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the coverage gap result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Current coverage", hasError ? DASH : `${PCT.format(gap.currentPercent)}%`],
            [
              `Covered ${unit}s required by the gate`,
              hasError ? DASH : `${NUM.format(gap.required)} of ${NUM.format(gap.total)}`,
            ],
            [
              `Uncovered ${unit}s the gate tolerates`,
              hasError ? DASH : NUM.format(gap.allowedUncovered),
            ],
            [
              "Headroom above the gate",
              hasError ? DASH : `${NUM.format(gap.surplus)} ${unit}s`,
            ],
            [
              `Untested ${unit}s you could add before failing`,
              hasError || gap.uncoveredBudget === null ? DASH : NUM.format(gap.uncoveredBudget),
            ],
            [
              "Estimated effort to close the gap",
              hasError || !effort || effort.error
                ? DASH
                : `${DEC.format(effort.totalHours)} h (${DEC.format(effort.workingDays)} working days)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && newCode && !newCode.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">
            What your next change must achieve ({NUM.format(Number(form.newItems))} new {unit}s)
          </h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              ["Total after the change", NUM.format(newCode.totalAfter)],
              ["Covered required after the change", NUM.format(newCode.requiredAfter)],
              [
                `New ${unit}s you must cover`,
                `${NUM.format(newCode.fromNewCode)} (${PCT.format(newCode.newCodeCoverageNeeded)}% of new code)`,
              ],
              [
                `Existing ${unit}s you must also cover`,
                NUM.format(newCode.fromExistingCode),
              ],
              [
                "Coverage if new code ships untested",
                `${PCT.format(newCode.percentIfNewCodeUntested)}%`,
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {newCode.reachableWithNewCodeAlone
              ? "Covering the new code alone is enough to keep the gate green."
              : "Even 100% coverage of the new code will not reach the gate — some existing code must be covered too."}
          </p>
        </section>
      )}

      {!hasError && ratchet && !ratchet.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Ratchet plan</h2>
          {ratchet.alreadyThere ? (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              You are already at or above the target — no ratchet needed.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Raise the gate by {PCT.format(ratchet.perStepPoints)} percentage points per step
                instead of one jump.
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">Step</th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">Gate</th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">Covered needed</th>
                      <th scope="col" className="py-2 text-right font-semibold">New this step</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratchet.rows.map((row) => (
                      <tr key={row.step} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-semibold">{row.step}</td>
                        <td className="py-2 pr-3 text-right">{PCT.format(row.gatePercent)}%</td>
                        <td className="py-2 pr-3 text-right">{NUM.format(row.requiredCovered)}</td>
                        <td className="py-2 text-right font-semibold">
                          {NUM.format(row.itemsThisStep)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Counts come straight from your coverage report (Istanbul/nyc, JaCoCo, coverage.py, go tool
        cover, SimpleCov). The gate uses a ceiling, not rounding — a build configured at 80% fails
        at 79.99% — so one {unit} short is still a red build.
      </p>
    </main>
  );
}
