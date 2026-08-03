"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Footprints, RotateCcw } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  LEVEL_PRESETS,
  formatDuration,
  formatPace,
  paceToSeconds,
  planWalkRun,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const n2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);

const DEFAULTS = {
  level: "endurance",
  distanceKm: "10",
  runPaceMin: "6",
  runPaceSec: "0",
  walkPaceMin: "9",
  walkPaceSec: "0",
  runSeconds: "180",
  walkSeconds: "60",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [level, setLevel] = useState(DEFAULTS.level);
  const [distanceKm, setDistanceKm] = useState(DEFAULTS.distanceKm);
  const [runPaceMin, setRunPaceMin] = useState(DEFAULTS.runPaceMin);
  const [runPaceSec, setRunPaceSec] = useState(DEFAULTS.runPaceSec);
  const [walkPaceMin, setWalkPaceMin] = useState(DEFAULTS.walkPaceMin);
  const [walkPaceSec, setWalkPaceSec] = useState(DEFAULTS.walkPaceSec);
  const [runSeconds, setRunSeconds] = useState(DEFAULTS.runSeconds);
  const [walkSeconds, setWalkSeconds] = useState(DEFAULTS.walkSeconds);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const plan = useMemo(
    () =>
      planWalkRun({
        distanceKm,
        runPaceSec: paceToSeconds({ minutes: runPaceMin, seconds: runPaceSec }),
        walkPaceSec: paceToSeconds({ minutes: walkPaceMin, seconds: walkPaceSec }),
        runSeconds,
        walkSeconds,
      }),
    [distanceKm, runPaceMin, runPaceSec, walkPaceMin, walkPaceSec, runSeconds, walkSeconds],
  );

  const ok = !plan.error;
  const activeLevel = LEVEL_PRESETS.find((preset) => preset.id === level);

  const chooseLevel = (id) => {
    setLevel(id);
    const preset = LEVEL_PRESETS.find((item) => item.id === id);
    if (preset && preset.runSeconds !== null) {
      setRunSeconds(String(preset.runSeconds));
      setWalkSeconds(String(preset.walkSeconds));
    }
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Walk Run Interval Planner",
      `${n2(plan.distanceKm)} km using ${plan.runInterval}s run / ${plan.walkInterval}s walk`,
      `Run pace ${formatPace(plan.runPace)} /km · walk pace ${formatPace(plan.walkPace)} /km`,
      `Estimated finish: ${formatDuration(plan.totalSeconds)}`,
      `Average pace: ${formatPace(plan.averagePace)} /km`,
      `Cycles: ${plan.fullCycles} full (${plan.runSegments} run blocks, ${plan.walkSegments} walk breaks)`,
      `Running ${n2(plan.runDistance)} km in ${formatDuration(plan.runSecondsTotal)}`,
      `Walking ${n2(plan.walkDistance)} km in ${formatDuration(plan.walkSecondsTotal)}`,
      `Slower than running it straight through by ${formatDuration(plan.timeCost)}`,
    ].join("\n");
  }, [ok, plan]);

  const copyResult = () => {
    if (!summary) return;
    copy("plan", summary, { label: "Run-walk plan" });
  };

  const reset = () => {
    setLevel(DEFAULTS.level);
    setDistanceKm(DEFAULTS.distanceKm);
    setRunPaceMin(DEFAULTS.runPaceMin);
    setRunPaceSec(DEFAULTS.runPaceSec);
    setWalkPaceMin(DEFAULTS.walkPaceMin);
    setWalkPaceSec(DEFAULTS.walkPaceSec);
    setRunSeconds(DEFAULTS.runSeconds);
    setWalkSeconds(DEFAULTS.walkSeconds);
    resetCopyState();
  };

  const rows = [
    ["Average pace", ok ? `${formatPace(plan.averagePace)} /km · ${formatPace(plan.averagePacePerMile)} /mile` : DASH],
    ["Full run-walk cycles", ok ? `${plan.fullCycles}` : DASH],
    ["Run blocks / walk breaks", ok ? `${plan.runSegments} / ${plan.walkSegments}` : DASH],
    ["Distance per cycle", ok ? `${n2(plan.cycleDistance)} km in ${formatDuration(plan.cycleSeconds)}` : DASH],
    ["Time spent running", ok ? `${formatDuration(plan.runSecondsTotal)} (${n1(plan.runShare)}%)` : DASH],
    ["Time spent walking", ok ? formatDuration(plan.walkSecondsTotal) : DASH],
    ["Distance run", ok ? `${n2(plan.runDistance)} km` : DASH],
    ["Distance walked", ok ? `${n2(plan.walkDistance)} km` : DASH],
    ["Running it straight through", ok ? formatDuration(plan.continuousSeconds) : DASH],
    ["Walk breaks cost", ok ? formatDuration(plan.timeCost) : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Footprints className="h-4 w-4" aria-hidden="true" />
          Run-walk
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Walk Run Interval Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a run-walk ratio, enter your two paces and a target distance, and see the cycle count,
          finish time and true average pace before you head out.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wri-level">
              Where you are right now
            </label>
            <select
              id="wri-level"
              className={`mt-2 ${INPUT_CLASS}`}
              value={level}
              onChange={(event) => chooseLevel(event.target.value)}
            >
              {LEVEL_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wri-distance">
              Target distance (km)
            </label>
            <input
              id="wri-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={distanceKm}
              onChange={(event) => setDistanceKm(event.target.value)}
            />
          </div>
        </div>

        {activeLevel && activeLevel.note ? (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {activeLevel.note}
          </p>
        ) : null}

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Running pace (per km)</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="wri-run-min">
                Minutes
              </label>
              <input
                id="wri-run-min"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={runPaceMin}
                onChange={(event) => setRunPaceMin(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="wri-run-sec">
                Seconds
              </label>
              <input
                id="wri-run-sec"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="59"
                step="1"
                value={runPaceSec}
                onChange={(event) => setRunPaceSec(event.target.value)}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Walking pace (per km)</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="wri-walk-min">
                Minutes
              </label>
              <input
                id="wri-walk-min"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={walkPaceMin}
                onChange={(event) => setWalkPaceMin(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="wri-walk-sec">
                Seconds
              </label>
              <input
                id="wri-walk-sec"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                max="59"
                step="1"
                value={walkPaceSec}
                onChange={(event) => setWalkPaceSec(event.target.value)}
              />
            </div>
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="wri-run-interval">
              Run interval (seconds)
            </label>
            <input
              id="wri-run-interval"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="5"
              value={runSeconds}
              onChange={(event) => {
                setLevel("custom");
                setRunSeconds(event.target.value);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="wri-walk-interval">
              Walk interval (seconds)
            </label>
            <input
              id="wri-walk-interval"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={walkSeconds}
              onChange={(event) => {
                setLevel("custom");
                setWalkSeconds(event.target.value);
              }}
            />
          </div>
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated finish time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? formatDuration(plan.totalSeconds) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${plan.runInterval}s run / ${plan.walkInterval}s walk, repeated ${plan.fullCycles} times`
                : "Fix the highlighted input to see a plan."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={isCopied("plan") ? "Copied the run-walk plan to clipboard" : "Copy run walk plan"}
              className={GHOST_BTN}
              disabled={!ok}
            >
              {isCopied("plan") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("plan") ? "Copied!" : "Copy plan"}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
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

      {ok && (plan.preview.length > 0 || plan.partial) ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Cycle sheet</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Cycle</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Run km</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Walk km</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Total km</th>
                  <th scope="col" className="py-2 text-right font-semibold">Elapsed</th>
                </tr>
              </thead>
              <tbody>
                {plan.preview.map((row) => (
                  <tr key={row.cycle} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.cycle}</td>
                    <td className="py-2 pr-3 text-right">{n2(row.runKm)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{n2(row.walkKm)}</td>
                    <td className="py-2 pr-3 text-right">{n2(row.cumulativeKm)}</td>
                    <td className="py-2 text-right">{formatDuration(row.cumulativeSeconds)}</td>
                  </tr>
                ))}
                {plan.partial ? (
                  <tr className="last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      Finish
                      <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                        after {plan.fullCycles} full cycle{plan.fullCycles === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right">{n2(plan.partial.runKm)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {n2(plan.partial.walkKm)}
                    </td>
                    <td className="py-2 pr-3 text-right">{n2(plan.distanceKm)}</td>
                    <td className="py-2 text-right">{formatDuration(plan.totalSeconds)}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {ok && plan.notes.length > 0 ? (
        <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
          {plan.notes.map((note) => (
            <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
              {note}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        General fitness information, not medical advice. If you are returning from injury, are
        pregnant, or have a heart, lung or joint condition, agree the plan with a clinician or
        physiotherapist first.
      </p>
    </main>
  );
}
