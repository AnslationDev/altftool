"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Target } from "lucide-react";

import { AGE_BANDS, GOALS, WEEKLY_INCREASE, calculateStepGoal } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  age: "45",
  currentSteps: "4000",
  goal: "general",
  mobilityLimits: false,
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return String(raw).trim() === "" || !Number.isFinite(value) ? NaN : value;
};

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [currentSteps, setCurrentSteps] = useState(DEFAULTS.currentSteps);
  const [goal, setGoal] = useState(DEFAULTS.goal);
  const [mobilityLimits, setMobilityLimits] = useState(DEFAULTS.mobilityLimits);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      calculateStepGoal({
        age: toNumber(age),
        currentSteps: toNumber(currentSteps),
        goal,
        mobilityLimits,
      }),
    [age, currentSteps, goal, mobilityLimits],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Daily step goal",
      `Age ${NUM0.format(result.age)} (band ${result.band.label}) — goal: ${result.goal.label}`,
      `Target: ${NUM0.format(result.targetSteps)} steps a day`,
      `You average now: ${NUM0.format(result.currentSteps)} (${NUM1.format(result.percentOfTarget)}% of target)`,
      `Of those, aim for ${NUM0.format(result.whoBriskStepsMin)}-${NUM0.format(result.whoBriskStepsMax)} brisk steps a day`,
    ];
    if (result.ramp.weeks.length) {
      lines.push("", `Ramp at ${Math.round(WEEKLY_INCREASE * 100)}% a week — ${result.weeksToTarget} weeks:`);
      result.ramp.weeks.forEach((week) => lines.push(`Week ${week.week}: ${NUM0.format(week.steps)}`));
    }
    return lines.join("\n");
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
    setAge(DEFAULTS.age);
    setCurrentSteps(DEFAULTS.currentSteps);
    setGoal(DEFAULTS.goal);
    setMobilityLimits(DEFAULTS.mobilityLimits);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Target className="h-4 w-4" aria-hidden="true" />
          Walking &amp; steps
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Step Goal By Age Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          10,000 steps was the name of a 1960s pedometer, not a research finding. This sets a target
          from the age bands where the health benefit of extra steps actually levels off, then ramps
          you there from where you are now.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-age">
              Age (years)
            </label>
            <input
              id="sg-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="18"
              max="100"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sg-current">
              Steps you average now
            </label>
            <input
              id="sg-current"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100000"
              step="500"
              value={currentSteps}
              onChange={(event) => setCurrentSteps(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="sg-goal">
              What you are aiming for
            </label>
            <select
              id="sg-goal"
              className={`mt-2 ${INPUT_CLASS}`}
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
            >
              {GOALS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="sg-mobility"
            >
              <input
                id="sg-mobility"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={mobilityLimits}
                onChange={(event) => setMobilityLimits(event.target.checked)}
              />
              Pain, breathlessness or a condition limits how far I can walk
            </label>
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
              Daily step target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${NUM0.format(result.targetSteps)} steps`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : result.alreadyThere
                  ? "You are already past this target."
                  : `${NUM0.format(result.gap)} more than you average now`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the step goal and ramp"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the calculator" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div
            className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`You are at ${Math.round(result.percentOfTarget)}% of the target`}
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${Math.max(0, Math.min(100, result.percentOfTarget))}%` }}
            />
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Age band", hasError ? dash : `${result.band.label} — ${NUM0.format(result.band.low)}–${NUM0.format(result.band.high)} steps a day`],
            ["Your current average", hasError ? dash : `${NUM0.format(result.currentSteps)} steps`],
            ["Progress to target", hasError ? dash : `${NUM1.format(result.percentOfTarget)}%`],
            [
              "Brisk steps within the total",
              hasError ? dash : `${NUM0.format(result.whoBriskStepsMin)}–${NUM0.format(result.whoBriskStepsMax)} a day`,
            ],
            [
              "That is roughly",
              hasError
                ? dash
                : `${NUM0.format(result.briskMinutesPerDayMin)}–${NUM0.format(result.briskMinutesPerDayMax)} minutes of brisk walking a day`,
            ],
            [
              `Weeks to get there at ${Math.round(WEEKLY_INCREASE * 100)}% a week`,
              hasError ? dash : result.alreadyThere ? "Already there" : `${result.weeksToTarget} weeks`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.ramp.weeks.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Week-by-week ramp</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Increasing by about {Math.round(WEEKLY_INCREASE * 100)}% a week keeps the jump small enough
            that shins, knees and feet adapt. Hold a week if anything is sore rather than pushing on.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Week</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Daily steps</th>
                  <th scope="col" className="py-2 text-right font-semibold">Of target</th>
                </tr>
              </thead>
              <tbody>
                {result.ramp.weeks.map((week) => (
                  <tr key={week.week} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{week.week}</td>
                    <td className="py-2 pr-3 text-right">{NUM0.format(week.steps)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {NUM0.format((week.steps / result.targetSteps) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What sits behind this number</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Bands by age</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Age</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Daily steps</th>
                <th scope="col" className="py-2 font-semibold">Why</th>
              </tr>
            </thead>
            <tbody>
              {AGE_BANDS.map((band) => (
                <tr key={band.key} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{band.label}</td>
                  <td className="py-2 pr-3 text-right">
                    {NUM0.format(band.low)}–{NUM0.format(band.high)}
                  </td>
                  <td className="py-2 text-[var(--muted-foreground)]">{band.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and based on population averages rather than your medical history. Talk to
        a doctor before sharply increasing activity if you have heart or lung disease, uncontrolled
        blood pressure, joint problems, or if you get chest pain, dizziness or unusual breathlessness
        when you walk. Steps do not replace muscle-strengthening or, for older adults, balance work.
      </p>
    </main>
  );
}
