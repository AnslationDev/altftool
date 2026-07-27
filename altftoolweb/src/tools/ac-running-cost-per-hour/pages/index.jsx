"use client";

import { useMemo, useState } from "react";
import { AirVent, Check, Copy, RotateCcw } from "lucide-react";

import { computeAcRunningCost, STAR_BANDS, TONNAGES } from "../lib";

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
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const money0 = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : DASH);
const units = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} kWh` : DASH);
const watts = (v) => (Number.isFinite(v) ? `${NUM0.format(v)} W` : DASH);

const DEFAULTS = {
  mode: "tonnage",
  tons: "1.5",
  iseer: "3.8",
  power: "1500",
  load: "100",
  tariff: "8",
  hours: "8",
  days: "30",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [tons, setTons] = useState(DEFAULTS.tons);
  const [iseer, setIseer] = useState(DEFAULTS.iseer);
  const [power, setPower] = useState(DEFAULTS.power);
  const [load, setLoad] = useState(DEFAULTS.load);
  const [tariff, setTariff] = useState(DEFAULTS.tariff);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [days, setDays] = useState(DEFAULTS.days);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeAcRunningCost({
        mode,
        tons: toNum(tons),
        iseer: toNum(iseer),
        ratedPowerW: toNum(power),
        loadFactorPercent: toNum(load),
        tariffPerKwh: toNum(tariff),
        hoursPerDay: toNum(hours),
        daysPerMonth: toNum(days),
      }),
    [mode, tons, iseer, power, load, tariff, hours, days],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "AC Running Cost Per Hour",
      mode === "tonnage"
        ? `Machine: ${NUM2.format(toNum(tons))} ton at ISEER ${NUM2.format(toNum(iseer))} (about ${result.starsEquivalent} star)`
        : `Machine: ${watts(result.ratedInputW)} rated input`,
      `Average electrical draw: ${watts(result.effectiveInputW)}`,
      `Energy per hour: ${units(result.kwhPerHour)}`,
      `Cost per hour: ${money2(result.costPerHour)}`,
      `Cost per day (${NUM2.format(toNum(hours))} h): ${money2(result.costPerDay)}`,
      `Units per month: ${units(result.kwhPerMonth)}`,
      `Cost per month: ${money0(result.costPerMonth)}`,
      `CO2 per month: ${NUM0.format(result.co2KgPerMonth)} kg`,
    ].join("\n");
  }, [hasError, result, mode, tons, iseer, hours]);

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
    setMode(DEFAULTS.mode);
    setTons(DEFAULTS.tons);
    setIseer(DEFAULTS.iseer);
    setPower(DEFAULTS.power);
    setLoad(DEFAULTS.load);
    setTariff(DEFAULTS.tariff);
    setHours(DEFAULTS.hours);
    setDays(DEFAULTS.days);
    setCopied(false);
  };

  const labels = [
    "Cooling capacity",
    "Rated electrical input",
    "Average draw at your load factor",
    "Energy per hour",
    "Energy per day",
    "Units per month",
    "Cost per day",
    "Cost per month",
    "Star level for this ISEER",
    "Minutes of cooling per rupee",
    "CO2 per month",
  ];

  const values = hasError
    ? labels.map(() => DASH)
    : [
        Number.isFinite(result.coolingW) ? watts(result.coolingW) : "Entered as rated power",
        watts(result.ratedInputW),
        watts(result.effectiveInputW),
        units(result.kwhPerHour),
        units(result.kwhPerDay),
        units(result.kwhPerMonth),
        money2(result.costPerDay),
        money0(result.costPerMonth),
        result.starsEquivalent === null
          ? "Not applicable"
          : `${result.starsEquivalent} star or better`,
        result.minutesPerRupee === null ? DASH : `${NUM0.format(result.minutesPerRupee)} min`,
        `${NUM0.format(result.co2KgPerMonth)} kg`,
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AirVent className="h-4 w-4" aria-hidden="true" />
          Cooling
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">AC Running Cost Per Hour</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Cooling capacity divided by ISEER gives the average electrical draw. Multiply by hours and
          your tariff and you have the real cost of leaving the AC on.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            How do you want to describe the AC?
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["tonnage", "Tonnage + ISEER"],
              ["power", "Rated power in watts"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                onClick={() => setMode(value)}
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                  mode === value
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {mode === "tonnage" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="ac-tons">
                  Cooling capacity (tons)
                </label>
                <select
                  id="ac-tons"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={tons}
                  onChange={(e) => setTons(e.target.value)}
                >
                  {TONNAGES.map((value) => (
                    <option key={value} value={String(value)}>
                      {value} ton
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ac-iseer">
                  ISEER from the BEE label
                </label>
                <input
                  id="ac-iseer"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.05"
                  value={iseer}
                  onChange={(e) => setIseer(e.target.value)}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {STAR_BANDS.map((band) => (
                    <button
                      key={band.stars}
                      type="button"
                      onClick={() => setIseer(String(band.minIseer))}
                      className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      {band.stars}★ {band.minIseer}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="ac-power">
                Rated power input (W)
              </label>
              <input
                id="ac-power"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="1"
                step="10"
                value={power}
                onChange={(e) => setPower(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="ac-load">
              Load factor (%)
            </label>
            <input
              id="ac-load"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="10"
              max="130"
              step="5"
              value={load}
              onChange={(e) => setLoad(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ac-tariff">
              Electricity tariff (₹ per unit)
            </label>
            <input
              id="ac-tariff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={tariff}
              onChange={(e) => setTariff(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ac-hours">
              Hours run per day
            </label>
            <input
              id="ac-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="24"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ac-days">
              Days used per month
            </label>
            <input
              id="ac-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="31"
              step="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cost per hour
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money2(result.costPerHour)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the running cost."
                : `${units(result.kwhPerHour)} an hour at ${money2(toNum(tariff))} a unit`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy AC running cost result"
              className={`${GHOST_BTN} disabled:opacity-50`}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {labels.map((label, index) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{values[index]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        ISEER is a seasonal average measured against BEE's temperature-bin profile, so this is a
        season-average figure rather than the draw on the hottest afternoon. Slab tariffs, fixed
        charges, fuel surcharges and electricity duty are billed separately and are not included.
      </p>
    </main>
  );
}
