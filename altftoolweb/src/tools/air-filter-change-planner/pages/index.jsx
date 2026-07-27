"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wind } from "lucide-react";

import { DUST_LEVELS, EXTRA_CONDITIONS, planFilterChanges } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const KM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = {
  dustLevel: "high",
  extras: ["heavyTraffic"],
  engineKmSince: "8000",
  engineMonthsSince: "10",
  cabinKmSince: "8000",
  cabinMonthsSince: "10",
  monthlyKm: "800",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const STATUS_TEXT = {
  ok: "On schedule",
  "due-soon": "Due soon",
  overdue: "Overdue",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

function FilterCard({ filter }) {
  const overdue = filter.status === "overdue";
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">{filter.label}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            overdue
              ? "bg-[var(--danger-soft)] text-[var(--danger)]"
              : "bg-[var(--muted)] text-[var(--muted-foreground)]"
          }`}
        >
          {STATUS_TEXT[filter.status]}
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-[var(--primary)]">
        {filter.kmRemaining > 0 ? `${KM.format(filter.kmRemaining)} km` : "Change now"}
      </p>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">{filter.role}</p>
      <dl className="mt-3 divide-y divide-[var(--border)] text-xs">
        {[
          ["Adjusted interval", `${KM.format(filter.intervalKm)} km / ${NUM.format(filter.intervalMonths)} mo`],
          ["Normal interval", `${KM.format(filter.baseKm)} km / ${filter.baseMonths} mo`],
          ["Months left", NUM.format(Math.max(0, filter.monthsRemaining))],
          ["Limit that hits first", filter.limitedBy],
          ["Interval used", `${NUM.format(filter.percentUsed)}%`],
          ["Inspect every", `${KM.format(filter.inspectEveryKm)} km`],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 py-1.5">
            <dt className="text-[var(--muted-foreground)]">{label}</dt>
            <dd className="text-right font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
        <span
          className={`block h-full ${overdue ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
          style={{ width: `${Math.max(0, Math.min(100, filter.percentUsed))}%` }}
        />
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [dustLevel, setDustLevel] = useState(DEFAULTS.dustLevel);
  const [extras, setExtras] = useState(DEFAULTS.extras);
  const [engineKmSince, setEngineKmSince] = useState(DEFAULTS.engineKmSince);
  const [engineMonthsSince, setEngineMonthsSince] = useState(DEFAULTS.engineMonthsSince);
  const [cabinKmSince, setCabinKmSince] = useState(DEFAULTS.cabinKmSince);
  const [cabinMonthsSince, setCabinMonthsSince] = useState(DEFAULTS.cabinMonthsSince);
  const [monthlyKm, setMonthlyKm] = useState(DEFAULTS.monthlyKm);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planFilterChanges({
        dustLevel,
        extras,
        engineKmSince: toNumber(engineKmSince),
        engineMonthsSince: toNumber(engineMonthsSince),
        cabinKmSince: toNumber(cabinKmSince),
        cabinMonthsSince: toNumber(cabinMonthsSince),
        monthlyKm: toNumber(monthlyKm),
      }),
    [
      dustLevel,
      extras,
      engineKmSince,
      engineMonthsSince,
      cabinKmSince,
      cabinMonthsSince,
      monthlyKm,
    ],
  );

  const summary = useMemo(() => {
    if (plan.error) return "";
    return [
      "Air Filter Change Planner",
      `Dust exposure: ${plan.dustLabel}`,
      `Engine air filter: ${KM.format(plan.engine.intervalKm)} km / ${NUM.format(plan.engine.intervalMonths)} months, ${KM.format(plan.engine.kmRemaining)} km left`,
      `Cabin / AC filter: ${KM.format(plan.cabin.intervalKm)} km / ${NUM.format(plan.cabin.intervalMonths)} months, ${KM.format(plan.cabin.kmRemaining)} km left`,
      `Due first: ${plan.soonestFilterLabel} in about ${NUM.format(Math.max(0, plan.soonestMonths))} months`,
    ].join("\n");
  }, [plan]);

  const toggleExtra = (id) => {
    setExtras((current) =>
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
    setDustLevel(DEFAULTS.dustLevel);
    setExtras(DEFAULTS.extras);
    setEngineKmSince(DEFAULTS.engineKmSince);
    setEngineMonthsSince(DEFAULTS.engineMonthsSince);
    setCabinKmSince(DEFAULTS.cabinKmSince);
    setCabinMonthsSince(DEFAULTS.cabinMonthsSince);
    setMonthlyKm(DEFAULTS.monthlyKm);
    setCopied(false);
  };

  const ok = !plan.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wind className="h-4 w-4" aria-hidden="true" />
          Car maintenance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Air Filter Change Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Air filters are loaded by the volume of dirty air they pass, not by distance. Set your
          real dust exposure and get separate schedules for the engine element and the cabin filter.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dust-level">
              Dust exposure on your usual roads
            </label>
            <select
              id="dust-level"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dustLevel}
              onChange={(event) => {
                setDustLevel(event.target.value);
                setCopied(false);
              }}
            >
              {DUST_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="eng-km">
              Km since engine filter change
            </label>
            <input
              id="eng-km"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={engineKmSince}
              onChange={(event) => {
                setEngineKmSince(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="eng-months">
              Months since engine filter change
            </label>
            <input
              id="eng-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={engineMonthsSince}
              onChange={(event) => {
                setEngineMonthsSince(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cab-km">
              Km since cabin filter change
            </label>
            <input
              id="cab-km"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={cabinKmSince}
              onChange={(event) => {
                setCabinKmSince(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cab-months">
              Months since cabin filter change
            </label>
            <input
              id="cab-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={cabinMonthsSince}
              onChange={(event) => {
                setCabinMonthsSince(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="monthly-km">
              Average kilometres per month
            </label>
            <input
              id="monthly-km"
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
          <legend className="text-sm font-semibold">Anything else that applies</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {EXTRA_CONDITIONS.map((condition) => {
              const active = extras.includes(condition.id);
              return (
                <label
                  key={condition.id}
                  htmlFor={`extra-${condition.id}`}
                  className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm transition ${
                    active
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`extra-${condition.id}`}
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                    checked={active}
                    onChange={() => toggleExtra(condition.id)}
                  />
                  <span>
                    <span className="block font-medium">{condition.label}</span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      &times;{condition.factor} on the {condition.scope} filter
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
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Next filter due
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok
                ? plan.soonestKm > 0
                  ? `${KM.format(plan.soonestKm)} km`
                  : "Now"
                : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${plan.soonestFilterLabel} — about ${NUM.format(Math.max(0, plan.soonestMonths))} months away`
                : "Fix the input above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy filter change plan"
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

        {ok ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <FilterCard filter={plan.engine} />
            <FilterCard filter={plan.cabin} />
          </div>
        ) : (
          <p className="mt-5 text-sm text-[var(--muted-foreground)]">
            Engine filter {DASH} · Cabin filter {DASH}
          </p>
        )}
      </section>

      {ok && plan.appliedExtras.length > 0 ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Why these intervals were shortened</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {plan.appliedExtras.map((condition) => (
              <li key={condition.label}>
                <span className="font-medium">{condition.label}</span>
                <span className="block text-[var(--muted-foreground)]">{condition.why}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. Your owner&apos;s manual sets the schedule that a warranty claim is
        judged against; treat these as inspection prompts rather than a replacement for it.
      </p>
    </main>
  );
}
