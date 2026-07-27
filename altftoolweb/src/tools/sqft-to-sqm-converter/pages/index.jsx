"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scaling } from "lucide-react";

import { AREA_UNITS, LENGTH_UNITS, convertArea } from "../lib";

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
  const [mode, setMode] = useState("area");
  const [value, setValue] = useState("1000");
  const [unit, setUnit] = useState("sqft");
  const [length, setLength] = useState("30");
  const [width, setWidth] = useState("40");
  const [lengthUnit, setLengthUnit] = useState("ft");
  const [rate, setRate] = useState("6000");
  const [rateUnit, setRateUnit] = useState("sqft");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      convertArea({
        mode,
        value: num(value),
        unit,
        length: num(length),
        width: num(width),
        lengthUnit,
        rate: num(rate) || 0,
        rateUnit,
      }),
    [mode, value, unit, length, width, lengthUnit, rate, rateUnit],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = ["Area conversion"];
    AREA_UNITS.forEach((au) => {
      lines.push(`${au.label}: ${N4.format(result.areas[au.id])}`);
    });
    if (result.pricing) {
      lines.push(`Total value: ${INR.format(result.pricing.total)}`);
      lines.push(`Rate per sq ft: ${INR2.format(result.pricing.perUnit.sqft)}`);
      lines.push(`Rate per sq m: ${INR2.format(result.pricing.perUnit.sqm)}`);
      lines.push(`Rate per sq yd (gaj): ${INR2.format(result.pricing.perUnit.sqyd)}`);
    }
    return lines.join("\n");
  }, [hasError, result]);

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
    setMode("area");
    setValue("1000");
    setUnit("sqft");
    setLength("30");
    setWidth("40");
    setLengthUnit("ft");
    setRate("6000");
    setRateUnit("sqft");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scaling className="h-4 w-4" aria-hidden="true" />
          Area
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sqft to Sqm Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a plot or carpet area between square feet, square metres, square yards (gaj),
          ares, acres and hectares — and turn a rate quoted in one unit into the rate and total in
          every other.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">Start from</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["area", "An area"],
              ["dimensions", "Length × width"],
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

        {mode === "area" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="area-value">
                Area
              </label>
              <input
                id="area-value"
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
              <label className={LABEL_CLASS} htmlFor="area-unit">
                Unit
              </label>
              <select
                id="area-unit"
                className={`mt-2 ${INPUT_CLASS}`}
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
              >
                {AREA_UNITS.map((au) => (
                  <option key={au.id} value={au.id}>
                    {au.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="area-length">
                Length
              </label>
              <input
                id="area-length"
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
              <label className={LABEL_CLASS} htmlFor="area-width">
                Width
              </label>
              <input
                id="area-width"
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
              <label className={LABEL_CLASS} htmlFor="area-lengthunit">
                Measured in
              </label>
              <select
                id="area-lengthunit"
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
            <label className={LABEL_CLASS} htmlFor="area-rate">
              Rate (₹, leave blank to skip pricing)
            </label>
            <input
              id="area-rate"
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
            <label className={LABEL_CLASS} htmlFor="area-rateunit">
              Rate is quoted per
            </label>
            <select
              id="area-rateunit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={rateUnit}
              onChange={(event) => setRateUnit(event.target.value)}
            >
              {AREA_UNITS.map((au) => (
                <option key={au.id} value={au.id}>
                  {au.short}
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
              In square metres
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${N4.format(result.areas.sqm)} sq m`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the conversion."
                : `${N4.format(result.areas.sqft)} sq ft · ${N4.format(result.areas.sqyd)} gaj`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy area conversion"
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
          {AREA_UNITS.map((au) => (
            <div key={au.id} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{au.label}</dt>
              <dd className="text-right font-semibold">
                {hasError ? DASH : N4.format(result.areas[au.id])}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What it costs</h2>
        {hasError || !result.pricing ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {hasError ? DASH : "Enter a rate above to price this area."}
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
                    <th scope="col" className="py-2 pr-3 font-semibold">Same price expressed as</th>
                    <th scope="col" className="py-2 text-right font-semibold">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {AREA_UNITS.map((au) => (
                    <tr key={au.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">Per {au.short}</td>
                      <td className="py-2 text-right font-semibold">
                        {INR2.format(result.pricing.perUnit[au.id])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Conversions are exact — a foot is defined as 0.3048 m, so a square foot is exactly
        0.09290304 sq m. Builders quote carpet, built-up and super built-up areas differently, so
        confirm which one a rate applies to before comparing two projects.
      </p>
    </main>
  );
}
