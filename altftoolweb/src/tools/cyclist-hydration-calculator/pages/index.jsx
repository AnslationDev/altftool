"use client";

import { useMemo, useState } from "react";
import { Bike, Check, Copy, RotateCcw } from "lucide-react";

import {
  DEHYDRATION_THRESHOLD_PCT,
  RIDE_INTENSITIES,
  computeRidePlan,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const ml = (value) => (Number.isFinite(value) ? `${NUM0.format(value)} ml` : DASH);
const litres = (value) => (Number.isFinite(value) ? `${NUM2.format(value)} L` : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM2.format(value)}%` : DASH);
const grams = (value) => (Number.isFinite(value) ? `${NUM0.format(value)} g` : DASH);

const BOTTLE_SIZES = [500, 620, 750, 950];

const DEFAULTS = {
  bodyMassKg: "70",
  hours: "3",
  tempC: "30",
  humidityPct: "60",
  intensity: "endurance",
  bottleMl: "750",
  cages: "2",
  measured: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
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
  const [bodyMassKg, setBodyMassKg] = useState(DEFAULTS.bodyMassKg);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [tempC, setTempC] = useState(DEFAULTS.tempC);
  const [humidityPct, setHumidityPct] = useState(DEFAULTS.humidityPct);
  const [intensity, setIntensity] = useState(DEFAULTS.intensity);
  const [bottleMl, setBottleMl] = useState(DEFAULTS.bottleMl);
  const [cages, setCages] = useState(DEFAULTS.cages);
  const [measured, setMeasured] = useState(DEFAULTS.measured);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeRidePlan({
        bodyMassKg: toNumber(bodyMassKg),
        hours: toNumber(hours),
        tempC: toNumber(tempC),
        humidityPct: toNumber(humidityPct),
        intensity,
        bottleMl: toNumber(bottleMl),
        cages: toNumber(cages),
        measuredSweatRateLPerH: toNumber(measured),
      }),
    [bodyMassKg, hours, tempC, humidityPct, intensity, bottleMl, cages, measured],
  );

  const hasError = Boolean(result.error);
  const plan = hasError ? null : result;

  const summary = useMemo(() => {
    if (!plan) return "";
    return [
      "Cyclist Hydration Plan",
      `Sweat rate (${plan.sweatSource}): ${NUM2.format(plan.sweatRateLPerH)} L/h`,
      `Drink: ${ml(plan.intakeMlPerH)} per hour = ${NUM1.format(plan.bottlesPerHour)} bottles/h`,
      `Bottles to carry or refill: ${plan.bottlesNeeded} x ${plan.bottleMl} ml`,
      `Refill stops needed: ${plan.refillStops}`,
      `Carbohydrate: ${grams(plan.carbGramsPerHour)}/h, ${grams(plan.carbGramsTotal)} total`,
      `Drink sodium: ${NUM0.format(plan.drinkSodiumMgPerL)} mg per litre`,
      `Deficit at the finish: ${pct(plan.deficitPct)} of body mass`,
      `Drink after the ride: ${ml(plan.postRideMl)}`,
    ].join("\n");
  }, [plan]);

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
    setBodyMassKg(DEFAULTS.bodyMassKg);
    setHours(DEFAULTS.hours);
    setTempC(DEFAULTS.tempC);
    setHumidityPct(DEFAULTS.humidityPct);
    setIntensity(DEFAULTS.intensity);
    setBottleMl(DEFAULTS.bottleMl);
    setCages(DEFAULTS.cages);
    setMeasured(DEFAULTS.measured);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bike className="h-4 w-4" aria-hidden="true" />
          Ride fuelling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cyclist Hydration Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Bottles per hour, refill stops, carbohydrate and drink sodium for the ride you are about to
          do — built on sweat rate, not guesswork.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cy-mass">
              Rider weight (kg)
            </label>
            <input
              id="cy-mass"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="30"
              max="250"
              step="0.5"
              value={bodyMassKg}
              onChange={(event) => setBodyMassKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cy-hours">
              Ride length (hours)
            </label>
            <input
              id="cy-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              max="24"
              step="0.25"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cy-temp">
              Air temperature (C)
            </label>
            <input
              id="cy-temp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-20"
              max="55"
              step="1"
              value={tempC}
              onChange={(event) => setTempC(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cy-humidity">
              Relative humidity (%)
            </label>
            <input
              id="cy-humidity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={humidityPct}
              onChange={(event) => setHumidityPct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cy-intensity">
              Ride intensity
            </label>
            <select
              id="cy-intensity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={intensity}
              onChange={(event) => setIntensity(event.target.value)}
            >
              {Object.entries(RIDE_INTENSITIES).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cy-cages">
              Bottle cages on the bike
            </label>
            <input
              id="cy-cages"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="6"
              step="1"
              value={cages}
              onChange={(event) => setCages(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cy-bottle">
              Bottle size (ml)
            </label>
            <input
              id="cy-bottle"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="250"
              max="2000"
              step="10"
              value={bottleMl}
              onChange={(event) => setBottleMl(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {BOTTLE_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setBottleMl(String(size))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {size} ml
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cy-measured">
              Measured sweat rate (L/h) — optional
            </label>
            <input
              id="cy-measured"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="2.5"
              step="0.05"
              placeholder="Leave blank to use the model"
              value={measured}
              onChange={(event) => setMeasured(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Weigh in and out of a ride: sweat litres = kg lost + litres drunk, divided by hours.
              Entering it here overrides the temperature and intensity model.
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
              Drink per hour
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {plan ? ml(plan.intakeMlPerH) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan
                ? `${NUM1.format(plan.bottlesPerHour)} bottles an hour at ${plan.bottleMl} ml`
                : "Fix the input above to see your plan"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!plan}
              aria-label="Copy ride hydration plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Sweat rate used", plan ? `${NUM2.format(plan.sweatRateLPerH)} L/h (${plan.sweatSource})` : DASH],
            ["Sweat lost over the ride", plan ? litres(plan.sweatLossL) : DASH],
            ["Total fluid to drink on the bike", plan ? ml(plan.totalIntakeMl) : DASH],
            ["Bottles to fill in total", plan ? `${plan.bottlesNeeded} x ${plan.bottleMl} ml` : DASH],
            ["Refill stops with your cages", plan ? String(plan.refillStops) : DASH],
            ["Carbohydrate target", plan ? `${grams(plan.carbGramsPerHour)} per hour` : DASH],
            ["Carbohydrate for the whole ride", plan ? grams(plan.carbGramsTotal) : DASH],
            ["Sodium to put in the bottles", plan ? `${NUM0.format(plan.drinkSodiumMgPerL)} mg per litre` : DASH],
            ["Sodium lost in sweat", plan ? `${NUM0.format(plan.sodiumLostMg)} mg` : DASH],
            ["Body-mass loss if you drink nothing", plan ? pct(plan.unreplacedPct) : DASH],
            ["Deficit at the finish with this plan", plan ? pct(plan.deficitPct) : DASH],
            ["Drink after the ride", plan ? ml(plan.postRideMl) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {plan ? (
          <div className="mt-5 space-y-2 text-sm">
            <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-[var(--muted-foreground)]">
              {plan.carbNote}
            </p>
            {plan.exceedsThreshold ? (
              <p className="rounded-md bg-[var(--danger-soft)] px-3 py-2 font-medium text-[var(--danger)]">
                You cannot absorb fluid fast enough to keep up with this sweat rate, so you would
                finish more than {DEHYDRATION_THRESHOLD_PCT}% down. Start fully hydrated, ride
                earlier or later in the day, and plan a real rehydration window afterwards.
              </p>
            ) : (
              <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-[var(--muted-foreground)]">
                This plan keeps you inside the {DEHYDRATION_THRESHOLD_PCT}% body-mass loss threshold
                where endurance performance starts to drop.
              </p>
            )}
            {plan.clamped ? (
              <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                The modelled sweat rate hit the edge of the physiological range and was capped. A
                weigh-in figure will be more useful in conditions this extreme.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General sports-nutrition information, not medical advice. Drinking more than you sweat over a
        long ride can dilute blood sodium and cause hyponatraemia. Riders with kidney, heart or
        blood-pressure conditions, or on diuretics, should agree a plan with their doctor.
      </p>
    </main>
  );
}
