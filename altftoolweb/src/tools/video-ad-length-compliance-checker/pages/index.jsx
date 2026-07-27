"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Video } from "lucide-react";

import {
  COMMON_FRAME_RATES,
  PLACEMENTS,
  STATUS,
  checkAdDuration,
  formatDelta,
  formatSeconds,
  parseDurationToSeconds,
  secondsFromFrames,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SELECTED = ["yt-bumper", "ig-reels", "tiktok-infeed", "meta-feed"];

const DEFAULTS = {
  mode: "time",
  duration: "0:15",
  frames: "375",
  fps: "25",
  selected: DEFAULT_SELECTED,
};

const STATUS_TONE = {
  [STATUS.pass]: "text-[var(--success)]",
  [STATUS.warn]: "text-[var(--foreground)]",
  [STATUS.fail]: "text-[var(--danger)]",
};

const STATUS_LABEL = {
  [STATUS.pass]: "Pass",
  [STATUS.warn]: "Warning",
  [STATUS.fail]: "Reject",
};

const PLATFORMS = [...new Set(PLACEMENTS.map((placement) => placement.platform))];

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [duration, setDuration] = useState(DEFAULTS.duration);
  const [frames, setFrames] = useState(DEFAULTS.frames);
  const [fps, setFps] = useState(DEFAULTS.fps);
  const [selected, setSelected] = useState(DEFAULTS.selected);
  const [copied, setCopied] = useState(false);

  const fpsValue = Number(fps);

  const seconds = useMemo(() => {
    if (mode === "frames") return secondsFromFrames(Number(frames), fpsValue);
    return parseDurationToSeconds(duration);
  }, [mode, frames, fpsValue, duration]);

  const result = useMemo(
    () =>
      seconds === null
        ? { error: "Enter the clip length as seconds (15), mm:ss (0:15) or a frame count." }
        : checkAdDuration({ seconds, selectedIds: selected, fps: fpsValue }),
    [seconds, selected, fpsValue],
  );

  const hasError = Boolean(result.error);

  const toggle = (id) => {
    setSelected((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));
  };

  const selectPlatform = (platform) => {
    const ids = PLACEMENTS.filter((placement) => placement.platform === platform).map((p) => p.id);
    setSelected((list) => [...new Set([...list, ...ids])]);
  };

  const reset = () => {
    setMode(DEFAULTS.mode);
    setDuration(DEFAULTS.duration);
    setFrames(DEFAULTS.frames);
    setFps(DEFAULTS.fps);
    setSelected(DEFAULTS.selected);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Video Ad Length Compliance Checker",
      `Clip length: ${formatSeconds(result.seconds)} (${result.frames} frames at ${result.fps} fps)`,
      `Verdict: ${result.verdict.label}`,
      "",
      ...result.rows.map(
        (row) =>
          `${STATUS_LABEL[row.status]}  ${row.platform} — ${row.name}: accepts ${formatSeconds(
            row.minSec,
          )}–${formatSeconds(row.maxSec)}, recommends ${formatSeconds(row.recMinSec)}–${formatSeconds(
            row.recMaxSec,
          )}. ${row.reason}`,
      ),
      "",
      result.singleCutPossible
        ? `One master cut clears every selected placement between ${formatSeconds(result.hardMin)} and ${formatSeconds(result.hardMax)}.`
        : "No single length clears every selected placement — you need more than one cut.",
    ].join("\n");
  }, [result, hasError]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Video className="h-4 w-4" aria-hidden="true" />
          Pre-flight
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Video Ad Length Compliance Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Check one cut against the accepted minimum and maximum length of every placement you plan
          to run it in, and see where it also falls outside the platform&rsquo;s recommended band.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <fieldset>
          <legend className="text-sm font-semibold">How do you know the length?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["time", "Duration"],
              ["frames", "Frame count"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
                className={
                  mode === value
                    ? `${PRIMARY_BTN} px-3`
                    : "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                }
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {mode === "time" ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="valc-duration">
                Clip length (seconds or mm:ss)
              </label>
              <input
                id="valc-duration"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                inputMode="numeric"
                placeholder="0:15"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
              />
            </div>
          ) : (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="valc-frames">
                  Frame count
                </label>
                <input
                  id="valc-frames"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={frames}
                  onChange={(event) => setFrames(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="valc-fps">
                  Frame rate (fps)
                </label>
                <select
                  id="valc-fps"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={fps}
                  onChange={(event) => setFps(event.target.value)}
                >
                  {COMMON_FRAME_RATES.map((rate) => (
                    <option key={rate} value={String(rate)}>
                      {rate} fps
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold">Placements to check</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PLATFORMS.map((platform) => (
              <button
                key={platform}
                type="button"
                onClick={() => selectPlatform(platform)}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                + all {platform}
              </button>
            ))}
            <button type="button" onClick={() => setSelected([])} className={GHOST_BTN}>
              Clear
            </button>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {PLACEMENTS.map((placement) => (
              <li key={placement.id}>
                <label
                  className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] p-3 text-sm"
                  htmlFor={`valc-${placement.id}`}
                >
                  <input
                    id={`valc-${placement.id}`}
                    type="checkbox"
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                    checked={selected.includes(placement.id)}
                    onChange={() => toggle(placement.id)}
                  />
                  <span>
                    <span className="font-semibold">{placement.platform}</span>{" "}
                    <span className="text-[var(--muted-foreground)]">{placement.name}</span>
                    <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                      {formatSeconds(placement.minSec)}–{formatSeconds(placement.maxSec)} accepted
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
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
              Placements cleared
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : `${result.acceptedCount}/${result.rows.length}`}
            </p>
            <p className={`mt-1 text-sm font-semibold ${hasError ? "" : STATUS_TONE[result.verdict.id] || ""}`}>
              {hasError ? "—" : result.verdict.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the compliance report"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Clip length", hasError ? "—" : formatSeconds(result.seconds)],
            ["At " + (Number.isFinite(fpsValue) ? fpsValue : "—") + " fps", hasError ? "—" : `${result.frames} frames`],
            [
              "One cut clears everything between",
              hasError
                ? "—"
                : result.singleCutPossible
                  ? `${formatSeconds(result.hardMin)} and ${formatSeconds(result.hardMax)}`
                  : "No single length works — cut more than one version",
            ],
            [
              "Recommended band shared by all",
              hasError
                ? "—"
                : result.sweetSpotPossible
                  ? `${formatSeconds(result.softMin)} to ${formatSeconds(result.softMax)}`
                  : "The recommended bands do not overlap",
            ],
            [
              "Nearest standard broadcast slot",
              hasError
                ? "—"
                : `${formatSeconds(result.nearestSlot.slotSec)} (${formatDelta(result.nearestSlot.deltaSec)})`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Placement by placement</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Placement</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Accepts</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Recommends</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Result</th>
                  <th scope="col" className="py-2 text-right font-semibold">Trim / extend</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{row.platform}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">{row.name}</span>
                    </td>
                    <td className="py-2 pr-3 tabular-nums">
                      {formatSeconds(row.minSec)}–{formatSeconds(row.maxSec)}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">
                      {formatSeconds(row.recMinSec)}–{formatSeconds(row.recMaxSec)}
                    </td>
                    <td className={`py-2 pr-3 font-semibold ${STATUS_TONE[row.status]}`}>
                      {STATUS_LABEL[row.status]}
                      <span className="block text-xs font-normal text-[var(--muted-foreground)]">{row.reason}</span>
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {formatDelta(row.adjustSec)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.rows.map((row) => (
              <li key={`${row.id}-note`}>
                <span className="font-semibold text-[var(--foreground)]">
                  {row.platform} {row.name}:
                </span>{" "}
                {row.note} <span className="text-xs">({row.source})</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Ad platforms revise their creative specs regularly and some limits differ by market or
        account type. Confirm against the platform&rsquo;s own spec sheet before a large delivery.
      </p>
    </main>
  );
}
