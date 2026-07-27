"use client";

import { useMemo, useState } from "react";
import { Calculator, Check, Copy, RotateCcw } from "lucide-react";

import {
  FIBONACCI_POINTS,
  MAX_CONFIDENCE_PCT,
  MIN_CONFIDENCE_PCT,
  computeStoryPointEstimate,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  storyPoints: "13",
  velocityPoints: "30",
  sprintPersonHours: "240",
  confidencePercent: "80",
};

export default function ToolHome() {
  const [storyPoints, setStoryPoints] = useState(DEFAULTS.storyPoints);
  const [velocityPoints, setVelocityPoints] = useState(DEFAULTS.velocityPoints);
  const [sprintPersonHours, setSprintPersonHours] = useState(DEFAULTS.sprintPersonHours);
  const [confidencePercent, setConfidencePercent] = useState(DEFAULTS.confidencePercent);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeStoryPointEstimate({
        storyPoints: storyPoints.trim() === "" ? Number.NaN : Number(storyPoints),
        velocityPoints: velocityPoints.trim() === "" ? Number.NaN : Number(velocityPoints),
        sprintPersonHours:
          sprintPersonHours.trim() === "" ? Number.NaN : Number(sprintPersonHours),
        confidencePercent:
          confidencePercent.trim() === "" ? Number.NaN : Number(confidencePercent),
      }),
    [storyPoints, velocityPoints, sprintPersonHours, confidencePercent],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Story point estimate",
      `Story points: ${storyPoints}`,
      `Team velocity: ${velocityPoints} points/sprint over ${sprintPersonHours} person-hours`,
      `Hours per point: ${NUM.format(result.hoursPerPoint)}`,
      `Estimate: ${NUM.format(result.midHours)} h (range ${NUM.format(result.lowHours)}–${NUM.format(result.highHours)} h at ±${result.spreadPercent}%)`,
      `Person-days (8 h): ${NUM.format(result.midPersonDays)}`,
      `Sprints needed: ${NUM.format(result.sprintsNeeded)} (${result.sprintsNeededWhole} whole)`,
    ].join("\n");
  }, [hasError, result, storyPoints, velocityPoints, sprintPersonHours]);

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
    setStoryPoints(DEFAULTS.storyPoints);
    setVelocityPoints(DEFAULTS.velocityPoints);
    setSprintPersonHours(DEFAULTS.sprintPersonHours);
    setConfidencePercent(DEFAULTS.confidencePercent);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Hours per point (your team)", DASH],
        ["Optimistic (low)", DASH],
        ["Pessimistic (high)", DASH],
        ["Person-days at 8 h/day", DASH],
        ["Sprints needed", DASH],
      ]
    : [
        ["Hours per point (your team)", `${NUM.format(result.hoursPerPoint)} h`],
        ["Optimistic (low)", `${NUM.format(result.lowHours)} h`],
        ["Pessimistic (high)", `${NUM.format(result.highHours)} h`],
        [
          "Person-days at 8 h/day",
          `${NUM.format(result.midPersonDays)} (${NUM.format(result.lowPersonDays)}–${NUM.format(result.highPersonDays)})`,
        ],
        [
          "Sprints needed",
          `${NUM.format(result.sprintsNeeded)} (${result.sprintsNeededWhole} whole sprint${result.sprintsNeededWhole === 1 ? "" : "s"})`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Calculator className="h-4 w-4" aria-hidden="true" />
          Engineering process
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Story Point Estimation Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Points have no universal hour value — the honest conversion divides your team&apos;s
          sprint person-hours by its velocity. Enter both to turn any story into an hour
          estimate with a confidence range.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="spe-points">
              Story points to convert
            </label>
            <input
              id="spe-points"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              value={storyPoints}
              onChange={(event) => setStoryPoints(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {FIBONACCI_POINTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStoryPoints(String(value))}
                  aria-label={`Set story points to ${value}`}
                  className="min-h-11 min-w-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spe-velocity">
              Team velocity (points per sprint)
            </label>
            <input
              id="spe-velocity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              value={velocityPoints}
              onChange={(event) => setVelocityPoints(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Average of your last 3–5 sprints, not the best one.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spe-hours">
              Sprint person-hours (whole team)
            </label>
            <input
              id="spe-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={sprintPersonHours}
              onChange={(event) => setSprintPersonHours(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              People × working days × focus hours, e.g. 3 devs × 10 days × 8 h = 240.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="spe-confidence">
              Confidence ({MIN_CONFIDENCE_PCT}–{MAX_CONFIDENCE_PCT}%)
            </label>
            <input
              id="spe-confidence"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_CONFIDENCE_PCT}
              max={MAX_CONFIDENCE_PCT}
              step="5"
              value={confidencePercent}
              onChange={(event) => setConfidencePercent(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              80% confidence spreads the range ±20% around the midpoint.
            </p>
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
              Estimated effort
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.midHours)} h`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Range ${NUM.format(result.lowHours)}–${NUM.format(result.highHours)} h at ±${result.spreadPercent}% spread, using your team's own hours-per-point rate.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the story point estimate"
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
        Story points measure relative size, not time; this conversion is only as good as the
        velocity behind it. Use it for planning conversations, not commitments — velocity
        shifts as the team, codebase and sprint length change.
      </p>
    </main>
  );
}
