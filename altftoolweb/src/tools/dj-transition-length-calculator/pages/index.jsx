"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Disc3, RotateCcw } from "lucide-react";

import {
  COMMON_BAR_LENGTHS,
  PITCH_RANGES,
  barLengthTable,
  calculateTransition,
  formatClock,
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
  bpmA: "124",
  bpmB: "130",
  bars: "16",
  beatsPerBar: "4",
  pitchRange: "8",
};

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [bpmA, setBpmA] = useState(DEFAULTS.bpmA);
  const [bpmB, setBpmB] = useState(DEFAULTS.bpmB);
  const [bars, setBars] = useState(DEFAULTS.bars);
  const [beatsPerBar, setBeatsPerBar] = useState(DEFAULTS.beatsPerBar);
  const [pitchRange, setPitchRange] = useState(DEFAULTS.pitchRange);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      calculateTransition({
        bpmA: toNumber(bpmA),
        bpmB: toNumber(bpmB),
        bars: toNumber(bars),
        beatsPerBar: toNumber(beatsPerBar),
        pitchRange: toNumber(pitchRange),
      }),
    [bpmA, bpmB, bars, beatsPerBar, pitchRange],
  );

  const table = useMemo(
    () =>
      barLengthTable({
        bpmA: toNumber(bpmA),
        bpmB: toNumber(bpmB),
        beatsPerBar: toNumber(beatsPerBar),
      }),
    [bpmA, bpmB, beatsPerBar],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "DJ Transition Length Calculator",
      `Outgoing track: ${result.bpmA} BPM`,
      `Incoming track: ${result.bpmB} BPM`,
      `Blend: ${result.bars} bars = ${result.beats} beats`,
      `Held at ${result.bpmA} BPM: ${formatClock(result.secondsAtA)}`,
      `Held at ${result.bpmB} BPM: ${formatClock(result.secondsAtB)}`,
      `Riding the pitch across: ${formatClock(result.secondsRamped)}`,
      `Pitch move to beatmatch: ${result.pitchPercent >= 0 ? "+" : ""}${NUM2.format(result.pitchPercent)}%`,
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
    setBpmA(DEFAULTS.bpmA);
    setBpmB(DEFAULTS.bpmB);
    setBars(DEFAULTS.bars);
    setBeatsPerBar(DEFAULTS.beatsPerBar);
    setPitchRange(DEFAULTS.pitchRange);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Disc3 className="h-4 w-4" aria-hidden="true" />
          DJ tools
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          DJ Transition Length Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          How long a blend actually runs in seconds, how much pitch you need to beatmatch, and how
          the clock changes if you ride the tempo across instead of locking it.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dj-bpm-a">
              Outgoing track BPM
            </label>
            <input
              id="dj-bpm-a"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="300"
              step="0.1"
              value={bpmA}
              onChange={(event) => setBpmA(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dj-bpm-b">
              Incoming track BPM
            </label>
            <input
              id="dj-bpm-b"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="300"
              step="0.1"
              value={bpmB}
              onChange={(event) => setBpmB(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dj-bars">
              Blend length (bars)
            </label>
            <input
              id="dj-bars"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="512"
              step="1"
              value={bars}
              onChange={(event) => setBars(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dj-beats-per-bar">
              Beats per bar
            </label>
            <input
              id="dj-beats-per-bar"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="16"
              step="1"
              value={beatsPerBar}
              onChange={(event) => setBeatsPerBar(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dj-pitch-range">
              Pitch fader range
            </label>
            <select
              id="dj-pitch-range"
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
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {COMMON_BAR_LENGTHS.map((value) => (
            <button
              key={value}
              type="button"
              className={CHIP_BTN}
              onClick={() => setBars(String(value))}
            >
              {value} bars
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
              Blend length, beatmatched to the outgoing track
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? DASH : formatClock(result.secondsAtA)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? "Fix the inputs above to see the timing."
                : `${result.bars} bars · ${result.beats} beats at ${NUM1.format(result.bpmA)} BPM`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy transition timing"
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
              aria-label="Reset the transition calculator"
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
              "Same blend at the incoming tempo",
              result.error ? DASH : formatClock(result.secondsAtB),
            ],
            [
              "Riding the pitch from one tempo to the other",
              result.error ? DASH : formatClock(result.secondsRamped),
            ],
            [
              "Difference against holding the outgoing tempo",
              result.error ? DASH : `${NUM2.format(result.rampDeltaSeconds)} s`,
            ],
            [
              "One bar of the outgoing track",
              result.error ? DASH : `${NUM2.format(result.barSecondsA)} s`,
            ],
            [
              "One bar of the incoming track",
              result.error ? DASH : `${NUM2.format(result.barSecondsB)} s`,
            ],
            [
              "Tempo gap",
              result.error
                ? DASH
                : `${result.bpmDifference >= 0 ? "+" : ""}${NUM1.format(result.bpmDifference)} BPM`,
            ],
            [
              "Pitch move to beatmatch",
              result.error
                ? DASH
                : `${result.pitchPercent >= 0 ? "+" : ""}${NUM2.format(result.pitchPercent)}%`,
            ],
            [
              `Fits a ±${result.error ? "?" : result.pitchRange}% fader`,
              result.error ? DASH : result.withinRange ? "Yes" : "No — too far apart",
            ],
            [
              "Phrases covered",
              result.error
                ? DASH
                : `${NUM2.format(result.phrases)}${result.wholePhrases ? " (lands on a phrase)" : " (does not land on a phrase)"}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!result.error && !result.withinRange && (
          <p className="mt-4 rounded-md bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.halfTimeWorks
              ? `Try half-time: pulling the incoming track to ${NUM1.format(result.bpmB / 2)} BPM needs only ${NUM2.format(result.halfTimePitch)}%.`
              : result.doubleTimeWorks
                ? `Try double-time: treating the incoming track as ${NUM1.format(result.bpmB * 2)} BPM needs only ${NUM2.format(result.doubleTimePitch)}%.`
                : "Neither half-time nor double-time brings these two inside the fader range — use key lock, a wider pitch range, or bridge with a third track."}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Common blend lengths</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Bars
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Beats
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  At {bpmA || "?"} BPM
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Riding across
                </th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => (
                <tr key={row.bars} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.bars}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {row.beats === null ? DASH : row.beats}
                  </td>
                  <td className="py-2 pr-3 text-right">{formatClock(row.secondsAtA)}</td>
                  <td className="py-2 text-right">{formatClock(row.secondsRamped)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The ramped figure assumes the tempo moves evenly across the blend, which is what a linear
        tempo transition on a controller does. Yanking the pitch fader by hand is not linear, so
        treat that number as the ideal case rather than a promise.
      </p>
    </main>
  );
}
