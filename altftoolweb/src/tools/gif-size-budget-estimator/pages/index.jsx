"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileImage, RotateCcw } from "lucide-react";

import {
  CONTENT_PROFILES,
  MAX_GIF_FRAMES,
  MOTION_PROFILES,
  SIZE_BUDGETS,
  estimateGifSize,
  formatBytes,
  framesWithinBudget,
  widthWithinBudget,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  width: "480",
  height: "270",
  frames: "30",
  fps: "15",
  colours: "128",
  contentId: "mixed",
  motionId: "moderate",
  dithered: false,
  budgetId: "web",
};

const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const settings = useMemo(
    () => ({
      width: Number(form.width),
      height: Number(form.height),
      frames: Number(form.frames),
      colours: Number(form.colours),
      contentId: form.contentId,
      motionId: form.motionId,
      dithered: form.dithered,
      fps: Number(form.fps),
    }),
    [form],
  );

  const result = useMemo(() => estimateGifSize(settings), [settings]);

  const budget = SIZE_BUDGETS.find((entry) => entry.id === form.budgetId) || SIZE_BUDGETS[2];

  const fitting = useMemo(() => {
    if (result.error) return { frames: null, width: null };
    return {
      frames: framesWithinBudget({ budgetBytes: budget.bytes, ...settings }),
      width: widthWithinBudget({ budgetBytes: budget.bytes, ...settings }),
    };
  }, [result.error, budget.bytes, settings]);

  const failed = Boolean(result.error);
  const dash = "—";
  const withinBudget = !failed && result.totalBytes <= budget.bytes;

  const copyResult = async () => {
    if (failed) return;
    const text = [
      "GIF size estimate",
      `${result.width}×${result.height}, ${INT.format(result.frames)} frames, ${result.colours}-colour palette`,
      `Content: ${result.content.label}${result.dithered ? " (dithered)" : ""}`,
      `Motion: ${result.motion.label}`,
      `Estimated size: ${formatBytes(result.totalBytes)} (range ${formatBytes(result.lowEstimate)} – ${formatBytes(result.highEstimate)})`,
      `Uncompressed indexed data would be ${formatBytes(result.rawTotalBytes)}`,
      `Against a ${formatBytes(budget.bytes)} budget: ${withinBudget ? "fits" : "over"}`,
      fitting.frames !== null
        ? `Frames that fit the budget at this size: ${fitting.frames >= MAX_GIF_FRAMES ? `${INT.format(MAX_GIF_FRAMES)}+ (capped — not playable beyond this)` : INT.format(fitting.frames)}`
        : "",
      fitting.width !== null ? `Width that fits the budget at this frame count: ${INT.format(fitting.width)} px` : "",
    ]
      .filter(Boolean)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <FileImage className="h-4 w-4" aria-hidden="true" />
          GIF creation
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">GIF Size Budget Estimator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out roughly what a GIF will weigh before you export it. The container overhead comes
          straight from the GIF89a specification; the pixel data is estimated from the palette depth,
          the kind of content and how much of each frame actually changes.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gif-width">
              Width (px)
            </label>
            <input id="gif-width" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="1" step="1" value={form.width} onChange={(e) => setField("width", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gif-height">
              Height (px)
            </label>
            <input id="gif-height" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="1" step="1" value={form.height} onChange={(e) => setField("height", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gif-frames">
              Frames
            </label>
            <input id="gif-frames" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="1" step="1" value={form.frames} onChange={(e) => setField("frames", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gif-fps">
              Frame rate (fps)
            </label>
            <input id="gif-fps" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="1" step="1" value={form.fps} onChange={(e) => setField("fps", e.target.value)} />
            <p className={HINT_CLASS}>Only used to show the playback length</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gif-colours">
              Palette colours (2–256)
            </label>
            <input id="gif-colours" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="2" max="256" step="1" value={form.colours} onChange={(e) => setField("colours", e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gif-budget">
              Size budget
            </label>
            <select id="gif-budget" className={`mt-2 ${INPUT_CLASS}`} value={form.budgetId} onChange={(e) => setField("budgetId", e.target.value)}>
              {SIZE_BUDGETS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label} — {formatBytes(entry.bytes)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gif-content">
              Content type
            </label>
            <select id="gif-content" className={`mt-2 ${INPUT_CLASS}`} value={form.contentId} onChange={(e) => setField("contentId", e.target.value)}>
              {CONTENT_PROFILES.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gif-motion">
              How much changes per frame
            </label>
            <select id="gif-motion" className={`mt-2 ${INPUT_CLASS}`} value={form.motionId} onChange={(e) => setField("motionId", e.target.value)}>
              {MOTION_PROFILES.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold" htmlFor="gif-dither">
          <input id="gif-dither" type="checkbox" className="h-4 w-4" checked={form.dithered} onChange={(e) => setField("dithered", e.target.checked)} />
          Dithering is on
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["480×270", { width: "480", height: "270" }],
            ["640×360", { width: "640", height: "360" }],
            ["800×600", { width: "800", height: "600" }],
            ["1080×1080", { width: "1080", height: "1080" }],
          ].map(([label, patch]) => (
            <button
              key={label}
              type="button"
              onClick={() => setForm((current) => ({ ...current, ...patch }))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {failed ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">Estimated file size</p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{failed ? dash : formatBytes(result.totalBytes)}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? dash : `Likely between ${formatBytes(result.lowEstimate)} and ${formatBytes(result.highEstimate)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the GIF size estimate" className={GHOST_BTN} disabled={failed}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!failed ? (
          <p className={`mt-4 rounded-md px-3 py-2 text-sm font-semibold ${withinBudget ? "bg-[var(--muted)] text-[var(--success)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"}`}>
            {withinBudget
              ? `Fits the ${formatBytes(budget.bytes)} budget with ${formatBytes(budget.bytes - result.totalBytes)} to spare.`
              : `Over the ${formatBytes(budget.bytes)} budget by ${formatBytes(result.totalBytes - budget.bytes)}.`}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Bits per pixel", failed ? dash : `${result.bitsPerPixel} (palette rounded up to ${result.paletteEntries} entries)`],
            ["Uncompressed indexed data", failed ? dash : formatBytes(result.rawTotalBytes)],
            ["Assumed compression", failed ? dash : `${NUM.format(result.compressionRatio * 100)}% of raw${result.dithered ? ", including the dithering penalty" : ""}`],
            ["First frame", failed ? dash : formatBytes(result.firstFrameBytes)],
            ["Each frame after that", failed ? dash : formatBytes(result.laterFrameBytes)],
            ["Container and palette overhead", failed ? dash : formatBytes(result.containerBytes)],
            ["Playback length", failed ? dash : result.durationSeconds === null ? "Enter a frame rate" : `${NUM.format(result.durationSeconds)} s`],
            [
              "Frames that fit the budget",
              failed || fitting.frames === null
                ? dash
                : fitting.frames >= MAX_GIF_FRAMES
                  ? `${INT.format(MAX_GIF_FRAMES)}+ (capped — not playable beyond this)`
                  : INT.format(fitting.frames),
            ],
            ["Width that fits the budget", failed || fitting.width === null ? dash : `${INT.format(fitting.width)} px`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        LZW compression depends entirely on the picture, so this is a budgeting estimate with roughly
        ±40% of spread, not a measurement. The header, screen descriptor, colour table, per-frame
        blocks and sub-block prefixes are exact spec figures; the pixel data is modelled.
      </p>
    </main>
  );
}
