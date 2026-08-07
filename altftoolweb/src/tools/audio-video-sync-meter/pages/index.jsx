"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Timer, Trash2 } from "lucide-react";

import {
  FRAME_RATES,
  averageOffsets,
  correctionCommand,
  gradeOffset,
  measureSync,
  parseTimeToSeconds,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const DASH = "—";

const msFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1, signDisplay: "exceptZero" });
const plainFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const intFmt = new Intl.NumberFormat("en-IN");

const DEFAULTS = { fps: 25, flashFrame: 30, audioTime: "1.200", frameBase: 1 };

export default function ToolHome() {
  const [fps, setFps] = useState(DEFAULTS.fps);
  const [flashFrame, setFlashFrame] = useState(DEFAULTS.flashFrame);
  const [audioTime, setAudioTime] = useState(DEFAULTS.audioTime);
  const [frameBase, setFrameBase] = useState(DEFAULTS.frameBase);
  const [samples, setSamples] = useState([]);
  const [copied, setCopied] = useState(false);

  const parsedAudio = useMemo(() => parseTimeToSeconds(audioTime), [audioTime]);
  const result = useMemo(() => {
    if (parsedAudio.error) return { error: parsedAudio.error };
    return measureSync({ flashFrame, fps, audioSeconds: parsedAudio.seconds, frameBase });
  }, [parsedAudio, flashFrame, fps, frameBase]);
  const failed = Boolean(result.error);

  const grade = useMemo(() => (failed ? null : gradeOffset(result.offsetMs)), [failed, result]);
  const fix = useMemo(() => (failed ? null : correctionCommand(result.offsetMs)), [failed, result]);
  const average = useMemo(() => (samples.length ? averageOffsets(samples) : null), [samples]);

  function addSample() {
    if (failed) return;
    setSamples((current) => [...current, result.offsetMs]);
  }

  async function copyReport() {
    if (failed || !fix) return;
    const lines = [
      `A/V sync offset: ${result.offsetMs.toFixed(1)} ms (${result.direction})`,
      `Flash frame ${flashFrame} at ${fps} fps = ${result.videoSeconds.toFixed(4)} s; audio spike ${result.audioSeconds.toFixed(4)} s`,
      `Offset in frames: ${result.offsetFrames.toFixed(2)}`,
      ...grade.standards.map((standard) => `${standard.name}: ${standard.pass ? "pass" : "fail"}`),
      fix.command,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function reset() {
    setFps(DEFAULTS.fps);
    setFlashFrame(DEFAULTS.flashFrame);
    setAudioTime(DEFAULTS.audioTime);
    setFrameBase(DEFAULTS.frameBase);
    setSamples([]);
    setCopied(false);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Timer className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Audio-Video Sync Meter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Film a clap or a camera flash, then read two numbers off your editor: the frame the
          flash lands on and the time of the audio spike. This works out the offset in
          milliseconds and frames, grades it against ATSC, EBU and ITU limits, and writes the
          ffmpeg command that fixes it.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="fps">
            Frame rate (fps)
          </label>
          <input
            id="fps"
            type="number"
            min={1}
            max={480}
            step="any"
            list="fps-options"
            className={`${INPUT_CLASS} mt-1`}
            value={fps}
            onChange={(event) => setFps(Number(event.target.value))}
          />
          <datalist id="fps-options">
            {FRAME_RATES.map((rate) => (
              <option key={rate} value={rate} />
            ))}
          </datalist>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="flash-frame">
            Frame of the flash / clap
          </label>
          <input
            id="flash-frame"
            type="number"
            min={0}
            step={1}
            className={`${INPUT_CLASS} mt-1`}
            value={flashFrame}
            onChange={(event) => setFlashFrame(Number(event.target.value))}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="audio-time">
            Audio spike time (seconds or HH:MM:SS.mmm)
          </label>
          <input
            id="audio-time"
            type="text"
            inputMode="decimal"
            className={`${INPUT_CLASS} mt-1`}
            value={audioTime}
            onChange={(event) => setAudioTime(event.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="frame-base">
            First frame is numbered
          </label>
          <select
            id="frame-base"
            className={`${INPUT_CLASS} mt-1`}
            value={frameBase}
            onChange={(event) => setFrameBase(Number(event.target.value))}
          >
            <option value={1}>1 (most NLEs)</option>
            <option value={0}>0 (ffmpeg, frame extractors)</option>
          </select>
        </div>
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className={PRIMARY_BTN} onClick={copyReport} disabled={failed} aria-label="Copy the sync report">
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy report"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={addSample} disabled={failed} aria-label="Add this measurement to the average">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add to average
        </button>
        <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset the sync meter">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {failed ? (
        <div
          role="alert"
          className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </div>
      ) : null}

      <section
        className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="text-sm font-medium text-[var(--muted-foreground)]">Audio offset</p>
        <p className="mt-1 text-4xl font-bold tabular-nums sm:text-5xl">
          {failed ? DASH : `${msFmt.format(result.offsetMs)} ms`}
        </p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {failed ? DASH : `${result.direction} · ${grade.verdict}`}
        </p>

        <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <Row label="Video timestamp of flash" value={failed ? DASH : `${plainFmt.format(result.videoSeconds * 1000)} ms`} />
          <Row label="Audio spike" value={failed ? DASH : `${plainFmt.format(result.audioSeconds * 1000)} ms`} />
          <Row label="Offset in frames" value={failed ? DASH : plainFmt.format(result.offsetFrames)} />
          <Row label="One frame is" value={failed ? DASH : `${plainFmt.format(result.frameMs)} ms`} />
          <Row label="Standards passed" value={failed ? DASH : `${grade.passedCount} of ${grade.standards.length}`} />
          <Row label="Audio lead / lag" value={failed ? DASH : grade.leadMs ? `${plainFmt.format(grade.leadMs)} ms early` : grade.lagMs ? `${plainFmt.format(grade.lagMs)} ms late` : "in sync"} />
        </dl>
      </section>

      <section
        className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        aria-atomic="true"
      >
        <h2 className="text-base font-semibold">Against the standards</h2>
        {failed ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-medium">Standard</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Allows</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Result</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Margin</th>
                </tr>
              </thead>
              <tbody>
                {grade.standards.map((standard) => (
                  <tr key={standard.id} className="border-b border-[var(--border)]">
                    <th scope="row" className="py-2 pr-3 font-semibold">
                      {standard.name}
                      <span className="block text-xs font-normal text-[var(--muted-foreground)]">{standard.scope}</span>
                    </th>
                    <td className="py-2 pr-3 tabular-nums">
                      {standard.maxLeadMs} ms early / {standard.maxLagMs} ms late
                    </td>
                    <td className={`py-2 pr-3 font-semibold ${standard.pass ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                      {standard.pass ? "Pass" : "Fail"}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">{plainFmt.format(standard.marginMs)} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section
        className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        aria-atomic="true"
      >
        <h2 className="text-base font-semibold">Correction</h2>
        {failed || !fix ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{fix.explanation}</p>
            <div className="mt-3 overflow-x-auto">
              <pre className="min-w-full whitespace-pre rounded-md bg-[var(--background)] p-3 font-mono text-xs leading-5">
                {fix.command}
              </pre>
            </div>
          </>
        )}
      </section>

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Average of several slates</h2>
        {!average ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Measure two or three claps and add each one — averaging cancels the half-frame error in
            reading a single flash.
          </p>
        ) : (
          <>
            <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Row label="Measurements" value={intFmt.format(average.count)} />
              <Row label="Mean offset" value={`${msFmt.format(average.meanMs)} ms`} />
              <Row label="Standard deviation" value={`${plainFmt.format(average.stdDevMs)} ms`} />
              <Row label="Spread" value={`${plainFmt.format(average.rangeMs)} ms`} />
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              {samples.map((sample, index) => (
                <span
                  key={`${sample}-${index}`}
                  className="rounded-md border border-[var(--border)] px-3 py-1 text-sm tabular-nums"
                >
                  {msFmt.format(sample)} ms
                </span>
              ))}
            </div>
            <button type="button" className={`${GHOST_BTN} mt-4`} onClick={() => setSamples([])} aria-label="Clear the measurement list">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear measurements
            </button>
          </>
        )}
      </section>
    </main>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-right text-sm font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
