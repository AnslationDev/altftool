"use client";

import { useMemo, useState } from "react";
import { Armchair, Check, Copy, RotateCcw } from "lucide-react";

import {
  MAX_BOUT_MIN,
  PAIRED_STRETCHES,
  PAIRED_STRETCH_SECONDS,
  SAFE_WEEKLY_INCREASE_PERCENT,
  buildAdaptationRamp,
  formatMinutes,
  formatSeconds,
} from "../lib";

const DEFAULTS = {
  startMinutes: "20",
  targetMinutes: "120",
  weeklyPercent: "10",
  weekLimit: "26",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [startMinutes, setStartMinutes] = useState(DEFAULTS.startMinutes);
  const [targetMinutes, setTargetMinutes] = useState(DEFAULTS.targetMinutes);
  const [weeklyPercent, setWeeklyPercent] = useState(DEFAULTS.weeklyPercent);
  const [weekLimit, setWeekLimit] = useState(DEFAULTS.weekLimit);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () => buildAdaptationRamp({ startMinutes, targetMinutes, weeklyPercent, weekLimit }),
    [startMinutes, targetMinutes, weeklyPercent, weekLimit],
  );

  const hasError = Boolean(plan.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Kneeling Chair Adaptation Planner",
      `From ${formatMinutes(plan.startMinutes)} a day to ${formatMinutes(plan.targetMinutes)} a day`,
      `Weekly increase: ${plan.weeklyPercent}%`,
      `Weeks needed: ${plan.weeksNeeded}`,
      plan.reachedWithinLimit
        ? `Target reached inside your ${weekLimit}-week window.`
        : `Your ${weekLimit}-week window ends at ${formatMinutes(plan.finalDailyMinutes)} a day — ${plan.weeksNeeded} weeks are needed.`,
      `Longest single sit: starts at 20 min, capped at ${MAX_BOUT_MIN} min`,
      `Paired mobility routine: ${formatSeconds(plan.stretchSeconds)} daily`,
      "",
      "Week / daily minutes / bouts",
      ...plan.weeks.map(
        (week) =>
          `${week.week}: ${week.dailyMinutes} min in ${week.bouts} × ${week.boutMinutes} min max`,
      ),
    ].join("\n");
  }, [hasError, plan, weekLimit]);

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
    setStartMinutes(DEFAULTS.startMinutes);
    setTargetMinutes(DEFAULTS.targetMinutes);
    setWeeklyPercent(DEFAULTS.weeklyPercent);
    setWeekLimit(DEFAULTS.weekLimit);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Armchair className="h-4 w-4" aria-hidden="true" />
          Posture &amp; ergonomics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Kneeling Chair Adaptation Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A kneeling chair puts load through your shins and holds your hips open — both are new to
          your body. This builds the week-by-week ramp from your first short sit to your target, at a
          rate your tissues can keep up with.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kcap-start">
              Comfortable now (minutes a day)
            </label>
            <input
              id="kcap-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="240"
              step="5"
              value={startMinutes}
              onChange={(event) => setStartMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kcap-target">
              Target (minutes a day)
            </label>
            <input
              id="kcap-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="600"
              step="5"
              value={targetMinutes}
              onChange={(event) => setTargetMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kcap-rate">
              Weekly increase (%)
            </label>
            <input
              id="kcap-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="50"
              step="1"
              value={weeklyPercent}
              onChange={(event) => setWeeklyPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kcap-weeks">
              Weeks you want to spend
            </label>
            <input
              id="kcap-weeks"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="52"
              step="1"
              value={weekLimit}
              onChange={(event) => setWeekLimit(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Weeks to reach your target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : plan.weeksNeeded}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your ramp."
                : `${formatMinutes(plan.startMinutes)} → ${formatMinutes(plan.targetMinutes)} a day at ${plan.weeklyPercent}% a week`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy kneeling chair adaptation plan"
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
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Week one", hasError ? DASH : `${formatMinutes(plan.startMinutes)} a day`],
            [
              "End of the plan you asked for",
              hasError
                ? DASH
                : `${formatMinutes(plan.finalDailyMinutes)} a day, week ${plan.weeksShown}`,
            ],
            [
              "Target reached in your window",
              hasError ? DASH : plan.reachedWithinLimit ? "Yes" : "No — extend the window",
            ],
            ["Longest single sit at the start", hasError ? DASH : "20 minutes"],
            ["Longest single sit, ever", hasError ? DASH : `${MAX_BOUT_MIN} minutes`],
            [
              "Chair time over the whole plan (5 days a week)",
              hasError ? DASH : formatMinutes(plan.totalMinutesOverPlan),
            ],
            ["Daily mobility routine", hasError ? DASH : formatSeconds(plan.stretchSeconds)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && plan.aboveSafeRate && (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-xs font-medium leading-5 text-[var(--warning)]">
            {plan.weeklyPercent}% a week is above the {SAFE_WEEKLY_INCREASE_PERCENT}% weekly increase
            normally used when adding an unfamiliar load. It will get you there faster, but shin and
            knee soreness is the usual cost — drop back a week if anything starts aching.
          </p>
        )}

        {!hasError && !plan.reachedWithinLimit && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            At {plan.weeklyPercent}% a week the full ramp takes {plan.weeksNeeded} weeks. The table
            below shows the first {plan.weeksShown}.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Week-by-week ramp</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Week
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Per day
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Bouts
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Max single sit
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.weeks.map((week) => (
                  <tr key={week.week} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{week.week}</td>
                    <td
                      className={`py-2 pr-3 text-right whitespace-nowrap ${
                        week.atTarget ? "font-semibold text-[var(--primary)]" : ""
                      }`}
                    >
                      {week.dailyMinutes} min
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {week.bouts} × {week.averageBoutMinutes} min
                    </td>
                    <td className="py-2 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                      {week.boutMinutes} min
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Spend the rest of each working day on a normal chair or standing. A kneeling chair is one
            more posture in the rotation, not a replacement for all of them.
          </p>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">
          Daily mobility pairing — {formatSeconds(PAIRED_STRETCH_SECONDS)}
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Move
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Time
                </th>
                <th scope="col" className="py-2 font-semibold">
                  How
                </th>
              </tr>
            </thead>
            <tbody>
              {PAIRED_STRETCHES.map((step) => (
                <tr key={step.name} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{step.name}</td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap">
                    {formatSeconds(step.seconds)}
                  </td>
                  <td className="py-2 text-[var(--muted-foreground)]">{step.cue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. The 10% weekly increase is a general loading guideline, not a medical
        prescription, and kneeling chairs do not suit everyone — they are usually a poor choice with
        knee problems, varicose veins or a recent lower-limb injury. Stop and speak to a
        physiotherapist or doctor if you get knee, shin or ankle pain that does not settle overnight.
      </p>
    </main>
  );
}
