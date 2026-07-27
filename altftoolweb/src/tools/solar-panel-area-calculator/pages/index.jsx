"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sun } from "lucide-react";

import { MOUNTING_TYPES, computeSolarArea } from "../lib";

const N0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const N1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const N2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const n0 = (v) => (Number.isFinite(v) ? N0.format(v) : "—");
const n1 = (v) => (Number.isFinite(v) ? N1.format(v) : "—");
const n2 = (v) => (Number.isFinite(v) ? N2.format(v) : "—");

const DEFAULTS = {
  targetKw: "5",
  panelWatt: "550",
  panelLengthMm: "2278",
  panelWidthMm: "1134",
  mounting: "flushPitched",
  peakSunHours: "5",
  performanceRatio: "0.78",
  availableArea: "600",
  areaUnit: "sqft",
};

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const HINT = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const num = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  return Number(trimmed);
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const result = useMemo(
    () =>
      computeSolarArea({
        targetKw: num(form.targetKw),
        panelWatt: num(form.panelWatt),
        panelLengthMm: num(form.panelLengthMm),
        panelWidthMm: num(form.panelWidthMm),
        mounting: form.mounting,
        peakSunHours: num(form.peakSunHours),
        performanceRatio: num(form.performanceRatio),
        availableArea: num(form.availableArea),
        areaUnit: form.areaUnit,
      }),
    [form],
  );

  const hasError = Boolean(result.error);
  const unitLabel = form.areaUnit === "sqm" ? "sq m" : "sq ft";
  const roofInUnit = hasError ? NaN : form.areaUnit === "sqm" ? result.roofAreaSqm : result.roofAreaSqft;

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Solar Panel Area Calculator",
      `Target: ${form.targetKw} kW · ${result.panelCount} x ${form.panelWatt} Wp panels = ${n2(result.installedKw)} kW installed`,
      `Module efficiency: ${n1(result.efficiencyPct)}%`,
      `Module area: ${n1(result.moduleAreaSqm)} sq m`,
      `Roof area needed (${result.mountingLabel}): ${n1(result.roofAreaSqm)} sq m / ${n0(result.roofAreaSqft)} sq ft`,
      `Area per kW: ${n1(result.areaPerKwSqm)} sq m (${n0(result.areaPerKwSqft)} sq ft)`,
      `Generation: ${n1(result.dailyKwh)} kWh/day, ${n0(result.monthlyKwh)} kWh/month, ${n0(result.annualKwh)} kWh/year`,
      `Specific yield: ${n0(result.specificYield)} kWh per kWp per year`,
      result.fit
        ? result.fit.fits
          ? `Your roof fits it with ${n1(result.fit.spareSqm)} sq m to spare (up to ${n2(result.fit.maxKw)} kW would fit)`
          : `Your roof is ${n1(result.fit.shortfallSqm)} sq m short — it holds ${result.fit.panelsThatFit} panels (${n2(result.fit.maxKw)} kW)`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, form.targetKw, form.panelWatt]);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sun className="h-4 w-4" aria-hidden="true" />
          Rooftop solar
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Solar Panel Area Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter the capacity you want and the panel you have been quoted. You get the panel count,
          the module efficiency implied by its own spec sheet, the roof area the array will occupy
          once row spacing is allowed for, and the units it should generate.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">System and panel</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="sp-target">
              Target capacity (kW)
            </label>
            <input
              id="sp-target"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.5"
              value={form.targetKw}
              onChange={set("targetKw")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="sp-watt">
              Panel rating (Wp)
            </label>
            <input
              id="sp-watt"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              step="5"
              value={form.panelWatt}
              onChange={set("panelWatt")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="sp-length">
              Panel length (mm)
            </label>
            <input
              id="sp-length"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={form.panelLengthMm}
              onChange={set("panelLengthMm")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="sp-width">
              Panel width (mm)
            </label>
            <input
              id="sp-width"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={form.panelWidthMm}
              onChange={set("panelWidthMm")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="sp-mount">
              Mounting
            </label>
            <select id="sp-mount" className={INPUT} value={form.mounting} onChange={set("mounting")}>
              {Object.values(MOUNTING_TYPES).map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label} — {type.hint}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2 className="mt-6 text-base font-semibold">Site and roof</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="sp-psh">
              Peak sun hours per day
            </label>
            <input
              id="sp-psh"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="12"
              step="0.1"
              value={form.peakSunHours}
              onChange={set("peakSunHours")}
            />
            <p className={HINT}>Most of India averages 4.5–5.5; the Deccan and Rajasthan run higher.</p>
          </div>
          <div>
            <label className={LABEL} htmlFor="sp-pr">
              Performance ratio
            </label>
            <input
              id="sp-pr"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0.1"
              max="1"
              step="0.01"
              value={form.performanceRatio}
              onChange={set("performanceRatio")}
            />
            <p className={HINT}>Heat, soiling, wiring and inverter losses combined. 0.75–0.80 is normal.</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="sp-avail">
              Roof area you actually have (0 to skip)
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="sp-avail"
                className={`${INPUT} mt-0`}
                type="number"
                inputMode="decimal"
                min="0"
                step="10"
                value={form.availableArea}
                onChange={set("availableArea")}
              />
              <select
                aria-label="Available roof area unit"
                className={`${INPUT} mt-0 w-28`}
                value={form.areaUnit}
                onChange={set("areaUnit")}
              >
                <option value="sqft">sq ft</option>
                <option value="sqm">sq m</option>
              </select>
            </div>
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
              Roof area required
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${n0(roofInUnit)} ${unitLabel}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the layout"
                : `${result.panelCount} panels · ${n2(result.installedKw)} kW installed · ${result.mountingLabel.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy solar array sizing result"
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

        {!hasError && result.efficiencyWarning && (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {result.efficiencyWarning}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Panels needed", hasError ? "—" : `${result.panelCount} × ${form.panelWatt} Wp`],
            ["Installed capacity", hasError ? "—" : `${n2(result.installedKw)} kW`],
            ["Module efficiency (from its own spec)", hasError ? "—" : `${n1(result.efficiencyPct)}%`],
            ["Area of one panel", hasError ? "—" : `${n2(result.panelAreaSqm)} m²`],
            ["Glass area of the whole array", hasError ? "—" : `${n1(result.moduleAreaSqm)} m² (${n0(result.moduleAreaSqft)} sq ft)`],
            ["Spacing allowance applied", hasError ? "—" : `× ${n2(result.areaFactor)}`],
            ["Roof area required", hasError ? "—" : `${n1(result.roofAreaSqm)} m² (${n0(result.roofAreaSqft)} sq ft)`],
            ["Area per kW", hasError ? "—" : `${n1(result.areaPerKwSqm)} m² (${n0(result.areaPerKwSqft)} sq ft)`],
            ["Expected generation", hasError ? "—" : `${n1(result.dailyKwh)} kWh/day · ${n0(result.monthlyKwh)} kWh/month`],
            ["Annual output", hasError ? "—" : `${n0(result.annualKwh)} kWh`],
            ["Specific yield", hasError ? "—" : `${n0(result.specificYield)} kWh/kWp/year`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.fit && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Does it fit your roof?</h2>
          <p
            className={`mt-3 rounded-md px-3 py-2 text-sm font-semibold ${
              result.fit.fits
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
          >
            {result.fit.fits
              ? `Yes — ${n1(result.fit.spareSqm)} m² to spare.`
              : `No — you are ${n1(result.fit.shortfallSqm)} m² short.`}
          </p>
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Panels your roof can hold", `${result.fit.panelsThatFit}`],
              ["Largest system that fits", `${n2(result.fit.maxKw)} kW`],
              ["Generation at that size", `${n1(result.fit.maxDailyKwh)} kWh/day`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning estimate. Real layouts lose area to water tanks, staircase headroom, parapet
        shadows, chimney flues and mandated fire-access paths, and shading from a neighbouring
        building can cost more output than any of them. Ask your installer for a shade analysis and
        a structural check before you sign.
      </p>
    </main>
  );
}
