"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Route, RotateCcw } from "lucide-react";

import { computeCommuteCost, compareMileage } from "../lib";

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

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : "—");
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : "—");

const DEFAULTS = {
  oneWayKm: "18",
  roundTrip: true,
  daysPerWeek: "5",
  mileageKmpl: "16",
  fuelPrice: "105",
  tollPerDay: "0",
  parkingPerDay: "0",
  altMileage: "20",
};

const INPUT_CLASS =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [oneWayKm, setOneWayKm] = useState(DEFAULTS.oneWayKm);
  const [roundTrip, setRoundTrip] = useState(DEFAULTS.roundTrip);
  const [daysPerWeek, setDaysPerWeek] = useState(DEFAULTS.daysPerWeek);
  const [mileageKmpl, setMileageKmpl] = useState(DEFAULTS.mileageKmpl);
  const [fuelPrice, setFuelPrice] = useState(DEFAULTS.fuelPrice);
  const [tollPerDay, setTollPerDay] = useState(DEFAULTS.tollPerDay);
  const [parkingPerDay, setParkingPerDay] = useState(DEFAULTS.parkingPerDay);
  const [altMileage, setAltMileage] = useState(DEFAULTS.altMileage);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeCommuteCost({
        oneWayKm: toNumber(oneWayKm),
        roundTrip,
        daysPerWeek: toNumber(daysPerWeek),
        mileageKmpl: toNumber(mileageKmpl),
        fuelPrice: toNumber(fuelPrice),
        tollPerDay: toNumber(tollPerDay),
        parkingPerDay: toNumber(parkingPerDay),
      }),
    [oneWayKm, roundTrip, daysPerWeek, mileageKmpl, fuelPrice, tollPerDay, parkingPerDay],
  );

  const error = result.error ?? null;
  const view = error ? null : result;

  const comparison = useMemo(() => {
    if (!view) return null;
    const outcome = compareMileage({ base: view, altMileageKmpl: toNumber(altMileage) });
    return outcome.error ? null : outcome;
  }, [view, altMileage]);

  const summary = useMemo(() => {
    if (!view) return "";
    return [
      "Daily Commute Fuel Cost",
      `Distance per day: ${num(view.dailyKm)} km (${view.tripsPerDay === 2 ? "round trip" : "one way"})`,
      `Commute days: ${num(view.daysPerMonth)} per month`,
      `Fuel used: ${num(view.monthlyLitres)} litres per month`,
      `Fuel cost: ${money(view.monthlyFuelCost)} per month`,
      `Toll + parking: ${money(view.monthlyExtras)} per month`,
      `Total per month: ${money(view.monthlyTotal)}`,
      `Total per year: ${money(view.yearlyTotal)}`,
      `Cost per km: ${money2(view.totalCostPerKm)}`,
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
    setOneWayKm(DEFAULTS.oneWayKm);
    setRoundTrip(DEFAULTS.roundTrip);
    setDaysPerWeek(DEFAULTS.daysPerWeek);
    setMileageKmpl(DEFAULTS.mileageKmpl);
    setFuelPrice(DEFAULTS.fuelPrice);
    setTollPerDay(DEFAULTS.tollPerDay);
    setParkingPerDay(DEFAULTS.parkingPerDay);
    setAltMileage(DEFAULTS.altMileage);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Route className="h-4 w-4" aria-hidden="true" />
          Fuel &amp; mileage
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Daily Commute Fuel Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter your one-way distance, weekly commute days, real mileage and pump price to see what
          getting to work actually costs each month and each year.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="commute-distance">
              One-way distance (km)
            </label>
            <input
              id="commute-distance"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={oneWayKm}
              onChange={(event) => setOneWayKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="commute-days">
              Commute days per week
            </label>
            <input
              id="commute-days"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="1"
              max="7"
              step="0.5"
              value={daysPerWeek}
              onChange={(event) => setDaysPerWeek(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="commute-mileage">
              Vehicle mileage (km per litre)
            </label>
            <input
              id="commute-mileage"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={mileageKmpl}
              onChange={(event) => setMileageKmpl(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="commute-price">
              Fuel price (per litre)
            </label>
            <input
              id="commute-price"
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
            <label className={LABEL_CLASS} htmlFor="commute-toll">
              Toll per commute day
            </label>
            <input
              id="commute-toll"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={tollPerDay}
              onChange={(event) => setTollPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="commute-parking">
              Parking per commute day
            </label>
            <input
              id="commute-parking"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={parkingPerDay}
              onChange={(event) => setParkingPerDay(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input
            id="commute-roundtrip"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={roundTrip}
            onChange={(event) => setRoundTrip(event.target.checked)}
          />
          <label className="text-sm font-medium" htmlFor="commute-roundtrip">
            I drive back the same way (round trip)
          </label>
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
              Commute cost per month
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {view ? money(view.monthlyTotal) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {view
                ? `${num(view.dailyKm)} km a day · ${num(view.daysPerMonth)} commute days a month`
                : "Fix the highlighted input to see your figures."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy commute fuel cost result"
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
              aria-label="Reset all commute inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Distance driven per month", view ? `${num(view.monthlyKm)} km` : "—"],
            ["Fuel burnt per month", view ? `${num(view.monthlyLitres)} litres` : "—"],
            ["Fuel cost per month", view ? money(view.monthlyFuelCost) : "—"],
            ["Toll + parking per month", view ? money(view.monthlyExtras) : "—"],
            ["Cost per commute day", view ? money2(view.dailyTotal) : "—"],
            ["All-in cost per km", view ? money2(view.totalCostPerKm) : "—"],
            ["Fuel cost per km", view ? money2(view.fuelPerKm) : "—"],
            ["Distance driven per year", view ? `${num(view.yearlyKm)} km` : "—"],
            ["Total cost per year", view ? money(view.yearlyTotal) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What if mileage improved?</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Same route, same days — only the km/l changes.
        </p>
        <div className="mt-3 max-w-xs">
          <label className={LABEL_CLASS} htmlFor="commute-alt-mileage">
            Comparison mileage (km per litre)
          </label>
          <input
            id="commute-alt-mileage"
            className={INPUT_CLASS}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            value={altMileage}
            onChange={(event) => setAltMileage(event.target.value)}
          />
        </div>
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Fuel cost per month at that mileage", comparison ? money(comparison.altMonthlyFuelCost) : "—"],
            ["Saving per month", comparison ? money(comparison.monthlySaving) : "—"],
            ["Saving per year", comparison ? money(comparison.yearlySaving) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Fuel-and-toll running cost only. Insurance, servicing, tyres and depreciation are separate
        ownership costs and are not included here.
      </p>
    </main>
  );
}
