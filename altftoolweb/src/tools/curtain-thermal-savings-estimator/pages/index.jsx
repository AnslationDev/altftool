"use client";

import { useMemo, useState } from "react";
import { Blinds, Check, Copy, RotateCcw } from "lucide-react";

import {
  CURTAIN_TYPES,
  GLAZING_TYPES,
  ORIENTATION_IRRADIANCE,
  estimateCurtainSavings,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);

const DEFAULTS = {
  unit: "ft",
  width: "5",
  height: "4",
  count: "3",
  glazingId: "clear",
  curtainId: "blackout",
  irradiance: "450",
  deltaT: "8",
  hours: "7",
  days: "150",
  cop: "3.2",
  tariff: "8",
  cost: "9000",
};

const FIELD =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_ON =
  "min-h-11 rounded-md border border-[var(--primary)] bg-[var(--primary)]/10 px-3 text-sm font-semibold text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [count, setCount] = useState(DEFAULTS.count);
  const [glazingId, setGlazingId] = useState(DEFAULTS.glazingId);
  const [curtainId, setCurtainId] = useState(DEFAULTS.curtainId);
  const [irradiance, setIrradiance] = useState(DEFAULTS.irradiance);
  const [deltaT, setDeltaT] = useState(DEFAULTS.deltaT);
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [days, setDays] = useState(DEFAULTS.days);
  const [cop, setCop] = useState(DEFAULTS.cop);
  const [tariff, setTariff] = useState(DEFAULTS.tariff);
  const [cost, setCost] = useState(DEFAULTS.cost);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateCurtainSavings({
        windowWidth: toNumber(width),
        windowHeight: toNumber(height),
        unit,
        windowCount: toNumber(count),
        glazingId,
        curtainId,
        irradiance: toNumber(irradiance),
        deltaT: toNumber(deltaT),
        hoursPerDay: toNumber(hours),
        seasonDays: toNumber(days),
        cop: toNumber(cop),
        tariff: toNumber(tariff),
        curtainCost: toNumber(cost),
      }),
    [width, height, unit, count, glazingId, curtainId, irradiance, deltaT, hours, days, cop, tariff, cost],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Curtain thermal savings",
      `Glass: ${result.windows} window(s), ${num(result.totalAreaSqm)} sqm of ${result.glazingLabel} (SHGC ${num(result.shgc)}, U ${num(result.uValue)})`,
      `Curtain: ${result.curtainLabel} (attenuation ${num(result.iac)}, U cut ${num(result.uReductionPercent)}%)`,
      `Heat gain bare: ${num(result.bareW)} W; with curtains: ${num(result.curtainedW)} W`,
      `Reduction: ${num(result.savedW)} W, ${num(result.reductionPercent)}% — about ${num(result.tonsOffset)} tons of AC`,
      `Electricity saved: ${num(result.electricalKwhPerYear)} kWh a year at COP ${cop}`,
      `Money saved: ${money(result.savingPerYear)} a year (${money(result.savingPerMonth)} a month)`,
      `Payback on ${money(result.curtainCost)} of curtains: ${num(result.paybackYears)} years`,
    ].join("\n");
  }, [failed, result, cop]);

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
    setUnit(DEFAULTS.unit);
    setWidth(DEFAULTS.width);
    setHeight(DEFAULTS.height);
    setCount(DEFAULTS.count);
    setGlazingId(DEFAULTS.glazingId);
    setCurtainId(DEFAULTS.curtainId);
    setIrradiance(DEFAULTS.irradiance);
    setDeltaT(DEFAULTS.deltaT);
    setHours(DEFAULTS.hours);
    setDays(DEFAULTS.days);
    setCop(DEFAULTS.cop);
    setTariff(DEFAULTS.tariff);
    setCost(DEFAULTS.cost);
    setCopied(false);
  };

  const rows = [
    ["Glass area per window", failed ? DASH : `${num(result.areaPerWindowSqm)} sqm`],
    ["Total glass area", failed ? DASH : `${num(result.totalAreaSqm)} sqm`],
    ["Glazing SHGC", failed ? DASH : num(result.shgc)],
    ["Glazing U-value", failed ? DASH : `${num(result.uValue)} W/sqm·K`],
    ["Curtain attenuation coefficient", failed ? DASH : num(result.iac)],
    ["Conduction cut by the curtain", failed ? DASH : `${num(result.uReductionPercent)}%`],
    ["Heat gain with curtains open", failed ? DASH : `${num(result.bareW)} W`],
    ["Heat gain with curtains drawn", failed ? DASH : `${num(result.curtainedW)} W`],
    ["Heat kept out", failed ? DASH : `${num(result.savedW)} W`],
    ["Reduction in window gain", failed ? DASH : `${num(result.reductionPercent)}%`],
    ["AC capacity freed up", failed ? DASH : `${num(result.tonsOffset)} tons`],
    ["Hours of shading a year", failed ? DASH : `${num(result.hoursPerYear)} h`],
    ["Cooling load avoided", failed ? DASH : `${num(result.thermalKwhPerYear)} kWh (thermal)`],
    ["Electricity saved", failed ? DASH : `${num(result.electricalKwhPerYear)} kWh a year`],
    ["Money saved a month", failed ? DASH : money(result.savingPerMonth)],
    ["Money saved a year", failed ? DASH : money(result.savingPerYear)],
    ["Payback on the curtains", failed ? DASH : `${num(result.paybackYears)} years`],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Blinds className="h-4 w-4" aria-hidden="true" />
          Thermal comfort
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Curtain Thermal Savings Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          See how much heat a blackout or thermal curtain actually keeps out of a room, and what that is
          worth once the air conditioner no longer has to remove it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Windows</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { id: "ft", label: "Feet" },
            { id: "m", label: "Metres" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={unit === option.id}
              className={unit === option.id ? CHIP_ON : CHIP}
              onClick={() => setUnit(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="ct-width">
              Glass width ({unit})
            </label>
            <input
              id="ct-width"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.25"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ct-height">
              Glass height ({unit})
            </label>
            <input
              id="ct-height"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.25"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ct-count">
              Number of windows like this
            </label>
            <input
              id="ct-count"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={count}
              onChange={(event) => setCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ct-glazing">
              Glazing
            </label>
            <select
              id="ct-glazing"
              className={FIELD}
              value={glazingId}
              onChange={(event) => setGlazingId(event.target.value)}
            >
              {GLAZING_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Curtain and exposure</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="ct-curtain">
              Curtain type
            </label>
            <select
              id="ct-curtain"
              className={FIELD}
              value={curtainId}
              onChange={(event) => setCurtainId(event.target.value)}
            >
              {CURTAIN_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="ct-irradiance">
              Sun on the glass (W/sqm)
            </label>
            <input
              id="ct-irradiance"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              max="1100"
              step="25"
              value={irradiance}
              onChange={(event) => setIrradiance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ct-delta">
              Outdoor minus indoor temperature (°C)
            </label>
            <input
              id="ct-delta"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="1"
              value={deltaT}
              onChange={(event) => setDeltaT(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {ORIENTATION_IRRADIANCE.map((item) => (
            <button
              key={item.id}
              type="button"
              className={CHIP}
              onClick={() => setIrradiance(String(item.irradiance))}
            >
              {item.label}
            </button>
          ))}
        </div>

        <h2 className="mt-6 text-base font-semibold">Use and cost</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="ct-hours">
              Hours a day the curtains are drawn in sun
            </label>
            <input
              id="ct-hours"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              max="24"
              step="0.5"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ct-days">
              Cooling days a year
            </label>
            <input
              id="ct-days"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="1"
              max="365"
              step="5"
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ct-cop">
              Air conditioner COP
            </label>
            <input
              id="ct-cop"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="10"
              step="0.1"
              value={cop}
              onChange={(event) => setCop(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="ct-tariff">
              Electricity tariff (INR per kWh)
            </label>
            <input
              id="ct-tariff"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={tariff}
              onChange={(event) => setTariff(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="ct-cost">
              What the curtains cost in total (INR)
            </label>
            <input
              id="ct-cost"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed && (
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
              Saved every year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : money(result.savingPerYear)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see a saving."
                : `${num(result.savedW)} W of heat kept out — ${num(result.reductionPercent)}% less gain through the glass`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the curtain savings estimate"
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
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        An interior curtain stops heat that has already come through the glass, so it can only ever do part
        of the job. Anything that blocks sun outside the window — a chajja, an awning, an external blind or
        a tree — cuts the same gain by considerably more for the same money.
      </p>
    </main>
  );
}
