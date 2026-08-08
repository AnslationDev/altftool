"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Crop, RotateCcw } from "lucide-react";
import { ANCHORS, SOURCE_PRESETS, TARGET_RATIOS, computeCrop } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  sourceWidth: "3840",
  sourceHeight: "2160",
  targetWidth: "9",
  targetHeight: "16",
  anchor: "center",
  align: true,
};

const AXIS_TEXT = {
  width: "Cut the sides — full height is kept",
  height: "Cut the top and bottom — full width is kept",
  none: "Already the target ratio — nothing to crop",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [sourceWidth, setSourceWidth] = useState(DEFAULTS.sourceWidth);
  const [sourceHeight, setSourceHeight] = useState(DEFAULTS.sourceHeight);
  const [targetWidth, setTargetWidth] = useState(DEFAULTS.targetWidth);
  const [targetHeight, setTargetHeight] = useState(DEFAULTS.targetHeight);
  const [anchor, setAnchor] = useState(DEFAULTS.anchor);
  const [align, setAlign] = useState(DEFAULTS.align);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeCrop({
        sourceWidth: toNumber(sourceWidth),
        sourceHeight: toNumber(sourceHeight),
        targetWidth: toNumber(targetWidth),
        targetHeight: toNumber(targetHeight),
        anchor,
        align,
      }),
    [sourceWidth, sourceHeight, targetWidth, targetHeight, anchor, align],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Crop to aspect ratio",
      `Source: ${toNumber(sourceWidth)} x ${toNumber(sourceHeight)} (${NUM.format(result.sourceAspect)}:1)`,
      `Target ratio: ${NUM.format(result.targetAspect)}:1`,
      AXIS_TEXT[result.axis],
      `Crop rectangle: ${result.cropWidthAligned} x ${result.cropHeightAligned} at x ${result.offsetXAligned}, y ${result.offsetYAligned}`,
      `Exact (unrounded): ${NUM.format(result.cropWidth)} x ${NUM.format(result.cropHeight)}`,
      `Pixels kept: ${NUM.format(result.pixelsKeptPercent)}%`,
      `ffmpeg: -vf "${result.ffmpeg}"`,
    ].join("\n");
  }, [hasError, result, sourceWidth, sourceHeight]);

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
    setSourceWidth(DEFAULTS.sourceWidth);
    setSourceHeight(DEFAULTS.sourceHeight);
    setTargetWidth(DEFAULTS.targetWidth);
    setTargetHeight(DEFAULTS.targetHeight);
    setAnchor(DEFAULTS.anchor);
    setAlign(DEFAULTS.align);
    setCopied(false);
  };

  const rows = [
    ["What gets cut", hasError ? DASH : AXIS_TEXT[result.axis]],
    [
      "Exact crop size",
      hasError ? DASH : `${NUM.format(result.cropWidth)} x ${NUM.format(result.cropHeight)} px`,
    ],
    [
      "Offset from the left / top",
      hasError ? DASH : `${NUM.format(result.offsetX)} / ${NUM.format(result.offsetY)} px`,
    ],
    [
      "Pixels removed (width / height)",
      hasError
        ? DASH
        : `${NUM.format(result.removedWidth)} / ${NUM.format(result.removedHeight)} px`,
    ],
    ["Pixels kept", hasError ? DASH : `${NUM.format(result.pixelsKeptPercent)}%`],
    ["Source aspect ratio", hasError ? DASH : `${NUM.format(result.sourceAspect)}:1`],
    ["Target aspect ratio", hasError ? DASH : `${NUM.format(result.targetAspect)}:1`],
  ];

  const previewStyle = hasError
    ? null
    : { aspectRatio: `${toNumber(sourceWidth)} / ${toNumber(sourceHeight)}` };
  const innerStyle = hasError
    ? null
    : {
        width: `${(result.cropWidth / toNumber(sourceWidth)) * 100}%`,
        height: `${(result.cropHeight / toNumber(sourceHeight)) * 100}%`,
        marginLeft: `${(result.offsetX / toNumber(sourceWidth)) * 100}%`,
        marginTop: `${(result.offsetY / toNumber(sourceHeight)) * 100}%`,
      };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Crop className="h-4 w-4" aria-hidden="true" />
          Reframing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Crop to Aspect Ratio Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Get the largest crop that matches a target ratio, its offsets, how much of the frame you
          lose, and a ready-to-paste ffmpeg crop filter.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cr-src-w">
              Source width (px)
            </label>
            <input
              id="cr-src-w"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={sourceWidth}
              onChange={(event) => setSourceWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cr-src-h">
              Source height (px)
            </label>
            <input
              id="cr-src-h"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={sourceHeight}
              onChange={(event) => setSourceHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cr-tgt-w">
              Target ratio — width part
            </label>
            <input
              id="cr-tgt-w"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={targetWidth}
              onChange={(event) => setTargetWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cr-tgt-h">
              Target ratio — height part
            </label>
            <input
              id="cr-tgt-h"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={targetHeight}
              onChange={(event) => setTargetHeight(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cr-anchor">
              Crop position
            </label>
            <select
              id="cr-anchor"
              className={`mt-2 ${INPUT_CLASS}`}
              value={anchor}
              onChange={(event) => setAnchor(event.target.value)}
            >
              {ANCHORS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="inline-flex min-h-11 items-center gap-3" htmlFor="cr-align">
              <input
                id="cr-align"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={align}
                onChange={(event) => setAlign(event.target.checked)}
              />
              <span className="text-sm font-semibold">
                Snap to even pixels
                <span className="ml-1 font-normal text-[var(--muted-foreground)]">(4:2:0 video)</span>
              </span>
            </label>
          </div>
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Source presets
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SOURCE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setSourceWidth(String(preset.width));
                setSourceHeight(String(preset.height));
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Target ratio presets
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TARGET_RATIOS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setTargetWidth(String(preset.width));
                setTargetHeight(String(preset.height));
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
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

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Crop rectangle
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.cropWidthAligned} x ${result.cropHeightAligned}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the crop."
                : `at x ${result.offsetXAligned}, y ${result.offsetYAligned}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy crop values and ffmpeg filter"
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

        {!hasError && previewStyle ? (
          <div className="mt-5">
            <div
              className="mx-auto w-full max-w-sm overflow-hidden rounded-md border border-[var(--border)] bg-[var(--muted)]"
              style={previewStyle}
              role="img"
              aria-label={`Preview of the kept area: ${AXIS_TEXT[result.axis]}`}
            >
              <div className="bg-[var(--primary)]/80" style={innerStyle} />
            </div>
            <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
              Teal is kept; grey is discarded.
            </p>
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            ffmpeg filter
          </p>
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
            <code className="whitespace-pre text-sm">
              {hasError ? DASH : `ffmpeg -i input.mp4 -vf "${result.ffmpeg}" output.mp4`}
            </code>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The crop keeps every pixel it can at the source resolution — scale afterwards if the delivery
        frame is a different size. Recompose important action inside the kept area before committing
        to a hard crop.
      </p>
    </main>
  );
}
