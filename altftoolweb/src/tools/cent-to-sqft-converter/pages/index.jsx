"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MapPinned, RotateCcw } from "lucide-react";

import { LAND_UNITS, LENGTH_UNITS, convertLand, splitIntoShares } from "../lib";

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
  const [value, setValue] = useState("5");
  const [unit, setUnit] = useState("cent");
  const [length, setLength] = useState("40");
  const [width, setWidth] = useState("60");
  const [lengthUnit, setLengthUnit] = useState("ft");
  const [rate, setRate] = useState("800000");
  const [rateUnit, setRateUnit] = useState("cent");
  const [shares, setShares] = useState("4");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      convertLand({
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

  const split = useMemo(() => {
    if (hasError) return { error: result.error };
    return splitIntoShares({ sqft: result.sqft, shares: Number.parseInt(shares, 10) });
  }, [hasError, result, shares]);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = ["Cent to square feet conversion"];
    LAND_UNITS.forEach((lu) => {
      lines.push(`${lu.label}: ${N4.format(result.areas[lu.id])}`);
    });
    if (result.pricing) {
      lines.push(`Total value: ${INR.format(result.pricing.total)}`);
      lines.push(`Rate per cent: ${INR2.format(result.pricing.perUnit.cent)}`);
      lines.push(`Rate per sq ft: ${INR2.format(result.pricing.perUnit.sqft)}`);
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
    setValue("5");
    setUnit("cent");
    setLength("40");
    setWidth("60");
    setLengthUnit("ft");
    setRate("800000");
    setRateUnit("cent");
    setShares("4");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MapPinned className="h-4 w-4" aria-hidden="true" />
          Land area
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Cent to Sqft Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A cent is one hundredth of an acre — exactly 435.6 square feet. Convert between cent,
          ground, ankanam, guntha, are, acre and hectare, price the parcel from a rate per cent, and
          split it into equal shares.
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
              <label className={LABEL_CLASS} htmlFor="cent-value">
                Area
              </label>
              <input
                id="cent-value"
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
              <label className={LABEL_CLASS} htmlFor="cent-unit">
                Unit
              </label>
              <select
                id="cent-unit"
                className={`mt-2 ${INPUT_CLASS}`}
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
              >
                {LAND_UNITS.map((lu) => (
                  <option key={lu.id} value={lu.id}>
                    {lu.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="cent-length">
                Length
              </label>
              <input
                id="cent-length"
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
              <label className={LABEL_CLASS} htmlFor="cent-width">
                Width
              </label>
              <input
                id="cent-width"
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
              <label className={LABEL_CLASS} htmlFor="cent-lengthunit">
                Measured in
              </label>
              <select
                id="cent-lengthunit"
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
            <label className={LABEL_CLASS} htmlFor="cent-rate">
              Rate (₹, leave blank to skip pricing)
            </label>
            <input
              id="cent-rate"
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
            <label className={LABEL_CLASS} htmlFor="cent-rateunit">
              Rate is quoted per
            </label>
            <select
              id="cent-rateunit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={rateUnit}
              onChange={(event) => setRateUnit(event.target.value)}
            >
              {LAND_UNITS.map((lu) => (
                <option key={lu.id} value={lu.id}>
                  {lu.short}
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
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              In square feet
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${N2.format(result.areas.sqft)} sq ft`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the conversion."
                : `${N4.format(result.areas.cent)} cent · ${N2.format(result.areas.sqm)} sq m`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy land area conversion"
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

        <dl
          className="mt-5 divide-y divide-[var(--border)] text-sm"
          aria-live="polite"
          aria-atomic="true"
        >
          {LAND_UNITS.map((lu) => (
            <div key={lu.id} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{lu.label}</dt>
              <dd className="text-right font-semibold">
                {hasError ? DASH : N4.format(result.areas[lu.id])}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Land value</h2>
        <div aria-live="polite" aria-atomic="true">
          {hasError || !result.pricing ? (
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : "Enter a rate above to value this parcel."}
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
                    {LAND_UNITS.map((lu) => (
                      <tr key={lu.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3">Per {lu.short}</td>
                        <td className="py-2 text-right font-semibold">
                          {INR2.format(result.pricing.perUnit[lu.id])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Split into equal shares</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cent-shares">
              Number of shares
            </label>
            <input
              id="cent-shares"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={shares}
              onChange={(event) => setShares(event.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end" aria-live="polite" aria-atomic="true">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Each share
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {split.error ? DASH : `${N2.format(split.perShareSqft)} sq ft`}
            </p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {split.error ? split.error : `${N4.format(split.perShareCent)} cent per share`}
            </p>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Cent, guntha and acre are fixed ratios and convert exactly. Ground and ankanam are local
        customary units — the figures used here are the common ones, but the area in your patta,
        RTC or sale deed is what governs a transaction.
      </p>
    </main>
  );
}
