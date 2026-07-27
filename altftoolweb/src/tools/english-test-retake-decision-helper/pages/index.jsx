"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Repeat, RotateCcw } from "lucide-react";

import { HOURS_PER_BAND, TEST_SCALES, computeRetakeDecision } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  testId: "ielts",
  currentScore: "6.5",
  targetScore: "7",
  weeksAvailable: "8",
  hoursPerWeek: "12",
};

const DASH = "—";

export default function ToolHome() {
  const [testId, setTestId] = useState(DEFAULTS.testId);
  const [currentScore, setCurrentScore] = useState(DEFAULTS.currentScore);
  const [targetScore, setTargetScore] = useState(DEFAULTS.targetScore);
  const [weeksAvailable, setWeeksAvailable] = useState(DEFAULTS.weeksAvailable);
  const [hoursPerWeek, setHoursPerWeek] = useState(DEFAULTS.hoursPerWeek);
  const [copied, setCopied] = useState(false);

  const scale = TEST_SCALES.find((t) => t.id === testId) ?? TEST_SCALES[0];

  const result = useMemo(
    () =>
      computeRetakeDecision({
        testId,
        currentScore: currentScore.trim() === "" ? Number.NaN : Number(currentScore),
        targetScore: targetScore.trim() === "" ? Number.NaN : Number(targetScore),
        weeksAvailable: weeksAvailable.trim() === "" ? Number.NaN : Number(weeksAvailable),
        hoursPerWeek: hoursPerWeek.trim() === "" ? Number.NaN : Number(hoursPerWeek),
      }),
    [testId, currentScore, targetScore, weeksAvailable, hoursPerWeek],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `${scale.name} retake decision: ${result.headline}`,
      `Score gap: ${NUM.format(result.gap)} (${NUM.format(result.bandGap)} band equivalent)`,
      `Estimated study hours needed: ${NUM.format(result.hoursNeeded)}`,
      `Study hours available before deadline: ${NUM.format(result.hoursAvailable)}`,
      result.weeksNeeded !== null
        ? `Weeks needed at this pace: ${NUM.format(result.weeksNeeded)}`
        : null,
      result.reason,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, scale.name]);

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
    setTestId(DEFAULTS.testId);
    setCurrentScore(DEFAULTS.currentScore);
    setTargetScore(DEFAULTS.targetScore);
    setWeeksAvailable(DEFAULTS.weeksAvailable);
    setHoursPerWeek(DEFAULTS.hoursPerWeek);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Score gap", DASH],
        ["Band-equivalent gap", DASH],
        ["Estimated study hours needed", DASH],
        ["Study hours available", DASH],
        ["Weeks needed at this pace", DASH],
      ]
    : [
        ["Score gap", NUM.format(result.gap)],
        ["Band-equivalent gap", `${NUM.format(result.bandGap)} band(s)`],
        ["Estimated study hours needed", `${NUM.format(result.hoursNeeded)} h`],
        ["Study hours available", `${NUM.format(result.hoursAvailable)} h`],
        [
          "Weeks needed at this pace",
          result.weeksNeeded === null ? DASH : `${NUM.format(result.weeksNeeded)} weeks`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Repeat className="h-4 w-4" aria-hidden="true" />
          English Proficiency
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Test Retake Decision Helper
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Weighs your score gap against the study time you actually have, using the widely cited
          guideline of about {HOURS_PER_BAND} guided study hours per IELTS band (one CEFR level) of
          improvement.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rtd-test">
              Which test did you take?
            </label>
            <select
              id="rtd-test"
              className={`mt-2 ${INPUT_CLASS}`}
              value={testId}
              onChange={(event) => setTestId(event.target.value)}
            >
              {TEST_SCALES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name} ({option.min}–{option.max})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rtd-current">
              Current overall score
            </label>
            <input
              id="rtd-current"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={scale.min}
              max={scale.max}
              step={scale.step}
              value={currentScore}
              onChange={(event) => setCurrentScore(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rtd-target">
              Target score
            </label>
            <input
              id="rtd-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min={scale.min}
              max={scale.max}
              step={scale.step}
              value={targetScore}
              onChange={(event) => setTargetScore(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rtd-weeks">
              Weeks until you need the score
            </label>
            <input
              id="rtd-weeks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={weeksAvailable}
              onChange={(event) => setWeeksAvailable(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rtd-hours">
              Realistic study hours per week
            </label>
            <input
              id="rtd-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={hoursPerWeek}
              onChange={(event) => setHoursPerWeek(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recommendation
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.headline}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : result.reason}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the retake recommendation"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The {HOURS_PER_BAND}-hours-per-band figure is a planning guideline, not a guarantee —
        progress is faster on test technique and slower at higher bands. Treat the output as a
        starting point and factor in your own past improvement rate.
      </p>
    </main>
  );
}
