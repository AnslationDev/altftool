"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wrench } from "lucide-react";

import { CONDITIONS, buildMaintenancePlan } from "../lib";

const KM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const km = (v) => (Number.isFinite(v) ? `${KM.format(v)} km` : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);

const days = (value) => {
  if (!Number.isFinite(value)) return DASH;
  if (value < 1) return "under a day";
  if (value < 14) return `${NUM1.format(value)} days`;
  if (value < 90) return `${NUM1.format(value / 7)} weeks`;
  return `${NUM1.format(value / 30.44)} months`;
};

const DEFAULTS = { weeklyKm: "100", condition: "mixed", odometer: "1200" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [weeklyKm, setWeeklyKm] = useState(DEFAULTS.weeklyKm);
  const [condition, setCondition] = useState(DEFAULTS.condition);
  const [odometer, setOdometer] = useState(DEFAULTS.odometer);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildMaintenancePlan({
        weeklyKm: toNumber(weeklyKm),
        condition,
        odometer: toNumber(odometer),
      }),
    [weeklyKm, condition, odometer],
  );

  const failed = Boolean(plan.error);
  const conditionLabel =
    CONDITIONS.find((item) => item.id === condition)?.label ?? condition;

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      "Bicycle Maintenance Planner",
      `Riding: ${KM.format(plan.weeklyKm)} km per week on ${conditionLabel.toLowerCase()}`,
      `Odometer: ${km(plan.odometer)} · about ${km(plan.annualKm)} a year`,
      `Next job: ${plan.next.task} in ${km(plan.next.kmUntilDue)} (at ${km(plan.next.dueAtKm)})`,
      "",
      "Schedule:",
    ];
    plan.byDistance.forEach((item) => {
      lines.push(
        `- ${item.task}: every ${km(item.intervalKm)}, next at ${km(item.dueAtKm)} (in ${km(item.kmUntilDue)})`,
      );
    });
    return lines.join("\n");
  }, [failed, plan, conditionLabel]);

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
    setWeeklyKm(DEFAULTS.weeklyKm);
    setCondition(DEFAULTS.condition);
    setOdometer(DEFAULTS.odometer);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wrench className="h-4 w-4" aria-hidden="true" />
          Service plan
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bicycle Maintenance Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter how far you ride and what you ride through, and every cleaning, inspection and
          replacement job is scaled to your own kilometres — with the odometer reading each one
          falls due at.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="plan-weekly">
              Distance ridden per week (km)
            </label>
            <input
              id="plan-weekly"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="5"
              value={weeklyKm}
              onChange={(event) => setWeeklyKm(event.target.value)}
            />
            <p className={HINT_CLASS}>A typical week, not your best week.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="plan-odo">
              Current odometer (km)
            </label>
            <input
              id="plan-odo"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={odometer}
              onChange={(event) => setOdometer(event.target.value)}
            />
            <p className={HINT_CLASS}>Total on the bike since it was last fully serviced.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="plan-condition">
              Riding conditions
            </label>
            <select
              id="plan-condition"
              className={`mt-2 ${INPUT_CLASS}`}
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
            >
              {CONDITIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              Grit and water do the wearing. Wet and gravel riding shortens drivetrain jobs to under
              half the dry-road interval.
            </p>
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Next job due in
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : km(plan.next.kmUntilDue)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to build a plan."
                : `${plan.next.task} — about ${days(plan.next.daysUntilDue)} away`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy maintenance schedule"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
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
            ["Distance ridden a year", failed ? DASH : km(plan.annualKm)],
            ["Condition multiplier on wear jobs", failed ? DASH : `×${num1(plan.factor)}`],
            ["Jobs falling due in the next 500 km", failed ? DASH : String(plan.dueWithin500Km)],
            ["Total service jobs a year", failed ? DASH : num1(plan.jobsPerYear)],
            ["Next chain replacement at", failed ? DASH : km(plan.schedule.find((item) => item.id === "chain").dueAtKm)],
            ["Next cassette replacement at", failed ? DASH : km(plan.schedule.find((item) => item.id === "cassette").dueAtKm)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Your schedule, soonest first</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[460px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Job
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Every
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Due at
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      In
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plan.byDistance.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">
                        <span className="font-medium">{item.task}</span>
                        <span className="block text-xs text-[var(--muted-foreground)]">
                          {item.group}
                          {item.sensitive ? " · scaled to conditions" : ""}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right whitespace-nowrap">{km(item.intervalKm)}</td>
                      <td className="py-2 pr-3 text-right whitespace-nowrap">{km(item.dueAtKm)}</td>
                      <td className="py-2 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                        {days(item.daysUntilDue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Jobs that run on the calendar, not the odometer</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {plan.timeSchedule.map((item) => (
                <li key={item.id} className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
                  <p className="font-medium">
                    {item.task} —{" "}
                    <span className="text-[var(--primary)]">
                      every {item.days === 365 ? "year" : `${item.days} days`}
                    </span>
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{item.note}</p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These are typical intervals for a well-kept bike, not a substitute for looking at the parts.
        Anything that fails an inspection gets replaced then and there, whatever the odometer says —
        and brake and steering components deserve a professional eye if you are unsure.
      </p>
    </main>
  );
}
