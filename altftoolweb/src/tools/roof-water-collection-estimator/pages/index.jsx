"use client";

import { useMemo, useState } from "react";
import { Check, CloudRain, Copy, RotateCcw } from "lucide-react";

import { FIRST_FLUSH_PRESETS, ROOF_SURFACES, estimateRoofHarvest } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const int = (value) => (Number.isFinite(value) ? INT.format(value) : DASH);

const DEFAULTS = {
  area: "1000",
  areaUnit: "sqft",
  surfaceId: "rcc",
  eventRain: "50",
  annualRain: "900",
  rainyDays: "60",
  firstFlush: "1",
  tank: "5000",
  demand: "300",
  cost: "150",
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
  const [area, setArea] = useState(DEFAULTS.area);
  const [areaUnit, setAreaUnit] = useState(DEFAULTS.areaUnit);
  const [surfaceId, setSurfaceId] = useState(DEFAULTS.surfaceId);
  const [eventRain, setEventRain] = useState(DEFAULTS.eventRain);
  const [annualRain, setAnnualRain] = useState(DEFAULTS.annualRain);
  const [rainyDays, setRainyDays] = useState(DEFAULTS.rainyDays);
  const [firstFlush, setFirstFlush] = useState(DEFAULTS.firstFlush);
  const [tank, setTank] = useState(DEFAULTS.tank);
  const [demand, setDemand] = useState(DEFAULTS.demand);
  const [cost, setCost] = useState(DEFAULTS.cost);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateRoofHarvest({
        roofArea: toNumber(area),
        areaUnit,
        surfaceId,
        eventRainfallMm: toNumber(eventRain),
        annualRainfallMm: toNumber(annualRain),
        rainyDays: toNumber(rainyDays),
        firstFlushMm: toNumber(firstFlush),
        tankLitres: toNumber(tank),
        dailyDemandLitres: toNumber(demand),
        costPer1000Litres: toNumber(cost),
      }),
    [area, areaUnit, surfaceId, eventRain, annualRain, rainyDays, firstFlush, tank, demand, cost],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Rooftop rainwater harvest",
      `Catchment: ${num(result.areaSqm)} sqm of ${result.surfaceLabel} (runoff coefficient ${num(result.coefficient)})`,
      `One ${num(result.eventRainfallMm)} mm storm: ${int(result.eventLitres)} litres after a ${num(result.firstFlushMm)} mm first flush`,
      `Tank holds ${int(result.capturedLitres)} litres of it; ${int(result.overflowLitres)} litres overflow`,
      `Year at ${num(result.annualRainfallMm)} mm over ${result.rainyDays} rainy days: ${int(result.annualLitres)} litres (${num(result.annualKilolitres)} kL)`,
      `That is ${num(result.litresPerSqmYear)} litres per sqm of roof per year`,
      `Covers ${num(result.annualDaysCovered)} days of demand, ${num(result.demandMetPercent)}% of annual use`,
      `Water bill avoided: ${money(result.annualSaving)} a year`,
    ].join("\n");
  }, [failed, result]);

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
    setArea(DEFAULTS.area);
    setAreaUnit(DEFAULTS.areaUnit);
    setSurfaceId(DEFAULTS.surfaceId);
    setEventRain(DEFAULTS.eventRain);
    setAnnualRain(DEFAULTS.annualRain);
    setRainyDays(DEFAULTS.rainyDays);
    setFirstFlush(DEFAULTS.firstFlush);
    setTank(DEFAULTS.tank);
    setDemand(DEFAULTS.demand);
    setCost(DEFAULTS.cost);
    setCopied(false);
  };

  const rows = [
    ["Catchment area", failed ? DASH : `${num(result.areaSqm)} sqm (${num(result.areaSqft)} sqft)`],
    ["Runoff coefficient", failed ? DASH : num(result.coefficient)],
    ["Rain kept from the storm", failed ? DASH : `${num(result.eventEffectiveMm)} of ${num(result.eventRainfallMm)} mm`],
    ["Yield from one storm", failed ? DASH : `${int(result.eventLitres)} litres`],
    ["Diverted as first flush", failed ? DASH : `${int(result.firstFlushLitres)} litres`],
    ["Held in the tank", failed ? DASH : `${int(result.capturedLitres)} litres`],
    ["Overflow to waste", failed ? DASH : `${int(result.overflowLitres)} litres`],
    ["Tank fill from one storm", failed ? DASH : `${num(result.tankFillPercent)}%`],
    ["Days that tankful lasts", failed ? DASH : `${num(result.daysOfSupply)} days`],
    ["Annual rain that reaches the tank", failed ? DASH : `${num(result.annualEffectiveMm)} mm`],
    ["Annual yield", failed ? DASH : `${int(result.annualLitres)} litres`],
    ["Annual yield in kilolitres", failed ? DASH : `${num(result.annualKilolitres)} kL`],
    ["Lost to first flush across the year", failed ? DASH : `${int(result.annualLostLitres)} litres`],
    ["Yield per sqm of roof", failed ? DASH : `${num(result.litresPerSqmYear)} litres/year`],
    ["Days of demand covered", failed ? DASH : `${num(result.annualDaysCovered)} days`],
    ["Share of annual demand met", failed ? DASH : `${num(result.demandMetPercent)}%`],
    ["Value of one storm", failed ? DASH : money(result.eventSaving)],
    ["Value across the year", failed ? DASH : money(result.annualSaving)],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <CloudRain className="h-4 w-4" aria-hidden="true" />
          Rainwater harvesting
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Roof Water Collection Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One millimetre of rain on one square metre is one litre. Enter your roof, its surface and your
          rainfall to see what a single storm and a full year actually put in the tank.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Catchment</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { id: "sqft", label: "Square feet" },
            { id: "sqm", label: "Square metres" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={areaUnit === option.id}
              className={areaUnit === option.id ? CHIP_ON : CHIP}
              onClick={() => setAreaUnit(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="rw-area">
              Roof area on plan ({areaUnit === "sqft" ? "sqft" : "sqm"})
            </label>
            <input
              id="rw-area"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={area}
              onChange={(event) => setArea(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="rw-surface">
              Roof surface
            </label>
            <select
              id="rw-surface"
              className={FIELD}
              value={surfaceId}
              onChange={(event) => setSurfaceId(event.target.value)}
            >
              {ROOF_SURFACES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} · {item.coefficient}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Rainfall</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="rw-event">
              Rain in one storm (mm)
            </label>
            <input
              id="rw-event"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={eventRain}
              onChange={(event) => setEventRain(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="rw-annual">
              Annual rainfall (mm)
            </label>
            <input
              id="rw-annual"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="1"
              step="50"
              value={annualRain}
              onChange={(event) => setAnnualRain(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="rw-days">
              Rainy days a year
            </label>
            <input
              id="rw-days"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="1"
              max="366"
              step="1"
              value={rainyDays}
              onChange={(event) => setRainyDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="rw-flush">
              First flush diverted each event (mm)
            </label>
            <input
              id="rw-flush"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={firstFlush}
              onChange={(event) => setFirstFlush(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {FIRST_FLUSH_PRESETS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={CHIP}
              onClick={() => setFirstFlush(String(item.mm))}
            >
              {item.label}
            </button>
          ))}
        </div>

        <h2 className="mt-6 text-base font-semibold">Storage and value</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="rw-tank">
              Storage tank capacity (litres)
            </label>
            <input
              id="rw-tank"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={tank}
              onChange={(event) => setTank(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="rw-demand">
              Household use per day (litres)
            </label>
            <input
              id="rw-demand"
              className={FIELD}
              type="number"
              inputMode="numeric"
              min="0"
              step="50"
              value={demand}
              onChange={(event) => setDemand(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="rw-cost">
              Cost of bought water per 1,000 litres (INR)
            </label>
            <input
              id="rw-cost"
              className={FIELD}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
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
              Harvested in a year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${int(result.annualLitres)} L`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the highlighted input to see a yield."
                : `${int(result.eventLitres)} litres from a single ${num(result.eventRainfallMm)} mm storm`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the harvesting estimate"
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
        Use the roof area as seen from above, not the sloped surface — rain falls vertically, so a pitched
        roof catches only what its horizontal shadow covers. Harvested water is not automatically potable;
        test it before any drinking use.
      </p>
    </main>
  );
}
