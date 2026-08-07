"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, RotateCcw, Sunset } from "lucide-react";

import {
  DESCENT_SLOPES,
  FITNESS_LEVELS,
  NAISMITH_ASCENT_M_PER_HOUR,
  NAISMITH_FLAT_KM_PER_HOUR,
  formatClock,
  formatMinutes,
  formatSunsetPlanText,
  planSunsetTrip,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const PRESETS = [
  { id: "boxhill", label: "Box Hill, UK", latitude: "51.2490", longitude: "-0.3110", utcOffsetHours: "1" },
  { id: "nandi", label: "Nandi Hills, India", latitude: "13.3702", longitude: "77.6835", utcOffsetHours: "5.5" },
  { id: "santorini", label: "Oia, Santorini", latitude: "36.4618", longitude: "25.3753", utcOffsetHours: "3" },
  { id: "haleakala", label: "Haleakalā, Hawaii", latitude: "20.7097", longitude: "-156.2533", utcOffsetHours: "-10" },
];

const DEFAULTS = {
  place: "Box Hill, UK",
  latitude: "51.2490",
  longitude: "-0.3110",
  dateISO: "2026-06-21",
  utcOffsetHours: "1",
  driveMinutes: "60",
  distanceKm: "8",
  ascentM: "900",
  descentM: "0",
  descentSlope: "none",
  fitness: "normal",
  setupMinutes: "20",
  target: "golden",
};

function Field({ id, label, value, onChange, type = "number", min, max, step = "1", hint }) {
  return (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type={type}
        inputMode={type === "number" ? "decimal" : undefined}
        min={min}
        max={max}
        step={type === "number" ? step : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );
}

export default function ToolHome() {
  const [state, setState] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => () => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
  }, []);

  const set = (key) => (value) => setState((current) => ({ ...current, [key]: value }));

  const applyPreset = (preset) =>
    setState((current) => ({
      ...current,
      place: preset.label,
      latitude: preset.latitude,
      longitude: preset.longitude,
      utcOffsetHours: preset.utcOffsetHours,
    }));

  const plan = useMemo(
    () =>
      planSunsetTrip({
        latitude: Number(state.latitude),
        longitude: Number(state.longitude),
        dateISO: state.dateISO,
        utcOffsetHours: Number(state.utcOffsetHours),
        driveMinutes: Number(state.driveMinutes),
        distanceKm: Number(state.distanceKm),
        ascentM: Number(state.ascentM),
        descentM: Number(state.descentM),
        descentSlope: state.descentSlope,
        fitness: state.fitness,
        setupMinutes: Number(state.setupMinutes),
        target: state.target,
      }),
    [state],
  );

  const copyResult = async () => {
    const text = formatSunsetPlanText(plan, state.place);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (typeof window !== "undefined" && !window.confirm("Reset all inputs back to the defaults? Any custom viewpoint, coordinates or trip details you entered will be lost.")) {
      return;
    }
    setState(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sunset className="h-4 w-4" aria-hidden="true" />
          Golden hour
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sunset Viewpoint Timing Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sunset, golden hour and the end of civil twilight from the NOAA solar equations, then the climb
          costed with Naismith's rule — {NAISMITH_FLAT_KM_PER_HOUR} km an hour plus an hour per{" "}
          {NAISMITH_ASCENT_M_PER_HOUR} m of ascent — to give you a departure time.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Where and when</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="svt-place">
              Viewpoint
            </label>
            <input
              id="svt-place"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={state.place}
              onChange={(event) => set("place")(event.target.value)}
            />
          </div>
          <Field
            id="svt-lat"
            label="Latitude (north positive)"
            value={state.latitude}
            onChange={set("latitude")}
            min="-90"
            max="90"
            step="0.0001"
          />
          <Field
            id="svt-lon"
            label="Longitude (east positive)"
            value={state.longitude}
            onChange={set("longitude")}
            min="-180"
            max="180"
            step="0.0001"
          />
          <Field id="svt-date" label="Date" type="date" value={state.dateISO} onChange={set("dateISO")} />
          <Field
            id="svt-tz"
            label="UTC offset on that date (hours)"
            value={state.utcOffsetHours}
            onChange={set("utcOffsetHours")}
            min="-12"
            max="14"
            step="0.5"
            hint="Include summer time — Britain is +1 in June, 0 in December."
          />
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="svt-target">
              Be in position for
            </label>
            <select
              id="svt-target"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.target}
              onChange={(event) => set("target")(event.target.value)}
            >
              <option value="golden">The start of golden hour (sun at +6°)</option>
              <option value="sunset">Sunset itself</option>
            </select>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Getting there</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="svt-drive"
            label="Travel to the trailhead (min)"
            value={state.driveMinutes}
            onChange={set("driveMinutes")}
            min="0"
            step="5"
          />
          <Field
            id="svt-distance"
            label="Walking distance one way (km)"
            value={state.distanceKm}
            onChange={set("distanceKm")}
            min="0"
            max="100"
            step="0.5"
          />
          <Field id="svt-ascent" label="Total ascent (m)" value={state.ascentM} onChange={set("ascentM")} min="0" step="50" />
          <Field id="svt-descent" label="Descent on the way up (m)" value={state.descentM} onChange={set("descentM")} min="0" step="50" />
          <div>
            <label className={LABEL_CLASS} htmlFor="svt-slope">
              What that descent is like
            </label>
            <select
              id="svt-slope"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.descentSlope}
              onChange={(event) => set("descentSlope")(event.target.value)}
            >
              {DESCENT_SLOPES.map((slope) => (
                <option key={slope.id} value={slope.id}>
                  {slope.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="svt-fitness">
              Pace
            </label>
            <select
              id="svt-fitness"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state.fitness}
              onChange={(event) => set("fitness")(event.target.value)}
            >
              {FITNESS_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label} (×{level.factor})
                </option>
              ))}
            </select>
          </div>
          <Field
            id="svt-setup"
            label="Finding the spot and setting up (min)"
            value={state.setupMinutes}
            onChange={set("setupMinutes")}
            min="0"
            step="5"
          />
        </div>
      </section>

      {plan.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Leave home at
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {plan.error ? DASH : formatClock(plan.leaveHome)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan.error
                ? "Fix the input above to work out the departure."
                : `To be in position ${formatMinutes(plan.targetTime - plan.arriveBy)} before ${plan.targetLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the sunset timing plan"
              className={PRIMARY_BTN}
              disabled={Boolean(plan.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Sunset", plan.error ? DASH : formatClock(plan.sun.sunset)],
            ["Golden hour begins", plan.error ? DASH : formatClock(plan.sun.goldenStart)],
            ["Golden hour length", plan.error || plan.goldenLengthMin === null ? DASH : formatMinutes(plan.goldenLengthMin)],
            ["Civil twilight ends", plan.error ? DASH : formatClock(plan.sun.blueEnd)],
            ["Walking time (Naismith)", plan.error ? DASH : formatMinutes(plan.walk.minutes)],
            ["Travel + walk + setting up", plan.error ? DASH : formatMinutes(plan.totalOutboundMin)],
            ["Solar noon", plan.error ? DASH : formatClock(plan.sun.solarNoon)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!plan.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">The evening, in order</h2>
          <ol className="mt-3 divide-y divide-[var(--border)]">
            {plan.timeline.map((step) => (
              <li key={step.id} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                <span className="font-mono font-semibold text-[var(--primary)]">{formatClock(step.at)}</span>
                <span className="text-right text-[var(--muted-foreground)]">{step.label}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {!plan.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the walking time comes from</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[300px] text-left text-sm">
              <tbody>
                {[
                  [`Distance at ${NAISMITH_FLAT_KM_PER_HOUR} km/h`, formatMinutes(plan.walk.flatMinutes)],
                  [`Ascent at 1 h per ${NAISMITH_ASCENT_M_PER_HOUR} m`, formatMinutes(plan.walk.ascentMinutes)],
                  [
                    "Langmuir descent correction",
                    `${plan.walk.descentMinutes >= 0 ? "+" : "−"}${Math.abs(Math.round(plan.walk.descentMinutes))} min`,
                  ],
                  [`Pace factor (${plan.level.label.toLowerCase()})`, `×${plan.level.factor}`],
                  ["Total", formatMinutes(plan.walk.minutes)],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{label}</td>
                    <td className="py-2 text-right font-semibold">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{plan.level.note}</p>

          {plan.notes.length > 0 && (
            <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {plan.notes.map((note) => (
                <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                  {note}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Solar times are computed for a flat horizon at sea level; a ridge or a mountain to the west will cut
        the light short, and altitude extends it slightly. Naismith's rule assumes good ground and fit
        walkers. Plan the descent, carry a torch, and tell someone your route.
      </p>
    </main>
  );
}
