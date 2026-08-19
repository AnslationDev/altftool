"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sunrise } from "lucide-react";

import { CONDITIONS, TARGETS, planOutdoorTime } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = {
  weekday: "30",
  weekend: "90",
  school: "20",
  condition: "shade",
  target: "daily",
};

const toNumber = (raw) => {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [weekday, setWeekday] = useState(DEFAULTS.weekday);
  const [weekend, setWeekend] = useState(DEFAULTS.weekend);
  const [school, setSchool] = useState(DEFAULTS.school);
  const [condition, setCondition] = useState(DEFAULTS.condition);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planOutdoorTime({
        weekdayMinutes: toNumber(weekday),
        weekendMinutes: toNumber(weekend),
        schoolOutdoorMinutes: toNumber(school),
        conditionId: condition,
        targetId: target,
      }),
    [weekday, weekend, school, condition, target],
  );

  const hasError = Boolean(plan.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Outdoor Time For Eyes Planner",
      `Target: ${plan.target.label} (${plan.targetWeekly} min a week)`,
      `Current: ${plan.weeklyMinutes} min a week (${plan.weeklyHours} h), ${plan.dailyAverage} min a day on average`,
      `Progress: ${plan.achievedPercent}% of target`,
      plan.metTarget
        ? "Status: target met"
        : `Shortfall: ${plan.gapWeekly} min a week — about ${plan.gapDaily} min a day, or ${plan.gapWeekday} min on each weekday`,
      `Typical light: ${plan.condition.label} (about ${plan.condition.lux} lux)`,
      `Light dose: ${plan.dailyLuxHours} thousand lux-hours a day, ${plan.weeklyLuxHours} a week`,
      `Reference: adding ${plan.trialExtraMinutes} min outdoors per school day cut 3-year myopia incidence from ${plan.trialControlIncidence}% to ${plan.trialInterventionIncidence}%.`,
    ].join("\n");
  }, [plan, hasError]);

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
    setWeekday(DEFAULTS.weekday);
    setWeekend(DEFAULTS.weekend);
    setSchool(DEFAULTS.school);
    setCondition(DEFAULTS.condition);
    setTarget(DEFAULTS.target);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Target", DASH],
        ["Current weekly total", DASH],
        ["Daily average", DASH],
        ["Progress against target", DASH],
        ["Shortfall", DASH],
        ["Typical light level", DASH],
        ["Light dose", DASH],
        ["Same dose indoors would take", DASH],
      ]
    : [
        ["Target", `${plan.target.label} — ${INT.format(plan.targetWeekly)} min/week`],
        ["Current weekly total", `${INT.format(plan.weeklyMinutes)} min (${NUM.format(plan.weeklyHours)} h)`],
        ["Daily average", `${NUM.format(plan.dailyAverage)} min`],
        ["Progress against target", `${NUM.format(plan.achievedPercent)}%`],
        [
          "Shortfall",
          plan.metTarget
            ? "None — target met"
            : `${INT.format(plan.gapWeekly)} min/week (${plan.gapDaily} min/day)`,
        ],
        ["Typical light level", `${plan.condition.label}, about ${INT.format(plan.condition.lux)} lux`],
        [
          "Light dose",
          `${NUM.format(plan.dailyLuxHours)}k lux-hours/day · ${NUM.format(plan.weeklyLuxHours)}k/week`,
        ],
        [
          "Same dose indoors would take",
          plan.indoorEquivalentMinutes !== null
            ? `${INT.format(plan.indoorEquivalentMinutes)} min a day at 400 lux`
            : "Already at indoor light levels",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sunrise className="h-4 w-4" aria-hidden="true" />
          Eye care
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Outdoor Time For Eyes Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Measures the daylight a child or adult actually gets against the targets used in myopia
          research — 2 hours a day, 11 hours a week, or the 40 extra minutes per school day tested in
          the Guangzhou trial — and shows where the missing minutes could come from.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="otp-weekday">
              Outdoor minutes on a weekday
            </label>
            <input
              id="otp-weekday"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="1440"
              step="5"
              value={weekday}
              onChange={(event) => setWeekday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="otp-school">
              Outdoor minutes at school or work (per weekday)
            </label>
            <input
              id="otp-school"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="1440"
              step="5"
              value={school}
              onChange={(event) => setSchool(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="otp-weekend">
              Outdoor minutes on a weekend day
            </label>
            <input
              id="otp-weekend"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="1440"
              step="10"
              value={weekend}
              onChange={(event) => setWeekend(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="otp-condition">
              Typical light while outdoors
            </label>
            <select
              id="otp-condition"
              className={`mt-2 ${INPUT_CLASS}`}
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
            >
              {CONDITIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} (~{item.lux} lux)
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="otp-target">
              Target to measure against
            </label>
            <select
              id="otp-target"
              className={`mt-2 ${INPUT_CLASS}`}
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            >
              {TARGETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
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
              Daylight per week
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]" aria-live="polite">
              {hasError ? DASH : `${NUM.format(plan.weeklyHours)} h`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a plan."
                : `${NUM.format(plan.dailyAverage)} min a day on average · ${NUM.format(plan.achievedPercent)}% of target`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the outdoor time plan"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${Math.round(plan.achievedPercent)} percent of the outdoor target reached`}
            >
              <span
                className={`block h-full ${plan.metTarget ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`}
                style={{ width: `${Math.min(100, plan.achievedPercent)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {INT.format(plan.weeklyMinutes)} of {INT.format(plan.targetWeekly)} minutes a week
            </p>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && plan.notes.length > 0 && (
          <ul className="mt-5 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {plan.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!hasError && plan.slots.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Where the missing minutes could come from</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Closing a {INT.format(plan.gapWeekly)} minute weekly gap means about {plan.gapWeekday}{" "}
            extra minutes on each of the five weekdays.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Slot
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Minutes
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.slots.map((slot) => (
                  <tr key={slot.id} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2 pr-3">
                      <span className="block font-semibold">{slot.label}</span>
                      <span className="text-[var(--muted-foreground)]">{slot.how}</span>
                    </td>
                    <td className="py-2 text-right font-semibold tabular-nums">{slot.minutes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Time outdoors is associated with delaying the onset of myopia in
        children; it is not a treatment, and the evidence that it slows progression once myopia has
        started is much weaker. Use normal sun protection, and discuss myopia management with an
        optometrist or ophthalmologist.
      </p>
    </main>
  );
}
