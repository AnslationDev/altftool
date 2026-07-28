"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";
import { convertTreadmillPace, formatPace } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const n2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);
const n0 = (v) => (Number.isFinite(v) ? NUM0.format(v) : DASH);

const DEFAULTS = {
  speed: "10",
  speedUnit: "kmh",
  incline: "1",
  weightKg: "70",
  minutes: "30",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [speed, setSpeed] = useState(DEFAULTS.speed);
  const [speedUnit, setSpeedUnit] = useState(DEFAULTS.speedUnit);
  const [incline, setIncline] = useState(DEFAULTS.incline);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => convertTreadmillPace({ speed, speedUnit, incline, weightKg, minutes }),
    [speed, speedUnit, incline, weightKg, minutes],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Treadmill Pace Converter",
      `Belt: ${n2(result.speedKmh)} km/h (${n2(result.speedMph)} mph) at ${n1(result.incline)}% incline`,
      `Belt pace: ${formatPace(result.paceSecPerKm)} /km · ${formatPace(result.paceSecPerMile)} /mile`,
      `Flat-equivalent effort: ${n2(result.flatEquivalentKmh)} km/h (${formatPace(result.flatEquivalentSecPerKm)} /km)`,
      `Outdoor-equivalent pace: ${formatPace(result.outdoorEquivalentSecPerKm)} /km`,
      `Intensity: ${n1(result.mets)} METs · VO2 ${n1(result.vo2)} mL/kg/min`,
      `Session: ${n2(result.distanceKm)} km, about ${n0(result.calories)} kcal`,
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
    setSpeed(DEFAULTS.speed);
    setSpeedUnit(DEFAULTS.speedUnit);
    setIncline(DEFAULTS.incline);
    setWeightKg(DEFAULTS.weightKg);
    setMinutes(DEFAULTS.minutes);
    setCopied(false);
  };

  const rows = [
    ["Belt pace per mile", ok ? `${formatPace(result.paceSecPerMile)} /mile` : DASH],
    ["Belt speed", ok ? `${n2(result.speedKmh)} km/h · ${n2(result.speedMph)} mph` : DASH],
    [
      "Same effort on a flat belt",
      ok ? `${n2(result.flatEquivalentKmh)} km/h (${formatPace(result.flatEquivalentSecPerKm)} /km)` : DASH,
    ],
    [
      "Same effort running outdoors",
      ok ? `${n2(result.outdoorEquivalentKmh)} km/h (${formatPace(result.outdoorEquivalentSecPerKm)} /km)` : DASH,
    ],
    ["Incline adds", ok ? `${n1(result.inclineBoostPct)}% to the flat-speed equivalent` : DASH],
    ["Intensity", ok ? `${n1(result.mets)} METs` : DASH],
    ["Estimated VO2", ok ? `${n1(result.vo2)} mL/kg/min` : DASH],
    ["Energy cost", ok ? `${n1(result.kcalPerMin)} kcal/min` : DASH],
    ["Session distance", ok ? `${n2(result.distanceKm)} km · ${n2(result.distanceMiles)} miles` : DASH],
    ["Session energy", ok ? `${n0(result.calories)} kcal` : DASH],
    ["Equation used", ok ? (result.gait === "run" ? "ACSM running" : "ACSM walking") : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Running
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Treadmill Pace Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a belt speed into min/km and min/mile pace, then see what the same effort would be on a
          flat belt and out on the road, using the ACSM metabolic equations and the 1% wind-resistance
          allowance.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tpc-speed">
              Belt speed
            </label>
            <input
              id="tpc-speed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={speed}
              onChange={(event) => setSpeed(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tpc-unit">
              Speed unit
            </label>
            <select
              id="tpc-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={speedUnit}
              onChange={(event) => setSpeedUnit(event.target.value)}
            >
              <option value="kmh">km/h</option>
              <option value="mph">mph</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tpc-incline">
              Incline (% grade)
            </label>
            <input
              id="tpc-incline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-5"
              max="40"
              step="0.5"
              value={incline}
              onChange={(event) => setIncline(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tpc-weight">
              Body weight (kg)
            </label>
            <input
              id="tpc-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="300"
              step="0.5"
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tpc-minutes">
              Session length (minutes)
            </label>
            <input
              id="tpc-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="600"
              step="1"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["0", "1", "2", "5", "10"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setIncline(value)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {value}% incline
            </button>
          ))}
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Belt pace
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${formatPace(result.paceSecPerKm)} /km` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${n2(result.speedKmh)} km/h at ${n1(result.incline)}% — feels like ${formatPace(result.flatEquivalentSecPerKm)} /km on the flat`
                : "Fix the highlighted input to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy treadmill pace result"
              className={GHOST_BTN}
              disabled={!ok}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && result.notes.length > 0 ? (
        <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
          {result.notes.map((note) => (
            <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
              {note}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimates from population-average equations. Individual running economy,
        treadmill calibration, wind and terrain all shift the real numbers. Speak to a clinician
        before starting hard incline work if you have a heart or joint condition.
      </p>
    </main>
  );
}
