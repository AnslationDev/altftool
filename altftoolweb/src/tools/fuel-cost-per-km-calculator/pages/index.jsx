"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Fuel, RotateCcw } from "lucide-react";

import {
  DEFAULT_DEPRECIATION_PERCENT,
  FUEL_TYPES,
  compareFuel,
  fuelTypeById,
  runningCost,
} from "../lib";

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
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  fuelType: "petrol",
  price: "105",
  efficiency: "18",
  monthlyKm: "1000",
  service: "12000",
  insurance: "15000",
  other: "3000",
  vehicleValue: "1000000",
  depreciation: String(DEFAULT_DEPRECIATION_PERCENT),
  tripKm: "250",
  altType: "cng",
  altPrice: "90",
  altEfficiency: "26",
  conversionCost: "60000",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [fuelType, setFuelType] = useState(DEFAULTS.fuelType);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [efficiency, setEfficiency] = useState(DEFAULTS.efficiency);
  const [monthlyKm, setMonthlyKm] = useState(DEFAULTS.monthlyKm);
  const [service, setService] = useState(DEFAULTS.service);
  const [insurance, setInsurance] = useState(DEFAULTS.insurance);
  const [other, setOther] = useState(DEFAULTS.other);
  const [vehicleValue, setVehicleValue] = useState(DEFAULTS.vehicleValue);
  const [depreciation, setDepreciation] = useState(DEFAULTS.depreciation);
  const [tripKm, setTripKm] = useState(DEFAULTS.tripKm);
  const [altType, setAltType] = useState(DEFAULTS.altType);
  const [altPrice, setAltPrice] = useState(DEFAULTS.altPrice);
  const [altEfficiency, setAltEfficiency] = useState(DEFAULTS.altEfficiency);
  const [conversionCost, setConversionCost] = useState(DEFAULTS.conversionCost);
  const [copied, setCopied] = useState(false);

  const type = fuelTypeById(fuelType);
  const alt = fuelTypeById(altType);

  const result = useMemo(
    () =>
      runningCost({
        pricePerUnit: toNumber(price),
        efficiency: toNumber(efficiency),
        monthlyKm: toNumber(monthlyKm),
        annualService: toNumber(service),
        annualInsurance: toNumber(insurance),
        annualOther: toNumber(other),
        vehicleValue: toNumber(vehicleValue),
        depreciationPercent: toNumber(depreciation),
        tripKm: toNumber(tripKm),
      }),
    [price, efficiency, monthlyKm, service, insurance, other, vehicleValue, depreciation, tripKm],
  );

  const ok = !result.error;

  const comparison = useMemo(() => {
    if (!ok) return null;
    return compareFuel(
      result.fuelPerKm,
      toNumber(altPrice),
      toNumber(altEfficiency),
      toNumber(monthlyKm),
      toNumber(conversionCost),
    );
  }, [ok, result, altPrice, altEfficiency, monthlyKm, conversionCost]);

  const compareOk = comparison && !comparison.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Fuel cost per kilometre",
      `${type.label} at ${money2(toNumber(price))} per ${type.unit}, ${efficiency} km per ${type.unit}`,
      `Fuel cost: ${money2(result.fuelPerKm)} per km`,
      `Standing costs: ${money2(result.standingPerKm)} per km`,
      `True running cost: ${money2(result.totalPerKm)} per km`,
      `Monthly fuel bill: ${money(result.monthlyFuel)}`,
      `Annual all-in cost: ${money(result.annualTotal)}`,
      compareOk && comparison.cheaper
        ? `Switching to ${alt.label} saves ${money2(comparison.savingPerKm)} per km, ${money(comparison.annualSaving)} a year`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result, type, price, efficiency, compareOk, comparison, alt]);

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
    setFuelType(DEFAULTS.fuelType);
    setPrice(DEFAULTS.price);
    setEfficiency(DEFAULTS.efficiency);
    setMonthlyKm(DEFAULTS.monthlyKm);
    setService(DEFAULTS.service);
    setInsurance(DEFAULTS.insurance);
    setOther(DEFAULTS.other);
    setVehicleValue(DEFAULTS.vehicleValue);
    setDepreciation(DEFAULTS.depreciation);
    setTripKm(DEFAULTS.tripKm);
    setAltType(DEFAULTS.altType);
    setAltPrice(DEFAULTS.altPrice);
    setAltEfficiency(DEFAULTS.altEfficiency);
    setConversionCost(DEFAULTS.conversionCost);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Fuel className="h-4 w-4" aria-hidden="true" />
          Running cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Fuel Cost Per Kilometre Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fuel is only part of what a kilometre costs. Add servicing, insurance and the value your
          vehicle loses each year to see the real number — then test a CNG kit or an EV switch.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your vehicle</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-type">
              Fuel
            </label>
            <select
              id="fc-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fuelType}
              onChange={(event) => setFuelType(event.target.value)}
            >
              {FUEL_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-price">
              {type.priceLabel} (INR)
            </label>
            <input
              id="fc-price"
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
            <label className={LABEL_CLASS} htmlFor="fc-efficiency">
              {type.efficiencyLabel}
            </label>
            <input
              id="fc-efficiency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={efficiency}
              onChange={(event) => setEfficiency(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-monthly">
              Kilometres driven a month
            </label>
            <input
              id="fc-monthly"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={monthlyKm}
              onChange={(event) => setMonthlyKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-trip">
              A trip you want costed (km)
            </label>
            <input
              id="fc-trip"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={tripKm}
              onChange={(event) => setTripKm(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Standing costs a year</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-service">
              Servicing, tyres and consumables (INR)
            </label>
            <input
              id="fc-service"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={service}
              onChange={(event) => setService(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-insurance">
              Insurance premium (INR)
            </label>
            <input
              id="fc-insurance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={insurance}
              onChange={(event) => setInsurance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-other">
              Parking, tolls, road tax and the rest (INR)
            </label>
            <input
              id="fc-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={other}
              onChange={(event) => setOther(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-value">
              Current value of the vehicle (INR)
            </label>
            <input
              id="fc-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={vehicleValue}
              onChange={(event) => setVehicleValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-dep">
              Value lost a year (%)
            </label>
            <input
              id="fc-dep"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={depreciation}
              onChange={(event) => setDepreciation(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Set to 0 to see the cash cost only
            </p>
          </div>
        </div>
      </section>

      {result.error ? (
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
              True cost of one kilometre
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money2(result.totalPerKm) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${money2(result.fuelPerKm)} of fuel plus ${money2(result.standingPerKm)} of standing cost`
                : "Correct the inputs above to see your running cost."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy fuel cost per kilometre result"
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

        {ok ? (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Fuel is ${num(result.fuelShareOfTotal)} percent of the cost of a kilometre`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.fuelShareOfTotal))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Fuel {num(result.fuelShareOfTotal)}% · standing costs {num(100 - result.fuelShareOfTotal)}%
            </p>
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Fuel cost per km", ok ? money2(result.fuelPerKm) : DASH],
            ["Standing cost per km", ok ? money2(result.standingPerKm) : DASH],
            [`${type.unit === "kWh" ? "Units" : type.unit === "kg" ? "Kilograms" : "Litres"} used a month`, ok ? num(result.unitsPerMonth) : DASH],
            ["Monthly fuel bill", ok ? money(result.monthlyFuel) : DASH],
            ["Monthly all-in cost", ok ? money(result.monthlyTotal) : DASH],
            ["Annual fuel bill", ok ? money(result.annualFuel) : DASH],
            ["Annual standing costs", ok ? money(result.annualStanding) : DASH],
            ["Annual all-in cost", ok ? money(result.annualTotal) : DASH],
            ["Kilometres a year", ok ? num(result.annualKm) : DASH],
            [`Fuel for the ${tripKm || 0} km trip`, ok ? money(result.tripFuelCost) : DASH],
            [`All-in cost of that trip`, ok ? money(result.tripTotalCost) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Would switching fuel pay off?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-alt-type">
              Switch to
            </label>
            <select
              id="fc-alt-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={altType}
              onChange={(event) => setAltType(event.target.value)}
            >
              {FUEL_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-alt-price">
              {alt.priceLabel} (INR)
            </label>
            <input
              id="fc-alt-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={altPrice}
              onChange={(event) => setAltPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-alt-eff">
              {alt.efficiencyLabel}
            </label>
            <input
              id="fc-alt-eff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={altEfficiency}
              onChange={(event) => setAltEfficiency(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-conversion">
              Kit cost or price premium to recover (INR)
            </label>
            <input
              id="fc-conversion"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5000"
              value={conversionCost}
              onChange={(event) => setConversionCost(event.target.value)}
            />
          </div>
        </div>

        {comparison && comparison.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {comparison.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [`${alt.label} fuel cost per km`, compareOk ? money2(comparison.altPerKm) : DASH],
            ["Saving per km", compareOk ? money2(comparison.savingPerKm) : DASH],
            ["Saving a month", compareOk ? money(comparison.monthlySaving) : DASH],
            ["Saving a year", compareOk ? money(comparison.annualSaving) : DASH],
            [
              "Kilometres to recover the cost",
              compareOk && comparison.breakEvenKm !== null ? `${num(comparison.breakEvenKm)} km` : DASH,
            ],
            [
              "Months to recover the cost",
              compareOk && comparison.breakEvenMonths !== null
                ? `${num(comparison.breakEvenMonths)} months`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {compareOk && !comparison.cheaper ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {alt.label} costs more per kilometre than what you run today, so the switch never pays
            back on fuel alone.
          </p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        An estimate for planning, not a quote. Real mileage varies with traffic, load, air
        conditioning and tyre pressure, and a CNG kit reduces boot space and needs a three-yearly
        cylinder test. Use your own logbook figures rather than the brochure number for the most
        honest answer.
      </p>
    </main>
  );
}
