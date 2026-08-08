"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, PiggyBank, RotateCcw } from "lucide-react";
import {
  DEFAULT_BIKE_COST_PER_KM,
  KG_CO2_PER_TREE_YEAR,
  MODES,
  computeCommuteSavings,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const N0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");
const n1 = (value) => (Number.isFinite(value) ? N1.format(value) : "—");
const n0 = (value) => (Number.isFinite(value) ? N0.format(value) : "—");

const DEFAULT_MODE = "petrolBike";

const DEFAULTS = {
  oneWayKm: "8",
  daysPerMonth: "22",
  mode: DEFAULT_MODE,
  efficiency: String(MODES[DEFAULT_MODE].defaultEfficiency),
  fuelPrice: String(MODES[DEFAULT_MODE].defaultPrice),
  parkingPerDay: "20",
  tollsPerDay: "0",
  maintPerKm: String(MODES[DEFAULT_MODE].defaultMaintPerKm),
  bicycleCost: "25000",
  bicycleCostPerKm: String(DEFAULT_BIKE_COST_PER_KM),
  drivingSpeedKmph: "25",
  cyclingSpeedKmph: "16",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [oneWayKm, setOneWayKm] = useState(DEFAULTS.oneWayKm);
  const [daysPerMonth, setDaysPerMonth] = useState(DEFAULTS.daysPerMonth);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [efficiency, setEfficiency] = useState(DEFAULTS.efficiency);
  const [fuelPrice, setFuelPrice] = useState(DEFAULTS.fuelPrice);
  const [parkingPerDay, setParkingPerDay] = useState(DEFAULTS.parkingPerDay);
  const [tollsPerDay, setTollsPerDay] = useState(DEFAULTS.tollsPerDay);
  const [maintPerKm, setMaintPerKm] = useState(DEFAULTS.maintPerKm);
  const [bicycleCost, setBicycleCost] = useState(DEFAULTS.bicycleCost);
  const [bicycleCostPerKm, setBicycleCostPerKm] = useState(DEFAULTS.bicycleCostPerKm);
  const [drivingSpeedKmph, setDrivingSpeedKmph] = useState(DEFAULTS.drivingSpeedKmph);
  const [cyclingSpeedKmph, setCyclingSpeedKmph] = useState(DEFAULTS.cyclingSpeedKmph);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(copyTimeoutRef.current), []);

  const config = MODES[mode] ?? MODES[DEFAULT_MODE];
  const isFare = config.pricing === "perKm";

  const changeMode = (next) => {
    setMode(next);
    const entry = MODES[next];
    if (!entry) return;
    setEfficiency(String(entry.defaultEfficiency));
    setFuelPrice(String(entry.defaultPrice));
    setMaintPerKm(String(entry.defaultMaintPerKm));
  };

  const result = useMemo(
    () =>
      computeCommuteSavings({
        oneWayKm: toNumber(oneWayKm),
        daysPerMonth: toNumber(daysPerMonth),
        mode,
        efficiency: toNumber(efficiency),
        fuelPrice: toNumber(fuelPrice),
        parkingPerDay: parkingPerDay.trim() === "" ? 0 : toNumber(parkingPerDay),
        tollsPerDay: tollsPerDay.trim() === "" ? 0 : toNumber(tollsPerDay),
        maintPerKm: toNumber(maintPerKm),
        bicycleCost: bicycleCost.trim() === "" ? 0 : toNumber(bicycleCost),
        bicycleCostPerKm: toNumber(bicycleCostPerKm),
        drivingSpeedKmph: toNumber(drivingSpeedKmph),
        cyclingSpeedKmph: toNumber(cyclingSpeedKmph),
      }),
    [
      oneWayKm,
      daysPerMonth,
      mode,
      efficiency,
      fuelPrice,
      parkingPerDay,
      tollsPerDay,
      maintPerKm,
      bicycleCost,
      bicycleCostPerKm,
      drivingSpeedKmph,
      cyclingSpeedKmph,
    ],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Cycle Commute Savings",
      `Replacing: ${result.modeLabel}`,
      `${n1(result.kmPerDay)} km a day · ${n0(result.kmPerMonth)} km a month · ${n0(result.kmPerYear)} km a year`,
      `Fuel or fare saved: ${money(result.fuelCostPerMonth)} a month`,
      `Parking saved: ${money(result.parkingPerMonth)} · tolls: ${money(result.tollsPerMonth)}`,
      `Maintenance saved: ${money(result.maintPerMonth)}`,
      `Less bicycle running cost: ${money(result.bicycleRunningPerMonth)}`,
      `Net saving: ${money(result.netPerMonth)} a month, ${money(result.netPerYear)} a year`,
      result.paybackState === "months"
        ? `Bicycle pays for itself in ${n1(result.paybackMonths)} months`
        : result.paybackState === "noCost"
          ? "No bicycle cost to recover"
          : "Bicycle does not pay back at these figures",
      `CO2 avoided: ${n0(result.co2PerYearKg)} kg a year (${n1(result.treesEquivalent)} mature trees)`,
      `Extra time on the bike: ${n0(result.extraMinutesPerDay)} minutes a day`,
    ].join("\n");
  }, [ok, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setOneWayKm(DEFAULTS.oneWayKm);
    setDaysPerMonth(DEFAULTS.daysPerMonth);
    setMode(DEFAULTS.mode);
    setEfficiency(DEFAULTS.efficiency);
    setFuelPrice(DEFAULTS.fuelPrice);
    setParkingPerDay(DEFAULTS.parkingPerDay);
    setTollsPerDay(DEFAULTS.tollsPerDay);
    setMaintPerKm(DEFAULTS.maintPerKm);
    setBicycleCost(DEFAULTS.bicycleCost);
    setBicycleCostPerKm(DEFAULTS.bicycleCostPerKm);
    setDrivingSpeedKmph(DEFAULTS.drivingSpeedKmph);
    setCyclingSpeedKmph(DEFAULTS.cyclingSpeedKmph);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PiggyBank className="h-4 w-4" aria-hidden="true" />
          Commuting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cycle Commute Savings Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add up the fuel, parking, tolls and per-kilometre maintenance you stop paying when you
          cycle to work, subtract what the bicycle costs to run, and see how long it takes to pay
          for itself — with the CO2 you avoid along the way.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-distance">
              One-way distance (km)
            </label>
            <input
              id="cs-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={oneWayKm}
              onChange={(event) => setOneWayKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-days">
              Commuting days a month
            </label>
            <input
              id="cs-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              step="1"
              value={daysPerMonth}
              onChange={(event) => setDaysPerMonth(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cs-mode">
              What you are replacing
            </label>
            <select
              id="cs-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => changeMode(event.target.value)}
            >
              {Object.entries(MODES).map(([key, entry]) => (
                <option key={key} value={key}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          {!isFare ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="cs-eff">
                {config.unitLabel}
              </label>
              <input
                id="cs-eff"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0.1"
                step="0.5"
                value={efficiency}
                onChange={(event) => setEfficiency(event.target.value)}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-price">
              {config.priceLabel} (INR)
            </label>
            <input
              id="cs-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={fuelPrice}
              onChange={(event) => setFuelPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-parking">
              Parking a day (INR)
            </label>
            <input
              id="cs-parking"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={parkingPerDay}
              onChange={(event) => setParkingPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-tolls">
              Tolls or congestion charges a day (INR)
            </label>
            <input
              id="cs-tolls"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={tollsPerDay}
              onChange={(event) => setTollsPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-maint">
              Vehicle maintenance per km (INR)
            </label>
            <input
              id="cs-maint"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={maintPerKm}
              onChange={(event) => setMaintPerKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-bikecost">
              Bicycle purchase cost (INR)
            </label>
            <input
              id="cs-bikecost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={bicycleCost}
              onChange={(event) => setBicycleCost(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-bikekm">
              Bicycle running cost per km (INR)
            </label>
            <input
              id="cs-bikekm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={bicycleCostPerKm}
              onChange={(event) => setBicycleCostPerKm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-drivespeed">
              Average speed driving (km/h)
            </label>
            <input
              id="cs-drivespeed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={drivingSpeedKmph}
              onChange={(event) => setDrivingSpeedKmph(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cs-cyclespeed">
              Average speed cycling (km/h)
            </label>
            <input
              id="cs-cyclespeed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={cyclingSpeedKmph}
              onChange={(event) => setCyclingSpeedKmph(event.target.value)}
            />
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

      <section
        aria-live="polite"
        aria-atomic="true"
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Net saving a year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? money(result.netPerYear) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${money(result.netPerMonth)} a month over ${n0(result.kmPerMonth)} km`
                : "Fix the inputs above to see a result"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy cycle commute savings result"
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
          {[
            [
              isFare ? "Fare saved a month" : "Fuel saved a month",
              ok
                ? isFare
                  ? money(result.fuelCostPerMonth)
                  : `${money(result.fuelCostPerMonth)} (${n1(result.fuelUnitsPerMonth)} ${config.unit})`
                : "—",
            ],
            ["Parking saved a month", ok ? money(result.parkingPerMonth) : "—"],
            ["Tolls saved a month", ok ? money(result.tollsPerMonth) : "—"],
            ["Vehicle maintenance saved a month", ok ? money(result.maintPerMonth) : "—"],
            ["Gross saving a month", ok ? money(result.grossPerMonth) : "—"],
            ["Less bicycle running cost", ok ? `- ${money(result.bicycleRunningPerMonth)}` : "—"],
            ["Net saving a month", ok ? money(result.netPerMonth) : "—"],
            [
              "Bicycle payback",
              ok
                ? result.paybackState === "months"
                  ? `${n1(result.paybackMonths)} months`
                  : result.paybackState === "noCost"
                    ? "No bicycle cost to recover"
                    : "Never at these figures"
                : "—",
            ],
            [
              "Net position after 12 months",
              ok ? money(result.firstYearNet) : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Emissions avoided</h2>
          <p className="mt-2 text-3xl font-semibold text-[var(--success)]">
            {ok ? `${n0(result.co2PerYearKg)} kg` : "—"}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            of CO2 a year — roughly what {ok ? n1(result.treesEquivalent) : "—"} mature trees absorb
            annually at {KG_CO2_PER_TREE_YEAR} kg each.
          </p>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            {ok ? `${n1(result.co2PerMonthKg)} kg a month across ${n0(result.kmPerMonth)} km.` : ""}
          </p>
        </div>
        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Time cost</h2>
          <p className="mt-2 text-3xl font-semibold text-[var(--primary)]">
            {ok
              ? `${result.extraMinutesPerDay >= 0 ? "+" : ""}${n0(result.extraMinutesPerDay)} min`
              : "—"}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            a day compared with driving — {ok ? n0(result.cycleMinutesPerDay) : "—"} minutes cycling
            against {ok ? n0(result.driveMinutesPerDay) : "—"} minutes driving.
          </p>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            In dense traffic the two often converge; adjust both speeds to match your route.
          </p>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Fuel prices, tariffs and maintenance rates change constantly — the defaults are typical
        Indian figures, so replace them with your own. CO2 figures are tank-to-wheel combustion
        emissions and exclude vehicle manufacturing and fuel refining. Informational only, not
        financial advice.
      </p>
    </main>
  );
}
