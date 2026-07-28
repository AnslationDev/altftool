"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Timer } from "lucide-react";

import { DEFAULT_STEP_TARGET, estimateStepTime, formatMinutes } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";
const one = (value) => (Number.isFinite(value) ? NUM1.format(value) : DASH);
const two = (value) => (Number.isFinite(value) ? NUM2.format(value) : DASH);
const zero = (value) => (Number.isFinite(value) ? NUM0.format(value) : DASH);

const DEFAULTS = {
  target: String(DEFAULT_STEP_TARGET),
  cadence: "110",
  height: "170",
  sex: "average",
  incidental: "3000",
  sessions: "3",
  weight: "70",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return 0;
  return Number(trimmed.replace(/,/g, ""));
};

export default function ToolHome() {
  const [target, setTarget] = useState(DEFAULTS.target);
  const [cadence, setCadence] = useState(DEFAULTS.cadence);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [incidental, setIncidental] = useState(DEFAULTS.incidental);
  const [sessions, setSessions] = useState(DEFAULTS.sessions);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateStepTime({
        stepTarget: toNumber(target),
        cadence: toNumber(cadence),
        heightCm: toNumber(height),
        sex,
        incidentalSteps: toNumber(incidental),
        sessions: toNumber(sessions),
        weightKg: toNumber(weight),
      }),
    [target, cadence, height, sex, incidental, sessions, weight],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "10,000 Steps Time Estimator",
      `Target: ${zero(result.stepTarget)} steps at ${zero(result.cadence)} steps/min`,
      `Total walking time: ${formatMinutes(result.totalMinutes)}`,
      `Distance: ${two(result.totalDistanceKm)} km (${two(result.totalDistanceMiles)} mi)`,
      `Pace: ${two(result.speedKmh)} km/h — ${result.bandLabel} intensity, ${one(result.met)} METs`,
      result.hasWeight ? `Calories: ${zero(result.kcal)} kcal` : "",
      `Still to walk: ${zero(result.remainingSteps)} steps (${formatMinutes(result.remainingMinutes)})`,
      result.sessions > 0
        ? `Split over ${zero(result.sessions)} walks: ${zero(result.perSessionSteps)} steps each, ${formatMinutes(result.perSessionMinutes)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
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
    setTarget(DEFAULTS.target);
    setCadence(DEFAULTS.cadence);
    setHeight(DEFAULTS.height);
    setSex(DEFAULTS.sex);
    setIncidental(DEFAULTS.incidental);
    setSessions(DEFAULTS.sessions);
    setWeight(DEFAULTS.weight);
    setCopied(false);
  };

  const rows = [
    ["Distance covered", ok ? `${two(result.totalDistanceKm)} km · ${two(result.totalDistanceMiles)} mi` : DASH],
    ["Estimated step length", ok ? `${two(result.stepLengthM)} m` : DASH],
    ["Walking speed", ok ? `${two(result.speedKmh)} km/h · ${two(result.speedMph)} mph` : DASH],
    ["Intensity", ok ? `${result.bandLabel} · ${one(result.met)} METs` : DASH],
    ["Calories for the full target", ok && result.hasWeight ? `${zero(result.kcal)} kcal` : DASH],
    ["Steps already taken today", ok ? zero(result.incidentalSteps) : DASH],
    [
      "Still to walk",
      ok
        ? result.goalAlreadyMet
          ? "Target already met"
          : `${zero(result.remainingSteps)} steps · ${formatMinutes(result.remainingMinutes)}`
        : DASH,
    ],
    [
      "Calories for what is left",
      ok && result.hasWeight ? `${zero(result.remainingKcal)} kcal` : DASH,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Walking &amp; steps
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          10,000 Steps Time Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out how long a daily step target really takes at your own cadence and height, how far
          that is, and how to break the remainder into walks that fit the day.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="st-target">
              Daily step target
            </label>
            <input
              id="st-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="500"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-cadence">
              Cadence (steps per minute)
            </label>
            <input
              id="st-cadence"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="20"
              max="250"
              step="1"
              value={cadence}
              onChange={(event) => setCadence(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-height">
              Height (cm)
            </label>
            <input
              id="st-height"
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
            <label className={LABEL_CLASS} htmlFor="st-sex">
              Step-length basis
            </label>
            <select
              id="st-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="average">Average (0.414 x height)</option>
              <option value="male">Male (0.415 x height)</option>
              <option value="female">Female (0.413 x height)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-incidental">
              Steps already taken today
            </label>
            <input
              id="st-incidental"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={incidental}
              onChange={(event) => setIncidental(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-sessions">
              Split the rest over how many walks
            </label>
            <input
              id="st-sessions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={sessions}
              onChange={(event) => setSessions(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="st-weight">
              Body weight (kg, optional)
            </label>
            <input
              id="st-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[6000, 8000, 10000, 12000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setTarget(String(preset))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {zero(preset)} steps
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
              Time for the full target
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? formatMinutes(result.totalMinutes) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? result.bandNote : "Fix the inputs above to see your estimate."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy step time estimate"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your walks for the rest of the day</h2>
        {ok && !result.goalAlreadyMet ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Walk
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Steps
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: result.sessions }, (unused, index) => (
                  <tr key={`walk-${index + 1}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">Walk {index + 1}</td>
                    <td className="py-2 pr-3 text-right">{zero(result.perSessionSteps)}</td>
                    <td className="py-2 text-right">{formatMinutes(result.perSessionMinutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            {ok ? "You have already passed the target for today." : DASH}
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate. The 10,000-step figure began as a 1960s pedometer marketing number;
        research since suggests meaningful benefits start well below it, so treat the target as a
        habit cue rather than a clinical prescription.
      </p>
    </main>
  );
}
