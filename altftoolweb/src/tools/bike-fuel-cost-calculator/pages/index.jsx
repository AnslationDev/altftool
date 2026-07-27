"use client";

import { useMemo, useState } from "react";
import { Bike, Check, Copy, RotateCcw } from "lucide-react";

import { compareBikeMileage, computeBikeFuelCost } from "../lib";

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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : "—");
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");
const num2 = (value) => (Number.isFinite(value) ? NUM2.format(value) : "—");

const DEFAULTS = {
  tripKm: "12",
  roundTrip: true,
  tripsPerWeek: "6",
  mileageKmpl: "45",
  fuelPrice: "105",
  tankLitres: "12",
  altMileage: "30",
};

const PRESETS = [
  { label: "100–110cc commuter", mileage: "60", tank: "10" },
  { label: "125cc scooter", mileage: "45", tank: "5.5" },
  { label: "150–200cc", mileage: "40", tank: "12" },
  { label: "350cc cruiser", mileage: "32", tank: "13" },
];

const INPUT_CLASS =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [tripKm, setTripKm] = useState(DEFAULTS.tripKm);
  const [roundTrip, setRoundTrip] = useState(DEFAULTS.roundTrip);
  const [tripsPerWeek, setTripsPerWeek] = useState(DEFAULTS.tripsPerWeek);
  const [mileageKmpl, setMileageKmpl] = useState(DEFAULTS.mileageKmpl);
  const [fuelPrice, setFuelPrice] = useState(DEFAULTS.fuelPrice);
  const [tankLitres, setTankLitres] = useState(DEFAULTS.tankLitres);
  const [altMileage, setAltMileage] = useState(DEFAULTS.altMileage);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeBikeFuelCost({
        tripKm: toNumber(tripKm),
        roundTrip,
        tripsPerWeek: toNumber(tripsPerWeek),
        mileageKmpl: toNumber(mileageKmpl),
        fuelPrice: toNumber(fuelPrice),
        tankLitres: toNumber(tankLitres),
      }),
    [tripKm, roundTrip, tripsPerWeek, mileageKmpl, fuelPrice, tankLitres],
  );

  const error = result.error ?? null;
  const view = error ? null : result;

  const comparison = useMemo(() => {
    if (!view) return null;
    const outcome = compareBikeMileage({
      monthlyKm: view.monthlyKm,
      fuelPrice: toNumber(fuelPrice),
      altMileageKmpl: toNumber(altMileage),
    });
    return outcome.error ? null : outcome;
  }, [view, fuelPrice, altMileage]);

  const summary = useMemo(() => {
    if (!view) return "";
    return [
      "Bike Fuel Cost",
      `Ride distance: ${num(view.tripDistance)} km (${view.legs === 2 ? "return" : "one way"})`,
      `Fuel per ride: ${num2(view.litresPerTrip)} litres — ${money2(view.costPerTrip)}`,
      `Distance per month: ${num(view.monthlyKm)} km`,
      `Fuel cost per month: ${money(view.monthlyCost)}`,
      `Fuel cost per year: ${money(view.yearlyCost)}`,
      `Cost per km: ${money2(view.costPerKm)}`,
      `Tank range: ${num(view.tankRangeKm)} km (full tank ${money(view.fullTankCost)})`,
      `Refills per month: ${num2(view.refillsPerMonth)}`,
    ].join("\n");
  }, [view]);

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
    setTripKm(DEFAULTS.tripKm);
    setRoundTrip(DEFAULTS.roundTrip);
    setTripsPerWeek(DEFAULTS.tripsPerWeek);
    setMileageKmpl(DEFAULTS.mileageKmpl);
    setFuelPrice(DEFAULTS.fuelPrice);
    setTankLitres(DEFAULTS.tankLitres);
    setAltMileage(DEFAULTS.altMileage);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Bike className="h-4 w-4" aria-hidden="true" />
          Two-wheeler
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bike Fuel Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out what a ride costs in petrol, what your bike burns in a month, how far a full tank
          takes you and how often you will be back at the pump.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bike-trip">
              Ride distance one way (km)
            </label>
            <input
              id="bike-trip"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={tripKm}
              onChange={(event) => setTripKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bike-trips">
              Rides per week
            </label>
            <input
              id="bike-trips"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={tripsPerWeek}
              onChange={(event) => setTripsPerWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bike-mileage">
              Mileage (km per litre)
            </label>
            <input
              id="bike-mileage"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={mileageKmpl}
              onChange={(event) => setMileageKmpl(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bike-price">
              Petrol price (per litre)
            </label>
            <input
              id="bike-price"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={fuelPrice}
              onChange={(event) => setFuelPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bike-tank">
              Tank capacity (litres)
            </label>
            <input
              id="bike-tank"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={tankLitres}
              onChange={(event) => setTankLitres(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <div className="flex items-center gap-3 pb-1">
              <input
                id="bike-roundtrip"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                checked={roundTrip}
                onChange={(event) => setRoundTrip(event.target.checked)}
              />
              <label className="text-sm font-medium" htmlFor="bike-roundtrip">
                Return ride (there and back)
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={CHIP_BTN}
              onClick={() => {
                setMileageKmpl(preset.mileage);
                setTankLitres(preset.tank);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Petrol cost per month
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {view ? money(view.monthlyCost) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {view
                ? `${num(view.monthlyKm)} km a month at ${num(view.monthlyLitres)} litres`
                : "Fix the highlighted input to see your figures."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy bike fuel cost result"
              className={GHOST_BTN}
              disabled={!view}
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
              aria-label="Reset all bike fuel inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Distance per ride", view ? `${num(view.tripDistance)} km` : "—"],
            ["Petrol per ride", view ? `${num2(view.litresPerTrip)} litres` : "—"],
            ["Cost per ride", view ? money2(view.costPerTrip) : "—"],
            ["Cost per km", view ? money2(view.costPerKm) : "—"],
            ["Distance per week", view ? `${num(view.weeklyKm)} km` : "—"],
            ["Cost per week", view ? money(view.weeklyCost) : "—"],
            ["Distance per year", view ? `${num(view.yearlyKm)} km` : "—"],
            ["Petrol cost per year", view ? money(view.yearlyCost) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Tank and refills</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              ["Range on a full tank", view ? `${num(view.tankRangeKm)} km` : "—"],
              ["Cost of a full tank", view ? money(view.fullTankCost) : "—"],
              ["Refills per month", view ? num2(view.refillsPerMonth) : "—"],
              ["Days between refills", view ? `${num(view.daysPerRefill)} days` : "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Compare another bike</h2>
          <div className="mt-3">
            <label className={LABEL_CLASS} htmlFor="bike-alt-mileage">
              Its mileage (km per litre)
            </label>
            <input
              id="bike-alt-mileage"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={altMileage}
              onChange={(event) => setAltMileage(event.target.value)}
            />
          </div>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              ["Petrol per month", comparison ? `${num(comparison.monthlyLitres)} litres` : "—"],
              ["Cost per month", comparison ? money(comparison.monthlyCost) : "—"],
              ["Cost per year", comparison ? money(comparison.yearlyCost) : "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Petrol cost only. Real mileage drops with pillion weight, heavy traffic, under-inflated
        tyres and a stretched chain, so use the figure your own odometer gives you.
      </p>
    </main>
  );
}
