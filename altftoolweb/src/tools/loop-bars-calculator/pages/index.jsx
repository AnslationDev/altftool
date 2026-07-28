"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Repeat, RotateCcw } from "lucide-react";

import {
  COMMON_BAR_LENGTHS,
  SAMPLE_RATES,
  formatLength,
  loopFromBars,
  loopFromSeconds,
  noteDivisionTable,
  tempoForLoop,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

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
  bars: "4",
  bpm: "120",
  beatsPerBar: "4",
  sampleRate: "48000",
  clipSeconds: "8",
};

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [bars, setBars] = useState(DEFAULTS.bars);
  const [bpm, setBpm] = useState(DEFAULTS.bpm);
  const [beatsPerBar, setBeatsPerBar] = useState(DEFAULTS.beatsPerBar);
  const [sampleRate, setSampleRate] = useState(DEFAULTS.sampleRate);
  const [clipSeconds, setClipSeconds] = useState(DEFAULTS.clipSeconds);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      loopFromBars({
        bars: toNumber(bars),
        bpm: toNumber(bpm),
        beatsPerBar: toNumber(beatsPerBar),
        sampleRate: toNumber(sampleRate),
      }),
    [bars, bpm, beatsPerBar, sampleRate],
  );

  const reverse = useMemo(
    () =>
      loopFromSeconds({
        seconds: toNumber(clipSeconds),
        bpm: toNumber(bpm),
        beatsPerBar: toNumber(beatsPerBar),
      }),
    [clipSeconds, bpm, beatsPerBar],
  );

  const fitTempo = useMemo(
    () =>
      tempoForLoop({
        seconds: toNumber(clipSeconds),
        bars: toNumber(bars),
        beatsPerBar: toNumber(beatsPerBar),
      }),
    [clipSeconds, bars, beatsPerBar],
  );

  const notes = useMemo(() => noteDivisionTable({ bpm: toNumber(bpm) }), [bpm]);

  const summary = useMemo(() => {
    if (result.error) return "";
    const lines = [
      "Loop Bars Calculator",
      `${result.bars} bars of ${result.beatsPerBar}/4 at ${NUM2.format(result.bpm)} BPM`,
      `Length: ${formatLength(result.seconds)} (${NUM3.format(result.seconds)} s, ${NUM0.format(result.milliseconds)} ms)`,
      `Beats: ${NUM2.format(result.beats)}`,
      `Samples at ${NUM0.format(result.sampleRate)} Hz: ${NUM0.format(result.samples)}`,
      `One bar: ${NUM3.format(result.barSeconds)} s · one beat: ${NUM3.format(result.beatSeconds)} s`,
    ];
    if (!notes.error) {
      lines.push("");
      lines.push("Delay times (plain / dotted / triplet, ms)");
      notes.rows.forEach((row) => {
        lines.push(
          `${row.label}\t${NUM2.format(row.plainMs)}\t${NUM2.format(row.dottedMs)}\t${NUM2.format(row.tripletMs)}`,
        );
      });
    }
    return lines.join("\n");
  }, [result, notes]);

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
    setBars(DEFAULTS.bars);
    setBpm(DEFAULTS.bpm);
    setBeatsPerBar(DEFAULTS.beatsPerBar);
    setSampleRate(DEFAULTS.sampleRate);
    setClipSeconds(DEFAULTS.clipSeconds);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Repeat className="h-4 w-4" aria-hidden="true" />
          DJ tools
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Loop Bars Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Bars to seconds, seconds to bars, samples for the editor and a full delay-time table — all
          from one tempo.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="loop-bars">
              Loop length (bars)
            </label>
            <input
              id="loop-bars"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.25"
              max="1024"
              step="0.25"
              value={bars}
              onChange={(event) => setBars(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="loop-bpm">
              Tempo (BPM)
            </label>
            <input
              id="loop-bpm"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="999"
              step="0.1"
              value={bpm}
              onChange={(event) => setBpm(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="loop-beats-per-bar">
              Beats per bar
            </label>
            <input
              id="loop-beats-per-bar"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="loop-sample-rate">
              Sample rate (Hz)
            </label>
            <select
              id="loop-sample-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sampleRate}
              onChange={(event) => setSampleRate(event.target.value)}
            >
              {SAMPLE_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {NUM0.format(rate)} Hz
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="loop-clip-seconds">
              Existing clip length (seconds) — for the reverse lookup
            </label>
            <input
              id="loop-clip-seconds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.001"
              value={clipSeconds}
              onChange={(event) => setClipSeconds(event.target.value)}
            />
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
              {value} {value === 1 ? "bar" : "bars"}
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
              Loop length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? DASH : formatLength(result.seconds)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? "Fix the inputs above to see the length."
                : `${NUM2.format(result.bars)} bars · ${NUM2.format(result.beats)} beats at ${NUM2.format(result.bpm)} BPM`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy loop length and delay times"
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
              aria-label="Reset the loop calculator"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Seconds", result.error ? DASH : `${NUM3.format(result.seconds)} s`],
            ["Milliseconds", result.error ? DASH : `${NUM0.format(result.milliseconds)} ms`],
            [
              "Samples",
              result.error
                ? DASH
                : `${NUM0.format(result.samples)} at ${NUM0.format(result.sampleRate)} Hz`,
            ],
            ["One bar", result.error ? DASH : `${NUM3.format(result.barSeconds)} s`],
            ["One beat", result.error ? DASH : `${NUM3.format(result.beatSeconds)} s`],
            [
              "Video frames (24 / 25 / 30 fps)",
              result.error
                ? DASH
                : `${NUM2.format(result.frames24)} / ${NUM2.format(result.frames25)} / ${NUM2.format(result.frames30)}`,
            ],
            [
              "Your clip in bars",
              reverse.error
                ? DASH
                : `${NUM3.format(reverse.bars)} bars${reverse.exact ? " (lands exactly)" : ""}`,
            ],
            [
              "Tempo that fits the clip to the bar count",
              fitTempo.error
                ? DASH
                : `${NUM2.format(fitTempo.bpm)} BPM${fitTempo.inRange ? "" : " (outside a usable range)"}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {reverse.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {reverse.error}
          </p>
        ) : null}
      </section>

      {notes.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {notes.error}
        </p>
      ) : (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Delay and note times at {bpm || "?"} BPM</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Note
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Plain
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Dotted
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Triplet
                  </th>
                </tr>
              </thead>
              <tbody>
                {notes.rows.map((row) => (
                  <tr key={row.division} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right">{NUM2.format(row.plainMs)} ms</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {NUM2.format(row.dottedMs)} ms
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {NUM2.format(row.tripletMs)} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Note values assume the quarter note is the beat, which holds for every x/4 time signature. In
        compound metres such as 6/8 the dotted quarter is usually the felt beat, so set beats per bar
        to match how you count rather than what is written.
      </p>
    </main>
  );
}
