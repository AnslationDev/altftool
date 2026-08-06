"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Droplets, RotateCcw } from "lucide-react";

import {
  DRIVING_CONDITIONS,
  OIL_TYPES,
  changesPerYear,
  planOilChange,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const KM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = {
  oilType: "semi",
  kmSinceChange: "4200",
  monthsSinceChange: "5",
  monthlyKm: "900",
  conditions: ["idling"],
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const STATUS_TEXT = {
  ok: "On schedule",
  "due-soon": "Due soon",
  overdue: "Overdue — change it now",
};

// A negative "months remaining" value means that limit has already passed —
// print it as "Overdue by N months" instead of the self-contradictory
// "reached in -N months" (future tense on a negative number).
const formatMonthsHorizon = (value) =>
  value >= 0 ? `${NUM.format(value)} months` : `Overdue by ${NUM.format(Math.abs(value))} months`;

export default function ToolHome() {
  const [oilType, setOilType] = useState(DEFAULTS.oilType);
  const [kmSinceChange, setKmSinceChange] = useState(DEFAULTS.kmSinceChange);
  const [monthsSinceChange, setMonthsSinceChange] = useState(DEFAULTS.monthsSinceChange);
  const [monthlyKm, setMonthlyKm] = useState(DEFAULTS.monthlyKm);
  const [conditions, setConditions] = useState(DEFAULTS.conditions);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planOilChange({
        oilType,
        kmSinceChange: toNumber(kmSinceChange),
        monthsSinceChange: toNumber(monthsSinceChange),
        monthlyKm: toNumber(monthlyKm),
        conditions,
      }),
    [oilType, kmSinceChange, monthsSinceChange, monthlyKm, conditions],
  );

  const yearly = useMemo(() => {
    if (plan.error) return null;
    return changesPerYear({
      intervalKm: plan.intervalKm,
      intervalMonths: plan.intervalMonths,
      monthlyKm: toNumber(monthlyKm),
    });
  }, [plan, monthlyKm]);

  const summary = useMemo(() => {
    if (plan.error) return "";
    return [
      "Oil Change Interval Planner",
      `Oil: ${plan.oilLabel}`,
      `Normal interval: ${KM.format(plan.baseKm)} km / ${NUM.format(plan.baseMonths)} months`,
      `Adjusted interval: ${KM.format(plan.intervalKm)} km / ${NUM.format(plan.intervalMonths)} months`,
      `Interval life used: ${NUM.format(plan.percentUsed)}%`,
      `Distance left: ${
        plan.kmRemaining >= 0
          ? `${KM.format(plan.kmRemaining)} km`
          : `overdue by ${KM.format(Math.abs(plan.kmRemaining))} km`
      }`,
      `Time left: ${
        plan.monthsRemaining >= 0
          ? `${NUM.format(plan.monthsRemaining)} months`
          : `overdue by ${NUM.format(Math.abs(plan.monthsRemaining))} months`
      } (limited by ${plan.limitedBy})`,
      `Status: ${STATUS_TEXT[plan.status]}`,
    ].join("\n");
  }, [plan]);

  const toggleCondition = (id) => {
    setConditions((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

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
    setOilType(DEFAULTS.oilType);
    setKmSinceChange(DEFAULTS.kmSinceChange);
    setMonthsSinceChange(DEFAULTS.monthsSinceChange);
    setMonthlyKm(DEFAULTS.monthlyKm);
    setConditions(DEFAULTS.conditions);
    setCopied(false);
  };

  const ok = !plan.error;
  const barWidth = ok ? Math.max(0, Math.min(100, plan.percentUsed)) : 0;
  const barColor =
    ok && plan.status === "overdue" ? "bg-[var(--danger)]" : "bg-[var(--primary)]";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          Car maintenance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Oil Change Interval Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Engine oil is due at whichever comes first — the distance limit or the time limit. Pick
          your oil grade, tick the conditions you actually drive in, and see how much of the
          interval is already used up.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="oil-type">
              Engine oil type
            </label>
            <select
              id="oil-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={oilType}
              onChange={(event) => {
                setOilType(event.target.value);
                setCopied(false);
              }}
            >
              {OIL_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label} — {KM.format(type.km)} km / {type.months} months
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="oil-km">
              Kilometres since last change
            </label>
            <input
              id="oil-km"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={kmSinceChange}
              onChange={(event) => {
                setKmSinceChange(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="oil-months">
              Months since last change
            </label>
            <input
              id="oil-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={monthsSinceChange}
              onChange={(event) => {
                setMonthsSinceChange(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="oil-monthly">
              Average kilometres per month
            </label>
            <input
              id="oil-monthly"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="50"
              value={monthlyKm}
              onChange={(event) => {
                setMonthlyKm(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Driving conditions
          </legend>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Tick everything that describes at least half your running.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {DRIVING_CONDITIONS.map((condition) => {
              const active = conditions.includes(condition.id);
              return (
                <label
                  key={condition.id}
                  htmlFor={`cond-${condition.id}`}
                  className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm transition ${
                    active
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`cond-${condition.id}`}
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                    checked={active}
                    onChange={() => toggleCondition(condition.id)}
                  />
                  <span>
                    <span className="block font-medium">{condition.label}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      &times;{condition.factor} interval
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {plan.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger-text)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Change due in
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                ok && plan.status === "overdue" ? "text-[var(--danger-text)]" : "text-[var(--primary)]"
              }`}
            >
              {ok
                ? plan.status === "overdue" || plan.kmRemaining <= 0
                  ? "Now"
                  : `${KM.format(plan.kmRemaining)} km`
                : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `or about ${NUM.format(Math.max(0, plan.monthsRemaining))} months — whichever comes first`
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy oil change plan"
              className={GHOST_BTN}
              disabled={!ok}
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

        <div className="mt-5">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={
              ok ? `${NUM.format(plan.percentUsed)} percent of the interval used` : "No result"
            }
          >
            <span className={`block h-full ${barColor}`} style={{ width: `${barWidth}%` }} />
          </div>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            {ok
              ? `${NUM.format(plan.percentUsed)}% of the interval used · ${STATUS_TEXT[plan.status]}`
              : DASH}
          </p>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" aria-live="polite" aria-atomic="true">
          {[
            [
              "Normal (manual) interval",
              ok ? `${KM.format(plan.baseKm)} km / ${NUM.format(plan.baseMonths)} months` : DASH,
            ],
            [
              "Condition factor applied",
              ok
                ? `${NUM.format(plan.factor)}${plan.factorClamped ? " (clamped)" : ""}`
                : DASH,
            ],
            [
              "Your adjusted interval",
              ok
                ? `${KM.format(plan.intervalKm)} km / ${NUM.format(plan.intervalMonths)} months`
                : DASH,
            ],
            [
              "Distance limit reached in",
              ok ? formatMonthsHorizon(plan.monthsRemainingByDistance) : DASH,
            ],
            [
              "Time limit reached in",
              ok ? formatMonthsHorizon(plan.monthsRemainingByTime) : DASH,
            ],
            ["Limit that hits first", ok ? plan.limitedBy : DASH],
            [
              "Interval used (distance / time)",
              ok
                ? `${NUM.format(plan.percentUsedByKm)}% / ${NUM.format(plan.percentUsedByTime)}%`
                : DASH,
            ],
            [
              "Oil changes per year at this pace",
              ok && yearly && !yearly.error ? NUM.format(yearly.perYear) : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && plan.appliedConditions.length > 0 ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Why your interval was shortened</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {plan.appliedConditions.map((condition) => (
              <li key={condition.label}>
                <span className="font-medium">{condition.label}</span>
                <span className="block text-[var(--muted-foreground)]">{condition.why}</span>
              </li>
            ))}
          </ul>
          {plan.factorClamped ? (
            <p className="mt-4 text-xs text-[var(--muted-foreground)]">
              Combined severity was capped: manufacturers advise shortening a severe-service
              interval, but not below half the normal figure.
            </p>
          ) : null}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Your owner&apos;s manual and any oil-life monitor fitted to the car
        override these figures, and a warranty claim can depend on following the printed schedule.
      </p>
    </main>
  );
}
