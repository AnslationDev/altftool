"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Ratio, RotateCcw } from "lucide-react";
import { computePillarbox, FRAME_PRESETS, RATIO_PRESETS } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const px = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)} px`;
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DEFAULTS = { contentW: "16", contentH: "9", frameW: "1080", frameH: "1920" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const BAR_LABEL = {
  letterbox: "Letterbox (bars on top and bottom)",
  pillarbox: "Pillarbox (bars on the left and right)",
  none: "No bars — the ratios match exactly",
};

export default function ToolHome() {
  const [contentW, setContentW] = useState(DEFAULTS.contentW);
  const [contentH, setContentH] = useState(DEFAULTS.contentH);
  const [frameW, setFrameW] = useState(DEFAULTS.frameW);
  const [frameH, setFrameH] = useState(DEFAULTS.frameH);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computePillarbox({
        contentW: contentW.trim() === "" ? NaN : Number(contentW),
        contentH: contentH.trim() === "" ? NaN : Number(contentH),
        frameWidth: frameW.trim() === "" ? NaN : Number(frameW),
        frameHeight: frameH.trim() === "" ? NaN : Number(frameH),
      }),
    [contentW, contentH, frameW, frameH],
  );

  const hasError = Boolean(result.error);
  const dash = "—";

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Pillarbox Padding Calculator",
      `Content ratio: ${result.contentRatioLabel}`,
      `Frame: ${result.frameWidth} x ${result.frameHeight} (${result.frameRatioLabel})`,
      `Result: ${BAR_LABEL[result.barType]}`,
      `Bar per side: ${px(result.barEach)}`,
      `Total bar area: ${px(result.barTotal)} (${pct(result.barAreaPct)} of the frame)`,
      `Scaled content: ${px(result.scaledWidth)} x ${px(result.scaledHeight)}`,
      `Encoder-safe size: ${result.renderWidth} x ${result.renderHeight} at offset ${result.offsetX}, ${result.offsetY}`,
      `ffmpeg: -vf "${result.ffmpegFilter}"`,
    ].join("\n");
  }, [hasError, result]);

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
    setContentW(DEFAULTS.contentW);
    setContentH(DEFAULTS.contentH);
    setFrameW(DEFAULTS.frameW);
    setFrameH(DEFAULTS.frameH);
    setCopied(false);
  };

  const previewW = 240;
  const previewH = hasError
    ? 135
    : Math.max(60, Math.min(320, (previewW * result.frameHeight) / result.frameWidth));
  const innerW = hasError ? 0 : (result.scaledWidth / result.frameWidth) * previewW;
  const innerH = hasError ? 0 : (result.scaledHeight / result.frameHeight) * previewH;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Ratio className="h-4 w-4" aria-hidden="true" />
          Aspect ratio
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Pillarbox Padding Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Place one aspect ratio inside another without cropping and get the exact bar thickness,
          the scaled content size, encoder-safe even dimensions and a ready-to-paste ffmpeg filter.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Content aspect ratio</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pb-content-w">
              Ratio width
            </label>
            <input
              id="pb-content-w"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={contentW}
              onChange={(event) => setContentW(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pb-content-h">
              Ratio height
            </label>
            <input
              id="pb-content-h"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={contentH}
              onChange={(event) => setContentH(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {RATIO_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={CHIP_BTN}
              onClick={() => {
                setContentW(String(preset.w));
                setContentH(String(preset.h));
              }}
            >
              {preset.w}:{preset.h}
            </button>
          ))}
        </div>

        <h2 className="mt-6 text-base font-semibold">Target frame (pixels)</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pb-frame-w">
              Frame width
            </label>
            <input
              id="pb-frame-w"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="2"
              value={frameW}
              onChange={(event) => setFrameW(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pb-frame-h">
              Frame height
            </label>
            <input
              id="pb-frame-h"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="2"
              value={frameH}
              onChange={(event) => setFrameH(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {FRAME_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={CHIP_BTN}
              onClick={() => {
                setFrameW(String(preset.width));
                setFrameH(String(preset.height));
              }}
            >
              {preset.width}×{preset.height}
            </button>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Bar thickness per side
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : px(result.barEach)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? dash : BAR_LABEL[result.barType]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy pillarbox padding result"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-5 flex justify-center">
            <div
              className="relative rounded-md bg-[var(--muted)] ring-1 ring-[var(--border)]"
              style={{ width: `${previewW}px`, height: `${previewH}px` }}
              role="img"
              aria-label={`Preview: ${result.contentRatioLabel} content inside a ${result.frameRatioLabel} frame`}
            >
              <div
                className="absolute rounded-sm bg-[var(--primary)]"
                style={{
                  width: `${innerW}px`,
                  height: `${innerH}px`,
                  left: `${(previewW - innerW) / 2}px`,
                  top: `${(previewH - innerH) / 2}px`,
                }}
              />
            </div>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Content ratio", hasError ? dash : result.contentRatioLabel],
            ["Frame ratio", hasError ? dash : result.frameRatioLabel],
            [
              "Scaled content size",
              hasError ? dash : `${px(result.scaledWidth)} × ${px(result.scaledHeight)}`,
            ],
            [
              "Encoder-safe size (even pixels)",
              hasError ? dash : `${result.renderWidth} × ${result.renderHeight}`,
            ],
            ["Pad offset (x, y)", hasError ? dash : `${result.offsetX}, ${result.offsetY}`],
            ["Total bar thickness", hasError ? dash : px(result.barTotal)],
            ["Bar per side as % of that edge", hasError ? dash : pct(result.barEachPct)],
            ["Frame area used by content", hasError ? dash : pct(result.contentAreaPct)],
            ["Frame area lost to bars", hasError ? dash : pct(result.barAreaPct)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            ffmpeg filter
          </p>
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
            <code className="whitespace-pre text-xs text-[var(--foreground)]">
              {hasError ? dash : `-vf "${result.ffmpegFilter}"`}
            </code>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Bar sizes are exact geometry; the encoder-safe row rounds down to even pixels because 4:2:0
        video needs even width and height. In CSS the same fit is <code>object-fit: contain</code>.
      </p>
    </main>
  );
}
