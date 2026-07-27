"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Route } from "lucide-react";

import { FUEL_TYPES, ROAD_CONDITIONS, computeRoadTripCost } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";

const DEFAULTS = {
  oneWayKm: "500",
  returnTrip: true,
  mileage: "16",
  fuelType: "petrol",
  fuelPrice: "105",
  condition: "highway",
  acOn: true,
  roofCarrier: false,
  tankCapacity: "42",
  tolls: "1200",
  miscCost: "0",
  travellers: "4",
  avgSpeed: "60",
  breakMinutes: "60",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CHECK_LABEL =
  "flex min-h-11 items-center gap-3 text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const toggle = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.checked }));

  const result = useMemo(() => computeRoadTripCost(form), [form]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Road Trip Fuel Cost Calculator",
      `Distance: ${NUM1.format(result.totalKm)} km ${result.returnTrip ? "(return trip)" : "(one way)"}`,
      `Effective mileage: ${NUM2.format(result.effectiveMileage)} ${result.mileageLabel} — ${result.conditionLabel}`,
      `${result.fuelLabel} needed: ${NUM2.format(result.fuelUnits)} ${result.fuelUnitShort}`,
      `Fuel cost: ${INR.format(result.fuelCost)}`,
      `Tolls: ${INR.format(result.tolls)} · Other: ${INR.format(result.miscCost)}`,
      `Trip total: ${INR.format(result.tripCost)} — ${INR.format(result.perHead)} per person across ${result.travellers}`,
      `Refuel stops: ${result.refuelStops} · Driving time: ${NUM1.format(result.drivingHours)} h`,
      `CO2: ${NUM1.format(result.co2Kg)} kg (${NUM1.format(result.co2PerHeadKg)} kg per person)`,
    ].join("\n");
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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const rows = [
    ["Total distance", hasError ? DASH : `${NUM1.format(result.totalKm)} km`],
    ["Rated mileage", hasError ? DASH : `${NUM2.format(result.ratedMileage)} ${result.mileageLabel}`],
    ["Road conditions", hasError ? DASH : `${result.conditionLabel} (× ${result.conditionFactor})`],
    ["Air conditioning", hasError ? DASH : form.acOn ? `On (× ${result.acFactor})` : "Off"],
    ["Roof carrier", hasError ? DASH : form.roofCarrier ? `Fitted (× ${result.roofFactor})` : "None"],
    ["Effective mileage", hasError ? DASH : `${NUM2.format(result.effectiveMileage)} ${result.mileageLabel}`],
    ["Fuel needed", hasError ? DASH : `${NUM2.format(result.fuelUnits)} ${result.fuelUnitShort} of ${result.fuelLabel.toLowerCase()}`],
    ["Fuel cost", hasError ? DASH : INR.format(result.fuelCost)],
    ["Tolls", hasError ? DASH : INR.format(result.tolls)],
    ["Parking and other costs", hasError ? DASH : INR.format(result.miscCost)],
    ["Cost per km (all in)", hasError ? DASH : INR2.format(result.costPerKm)],
    ["Cost per km (fuel only)", hasError ? DASH : INR2.format(result.fuelCostPerKm)],
    ["Usable range per tank", hasError ? DASH : `${INT.format(result.rangePerTank)} km on ${NUM1.format(result.usableTank)} ${result.fuelUnitShort}`],
    ["Refuel stops needed", hasError ? DASH : `${result.refuelStops}`],
    ["Driving time", hasError ? DASH : `${NUM1.format(result.drivingHours)} h`],
    ["Total time with breaks", hasError ? DASH : `${NUM1.format(result.totalHours)} h`],
    ["CO2 for the trip", hasError ? DASH : `${NUM1.format(result.co2Kg)} kg · ${NUM1.format(result.co2PerHeadKg)} kg per person`],
  ];

  const field = (id, label, key, step, min, hint) => (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={form[key]}
        onChange={set(key)}
      />
      {hint ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );

  const activeFuel = FUEL_TYPES.find((option) => option.value === form.fuelType) || FUEL_TYPES[0];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Route className="h-4 w-4" aria-hidden="true" />
          Fuel &amp; mileage
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Road Trip Fuel Cost Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Total fuel, tolls, refuel stops and cost per head — with your rated mileage adjusted for
          the roads you will actually drive, the AC and anything strapped to the roof.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The trip</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("trip-distance", "One-way distance (km)", "oneWayKm", "10", "0")}
          {field("trip-people", "People sharing the cost", "travellers", "1", "1")}
          <div className="sm:col-span-2">
            <label className={CHECK_LABEL} htmlFor="trip-return">
              <input
                id="trip-return"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={form.returnTrip}
                onChange={toggle("returnTrip")}
              />
              Driving back as well (double the distance)
            </label>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The vehicle</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="trip-fuel">
              Fuel
            </label>
            <select
              id="trip-fuel"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.fuelType}
              onChange={set("fuelType")}
            >
              {FUEL_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {field("trip-mileage", `Rated mileage (${activeFuel.mileageLabel})`, "mileage", "0.5", "0")}
          {field("trip-price", `Fuel price (INR per ${activeFuel.unit})`, "fuelPrice", "0.5", "0")}
          {field("trip-tank", `Tank capacity (${activeFuel.unitShort})`, "tankCapacity", "1", "0")}
          <div>
            <label className={LABEL_CLASS} htmlFor="trip-condition">
              Road conditions
            </label>
            <select
              id="trip-condition"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.condition}
              onChange={set("condition")}
            >
              {ROAD_CONDITIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className={CHECK_LABEL} htmlFor="trip-ac">
              <input
                id="trip-ac"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={form.acOn}
                onChange={toggle("acOn")}
              />
              AC running most of the way
            </label>
            <label className={CHECK_LABEL} htmlFor="trip-roof">
              <input
                id="trip-roof"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={form.roofCarrier}
                onChange={toggle("roofCarrier")}
              />
              Loaded roof carrier fitted
            </label>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Other costs and timing</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {field("trip-tolls", "Tolls, both ways (INR)", "tolls", "50", "0")}
          {field("trip-misc", "Parking, permits, other (INR)", "miscCost", "50", "0")}
          {field("trip-speed", "Average moving speed (km/h)", "avgSpeed", "5", "1")}
          {field("trip-breaks", "Planned break time (minutes)", "breakMinutes", "15", "0")}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Trip total
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : INR.format(result.tripCost)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a total."
                : `${INR.format(result.perHead)} each across ${result.travellers} ${result.travellers === 1 ? "traveller" : "travellers"} for ${NUM1.format(result.totalKm)} km`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy road trip cost result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.notes.length > 0 && (
        <ul className="mt-4 space-y-2">
          {result.notes.map((note) => (
            <li
              key={note}
              className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {note}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Fuel and tolls only — food, stays and any hired-car charges are separate. Pump prices vary
        by state, so check the price at your starting point, and keep a margin: detours and traffic
        routinely add 10% to a mapped distance.
      </p>
    </main>
  );
}
