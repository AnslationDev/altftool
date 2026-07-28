"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sliders } from "lucide-react";

import {
  PITCH_RANGES,
  SPEED_SWAPS,
  applyPitch,
  formatClock,
  pitchForTarget,
  pitchTable,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  baseBpm: "128",
  pitch: "4",
  minutes: "5",
  seconds: "30",
  pitchRange: "8",
  targetBpm: "134",
};

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [baseBpm, setBaseBpm] = useState(DEFAULTS.baseBpm);
  const [pitch, setPitch] = useState(DEFAULTS.pitch);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [seconds, setSeconds] = useState(DEFAULTS.seconds);
  const [pitchRange, setPitchRange] = useState(DEFAULTS.pitchRange);
  const [targetBpm, setTargetBpm] = useState(DEFAULTS.targetBpm);
  const [copied, setCopied] = useState(false);

  const trackSeconds = useMemo(() => {
    const m = toNumber(minutes);
    const s = toNumber(seconds);
    if (Number.isNaN(m) || Number.isNaN(s)) return NaN;
    return m * 60 + s;
  }, [minutes, seconds]);

  const result = useMemo(
    () =>
      applyPitch({
        baseBpm: toNumber(baseBpm),
        pitchPercent: toNumber(pitch),
        trackSeconds,
        pitchRange: toNumber(pitchRange),
      }),
    [baseBpm, pitch, trackSeconds, pitchRange],
  );

  const reverse = useMemo(
    () =>
      pitchForTarget({
        baseBpm: toNumber(baseBpm),
        targetBpm: toNumber(targetBpm),
        pitchRange: toNumber(pitchRange),
      }),
    [baseBpm, targetBpm, pitchRange],
  );

  const table = useMemo(
    () => pitchTable({ baseBpm: toNumber(baseBpm), pitchRange: toNumber(pitchRange), steps: 8 }),
    [baseBpm, pitchRange],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Pitch Percent BPM Calculator",
      `Written tempo: ${NUM2.format(result.baseBpm)} BPM`,
      `Pitch: ${result.pitchPercent >= 0 ? "+" : ""}${NUM2.format(result.pitchPercent)}%`,
      `Resulting tempo: ${NUM2.format(result.resultingBpm)} BPM`,
      `Key shift: ${NUM2.format(result.cents)} cents (${NUM2.format(result.semitones)} semitones)`,
      result.originalSeconds > 0
        ? `Running time: ${formatClock(result.originalSeconds)} becomes ${formatClock(result.newSeconds)}`
        : "Running time: not entered",
      `Within a ±${result.pitchRange}% fader: ${result.withinRange ? "yes" : "no"}`,
    ].join("\n");
  }, [result]);

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
    setBaseBpm(DEFAULTS.baseBpm);
    setPitch(DEFAULTS.pitch);
    setMinutes(DEFAULTS.minutes);
    setSeconds(DEFAULTS.seconds);
    setPitchRange(DEFAULTS.pitchRange);
    setTargetBpm(DEFAULTS.targetBpm);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Sliders className="h-4 w-4" aria-hidden="true" />
          DJ tools
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Pitch Percent BPM Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Move the fader and see the tempo, the key shift in cents and semitones, and how much
          shorter the record runs.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pitch-base-bpm">
              Written tempo (BPM)
            </label>
            <input
              id="pitch-base-bpm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="300"
              step="0.1"
              value={baseBpm}
              onChange={(event) => setBaseBpm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pitch-percent">
              Pitch (%)
            </label>
            <input
              id="pitch-percent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="-99"
              max="100"
              step="0.1"
              value={pitch}
              onChange={(event) => setPitch(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pitch-minutes">
              Track length — minutes
            </label>
            <input
              id="pitch-minutes"
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
            <label className={LABEL_CLASS} htmlFor="pitch-seconds">
              Track length — seconds
            </label>
            <input
              id="pitch-seconds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="59"
              step="1"
              value={seconds}
              onChange={(event) => setSeconds(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pitch-range">
              Pitch fader range
            </label>
            <select
              id="pitch-range"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pitchRange}
              onChange={(event) => setPitchRange(event.target.value)}
            >
              {PITCH_RANGES.map((item) => (
                <option key={item.id} value={item.percent}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pitch-target">
              Or aim for this tempo (BPM)
            </label>
            <input
              id="pitch-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="300"
              step="0.1"
              value={targetBpm}
              onChange={(event) => setTargetBpm(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[-8, -4, -2, 0, 2, 4, 8].map((value) => (
            <button
              key={value}
              type="button"
              className={CHIP_BTN}
              onClick={() => setPitch(String(value))}
            >
              {value > 0 ? `+${value}` : value}%
            </button>
          ))}
          {SPEED_SWAPS.map((swap) => (
            <button
              key={swap.id}
              type="button"
              className={CHIP_BTN}
              onClick={() => setPitch(String(Number(swap.percent.toFixed(4))))}
            >
              {swap.name}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Resulting tempo
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? DASH : `${NUM2.format(result.resultingBpm)} BPM`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? "Fix the inputs above to see the result."
                : `${NUM1.format(result.baseBpm)} BPM at ${result.pitchPercent >= 0 ? "+" : ""}${NUM2.format(result.pitchPercent)}%`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the pitch calculation"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
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
              aria-label="Reset the pitch calculator"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Tempo change",
              result.error
                ? DASH
                : `${result.bpmChange >= 0 ? "+" : ""}${NUM2.format(result.bpmChange)} BPM`,
            ],
            [
              "Key shift",
              result.error
                ? DASH
                : `${NUM2.format(result.cents)} cents (${NUM2.format(result.semitones)} semitones)`,
            ],
            [
              "Running time after pitching",
              result.error || result.originalSeconds <= 0
                ? DASH
                : `${formatClock(result.newSeconds)} (was ${formatClock(result.originalSeconds)})`,
            ],
            [
              "Time saved or added",
              result.error || result.originalSeconds <= 0
                ? DASH
                : `${NUM1.format(result.secondsSaved)} s`,
            ],
            [
              "One beat before / after",
              result.error
                ? DASH
                : `${NUM2.format(result.beatSecondsBefore)} s → ${NUM2.format(result.beatSecondsAfter)} s`,
            ],
            [
              `Inside a ±${result.error ? "?" : result.pitchRange}% fader`,
              result.error ? DASH : result.withinRange ? "Yes" : "No",
            ],
            [
              "Key lock worth switching on",
              result.error
                ? DASH
                : result.keyLockAdvised
                  ? "Yes — the shift is audible"
                  : "Not really",
            ],
            [
              `Pitch needed for ${targetBpm || "?"} BPM`,
              reverse.error
                ? DASH
                : `${reverse.percent >= 0 ? "+" : ""}${NUM2.format(reverse.percent)}%${
                    reverse.withinRange ? "" : " (out of range)"
                  }`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Across the whole fader</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Pitch
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Tempo
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Key shift
                </th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr key={row.percent} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    {row.percent >= 0 ? "+" : ""}
                    {NUM2.format(row.percent)}%
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {row.bpm === null ? DASH : `${NUM2.format(row.bpm)} BPM`}
                  </td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {row.cents === null ? DASH : `${NUM1.format(row.cents)} cents`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Pitch changes the playback rate, so tempo, pitch and running time all move together unless
        key lock is engaged. Key lock time-stretches instead, which preserves the key but starts to
        smear transients past roughly ±8%.
      </p>
    </main>
  );
}
