"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Fuel, RotateCcw } from "lucide-react";

import { REFERENCE_ECONOMY, UNITS, convertFuelEconomy, tripFuel } from "../lib";

const DEFAULTS = { value: "15", unit: "kmpl", distance: "600" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const n2 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });
const n1 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });

export default function ToolHome() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convertFuelEconomy({ value: Number(String(value).replace(/,/g, "").trim()), unit }),
    [value, unit],
  );

  const trip = useMemo(() => {
    if (result.error) return { error: "" };
    return tripFuel({ kmpl: result.kmpl, distanceKm: Number(String(distance).trim()) });
  }, [result, distance]);

  const ok = !result.error;
  const tripOk = ok && !trip.error;
  const error = result.error || (trip.error ? trip.error : "");

  const headline = useMemo(() => {
    if (!ok) return DASH;
    if (unit === "l100km") return `${n2.format(result.kmpl)} km/l`;
    return `${n2.format(result.l100km)} l/100 km`;
  }, [ok, unit, result]);

  const headlineLabel = unit === "l100km" ? "That economy in kilometres per litre" : "That economy in litres per 100 km";

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Fuel economy conversion",
      `${n2.format(result.kmpl)} km/l`,
      `${n2.format(result.l100km)} l/100 km`,
      `${n2.format(result.mpgUs)} mpg (US gallon)`,
      `${n2.format(result.mpgImperial)} mpg (imperial gallon)`,
      `${n2.format(result.milesPerLitre)} miles per litre`,
      tripOk ? `Fuel for ${n1.format(trip.distanceKm)} km: ${n2.format(trip.litres)} litres` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, result, trip, tripOk]);

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
    setDistance(DEFAULTS.distance);
    setCopied(false);
  };

  const rows = [
    ["Kilometres per litre", ok ? `${n2.format(result.kmpl)} km/l` : DASH],
    ["Litres per 100 km", ok ? `${n2.format(result.l100km)} l/100 km` : DASH],
    ["Miles per US gallon", ok ? `${n2.format(result.mpgUs)} mpg` : DASH],
    ["Miles per imperial gallon", ok ? `${n2.format(result.mpgImperial)} mpg` : DASH],
    ["Miles per litre", ok ? `${n2.format(result.milesPerLitre)} mi/l` : DASH],
    ["Fuel for the trip above", tripOk ? `${n2.format(trip.litres)} litres` : DASH],
    ["Same in US gallons", tripOk ? `${n2.format(trip.usGallons)} gal` : DASH],
    ["Same in imperial gallons", tripOk ? `${n2.format(trip.imperialGallons)} gal` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Fuel className="h-4 w-4" aria-hidden="true" />
          Fuel economy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Fuel Economy Unit Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert km/l, l/100 km, US mpg and imperial mpg in one step, and see how much fuel a given
          distance would take. US and imperial gallons differ by 20%, so the two mpg figures are not
          interchangeable.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fe-value">
              Fuel economy figure
            </label>
            <input
              id="fe-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fe-unit">
              Given in
            </label>
            <select
              id="fe-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {UNITS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fe-distance">
              Trip distance (km)
            </label>
            <input
              id="fe-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
            />
          </div>
        </div>
      </section>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5" aria-live="polite" role="status">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {headlineLabel}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `Also ${n2.format(result.mpgUs)} mpg on a US gallon and ${n2.format(result.mpgImperial)} mpg on an imperial gallon`
                : "Fix the input above to see the conversion."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the converted fuel economy" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

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
        <h2 className="text-base font-semibold">A sense of scale</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">km/l</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">l/100 km</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">mpg US</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">mpg imp</th>
                <th scope="col" className="py-2 font-semibold">Typical of</th>
              </tr>
            </thead>
            <tbody>
              {REFERENCE_ECONOMY.map((row) => {
                const converted = convertFuelEconomy({ value: row.kmpl, unit: "kmpl" });
                return (
                  <tr key={row.kmpl} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.kmpl}</td>
                    <td className="py-2 pr-3 text-right">{n1.format(converted.l100km)}</td>
                    <td className="py-2 pr-3 text-right">{n1.format(converted.mpgUs)}</td>
                    <td className="py-2 pr-3 text-right">{n1.format(converted.mpgImperial)}</td>
                    <td className="py-2 text-[var(--muted-foreground)]">{row.what}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Conversions are exact; the economy itself is not. Brochure figures come from a test cycle
        (WLTP, EPA or ARAI depending on the market) and real driving with air-conditioning, a full
        load, hills or heavy traffic typically returns less.
      </p>
    </main>
  );
}
