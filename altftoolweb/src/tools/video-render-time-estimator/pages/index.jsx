"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Film, RotateCcw } from "lucide-react";

import {
  CODECS,
  EFFECTS_LOADS,
  MACHINE_CLASSES,
  RESOLUTIONS,
  SOURCE_FORMATS,
  compareMachines,
  estimateRenderTime,
  formatDuration,
} from "../lib";

const DEFAULTS = {
  timelineMinutes: "10",
  resolution: "4k-uhd",
  fps: "30",
  machine: "desktop-mid",
  codec: "h264-hw",
  effects: "light",
  source: "longgop",
  passes: "1",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const byId = (list, id) => list.find((item) => item.id === id) || list[0];

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const resolution = useMemo(() => byId(RESOLUTIONS, values.resolution), [values.resolution]);

  const result = useMemo(
    () =>
      estimateRenderTime({
        timelineMinutes: Number(values.timelineMinutes),
        width: resolution.width,
        height: resolution.height,
        fps: Number(values.fps),
        machine: values.machine,
        codec: values.codec,
        effects: values.effects,
        source: values.source,
        passes: Number(values.passes),
      }),
    [resolution.height, resolution.width, values],
  );

  const hasError = Boolean(result.error);

  const comparison = useMemo(() => {
    if (hasError) return [];
    return compareMachines({
      timelineMinutes: Number(values.timelineMinutes),
      width: resolution.width,
      height: resolution.height,
      fps: Number(values.fps),
      codec: values.codec,
      effects: values.effects,
      source: values.source,
      passes: Number(values.passes),
    });
  }, [hasError, resolution.height, resolution.width, values]);

  const update = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const reset = () => {
    setValues(DEFAULTS);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Video Render Time Estimator",
      `Timeline: ${values.timelineMinutes} min, ${resolution.name}, ${values.fps} fps`,
      `Machine: ${result.machine.name}`,
      `Codec: ${result.codec.name}`,
      `Effects: ${result.effects.name}`,
      `Source: ${result.source.name}`,
      `Estimated render time: ${formatDuration(result.renderSeconds)}`,
      `Realtime factor: ${NUM2.format(result.realtimeFactor)}x`,
    ].join("\n");
  }, [hasError, resolution.name, result, values.fps, values.timelineMinutes]);

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

  const rows = hasError
    ? [
        ["Render time", DASH],
        ["Realtime factor", DASH],
        ["Frames/sec export", DASH],
        ["Work multiplier", DASH],
      ]
    : [
        ["Render time", formatDuration(result.renderSeconds)],
        ["Realtime factor", `${NUM2.format(result.realtimeFactor)}x`],
        ["Frames/sec export", NUM1.format(result.framesPerSecond)],
        ["Work multiplier", `${NUM2.format(result.workMultiplier)}x`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Film className="h-4 w-4" aria-hidden="true" />
          Video production
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Video Render Time Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimate export time from timeline length, resolution, frame rate, codec, effects load
          and machine class.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="render-minutes">
              Timeline length (minutes)
            </label>
            <input id="render-minutes" className={`mt-2 ${INPUT_CLASS}`} type="number" min="0.1" step="0.5" value={values.timelineMinutes} onChange={(event) => update("timelineMinutes", event.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="render-fps">
              Frame rate
            </label>
            <input id="render-fps" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" max="480" step="1" value={values.fps} onChange={(event) => update("fps", event.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="render-resolution">
              Resolution
            </label>
            <select id="render-resolution" className={`mt-2 ${INPUT_CLASS}`} value={values.resolution} onChange={(event) => update("resolution", event.target.value)}>
              {RESOLUTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="render-machine">
              Machine class
            </label>
            <select id="render-machine" className={`mt-2 ${INPUT_CLASS}`} value={values.machine} onChange={(event) => update("machine", event.target.value)}>
              {MACHINE_CLASSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="render-codec">
              Export codec
            </label>
            <select id="render-codec" className={`mt-2 ${INPUT_CLASS}`} value={values.codec} onChange={(event) => update("codec", event.target.value)}>
              {CODECS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="render-effects">
              Effects load
            </label>
            <select id="render-effects" className={`mt-2 ${INPUT_CLASS}`} value={values.effects} onChange={(event) => update("effects", event.target.value)}>
              {EFFECTS_LOADS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="render-source">
              Source media
            </label>
            <select id="render-source" className={`mt-2 ${INPUT_CLASS}`} value={values.source} onChange={(event) => update("source", event.target.value)}>
              {SOURCE_FORMATS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="render-passes">
              Encoding passes
            </label>
            <select id="render-passes" className={`mt-2 ${INPUT_CLASS}`} value={values.passes} onChange={(event) => update("passes", event.target.value)}>
              <option value="1">1 pass</option>
              <option value="2">2 passes</option>
            </select>
          </div>
        </div>
      </section>

      {hasError && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated render time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : formatDuration(result.renderSeconds)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the inputs above to see the estimate." : `${NUM2.format(result.minutesPerTimelineMinute)} render minutes per timeline minute.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy render time estimate" disabled={hasError} className={`${GHOST_BTN} disabled:opacity-50`}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy estimate"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the render estimator" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
              <dt className="text-xs font-medium text-[var(--muted-foreground)]">{label}</dt>
              <dd className="mt-1 text-sm font-semibold text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5 overflow-hidden rounded-lg ring-1 ring-[var(--border)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--surface-soft)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <tr>
                  <th className="px-3 py-2">Machine</th>
                  <th className="px-3 py-2">Estimate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {comparison.map((row) => (
                  <tr key={row.id}>
                    <td className="px-3 py-2 font-medium">{row.name}</td>
                    <td className="px-3 py-2 text-[var(--muted-foreground)]">
                      {row.error ? row.error : formatDuration(row.renderSeconds)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
