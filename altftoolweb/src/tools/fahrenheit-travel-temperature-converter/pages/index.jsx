"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Thermometer } from "lucide-react";

import { PACKING_BANDS, dailyPackingPlan } from "../lib";

const DEFAULTS = {
  high: "95",
  low: "72",
  unit: "F",
  humidity: "65",
  wind: "8",
  windUnit: "mph",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const n1 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 });
const n0 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });

const degC = (value) => (Number.isFinite(value) ? `${n1.format(value)}°C` : DASH);
const degF = (value) => (Number.isFinite(value) ? `${n1.format(value)}°F` : DASH);

export default function ToolHome() {
  const [high, setHigh] = useState(DEFAULTS.high);
  const [low, setLow] = useState(DEFAULTS.low);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [humidity, setHumidity] = useState(DEFAULTS.humidity);
  const [wind, setWind] = useState(DEFAULTS.wind);
  const [windUnit, setWindUnit] = useState(DEFAULTS.windUnit);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      dailyPackingPlan({
        high: Number(String(high).trim()),
        low: Number(String(low).trim()),
        unit,
        humidity: Number(String(humidity).trim()),
        windSpeed: Number(String(wind).trim()),
        windUnit,
      }),
    [high, low, unit, humidity, wind, windUnit],
  );

  const ok = !plan.error;

  const headline = ok ? (unit === "F" ? degC(plan.high.celsius) : degF(plan.high.fahrenheit)) : DASH;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Travel temperature conversion",
      `Daytime high: ${degC(plan.high.celsius)} / ${degF(plan.high.fahrenheit)}`,
      `Overnight low: ${degC(plan.low.celsius)} / ${degF(plan.low.fahrenheit)}`,
      `Day-to-night swing: ${n1.format(plan.swingC)}°C (${n1.format(plan.swingF)}°F)`,
      plan.heatIndex.applicable
        ? `Feels like in the afternoon: ${degC(plan.heatIndex.celsius)} / ${degF(plan.heatIndex.fahrenheit)}`
        : "",
      plan.windChill.applicable
        ? `Feels like at night with wind: ${degC(plan.windChill.celsius)} / ${degF(plan.windChill.fahrenheit)}`
        : "",
      `Daytime band: ${plan.dayBand.label} — ${plan.dayBand.pack}`,
      `Night band: ${plan.nightBand.label}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [ok, plan]);

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
    setHigh(DEFAULTS.high);
    setLow(DEFAULTS.low);
    setUnit(DEFAULTS.unit);
    setHumidity(DEFAULTS.humidity);
    setWind(DEFAULTS.wind);
    setWindUnit(DEFAULTS.windUnit);
    setCopied(false);
  };

  const rows = [
    ["Daytime high", ok ? `${degC(plan.high.celsius)} / ${degF(plan.high.fahrenheit)}` : DASH],
    ["Overnight low", ok ? `${degC(plan.low.celsius)} / ${degF(plan.low.fahrenheit)}` : DASH],
    ["Day-to-night swing", ok ? `${n1.format(plan.swingC)}°C (${n1.format(plan.swingF)}°F)` : DASH],
    ["High in kelvin", ok ? `${n1.format(plan.high.kelvin)} K` : DASH],
    [
      "Afternoon heat index",
      ok && plan.heatIndex.applicable ? `${degC(plan.heatIndex.celsius)} / ${degF(plan.heatIndex.fahrenheit)}` : DASH,
    ],
    [
      "Night wind chill",
      ok && plan.windChill.applicable ? `${degC(plan.windChill.celsius)} / ${degF(plan.windChill.fahrenheit)}` : DASH,
    ],
    ["Wind used for the chill figure", ok ? `${n1.format(plan.windMph)} mph` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Thermometer className="h-4 w-4" aria-hidden="true" />
          Forecast reading
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Fahrenheit Travel Temperature Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a forecast high and low between Fahrenheit and Celsius, add the National Weather
          Service heat index and wind chill, and get a packing hint for the band you land in.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="temp-high">
              Forecast daytime high
            </label>
            <input
              id="temp-high"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="1"
              value={high}
              onChange={(event) => setHigh(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="temp-low">
              Forecast overnight low
            </label>
            <input
              id="temp-low"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              step="1"
              value={low}
              onChange={(event) => setLow(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="temp-unit">
              Forecast is in
            </label>
            <select
              id="temp-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              <option value="F">Fahrenheit</option>
              <option value="C">Celsius</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="temp-humidity">
              Relative humidity (%)
            </label>
            <input
              id="temp-humidity"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={humidity}
              onChange={(event) => setHumidity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="temp-wind">
              Wind speed
            </label>
            <input
              id="temp-wind"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={wind}
              onChange={(event) => setWind(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="temp-wind-unit">
              Wind unit
            </label>
            <select
              id="temp-wind-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={windUnit}
              onChange={(event) => setWindUnit(event.target.value)}
            >
              <option value="mph">mph</option>
              <option value="kmh">km/h</option>
            </select>
          </div>
        </div>
      </section>

      {plan.error && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {unit === "F" ? "Daytime high in Celsius" : "Daytime high in Fahrenheit"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${plan.dayBand.label} by day, ${plan.nightBand.label.toLowerCase()} overnight`
                : "Fix the inputs above to see the conversion."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the converted temperatures" className={GHOST_BTN}>
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
          <div className="mt-4 space-y-2">
            <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--foreground)]">Pack for the day: </span>
              {plan.dayBand.pack}
            </p>
            {plan.needsLayers && (
              <p className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
                <span className="font-semibold text-[var(--foreground)]">And for the night: </span>
                {plan.nightBand.pack}
              </p>
            )}
            {!plan.heatIndex.applicable && plan.heatIndex.reason && (
              <p className="text-xs text-[var(--muted-foreground)]">{plan.heatIndex.reason}</p>
            )}
            {!plan.windChill.applicable && plan.windChill.reason && (
              <p className="text-xs text-[var(--muted-foreground)]">{plan.windChill.reason}</p>
            )}
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Packing bands</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Up to</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Band</th>
                <th scope="col" className="py-2 font-semibold">Pack</th>
              </tr>
            </thead>
            <tbody>
              {PACKING_BANDS.map((band) => (
                <tr
                  key={band.key}
                  className={`border-b border-[var(--border)] last:border-0 ${
                    ok && band.key === plan.dayBand.key ? "bg-[var(--muted)]" : ""
                  }`}
                >
                  <td className="py-2 pr-3 font-semibold">
                    {Number.isFinite(band.maxC) ? `${n0.format(band.maxC)}°C` : "above"}
                  </td>
                  <td className="py-2 pr-3">{band.label}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{band.pack}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Packing bands are general guidance, not health advice. The heat index assumes shade and light
        wind — direct sun can add roughly 8°C to what your body experiences — and heat illness or
        frostbite risk depends on your health, medication, activity and how acclimatised you are. If
        you have a medical condition affected by heat or cold, ask a clinician before the trip.
      </p>
    </main>
  );
}
