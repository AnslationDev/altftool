"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Waves } from "lucide-react";

import {
  LAP_MODES,
  POOL_PRESETS,
  convertLaps,
  formatSeconds,
  lapsForDistance,
  toTotalSeconds,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  laps: "20",
  preset: "scm25",
  poolLength: "25",
  poolUnit: "m",
  lapMode: "roundTrip",
  target: "1",
  targetUnit: "km",
  minutes: "20",
  seconds: "0",
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [laps, setLaps] = useState(DEFAULTS.laps);
  const [preset, setPreset] = useState(DEFAULTS.preset);
  const [poolLength, setPoolLength] = useState(DEFAULTS.poolLength);
  const [poolUnit, setPoolUnit] = useState(DEFAULTS.poolUnit);
  const [lapMode, setLapMode] = useState(DEFAULTS.lapMode);
  const [target, setTarget] = useState(DEFAULTS.target);
  const [targetUnit, setTargetUnit] = useState(DEFAULTS.targetUnit);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [seconds, setSeconds] = useState(DEFAULTS.seconds);
  const [copied, setCopied] = useState(false);

  const lengthsPerLap =
    LAP_MODES.find((mode) => mode.id === lapMode)?.lengthsPerLap ?? 2;

  const result = useMemo(
    () =>
      convertLaps({
        laps: toNumber(laps),
        poolLength: toNumber(poolLength),
        poolUnit,
        lengthsPerLap,
        targetDistance: toNumber(target),
        targetUnit,
        totalSeconds: toTotalSeconds(toNumber(minutes), toNumber(seconds)),
      }),
    [laps, poolLength, poolUnit, lengthsPerLap, target, targetUnit, minutes, seconds],
  );

  const goalLaps = useMemo(
    () =>
      lapsForDistance({
        distance: toNumber(target),
        distanceUnit: targetUnit,
        poolLength: toNumber(poolLength),
        poolUnit,
        lengthsPerLap,
      }),
    [target, targetUnit, poolLength, poolUnit, lengthsPerLap],
  );

  const hasError = Boolean(result.error);

  const applyPreset = (id) => {
    const found = POOL_PRESETS.find((item) => item.id === id);
    setPreset(id);
    if (found) {
      setPoolLength(String(found.length));
      setPoolUnit(found.unit);
    }
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Pool Laps to Distance",
      `Laps: ${NUM2.format(toNumber(laps))} (${lengthsPerLap} length${lengthsPerLap > 1 ? "s" : ""} per lap)`,
      `Pool: ${NUM2.format(toNumber(poolLength))} ${poolUnit} = ${NUM2.format(result.poolLengthMetres)} m per length`,
      `Lengths swum: ${NUM2.format(result.lengths)}`,
      `Distance: ${NUM0.format(result.metres)} m / ${NUM3.format(result.kilometres)} km / ${NUM0.format(result.yards)} yd / ${NUM2.format(result.miles)} mi`,
      result.pace
        ? `Pace: ${formatSeconds(result.pace.secondsPer100m)} per 100 m (${NUM2.format(result.pace.kmPerHour)} km/h)`
        : "Pace: not entered",
      result.targetMetres > 0
        ? `Goal ${NUM2.format(toNumber(target))} ${targetUnit}: ${NUM0.format(result.goalPercent)}% done, ${NUM1.format(result.lapsRemaining)} laps to go`
        : "Goal: none set",
    ].join("\n");
  }, [
    hasError,
    laps,
    lengthsPerLap,
    poolLength,
    poolUnit,
    result,
    target,
    targetUnit,
  ]);

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
    setLaps(DEFAULTS.laps);
    setPreset(DEFAULTS.preset);
    setPoolLength(DEFAULTS.poolLength);
    setPoolUnit(DEFAULTS.poolUnit);
    setLapMode(DEFAULTS.lapMode);
    setTarget(DEFAULTS.target);
    setTargetUnit(DEFAULTS.targetUnit);
    setMinutes(DEFAULTS.minutes);
    setSeconds(DEFAULTS.seconds);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Pool lengths swum", DASH],
        ["Metres", DASH],
        ["Kilometres", DASH],
        ["Yards", DASH],
        ["Miles", DASH],
        ["Metric swim miles (1500 m)", DASH],
        ["Pace per 100 m", DASH],
      ]
    : [
        ["Pool lengths swum", NUM2.format(result.lengths)],
        ["Metres", `${NUM0.format(result.metres)} m`],
        ["Kilometres", `${NUM3.format(result.kilometres)} km`],
        ["Yards", `${NUM0.format(result.yards)} yd`],
        ["Miles", `${NUM2.format(result.miles)} mi`],
        ["Metric swim miles (1500 m)", NUM2.format(result.metricSwimMiles)],
        [
          "Pace per 100 m",
          result.pace ? `${formatSeconds(result.pace.secondsPer100m)} min` : "add a time",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Waves className="h-4 w-4" aria-hidden="true" />
          Swimming
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Pool Laps to Distance Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn the laps you counted into metres, kilometres, yards and miles for any pool size —
          and settle whether your &ldquo;lap&rdquo; means one length or a down-and-back.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="swim-laps">
              Laps counted
            </label>
            <input
              id="swim-laps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={laps}
              onChange={(event) => setLaps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="swim-pool-preset">
              Pool preset
            </label>
            <select
              id="swim-pool-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={preset}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {POOL_PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
              <option value="custom">Custom length</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="swim-pool-length">
              Pool length
            </label>
            <input
              id="swim-pool-length"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.01"
              value={poolLength}
              onChange={(event) => {
                setPreset("custom");
                setPoolLength(event.target.value);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="swim-pool-unit">
              Pool length unit
            </label>
            <select
              id="swim-pool-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={poolUnit}
              onChange={(event) => {
                setPreset("custom");
                setPoolUnit(event.target.value);
              }}
            >
              <option value="m">metres</option>
              <option value="yd">yards</option>
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>What does one lap mean to you?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {LAP_MODES.map((mode) => {
              const active = mode.id === lapMode;
              return (
                <button
                  key={mode.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setLapMode(mode.id)}
                  className={`${CHIP_BTN} ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="swim-target">
              Session goal (optional)
            </label>
            <input
              id="swim-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="swim-target-unit">
              Goal unit
            </label>
            <select
              id="swim-target-unit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={targetUnit}
              onChange={(event) => setTargetUnit(event.target.value)}
            >
              <option value="m">metres</option>
              <option value="km">kilometres</option>
              <option value="yd">yards</option>
              <option value="mi">miles</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="swim-minutes">
              Swim time — minutes (optional)
            </label>
            <input
              id="swim-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="swim-seconds">
              Swim time — seconds
            </label>
            <input
              id="swim-seconds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={seconds}
              onChange={(event) => setSeconds(event.target.value)}
            />
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Distance swum
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM0.format(result.metres)} m`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the highlighted input to see your distance."
                : `${NUM2.format(result.lengths)} lengths of a ${NUM2.format(result.poolLengthMetres)} m pool`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy swim distance result"
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
              aria-label="Reset all swim inputs"
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
      </section>

      {!hasError && result.targetMetres > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Goal progress</h2>
          <div
            className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`${NUM0.format(result.goalPercent)} percent of the goal distance completed`}
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${Math.max(0, Math.min(100, result.goalPercent))}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            {result.goalReached ? (
              <span className="font-semibold text-[var(--success)]">
                Goal reached — {NUM0.format(result.overshootMetres)} m past it.
              </span>
            ) : (
              <>
                {NUM0.format(result.remainingMetres)} m left —{" "}
                <span className="font-semibold text-[var(--foreground)]">
                  {NUM1.format(result.lapsRemaining)} more laps
                </span>{" "}
                at {NUM2.format(result.metresPerLap)} m per lap.
              </>
            )}
          </p>
          {!goalLaps.error && (
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              The whole goal is {NUM1.format(goalLaps.laps)} laps ({NUM1.format(goalLaps.lengths)}{" "}
              lengths) in this pool.
            </p>
          )}
        </section>
      )}

      <section className="mt-6 overflow-x-auto rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Laps needed for common distances</h2>
        <table className="mt-3 w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <th scope="col" className="py-2 pr-3 font-semibold">
                Distance
              </th>
              <th scope="col" className="py-2 pr-3 text-right font-semibold">
                Lengths
              </th>
              <th scope="col" className="py-2 text-right font-semibold">
                Laps
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["400 m", 400],
              ["750 m (sprint tri)", 750],
              ["1 km", 1000],
              ["1500 m (metric swim mile)", 1500],
              ["1.9 km (half Ironman)", 1900],
              ["3.8 km (Ironman)", 3800],
            ].map(([label, metres]) => {
              const row = lapsForDistance({
                distance: metres,
                distanceUnit: "m",
                poolLength: toNumber(poolLength),
                poolUnit,
                lengthsPerLap,
              });
              return (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{label}</td>
                  <td className="py-2 pr-3 text-right">
                    {row.error ? DASH : NUM1.format(row.lengths)}
                  </td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {row.error ? DASH : NUM1.format(row.laps)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Conversions use the exact international yard (0.9144 m) and mile (1609.344 m). If your pool
        is not exactly 25 m, ask the facility for the certified lane length — a 1 m error over 40
        lengths shifts your total by 40 m.
      </p>
    </main>
  );
}
