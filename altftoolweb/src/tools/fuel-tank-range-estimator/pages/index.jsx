"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Fuel, RotateCcw } from "lucide-react";
import { CONDITION_PRESETS, GAUGE_POSITIONS, estimateRange, suggestedReserveLitres } from "../lib";

const DEFAULTS = {
  tank: "42",
  gauge: "25",
  mileage: "18",
  factor: "1",
  reserve: "5",
  trip: "150",
  price: "105",
  speed: "40",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(value) ? value : NaN;
};

const fmt = (value, decimals = 1) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

export default function ToolHome() {
  const [tank, setTank] = useState(DEFAULTS.tank);
  const [gauge, setGauge] = useState(DEFAULTS.gauge);
  const [mileage, setMileage] = useState(DEFAULTS.mileage);
  const [factor, setFactor] = useState(DEFAULTS.factor);
  const [reserve, setReserve] = useState(DEFAULTS.reserve);
  const [trip, setTrip] = useState(DEFAULTS.trip);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateRange({
        tankLitres: toNumber(tank),
        gaugePercent: toNumber(gauge),
        mileageKmpl: toNumber(mileage),
        conditionFactor: toNumber(factor),
        reserveLitres: toNumber(reserve),
        tripDistanceKm: toNumber(trip),
        fuelPricePerLitre: toNumber(price),
        averageSpeedKmph: toNumber(speed),
      }),
    [tank, gauge, mileage, factor, reserve, trip, price, speed],
  );

  const error = result.error || "";

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "Fuel tank range estimate",
      `Tank: ${fmt(toNumber(tank))} L at ${fmt(toNumber(gauge))}% = ${fmt(result.fuelInTank, 2)} L on board`,
      `Reserve kept: ${fmt(toNumber(reserve), 2)} L`,
      `Effective mileage: ${fmt(result.effectiveKmpl, 2)} km/l`,
      `Safe range (before reserve): ${fmt(result.safeRangeKm)} km`,
      `Range if run to dry: ${fmt(result.rangeToDryKm)} km`,
      `Fuel for a ${fmt(toNumber(trip))} km trip: ${fmt(result.tripFuelNeeded, 2)} L (${money(result.tripCost)})`,
      `Full tank now costs: ${money(result.costToFillTank)}`,
    ].join("\n");
  }, [error, tank, gauge, reserve, trip, result]);

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
    setTank(DEFAULTS.tank);
    setGauge(DEFAULTS.gauge);
    setMileage(DEFAULTS.mileage);
    setFactor(DEFAULTS.factor);
    setReserve(DEFAULTS.reserve);
    setTrip(DEFAULTS.trip);
    setPrice(DEFAULTS.price);
    setSpeed(DEFAULTS.speed);
    setCopied(false);
  };

  const suggestReserve = () => {
    const suggestion = suggestedReserveLitres(toNumber(tank));
    if (suggestion === null) return;
    setReserve(String(suggestion));
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Fuel className="h-4 w-4" aria-hidden="true" />
          Range check
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Fuel Tank Range Estimator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Read the gauge, enter your tank size and real mileage, and see how far you can still drive
          before you have to fill — with a reserve held back so you are not counting on fumes.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fuel-tank">
              Tank capacity (litres)
            </label>
            <input
              id="fuel-tank"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.5"
              value={tank}
              onChange={(event) => setTank(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fuel-gauge">
              Gauge reading (% of tank)
            </label>
            <input
              id="fuel-gauge"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={gauge}
              onChange={(event) => setGauge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fuel-mileage">
              Rated mileage (km per litre)
            </label>
            <input
              id="fuel-mileage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              value={mileage}
              onChange={(event) => setMileage(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fuel-factor">
              Condition factor (1 = as rated)
            </label>
            <input
              id="fuel-factor"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.3"
              max="1.5"
              step="0.05"
              value={factor}
              onChange={(event) => setFactor(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fuel-reserve">
              Reserve to keep (litres)
            </label>
            <input
              id="fuel-reserve"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={reserve}
              onChange={(event) => setReserve(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fuel-trip">
              Trip you want to make (km)
            </label>
            <input
              id="fuel-trip"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={trip}
              onChange={(event) => setTrip(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fuel-price">
              Fuel price (INR per litre)
            </label>
            <input
              id="fuel-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fuel-speed">
              Average speed (km/h, 0 to skip)
            </label>
            <input
              id="fuel-speed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="200"
              step="5"
              value={speed}
              onChange={(event) => setSpeed(event.target.value)}
            />
          </div>
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Gauge shortcuts
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {GAUGE_POSITIONS.map((position) => (
            <button
              key={position.id}
              type="button"
              onClick={() => setGauge(String(position.fraction * 100))}
              className={CHIP_BTN}
            >
              {position.label}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Driving conditions
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CONDITION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setFactor(String(preset.factor))}
              className={CHIP_BTN}
            >
              {preset.label}
            </button>
          ))}
          <button type="button" onClick={suggestReserve} className={CHIP_BTN}>
            Reserve = warning light
          </button>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Range before you touch the reserve
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? DASH : `${fmt(result.safeRangeKm)} km`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "Fix the highlighted input to see a result."
                : `${fmt(result.fuelInTank, 2)} L on board · ${fmt(result.rangeToDryKm)} km if run to dry`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy fuel range estimate"
              className={GHOST_BTN}
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

        {!error && result.intoReserve ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            You are already at or below the reserve you set — treat every kilometre from here as
            borrowed and fill at the first pump.
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Fuel currently in the tank", error ? DASH : `${fmt(result.fuelInTank, 2)} L`],
            ["Usable fuel above the reserve", error ? DASH : `${fmt(result.usableFuel, 2)} L`],
            ["Effective mileage after conditions", error ? DASH : `${fmt(result.effectiveKmpl, 2)} km/l`],
            ["Range if you run the tank dry", error ? DASH : `${fmt(result.rangeToDryKm)} km`],
            [
              "Driving time left at your average speed",
              error || result.hoursOfDriving === null ? DASH : `${fmt(result.hoursOfDriving, 1)} h`,
            ],
            ["Fuel needed for the trip", error ? DASH : `${fmt(result.tripFuelNeeded, 2)} L`],
            ["Cost of that trip's fuel", error ? DASH : money(result.tripCost)],
            ["Litres to brim the tank now", error ? DASH : `${fmt(result.litresToFillTank, 2)} L`],
            ["Cost to brim the tank now", error ? DASH : money(result.costToFillTank)],
          ].map(([label, shown]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{shown}</dd>
            </div>
          ))}
        </dl>

        {!error && result.canMakeTrip !== null ? (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              result.canMakeTrip
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {result.canMakeTrip
              ? `You can cover ${fmt(toNumber(trip))} km and still arrive with your reserve intact.`
              : `Short by ${fmt(result.shortfallLitres, 2)} L — add about ${money(result.shortfallCost)} of fuel before you set off.`}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Why the gauge is not linear</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A fuel sender is a float on an arm inside a tank that is rarely a neat cuboid, so the top
          half of the needle usually lasts longer than the bottom half. Treat the gauge percentage as
          an approximation, keep a reserve, and after two or three fills replace the rated mileage
          here with your own tank-to-tank average — that single change makes the estimate far more
          accurate than any assumption about driving style.
        </p>
      </section>
    </main>
  );
}
