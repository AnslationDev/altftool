"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, RotateCcw } from "lucide-react";

import {
  DEFAULT_RATE_KEY,
  FRAME_RATES,
  getRate,
  secondsToTimecode,
  timecodeToSeconds,
} from "../lib";

const NUM3 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
const NUM4 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });
const NUM6 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const DASH = "—";

const DEFAULTS = {
  mode: "tc2s",
  timecode: "01:00:00;00",
  seconds: "90.5",
  rateKey: DEFAULT_RATE_KEY,
};

const CONTROL =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const HOUR_TIMECODE = "01:00:00:00";

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [timecode, setTimecode] = useState(DEFAULTS.timecode);
  const [seconds, setSeconds] = useState(DEFAULTS.seconds);
  const [rateKey, setRateKey] = useState(DEFAULTS.rateKey);
  const [copied, setCopied] = useState(false);

  const rate = getRate(rateKey);

  const forward = useMemo(() => timecodeToSeconds({ timecode, rateKey }), [timecode, rateKey]);
  const backward = useMemo(
    () => secondsToTimecode({ seconds: Number(seconds), rateKey }),
    [seconds, rateKey],
  );

  const active = mode === "tc2s" ? forward : backward;
  const failed = Boolean(active.error);

  const hourTable = useMemo(
    () =>
      FRAME_RATES.map((item) => {
        const result = timecodeToSeconds({ timecode: HOUR_TIMECODE, rateKey: item.key });
        return {
          key: item.key,
          label: item.label,
          exact: item.exact,
          dropFrames: item.dropFrames,
          frames: result.error ? null : result.frameNumber,
          realSeconds: result.error ? null : result.realSeconds,
        };
      }),
    [],
  );

  const primary = failed
    ? DASH
    : mode === "tc2s"
      ? `${NUM4.format(forward.realSeconds)} s`
      : backward.timecode;

  const rows = failed
    ? [
        ["Frame number", DASH],
        ["Real elapsed time", DASH],
        ["Timecode reading", DASH],
        ["Drift", DASH],
      ]
    : mode === "tc2s"
      ? [
          ["Normalised timecode", forward.normalisedTimecode],
          ["Frame number", INT.format(forward.frameNumber)],
          ["Real elapsed seconds", `${NUM6.format(forward.realSeconds)} s`],
          ["Real elapsed clock", forward.realClock],
          ["Milliseconds", `${NUM3.format(forward.milliseconds)} ms`],
          ["Seconds if the digits were literal", `${NUM6.format(forward.nominalSeconds)} s`],
          [
            "Difference (pulldown drift)",
            `${forward.driftSeconds >= 0 ? "+" : ""}${NUM4.format(forward.driftSeconds)} s`,
          ],
          ["Rate used", `${forward.rateLabel}${forward.isDropFrame ? " (drop-frame)" : ""}`],
          ["Exact frames per second", NUM6.format(forward.exactFps)],
        ]
      : [
          ["Timecode", backward.timecode],
          ["Frame number", INT.format(backward.frameNumber)],
          ["Nearest frame boundary", `${NUM6.format(backward.snappedSeconds)} s`],
          [
            "Rounding to whole frames",
            `${backward.roundingErrorSeconds >= 0 ? "+" : ""}${NUM6.format(backward.roundingErrorSeconds)} s`,
          ],
          ["Real elapsed clock", backward.realClock],
          ["Rate used", `${backward.rateLabel}${backward.isDropFrame ? " (drop-frame)" : ""}`],
        ];

  const clipboardText = useMemo(() => {
    if (failed) return "";
    if (mode === "tc2s") {
      return [
        "Timecode to seconds",
        `Timecode: ${forward.normalisedTimecode} at ${forward.rateLabel}`,
        `Frame number: ${forward.frameNumber}`,
        `Real elapsed: ${NUM6.format(forward.realSeconds)} s (${forward.realClock})`,
        `Digits read literally: ${NUM6.format(forward.nominalSeconds)} s`,
      ].join("\n");
    }
    return [
      "Seconds to timecode",
      `Duration: ${seconds} s at ${backward.rateLabel}`,
      `Timecode: ${backward.timecode}`,
      `Frame number: ${backward.frameNumber}`,
      `Snapped to frame boundary: ${NUM6.format(backward.snappedSeconds)} s`,
    ].join("\n");
  }, [failed, mode, forward, backward, seconds]);

  const copyResult = async () => {
    if (!clipboardText) return;
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setMode(DEFAULTS.mode);
    setTimecode(DEFAULTS.timecode);
    setSeconds(DEFAULTS.seconds);
    setRateKey(DEFAULTS.rateKey);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Post-production
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Timecode to Seconds Converter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert SMPTE HH:MM:SS:FF timecode to real seconds and frame numbers, or go the other way.
          Drop-frame and the 1000/1001 NTSC pulldown are handled properly, not approximated.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div
          role="radiogroup"
          aria-label="Conversion direction"
          className="flex flex-wrap gap-2"
        >
          {[
            ["tc2s", "Timecode → seconds"],
            ["s2tc", "Seconds → timecode"],
          ].map(([value, text]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={mode === value}
              onClick={() => setMode(value)}
              className={`min-h-11 rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                mode === value
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
              }`}
            >
              {text}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {mode === "tc2s" ? (
            <div>
              <label className={LABEL} htmlFor="tc-input">
                Timecode (HH:MM:SS:FF)
              </label>
              <input
                id="tc-input"
                className={`mt-2 ${CONTROL} font-mono`}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                spellCheck="false"
                placeholder="01:00:00:00"
                value={timecode}
                onChange={(event) => setTimecode(event.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL} htmlFor="tc-seconds">
                Duration (seconds)
              </label>
              <input
                id="tc-seconds"
                className={`mt-2 ${CONTROL}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.001"
                value={seconds}
                onChange={(event) => setSeconds(event.target.value)}
              />
            </div>
          )}

          <div>
            <label className={LABEL} htmlFor="tc-rate">
              Frame rate
            </label>
            <select
              id="tc-rate"
              className={`mt-2 ${CONTROL}`}
              value={rateKey}
              onChange={(event) => setRateKey(event.target.value)}
            >
              {FRAME_RATES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
            {rate && (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Frame field counts 00–{String(rate.nominal - 1).padStart(2, "0")};{" "}
                {rate.dropFrames > 0
                  ? `${rate.dropFrames} frame numbers dropped each minute except every tenth.`
                  : "no frame numbers are dropped."}
              </p>
            )}
          </div>
        </div>

        {mode === "tc2s" && (
          <div className="mt-4 flex flex-wrap gap-2">
            {["00:00:10:00", "00:01:00;02", "00:30:00;00", "01:00:00;00", "10:00:00;00"].map(
              (preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTimecode(preset)}
                  className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {preset}
                </button>
              ),
            )}
          </div>
        )}
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {active.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {mode === "tc2s" ? "Real elapsed time" : "Timecode"}
            </p>
            <p className="mt-1 font-mono text-4xl font-semibold text-[var(--primary)]">{primary}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to see the conversion."
                : mode === "tc2s"
                  ? `${INT.format(forward.frameNumber)} frames · ${forward.realClock}`
                  : `${INT.format(backward.frameNumber)} frames · ${backward.realClock}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy timecode conversion result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the converter" className={PRIMARY_BTN}>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">One hour of timecode at each rate</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Drop-frame exists so that 01:00:00;00 lands within a few milliseconds of a real hour.
          Non-drop 29.97 runs 3.6 seconds long over the same hour.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[440px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Rate
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Frames
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Real seconds
                </th>
              </tr>
            </thead>
            <tbody>
              {hourTable.map((row) => (
                <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{row.label}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {row.frames === null ? DASH : INT.format(row.frames)}
                  </td>
                  <td className="py-2 text-right font-semibold">
                    {row.realSeconds === null ? DASH : `${NUM4.format(row.realSeconds)} s`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Drop-frame never discards picture — it only skips frame numbers, so a drop-frame and a
        non-drop timeline of the same clip contain exactly the same frames.
      </p>
    </main>
  );
}
