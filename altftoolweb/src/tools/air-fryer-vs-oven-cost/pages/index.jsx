"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, CookingPot, Copy, RotateCcw } from "lucide-react";

import {
  DEFAULTS,
  DEFAULT_AIR_FRYER_DUTY,
  DEFAULT_OVEN_DUTY,
  compareAirFryerAndOven,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const money = (v) => (Number.isFinite(v) ? INR.format(v) : "—");
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : "—");
const num = (v, unit = "") => (Number.isFinite(v) ? `${NUM.format(v)}${unit}` : "—");
const kwh = (v) => (Number.isFinite(v) ? `${NUM3.format(v)} kWh` : "—");

const FORM_DEFAULTS = {
  airFryerWatts: String(DEFAULTS.airFryerWatts),
  airFryerPreheatMin: String(DEFAULTS.airFryerPreheatMin),
  airFryerCookMin: String(DEFAULTS.airFryerCookMin),
  airFryerDuty: String(DEFAULT_AIR_FRYER_DUTY),
  ovenWatts: String(DEFAULTS.ovenWatts),
  ovenPreheatMin: String(DEFAULTS.ovenPreheatMin),
  ovenCookMin: String(DEFAULTS.ovenCookMin),
  ovenDuty: String(DEFAULT_OVEN_DUTY),
  tariff: "8",
  mealsPerWeek: "4",
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(FORM_DEFAULTS);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(() => compareAirFryerAndOven(form), [form]);
  const error = result.error || "";
  const ok = !error;

  const winner = ok
    ? result.cheaperOption === "air fryer"
      ? "The air fryer is cheaper"
      : result.cheaperOption === "oven"
        ? "The oven is cheaper"
        : "Both cost the same"
    : "";

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Air fryer vs oven",
      `Air fryer: ${NUM3.format(result.airFryerKwh)} kWh, ${INR2.format(result.airFryerCost)}, ${result.airFryerMinutes} min`,
      `Oven: ${NUM3.format(result.ovenKwh)} kWh, ${INR2.format(result.ovenCost)}, ${result.ovenMinutes} min`,
      `${winner} by ${INR2.format(Math.abs(result.savingPerMeal))} a meal (${NUM.format(Math.abs(result.savingSharePct))}%)`,
      `Over a year: ${INR.format(Math.abs(result.savingPerYear))} and ${NUM.format(Math.abs(result.hoursSavedPerYear))} hours`,
    ].join("\n");
  }, [ok, result, winner]);

  // All the "*SavedPer*"/"saving*" fields share the same sign convention
  // (oven figure minus air-fryer figure), so a positive value always means
  // the air fryer is favorable for that specific metric and a negative
  // value means the oven is. Deriving the direction word from each field's
  // own signed value (rather than always assuming the air fryer) keeps the
  // dl honest when the oven turns out cheaper/faster/lower-energy.
  const favoredAppliance = (value) =>
    Number.isFinite(value) && value !== 0 ? (value > 0 ? "air fryer" : "oven") : null;

  const directionalLabel = (baseLabel, value) => {
    const who = favoredAppliance(value);
    return who ? `${baseLabel} by using the ${who}` : baseLabel;
  };

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(FORM_DEFAULTS);
    setCopied(false);
  };

  const applianceFields = [
    {
      title: "Air fryer",
      rows: [
        ["af-watts", "Rated power (watts)", "airFryerWatts", "50"],
        ["af-preheat", "Preheat time (minutes)", "airFryerPreheatMin", "1"],
        ["af-cook", "Cook time (minutes)", "airFryerCookMin", "1"],
        ["af-duty", "Element duty cycle while cooking (>0-1)", "airFryerDuty", "0.05"],
      ],
    },
    {
      title: "Conventional electric oven",
      rows: [
        ["ov-watts", "Rated power (watts)", "ovenWatts", "50"],
        ["ov-preheat", "Preheat time (minutes)", "ovenPreheatMin", "1"],
        ["ov-cook", "Cook time (minutes)", "ovenCookMin", "1"],
        ["ov-duty", "Element duty cycle while cooking (>0-1)", "ovenDuty", "0.05"],
      ],
    },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CookingPot className="h-4 w-4" aria-hidden="true" />
          Appliance energy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Air Fryer vs Oven Cost</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Counts the preheat at full power and the cooking phase at the thermostat&apos;s duty cycle,
          so the comparison reflects what the meter actually records.
        </p>
      </header>

      {applianceFields.map((group) => (
        <section key={group.title} className="mb-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">{group.title}</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {group.rows.map(([id, label, key, step]) => (
              <div key={id}>
                <label className={LABEL} htmlFor={id}>
                  {label}
                </label>
                <input
                  id={id}
                  className={INPUT}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step={step}
                  value={form[key]}
                  onChange={set(key)}
                />
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your tariff and habits</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="af-tariff">
              Electricity tariff (INR per kWh)
            </label>
            <input
              id="af-tariff"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={form.tariff}
              onChange={set("tariff")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="af-meals">
              Meals cooked this way per week
            </label>
            <input
              id="af-meals"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              max="70"
              step="1"
              value={form.mealsPerWeek}
              onChange={set("mealsPerWeek")}
            />
          </div>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Saving per meal
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money2(Math.abs(result.savingPerMeal)) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${winner} — ${num(Math.abs(result.savingSharePct), "%")} less energy cost per meal`
                : "Fix the highlighted input to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy air fryer versus oven comparison"
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
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Per meal</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Air fryer</th>
                <th scope="col" className="py-2 text-right font-semibold">Oven</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Energy used", ok ? kwh(result.airFryerKwh) : "—", ok ? kwh(result.ovenKwh) : "—"],
                ["Electricity cost", ok ? money2(result.airFryerCost) : "—", ok ? money2(result.ovenCost) : "—"],
                [
                  "Total time (preheat + cook)",
                  ok ? num(result.airFryerMinutes, " min") : "—",
                  ok ? num(result.ovenMinutes, " min") : "—",
                ],
                [
                  "Average draw over that time",
                  ok ? num(result.airFryerAvgWatts, " W") : "—",
                  ok ? num(result.ovenAvgWatts, " W") : "—",
                ],
              ].map(([label, a, b]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{label}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{a}</td>
                  <td className="py-2 text-right font-semibold">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [directionalLabel("Energy saved per meal", result.kwhSavedPerMeal), ok ? kwh(Math.abs(result.kwhSavedPerMeal)) : "—"],
            [directionalLabel("Time saved per meal", result.minutesSavedPerMeal), ok ? num(Math.abs(result.minutesSavedPerMeal), " min") : "—"],
            ["Meals per year at this rate", ok ? num(result.mealsPerYear) : "—"],
            [directionalLabel("Saving per month", result.savingPerMonth), ok ? money2(Math.abs(result.savingPerMonth)) : "—"],
            [directionalLabel("Saving per year", result.savingPerYear), ok ? money(Math.abs(result.savingPerYear)) : "—"],
            [directionalLabel("Energy saved per year", result.kwhSavedPerYear), ok ? kwh(Math.abs(result.kwhSavedPerYear)) : "—"],
            [directionalLabel("Hours of cooking time saved per year", result.hoursSavedPerYear), ok ? num(Math.abs(result.hoursSavedPerYear), " h") : "—"],
            [directionalLabel("Estimated CO2 avoided per year", result.co2SavedKgPerYear), ok ? `${num(Math.abs(result.co2SavedKgPerYear))} kg` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimates only. An air fryer wins on small batches; once a dish needs more than one basket
        load, the oven&apos;s single preheat can turn the comparison around, so compare like for like.
      </p>
    </main>
  );
}
