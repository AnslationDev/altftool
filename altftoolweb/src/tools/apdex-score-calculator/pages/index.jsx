"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import { RATING_BANDS, TOLERATING_MULTIPLIER, computeApdex, fixesForTarget } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const SCORE = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  satisfied: "800",
  tolerating: "150",
  frustrated: "50",
  targetSeconds: "0.5",
  targetScore: "0.94",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const result = useMemo(
    () =>
      computeApdex({
        satisfied: form.satisfied,
        tolerating: form.tolerating,
        frustrated: form.frustrated,
        targetSeconds: form.targetSeconds,
      }),
    [form.satisfied, form.tolerating, form.frustrated, form.targetSeconds],
  );
  const hasError = Boolean(result.error);

  const fixes = useMemo(
    () =>
      hasError
        ? null
        : fixesForTarget({
            satisfied: form.satisfied,
            tolerating: form.tolerating,
            frustrated: form.frustrated,
            targetScore: form.targetScore,
          }),
    [hasError, form.satisfied, form.tolerating, form.frustrated, form.targetScore],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Apdex score: ${SCORE.format(result.score)} (${result.rating})`,
      `Samples: ${NUM.format(result.total)}`,
      `Satisfied: ${NUM.format(result.satisfied)} (${PCT.format(result.satisfiedShare)}%)`,
      `Tolerating: ${NUM.format(result.tolerating)} (${PCT.format(result.toleratingShare)}%)`,
      `Frustrated: ${NUM.format(result.frustrated)} (${PCT.format(result.frustratedShare)}%)`,
      result.targetSeconds !== null
        ? `T = ${result.targetSeconds}s, tolerating up to ${result.toleratingCeilingSeconds}s (4T)`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result]);

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

  const countFields = [
    ["satisfied", "Satisfied requests (≤ T)"],
    ["tolerating", `Tolerating requests (T to ${TOLERATING_MULTIPLIER}T)`],
    ["frustrated", `Frustrated requests (> ${TOLERATING_MULTIPLIER}T or errors)`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Performance index
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Apdex Score Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Apdex condenses response times into one number between 0 and 1:{" "}
          <code>(satisfied + tolerating / 2) ÷ total</code>, measured against your target time T —
          the same formula New Relic and Datadog report.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {countFields.map(([key, label]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`ap-${key}`}>
                {label}
              </label>
              <input
                id={`ap-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={form[key]}
                onChange={(event) => set(key, event.target.value)}
              />
            </div>
          ))}
          <div>
            <label className={LABEL_CLASS} htmlFor="ap-target">
              Target time T in seconds (optional)
            </label>
            <input
              id="ap-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.1"
              value={form.targetSeconds}
              onChange={(event) => set("targetSeconds", event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Only labels the buckets — the score itself needs just the three counts.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ap-goal">
              Target Apdex score (for the fix plan)
            </label>
            <input
              id="ap-goal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.01"
              max="1"
              step="0.01"
              value={form.targetScore}
              onChange={(event) => set("targetScore", event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Apdex score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : SCORE.format(result.score)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to score the sample." : `Rating: ${result.rating}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the Apdex result"
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
            ["Total samples", hasError ? DASH : NUM.format(result.total)],
            [
              "Satisfied share",
              hasError ? DASH : `${PCT.format(result.satisfiedShare)}%`,
            ],
            [
              "Tolerating share (counts half)",
              hasError ? DASH : `${PCT.format(result.toleratingShare)}%`,
            ],
            [
              "Frustrated share (counts zero)",
              hasError ? DASH : `${PCT.format(result.frustratedShare)}%`,
            ],
            [
              "Satisfied threshold T",
              hasError || result.targetSeconds === null ? DASH : `${result.targetSeconds} s`,
            ],
            [
              `Tolerating ceiling (${TOLERATING_MULTIPLIER}T)`,
              hasError || result.toleratingCeilingSeconds === null
                ? DASH
                : `${result.toleratingCeilingSeconds} s`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && fixes && !fixes.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">
            Reaching {form.targetScore} from {SCORE.format(result.score)}
          </h2>
          {fixes.fixFrustrated === 0 && fixes.fixTolerating === 0 ? (
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              Already at or above the target — nothing to fix.
            </p>
          ) : (
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {[
                [
                  "Frustrated requests to make satisfied (worth 1 each)",
                  NUM.format(fixes.fixFrustrated),
                ],
                [
                  "Tolerating requests to make satisfied (worth ½ each)",
                  NUM.format(fixes.fixTolerating),
                ],
                ["Score after those fixes", SCORE.format(fixes.resultingScore)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Rating bands</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Score</th>
                <th scope="col" className="py-2 font-semibold">Rating</th>
              </tr>
            </thead>
            <tbody>
              {RATING_BANDS.map((band, index) => {
                const upper = index === 0 ? 1 : RATING_BANDS[index - 1].min;
                const range =
                  index === 0
                    ? `${SCORE.format(band.min)} – 1.00`
                    : `${SCORE.format(band.min)} – ${SCORE.format(upper - 0.01)}`;
                const active = !hasError && result.rating === band.label;
                return (
                  <tr
                    key={band.label}
                    className={`border-b border-[var(--border)] last:border-0 ${active ? "font-semibold text-[var(--primary)]" : ""}`}
                  >
                    <td className="py-2 pr-3">{range}</td>
                    <td className="py-2">{band.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Buckets follow the Apdex Technical Specification: satisfied at or under T, tolerating up to
        4T, frustrated beyond 4T or errored — the factor 4 is fixed by the spec, only T is yours to
        choose. Scores from different T values are not comparable.
      </p>
    </main>
  );
}
