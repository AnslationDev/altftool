"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PlugZap, RotateCcw } from "lucide-react";

import {
  MOUNTING_PRESETS,
  ORIENTATIONS,
  SAVINGS_HORIZON_YEARS,
  computeBalconySolar,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const kwh = (value) => `${NUM0.format(Number.isFinite(value) ? value : 0)} kWh`;
const pct = (value) => `${NUM1.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  panelCount: "2",
  panelWatt: "440",
  inverterWatt: "800",
  latitudeDeg: "19",
  tiltDeg: "90",
  orientation: "equatorFacing",
  peakSunHours: "5.5",
  performanceRatio: "0.8",
  shadingLossPct: "10",
  selfConsumedPct: "85",
  tariff: "9",
  feedInRate: "0",
  kitCost: "45000",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [panelCount, setPanelCount] = useState(DEFAULTS.panelCount);
  const [panelWatt, setPanelWatt] = useState(DEFAULTS.panelWatt);
  const [inverterWatt, setInverterWatt] = useState(DEFAULTS.inverterWatt);
  const [latitudeDeg, setLatitudeDeg] = useState(DEFAULTS.latitudeDeg);
  const [tiltDeg, setTiltDeg] = useState(DEFAULTS.tiltDeg);
  const [orientation, setOrientation] = useState(DEFAULTS.orientation);
  const [peakSunHours, setPeakSunHours] = useState(DEFAULTS.peakSunHours);
  const [performanceRatio, setPerformanceRatio] = useState(DEFAULTS.performanceRatio);
  const [shadingLossPct, setShadingLossPct] = useState(DEFAULTS.shadingLossPct);
  const [selfConsumedPct, setSelfConsumedPct] = useState(DEFAULTS.selfConsumedPct);
  const [tariff, setTariff] = useState(DEFAULTS.tariff);
  const [feedInRate, setFeedInRate] = useState(DEFAULTS.feedInRate);
  const [kitCost, setKitCost] = useState(DEFAULTS.kitCost);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeBalconySolar({
        panelCount: toNumber(panelCount),
        panelWatt: toNumber(panelWatt),
        inverterWatt: toNumber(inverterWatt),
        latitudeDeg: toNumber(latitudeDeg),
        tiltDeg: toNumber(tiltDeg),
        orientation,
        peakSunHours: toNumber(peakSunHours),
        performanceRatio: toNumber(performanceRatio),
        shadingLossPct: toNumber(shadingLossPct),
        selfConsumedPct: toNumber(selfConsumedPct),
        tariff: toNumber(tariff),
        feedInRate: toNumber(feedInRate),
        kitCost: toNumber(kitCost),
      }),
    [
      panelCount,
      panelWatt,
      inverterWatt,
      latitudeDeg,
      tiltDeg,
      orientation,
      peakSunHours,
      performanceRatio,
      shadingLossPct,
      selfConsumedPct,
      tariff,
      feedInRate,
      kitCost,
    ],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Balcony Solar Kit Estimator",
      `Kit: ${panelCount} × ${panelWatt} Wp = ${NUM0.format(result.dcWatt)} W DC into a ${inverterWatt} W micro-inverter`,
      `Mounting: ${tiltDeg}° tilt, ${result.orientationLabel}, latitude ${latitudeDeg}°`,
      `Yield vs a well-aimed array at ${NUM0.format(result.optimalTiltDeg)}° tilt: ${pct(result.orientationFactor * 100)}`,
      `Annual output: ${kwh(result.annualKwh)} (${NUM2.format(result.dailyKwh)} kWh a day)`,
      `Specific yield: ${NUM0.format(result.specificYield)} kWh per kWp per year`,
      `Self-consumed: ${kwh(result.selfKwh)} · exported: ${kwh(result.exportKwh)}`,
      `Annual saving: ${money(result.annualSavings)} (${money(result.monthlySavings)} a month)`,
      result.paybackYears
        ? `Simple payback: ${NUM1.format(result.paybackYears)} years`
        : "Simple payback: not reached at this tariff",
      `${result.horizonYears}-year saving after degradation: ${money(result.horizonSavings)}`,
    ].join("\n");
  }, [hasError, result, panelCount, panelWatt, inverterWatt, tiltDeg, latitudeDeg]);

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
    setPanelCount(DEFAULTS.panelCount);
    setPanelWatt(DEFAULTS.panelWatt);
    setInverterWatt(DEFAULTS.inverterWatt);
    setLatitudeDeg(DEFAULTS.latitudeDeg);
    setTiltDeg(DEFAULTS.tiltDeg);
    setOrientation(DEFAULTS.orientation);
    setPeakSunHours(DEFAULTS.peakSunHours);
    setPerformanceRatio(DEFAULTS.performanceRatio);
    setShadingLossPct(DEFAULTS.shadingLossPct);
    setSelfConsumedPct(DEFAULTS.selfConsumedPct);
    setTariff(DEFAULTS.tariff);
    setFeedInRate(DEFAULTS.feedInRate);
    setKitCost(DEFAULTS.kitCost);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <PlugZap className="h-4 w-4" aria-hidden="true" />
          Solar &amp; renewables
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Balcony Solar Kit Estimator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          What a plug-in balcony kit actually makes once the panels hang vertically off a railing —
          modelled from your latitude, tilt and orientation rather than the brochure&apos;s roof-mounted
          number.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The kit</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-count">
              Number of panels
            </label>
            <input
              id="bs-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              value={panelCount}
              onChange={(event) => setPanelCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-watt">
              Panel rating (Wp)
            </label>
            <input
              id="bs-watt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={panelWatt}
              onChange={(event) => setPanelWatt(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-inv">
              Micro-inverter AC limit (W)
            </label>
            <input
              id="bs-inv"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="50"
              value={inverterWatt}
              onChange={(event) => setInverterWatt(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-cost">
              Installed kit cost (INR)
            </label>
            <input
              id="bs-cost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={kitCost}
              onChange={(event) => setKitCost(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Where it hangs</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {MOUNTING_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setTiltDeg(String(preset.tiltDeg))}
              aria-pressed={String(preset.tiltDeg) === tiltDeg}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label} ({preset.tiltDeg}°)
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bs-orient">
              Which way the balcony faces
            </label>
            <select
              id="bs-orient"
              className={`mt-2 ${INPUT_CLASS}`}
              value={orientation}
              onChange={(event) => setOrientation(event.target.value)}
            >
              {Object.values(ORIENTATIONS).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-tilt">
              Panel tilt from horizontal (°)
            </label>
            <input
              id="bs-tilt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="90"
              step="5"
              value={tiltDeg}
              onChange={(event) => setTiltDeg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-lat">
              Latitude, degrees (drop the N or S)
            </label>
            <input
              id="bs-lat"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="66"
              step="0.5"
              value={latitudeDeg}
              onChange={(event) => setLatitudeDeg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-psh">
              Peak sun hours a day
            </label>
            <input
              id="bs-psh"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="12"
              step="0.1"
              value={peakSunHours}
              onChange={(event) => setPeakSunHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-shade">
              Extra shading loss (%)
            </label>
            <input
              id="bs-shade"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="99"
              step="1"
              value={shadingLossPct}
              onChange={(event) => setShadingLossPct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-pr">
              Performance ratio (0-1)
            </label>
            <input
              id="bs-pr"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="1"
              step="0.01"
              value={performanceRatio}
              onChange={(event) => setPerformanceRatio(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-self">
              Used in the home immediately (%)
            </label>
            <input
              id="bs-self"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={selfConsumedPct}
              onChange={(event) => setSelfConsumedPct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-tariff">
              Your tariff (INR per unit)
            </label>
            <input
              id="bs-tariff"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={tariff}
              onChange={(event) => setTariff(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-feed">
              Paid for an exported unit (INR)
            </label>
            <input
              id="bs-feed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={feedInRate}
              onChange={(event) => setFeedInRate(event.target.value)}
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Estimated output a year
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : kwh(result.annualKwh)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? dash
                : `${NUM2.format(result.dailyKwh)} kWh a day · saves about ${money(result.monthlySavings)} a month`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the balcony solar estimate"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Array size", hasError ? dash : `${NUM0.format(result.dcWatt)} W DC (${NUM2.format(result.dcKw)} kWp)`],
            [
              "Yield vs a well-aimed array",
              hasError ? dash : `${pct(result.orientationFactor * 100)} (best tilt here is ${NUM0.format(result.optimalTiltDeg)}°)`,
            ],
            ["On a well-aimed roof it would make", hasError ? dash : kwh(result.referenceAnnualKwh)],
            ["After tilt and orientation", hasError ? dash : kwh(result.afterOrientationKwh)],
            ["After shading", hasError ? dash : kwh(result.afterShadingKwh)],
            [
              "Inverter clipping",
              hasError ? dash : `${pct(result.clipPct)} (DC:AC ${NUM2.format(result.rawDcAcRatio)}, effective ${NUM2.format(result.effectiveDcAcRatio)})`,
            ],
            ["Specific yield", hasError ? dash : `${NUM0.format(result.specificYield)} kWh per kWp a year`],
            ["Monthly output", hasError ? dash : kwh(result.monthlyKwh)],
            ["Used at home", hasError ? dash : `${kwh(result.selfKwh)} worth ${money(result.billSavings)}`],
            ["Exported", hasError ? dash : `${kwh(result.exportKwh)} worth ${money(result.exportEarnings)}`],
            ["Saving a year", hasError ? dash : money(result.annualSavings)],
            [
              "Simple payback",
              hasError
                ? dash
                : result.paybackYears
                  ? `${NUM1.format(result.paybackYears)} years`
                  : "Not reached — enter a tariff and kit cost",
            ],
            [
              `Saving over ${SAVINGS_HORIZON_YEARS} years`,
              hasError ? dash : `${money(result.horizonSavings)} (net ${money(result.netOverHorizon)})`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.tiltIsCostly && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            At this tilt and orientation the panels make {pct(result.orientationFactor * 100)} of what
            they would well-aimed. A bracket that tilts them out towards{" "}
            {NUM0.format(result.optimalTiltDeg)}° is the single cheapest way to fix that.
          </p>
        )}
        {!hasError && result.inverterUndersized && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            The panels are {NUM2.format(result.rawDcAcRatio)}× the inverter&apos;s AC rating. Vertical
            mounting flattens the midday peak so little is actually lost here, but on an angled mount
            the clipping would bite.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A modelled estimate, not a guarantee — real output depends on weather, soiling, temperature
        and what shades the balcony through the day. Plug-in solar is not permitted everywhere:
        India&apos;s grid-connectivity regulations generally require a DISCOM application and a
        net-metering or behind-the-meter approval even for small systems, and society rules may apply
        as well. Check with your DISCOM before buying.
      </p>
    </main>
  );
}
