"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Check, Copy, RotateCcw } from "lucide-react";

import { formatDuration, planTimelapse, toSeconds } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)]";

const DEFAULTS = { hours: "4", intervalSeconds: "10", playbackFps: "24", fileSizeMB: "24", cardGB: "64", exposureSeconds: "0" };

export default function ToolHome() {
  const [hours, setHours] = useState(DEFAULTS.hours);
  const [intervalSeconds, setIntervalSeconds] = useState(DEFAULTS.intervalSeconds);
  const [playbackFps, setPlaybackFps] = useState(DEFAULTS.playbackFps);
  const [fileSizeMB, setFileSizeMB] = useState(DEFAULTS.fileSizeMB);
  const [cardGB, setCardGB] = useState(DEFAULTS.cardGB);
  // Exposure time so the interval-too-short-for-the-shutter check (which
  // lib.js already computes) has a non-zero value to actually evaluate —
  // previously this was never collected from the UI, so the check could
  // never fire even though seo.js advertised it.
  const [exposureSeconds, setExposureSeconds] = useState(DEFAULTS.exposureSeconds);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const result = useMemo(
    () =>
      planTimelapse({
        realDurationSeconds: toSeconds({ hours: Number(hours) }),
        intervalSeconds: Number(intervalSeconds),
        playbackFps: Number(playbackFps),
        fileMegabytes: Number(fileSizeMB),
        cardGigabytes: Number(cardGB),
        exposureSeconds: Number(exposureSeconds),
      }),
    [hours, intervalSeconds, playbackFps, fileSizeMB, cardGB, exposureSeconds],
  );

  const copy = async () => {
    if (result.error) return;
    const text = `Timelapse: ${result.shots} shots, ${formatDuration(result.clipSeconds)} clip, ${result.totalGigabytes.toFixed(1)}GB card use.`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setHours(DEFAULTS.hours);
    setIntervalSeconds(DEFAULTS.intervalSeconds);
    setPlaybackFps(DEFAULTS.playbackFps);
    setFileSizeMB(DEFAULTS.fileSizeMB);
    setCardGB(DEFAULTS.cardGB);
    setExposureSeconds(DEFAULTS.exposureSeconds);
  };

  const fields = [
    ["Shoot hours", hours, setHours],
    ["Interval sec", intervalSeconds, setIntervalSeconds],
    ["Playback fps", playbackFps, setPlaybackFps],
    ["MB/photo", fileSizeMB, setFileSizeMB],
    ["Card GB", cardGB, setCardGB],
    ["Exposure sec", exposureSeconds, setExposureSeconds],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Camera className="h-4 w-4" aria-hidden="true" />
          Timelapse math
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Timelapse Interval Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out interval, frame count, finished clip length and card space.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-5">
          {fields.map(([label, value, setter]) => (
            <div key={label}>
              <label className="block text-sm font-semibold" htmlFor={`tl-${label}`}>
                {label}
              </label>
              <input
                id={`tl-${label}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                value={value}
                onChange={(event) => setter(event.target.value)}
              />
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          Leave exposure at 0 to skip the interval-too-short check. Set it to your shutter speed and
          the plan below will flag an interval that would make the intervalometer skip frames.
        </p>
      </section>

      {result.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {result.error}
        </p>
      ) : (
        <section
          className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-[var(--surface-soft)] p-3">
              <p className="text-xs text-[var(--muted-foreground)]">Shots</p>
              <p className="mt-1 font-semibold">{result.shots}</p>
            </div>
            <div className="rounded-lg bg-[var(--surface-soft)] p-3">
              <p className="text-xs text-[var(--muted-foreground)]">Clip</p>
              <p className="mt-1 font-semibold">{formatDuration(result.clipSeconds)}</p>
            </div>
            <div className="rounded-lg bg-[var(--surface-soft)] p-3">
              <p className="text-xs text-[var(--muted-foreground)]">Storage</p>
              <p className="mt-1 font-semibold">{result.totalGigabytes.toFixed(1)}GB</p>
            </div>
            <div className="rounded-lg bg-[var(--surface-soft)] p-3">
              <p className="text-xs text-[var(--muted-foreground)]">Card</p>
              <p className={result.cardFits ? "mt-1 font-semibold text-[var(--success)]" : "mt-1 font-semibold text-[var(--danger)]"}>
                {result.cardFits ? "fits" : "too small"}
              </p>
            </div>
          </div>

          {result.warnings.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm">
              {result.warnings.map((warning) => (
                <li key={warning} className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-[var(--warning-text)]">
                  {warning}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button className={GHOST_BTN} type="button" aria-label="Reset all inputs" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <button className={PRIMARY_BTN} type="button" aria-label="Copy the timelapse plan" onClick={copy}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
