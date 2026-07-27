"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ThermometerSnowflake } from "lucide-react";

import { BEE_DEFAULT_SETPOINT_C, simulateSetpointSavings } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const kwh = (v) => (Number.isFinite(v) ? `${NUM2.format(v)} kWh` : DASH);
const pct = (v) => (Number.isFinite(v) ? `${NUM1.format(v)}%` : DASH);

const DEFAULTS = {
  tons: "1.5",
  iseer: "3.8",
  outdoor: "38",
  baseline: "22",
  target: "24",
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
  const [tons, setTons] = useState(DEFAULTS.tons);
  const [iseer, setIseer] = useState(DEFAULTS.iseer);
  const [outdoor, setOutdoor] = useState(DEFAULTS.outdoor);
  const [baseline, setBaseline] = useState(DEFAULTS.baseline);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [tariff, setTariff] = useState(DEFAULTS.tariff);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [days, setDays] = useState(DEFAULTS.days);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      simulateSetpointSavings({
        tons: toNum(tons),
        iseer: toNum(iseer),
        outdoorTempC: toNum(outdoor),
        baselineSetpointC: toNum(baseline),
        newSetpointC: toNum(target),
        tariffPerKwh: toNum(tariff),
        hoursPerDay: toNum(hours),
        daysPerMonth: toNum(days),
      }),
    [tons, iseer, outdoor, baseline, target, tariff, hours, days],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "AC Temperature Savings Simulator",
      `Machine: ${NUM2.format(toNum(tons))} ton at ISEER ${NUM2.format(toNum(iseer))}`,
      `Outdoor ${NUM0.format(toNum(outdoor))} °C, setpoint ${NUM0.format(toNum(baseline))} °C → ${NUM0.format(toNum(target))} °C`,
      `Baseline: ${kwh(result.baselineKwhMonth)} = ${money(result.baselineCostMonth)} a month`,
      `At the new setpoint: ${kwh(result.newKwhMonth)} = ${money(result.newCostMonth)} a month`,
      `${result.isIncrease ? "Extra cost" : "Saved"}: ${money(Math.abs(result.moneySavedMonth))} a month (${pct(Math.abs(result.savingPercent))})`,
      `Per degree: ${pct(Math.abs(result.savingPercentPerDegree))}`,
      `BEE 6%-per-degree rule of thumb: ${pct(result.beeSavingPercent)}`,
      `CO2 saved: ${NUM0.format(result.co2SavedKgMonth)} kg a month`,
    ].join("\n");
  }, [hasError, result, tons, iseer, outdoor, baseline, target]);

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
    setTons(DEFAULTS.tons);
    setIseer(DEFAULTS.iseer);
    setOutdoor(DEFAULTS.outdoor);
    setBaseline(DEFAULTS.baseline);
    setTarget(DEFAULTS.target);
    setTariff(DEFAULTS.tariff);
    setHours(DEFAULTS.hours);
    setDays(DEFAULTS.days);
    setCopied(false);
  };

  const labels = [
    "Hours run per month",
    "Units per month at the old setpoint",
    "Cost per month at the old setpoint",
    "Units per month at the new setpoint",
    "Cost per month at the new setpoint",
    "Units saved per month",
    "Saving per degree raised",
    "BEE 6%-per-degree rule of thumb",
    "Saved across a four-month summer",
    "CO2 saved per month",
  ];

  const values = hasError
    ? labels.map(() => DASH)
    : [
        `${NUM0.format(result.hoursPerMonth)} h`,
        kwh(result.baselineKwhMonth),
        money(result.baselineCostMonth),
        kwh(result.newKwhMonth),
        money(result.newCostMonth),
        kwh(result.unitsSavedMonth),
        pct(result.savingPercentPerDegree),
        pct(result.beeSavingPercent),
        money(result.moneySavedSeason),
        `${NUM0.format(result.co2SavedKgMonth)} kg`,
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ThermometerSnowflake className="h-4 w-4" aria-hidden="true" />
          Thermostat
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AC Temperature Savings Simulator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Heat leaks in proportional to the gap between outside and your setpoint, so raising the
          thermostat shrinks the load in the same proportion. See the units and the rupees for every
          degree.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ats-tons">
              AC capacity (tons)
            </label>
            <input
              id="ats-tons"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="10"
              step="0.1"
              value={tons}
              onChange={(e) => setTons(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ats-iseer">
              ISEER from the BEE label
            </label>
            <input
              id="ats-iseer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="12"
              step="0.05"
              value={iseer}
              onChange={(e) => setIseer(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ats-outdoor">
              Outdoor temperature (°C)
            </label>
            <input
              id="ats-outdoor"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="55"
              step="1"
              value={outdoor}
              onChange={(e) => setOutdoor(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ats-baseline">
              Setpoint you use today (°C)
            </label>
            <input
              id="ats-baseline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="16"
              max="30"
              step="1"
              value={baseline}
              onChange={(e) => setBaseline(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ats-target">
              Setpoint you are considering (°C)
            </label>
            <input
              id="ats-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="16"
              max="30"
              step="1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {[24, 25, 26, 27].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTarget(String(value))}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {value} °C{value === BEE_DEFAULT_SETPOINT_C ? " (BEE default)" : ""}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ats-tariff">
              Electricity tariff (₹ per unit)
            </label>
            <input
              id="ats-tariff"
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
            <label className={LABEL_CLASS} htmlFor="ats-hours">
              Hours run per day
            </label>
            <input
              id="ats-hours"
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
            <label className={LABEL_CLASS} htmlFor="ats-days">
              Days per month
            </label>
            <input
              id="ats-days"
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
              {hasError || !result.isIncrease ? "Saved per month" : "Extra cost per month"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(Math.abs(result.moneySavedMonth))}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the simulation."
                : `${pct(Math.abs(result.savingPercent))} ${result.isIncrease ? "more" : "less"} energy for ${Math.abs(result.degreesRaised)} °C`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy AC setpoint savings result"
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Every setpoint, same run time</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Setpoint
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Units / month
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Cost / month
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Vs today
                </th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : result.table).map((row) => (
                <tr
                  key={row.setpointC}
                  className={`border-b border-[var(--border)] last:border-0 ${
                    row.isSelected || row.isBaseline ? "bg-[var(--muted)] font-semibold" : ""
                  }`}
                >
                  <td className="py-2 pr-3">
                    {row.setpointC} °C
                    {row.isBaseline ? " (today)" : ""}
                    {row.isSelected && !row.isBaseline ? " (chosen)" : ""}
                  </td>
                  <td className="py-2 pr-3 text-right">{NUM0.format(row.kwhMonth)}</td>
                  <td className="py-2 pr-3 text-right">{money(row.costMonth)}</td>
                  <td className="py-2 text-right">
                    {row.savingPercent >= 0
                      ? `−${NUM1.format(row.savingPercent)}%`
                      : `+${NUM1.format(-row.savingPercent)}%`}
                  </td>
                </tr>
              ))}
              {hasError && (
                <tr>
                  <td className="py-2 text-[var(--muted-foreground)]" colSpan={4}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A model of the sensible cooling load only. Real savings are usually a little larger, because
        a higher evaporating temperature also improves compressor efficiency, and a little smaller
        on very humid days when the machine spends energy removing moisture. Sunlight on the walls,
        occupancy and how well the room is sealed all shift the number.
      </p>
    </main>
  );
}
