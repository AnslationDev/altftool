"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Mountain, RotateCcw } from "lucide-react";

import {
  CABIN_ALTITUDE_LIMIT_FT,
  REFERENCE_ALTITUDES,
  convertAltitude,
  describeAltitude,
} from "../lib";

const DEFAULTS = { value: "17600", unit: "ft" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const n0 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
const n1 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });

const BAND_TONE = {
  low: "text-[var(--success)]",
  moderate: "text-[var(--success)]",
  high: "text-[var(--primary)]",
  "very-high": "text-[var(--danger)]",
  extreme: "text-[var(--danger)]",
};

export default function ToolHome() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => describeAltitude({ value: Number(String(value).replace(/,/g, "").trim()), from: unit }),
    [value, unit],
  );

  const ok = !result.error;
  const headline = ok
    ? unit === "ft"
      ? `${n0.format(result.metres)} m`
      : `${n0.format(result.feet)} ft`
    : DASH;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Altitude conversion",
      `${n0.format(result.feet)} ft = ${n0.format(result.metres)} m`,
      `Standard air pressure: ${n0.format(result.pressureHpa)} hPa (${n0.format(result.oxygenAvailablePercent)}% of sea level)`,
      `Effective oxygen: ${n1.format(result.effectiveOxygenPercent)}% (sea level is 20.95%)`,
      `Standard air temperature: ${n1.format(result.temperatureC)}°C`,
      `Water boils at about ${n1.format(result.boilingPointC)}°C`,
      `Band: ${result.band.label} — ${result.band.note}`,
    ].join("\n");
  }, [ok, result]);

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
    setValue(DEFAULTS.value);
    setUnit(DEFAULTS.unit);
    setCopied(false);
  };

  const rows = [
    ["In metres", ok ? `${n0.format(result.metres)} m` : DASH],
    ["In feet", ok ? `${n0.format(result.feet)} ft` : DASH],
    ["In kilometres", ok ? `${n1.format(result.kilometres)} km` : DASH],
    ["Standard air pressure", ok ? `${n0.format(result.pressureHpa)} hPa` : DASH],
    ["Pressure as a share of sea level", ok ? `${n0.format(result.oxygenAvailablePercent)}%` : DASH],
    ["Effective oxygen (sea level = 20.95%)", ok ? `${n1.format(result.effectiveOxygenPercent)}%` : DASH],
    ["Standard air temperature", ok ? `${n1.format(result.temperatureC)}°C` : DASH],
    ["Water boils at about", ok ? `${n1.format(result.boilingPointC)}°C` : DASH],
    [
      `Versus the ${n0.format(CABIN_ALTITUDE_LIMIT_FT)} ft cabin limit`,
      ok ? (result.aboveCabinLimit ? "Thinner air than a pressurised cabin" : "No thinner than a pressurised cabin") : DASH,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mountain className="h-4 w-4" aria-hidden="true" />
          Altitude
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Feet to Metres Altitude Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a trek or flight altitude between feet and metres — one foot is exactly 0.3048 m —
          and see the standard-atmosphere pressure, effective oxygen and altitude band that come with it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="alt-value">
              Altitude
            </label>
            <input
              id="alt-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="10"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alt-unit">
              Given in
            </label>
            <select
              id="alt-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="ft">Feet</option>
              <option value="m">Metres</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {REFERENCE_ALTITUDES.slice(0, 4).map((entry) => (
            <button
              key={entry.metres}
              type="button"
              onClick={() => {
                setUnit("m");
                setValue(String(entry.metres));
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {n0.format(entry.metres)} m
            </button>
          ))}
        </div>
      </section>

      {result.error && (
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
              {unit === "ft" ? "That altitude in metres" : "That altitude in feet"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p
              className={`mt-2 text-sm font-semibold ${
                ok ? BAND_TONE[result.band.key] : "text-[var(--muted-foreground)]"
              }`}
            >
              {ok ? result.band.label : "Fix the input above to see the conversion."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the converted altitude" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.band.note}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, figure]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{figure}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Altitudes you might meet</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Metres</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Feet</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Effective O₂</th>
                <th scope="col" className="py-2 font-semibold">Where</th>
              </tr>
            </thead>
            <tbody>
              {REFERENCE_ALTITUDES.map((entry) => {
                const described = describeAltitude({ value: entry.metres, from: "m" });
                const feet = convertAltitude({ value: entry.metres, from: "m" });
                return (
                  <tr key={entry.metres} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{n0.format(entry.metres)}</td>
                    <td className="py-2 pr-3 text-right">{feet.error ? DASH : n0.format(feet.feet)}</td>
                    <td className="py-2 pr-3 text-right">
                      {described.error ? DASH : `${n1.format(described.effectiveOxygenPercent)}%`}
                    </td>
                    <td className="py-2 text-[var(--muted-foreground)]">{entry.what}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Pressure and temperature come from the International Standard Atmosphere, a reference model —
        real conditions vary with weather, season and latitude, and are often several percent higher
        near the equator. The altitude bands are general guidance, not medical advice; acute mountain
        sickness, HAPE and HACE can affect fit people, and anyone planning to sleep above about
        2,500 m should read proper acclimatisation guidance and speak to a travel-medicine clinician.
      </p>
    </main>
  );
}
