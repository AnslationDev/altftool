"use client";

import { useMemo, useState } from "react";
import { Bike, Check, Copy, RotateCcw } from "lucide-react";

import { FUEL_TYPES, computeCyclingCommute } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const DASH = "—";
const show = (value, formatter = NUM0) =>
  Number.isFinite(value) ? formatter.format(value) : DASH;
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);

const DEFAULTS = {
  weight: "72",
  weightUnit: "kg",
  oneWayDistance: "8",
  distanceUnit: "km",
  speedKmh: "18",
  tripsPerDay: "2",
  daysPerWeek: "5",
  carKmPerLitre: "15",
  fuelPricePerLitre: "105",
  fuelTypeId: "petrol",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw ?? "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const result = useMemo(
    () =>
      computeCyclingCommute({
        weight: toNumber(values.weight),
        weightUnit: values.weightUnit,
        oneWayDistance: toNumber(values.oneWayDistance),
        distanceUnit: values.distanceUnit,
        speedKmh: toNumber(values.speedKmh),
        tripsPerDay: toNumber(values.tripsPerDay),
        daysPerWeek: toNumber(values.daysPerWeek),
        carKmPerLitre: toNumber(values.carKmPerLitre),
        fuelPricePerLitre: toNumber(values.fuelPricePerLitre),
        fuelTypeId: values.fuelTypeId,
      }),
    [values],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Cycling Commute Estimate",
      `Ride: ${NUM2.format(result.oneWayKm)} km one way at ${values.speedKmh} km/h (${result.speedBandLabel}, ${result.met} MET)`,
      `Time per trip: ${NUM1.format(result.minutesPerTrip)} min`,
      `Calories per trip: ${NUM0.format(result.kcalPerTrip)} kcal`,
      `Calories per week: ${NUM0.format(result.kcalPerWeek)} kcal`,
      `Calories per year: ${NUM0.format(result.kcalPerYear)} kcal`,
      `Fuel avoided: ${NUM2.format(result.litresPerWeek)} L/week, ${NUM1.format(result.litresPerYear)} L/year`,
      `Money saved: ${INR.format(result.moneyPerWeek)}/week, ${INR.format(result.moneyPerYear)}/year`,
      `CO2 avoided: ${NUM2.format(result.co2KgPerWeek)} kg/week, ${NUM1.format(result.co2KgPerYear)} kg/year`,
    ].join("\n");
  }, [hasError, result, values.speedKmh]);

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
    setValues(DEFAULTS);
    setCopied(false);
  };

  const rideRows = [
    ["Intensity band", hasError ? DASH : `${result.speedBandLabel} · ${show(result.met, NUM1)} MET`],
    ["Time per trip", hasError ? DASH : `${show(result.minutesPerTrip, NUM1)} min`],
    ["Calories per trip", hasError ? DASH : `${show(result.kcalPerTrip)} kcal`],
    ["Calories per day", hasError ? DASH : `${show(result.kcalPerDay)} kcal`],
    ["Calories per week", hasError ? DASH : `${show(result.kcalPerWeek)} kcal`],
    ["Net of resting metabolism, weekly", hasError ? DASH : `${show(result.netKcalPerWeek)} kcal`],
    ["Riding minutes per week", hasError ? DASH : `${show(result.minutesPerWeek, NUM1)} min`],
    ["Body-fat equivalent per week", hasError ? DASH : `${show(result.fatGramsPerWeek, NUM1)} g`],
  ];

  const carRows = [
    ["Distance not driven, weekly", hasError ? DASH : `${show(result.kmPerWeek, NUM1)} km`],
    ["Distance not driven, yearly", hasError ? DASH : `${show(result.kmPerYear)} km`],
    [
      "Fuel avoided",
      hasError
        ? DASH
        : `${show(result.litresPerWeek, NUM2)} L/week · ${show(result.litresPerYear, NUM1)} L/year`,
    ],
    [
      "Money saved",
      hasError ? DASH : `${money(result.moneyPerWeek)}/week · ${money(result.moneyPerYear)}/year`,
    ],
    [
      "CO2 avoided",
      hasError
        ? DASH
        : `${show(result.co2KgPerWeek, NUM2)} kg/week · ${show(result.co2KgPerYear, NUM1)} kg/year`,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bike className="h-4 w-4" aria-hidden="true" />
          Commute
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cycling Commute Calorie Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Your average speed sets the intensity, so the same 8 km ride costs very different amounts
          of energy at 15 and 25 km/h. This works out the calories and what the car journey you
          skipped would have cost in fuel and CO2.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          The ride
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cycle-weight">
              Body weight
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="cycle-weight"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="25"
                step="0.5"
                value={values.weight}
                onChange={(event) => update("weight", event.target.value)}
              />
              <select
                aria-label="Weight unit"
                className={`${INPUT_CLASS} w-24`}
                value={values.weightUnit}
                onChange={(event) => update("weightUnit", event.target.value)}
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cycle-distance">
              One-way distance
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="cycle-distance"
                className={INPUT_CLASS}
                type="number"
                inputMode="decimal"
                min="0.1"
                step="0.5"
                value={values.oneWayDistance}
                onChange={(event) => update("oneWayDistance", event.target.value)}
              />
              <select
                aria-label="Distance unit"
                className={`${INPUT_CLASS} w-24`}
                value={values.distanceUnit}
                onChange={(event) => update("distanceUnit", event.target.value)}
              >
                <option value="km">km</option>
                <option value="mi">mi</option>
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cycle-speed">
              Average speed (km/h)
            </label>
            <input
              id="cycle-speed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="5"
              max="60"
              step="0.5"
              value={values.speedKmh}
              onChange={(event) => update("speedKmh", event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cycle-trips">
              Trips per day
            </label>
            <select
              id="cycle-trips"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.tripsPerDay}
              onChange={(event) => update("tripsPerDay", event.target.value)}
            >
              <option value="1">1 — one way only</option>
              <option value="2">2 — there and back</option>
              <option value="4">4 — there and back twice</option>
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cycle-days">
              Commuting days per week
            </label>
            <input
              id="cycle-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="7"
              step="1"
              value={values.daysPerWeek}
              onChange={(event) => update("daysPerWeek", event.target.value)}
            />
          </div>
        </div>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          The car you are not driving
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cycle-mileage">
              Car fuel economy (km per litre)
            </label>
            <input
              id="cycle-mileage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="0.5"
              value={values.carKmPerLitre}
              onChange={(event) => update("carKmPerLitre", event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="cycle-price">
              Fuel price per litre
            </label>
            <input
              id="cycle-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={values.fuelPricePerLitre}
              onChange={(event) => update("fuelPricePerLitre", event.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cycle-fuel">
              Fuel type
            </label>
            <select
              id="cycle-fuel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={values.fuelTypeId}
              onChange={(event) => update("fuelTypeId", event.target.value)}
            >
              {FUEL_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} ({item.kgCo2PerLitre} kg CO2 per litre)
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
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Calories per week
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${show(result.kcalPerWeek)} kcal`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see an estimate."
                : `${show(result.kcalPerTrip)} kcal per trip · ${show(result.kmPerWeek, NUM1)} km a week`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy cycling commute result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rideRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What the car journey would have cost</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {carRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
          CO2 is tailpipe only, from burning fuel: 2.31 kg per litre of petrol and 2.68 kg per litre
          of diesel. It excludes fuel production, vehicle manufacture and the extra food energy a
          rider consumes.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Hills, headwind, cargo and stop-start traffic all move the real figure — MET bands assume a
        steady effort on level ground. General information only, not medical or dietary advice.
      </p>
    </main>
  );
}
