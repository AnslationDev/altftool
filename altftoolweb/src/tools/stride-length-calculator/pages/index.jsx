"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Footprints, RotateCcw } from "lucide-react";

import {
  REFERENCE_CADENCE_SPM,
  TYPICAL_STEP_LENGTH_M,
  computeStride,
  formatPace,
  paceToSeconds,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";

const num = (value, fmt = NUM2) => (Number.isFinite(value) ? fmt.format(value) : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const MODES = [
  { id: "cadence", label: "Cadence + pace" },
  { id: "steps", label: "Steps over a distance" },
  { id: "height", label: "From height" },
];

const DEFAULTS = {
  cadence: "170",
  paceMin: "5",
  paceSec: "30",
  distance: "400",
  steps: "350",
  duration: "120",
  height: "175",
  sex: "male",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const BAND_TEXT = {
  short: "Below the usual running band — expect a quicker, choppier turnover.",
  typical: `Inside the usual running band (${TYPICAL_STEP_LENGTH_M.min}–${TYPICAL_STEP_LENGTH_M.max} m per step).`,
  long: "Above the usual running band — typical of sprinting or of overstriding.",
};

export default function ToolHome() {
  const [mode, setMode] = useState("cadence");
  const [cadence, setCadence] = useState(DEFAULTS.cadence);
  const [paceMin, setPaceMin] = useState(DEFAULTS.paceMin);
  const [paceSec, setPaceSec] = useState(DEFAULTS.paceSec);
  const [distance, setDistance] = useState(DEFAULTS.distance);
  const [steps, setSteps] = useState(DEFAULTS.steps);
  const [duration, setDuration] = useState(DEFAULTS.duration);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === "steps") {
      const d = toNumber(distance);
      const s = toNumber(steps);
      const t = toNumber(duration);
      if (Number.isNaN(d) || Number.isNaN(s)) {
        return { error: "Enter the distance covered and the number of steps you counted." };
      }
      return computeStride({
        mode: "steps",
        distanceM: d,
        steps: s,
        durationSec: Number.isNaN(t) ? undefined : t,
      });
    }

    if (mode === "height") {
      const h = toNumber(height);
      if (Number.isNaN(h)) return { error: "Enter your height in centimetres." };
      return computeStride({ mode: "height", heightCm: h, sex });
    }

    const c = toNumber(cadence);
    const m = toNumber(paceMin);
    const s = toNumber(paceSec);
    if (Number.isNaN(c) || Number.isNaN(m) || Number.isNaN(s)) {
      return { error: "Enter a cadence in steps per minute and a pace per kilometre." };
    }
    if (m < 0 || s < 0) return { error: "Pace cannot be negative." };
    return computeStride({ mode: "cadence", cadenceSpm: c, paceSecPerKm: paceToSeconds(m, s) });
  }, [mode, cadence, paceMin, paceSec, distance, steps, duration, height, sex]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Stride Length Calculator",
      `Step length: ${num(result.stepLengthCm)} cm (${num(result.stepLengthM)} m)`,
      `Stride length: ${num(result.strideLengthCm)} cm (${num(result.strideLengthM)} m)`,
      `Steps per km: ${num(result.stepsPerKm, NUM0)}`,
      `Strides per km: ${num(result.stridesPerKm, NUM0)}`,
    ];
    if (Number.isFinite(result.cadenceSpm)) {
      lines.push(`Cadence: ${num(result.cadenceSpm, NUM0)} spm`);
    }
    if (Number.isFinite(result.paceSecPerKm)) {
      lines.push(`Pace: ${formatPace(result.paceSecPerKm)} /km`);
    }
    if (Number.isFinite(result.speedKmh)) {
      lines.push(`Speed: ${num(result.speedKmh)} km/h`);
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
    setCadence(DEFAULTS.cadence);
    setPaceMin(DEFAULTS.paceMin);
    setPaceSec(DEFAULTS.paceSec);
    setDistance(DEFAULTS.distance);
    setSteps(DEFAULTS.steps);
    setDuration(DEFAULTS.duration);
    setHeight(DEFAULTS.height);
    setSex(DEFAULTS.sex);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Step length", DASH],
        ["Steps per kilometre", DASH],
        ["Strides per kilometre", DASH],
        ["Steps per mile", DASH],
        ["Cadence", DASH],
        ["Pace", DASH],
        ["Speed", DASH],
      ]
    : [
        ["Step length", `${num(result.stepLengthCm)} cm · ${num(result.stepLengthFt)} ft`],
        ["Steps per kilometre", num(result.stepsPerKm, NUM0)],
        ["Strides per kilometre", num(result.stridesPerKm, NUM0)],
        ["Steps per mile", num(result.stepsPerMile, NUM0)],
        [
          "Cadence",
          Number.isFinite(result.cadenceSpm) ? `${num(result.cadenceSpm, NUM0)} spm` : DASH,
        ],
        [
          "Pace",
          Number.isFinite(result.paceSecPerKm) ? `${formatPace(result.paceSecPerKm)} /km` : DASH,
        ],
        ["Speed", Number.isFinite(result.speedKmh) ? `${num(result.speedKmh)} km/h` : DASH],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Footprints className="h-4 w-4" aria-hidden="true" />
          Running form
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Stride Length Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A stride is two steps — one full gait cycle from a foot strike back to the same foot.
          Work yours out from watch cadence and pace, from a counted step test, or from your height.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Choose how to calculate stride length"
        >
          {MODES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setMode(option.id)}
              aria-pressed={mode === option.id}
              className={`min-h-11 rounded-md px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                mode === option.id
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {mode === "cadence" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="stride-cadence">
                Cadence (steps per minute)
              </label>
              <input
                id="stride-cadence"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="30"
                max="300"
                step="1"
                value={cadence}
                onChange={(event) => setCadence(event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Watches report steps per minute, not strides. {REFERENCE_CADENCE_SPM} spm is the
                classic reference point.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLASS} htmlFor="stride-pace-min">
                  Pace minutes / km
                </label>
                <input
                  id="stride-pace-min"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="30"
                  step="1"
                  value={paceMin}
                  onChange={(event) => setPaceMin(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="stride-pace-sec">
                  Pace seconds
                </label>
                <input
                  id="stride-pace-sec"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="59"
                  step="1"
                  value={paceSec}
                  onChange={(event) => setPaceSec(event.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {mode === "steps" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="stride-distance">
                Distance covered (metres)
              </label>
              <input
                id="stride-distance"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="1"
                step="1"
                value={distance}
                onChange={(event) => setDistance(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="stride-steps">
                Steps counted
              </label>
              <input
                id="stride-steps"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={steps}
                onChange={(event) => setSteps(event.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="stride-duration">
                Time taken (seconds, optional)
              </label>
              <input
                id="stride-duration"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Add the time and you also get cadence, pace and speed for that effort.
              </p>
            </div>
          </div>
        )}

        {mode === "height" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="stride-height">
                Height (cm)
              </label>
              <input
                id="stride-height"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="100"
                max="250"
                step="1"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="stride-sex">
                Height factor
              </label>
              <select
                id="stride-sex"
                className={`mt-2 ${INPUT_CLASS}`}
                value={sex}
                onChange={(event) => setSex(event.target.value)}
              >
                <option value="male">Men — height × 0.415</option>
                <option value="female">Women — height × 0.413</option>
              </select>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                A walking pedometer rule of thumb. Running step length is usually longer.
              </p>
            </div>
          </div>
        )}
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
              Stride length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${num(result.strideLengthCm)} cm`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${num(result.strideLengthM)} m per gait cycle · ${num(result.strideLengthFt)} ft`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy stride length result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
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

        {!hasError && result.source !== "height-estimate" && (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            {BAND_TEXT[result.band]}
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Stride length changes with speed, gradient, fatigue and terrain, so measure it at the pace
        you actually care about. Informational only — see a physiotherapist or coach before changing
        your running mechanics.
      </p>
    </main>
  );
}
