"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Footprints, RotateCcw } from "lucide-react";
import { CHILD_MODERATE_CADENCE, MAX_AGE, MIN_AGE, planKidStepGoal } from "../lib";

const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = { age: "8", sex: "male", steps: "9000", minutes: "30" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [steps, setSteps] = useState(DEFAULTS.steps);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planKidStepGoal({
        ageYears: age === "" ? NaN : Number(age),
        sex,
        stepsToday: steps === "" ? NaN : Number(steps),
        activeMinutes: minutes === "" ? 0 : Number(minutes),
      }),
    [age, sex, steps, minutes],
  );

  const hasError = Boolean(result.error);
  const barWidth = hasError ? 0 : Math.max(0, Math.min(100, result.percent));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Kids Daily Step Goal Planner",
      `Age ${result.ageYears} · ${result.sex === "male" ? "boy" : "girl"} · ${result.group.label}`,
      `Daily step target: ${INT.format(result.target)} steps`,
      `Steps so far: ${INT.format(result.stepsToday)} (${result.percent}% — ${result.level.label})`,
      `Steps still to go: ${INT.format(result.remaining)}`,
      `Weekly target: ${INT.format(result.weeklyTarget)} steps`,
      "",
      `Active minutes goal: ${result.mvpaGoal} minutes of moderate-to-vigorous activity a day (WHO)`,
      result.totalActivityGoal ? `Plus at least ${result.totalActivityGoal} minutes of activity of any intensity` : "",
      `Active minutes so far: ${INT.format(result.activeMinutes)} (${INT.format(result.mvpaRemaining)} to go)`,
      `Strengthening play on at least ${result.strengthDays} days a week`,
      "",
      "Ways to close the gap:",
      ...result.topUps.map((item) => `- ${item.label}: about ${INT.format(item.minutesNeeded)} min (${item.stepsPerMinute} steps/min)`),
      "",
      result.group.source,
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
    setAge(DEFAULTS.age);
    setSex(DEFAULTS.sex);
    setSteps(DEFAULTS.steps);
    setMinutes(DEFAULTS.minutes);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Footprints className="h-4 w-4" aria-hidden="true" />
          Child health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Kids Daily Step Goal Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Adult 10,000-step advice does not fit children. This planner uses published child step
          standards for the age and sex, pairs them with the WHO active-minute goal, and shows how
          much play it takes to finish the day on target.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ksg-age">
              Age (years)
            </label>
            <input
              id="ksg-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_AGE}
              max={MAX_AGE}
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ksg-sex">
              Step standard
            </label>
            <select
              id="ksg-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="male">Boy</option>
              <option value="female">Girl</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ksg-steps">
              Steps so far today
            </label>
            <input
              id="ksg-steps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={steps}
              onChange={(event) => setSteps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ksg-minutes">
              Active minutes so far today
            </label>
            <input
              id="ksg-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[2000, 5000, 8000, 12000].map((preset) => (
            <button key={preset} type="button" onClick={() => setSteps(String(preset))} className={CHIP_BTN}>
              {INT.format(preset)} steps
            </button>
          ))}
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
              {hasError ? DASH : `${INT.format(result.target)} steps`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${result.group.label} · published range ${INT.format(result.range[0])}-${INT.format(result.range[1])}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the step goal plan"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={hasError ? "Progress unavailable" : `${result.percent} percent of the daily step target`}
          >
            <span className="block h-full bg-[var(--primary)]" style={{ width: `${barWidth}%` }} />
          </div>
          <p className="mt-2 text-sm font-semibold">
            {hasError ? DASH : `${result.percent}% · ${result.level.label}`}
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">{hasError ? DASH : result.level.blurb}</p>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Steps so far", hasError ? DASH : `${INT.format(result.stepsToday)} steps`],
            ["Steps still to go", hasError ? DASH : `${INT.format(result.remaining)} steps`],
            ["Weekly target", hasError ? DASH : `${INT.format(result.weeklyTarget)} steps`],
            [
              "WHO active-minute goal",
              hasError
                ? DASH
                : result.totalActivityGoal
                  ? `${result.mvpaGoal} min moderate-to-vigorous, inside ${result.totalActivityGoal} min total activity`
                  : `${result.mvpaGoal} min moderate-to-vigorous a day`,
            ],
            ["Active minutes still to go", hasError ? DASH : `${INT.format(result.mvpaRemaining)} min`],
            ["Strength and bone play", hasError ? DASH : `at least ${result.strengthDays} days a week`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Ways to finish the day on target</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {result.remaining === 0
              ? "Today's target is already met — these rates are here for tomorrow."
              : `Any one of these closes the remaining ${INT.format(result.remaining)} steps.`}
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Activity</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Steps / min</th>
                  <th scope="col" className="py-2 text-right font-semibold">Minutes needed</th>
                </tr>
              </thead>
              <tbody>
                {result.topUps.map((item) => (
                  <tr key={item.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-medium">{item.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{item.stepsPerMinute}</td>
                    <td className="py-2 text-right font-semibold">
                      {item.minutesNeeded === 0 ? "Done" : `${INT.format(item.minutesNeeded)} min`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.group.source} The {result.mvpaGoal}-minute active goal walked at a child cadence of about{" "}
            {INT.format(CHILD_MODERATE_CADENCE)} steps a minute is roughly{" "}
            {INT.format(result.mvpaStepEquivalent)} steps, so step and minute goals overlap rather than stack.
          </p>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General guidance for healthy children, not medical advice. Wheelchair users, children with a
        chronic condition and children recovering from illness need targets set with their clinician.
        Step counts from wrist trackers are estimates and often differ from a hip pedometer.
      </p>
    </main>
  );
}
