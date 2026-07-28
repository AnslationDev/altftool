"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Timer } from "lucide-react";
import { calculateCadence, formatPace, paceToSeconds } from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const n0 = (v) => (Number.isFinite(v) ? NUM0.format(v) : DASH);
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const n2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);

const DEFAULTS = {
  mode: "window",
  steps: "80",
  windowSeconds: "30",
  countedOneFoot: false,
  directCadence: "170",
  paceMin: "6",
  paceSec: "0",
  heightCm: "170",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [steps, setSteps] = useState(DEFAULTS.steps);
  const [windowSeconds, setWindowSeconds] = useState(DEFAULTS.windowSeconds);
  const [countedOneFoot, setCountedOneFoot] = useState(DEFAULTS.countedOneFoot);
  const [directCadence, setDirectCadence] = useState(DEFAULTS.directCadence);
  const [paceMin, setPaceMin] = useState(DEFAULTS.paceMin);
  const [paceSec, setPaceSec] = useState(DEFAULTS.paceSec);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      calculateCadence({
        mode,
        steps,
        windowSeconds,
        countedOneFoot,
        directCadence,
        paceSecPerKm: paceToSeconds({ minutes: paceMin, seconds: paceSec }),
        heightCm,
      }),
    [mode, steps, windowSeconds, countedOneFoot, directCadence, paceMin, paceSec, heightCm],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Running Cadence Calculator",
      `Cadence: ${n0(result.cadence)} steps per minute (${result.band})`,
      `At ${formatPace(result.paceSecPerKm)} per km`,
      `Step length: ${n1(result.stepLengthCm)} cm · stride ${n2(result.strideLengthM)} m`,
      `Step length is ${n1(result.stepLengthPctHeight)}% of your height`,
      "",
      "Progression targets at the same speed:",
    ];
    result.targets.forEach((target) => {
      lines.push(
        `+${n0(target.incrementPct)}% → ${n0(target.cadence)} spm, step length ${n1(target.stepLengthCm)} cm (${n1(target.stepLengthChangeCm)} cm)`,
      );
    });
    return lines.join("\n");
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
    setMode(DEFAULTS.mode);
    setSteps(DEFAULTS.steps);
    setWindowSeconds(DEFAULTS.windowSeconds);
    setCountedOneFoot(DEFAULTS.countedOneFoot);
    setDirectCadence(DEFAULTS.directCadence);
    setPaceMin(DEFAULTS.paceMin);
    setPaceSec(DEFAULTS.paceSec);
    setHeightCm(DEFAULTS.heightCm);
    setCopied(false);
  };

  const rows = [
    ["Band", ok ? result.band : DASH],
    ["Strides per minute", ok ? n1(result.stridesPerMin) : DASH],
    ["Metronome setting", ok ? `${n0(result.metronomeBpm)} BPM` : DASH],
    ["Step length", ok ? `${n1(result.stepLengthCm)} cm` : DASH],
    ["Stride length", ok ? `${n2(result.strideLengthM)} m` : DASH],
    ["Step length as % of height", ok ? `${n1(result.stepLengthPctHeight)}%` : DASH],
    ["Pace used", ok ? `${formatPace(result.paceSecPerKm)} /km · ${formatPace(result.paceSecPerMile)} /mile` : DASH],
    ["Speed", ok ? `${n2(result.speedKmh)} km/h` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Running form
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Running Cadence Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Count your steps for 30 seconds, add your pace, and get cadence, step length and a 5% then
          10% progression target you can dial into a metronome.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rcc-mode">
              How are you measuring?
            </label>
            <select
              id="rcc-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="window">Count steps over a timed window</option>
              <option value="direct">I already know my cadence</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rcc-height">
              Height (cm)
            </label>
            <input
              id="rcc-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="100"
              max="230"
              step="1"
              value={heightCm}
              onChange={(event) => setHeightCm(event.target.value)}
            />
          </div>
        </div>

        {mode === "window" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="rcc-steps">
                Steps counted
              </label>
              <input
                id="rcc-steps"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={steps}
                onChange={(event) => setSteps(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="rcc-window">
                Counting window (seconds)
              </label>
              <input
                id="rcc-window"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="5"
                max="600"
                step="5"
                value={windowSeconds}
                onChange={(event) => setWindowSeconds(event.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)]"
                htmlFor="rcc-onefoot"
              >
                <input
                  id="rcc-onefoot"
                  type="checkbox"
                  className="h-5 w-5 accent-[var(--primary)]"
                  checked={countedOneFoot}
                  onChange={(event) => setCountedOneFoot(event.target.checked)}
                />
                I counted one foot only
              </label>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="rcc-direct">
                Cadence (steps per minute)
              </label>
              <input
                id="rcc-direct"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="60"
                max="260"
                step="1"
                value={directCadence}
                onChange={(event) => setDirectCadence(event.target.value)}
              />
            </div>
          </div>
        )}

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Pace during the measurement (per km)
          </legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="rcc-pace-min">
                Minutes
              </label>
              <input
                id="rcc-pace-min"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="2"
                step="1"
                value={paceMin}
                onChange={(event) => setPaceMin(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="rcc-pace-sec">
                Seconds
              </label>
              <input
                id="rcc-pace-sec"
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
        </fieldset>
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
              Cadence
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${n0(result.cadence)} spm` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? result.bandDetail : "Fix the highlighted input to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy cadence result"
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

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Progression targets at the same speed</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Step</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Cadence</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Metronome</th>
                  <th scope="col" className="py-2 text-right font-semibold">Step length</th>
                </tr>
              </thead>
              <tbody>
                {result.targets.map((target) => (
                  <tr key={target.incrementPct} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">+{n0(target.incrementPct)}%</td>
                    <td className="py-2 pr-3 text-right">{n0(target.cadence)} spm</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {n0(target.metronomeBpm)} BPM
                    </td>
                    <td className="py-2 text-right">
                      {n1(target.stepLengthCm)} cm ({n1(target.stepLengthChangeCm)} cm)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

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
        Cadence bands are descriptive, not a prescription — there is no single correct step rate, and
        it changes with speed, height and terrain. If you are changing your running form because of
        pain, see a physiotherapist or sports clinician rather than self-treating.
      </p>
    </main>
  );
}
