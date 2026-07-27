"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Film, RotateCcw } from "lucide-react";
import { FRAME_RATES, convertFrameTime, findRate } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
const NUM0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const MODES = [
  { id: "frames", label: "Frames" },
  { id: "seconds", label: "Seconds" },
  { id: "timecode", label: "Timecode" },
];

const DEFAULTS = {
  mode: "frames",
  frames: "240",
  seconds: "10",
  timecode: "00:00:10:00",
  rateId: "25",
  dropFrame: false,
};

const REFERENCE_DURATIONS = [
  ["1 second", 1],
  ["10 seconds", 10],
  ["30 seconds", 30],
  ["1 minute", 60],
  ["1 hour", 3600],
];

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [frames, setFrames] = useState(DEFAULTS.frames);
  const [seconds, setSeconds] = useState(DEFAULTS.seconds);
  const [timecode, setTimecode] = useState(DEFAULTS.timecode);
  const [rateId, setRateId] = useState(DEFAULTS.rateId);
  const [dropFrame, setDropFrame] = useState(DEFAULTS.dropFrame);
  const [copied, setCopied] = useState(false);

  const rate = findRate(rateId);
  const dropAllowed = Boolean(rate?.dropFrameAllowed);

  const result = useMemo(
    () =>
      convertFrameTime({
        mode,
        value: mode === "seconds" ? toNumber(seconds) : toNumber(frames),
        timecode,
        rateId,
        dropFrame: dropFrame && dropAllowed,
      }),
    [mode, seconds, frames, timecode, rateId, dropFrame, dropAllowed],
  );

  const hasError = Boolean(result.error);

  const referenceRows = useMemo(
    () =>
      REFERENCE_DURATIONS.map(([label, value]) => {
        const row = convertFrameTime({ mode: "seconds", value, rateId, dropFrame: dropFrame && dropAllowed });
        return [label, row.error ? DASH : NUM0.format(row.frames), row.error ? DASH : row.timecode];
      }),
    [rateId, dropFrame, dropAllowed],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Frames / seconds / timecode",
      `Frame rate: ${rate?.label ?? rateId}${result.dropFrame ? " drop-frame" : ""}`,
      `Frames: ${NUM0.format(result.frames)}`,
      `Duration: ${NUM.format(result.seconds)} s (${result.durationText})`,
      `Timecode: ${result.timecode}`,
      result.otherTimecode
        ? `${result.dropFrame ? "Non-drop" : "Drop-frame"} equivalent: ${result.otherTimecode}`
        : "",
      `One frame lasts ${NUM.format(result.msPerFrame)} ms`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, rate, rateId]);

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
    setFrames(DEFAULTS.frames);
    setSeconds(DEFAULTS.seconds);
    setTimecode(DEFAULTS.timecode);
    setRateId(DEFAULTS.rateId);
    setDropFrame(DEFAULTS.dropFrame);
    setCopied(false);
  };

  const primaryValue = hasError
    ? DASH
    : mode === "seconds"
      ? `${NUM0.format(result.frames)} frames`
      : `${NUM.format(result.seconds)} s`;

  const rows = [
    ["Frames", hasError ? DASH : NUM0.format(result.frames)],
    ["Duration (real time)", hasError ? DASH : result.durationText],
    ["Timecode", hasError ? DASH : result.timecode],
    [
      result.dropFrame ? "Non-drop timecode" : "Drop-frame timecode",
      hasError || !result.otherTimecode ? DASH : result.otherTimecode,
    ],
    ["One frame lasts", hasError ? DASH : `${NUM.format(result.msPerFrame)} ms`],
    ["Frames per minute", hasError ? DASH : NUM.format(result.framesPerMinute)],
    [
      "Difference vs counting at the nominal rate",
      hasError ? DASH : `${NUM.format(result.driftSeconds)} s`,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Film className="h-4 w-4" aria-hidden="true" />
          Editing maths
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Frames to Seconds Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert a frame count into seconds and SMPTE timecode at any frame rate — or start from a
          duration or timecode and get the frame count back.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Choose what you are converting from"
        >
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              aria-pressed={mode === item.id}
              className={`min-h-11 rounded-md border px-4 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                mode === item.id
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
              }`}
            >
              From {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {mode === "frames" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="fts-frames">
                Frame count
              </label>
              <input
                id="fts-frames"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={frames}
                onChange={(event) => setFrames(event.target.value)}
              />
            </div>
          ) : null}

          {mode === "seconds" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="fts-seconds">
                Duration (seconds)
              </label>
              <input
                id="fts-seconds"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.001"
                value={seconds}
                onChange={(event) => setSeconds(event.target.value)}
              />
            </div>
          ) : null}

          {mode === "timecode" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="fts-timecode">
                Timecode (HH:MM:SS:FF)
              </label>
              <input
                id="fts-timecode"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                inputMode="numeric"
                placeholder="00:01:30:12"
                value={timecode}
                onChange={(event) => setTimecode(event.target.value)}
              />
            </div>
          ) : null}

          <div>
            <label className={LABEL_CLASS} htmlFor="fts-rate">
              Frame rate
            </label>
            <select
              id="fts-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              value={rateId}
              onChange={(event) => setRateId(event.target.value)}
            >
              {FRAME_RATES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label
            className={`inline-flex min-h-11 items-center gap-3 ${dropAllowed ? "" : "opacity-50"}`}
            htmlFor="fts-df"
          >
            <input
              id="fts-df"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={dropFrame && dropAllowed}
              disabled={!dropAllowed}
              onChange={(event) => setDropFrame(event.target.checked)}
            />
            <span className="text-sm font-semibold">
              Drop-frame timecode
              <span className="ml-1 font-normal text-[var(--muted-foreground)]">
                {dropAllowed ? "(NTSC broadcast counting)" : "(only for 29.97 and 59.94 fps)"}
              </span>
            </span>
          </label>
        </div>
      </section>

      {hasError ? (
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
              {mode === "seconds" ? "Frame count" : "Real-time duration"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{primaryValue}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see a result." : `Timecode ${result.timecode}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy frame and timecode conversion"
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
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Quick reference at this frame rate</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Duration</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Frames</th>
                <th scope="col" className="py-2 text-right font-semibold">Timecode</th>
              </tr>
            </thead>
            <tbody>
              {referenceRows.map(([label, frameText, tc]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{label}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{frameText}</td>
                  <td className="py-2 text-right tabular-nums text-[var(--muted-foreground)]">{tc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Drop-frame timecode skips frame labels, never pictures, so the frame count of a clip is
        unchanged. Non-drop timecode at 29.97 fps runs about 3.6 seconds slow every hour.
      </p>
    </main>
  );
}
