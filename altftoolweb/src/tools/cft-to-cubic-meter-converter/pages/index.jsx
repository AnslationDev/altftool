"use client";

import { useMemo, useState } from "react";
import { Box, Check, Copy, RotateCcw } from "lucide-react";

import { LENGTH_UNITS, MATERIALS, VOLUME_UNITS, convertVolume } from "../lib";

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
const N4 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });
const N2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const N0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const num = (raw) => (String(raw).trim() === "" ? NaN : Number(String(raw).trim()));

export default function ToolHome() {
  const [mode, setMode] = useState("volume");
  const [value, setValue] = useState("100");
  const [unit, setUnit] = useState("cft");
  const [length, setLength] = useState("10");
  const [width, setWidth] = useState("10");
  const [height, setHeight] = useState("1");
  const [lengthUnit, setLengthUnit] = useState("ft");
  const [materialId, setMaterialId] = useState("sand");
  const [truckCapacity, setTruckCapacity] = useState("100");
  const [rate, setRate] = useState("60");
  const [rateUnit, setRateUnit] = useState("cft");
  const [copied, setCopied] = useState(false);

  const material = MATERIALS.find((m) => m.id === materialId) ?? MATERIALS[0];

  const result = useMemo(
    () =>
      convertVolume({
        mode,
        value: num(value),
        unit,
        length: num(length),
        width: num(width),
        height: num(height),
        lengthUnit,
        density: material.density,
        truckCapacityCft: num(truckCapacity) || 0,
        rate: num(rate) || 0,
        rateUnit,
      }),
    [mode, value, unit, length, width, height, lengthUnit, material, truckCapacity, rate, rateUnit],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = ["Volume conversion"];
    VOLUME_UNITS.forEach((vu) => {
      lines.push(`${vu.label}: ${N4.format(result.volumes[vu.id])}`);
    });
    if (result.weightTonnes !== null) {
      lines.push(
        `${material.label} at ${material.density} kg/cu m: ${N0.format(result.weightKg)} kg (${N2.format(result.weightTonnes)} tonnes)`,
      );
    }
    if (result.truckLoads !== null) {
      lines.push(`Truck loads: ${N2.format(result.truckLoads)} (${result.truckLoadsRoundedUp} to order)`);
    }
    if (result.pricing) {
      lines.push(`Total: ${INR.format(result.pricing.total)}`);
      lines.push(`Rate per cft: ${INR2.format(result.pricing.perUnit.cft)}`);
      lines.push(`Rate per cubic metre: ${INR2.format(result.pricing.perUnit.cbm)}`);
    }
    return lines.join("\n");
  }, [hasError, result, material]);

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
    setMode("volume");
    setValue("100");
    setUnit("cft");
    setLength("10");
    setWidth("10");
    setHeight("1");
    setLengthUnit("ft");
    setMaterialId("sand");
    setTruckCapacity("100");
    setRate("60");
    setRateUnit("cft");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Box className="h-4 w-4" aria-hidden="true" />
          Volume
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">CFT to Cubic Meter Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One cubic foot is exactly 0.028316846592 cubic metres, and 100 cft is one brass. Convert a
          load between cft, cubic metres, litres, brass and cubic yards, and turn it into weight in
          tonnes, tipper loads and cost.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Start from</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["volume", "A volume"],
              ["dimensions", "L × W × H"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                aria-pressed={mode === id}
                className={mode === id ? `${PRIMARY_BTN} flex-1 sm:flex-none` : `${GHOST_BTN} flex-1 sm:flex-none`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        {mode === "volume" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="vol-value">
                Volume
              </label>
              <input
                id="vol-value"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vol-unit">
                Unit
              </label>
              <select
                id="vol-unit"
                className={`mt-2 ${INPUT_CLASS}`}
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
              >
                {VOLUME_UNITS.map((vu) => (
                  <option key={vu.id} value={vu.id}>
                    {vu.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="vol-length">
                Length
              </label>
              <input
                id="vol-length"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={length}
                onChange={(event) => setLength(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vol-width">
                Width
              </label>
              <input
                id="vol-width"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={width}
                onChange={(event) => setWidth(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vol-height">
                Height / depth
              </label>
              <input
                id="vol-height"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="vol-lengthunit">
                Measured in
              </label>
              <select
                id="vol-lengthunit"
                className={`mt-2 ${INPUT_CLASS}`}
                value={lengthUnit}
                onChange={(event) => setLengthUnit(event.target.value)}
              >
                {LENGTH_UNITS.map((lu) => (
                  <option key={lu.id} value={lu.id}>
                    {lu.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vol-material">
              Material (for weight)
            </label>
            <select
              id="vol-material"
              className={`mt-2 ${INPUT_CLASS}`}
              value={materialId}
              onChange={(event) => setMaterialId(event.target.value)}
            >
              {MATERIALS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} — {m.density} kg/cu m
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vol-truck">
              Tipper capacity (cft)
            </label>
            <input
              id="vol-truck"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={truckCapacity}
              onChange={(event) => setTruckCapacity(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              100 cft is one brass — a common small tipper load.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vol-rate">
              Rate (₹, leave blank to skip pricing)
            </label>
            <input
              id="vol-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vol-rateunit">
              Rate is quoted per
            </label>
            <select
              id="vol-rateunit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={rateUnit}
              onChange={(event) => setRateUnit(event.target.value)}
            >
              {VOLUME_UNITS.map((vu) => (
                <option key={vu.id} value={vu.id}>
                  {vu.short}
                </option>
              ))}
            </select>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              In cubic metres
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${N4.format(result.volumes.cbm)} cu m`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the conversion."
                : `${N2.format(result.volumes.cft)} cft · ${N2.format(result.volumes.brass)} brass`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy volume conversion"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the converter" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {VOLUME_UNITS.map((vu) => (
            <div key={vu.id} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{vu.label}</dt>
              <dd className="text-right font-semibold">
                {hasError ? DASH : N4.format(result.volumes[vu.id])}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Weight and loads</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            ["Material", material.label],
            ["Bulk density used", `${N0.format(material.density)} kg per cubic metre`],
            [
              "Weight",
              hasError || result.weightKg === null ? DASH : `${N0.format(result.weightKg)} kg`,
            ],
            [
              "In tonnes",
              hasError || result.weightTonnes === null ? DASH : `${N2.format(result.weightTonnes)} t`,
            ],
            [
              "Equivalent 50 kg bags",
              hasError || result.cementBags === null ? DASH : N2.format(result.cementBags),
            ],
            [
              "Tipper loads",
              hasError || result.truckLoads === null
                ? DASH
                : `${N2.format(result.truckLoads)} (order ${result.truckLoadsRoundedUp})`,
            ],
          ].map(([label, text]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What it costs</h2>
        {hasError || !result.pricing ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {hasError ? DASH : "Enter a rate above to price this load."}
          </p>
        ) : (
          <>
            <p className="mt-2 text-3xl font-semibold text-[var(--primary)]">
              {INR.format(result.pricing.total)}
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Same price as</th>
                    <th scope="col" className="py-2 text-right font-semibold">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {VOLUME_UNITS.map((vu) => (
                    <tr key={vu.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">Per {vu.short}</td>
                      <td className="py-2 text-right font-semibold">
                        {INR2.format(result.pricing.perUnit[vu.id])}
                      </td>
                    </tr>
                  ))}
                  {result.pricing.perTonne !== null && (
                    <tr className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">Per tonne of {material.label.toLowerCase()}</td>
                      <td className="py-2 text-right font-semibold">
                        {INR2.format(result.pricing.perTonne)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Volume conversions are exact. Weights use published bulk densities and are estimates — damp
        sand, different grading or a compacted load can shift the figure by ten per cent or more, so
        weigh the vehicle when you are paying by the tonne.
      </p>
    </main>
  );
}
